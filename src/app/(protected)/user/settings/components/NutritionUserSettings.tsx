import React from 'react';
import { UseFormSetValue } from 'react-hook-form';
import type { UserSettings } from '@/app/lib/types/userSettings';
import type { MacronutrientTargetMode } from '../types/settings';

interface NutritionUserSettingsProps {
  setValue: UseFormSetValue<UserSettings>;
  nutrition: any;
}

const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
};

const NutritionUserSettings: React.FC<NutritionUserSettingsProps> = ({ setValue, nutrition }) => {
  const [macroMode, setMacroMode] = React.useState<MacronutrientTargetMode>(nutrition.macronutrientTargetMode || 'grams');

  // Calculate calories from macros if in grams mode
  const macroCalories =
    (Number(nutrition.macronutrientTargets?.protein) || 0) * CALORIES_PER_GRAM.protein +
    (Number(nutrition.macronutrientTargets?.carbs) || 0) * CALORIES_PER_GRAM.carbs +
    (Number(nutrition.macronutrientTargets?.fat) || 0) * CALORIES_PER_GRAM.fat;

  const calorieTarget = Number(nutrition.calorieTarget) || 0;
  const showMacroWarning = macroMode === 'grams' && calorieTarget > 0 && macroCalories !== calorieTarget;

  // Percent mode: check if sum of macros is 100%
  const percentSum =
    (Number(nutrition.macronutrientTargets?.protein) || 0) +
    (Number(nutrition.macronutrientTargets?.carbs) || 0) +
    (Number(nutrition.macronutrientTargets?.fat) || 0);
  const showPercentWarning = macroMode === 'percent' && percentSum !== 100;

  // Percent mode: calculate grams and calories for each macro
  let macroGrams: Record<string, number> = {};
  let macroCaloriesPercent: Record<string, number> = {};
  let totalCaloriesPercent = 0;
  if (macroMode === 'percent' && calorieTarget > 0) {
    ['protein', 'carbs', 'fat'].forEach((macro) => {
      const percent = Number(nutrition.macronutrientTargets?.[macro]) || 0;
      const kcal = (calorieTarget * percent) / 100;
      macroCaloriesPercent[macro] = kcal;
      macroGrams[macro] = kcal / CALORIES_PER_GRAM[macro as keyof typeof CALORIES_PER_GRAM];
    });
    totalCaloriesPercent = macroCaloriesPercent.protein + macroCaloriesPercent.carbs + macroCaloriesPercent.fat;
  }

  // Handle mode change
  const handleMacroModeChange = (mode: MacronutrientTargetMode) => {
    setMacroMode(mode);
    setValue('pillar_settings.nutrition.macronutrientTargetMode', mode, { shouldDirty: true });
  };

  // Handle macro input change
  const handleMacroChange = (macro: 'protein' | 'carbs' | 'fat', value: number) => {
    setValue(`pillar_settings.nutrition.macronutrientTargets.${macro}` as any, value, { shouldDirty: true });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-700">Nutrition Settings</h2>
      {/* Food Measurement */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">Food Measurement</label>
        <select
          value={nutrition.foodMeasurement}
          onChange={(e) => setValue('pillar_settings.nutrition.foodMeasurement', e.target.value, { shouldDirty: true })}
          className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
        >
          <option value="grams">Grams</option>
          <option value="lbs_oz">Pounds & Ounces</option>
          <option value="oz">Ounces</option>
        </select>
      </div>
      {/* Hydration Unit */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">Hydration Unit</label>
        <select
          value={nutrition.hydrationUnit}
          onChange={(e) => setValue('pillar_settings.nutrition.hydrationUnit', e.target.value, { shouldDirty: true })}
          className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
        >
          <option value="oz">Fluid Ounces</option>
          <option value="liters">Liters</option>
          <option value="grams">Grams</option>
        </select>
      </div>
      {/* Daily Nutrient Targets */}
      <div className="mt-8 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Daily Nutrient Targets</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Calorie Target</label>
          <input
            type="number"
            min={0}
            value={nutrition.calorieTarget || ''}
            onChange={e => setValue('pillar_settings.nutrition.calorieTarget', Number(e.target.value), { shouldDirty: true })}
            className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Macronutrient Target Mode</label>
          <div className="flex gap-4 mt-1">
            <label className="inline-flex items-center text-gray-700">
              <input
                type="radio"
                checked={macroMode === 'grams'}
                onChange={() => handleMacroModeChange('grams')}
                className="mr-2"
              />
              Totals in Grams
            </label>
            <label className="inline-flex items-center text-gray-700">
              <input
                type="radio"
                checked={macroMode === 'percent'}
                onChange={() => handleMacroModeChange('percent')}
                className="mr-2"
              />
              Percentage Ratios
            </label>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['protein', 'carbs', 'fat'].map((macro) => (
            <div key={macro}>
              <label className="block text-sm font-medium capitalize text-gray-700">
                {macro} {macroMode === 'grams' ? '(g)' : '(%)'}
              </label>
              <input
                type="number"
                min={0}
                value={nutrition.macronutrientTargets?.[macro] || ''}
                onChange={e => handleMacroChange(macro as any, Number(e.target.value))}
                className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
              />
            </div>
          ))}
        </div>
        {showMacroWarning && (
          <div className="mt-4 p-2 bg-yellow-100 border-l-4 border-yellow-400 rounded text-gray-700">
            <strong>Warning:</strong> The calories from your macronutrient totals ({macroCalories} kcal) do not match your calorie target ({calorieTarget} kcal).
          </div>
        )}
        {showPercentWarning && (
          <div className="mt-4 p-2 bg-yellow-100 border-l-4 border-yellow-400 rounded text-gray-700">
            <strong>Warning:</strong> The sum of your macronutrient percentages is {percentSum}%. It should equal 100%.
          </div>
        )}
        {macroMode === 'percent' && (
          <div className="mt-4">
            {calorieTarget > 0 ? (
              <div className="p-4 border rounded bg-gray-50">
                <div className="mb-2 font-semibold text-gray-700">Macronutrient Breakdown (based on {calorieTarget} kcal):</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['protein', 'carbs', 'fat'].map((macro) => (
                    <div key={macro} className="text-gray-700">
                      <div className="capitalize">{macro}</div>
                      <div>{Math.round(macroGrams[macro] ?? 0)} g</div>
                      <div>{macroCaloriesPercent[macro]?.toFixed(0)} kcal</div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-gray-700 font-medium">Total Calories: {totalCaloriesPercent.toFixed(0)} kcal</div>
              </div>
            ) : (
              <div className="mt-2 text-yellow-700">Set a calorie target to see the breakdown in grams and calories.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionUserSettings;
