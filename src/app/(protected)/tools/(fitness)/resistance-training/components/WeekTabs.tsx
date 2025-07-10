interface WeekTabsProps {
  activeWeek: number;
  programLength: number;
  onWeekChange: (weekNumber: number) => void;
}

export default function WeekTabs({ activeWeek, programLength, onWeekChange }: WeekTabsProps) {
  return (
    <div className="mt-8 border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-4" aria-label="Week selection">
        {Array.from({ length: programLength }, (_, i) => i + 1).map((week) => (
          <button
            key={week}
            onClick={() => onWeekChange(week)}
            className={`
              whitespace-nowrap pb-4 px-4 border-b-2 font-medium text-sm
              ${activeWeek === week
                ? 'border-purple-500 text-purple-600 dark:text-purple-400 dark:border-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
              }
            `}
            type="button"
          >
            Week {week}
          </button>
        ))}
      </nav>
    </div>
  );
} 