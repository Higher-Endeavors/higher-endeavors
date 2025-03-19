'use client';

import React, { useState, useEffect } from 'react';
import { Workout, WorkoutStep } from '@/app/lib/utils/garmin/trainingDataAccess';

interface GarminWorkoutEditorProps {
  userId: number;
  workoutId?: number;
  onSave: (workout: Workout) => void;
  onCancel: () => void;
}

const DEFAULT_WORKOUT: Workout = {
  workoutName: '',
  description: '',
  sport: 'RUNNING',
  steps: []
};

const SPORT_OPTIONS = [
  'RUNNING',
  'CYCLING',
  'SWIMMING',
  'STRENGTH_TRAINING',
  'CARDIO',
  'FLEXIBILITY_TRAINING',
  'WALKING',
  'HIKING',
  'YOGA'
];

const INTENSITY_OPTIONS = [
  'REST',
  'WARM_UP',
  'COOL_DOWN',
  'RECOVERY',
  'INTERVAL',
  'ACTIVE',
  'RACE'
];

const DURATION_TYPE_OPTIONS = [
  'TIME',
  'DISTANCE',
  'OPEN',
  'CALORIE',
  'HR_LESS_THAN',
  'HR_GREATER_THAN',
  'REPEAT_UNTIL_CALORIES',
  'REPEAT_UNTIL_DISTANCE',
  'REPEAT_UNTIL_STEPS',
  'REPEAT_UNTIL_TIME',
  'POWER_LESS_THAN',
  'POWER_GREATER_THAN',
  'REPS'
];

const TARGET_TYPE_OPTIONS = [
  'SPEED',
  'HEART_RATE',
  'CADENCE',
  'POWER',
  'RESISTANCE',
  'OPEN',
  'GRADE'
];

export default function GarminWorkoutEditor({ 
  userId,
  workoutId,
  onSave,
  onCancel
}: GarminWorkoutEditorProps) {
  const [workout, setWorkout] = useState<Workout>(DEFAULT_WORKOUT);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewWorkout, setIsNewWorkout] = useState<boolean>(true);

  // Fetch workout data if editing an existing workout
  useEffect(() => {
    async function fetchWorkout() {
      if (!workoutId) {
        setWorkout(DEFAULT_WORKOUT);
        setLoading(false);
        setIsNewWorkout(true);
        return;
      }
      
      try {
        setLoading(true);
        const response = await fetch(`/api/garmin/training?userId=${userId}&workoutId=${workoutId}&entityType=workout`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch workout');
        }
        
        const data = await response.json();
        setWorkout(data);
        setIsNewWorkout(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    fetchWorkout();
  }, [userId, workoutId]);

  // Handle workout field changes
  const handleWorkoutChange = (field: keyof Workout, value: any) => {
    setWorkout(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add a new step to the workout
  const handleAddStep = () => {
    const newStep: WorkoutStep = {
      type: 'WorkoutStep',
      stepOrder: workout.steps.length + 1,
      intensity: 'ACTIVE',
      durationType: 'TIME',
      durationValue: 300, // 5 minutes
      targetType: 'OPEN'
    };
    
    setWorkout(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  // Add a new repeat step to the workout
  const handleAddRepeatStep = () => {
    const newStep: WorkoutStep = {
      type: 'WorkoutRepeatStep',
      stepOrder: workout.steps.length + 1,
      repeatType: 'COUNT',
      repeatValue: 3,
      steps: []
    };
    
    setWorkout(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  // Update a step
  const handleStepChange = (index: number, field: keyof WorkoutStep, value: any) => {
    const updatedSteps = [...workout.steps];
    updatedSteps[index] = {
      ...updatedSteps[index],
      [field]: value
    };
    
    setWorkout(prev => ({
      ...prev,
      steps: updatedSteps
    }));
  };

  // Add a step to a repeat step
  const handleAddNestedStep = (parentIndex: number) => {
    const parentStep = workout.steps[parentIndex];
    if (parentStep.type !== 'WorkoutRepeatStep' || !parentStep.steps) return;
    
    const newNestedStep: WorkoutStep = {
      type: 'WorkoutStep',
      stepOrder: (parentStep.steps.length || 0) + 1,
      intensity: 'ACTIVE',
      durationType: 'TIME',
      durationValue: 60,
      targetType: 'OPEN'
    };
    
    const updatedSteps = [...workout.steps];
    updatedSteps[parentIndex] = {
      ...parentStep,
      steps: [...(parentStep.steps || []), newNestedStep]
    };
    
    setWorkout(prev => ({
      ...prev,
      steps: updatedSteps
    }));
  };

  // Update a nested step within a repeat step
  const handleNestedStepChange = (
    parentIndex: number, 
    childIndex: number, 
    field: keyof WorkoutStep, 
    value: any
  ) => {
    const parentStep = workout.steps[parentIndex];
    if (parentStep.type !== 'WorkoutRepeatStep' || !parentStep.steps) return;
    
    const updatedNestedSteps = [...(parentStep.steps || [])];
    updatedNestedSteps[childIndex] = {
      ...updatedNestedSteps[childIndex],
      [field]: value
    };
    
    const updatedSteps = [...workout.steps];
    updatedSteps[parentIndex] = {
      ...parentStep,
      steps: updatedNestedSteps
    };
    
    setWorkout(prev => ({
      ...prev,
      steps: updatedSteps
    }));
  };

  // Remove a step
  const handleRemoveStep = (index: number) => {
    const updatedSteps = workout.steps.filter((_, i) => i !== index);
    
    // Update step order
    updatedSteps.forEach((step, i) => {
      step.stepOrder = i + 1;
    });
    
    setWorkout(prev => ({
      ...prev,
      steps: updatedSteps
    }));
  };

  // Remove a nested step
  const handleRemoveNestedStep = (parentIndex: number, childIndex: number) => {
    const parentStep = workout.steps[parentIndex];
    if (parentStep.type !== 'WorkoutRepeatStep' || !parentStep.steps) return;
    
    const updatedNestedSteps = (parentStep.steps || []).filter((_, i) => i !== childIndex);
    
    // Update step order
    updatedNestedSteps.forEach((step, i) => {
      step.stepOrder = i + 1;
    });
    
    const updatedSteps = [...workout.steps];
    updatedSteps[parentIndex] = {
      ...parentStep,
      steps: updatedNestedSteps
    };
    
    setWorkout(prev => ({
      ...prev,
      steps: updatedSteps
    }));
  };

  // Move a step up or down
  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === workout.steps.length - 1)
    ) {
      return;
    }
    
    const updatedSteps = [...workout.steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap steps
    [updatedSteps[index], updatedSteps[targetIndex]] = [updatedSteps[targetIndex], updatedSteps[index]];
    
    // Update step order
    updatedSteps.forEach((step, i) => {
      step.stepOrder = i + 1;
    });
    
    setWorkout(prev => ({
      ...prev,
      steps: updatedSteps
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workout.workoutName || !workout.sport) {
      setError('Workout name and sport are required');
      return;
    }
    
    // Pass the workout back to the parent component
    onSave(workout);
  };

  // Render a regular step
  const renderWorkoutStep = (step: WorkoutStep, index: number, isNested = false, parentIndex?: number) => {
    return (
      <div className="border rounded p-4 mb-3 bg-gray-50">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium">Step {step.stepOrder}</h4>
          <div className="flex space-x-2">
            {!isNested && (
              <>
                <button
                  type="button"
                  className="px-2 py-1 bg-gray-200 rounded text-sm"
                  onClick={() => handleMoveStep(index, 'up')}
                  disabled={index === 0}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="px-2 py-1 bg-gray-200 rounded text-sm"
                  onClick={() => handleMoveStep(index, 'down')}
                  disabled={index === workout.steps.length - 1}
                >
                  ↓
                </button>
              </>
            )}
            <button
              type="button"
              className="px-2 py-1 bg-red-100 text-red-600 rounded text-sm"
              onClick={() => isNested && typeof parentIndex === 'number' 
                ? handleRemoveNestedStep(parentIndex, index)
                : handleRemoveStep(index)
              }
            >
              Remove
            </button>
          </div>
        </div>
        
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Intensity</label>
            <select
              className="w-full p-2 border rounded"
              value={step.intensity || ''}
              onChange={(e) => isNested && typeof parentIndex === 'number'
                ? handleNestedStepChange(parentIndex, index, 'intensity', e.target.value)
                : handleStepChange(index, 'intensity', e.target.value)
              }
            >
              {INTENSITY_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={step.description || ''}
              onChange={(e) => isNested && typeof parentIndex === 'number'
                ? handleNestedStepChange(parentIndex, index, 'description', e.target.value)
                : handleStepChange(index, 'description', e.target.value)
              }
              placeholder="Step description"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Duration Type</label>
            <select
              className="w-full p-2 border rounded"
              value={step.durationType || ''}
              onChange={(e) => isNested && typeof parentIndex === 'number'
                ? handleNestedStepChange(parentIndex, index, 'durationType', e.target.value)
                : handleStepChange(index, 'durationType', e.target.value)
              }
            >
              {DURATION_TYPE_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          {step.durationType && (
            <div>
              <label className="block text-sm font-medium mb-1">Duration Value</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={step.durationValue || ''}
                onChange={(e) => isNested && typeof parentIndex === 'number'
                  ? handleNestedStepChange(parentIndex, index, 'durationValue', parseInt(e.target.value))
                  : handleStepChange(index, 'durationValue', parseInt(e.target.value))
                }
                placeholder="Duration value"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">Target Type</label>
            <select
              className="w-full p-2 border rounded"
              value={step.targetType || ''}
              onChange={(e) => isNested && typeof parentIndex === 'number'
                ? handleNestedStepChange(parentIndex, index, 'targetType', e.target.value)
                : handleStepChange(index, 'targetType', e.target.value)
              }
            >
              {TARGET_TYPE_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          {step.targetType && step.targetType !== 'OPEN' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Target Value Low</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={step.targetValueLow || ''}
                  onChange={(e) => isNested && typeof parentIndex === 'number'
                    ? handleNestedStepChange(parentIndex, index, 'targetValueLow', parseInt(e.target.value))
                    : handleStepChange(index, 'targetValueLow', parseInt(e.target.value))
                  }
                  placeholder="Min target value"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Target Value High</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={step.targetValueHigh || ''}
                  onChange={(e) => isNested && typeof parentIndex === 'number'
                    ? handleNestedStepChange(parentIndex, index, 'targetValueHigh', parseInt(e.target.value))
                    : handleStepChange(index, 'targetValueHigh', parseInt(e.target.value))
                  }
                  placeholder="Max target value"
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Render a repeat step
  const renderRepeatStep = (step: WorkoutStep, index: number) => {
    return (
      <div className="border-2 border-blue-200 rounded p-4 mb-3 bg-blue-50">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium">Repeat Block {step.stepOrder}</h4>
          <div className="flex space-x-2">
            <button
              type="button"
              className="px-2 py-1 bg-gray-200 rounded text-sm"
              onClick={() => handleMoveStep(index, 'up')}
              disabled={index === 0}
            >
              ↑
            </button>
            <button
              type="button"
              className="px-2 py-1 bg-gray-200 rounded text-sm"
              onClick={() => handleMoveStep(index, 'down')}
              disabled={index === workout.steps.length - 1}
            >
              ↓
            </button>
            <button
              type="button"
              className="px-2 py-1 bg-red-100 text-red-600 rounded text-sm"
              onClick={() => handleRemoveStep(index)}
            >
              Remove
            </button>
          </div>
        </div>
        
        <div className="grid gap-3 md:grid-cols-2 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Repeat Type</label>
            <select
              className="w-full p-2 border rounded"
              value={step.repeatType || 'COUNT'}
              onChange={(e) => handleStepChange(index, 'repeatType', e.target.value)}
            >
              <option value="COUNT">Count</option>
              <option value="DISTANCE">Distance</option>
              <option value="TIME">Time</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Repeat Value</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={step.repeatValue || ''}
              onChange={(e) => handleStepChange(index, 'repeatValue', parseInt(e.target.value))}
              placeholder="Number of repeats"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600"
                checked={step.skipLastRestStep || false}
                onChange={(e) => handleStepChange(index, 'skipLastRestStep', e.target.checked)}
              />
              <span className="ml-2 text-sm text-gray-700">Skip last rest step</span>
            </label>
          </div>
        </div>
        
        <div className="pl-4 border-l-2 border-blue-300">
          <h5 className="font-medium mb-2">Steps in This Repeat Block:</h5>
          
          {step.steps && step.steps.length > 0 ? (
            step.steps.map((nestedStep, nestedIndex) => 
              renderWorkoutStep(nestedStep, nestedIndex, true, index)
            )
          ) : (
            <div className="text-gray-500 italic mb-3">No steps in this repeat block</div>
          )}
          
          <button
            type="button"
            className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm"
            onClick={() => handleAddNestedStep(index)}
          >
            + Add Step to Repeat Block
          </button>
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-4 text-center">Loading workout editor...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        {isNewWorkout ? 'Create New Workout' : 'Edit Workout'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
          <button 
            className="ml-2 text-red-500 font-bold"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Workout Details */}
        <div className="bg-white border rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-4">Workout Details</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="workout-name" className="block text-sm font-medium mb-1">Workout Name*</label>
              <input
                id="workout-name"
                type="text"
                className="w-full p-2 border rounded"
                value={workout.workoutName}
                onChange={(e) => handleWorkoutChange('workoutName', e.target.value)}
                placeholder="Enter workout name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="sport" className="block text-sm font-medium mb-1">Sport*</label>
              <select
                id="sport"
                className="w-full p-2 border rounded"
                value={workout.sport}
                onChange={(e) => handleWorkoutChange('sport', e.target.value)}
                required
              >
                {SPORT_OPTIONS.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
              <textarea
                id="description"
                className="w-full p-2 border rounded"
                value={workout.description || ''}
                onChange={(e) => handleWorkoutChange('description', e.target.value)}
                placeholder="Enter workout description"
                rows={3}
              />
            </div>
            
            {workout.sport === 'SWIMMING' && (
              <>
                <div>
                  <label htmlFor="pool-length" className="block text-sm font-medium mb-1">Pool Length</label>
                  <input
                    id="pool-length"
                    type="number"
                    className="w-full p-2 border rounded"
                    value={workout.poolLength || ''}
                    onChange={(e) => handleWorkoutChange('poolLength', parseInt(e.target.value))}
                    placeholder="Enter pool length"
                  />
                </div>
                
                <div>
                  <label htmlFor="pool-length-unit" className="block text-sm font-medium mb-1">Pool Length Unit</label>
                  <select
                    id="pool-length-unit"
                    className="w-full p-2 border rounded"
                    value={workout.poolLengthUnit || ''}
                    onChange={(e) => handleWorkoutChange('poolLengthUnit', e.target.value)}
                  >
                    <option value="METER">Meters</option>
                    <option value="YARD">Yards</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Workout Steps */}
        <div className="bg-white border rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Workout Steps</h3>
            <div className="space-x-2">
              <button
                type="button"
                className="bg-green-100 text-green-600 px-3 py-1 rounded text-sm"
                onClick={handleAddStep}
              >
                + Add Step
              </button>
              <button
                type="button"
                className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm"
                onClick={handleAddRepeatStep}
              >
                + Add Repeat Block
              </button>
            </div>
          </div>
          
          {workout.steps.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded">
              No steps yet. Add a step or repeat block to get started.
            </div>
          ) : (
            <div>
              {workout.steps.map((step, index) => (
                <div key={index}>
                  {step.type === 'WorkoutRepeatStep' 
                    ? renderRepeatStep(step, index)
                    : renderWorkoutStep(step, index)
                  }
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 border rounded"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isNewWorkout ? 'Create Workout' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
} 