import { useState } from 'react';

// Placeholder: fetch these from user state/db in the future
const PLACEHOLDER_BODYWEIGHT_KG = 75; // TODO: fetch from user profile
const PLACEHOLDER_PREFERRED_UNIT = 'oz'; // 'oz' or 'ml', TODO: fetch from user settings

const OZ_PER_KG = 1;
const ML_PER_OZ = 29.5735;

const unitOptions = [
  { value: 'oz', label: 'Ounces (oz)' },
  { value: 'ml', label: 'Milliliters (mL)' },
];

export default function HydrationTracker() {
  // State
  const [unit, setUnit] = useState<string>(PLACEHOLDER_PREFERRED_UNIT);
  const [inputAmount, setInputAmount] = useState('');
  const [entries, setEntries] = useState<{ amount: number; unit: string }[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  // Calculate goal in preferred unit
  const goalOz = PLACEHOLDER_BODYWEIGHT_KG * OZ_PER_KG;
  const goal = unit === 'oz' ? goalOz : Math.round(goalOz * ML_PER_OZ);

  // Calculate total for today in preferred unit
  const totalInPreferredUnit = entries.reduce((sum, entry) => {
    if (unit === entry.unit) return sum + entry.amount;
    // Convert as needed
    if (unit === 'oz' && entry.unit === 'ml') return sum + entry.amount / ML_PER_OZ;
    if (unit === 'ml' && entry.unit === 'oz') return sum + entry.amount * ML_PER_OZ;
    return sum;
  }, 0);

  // Progress percent
  const progress = Math.min((totalInPreferredUnit / goal) * 100, 100);

  // Add entry handler
  const handleAdd = () => {
    const amt = parseFloat(inputAmount);
    if (!amt || amt <= 0) return;
    setEntries([...entries, { amount: amt, unit }]);
    setInputAmount('');
  };

  return (
    <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6 mb-4">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-900">Hydration Tracker</h2>
        <button
          className="text-gray-500 hover:text-gray-700 focus:outline-none transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          aria-label={isOpen ? 'Collapse Hydration Tracker' : 'Expand Hydration Tracker'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
      {isOpen && (
        <div>
          <div className="mb-2 text-sm text-gray-600 dark:text-gray-700">
            <span className="font-medium">Goal:</span> {goal} {unit} &nbsp;
            <span className="text-xs">(1 oz per kg, bodyweight: {PLACEHOLDER_BODYWEIGHT_KG} kg)</span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <input
              type="number"
              min="0"
              step="any"
              value={inputAmount}
              onChange={e => setInputAmount(e.target.value)}
              placeholder={`Add amount (${unit})`}
              className="w-28 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
            />
            <select
              value={unit}
              onChange={e => setUnit(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
            >
              {unitOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAdd}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
          <div className="mb-2 text-gray-700 dark:text-gray-900">
            <span className="font-medium">Total today:</span> {totalInPreferredUnit.toFixed(0)} {unit}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div
              className="bg-blue-500 h-4 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-700">
            {progress.toFixed(0)}% of goal
          </div>
          <div className="mt-4 text-xs text-gray-400">
            {/* TODO: Fetch user bodyweight and preferred hydration unit from user profile/settings */}
          </div>
          {entries.length > 0 && (
            <div className="mt-4">
              <div className="text-xs font-semibold text-gray-700 mb-1">Today's Entries:</div>
              <ul className="text-xs text-gray-600 space-y-1">
                {entries.map((entry, idx) => (
                  <li key={idx}>
                    +{entry.amount} {entry.unit}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
