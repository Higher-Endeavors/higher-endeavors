import { SingleQuery, Query } from '@/app/lib/dbAdapter';

// Define interfaces for the training API data types
export interface WorkoutStep {
  type: string; // WorkoutStep or WorkoutRepeatStep
  stepId?: number;
  stepOrder: number;
  repeatType?: string;
  repeatValue?: number;
  skipLastRestStep?: boolean;
  steps?: WorkoutStep[]; // For WorkoutRepeatStep
  intensity?: string;
  description?: string;
  durationType?: string;
  durationValue?: number;
  durationValueType?: string;
  targetType?: string;
  targetValue?: number;
  targetValueLow?: number;
  targetValueHigh?: number;
  targetValueType?: string;
  secondaryTargetType?: string;
  secondaryTargetValue?: number;
  secondaryTargetValueLow?: number;
  secondaryTargetValueHigh?: number;
  secondaryTargetValueType?: string;
  strokeType?: string;
  drillType?: string;
  equipmentType?: string;
  exerciseCategory?: string;
  exerciseName?: string;
  weightValue?: number;
  weightDisplayUnit?: string;
}

export interface Workout {
  id?: number; // Internal database ID
  workoutId?: number; // Garmin workoutId
  ownerId?: number; // Garmin ownerId
  workoutName: string;
  description?: string;
  updatedDate?: string;
  createdDate?: string;
  sport: string;
  estimatedDurationInSecs?: number;
  estimatedDistanceInMeters?: number;
  poolLength?: number;
  poolLengthUnit?: string;
  workoutProvider?: string;
  workoutSourceId?: string;
  steps: WorkoutStep[];
}

export interface WorkoutSchedule {
  id?: number; // Internal database ID
  scheduleId?: number; // Garmin scheduleId
  workoutId: number;
  date: string; // Format: YYYY-MM-DD
  workoutName?: string;
  sport?: string;
}

// Data access for Training API
export const GarminTrainingDataAccess = {
  // Check if a user has workouts
  async hasWorkouts(userId: number): Promise<boolean> {
    const result = await SingleQuery(
      'SELECT COUNT(*) as count FROM garmin_workouts WHERE user_id = $1',
      [userId]
    );
    return result.rows[0].count > 0;
  },

  // Get all workouts for a user
  async getWorkouts(userId: number): Promise<Workout[]> {
    const result = await Query(
      `SELECT * FROM garmin_workouts 
       WHERE user_id = $1 
       ORDER BY updated_date DESC NULLS LAST`,
      [userId]
    );
    
    const workouts: Workout[] = [];
    
    for (const row of result.rows) {
      // Get the workout steps
      const stepsResult = await this.getWorkoutSteps(row.id);
      
      workouts.push({
        id: row.id,
        workoutId: row.garmin_workout_id,
        ownerId: row.garmin_owner_id,
        workoutName: row.workout_name,
        description: row.description,
        updatedDate: row.updated_date ? new Date(row.updated_date).toISOString() : undefined,
        createdDate: row.created_date ? new Date(row.created_date).toISOString() : undefined,
        sport: row.sport,
        estimatedDurationInSecs: row.estimated_duration_in_secs,
        estimatedDistanceInMeters: row.estimated_distance_in_meters,
        poolLength: row.pool_length,
        poolLengthUnit: row.pool_length_unit,
        workoutProvider: row.workout_provider,
        workoutSourceId: row.workout_source_id,
        steps: stepsResult
      });
    }
    
    return workouts;
  },

  // Get workouts by sport type
  async getWorkoutsBySport(userId: number, sport: string): Promise<Workout[]> {
    const result = await Query(
      `SELECT * FROM garmin_workouts 
       WHERE user_id = $1 AND sport = $2
       ORDER BY updated_date DESC NULLS LAST`,
      [userId, sport]
    );
    
    const workouts: Workout[] = [];
    
    for (const row of result.rows) {
      // Get the workout steps
      const stepsResult = await this.getWorkoutSteps(row.id);
      
      workouts.push({
        id: row.id,
        workoutId: row.garmin_workout_id,
        ownerId: row.garmin_owner_id,
        workoutName: row.workout_name,
        description: row.description,
        updatedDate: row.updated_date ? new Date(row.updated_date).toISOString() : undefined,
        createdDate: row.created_date ? new Date(row.created_date).toISOString() : undefined,
        sport: row.sport,
        estimatedDurationInSecs: row.estimated_duration_in_secs,
        estimatedDistanceInMeters: row.estimated_distance_in_meters,
        poolLength: row.pool_length,
        poolLengthUnit: row.pool_length_unit,
        workoutProvider: row.workout_provider,
        workoutSourceId: row.workout_source_id,
        steps: stepsResult
      });
    }
    
    return workouts;
  },

  // Get a single workout by ID
  async getWorkoutById(workoutId: number): Promise<Workout | null> {
    const result = await SingleQuery(
      'SELECT * FROM garmin_workouts WHERE id = $1',
      [workoutId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    
    // Get the workout steps
    const stepsResult = await this.getWorkoutSteps(row.id);
    
    return {
      id: row.id,
      workoutId: row.garmin_workout_id,
      ownerId: row.garmin_owner_id,
      workoutName: row.workout_name,
      description: row.description,
      updatedDate: row.updated_date ? new Date(row.updated_date).toISOString() : undefined,
      createdDate: row.created_date ? new Date(row.created_date).toISOString() : undefined,
      sport: row.sport,
      estimatedDurationInSecs: row.estimated_duration_in_secs,
      estimatedDistanceInMeters: row.estimated_distance_in_meters,
      poolLength: row.pool_length,
      poolLengthUnit: row.pool_length_unit,
      workoutProvider: row.workout_provider,
      workoutSourceId: row.workout_source_id,
      steps: stepsResult
    };
  },

  // Helper method to get workout steps recursively
  async getWorkoutSteps(workoutId: number, parentStepId: number | null = null): Promise<WorkoutStep[]> {
    const stepsResult = await Query(
      `SELECT * FROM garmin_workout_steps 
       WHERE workout_id = $1 AND parent_step_id ${parentStepId ? '= $2' : 'IS NULL'}
       ORDER BY step_order`,
      parentStepId ? [workoutId, parentStepId] : [workoutId]
    );
    
    const steps: WorkoutStep[] = [];
    
    for (const step of stepsResult.rows) {
      const stepObj: WorkoutStep = {
        type: step.step_type,
        stepId: step.step_id,
        stepOrder: step.step_order,
        intensity: step.intensity,
        description: step.description,
        durationType: step.duration_type,
        durationValue: step.duration_value,
        durationValueType: step.duration_value_type,
        targetType: step.target_type,
        targetValue: step.target_value,
        targetValueLow: step.target_value_low,
        targetValueHigh: step.target_value_high,
        targetValueType: step.target_value_type,
        strokeType: step.stroke_type,
        drillType: step.drill_type,
        equipmentType: step.equipment_type,
        exerciseCategory: step.exercise_category,
        exerciseName: step.exercise_name,
        weightValue: step.weight_value,
        weightDisplayUnit: step.weight_display_unit,
      };
      
      if (step.step_type === 'WorkoutRepeatStep') {
        stepObj.repeatType = step.repeat_type;
        stepObj.repeatValue = step.repeat_value;
        stepObj.skipLastRestStep = step.skip_last_rest_step;
        
        // Recursively get child steps
        stepObj.steps = await this.getWorkoutSteps(workoutId, step.id);
      }
      
      steps.push(stepObj);
    }
    
    return steps;
  },

  // Get all workout schedules for a user
  async getWorkoutSchedules(userId: number): Promise<WorkoutSchedule[]> {
    const result = await Query(
      `SELECT ws.*, w.workout_name, w.sport
       FROM garmin_workout_schedules ws
       JOIN garmin_workouts w ON ws.workout_id = w.id
       WHERE ws.user_id = $1
       ORDER BY ws.scheduled_date`,
      [userId]
    );
    
    return result.rows.map((row: any) => ({
      id: row.id,
      scheduleId: row.schedule_id,
      workoutId: row.workout_id,
      date: row.scheduled_date.toISOString().split('T')[0],
      // Include additional fields that might be useful for UI
      workoutName: row.workout_name,
      sport: row.sport
    }));
  },

  // Get workout schedules for a specific date range
  async getWorkoutSchedulesByDateRange(userId: number, startDate: string, endDate: string): Promise<WorkoutSchedule[]> {
    const result = await Query(
      `SELECT ws.*, w.workout_name, w.sport
       FROM garmin_workout_schedules ws
       JOIN garmin_workouts w ON ws.workout_id = w.id
       WHERE ws.user_id = $1 AND ws.scheduled_date BETWEEN $2 AND $3
       ORDER BY ws.scheduled_date`,
      [userId, startDate, endDate]
    );
    
    return result.rows.map((row: any) => ({
      id: row.id,
      scheduleId: row.schedule_id,
      workoutId: row.workout_id,
      date: row.scheduled_date.toISOString().split('T')[0],
      // Include additional fields that might be useful for UI
      workoutName: row.workout_name,
      sport: row.sport
    }));
  },

  // Get a single workout schedule by ID
  async getWorkoutScheduleById(scheduleId: number): Promise<WorkoutSchedule | null> {
    const result = await SingleQuery(
      `SELECT ws.*, w.workout_name, w.sport
       FROM garmin_workout_schedules ws
       JOIN garmin_workouts w ON ws.workout_id = w.id
       WHERE ws.id = $1`,
      [scheduleId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    
    return {
      id: row.id,
      scheduleId: row.schedule_id,
      workoutId: row.workout_id,
      date: row.scheduled_date.toISOString().split('T')[0],
      // Include additional fields that might be useful for UI
      workoutName: row.workout_name,
      sport: row.sport
    };
  },

  // Create a new workout
  async createWorkout(userId: number, workout: Workout): Promise<number> {
    try {
      // Insert the main workout
      const workoutResult = await SingleQuery(
        `INSERT INTO garmin_workouts
         (user_id, garmin_workout_id, garmin_owner_id, workout_name, description,
          sport, estimated_duration_in_secs, estimated_distance_in_meters, 
          pool_length, pool_length_unit, workout_provider, workout_source_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id`,
        [
          userId,
          workout.workoutId || null,
          workout.ownerId || null,
          workout.workoutName,
          workout.description || null,
          workout.sport,
          workout.estimatedDurationInSecs || null,
          workout.estimatedDistanceInMeters || null,
          workout.poolLength || null,
          workout.poolLengthUnit || null,
          workout.workoutProvider || null,
          workout.workoutSourceId || null
        ]
      );
      
      const workoutId = workoutResult.rows[0].id;
      
      // Insert the steps recursively
      await this.storeWorkoutSteps(workoutId, null, workout.steps);
      
      return workoutId;
    } catch (error) {
      console.error('Error creating workout:', error);
      throw error;
    }
  },

  // Helper method to store workout steps recursively
  async storeWorkoutSteps(workoutId: number, parentStepId: number | null, steps: WorkoutStep[]) {
    for (const step of steps) {
      // Insert the step
      const stepResult = await SingleQuery(
        `INSERT INTO garmin_workout_steps
         (workout_id, step_id, step_order, step_type, parent_step_id, repeat_type, repeat_value,
          skip_last_rest_step, intensity, description, duration_type, duration_value, 
          duration_value_type, target_type, target_value, target_value_low, target_value_high,
          target_value_type, secondary_target_type, secondary_target_value, 
          secondary_target_value_low, secondary_target_value_high, secondary_target_value_type,
          stroke_type, drill_type, equipment_type, exercise_category, exercise_name,
          weight_value, weight_display_unit)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 
                 $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
         RETURNING id`,
        [
          workoutId,
          step.stepId || null,
          step.stepOrder,
          step.type,
          parentStepId,
          step.repeatType || null,
          step.repeatValue || null,
          step.skipLastRestStep !== undefined ? step.skipLastRestStep : (step.type === 'LAP_SWIMMING'),
          step.intensity || null,
          step.description || null,
          step.durationType || null,
          step.durationValue || null,
          step.durationValueType || null,
          step.targetType || null,
          step.targetValue || null,
          step.targetValueLow || null,
          step.targetValueHigh || null,
          step.targetValueType || null,
          step.secondaryTargetType || null,
          step.secondaryTargetValue || null,
          step.secondaryTargetValueLow || null,
          step.secondaryTargetValueHigh || null,
          step.secondaryTargetValueType || null,
          step.strokeType || null,
          step.drillType || null,
          step.equipmentType || null,
          step.exerciseCategory || null,
          step.exerciseName || null,
          step.weightValue || null,
          step.weightDisplayUnit || null
        ]
      );
      
      const stepId = stepResult.rows[0].id;
      
      // Recursively store child steps if this is a repeat step
      if (step.type === 'WorkoutRepeatStep' && step.steps && step.steps.length > 0) {
        await this.storeWorkoutSteps(workoutId, stepId, step.steps);
      }
    }
  },

  // Update an existing workout
  async updateWorkout(workoutId: number, workout: Workout): Promise<boolean> {
    try {
      // Update the main workout
      await SingleQuery(
        `UPDATE garmin_workouts SET
         workout_name = $1, description = $2, sport = $3,
         pool_length = $4, pool_length_unit = $5, 
         workout_provider = $6, workout_source_id = $7,
         updated_at = NOW(), updated_date = NOW()
         WHERE id = $8`,
        [
          workout.workoutName,
          workout.description || null,
          workout.sport,
          workout.poolLength || null,
          workout.poolLengthUnit || null,
          workout.workoutProvider || null,
          workout.workoutSourceId || null,
          workoutId
        ]
      );
      
      // Delete all existing steps
      await SingleQuery(
        'DELETE FROM garmin_workout_steps WHERE workout_id = $1',
        [workoutId]
      );
      
      // Insert the new steps
      await this.storeWorkoutSteps(workoutId, null, workout.steps);
      
      return true;
    } catch (error) {
      console.error('Error updating workout:', error);
      return false;
    }
  },

  // Delete a workout
  async deleteWorkout(workoutId: number): Promise<boolean> {
    try {
      await SingleQuery(
        'DELETE FROM garmin_workouts WHERE id = $1',
        [workoutId]
      );
      return true;
    } catch (error) {
      console.error('Error deleting workout:', error);
      return false;
    }
  },

  // Create a new workout schedule
  async createWorkoutSchedule(userId: number, schedule: WorkoutSchedule): Promise<number> {
    try {
      const result = await SingleQuery(
        `INSERT INTO garmin_workout_schedules
         (user_id, schedule_id, workout_id, scheduled_date)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [
          userId,
          schedule.scheduleId || null,
          schedule.workoutId,
          schedule.date
        ]
      );
      
      return result.rows[0].id;
    } catch (error) {
      console.error('Error creating workout schedule:', error);
      throw error;
    }
  },

  // Update an existing workout schedule
  async updateWorkoutSchedule(scheduleId: number, schedule: WorkoutSchedule): Promise<boolean> {
    try {
      await SingleQuery(
        `UPDATE garmin_workout_schedules SET
         workout_id = $1, scheduled_date = $2, updated_at = NOW()
         WHERE id = $3`,
        [
          schedule.workoutId,
          schedule.date,
          scheduleId
        ]
      );
      return true;
    } catch (error) {
      console.error('Error updating workout schedule:', error);
      return false;
    }
  },

  // Delete a workout schedule
  async deleteWorkoutSchedule(scheduleId: number): Promise<boolean> {
    try {
      await SingleQuery(
        'DELETE FROM garmin_workout_schedules WHERE id = $1',
        [scheduleId]
      );
      return true;
    } catch (error) {
      console.error('Error deleting workout schedule:', error);
      return false;
    }
  }
}; 