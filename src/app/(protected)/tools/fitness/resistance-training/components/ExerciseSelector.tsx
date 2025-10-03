'use client';

import React from 'react';
import Select from 'react-select';
import { useExercises, type Exercise } from '../analyze/lib/hooks/useExercises';

interface ExerciseSelectorProps {
  onExerciseSelect: (exercise: Exercise | null) => void;
  selectedExercise: Exercise | null;
  userId: number;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function ExerciseSelector({ 
  onExerciseSelect, 
  selectedExercise, 
  userId,
  isLoading = false,
  disabled = false
}: ExerciseSelectorProps) {
  const { exercises, isLoading: isLoadingExercises, error } = useExercises(userId);

  // Convert exercises to options for react-select
  const exerciseOptions = exercises.map(exercise => ({
    value: exercise,
    label: exercise.exerciseName,
    exercise
  }));


  // Custom no options message
  const NoOptionsMessage = (props: any) => {
    const inputValue = props.selectProps.inputValue;
    return (
      <div className="text-center py-2">
        <p className="text-gray-500 dark:text-gray-400">
          {inputValue ? `No exercises found matching "${inputValue}"` : 'No exercises available'}
        </p>
      </div>
    );
  };

  // Custom loading message
  const LoadingMessage = () => (
    <div className="text-center py-2">
      <div className="inline-flex items-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
        <span className="text-gray-500 dark:text-gray-400">Loading exercises...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      <label htmlFor="exercise-selector" className="block text-sm font-medium text-gray-700 dark:text-gray-700">
        Select Exercise for Analysis
      </label>
      
      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <Select
        id="exercise-selector"
        className="basic-single dark:text-slate-700"
        classNamePrefix="select"
        placeholder={isLoadingExercises ? "Loading exercises..." : "Select an exercise..."}
        isClearable
        isSearchable
        isLoading={isLoadingExercises || isLoading}
        isDisabled={disabled || isLoadingExercises}
        options={exerciseOptions}
        value={selectedExercise ? exerciseOptions.find(opt => opt.value.exerciseId === selectedExercise.exerciseId) : null}
        onChange={(option) => {
          onExerciseSelect(option?.value || null);
        }}
        components={{ 
          NoOptionsMessage,
          LoadingMessage: LoadingMessage
        }}
        filterOption={(option, inputValue) => {
          if (!inputValue) return true;
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        }}
        styles={{
          control: (base) => ({
            ...base,
            minHeight: '42px',
            backgroundColor: 'white',
            borderColor: '#d1d5db',
            '&:hover': {
              borderColor: '#9ca3af'
            }
          }),
          menu: (base) => ({
            ...base,
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected 
              ? '#3b82f6' 
              : state.isFocused 
                ? '#f3f4f6' 
                : 'white',
            color: state.isSelected ? 'white' : '#374151',
            '&:hover': {
              backgroundColor: state.isSelected ? '#3b82f6' : '#f3f4f6'
            }
          }),
          singleValue: (base) => ({
            ...base,
            color: '#374151'
          }),
          placeholder: (base) => ({
            ...base,
            color: '#9ca3af'
          })
        }}
      />

      {selectedExercise && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Found in {selectedExercise.programCount} program{selectedExercise.programCount !== 1 ? 's' : ''} 
          ({selectedExercise.instanceCount} total instance{selectedExercise.instanceCount !== 1 ? 's' : ''})
        </div>
      )}
    </div>
  );
}
