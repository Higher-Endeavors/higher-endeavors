'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from 'flowbite-react';
import Select from 'react-select';

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
}

interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exercise: Exercise) => void;
  exercise?: Exercise;
  exercises: Exercise[]; // For pairing suggestions
}

export default function ExerciseModal({
  isOpen,
  onClose,
  onSave,
  exercise,
  exercises
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
    rir: undefined
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? 0 : Number(value)
    }));
  };

  const validateTempo = (value: string) => {
    const tempoRegex = /^[0-9X]{4}$/;
    return tempoRegex.test(value);
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="xl">
      <Modal.Header>
        {exercise ? 'Edit Exercise' : 'Add Exercise'}
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Exercise Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Exercise Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            {/* Pairing */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Pairing</label>
              <input
                type="text"
                name="pairing"
                value={formData.pairing}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            {/* Sets & Reps */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Sets</label>
              <input
                type="number"
                name="sets"
                value={formData.sets}
                onChange={handleNumberChange}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Reps</label>
              <input
                type="number"
                name="reps"
                value={formData.reps}
                onChange={handleNumberChange}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            {/* Load */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Load (kg)</label>
              <input
                type="number"
                name="load"
                value={formData.load}
                onChange={handleNumberChange}
                min="0"
                step="0.5"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            {/* Tempo */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            {/* Rest */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Rest (seconds)</label>
              <input
                type="number"
                name="rest"
                value={formData.rest}
                onChange={handleNumberChange}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            {/* RPE */}
            <div>
              <label className="block text-sm font-medium text-gray-700">RPE (optional)</label>
              <input
                type="number"
                name="rpe"
                value={formData.rpe || ''}
                onChange={handleNumberChange}
                min="0"
                max="10"
                step="0.5"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* RIR */}
            <div>
              <label className="block text-sm font-medium text-gray-700">RIR (optional)</label>
              <input
                type="number"
                name="rir"
                value={formData.rir || ''}
                onChange={handleNumberChange}
                min="0"
                max="10"
                step="0.5"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
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