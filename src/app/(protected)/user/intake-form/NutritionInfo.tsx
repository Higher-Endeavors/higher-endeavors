import React from 'react';
import { useFormContext } from 'react-hook-form';

const NutritionInfo = () => {
  const { register, watch } = useFormContext();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Nutrition Information</h2>
      <div>Purpose: Gather information about dietary habits, preferences, and nutritional awareness.</div>
      <div>
        <h3>Dietary Habits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="mealsPerDay" className="block mb-1">
              Number of meals and snacks per day
            </label>
            <input
              type="number"
              id="mealsPerDay"
              {...register('mealsPerDay')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
            />
          </div>
          <div>
            <label htmlFor="mealTiming" className="block mb-1">
              Typical meal timing (regular intervals or irregular)
            </label>
            <input
              type="text"
              id="mealTiming"
              {...register('mealTiming')}
              placeholder="e.g., Regular 3 meals at 8am, 12pm, 6pm"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
            />
          </div>
          <div>
            <label htmlFor="homeCookedMeals" className="block mb-1">
              Percentage of meals cooked at home
            </label>
            <input
              type="number"
              id="homeCookedMeals"
              {...register('homeCookedMeals')}
              placeholder="e.g., 75"
              min="0"
              max="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
            />
          </div>
        </div>
        <div>
          <label htmlFor="commonFoods" className="block mb-1">
            Commonly consumed foods or staples in your diet
          </label>
          <textarea
            id="commonFoods"
            {...register('commonFoods')}
            placeholder="e.g., breakfast, lunch, dinner, snacks"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <h3>Dietary Preferences & Restrictions</h3>
        <div>
          <label htmlFor="dietaryApproach" className="block mb-1">
            Dietary approach
          </label>
          <input
            type="text"
            id="dietaryApproach"
            {...register('dietaryApproach')}
            placeholder="e.g., omnivore, vegetarian, vegan, Paleo, Keto, etc."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="foodAllergies" className="block mb-1">
            Known food allergies or intolerances
          </label>
          <textarea
            id="foodAllergies"
            {...register('foodAllergies')}
            placeholder="e.g., gluten, dairy, nuts, seafood, etc."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <h3>Nutritional Awareness</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="trackedNutrition" className="block mb-1">
              Have you ever tracked calories or macronutrients?
            </label>
            <select
              id="trackedNutrition"
              {...register('trackedNutrition')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-400 dark:text-slate-800"
            >
              <option value="">Select...</option>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
            {watch('trackedNutrition') === 'yes' && (
              <div className="mt-2">
                <label htmlFor="trackedNutritionDetails" className="block mb-1">
                  Please provide details
                </label>
                <textarea
                  id="trackedNutritionDetails"
                  {...register('trackedNutritionDetails')}
                  placeholder="Please describe your experience with tracking calories or macronutrients"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
                />
              </div>
            )}
          </div>
          <div>
            <label htmlFor="familiarGuidelines" className="block mb-1">
              Are you familiar with any nutritional guidelines or plans?
            </label>
            <select
              id="familiarGuidelines"
              {...register('familiarGuidelines')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-400 dark:text-slate-800"
            >
              <option value="">Select...</option>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
            {watch('familiarGuidelines') === 'yes' && (
              <div className="mt-2">
                <label htmlFor="familiarGuidelinesDetails" className="block mb-1">
                  Please provide details
                </label>
                <textarea
                  id="familiarGuidelinesDetails"
                  {...register('familiarGuidelinesDetails')}
                  placeholder="Please describe which nutritional guidelines or plans you are familiar with"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div>
        <h3>Challenges with Nutrition</h3>
        <div>
          <label htmlFor="nutritionChallenges" className="block mb-1">
            What are some of the challenges you face with nutrition?
          </label>
          <textarea
            id="nutritionChallenges"
            {...register('nutritionChallenges')}
            placeholder="e.g., portion control, cravings, emotional eating, time constraints, food access, etc."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <h3>Hydration & Beverage Intake</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="waterIntake" className="block mb-1">
              Typical daily water intake
            </label>
            <input
              type="text"
              id="waterIntake"
              {...register('waterIntake')}
              placeholder="e.g., 80 oz per day"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="caffeineIntake" className="block mb-1">
              Number of caffeinated drinks per day & timing (coffee, tea, energy drinks)
            </label>
            <textarea
              id="caffeineIntake"
              {...register('caffeineIntake')}
              placeholder="e.g., 2 cups of coffee in morning, 1 tea in afternoon at 2pm"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionInfo; 