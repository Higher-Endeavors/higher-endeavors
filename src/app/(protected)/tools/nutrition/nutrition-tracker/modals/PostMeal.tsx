// Core
'use client';

import { useState } from 'react';
import { Modal } from 'flowbite-react';

interface PostMealModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const satietyOptions = [
  { value: 'very_hungry', label: 'Very Hungry' },
  { value: 'hungry', label: 'Hungry' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'satisfied', label: 'Satisfied' },
  { value: 'very_full', label: 'Very Full' },
];

const gutOptions = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'bloated', label: 'Bloated' },
  { value: 'gassy', label: 'Gassy' },
  { value: 'cramping', label: 'Cramping' },
  { value: 'nausea', label: 'Nausea' },
  { value: 'other', label: 'Other' },
];

const secondaryResponses = [
  { value: 'runny_nose', label: 'Runny Nose' },
  { value: 'headache', label: 'Headache' },
  { value: 'hives', label: 'Hives' },
  { value: 'fatigue', label: 'Fatigue' },
  { value: 'itchy_skin', label: 'Itchy Skin' },
  { value: 'none', label: 'None' },
];

const dizzyOptions = [
  { value: 'no', label: 'No' },
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
];

export default function PostMeal({ isOpen, onClose }: PostMealModalProps) {
  const [satiety, setSatiety] = useState('neutral');
  const [gut, setGut] = useState('comfortable');
  const [selectedSecondary, setSelectedSecondary] = useState<string[]>([]);
  const [dizzy, setDizzy] = useState('no');
  const [notes, setNotes] = useState('');

  const handleSecondaryChange = (value: string) => {
    setSelectedSecondary(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for submit logic
    onClose();
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="md">
      <Modal.Header className="dark:text-white">
        Post-Meal Response
      </Modal.Header>
      <Modal.Body>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Satiety/Hunger */}
          <div>
            <label htmlFor="satiety" className="block text-sm font-medium dark:text-white mb-1">
              Feelings of Satiety / Hunger
            </label>
            <select
              id="satiety"
              value={satiety}
              onChange={e => setSatiety(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
            >
              {satietyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Stomach/Gut Sensations */}
          <div>
            <label htmlFor="gut" className="block text-sm font-medium dark:text-white mb-1">
              Stomach / Gut Sensations
            </label>
            <select
              id="gut"
              value={gut}
              onChange={e => setGut(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
            >
              {gutOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Secondary Responses */}
          <div>
            <label className="block text-sm font-medium dark:text-white mb-1">
              Secondary Responses
            </label>
            <div className="flex flex-wrap gap-3">
              {secondaryResponses.map(opt => (
                <label key={opt.value} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    value={opt.value}
                    checked={selectedSecondary.includes(opt.value)}
                    onChange={() => handleSecondaryChange(opt.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Dizzy/Light-Headed */}
          <div>
            <label htmlFor="dizzy" className="block text-sm font-medium dark:text-white mb-1">
              Dizzy / Light-Headed (Hypoglycemic)
            </label>
            <select
              id="dizzy"
              value={dizzy}
              onChange={e => setDizzy(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
            >
              {dizzyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium dark:text-white">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Additional comments or observations"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
              rows={2}
            />
          </div>

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
              Save
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}
