import React, { useState } from 'react';
import { HiOutlineDotsVertical } from 'react-icons/hi';

export type NutritionItemType = {
  id: number;
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
};

export type NutritionMealSummary = {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  notes?: string;
};

interface NutritionItemProps {
  item: NutritionItemType;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  mealSummary?: NutritionMealSummary;
}

export default function NutritionItem({ item, onEdit, onDelete, mealSummary }: NutritionItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((open) => !open);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="bg-white border rounded-lg p-4 mb-2 hover:shadow-md transition-shadow relative group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="font-medium dark:text-slate-900">{item.name}</span>
          <span className="text-xs text-gray-500">{item.quantity}</span>
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleMenu();
            }}
            aria-label="Nutrition item options"
            aria-expanded={menuOpen}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <HiOutlineDotsVertical className="h-5 w-5 text-gray-600 dark:text-slate-900" aria-hidden="true" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={closeMenu} />
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-20">
                <div className="py-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onEdit(item.id);
                      closeMenu();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(item.id);
                      closeMenu();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="mt-4">
        <div className="grid grid-cols-6 gap-2 text-xs text-gray-900 font-semibold pb-1 border-b">
          <div>Calories</div>
          <div>Protein</div>
          <div>Carbs</div>
          <div>Fat</div>
          <div className="col-span-2">Notes</div>
        </div>
        <div className="grid grid-cols-6 gap-2 py-2 items-center text-sm border-b last:border-b-0 text-gray-900">
          <div>{item.calories}</div>
          <div>{item.protein}g</div>
          <div>{item.carbs}g</div>
          <div>{item.fat}g</div>
          <div className="col-span-2 break-words">{item.notes || ''}</div>
        </div>
        {mealSummary && (
          <div className="grid grid-cols-5 gap-2 py-2 items-center text-sm border-t mt-2 bg-purple-50 text-purple-700 font-semibold">
            <div className="col-span-2">Meal Total: {mealSummary.totalCalories} kcal</div>
            <div>{mealSummary.totalProtein}g protein, {mealSummary.totalCarbs}g carbs, {mealSummary.totalFat}g fat</div>
            <div className="col-span-2 text-left break-words">Notes: {mealSummary.notes || ''}</div>
          </div>
        )}
      </div>
    </div>
  );
}
