'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from 'flowbite-react';
import Select from 'react-select';
import { SetDetails } from '../../shared/types';
import { BsSearch } from 'react-icons/bs';

interface Exercise {
  id: string;
  name: string;
  pairing: string;
  sets: number;
  reps: number;
  load: number;
  tempo: string;
  rest: number;
  notes?: string;
  rpe?: number;
  rir?: number;
  isVariedSets?: boolean;
  setDetails?: SetDetails[];
}

interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exercise: Exercise) => void;
  exercise?: Exercise;
  exercises: Exercise[];
  onAdvancedSearch: () => void;
  selectedExerciseName?: string;
}

interface ExerciseOption {
  value: string;
  label: string;
}

const filterExerciseOptions = (option: { label: string }, inputValue: string) => {
  if (!inputValue) return true;
  
  const searchTerms = inputValue.toLowerCase().trim().split(/\s+/);
  const exerciseName = option.label.toLowerCase();
  
  return searchTerms.every(term => exerciseName.includes(term));
};

const customSelectStyles = {
  control: (base: any) => ({
    ...base,
    backgroundColor: 'white',
  }),
  input: (base: any) => ({
    ...base,
    color: 'black',
  }),
  option: (base: any) => ({
    ...base,
    color: 'black',
  }),
  singleValue: (base: any) => ({
    ...base,
    color: 'black',
  }),
};

export default function ExerciseModal({
  isOpen,
  onClose,
  onSave,
  exercise,
  exercises,
  onAdvancedSearch,
  selectedExerciseName
}: ExerciseModalProps) {
  const [formData, setFormData] = useState<Exercise>({
    id: '',
    name: '',
    pairing: '',
    sets: 0,
    reps: 0,
    load: 0,
    tempo: '2010',
    rest: 60,
    notes: '',
    rpe: undefined,
    rir: undefined,
    isVariedSets: false,
    setDetails: []
  });

  const [exerciseOptions, setExerciseOptions] = useState<ExerciseOption[]>([]);
  const [isExerciseSearchOpen, setIsExerciseSearchOpen] = useState(false);

  useEffect(() => {
    if (exercise) {
      setFormData(exercise);
    } else {
      // Generate next pairing based on existing exercises
      const existingPairings = exercises.map(ex => ex.pairing)
        .filter(p => !p.includes('WU') && !p.includes('CD'));
      
      let nextPairing = 'A1';
      if (existingPairings.length > 0) {
        const lastPairing = existingPairings[existingPairings.length - 1];
        const letter = lastPairing.charAt(0);
        const number = parseInt(lastPairing.charAt(1));
        
        if (number === 2) {
          nextPairing = String.fromCharCode(letter.charCodeAt(0) + 1) + '1';
        } else {
          nextPairing = letter + '2';
        }
      }

      setFormData(prev => ({
        ...prev,
        id: Math.random().toString(36).substr(2, 9),
        pairing: nextPairing
      }));
    }
  }, [exercise, exercises]);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch('/api/exercises');
        const data = await response.json();
        const options = data.map((ex: any) => ({
          value: ex.exercise_name,
          label: ex.exercise_name
        }));
        setExerciseOptions(options);
      } catch (error) {
        console.error('Error fetching exercises:', error);
      }
    };

    fetchExercises();
  }, []);

  const handleExerciseSelect = (option: ExerciseOption | null) => {
    if (option) {
      setFormData(prev => ({
        ...prev,
        name: option.value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If varied sets is enabled, calculate averages for the main exercise values
    if (formData.isVariedSets && formData.setDetails?.length) {
      const avgReps = Math.round(formData.setDetails.reduce((acc, set) => acc + set.reps, 0) / formData.setDetails.length);
      const avgLoad = Math.round(formData.setDetails.reduce((acc, set) => acc + set.load, 0) / formData.setDetails.length);
      
      onSave({
        ...formData,
        reps: avgReps,
        load: avgLoad
      });
    } else {
      onSave(formData);
    }
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Don't convert empty string to 0, allow it to be empty temporarily
    const numValue = value === '' ? '' : Number(value);
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: numValue
      };

      // If changing sets and varied sets is enabled, update setDetails
      if (name === 'sets' && prev.isVariedSets && typeof numValue === 'number') {
        const currentDetails = prev.setDetails || [];
        if (numValue > currentDetails.length) {
          // Add new sets
          updated.setDetails = [
            ...currentDetails,
            ...Array.from({ length: numValue - currentDetails.length }, (_, i) => ({
              setNumber: currentDetails.length + i + 1,
              reps: prev.reps,
              load: prev.load,
              tempo: prev.tempo,
              rest: prev.rest
            }))
          ];
        } else {
          // Remove excess sets
          updated.setDetails = currentDetails.slice(0, numValue);
        }
      }

      return updated;
    });
  };

  const validateTempo = (value: string) => {
    const tempoRegex = /^[0-9X]{4}$/;
    return tempoRegex.test(value);
  };

  const handleVariedSetsToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isVaried = e.target.checked;
    setFormData(prev => ({
      ...prev,
      isVariedSets: isVaried,
      setDetails: isVaried 
        ? Array.from({ length: prev.sets }, (_, i) => ({
            setNumber: i + 1,
            reps: prev.reps,
            load: prev.load,
            tempo: prev.tempo,
            rest: prev.rest,
            rpe: prev.rpe,
            rir: prev.rir
          }))
        : []
    }));
  };

  const handleSetDetailChange = (setNumber: number, field: keyof SetDetails, value: number | string) => {
    setFormData(prev => ({
      ...prev,
      setDetails: prev.setDetails?.map(set => 
        set.setNumber === setNumber 
          ? { ...set, [field]: value === '' ? '' : Number(value) }
          : set
      ) || []
    }));
  };

  useEffect(() => {
    if (selectedExerciseName) {
      setFormData(prev => ({
        ...prev,
        name: selectedExerciseName
      }));
    }
  }, [selectedExerciseName]);

  return (
    <Modal show={isOpen} onClose={onClose} size="xl">
      <Modal.Header className="dark:text-white">
        {exercise ? 'Edit Exercise' : 'Add Exercise'}
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Replace the exercise name input with Select */}
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium dark:text-white">Exercise Name</label>
                <button
                  type="button"
                  onClick={onAdvancedSearch}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Advanced Search
                </button>
              </div>
              <Select
                options={exerciseOptions}
                value={exerciseOptions.find(option => option.value === formData.name)}
                onChange={handleExerciseSelect}
                className="basic-single"
                classNamePrefix="select"
                placeholder="Search for an exercise..."
                isClearable
                isSearchable
                styles={customSelectStyles}
                filterOption={filterExerciseOptions}
              />
            </div>

            {/* Pairing */}
            <div>
              <label className="block text-sm font-medium dark:text-white">Pairing</label>
              <input
                type="text"
                name="pairing"
                value={formData.pairing}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                required
              />
            </div>

            {/* Sets & Reps */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium dark:text-white">Sets</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="variedSets"
                    checked={formData.isVariedSets}
                    onChange={handleVariedSetsToggle}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="variedSets" className="text-sm font-medium dark:text-white">
                    Varied sets
                  </label>
                </div>
              </div>
              <input
                type="number"
                name="sets"
                value={formData.sets}
                onChange={handleNumberChange}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white">Reps</label>
              <input
                type="number"
                name="reps"
                value={formData.reps}
                onChange={handleNumberChange}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                required
              />
            </div>

            {/* Load */}
            <div>
              <label className="block text-sm font-medium dark:text-white">Load (kg)</label>
              <input
                type="number"
                name="load"
                value={formData.load}
                onChange={handleNumberChange}
                min="0"
                step="0.5"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                required
              />
            </div>

            {/* Tempo */}
            <div>
              <label className="block text-sm font-medium dark:text-white">
                Tempo (4 digits, X for explosive)
              </label>
              <input
                type="text"
                name="tempo"
                value={formData.tempo}
                onChange={(e) => {
                  if (validateTempo(e.target.value) || e.target.value.length <= 4) {
                    handleInputChange(e);
                  }
                }}
                pattern="[0-9X]{4}"
                maxLength={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                required
              />
            </div>

            {/* Rest */}
            <div>
              <label className="block text-sm font-medium dark:text-white">Rest (seconds)</label>
              <input
                type="number"
                name="rest"
                value={formData.rest}
                onChange={handleNumberChange}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                required
              />
            </div>

            {/* RPE */}
            <div>
              <label className="block text-sm font-medium dark:text-white">RPE (optional)</label>
              <input
                type="number"
                name="rpe"
                value={formData.rpe || ''}
                onChange={handleNumberChange}
                min="0"
                max="10"
                step="0.5"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
              />
            </div>

            {/* RIR */}
            <div>
              <label className="block text-sm font-medium dark:text-white">RIR (optional)</label>
              <input
                type="number"
                name="rir"
                value={formData.rir || ''}
                onChange={handleNumberChange}
                min="0"
                max="10"
                step="0.5"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium dark:text-white">Notes (optional)</label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
            />
          </div>

          {/* Varied Sets Form */}
          {formData.isVariedSets && formData.setDetails && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium dark:text-white">Set Details</h3>
              <div className="grid gap-4">
                {formData.setDetails.map((set) => (
                  <div key={set.setNumber} className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                    <div className="col-span-3 md:col-span-1">
                      <span className="text-sm font-medium dark:text-white">Set {set.setNumber}</span>
                    </div>
                    <div>
                      <label className="block text-sm dark:text-white">Reps</label>
                      <input
                        type="number"
                        value={set.reps || ''}
                        onChange={(e) => handleSetDetailChange(set.setNumber, 'reps', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm dark:text-white">Load (lbs)</label>
                      <input
                        type="number"
                        value={set.load || ''}
                        onChange={(e) => handleSetDetailChange(set.setNumber, 'load', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              {exercise ? 'Save Changes' : 'Add Exercise'}
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
} 