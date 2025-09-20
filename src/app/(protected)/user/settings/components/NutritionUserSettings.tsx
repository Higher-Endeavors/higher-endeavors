import React from 'react';
import { UseFormSetValue, useFormContext } from 'react-hook-form';
import type {
  UserSettings,
  FoodAllergy,
  FoodMeasurementUnit,
  HydrationUnit,
  DietaryBase,
  MacronutrientTargetMode,
  MacronutrientTargets,
  MealScheduleEntry,
  CustomMealSchedule,
  NutrientDistribution,
  ScheduleAssignments
} from 'lib/types/userSettings.zod';
import { HiChevronDown } from 'react-icons/hi';

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
  const { watch } = useFormContext<UserSettings>();
  const watchedCalorieTarget = watch('nutrition.calorieTarget');
  const watchedMacronutrientTargets = watch('nutrition.macronutrientTargets');
  const [macroMode, setMacroMode] = React.useState<MacronutrientTargetMode>(nutrition.macronutrientTargetMode || 'grams');
  const [nutrientOpen, setNutrientOpen] = React.useState(true);
  const [mealOpen, setMealOpen] = React.useState(true);
  const [allergyOpen, setAllergyOpen] = React.useState(false);
  const [dietOpen, setDietOpen] = React.useState(false);
  const [customAllergy, setCustomAllergy] = React.useState('');

  // --- New state for custom schedules ---
  const [selectedScheduleId, setSelectedScheduleId] = React.useState<string>('default');
  const [newScheduleName, setNewScheduleName] = React.useState('');
  const [creatingNew, setCreatingNew] = React.useState(false);
  const [assignments, setAssignments] = React.useState<ScheduleAssignments>(nutrition.scheduleAssignments || {});

  // Minimal fallback schedule for UI safety
  const fallbackSchedule: CustomMealSchedule = { id: 'default', name: 'Default', meals: [], nutrientDistribution: { mode: 'even' } };

  // Helper: get all schedules (default + custom)
  const allSchedules: CustomMealSchedule[] = [
    nutrition.defaultMealSchedule,
    ...((nutrition.customMealSchedules || []) as CustomMealSchedule[])
  ];

  // Helper: get selected schedule
  const selectedSchedule: CustomMealSchedule =
    selectedScheduleId === 'default'
      ? (nutrition.defaultMealSchedule || fallbackSchedule)
      : ((nutrition.customMealSchedules || []) as CustomMealSchedule[]).find((s: CustomMealSchedule) => s.id === selectedScheduleId)
        || nutrition.defaultMealSchedule
        || fallbackSchedule;

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

  // --- Handlers for meal editing (for selected schedule) ---
  const handleMealNameChange = (idx: number, value: string) => {
    const updatedMeals = selectedSchedule.meals.map((meal, i) => i === idx ? { ...meal, name: value } : meal);
    updateSchedule({ ...selectedSchedule, meals: updatedMeals });
  };
  const handleMealTimeChange = (idx: number, value: string) => {
    const updatedMeals = selectedSchedule.meals.map((meal, i) => i === idx ? { ...meal, time: value } : meal);
    updateSchedule({ ...selectedSchedule, meals: updatedMeals });
  };
  const handleAddMeal = () => {
    updateSchedule({ ...selectedSchedule, meals: [...selectedSchedule.meals, { name: '', time: '' }] });
  };
  const handleRemoveMeal = (idx: number) => {
    updateSchedule({ ...selectedSchedule, meals: selectedSchedule.meals.filter((_, i) => i !== idx) });
  };

  // --- Update schedule in nutrition object ---
  function updateSchedule(updated: CustomMealSchedule) {
    if (selectedScheduleId === 'default') {
      setValue('nutrition.defaultMealSchedule', updated, { shouldDirty: true });
    } else {
      const updatedCustom = ((nutrition.customMealSchedules || []) as CustomMealSchedule[]).map((s: CustomMealSchedule) => s.id === updated.id ? updated : s);
      setValue('nutrition.customMealSchedules', updatedCustom, { shouldDirty: true });
    }
  }

  // Simple unique ID generator for placeholder use (not for production)
  function generatePlaceholderId() {
    return `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // --- Create new custom schedule ---
  function handleCreateNewSchedule() {
    if (!newScheduleName.trim()) return;
    const newId = generatePlaceholderId();
    const newSchedule: CustomMealSchedule = {
      id: newId,
      name: newScheduleName.trim(),
      meals: [],
      nutrientDistribution: { mode: 'even' },
    };
    setValue('nutrition.customMealSchedules', [...(nutrition.customMealSchedules || []), newSchedule], { shouldDirty: true });
    setSelectedScheduleId(newId);
    setNewScheduleName('');
    setCreatingNew(false);
  }

  // --- Assign schedule to day ---
  function handleAssignDay(day: string, scheduleId: string) {
    const updated = { ...assignments, [day]: scheduleId };
    setAssignments(updated);
    setValue('nutrition.scheduleAssignments', updated, { shouldDirty: true });
  }

  // --- Days of week ---
  const daysOfWeek = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

  const foodAllergyOptions = [
    { value: 'gluten', label: 'Gluten' },
    { value: 'peanut', label: 'Peanut' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'FODMAP', label: 'FODMAP' },
    { value: 'soy', label: 'Soy' },
    { value: 'egg', label: 'Egg' },
    { value: 'tree_nut', label: 'Tree Nut' },
    { value: 'fish', label: 'Fish' },
    { value: 'shellfish', label: 'Shellfish' },
    { value: 'sesame', label: 'Sesame' },
  ];
  const foodAllergies: string[] = nutrition.foodAllergies || [];
  const handleAllergyChange = (allergy: string, checked: boolean) => {
    const updated = checked
      ? [...foodAllergies, allergy]
      : foodAllergies.filter((a) => a !== allergy);
      setValue('nutrition.foodAllergies', updated);
  };

  const dietaryOptions = [
    { value: 'omnivore', label: 'Omnivore' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'pescatarian', label: 'Pescatarian' },
    { value: 'paleo', label: 'Paleo' },
    { value: 'keto', label: 'Keto' },
    { value: 'mediterranean', label: 'Mediterranean' },
    { value: 'other', label: 'Other' },
  ];
  const dietaryPreference = nutrition.dietaryPreference || '';

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-700">Nutrition Settings</h2>
      {/* Food Measurement */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">Food Measurement</label>
        <select
          value={nutrition.foodMeasurement}
          onChange={(e) => setValue('nutrition.foodMeasurement', e.target.value as FoodMeasurementUnit, { shouldDirty: true })}
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
          onChange={e => setValue('nutrition.hydrationUnit', e.target.value as HydrationUnit, { shouldDirty: true })}
          className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
        >
          <option value="oz">Fluid Ounces</option>
          <option value="liters">Liters</option>
          <option value="grams">Grams</option>
        </select>
      </div>
      {/* Daily Nutrient Targets Collapsible Block */}
      <div className="mt-8 p-4 border rounded-lg bg-gray-50">
        <button
          type="button"
          onClick={() => setNutrientOpen((open) => !open)}
          className="w-full flex items-center justify-between text-lg font-semibold text-gray-700 focus:outline-none px-0 py-0 bg-transparent border-none"
        >
          <span>Daily Nutrient Targets</span>
          <HiChevronDown className={`h-6 w-6 transform transition-transform duration-200 ${nutrientOpen ? '' : '-rotate-180'}`} />
        </button>
        {nutrientOpen && (
          <div className="mt-4">
            {/* Calorie Target */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Calorie Target</label>
              <input
                type="number"
                min={0}
                value={nutrition.calorieTarget || ''}
                onChange={e => setValue('nutrition.calorieTarget', Number(e.target.value), { shouldDirty: true })}
                className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
              />
            </div>
            {/* Macronutrient Target Mode */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Macronutrient Target Mode</label>
              <div className="flex gap-4 mt-1">
                <label className="inline-flex items-center text-gray-700">
                  <input
                    type="radio"
                    checked={macroMode === 'grams'}
                    onChange={() => setMacroMode('grams')}
                    className="mr-2"
                  />
                  Totals in Grams
                </label>
                <label className="inline-flex items-center text-gray-700">
                  <input
                    type="radio"
                    checked={macroMode === 'percent'}
                    onChange={() => setMacroMode('percent')}
                    className="mr-2"
                  />
                  Percentage Ratios
                </label>
              </div>
            </div>
            {/* Macronutrient Inputs */}
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
                    onChange={e => setValue(`nutrition.macronutrientTargets.${macro}` as any, Number(e.target.value), { shouldDirty: true })}
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
        )}
      </div>
      {/* Meal Schedule Section - now supports custom schedules */}
      <div className="mt-8 p-4 border rounded-lg bg-gray-50">
        <button
          type="button"
          onClick={() => setMealOpen((open) => !open)}
          className="w-full flex items-center justify-between text-lg font-semibold text-gray-700 focus:outline-none px-0 py-0 bg-transparent border-none"
        >
          <span>Daily Meal Schedule</span>
          <HiChevronDown className={`h-6 w-6 transform transition-transform duration-200 ${mealOpen ? '' : '-rotate-180'}`} />
        </button>
        {mealOpen && (
          <div className="mt-4 space-y-4">
            {/* Schedule Selector */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
              <label className="font-medium text-gray-700">Select Schedule:</label>
              <select
                value={selectedScheduleId}
                onChange={e => {
                  if (e.target.value === 'create') {
                    setCreatingNew(true);
                  } else {
                    setSelectedScheduleId(e.target.value);
                  }
                }}
                className="rounded border border-gray-300 px-2 py-1 text-gray-700"
              >
                <option value="default">Default</option>
                {((nutrition.customMealSchedules || []) as CustomMealSchedule[]).map((s: CustomMealSchedule) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
                <option value="create">+ Create Custom Schedule</option>
              </select>
              {creatingNew && (
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={newScheduleName}
                    onChange={e => setNewScheduleName(e.target.value)}
                    placeholder="Custom schedule name"
                    className="px-2 py-1 rounded border border-gray-300 text-gray-700"
                  />
                  <button
                    type="button"
                    className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium"
                    onClick={handleCreateNewSchedule}
                    disabled={!newScheduleName.trim()}
                  >Create</button>
                  <button
                    type="button"
                    className="px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                    onClick={() => { setCreatingNew(false); setNewScheduleName(''); }}
                  >Cancel</button>
                </div>
              )}
            </div>
            {/* Meal List for selected schedule */}
            {selectedSchedule.meals.length === 0 && (
              <div className="text-gray-700">No meals added yet.</div>
            )}
            {selectedSchedule.meals.map((meal, idx) => (
              <div key={idx} className="flex flex-col md:flex-row md:items-center gap-2">
                <input
                  type="text"
                  value={meal.name}
                  onChange={e => handleMealNameChange(idx, e.target.value)}
                  placeholder="Meal name (e.g. Breakfast)"
                  className="flex-1 px-2 py-1 rounded border border-gray-300 text-gray-700"
                />
                <input
                  type="time"
                  value={meal.time || ''}
                  onChange={e => handleMealTimeChange(idx, e.target.value)}
                  className="px-2 py-1 rounded border border-gray-300 text-gray-700"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveMeal(idx)}
                  className="px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                  aria-label="Remove meal"
                >
                  Remove
                </button>
              </div>
            ))}
            {/* Add Meal Button */}
            <button
              type="button"
              onClick={handleAddMeal}
              className="mt-2 px-4 py-2 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium"
            >
              Add Meal
            </button>
            {/* Assignment to days of week as checkboxes (now between Add Meal and Nutrient Distribution) */}
            <div className="mb-4 flex flex-col items-start">
              <div className="font-medium text-gray-700 mb-1">Apply this schedule to days of the week:</div>
              <div className="flex gap-3">
                {daysOfWeek.map((day) => {
                  const isChecked = selectedScheduleId === 'default'
                    ? !Object.values(assignments).includes(day)
                    : assignments[day as keyof ScheduleAssignments] === selectedScheduleId;
                  return (
                    <label key={day} className="flex flex-col items-center text-xs text-gray-700">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={e => {
                          if (selectedScheduleId === 'default') {
                            if (!e.target.checked) {
                              const updated = { ...assignments };
                              delete updated[day as keyof ScheduleAssignments];
                              setAssignments(updated);
                              setValue('nutrition.scheduleAssignments', updated, { shouldDirty: true });
                            }
                          } else {
                            const updated = { ...assignments };
                            if (e.target.checked) {
                              Object.keys(updated).forEach((d) => {
                                if (d === day) updated[d as keyof ScheduleAssignments] = selectedScheduleId;
                              });
                              updated[day as keyof ScheduleAssignments] = selectedScheduleId;
                            } else {
                              if (updated[day as keyof ScheduleAssignments] === selectedScheduleId) {
                                delete updated[day as keyof ScheduleAssignments];
                              }
                            }
                            setAssignments(updated);
                            setValue('nutrition.scheduleAssignments', updated, { shouldDirty: true });
                          }
                        }}
                        className="mb-1"
                      />
                      <span className="capitalize">{day.slice(0,3)}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            {/* Nutrient Distribution Section for selected schedule */}
            <NutrientDistribution
              calorieTarget={watchedCalorieTarget as number}
              macronutrientTargets={watchedMacronutrientTargets as MacronutrientTargets}
              macroMode={macroMode} // Pass the local state instead of nutrition.macronutrientTargetMode
              meals={selectedSchedule.meals}
              nutrientDistribution={selectedSchedule.nutrientDistribution}
              setValue={setValue}
            />
          </div>
        )}
      </div>
      {/* Food Allergies / Intolerances Collapsible Block */}
      <div className="mt-8 p-4 border rounded-lg bg-gray-50">
        <button
          type="button"
          onClick={() => setAllergyOpen((open) => !open)}
          className="w-full flex items-center justify-between text-lg font-semibold text-gray-700 focus:outline-none px-0 py-0 bg-transparent border-none"
        >
          <span>Food Allergies / Intolerances / Exclusions</span>
          <HiChevronDown className={`h-6 w-6 transform transition-transform duration-200 ${allergyOpen ? '' : '-rotate-180'}`} />
        </button>
        {allergyOpen && (
          <div className="mt-4 space-y-2">
            <div className="text-gray-700 mb-2">Select any food allergies, intolerances, or exclusions you have:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {foodAllergyOptions.map(opt => (
                <label key={opt.value} className="inline-flex items-center text-gray-700">
                  <input
                    type="checkbox"
                    checked={foodAllergies.includes(opt.value)}
                    onChange={e => handleAllergyChange(opt.value, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  {opt.label}
                </label>
              ))}
              {/* Custom allergies */}
              {foodAllergies.filter(a => !foodAllergyOptions.some(opt => opt.value === a)).map((custom, idx) => (
                <label key={custom} className="inline-flex items-center text-gray-700">
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={e => handleAllergyChange(custom, false)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  {custom}
                </label>
              ))}
            </div>
            {/* Add custom allergy */}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={customAllergy}
                onChange={e => setCustomAllergy(e.target.value)}
                placeholder="Add custom exclusion..."
                className="flex-1 px-2 py-1 rounded border border-gray-300 text-gray-700"
              />
              <button
                type="button"
                className="px-4 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium"
                disabled={
                  !customAllergy.trim() ||
                  foodAllergies.includes(customAllergy.trim()) ||
                  foodAllergyOptions.some(opt => opt.value.toLowerCase() === customAllergy.trim().toLowerCase())
                }
                onClick={() => {
                  const trimmed = customAllergy.trim();
                  if (
                    trimmed &&
                    !foodAllergies.includes(trimmed) &&
                    !foodAllergyOptions.some(opt => opt.value.toLowerCase() === trimmed.toLowerCase())
                  ) {
                    setValue('nutrition.foodAllergies', [...foodAllergies, trimmed], { shouldDirty: true });
                    setCustomAllergy('');
                  }
                }}
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Dietary Preference Collapsible Block */}
      <div className="mt-8 p-4 border rounded-lg bg-gray-50">
        <button
          type="button"
          onClick={() => setDietOpen((open) => !open)}
          className="w-full flex items-center justify-between text-lg font-semibold text-gray-700 focus:outline-none px-0 py-0 bg-transparent border-none"
        >
          <span>Dietary Preference</span>
          <HiChevronDown className={`h-6 w-6 transform transition-transform duration-200 ${dietOpen ? '' : '-rotate-180'}`} />
        </button>
        {dietOpen && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select your base dietary preference:</label>
            <select
              value={nutrition.dietaryBase || ''}
              onChange={e => setValue('nutrition.dietaryBase', e.target.value as DietaryBase, { shouldDirty: true })}
              className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2 mb-4"
            >
              <option value="">-- Select --</option>
              {['omnivore', 'vegetarian', 'vegan', 'pescatarian'].map((base) => (
                <option key={base} value={base}>
                  {base.charAt(0).toUpperCase() + base.slice(1)}
                </option>
              ))}
            </select>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select any diet styles:</label>
            <div className="flex flex-row gap-x-4">
              {['keto', 'paleo', 'mediterranean', 'other'].map((style) => (
                <label key={style} className="inline-flex items-center text-gray-700">
                  <input
                    type="checkbox"
                    value={style}
                    checked={Array.isArray(nutrition.dietaryStyles) && nutrition.dietaryStyles.includes(style)}
                    onChange={e => {
                      const checked = e.target.checked;
                      const prev = Array.isArray(nutrition.dietaryStyles) ? nutrition.dietaryStyles : [];
                      const updated = checked
                        ? [...prev, style]
                        : prev.filter((s: string) => s !== style);
                      setValue('nutrition.dietaryStyles', updated, { shouldDirty: true });
                    }}
                    className="mr-2"
                  />
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// NutrientDistribution component (no duplicate imports)
interface NutrientDistributionProps {
  calorieTarget: number;
  macronutrientTargets?: MacronutrientTargets;
  macroMode: MacronutrientTargetMode;
  meals: MealScheduleEntry[];
  nutrientDistribution?: any; // Accept the persisted distribution from form state
  setValue?: UseFormSetValue<UserSettings>; // Allow updating form state
}

const CALORIES_PER_GRAM_DIST = {
  protein: 4,
  carbs: 4,
  fat: 9,
};

const NutrientDistribution: React.FC<NutrientDistributionProps> = ({
  calorieTarget,
  macronutrientTargets,
  macroMode,
  meals,
  nutrientDistribution,
  setValue,
}) => {
  type DistributionMode = 'even' | 'custom-percent' | 'custom-macros';
  // Initialize from form state if present, else fallback
  const [distributionMode, setDistributionMode] = React.useState<DistributionMode>(nutrientDistribution?.mode || 'even');
  const [customPercents, setCustomPercents] = React.useState<number[]>(nutrientDistribution?.customPercents || meals.map(() => Math.round(100 / (meals.length || 1))));
  const [customMacros, setCustomMacros] = React.useState<{ protein: number; carbs: number; fat: number }[]>(nutrientDistribution?.customMacros || meals.map(() => ({ protein: 0, carbs: 0, fat: 0 })));

  // Sync local state to form state on change
  React.useEffect(() => {
    if (setValue) {
      setValue('nutrition.defaultMealSchedule.nutrientDistribution', {
        mode: distributionMode,
        customPercents,
        customMacros,
      } as any, { shouldDirty: true });
    }
  }, [distributionMode, customPercents, customMacros, setValue]);

  // Keep customPercents and customMacros in sync with meals
  React.useEffect(() => {
    if (meals.length !== customPercents.length) {
      setCustomPercents(
        meals.map((_, i) => customPercents[i] ?? Math.round(100 / (meals.length || 1)))
      );
    }
    if (meals.length !== customMacros.length) {
      setCustomMacros(
        meals.map((_, i) => customMacros[i] ?? { protein: 0, carbs: 0, fat: 0 })
      );
    }
  }, [meals.length]);

  // Calculate total macros in grams
  const macroTotals = React.useMemo(() => {
    if (!macronutrientTargets) return { protein: 0, carbs: 0, fat: 0 };
    if (macroMode === 'grams') {
      return macronutrientTargets;
    } else {
      // percent mode: convert to grams using calorieTarget
      if (!calorieTarget) return { protein: 0, carbs: 0, fat: 0 };
      return {
        protein: (calorieTarget * (macronutrientTargets.protein || 0) / 100) / CALORIES_PER_GRAM_DIST.protein,
        carbs: (calorieTarget * (macronutrientTargets.carbs || 0) / 100) / CALORIES_PER_GRAM_DIST.carbs,
        fat: (calorieTarget * (macronutrientTargets.fat || 0) / 100) / CALORIES_PER_GRAM_DIST.fat,
      };
    }
  }, [macronutrientTargets, macroMode, calorieTarget]);

  // Calculate per-meal distribution
  const perMeal = meals.map((meal, idx) => {
    if (distributionMode === 'even') {
      const percent = meals.length ? 100 / meals.length : 0;
      return {
        percent,
        calories: Math.round((calorieTarget || 0) * percent / 100),
        protein: Math.round((macroTotals.protein || 0) * percent / 100),
        carbs: Math.round((macroTotals.carbs || 0) * percent / 100),
        fat: Math.round((macroTotals.fat || 0) * percent / 100),
      };
    } else if (distributionMode === 'custom-percent') {
      const percent = customPercents[idx] || 0;
      return {
        percent,
        calories: Math.round((calorieTarget || 0) * percent / 100),
        protein: Math.round((macroTotals.protein || 0) * percent / 100),
        carbs: Math.round((macroTotals.carbs || 0) * percent / 100),
        fat: Math.round((macroTotals.fat || 0) * percent / 100),
      };
    } else {
      // custom-macros
      const { protein, carbs, fat } = customMacros[idx] || { protein: 0, carbs: 0, fat: 0 };
      return {
        percent: 0,
        calories: Math.round((protein * CALORIES_PER_GRAM_DIST.protein) + (carbs * CALORIES_PER_GRAM_DIST.carbs) + (fat * CALORIES_PER_GRAM_DIST.fat)),
        protein,
        carbs,
        fat,
      };
    }
  });

  const percentSum = customPercents.reduce((a, b) => a + b, 0);
  const showPercentWarning = distributionMode === 'custom-percent' && percentSum !== 100;
  const macroSum = customMacros.reduce((acc, m) => ({
    protein: acc.protein + (m.protein || 0),
    carbs: acc.carbs + (m.carbs || 0),
    fat: acc.fat + (m.fat || 0),
  }), { protein: 0, carbs: 0, fat: 0 });
  const caloriesSum = customMacros.reduce((acc, m) => acc + ((m.protein || 0) * CALORIES_PER_GRAM_DIST.protein + (m.carbs || 0) * CALORIES_PER_GRAM_DIST.carbs + (m.fat || 0) * CALORIES_PER_GRAM_DIST.fat), 0);
  const showMacroWarning = distributionMode === 'custom-macros' && (
    Math.round(macroSum.protein) !== Math.round(macroTotals.protein) ||
    Math.round(macroSum.carbs) !== Math.round(macroTotals.carbs) ||
    Math.round(macroSum.fat) !== Math.round(macroTotals.fat)
  );

  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 mb-2">
        <span className="font-medium text-gray-700">Nutrient Distribution:</span>
        <select
          className="rounded border border-gray-300 px-2 py-1 text-gray-700"
          value={distributionMode}
          onChange={e => setDistributionMode(e.target.value as DistributionMode)}
        >
          <option value="even">Even Distribution</option>
          <option value="custom-percent">Custom %</option>
          <option value="custom-macros">Custom Macros</option>
        </select>
      </div>
      {distributionMode === 'custom-percent' && (
        <div className="mb-2 grid grid-cols-1 md:grid-cols-2 gap-2">
          {meals.map((meal, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-28 truncate text-gray-700">{meal.name || `Meal ${idx + 1}`}</span>
              <input
                type="number"
                min={0}
                max={100}
                value={customPercents[idx] || ''}
                onChange={e => {
                  const val = Number(e.target.value);
                  setCustomPercents(prev => prev.map((p, i) => i === idx ? val : p));
                }}
                className="w-16 px-2 py-1 rounded border border-gray-300 text-gray-700"
              />
              <span>%</span>
            </div>
          ))}
        </div>
      )}
      {distributionMode === 'custom-macros' && (
        <div className="mb-2 grid grid-cols-1 gap-2">
          {meals.map((meal, idx) => (
            <div key={idx} className="flex flex-col md:flex-row md:items-center gap-2">
              <span className="w-28 truncate text-gray-700">{meal.name || `Meal ${idx + 1}`}</span>
              <label className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Protein</span>
                <input
                  type="number"
                  min={0}
                  value={customMacros[idx]?.protein || ''}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setCustomMacros(prev => prev.map((m, i) => i === idx ? { ...m, protein: val } : m));
                  }}
                  className="w-16 px-2 py-1 rounded border border-gray-300 text-gray-700"
                />
                <span className="text-xs">g</span>
              </label>
              <label className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Carbs</span>
                <input
                  type="number"
                  min={0}
                  value={customMacros[idx]?.carbs || ''}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setCustomMacros(prev => prev.map((m, i) => i === idx ? { ...m, carbs: val } : m));
                  }}
                  className="w-16 px-2 py-1 rounded border border-gray-300 text-gray-700"
                />
                <span className="text-xs">g</span>
              </label>
              <label className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Fat</span>
                <input
                  type="number"
                  min={0}
                  value={customMacros[idx]?.fat || ''}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setCustomMacros(prev => prev.map((m, i) => i === idx ? { ...m, fat: val } : m));
                  }}
                  className="w-16 px-2 py-1 rounded border border-gray-300 text-gray-700"
                />
                <span className="text-xs">g</span>
              </label>
              <span className="ml-2 text-xs text-gray-500">= {perMeal[idx]?.calories} kcal</span>
            </div>
          ))}
        </div>
      )}
      {showPercentWarning && (
        <div className="mb-2 p-2 bg-yellow-100 border-l-4 border-yellow-400 rounded text-gray-700">
          <strong>Warning:</strong> The sum of your meal percentages is {percentSum}%. It should equal 100%.
        </div>
      )}
      {showMacroWarning && (
        <div className="mb-2 p-2 bg-yellow-100 border-l-4 border-yellow-400 rounded text-gray-700">
          <strong>Warning:</strong> The sum of your meal macros does not match your daily macro targets.
        </div>
      )}
      {/* Per-meal breakdown */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-gray-700 border mt-2">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-2 py-1 font-semibold">Meal</th>
              <th className="px-2 py-1 font-semibold">% of Day</th>
              <th className="px-2 py-1 font-semibold">Calories</th>
              <th className="px-2 py-1 font-semibold">Protein (g)</th>
              <th className="px-2 py-1 font-semibold">Carbs (g)</th>
              <th className="px-2 py-1 font-semibold">Fat (g)</th>
            </tr>
          </thead>
          <tbody>
            {perMeal.map((meal, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-2 py-1">{meals[idx]?.name || `Meal ${idx + 1}`}</td>
                <td className="px-2 py-1">{distributionMode === 'custom-macros' ? '-' : meal.percent + '%'}</td>
                <td className="px-2 py-1">{meal.calories}</td>
                <td className="px-2 py-1">{meal.protein}</td>
                <td className="px-2 py-1">{meal.carbs}</td>
                <td className="px-2 py-1">{meal.fat}</td>
              </tr>
            ))}
            {distributionMode === 'custom-macros' && (
              <>
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-2 py-1">Total</td>
                  <td className="px-2 py-1">-</td>
                  <td className="px-2 py-1">{caloriesSum}</td>
                  <td className="px-2 py-1">{macroSum.protein}</td>
                  <td className="px-2 py-1">{macroSum.carbs}</td>
                  <td className="px-2 py-1">{macroSum.fat}</td>
                </tr>
                {/* Needed row */}
                <tr className="bg-yellow-50 font-semibold text-yellow-700">
                  <td className="px-2 py-1">Needed</td>
                  <td className="px-2 py-1">-</td>
                  <td className="px-2 py-1">
                    {(() => {
                      const diff = Math.round((calorieTarget || 0) - caloriesSum);
                      return diff === 0 ? '0' : diff > 0 ? `+${diff}` : `${diff}`;
                    })()}
                  </td>
                  <td className="px-2 py-1">
                    {(() => {
                      const target = Math.round(macroTotals.protein || 0);
                      const diff = target - Math.round(macroSum.protein);
                      return diff === 0 ? '0' : diff > 0 ? `+${diff}` : `${diff}`;
                    })()}
                  </td>
                  <td className="px-2 py-1">
                    {(() => {
                      const target = Math.round(macroTotals.carbs || 0);
                      const diff = target - Math.round(macroSum.carbs);
                      return diff === 0 ? '0' : diff > 0 ? `+${diff}` : `${diff}`;
                    })()}
                  </td>
                  <td className="px-2 py-1">
                    {(() => {
                      const target = Math.round(macroTotals.fat || 0);
                      const diff = target - Math.round(macroSum.fat);
                      return diff === 0 ? '0' : diff > 0 ? `+${diff}` : `${diff}`;
                    })()}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NutritionUserSettings;
