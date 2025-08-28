import type { CMEExercise, Interval } from '../../types/cme.zod';
import type { CMESessionExercise } from '../hooks/getCMESessions';

/**
 * Transform database exercise format back to frontend CMEExercise format
 * This reverses the transformation done in transformExerciseToPlannedSteps
 */
export function transformDatabaseToFrontend(
  dbExercise: CMESessionExercise,
  userId: number
): CMEExercise {
  // Extract the planned steps (which contain our exercise structure)
  const plannedSteps = dbExercise.planned_steps || [];
  
  if (plannedSteps.length === 0) {
    // Fallback: create a basic exercise structure
    return {
      activityId: dbExercise.cme_activity_library_id || 0,
      activityName: dbExercise.activityName || 'Unknown Activity',
      activityFamily: dbExercise.activityFamily,
      useIntervals: false,
      intervals: [],
      notes: dbExercise.notes || '',
      createdAt: dbExercise.created_at,
      userId,
    };
  }

  // Check if this is an interval exercise by looking for repeat block information
  const hasRepeatBlocks = plannedSteps.some((step: any) => step.repeatBlock);
  const useIntervals = plannedSteps.length > 1 || hasRepeatBlocks;

  if (!useIntervals) {
    // Single exercise - extract from first step
    const step = plannedSteps[0];
    return {
      activityId: dbExercise.cme_activity_library_id || 0,
      activityName: dbExercise.activityName || 'Unknown Activity',
      activityFamily: dbExercise.activityFamily,
      useIntervals: false,
      intervals: [{
        stepType: step.stepType || 'Work',
        duration: step.duration || 0,
        metrics: { ...step.metrics },
        notes: step.notes || '',
        heartRateData: step.heartRateData,
      }],
      notes: dbExercise.notes || '',
      createdAt: dbExercise.created_at,
      userId,
    };
  }

  // Interval exercise - reconstruct intervals from planned steps
  const intervals: Interval[] = [];
  const repeatBlocks = new Map<number, { header: any; steps: any[] }>();

  // First pass: identify repeat blocks and their steps
  plannedSteps.forEach((step: any) => {
    if (step.repeatBlock) {
      const { blockId } = step.repeatBlock;
      if (!repeatBlocks.has(blockId)) {
        repeatBlocks.set(blockId, { header: null, steps: [] });
      }
      repeatBlocks.get(blockId)!.steps.push(step);
    }
  });

  // Second pass: build intervals with repeat block structure
  let currentBlockId: number | null = null;
  let blockRepeatCount = 0;

  plannedSteps.forEach((step: any) => {
    if (step.repeatBlock) {
      const { blockId, repeatNumber, totalRepeats } = step.repeatBlock;
      
      if (blockId !== currentBlockId) {
        // New repeat block - add header
        if (currentBlockId !== null) {
          // Add the previous block header
          intervals.push({
            stepType: 'Work',
            duration: 0,
            metrics: {},
            notes: `Repeat Block ${currentBlockId} (${blockRepeatCount} times)`,
            isRepeatBlock: true,
            blockId: currentBlockId,
            repeatCount: blockRepeatCount.toString(),
            isBlockHeader: true,
          });
        }
        
        currentBlockId = blockId;
        blockRepeatCount = totalRepeats;
      }

      // Add the step (without repeat block metadata)
      intervals.push({
        stepType: step.stepType || 'Work',
        duration: step.duration || 0,
        metrics: { ...step.metrics },
        notes: step.notes || '',
        heartRateData: step.heartRateData,
        isRepeatBlock: true,
        blockId,
      });
    } else {
      // Regular interval (not part of a repeatable block)
      if (currentBlockId !== null) {
        // End the current repeat block
        intervals.push({
          stepType: 'Work',
          duration: 0,
          metrics: {},
          notes: `End Repeat Block ${currentBlockId}`,
          isRepeatBlock: true,
          blockId: currentBlockId,
          repeatCount: blockRepeatCount.toString(),
          isBlockHeader: false,
        });
        currentBlockId = null;
      }

      intervals.push({
        stepType: step.stepType || 'Work',
        duration: step.duration || 0,
        metrics: { ...step.metrics },
        notes: step.notes || '',
        heartRateData: step.heartRateData,
      });
    }
  });

  // Close any remaining repeat block
  if (currentBlockId !== null) {
    intervals.push({
      stepType: 'Work',
      duration: 0,
      metrics: {},
      notes: `End Repeat Block ${currentBlockId}`,
      isRepeatBlock: true,
      blockId: currentBlockId,
      repeatCount: blockRepeatCount.toString(),
      isBlockHeader: false,
    });
  }

  return {
    activityId: dbExercise.cme_activity_library_id || 0,
    activityName: dbExercise.activityName || 'Unknown Activity',
    activityFamily: dbExercise.activityFamily,
    useIntervals: true,
    intervals,
    notes: dbExercise.notes || '',
    createdAt: dbExercise.created_at,
    userId,
  };
}
