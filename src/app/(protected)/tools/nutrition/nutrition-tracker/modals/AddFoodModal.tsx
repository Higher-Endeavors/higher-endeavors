// Core
'use client';

import { useState } from 'react';
import { Modal } from 'flowbite-react';
import AdvancedFoodSearch from '(protected)/tools/nutrition/nutrition-tracker/modals/AdvancedFoodSearch';

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
  { value: 'other', label: 'Other' },
];

const nutrientOptions = [
  { value: '', label: 'Select Nutrient' },
  { value: 'calories', label: 'Calories (kcal)' },
  { value: 'protein', label: 'Protein (g)' },
  { value: 'carbs', label: 'Carbohydrates (g)' },
  { value: 'fat', label: 'Fat (g)' },
];

// Placeholder nutrition data for demonstration
const placeholderNutritionData = {
  calories: 120,
  protein: 5,
  carbs: 22,
  fat: 2,
  servingSize: '1 cup',
  unit: 'cup',
  quantity: 1,
};

export default function AddFoodModal({ isOpen, onClose }: AddFoodModalProps) {
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState(unitOptions[0].value);
  const [meal, setMeal] = useState(mealOptions[0].value);
  const [notes, setNotes] = useState('');
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any>(null); // Placeholder for selected food object
  const [timeOfDay, setTimeOfDay] = useState('');
  const [autoPortion, setAutoPortion] = useState(false);
  const [selectedNutrient, setSelectedNutrient] = useState('');

  // Calculate nutrition info based on quantity/unit (placeholder logic)
  const qty = parseFloat(quantity) || 1;
  const showNutrition = selectedFood || foodName;
  const nutrition = showNutrition
    ? {
        calories: placeholderNutritionData.calories * qty,
        protein: placeholderNutritionData.protein * qty,
        carbs: placeholderNutritionData.carbs * qty,
        fat: placeholderNutritionData.fat * qty,
        servingSize: `${qty} ${unit}`,
      }
    : null;

  const handleFoodSelect = (food: any) => {
    setFoodName(food.label);
    setSelectedFood(food);
    setIsAdvancedSearchOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for submit logic, now includes autoPortion and selectedNutrient
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
              onChange={e => {
                setFoodName(e.target.value);
                setSelectedFood(null);
              }}
              placeholder="Enter food or drink name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
              required
            />
          </div>

          {/* Nutrition Info Panel */}
          <div className="mb-2">
            {showNutrition ? (
              <div className="bg-white dark:bg-slate-100 rounded-lg shadow p-4 flex flex-col gap-2 border border-gray-200">
                <div className="text-sm font-semibold text-gray-700 mb-1">Nutrition Info (per {nutrition?.servingSize}):</div>
                <div className="flex gap-6 text-sm text-gray-700">
                  <div><span className="font-bold">Calories:</span> {nutrition?.calories}</div>
                  <div><span className="font-bold">Protein:</span> {nutrition?.protein}g</div>
                  <div><span className="font-bold">Carbs:</span> {nutrition?.carbs}g</div>
                  <div><span className="font-bold">Fat:</span> {nutrition?.fat}g</div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-500 italic">Select a food to see nutrition info.</div>
            )}
          </div>

          {/* Auto Portion Checkbox */}
          <div className="flex items-center gap-2 mb-1">
            <input
              id="auto-portion"
              type="checkbox"
              checked={autoPortion}
              onChange={e => {
                setAutoPortion(e.target.checked);
                if (!e.target.checked) setSelectedNutrient('');
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="auto-portion" className="text-sm font-medium dark:text-white">
              Auto Portion
            </label>
          </div>

          {/* Quantity and Unit/Nutrient */}
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
                placeholder={autoPortion ? 'Amount of nutrient' : 'Amount'}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                required
              />
            </div>
            <div>
              {autoPortion ? (
                <div>
                  <label htmlFor="nutrient" className="block text-sm font-medium dark:text-white">
                    Nutrient
                  </label>
                  <select
                    id="nutrient"
                    value={selectedNutrient}
                    onChange={e => setSelectedNutrient(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                    required
                  >
                    {nutrientOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              ) : (
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
              )}
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

          {/* Time of Day for 'Other' meal */}
          {meal === 'other' && (
            <div>
              <label htmlFor="time-of-day" className="block text-sm font-medium dark:text-white">
                Time of Day (optional)
              </label>
              <input
                id="time-of-day"
                type="time"
                value={timeOfDay}
                onChange={e => setTimeOfDay(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                placeholder="e.g. 14:30"
              />
            </div>
          )}

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
          onSelect={handleFoodSelect}
        />
      </Modal.Body>
    </Modal>
  );
}
