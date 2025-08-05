import { useState } from 'react';

export default function DateSelector() {
  const [date, setDate] = useState(() => {
    // Default to today in YYYY-MM-DD format
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const setToday = () => {
    const today = new Date();
    setDate(today.toISOString().split('T')[0]);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="nutrition-date" className="text-sm font-medium text-gray-700">
        Date:
      </label>
      <input
        id="nutrition-date"
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        className="rounded border border-gray-300 px-2 py-1 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
        style={{ height: '2.25rem' }} // Match UserSelector height if needed
      />
      <button
        type="button"
        onClick={setToday}
        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 border border-blue-200"
        style={{ height: '2.25rem' }} // Match UserSelector height if needed
      >
        Today
      </button>
    </div>
  );
}