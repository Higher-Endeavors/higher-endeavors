import { useState } from 'react';
import NutritionItem, { NutritionItemType } from './NutritionItem';
import AddFoodModal from '../modals/AddFoodModal';
import PostMeal from '../modals/PostMeal';
import { HiOutlineClipboardList } from 'react-icons/hi';

export type MealType = {
  mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  items: NutritionItemType[];
  notes?: string;
};

const mealLabels: Record<MealType['mealType'], string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  snack: 'Snack',
  dinner: 'Dinner',
};

const placeholderMeals: MealType[] = [
  {
    mealType: 'breakfast',
    items: [
      {
        id: 1,
        name: 'Oatmeal',
        quantity: '1 cup',
        calories: 150,
        protein: 5,
        carbs: 27,
        fat: 3,
        notes: 'With blueberries',
      },
      {
        id: 2,
        name: 'Coffee',
        quantity: '1 cup',
        calories: 2,
        protein: 0,
        carbs: 0,
        fat: 0,
        notes: '',
      },
    ],
    notes: 'Start the day right!'
  },
  {
    mealType: 'lunch',
    items: [
      {
        id: 3,
        name: 'Grilled Chicken Salad',
        quantity: '1 bowl',
        calories: 350,
        protein: 30,
        carbs: 15,
        fat: 12,
        notes: 'Dressing on the side',
      },
    ],
    notes: ''
  },
  {
    mealType: 'snack',
    items: [
      {
        id: 4,
        name: 'Greek Yogurt',
        quantity: '1 container',
        calories: 100,
        protein: 10,
        carbs: 8,
        fat: 0,
        notes: '',
      },
    ],
    notes: ''
  },
  {
    mealType: 'dinner',
    items: [
      {
        id: 5,
        name: 'Salmon',
        quantity: '6 oz',
        calories: 367,
        protein: 39,
        carbs: 0,
        fat: 22,
        notes: 'Baked',
      },
      {
        id: 6,
        name: 'Steamed Broccoli',
        quantity: '1 cup',
        calories: 55,
        protein: 4,
        carbs: 11,
        fat: 1,
        notes: '',
      },
    ],
    notes: ''
  },
];

export default function NutritionList() {
  const [collapsedMeals, setCollapsedMeals] = useState<Record<string, boolean>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [postMealOpen, setPostMealOpen] = useState<string | null>(null);

  const handleEdit = (id: number) => {
    console.log('Edit food/drink:', id);
    // Placeholder for edit functionality
  };

  const handleDelete = (id: number) => {
    console.log('Delete food/drink:', id);
    // Placeholder for delete functionality
  };

  const toggleMeal = (mealType: string) => {
    setCollapsedMeals(prev => ({
      ...prev,
      [mealType]: !prev[mealType],
    }));
  };

  // Calculate daily totals
  const dailyTotals = placeholderMeals.reduce(
    (totals, meal) => {
      meal.items.forEach(item => {
        totals.calories += item.calories;
        totals.protein += item.protein;
        totals.carbs += item.carbs;
        totals.fat += item.fat;
      });
      return totals;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6 mb-4">
     {/* <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-900 mb-4">Nutrition List</h2> */}
      <div className="space-y-4">
        {placeholderMeals.map(meal => {
          // Calculate meal totals
          const mealTotals = meal.items.reduce(
            (totals, item) => {
              totals.calories += item.calories;
              totals.protein += item.protein;
              totals.carbs += item.carbs;
              totals.fat += item.fat;
              return totals;
            },
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
          );
          const isOpen = !collapsedMeals[meal.mealType];
          return (
            <div key={meal.mealType}>
              <div className="flex items-center gap-4 mb-2">
                <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPostMealOpen(meal.mealType)}
                    className="text-purple-600 hover:text-purple-800 focus:outline-none"
                    aria-label={`Post-meal feedback for ${mealLabels[meal.mealType]}`}
                  >
                    <HiOutlineClipboardList className="h-5 w-5" />
                  </button>
                  <h3 className="text-lg font-semibold text-gray-700">{mealLabels[meal.mealType]}</h3>
                </div>
                <button
                  className="text-gray-500 hover:text-gray-700 focus:outline-none transition-transform duration-200"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  aria-label={isOpen ? `Collapse ${mealLabels[meal.mealType]}` : `Expand ${mealLabels[meal.mealType]}`}
                  onClick={() => toggleMeal(meal.mealType)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
              </div>
              {/* Meal summary row - updated styling */}
              <div className="grid grid-cols-4 gap-2 py-2 pl-4 items-center text-sm border-t mt-2 bg-purple-50 text-purple-700 font-semibold">
                <div>Meal Total: {mealTotals.calories} kcal</div>
                <div>{mealTotals.protein}g protein</div>
                <div>{mealTotals.carbs}g carbs</div>
                <div>{mealTotals.fat}g fat</div>
              </div>
              {/* Foods in meal */}
              {isOpen && (
                <div className="mt-2">
                  {meal.items.map(item => (
                    <NutritionItem
                      key={item.id}
                      item={item}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
              <PostMeal isOpen={postMealOpen === meal.mealType} onClose={() => setPostMealOpen(null)} />
            </div>
          );
        })}
      </div>
     
      {/* Add Food/Drink Button */}
      <div className="mt-6 flex">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Food/Drink
        </button>
      </div>
      <AddFoodModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
