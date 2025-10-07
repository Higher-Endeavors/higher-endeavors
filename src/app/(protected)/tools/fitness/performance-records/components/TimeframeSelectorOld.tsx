interface TimeframeSelectorOldProps {
  selectedTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
}

const timeframeOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'year', label: 'Last Year' },
  { value: '6month', label: 'Last 6 Months' },
  { value: '3month', label: 'Last 3 Months' },
  { value: 'month', label: 'Last Month' },
  { value: 'week', label: 'Last Week' }
];

export default function TimeframeSelectorOld({ selectedTimeframe, onTimeframeChange }: TimeframeSelectorOldProps) {
  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="timeframe" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Timeframe:
      </label>
      <select
        id="timeframe"
        value={selectedTimeframe}
        onChange={(e) => onTimeframeChange(e.target.value)}
        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-200 dark:text-gray-900 dark:border-gray-600 text-sm"
      >
        {timeframeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
