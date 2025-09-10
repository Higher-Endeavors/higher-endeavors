import { useState } from 'react';

const planOptions = [
  { value: 'standard', label: 'Standard' },
  { value: 'rest', label: 'Rest Day' },
  { value: 'sick', label: 'Sick Day' },
  { value: 'high_activity', label: 'High Activity' },
  { value: 'custom', label: 'Custom' },
];

// Placeholder: fetch this from user settings/context in the future
const placeholderDefaultMealSchedule = [
  { name: 'Breakfast', time: '08:00' },
  { name: 'Lunch', time: '12:00' },
  { name: 'Snack', time: '15:00' },
  { name: 'Dinner', time: '18:30' },
];

export default function DailyNutritionSettings() {
  const [plan, setPlan] = useState('standard');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [mealSchedule, setMealSchedule] = useState(
    placeholderDefaultMealSchedule.map(meal => ({ ...meal }))
  );
  const [notes, setNotes] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  // Meal schedule handlers
  const handleMealNameChange = (idx: number, value: string) => {
    setMealSchedule(mealSchedule.map((meal, i) => i === idx ? { ...meal, name: value } : meal));
  };
  const handleMealTimeChange = (idx: number, value: string) => {
    setMealSchedule(mealSchedule.map((meal, i) => i === idx ? { ...meal, time: value } : meal));
  };
  const handleAddMeal = () => {
    setMealSchedule([...mealSchedule, { name: '', time: '' }]);
  };
  const handleRemoveMeal = (idx: number) => {
    setMealSchedule(mealSchedule.filter((_, i) => i !== idx));
  };
  // Simple up/down reordering (replace with dnd-kit in future)
  const handleMoveMeal = (idx: number, direction: 'up' | 'down') => {
    const newSchedule = [...mealSchedule];
    if (direction === 'up' && idx > 0) {
      [newSchedule[idx - 1], newSchedule[idx]] = [newSchedule[idx], newSchedule[idx - 1]];
    } else if (direction === 'down' && idx < newSchedule.length - 1) {
      [newSchedule[idx + 1], newSchedule[idx]] = [newSchedule[idx], newSchedule[idx + 1]];
    }
    setMealSchedule(newSchedule);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: Save logic here
    alert('Settings saved (placeholder)');
  };

  return (
    <div className="mt-8 p-4 border rounded-lg bg-gray-50">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Daily Nutrition Settings</h2>
        <button
          className="text-gray-500 hover:text-gray-700 focus:outline-none transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          aria-label={isOpen ? 'Collapse Daily Nutrition Settings' : 'Expand Daily Nutrition Settings'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
      {isOpen && (
        <form className="space-y-4" onSubmit={handleSave}>
          {/* Plan Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nutrition Plan</label>
            <select
              value={plan}
              onChange={e => setPlan(e.target.value)}
              className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
            >
              {planOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {/* Custom Calorie/Macro Targets - visible for all plans except 'standard' */}
          {plan !== 'standard' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
                <input
                  type="number"
                  min={0}
                  value={calories}
                  onChange={e => setCalories(e.target.value)}
                  className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Protein (g)</label>
                <input
                  type="number"
                  min={0}
                  value={protein}
                  onChange={e => setProtein(e.target.value)}
                  className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carbs (g)</label>
                <input
                  type="number"
                  min={0}
                  value={carbs}
                  onChange={e => setCarbs(e.target.value)}
                  className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fat (g)</label>
                <input
                  type="number"
                  min={0}
                  value={fat}
                  onChange={e => setFat(e.target.value)}
                  className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
                />
              </div>
            </div>
          )}
          {/* Meal Schedule - editable for the day */}
          <div className="mt-4 p-4 border rounded-lg bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-700">Meal Schedule</span>
              <button
                type="button"
                onClick={handleAddMeal}
                className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium"
              >
                Add Meal
              </button>
            </div>
            {mealSchedule.length === 0 && (
              <div className="text-gray-700">No meals added yet.</div>
            )}
            {mealSchedule.map((meal, idx) => (
              <div key={idx} className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                <input
                  type="text"
                  value={meal.name}
                  onChange={e => handleMealNameChange(idx, e.target.value)}
                  placeholder={`Meal ${idx + 1}`}
                  className="flex-1 px-2 py-1 rounded border border-gray-300 text-gray-700"
                />
                <input
                  type="time"
                  value={meal.time || ''}
                  onChange={e => handleMealTimeChange(idx, e.target.value)}
                  className="px-2 py-1 rounded border border-gray-300 text-gray-700"
                />
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveMeal(idx, 'up')}
                    className="px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                    disabled={idx === 0}
                    aria-label="Move meal up"
                  >↑</button>
                  <button
                    type="button"
                    onClick={() => handleMoveMeal(idx, 'down')}
                    className="px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                    disabled={idx === mealSchedule.length - 1}
                    aria-label="Move meal down"
                  >↓</button>
                  <button
                    type="button"
                    onClick={() => handleRemoveMeal(idx)}
                    className="px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                    aria-label="Remove meal"
                  >Remove</button>
                </div>
              </div>
            ))}
            {/* TODO: Replace up/down with dnd-kit drag-and-drop in the future */}
          </div>
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="block w-full rounded border border-gray-300 text-gray-700 px-2 py-2"
              rows={2}
              placeholder="Any special instructions or context for today..."
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium shadow"
            >
              Save
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
