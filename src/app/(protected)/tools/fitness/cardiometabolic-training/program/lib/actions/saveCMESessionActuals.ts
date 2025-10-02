'use server';

import { getClient } from 'lib/dbAdapter';
import { z } from 'zod';

// Input validation schema for saving CME session actuals
const SaveCMESessionActualsInput = z.object({
  userId: z.number().int(),
  sessionName: z.string().min(1),
  macrocyclePhase: z.string().optional(),
  focusBlock: z.string().optional(),
  notes: z.string().optional(),
  activities: z.array(z.object({
    activityId: z.number().int(),
    activityName: z.string(),

    useIntervals: z.boolean(),
    intervals: z.array(z.object({
      stepType: z.string(),
      duration: z.number(),
      metrics: z.record(z.any()),
      notes: z.string(),
      heartRateData: z.object({
        type: z.enum(['zone', 'custom']),
        value: z.string(),
        min: z.string().optional(),
        max: z.string().optional(),
      }).optional(),
      isRepeatBlock: z.boolean().optional(),
      blockId: z.number().optional(),
      repeatCount: z.union([z.string(), z.number()]).optional(),
      isBlockHeader: z.boolean().optional(),
    })),
    notes: z.string(),
    totalRepeatCount: z.number().optional(),
    heartRateData: z.object({
      type: z.enum(['zone', 'custom']),
      value: z.string(),
      min: z.string().optional(),
      max: z.string().optional(),
    }).optional(),
  })),
  // Additional fields for actual session data
  sessionDate: z.string(), // ISO date string
  actualDuration: z.number().optional(), // Total actual duration in minutes
  actualDistance: z.number().optional(), // Total actual distance
  actualCalories: z.number().optional(), // Total actual calories burned
  averageHeartRate: z.number().optional(), // Average heart rate during session
  maxHeartRate: z.number().optional(), // Maximum heart rate during session
});

export async function saveCMESessionActuals(input: z.infer<typeof SaveCMESessionActualsInput>) {
  const parse = SaveCMESessionActualsInput.safeParse(input);
  if (!parse.success) {
    console.error('Validation error:', parse.error);
    return { success: false, error: 'Invalid input', details: parse.error };
  }

  const { 
    userId, 
    sessionName, 
    macrocyclePhase, 
    focusBlock, 
    notes, 
    activities,
    sessionDate,
    actualDuration,
    actualDistance,
    actualCalories,
    averageHeartRate,
    maxHeartRate
  } = parse.data;

  const client = await getClient();

  try {
    await client.query('BEGIN');

    // 1. Insert the actual session (this creates a new row for tracking)
    const sessionRes = await client.query(
      `INSERT INTO cme_sessions (
        user_id, 
        session_name, 
        macrocycle_phase, 
        focus_block, 
        notes, 
        start_date,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING cme_session_id`,
      [
        userId, 
        sessionName, 
        macrocyclePhase || null, 
        focusBlock || null, 
        notes || null,
        sessionDate
      ]
    );

    const sessionId = sessionRes.rows[0].cme_session_id;

    // 2. Insert session activities with actual steps
    for (const activity of activities) {
      // Transform the activity data into the actual_steps JSONB structure
      const actualSteps = transformActivityToActualSteps(activity);

      // Get the activity library ID and derive the family ID from the relationship
      const activityRes = await client.query(
        'SELECT cme_activity_library_id, activity_family FROM cme_activity_library WHERE activity = $1',
        [activity.activityName]
      );
      
      const activityLibraryId = activityRes.rows[0]?.cme_activity_library_id || null;
      const activityFamilyId = activityRes.rows[0]?.activity_family || null;

      await client.query(
        `INSERT INTO cme_sessions_activities (
          cme_session_id,
          cme_activity_family_id,
          cme_activity_library_id,
          planned_steps,
          actual_steps,
          notes,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          sessionId,
          activityFamilyId,
          activityLibraryId,
          JSON.stringify([]), // Empty planned_steps for actual sessions
          JSON.stringify(actualSteps), // Actual performance data
          activity.notes || null,
        ]
      );
    }

    // 3. Optionally, we could add additional session-level metrics here
    // For now, we're storing them in the session notes, but we could create
    // a separate table for session-level metrics if needed

    await client.query('COMMIT');
    return { success: true, sessionId };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving CME session actuals:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  } finally {
    client.release();
  }
}

// Helper function to transform activity data into actual_steps JSONB structure
function transformActivityToActualSteps(activity: any) {
  if (!activity.useIntervals) {
    // Single activity - create one step
    const step = {
      stepType: activity.intervals[0]?.stepType || 'Work',
      duration: activity.intervals[0]?.duration || 0,
      metrics: { ...activity.intervals[0]?.metrics },
      notes: activity.intervals[0]?.notes || '',
      heartRateData: activity.intervals[0]?.heartRateData,
      // Add actual performance tracking fields
      actualDuration: activity.intervals[0]?.duration || 0,
      actualDistance: activity.intervals[0]?.metrics?.Distance || null,
      actualPace: activity.intervals[0]?.metrics?.Pace || null,
      actualHeartRate: activity.intervals[0]?.heartRateData || null,
    };

    // Add duration to metrics if it exists
    if (activity.intervals[0]?.duration > 0) {
      step.metrics['Duration'] = activity.intervals[0].duration;
    }

    return [step];
  }

  // Interval activity - handle repeat blocks and expand them
  const expandedSteps: any[] = [];
  
  activity.intervals.forEach((interval: any) => {
    if (interval.isBlockHeader && interval.blockId) {
      // This is a repeat block header - expand the block
      const blockSteps = activity.intervals.filter((int: any) => 
        int.blockId === interval.blockId && !int.isBlockHeader
      );
      const repeatCount = Number(interval.repeatCount) || 2;
      
      // Expand the block based on repeat count
      for (let repeat = 0; repeat < repeatCount; repeat++) {
        blockSteps.forEach((blockStep: any) => {
          const step = {
            stepType: blockStep.stepType,
            duration: blockStep.duration || 0,
            metrics: { ...blockStep.metrics },
            notes: blockStep.notes || '',
            heartRateData: blockStep.heartRateData,
            // Add repeat information for tracking
            repeatBlock: {
              blockId: interval.blockId,
              repeatNumber: repeat + 1,
              totalRepeats: repeatCount,
            },
            // Add actual performance tracking fields
            actualDuration: blockStep.duration || 0,
            actualDistance: blockStep.metrics?.Distance || null,
            actualPace: blockStep.metrics?.Pace || null,
            actualHeartRate: blockStep.heartRateData || null,
          };

          // Add duration to metrics if it exists
          if (blockStep.duration > 0) {
            step.metrics['Duration'] = blockStep.duration;
          }

          expandedSteps.push(step);
        });
      }
    } else if (!interval.isRepeatBlock) {
      // Regular interval (not part of a repeatable block)
      const step = {
        stepType: interval.stepType,
        duration: interval.duration || 0,
        metrics: { ...interval.metrics },
        notes: interval.notes || '',
        heartRateData: interval.heartRateData,
        // Add actual performance tracking fields
        actualDuration: interval.duration || 0,
        actualDistance: interval.metrics?.Distance || null,
        actualPace: interval.metrics?.Pace || null,
        actualHeartRate: interval.heartRateData || null,
      };

      // Add duration to metrics if it exists
      if (interval.duration > 0) {
        step.metrics['Duration'] = interval.duration;
      }

      expandedSteps.push(step);
    }
  });

  return expandedSteps;
}
