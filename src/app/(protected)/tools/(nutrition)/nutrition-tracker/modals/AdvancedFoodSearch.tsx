'use client';

import { Modal } from 'flowbite-react';
import Select from 'react-select';

interface AdvancedFoodSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (food: any) => void;
}

const macronutrientOptions = [
  { value: 'low_carb', label: 'Low Carb' },
  { value: 'high_protein', label: 'High Protein' },
  { value: 'low_fat', label: 'Low Fat' },
  { value: 'balanced', label: 'Balanced' },
];

const mealTypeOptions = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'snack', label: 'Snack' },
  { value: 'dinner', label: 'Dinner' },
];

const dishTypeOptions = [
  { value: 'main', label: 'Main' },
  { value: 'side', label: 'Side' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'beverage', label: 'Beverage' },
];

const ethnicityOptions = [
  { value: 'american', label: 'American' },
  { value: 'asian', label: 'Asian' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'latin', label: 'Latin' },
  { value: 'african', label: 'African' },
  { value: 'other', label: 'Other' },
];

const dietaryNeedsOptions = [
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'fodmap', label: 'FODMAP' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'gluten_free', label: 'Gluten Free' },
  { value: 'dairy_free', label: 'Dairy Free' },
];

// Placeholder foods for demonstration
const placeholderFoods = [
  {
    id: '1',
    label: 'Grilled Chicken Breast',
    data: {
      macronutrient: 'High Protein',
      meal_type: 'Lunch',
      dish_type: 'Main',
      ethnicity: 'American',
      dietary: 'Keto'
    },
    source: 'library'
  },
  {
    id: '2',
    label: 'Vegan Buddha Bowl',
    data: {
      macronutrient: 'Balanced',
      meal_type: 'Dinner',
      dish_type: 'Main',
      ethnicity: 'Asian',
      dietary: 'Vegan'
    },
    source: 'user'
  }
];

export default function AdvancedFoodSearch({ isOpen, onClose, onSelect }: AdvancedFoodSearchProps) {
  return (
    <Modal show={isOpen} onClose={onClose} size="xl">
      <Modal.Header className="dark:text-white">
        Advanced Food Search
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-6">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium dark:text-white mb-2">
              Search Food
            </label>
            <Select
              options={placeholderFoods}
              className="basic-single"
              classNamePrefix="select"
              placeholder="Type to search foods..."
              components={{
                DropdownIndicator: () => null,
                IndicatorSeparator: () => null
              }}
            />
          </div>

          {/* Filters in a responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Macronutrient Focus */}
            <div className="w-full">
              <label className="block text-sm font-medium dark:text-white mb-2">
                Macronutrient Focus
              </label>
              <Select
                options={macronutrientOptions}
                isClearable
                placeholder="Filter by macronutrient"
              />
            </div>
            {/* Meal Type */}
            <div className="w-full">
              <label className="block text-sm font-medium dark:text-white mb-2">
                Meal Type
              </label>
              <Select
                options={mealTypeOptions}
                isClearable
                placeholder="Filter by meal type"
              />
            </div>
            {/* Dish Type */}
            <div className="w-full">
              <label className="block text-sm font-medium dark:text-white mb-2">
                Dish Type
              </label>
              <Select
                options={dishTypeOptions}
                isClearable
                placeholder="Filter by dish type"
              />
            </div>
            {/* Ethnicity */}
            <div className="w-full">
              <label className="block text-sm font-medium dark:text-white mb-2">
                Ethnicity
              </label>
              <Select
                options={ethnicityOptions}
                isClearable
                placeholder="Filter by ethnicity"
              />
            </div>
            {/* Dietary Needs */}
            <div className="w-full">
              <label className="block text-sm font-medium dark:text-white mb-2">
                Dietary Needs
              </label>
              <Select
                options={dietaryNeedsOptions}
                isClearable
                placeholder="Filter by dietary needs"
              />
            </div>
          </div>

          {/* Food List */}
          <div className="mt-6">
            <h3 className="text-sm font-medium dark:text-white mb-3">
              {placeholderFoods.length} foods found
            </h3>
            <div className="max-h-[calc(100vh-24rem)] overflow-y-auto">
              {placeholderFoods.map((food) => (
                <div
                  key={food.id}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer rounded transition-colors"
                  onClick={() => {
                    onSelect(food);
                    onClose();
                  }}
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {food.label}
                    {food.source === 'user' && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 rounded-full">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {food.data.macronutrient} • {food.data.meal_type} • {food.data.dish_type} • {food.data.ethnicity}
                    {food.source === 'library' && food.data.dietary && (
                      <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                        {food.data.dietary}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
