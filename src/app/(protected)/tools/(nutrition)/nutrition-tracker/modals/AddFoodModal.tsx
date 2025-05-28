// Core
'use client';

import { useState } from 'react';
import { Modal } from 'flowbite-react';
import AdvancedFoodSearch from './AdvancedFoodSearch';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const unitOptions = [
  { value: 'g', label: 'grams' },
  { value: 'oz', label: 'ounces' },
  { value: 'ml', label: 'milliliters' },
  { value: 'cup', label: 'cup' },
  { value: 'tbsp', label: 'tablespoon' },
  { value: 'tsp', label: 'teaspoon' },
  { value: 'piece', label: 'piece' },
];

const mealOptions = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'snack', label: 'Snack' },
  { value: 'dinner', label: 'Dinner' },
];

export default function AddFoodModal({ isOpen, onClose }: AddFoodModalProps) {
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState(unitOptions[0].value);
  const [meal, setMeal] = useState(mealOptions[0].value);
  const [notes, setNotes] = useState('');
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for submit logic
    onClose();
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="md">
      <Modal.Header className="dark:text-white">
        Add Food / Drink
      </Modal.Header>
      <Modal.Body>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Food Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="food-name" className="block text-sm font-medium dark:text-white">
                Food Name
              </label>
              <button
                type="button"
                onClick={() => setIsAdvancedSearchOpen(true)}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Advanced Search
              </button>
            </div>
            <input
              id="food-name"
              type="text"
              value={foodName}
              onChange={e => setFoodName(e.target.value)}
              placeholder="Enter food or drink name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
              required
            />
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium dark:text-white">
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                min="0"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder="Amount"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                required
              />
            </div>
            <div>
              <label htmlFor="unit" className="block text-sm font-medium dark:text-white">
                Unit
              </label>
              <select
                id="unit"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
              >
                {unitOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Meal Selection */}
          <div>
            <label htmlFor="meal" className="block text-sm font-medium dark:text-white">
              Meal
            </label>
            <select
              id="meal"
              value={meal}
              onChange={e => setMeal(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
            >
              {mealOptions.map(opt => (
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
              placeholder="Optional notes about this food or drink"
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
              Add Food
            </button>
          </div>
        </form>
        <AdvancedFoodSearch
          isOpen={isAdvancedSearchOpen}
          onClose={() => setIsAdvancedSearchOpen(false)}
          onSelect={(food) => {
            // Handle the selected food
            setFoodName(food.label);
            setIsAdvancedSearchOpen(false);
          }}
        />
      </Modal.Body>
    </Modal>
  );
}
