interface DayTabsProps {
  activeDay: number;
  programLength: number;
  sessionsPerWeek: number;
  onDayChange: (dayNumber: number) => void;
}

export default function DayTabs({ activeDay, programLength, sessionsPerWeek, onDayChange }: DayTabsProps) {
  const totalDays = Math.ceil(programLength * sessionsPerWeek);

  // Helper function to get week and session info for a given day
  const getDayInfo = (dayNumber: number) => {
    const weekNumber = Math.ceil(dayNumber / sessionsPerWeek);
    const sessionInWeek = ((dayNumber - 1) % sessionsPerWeek) + 1;
    return { weekNumber, sessionInWeek };
  };

  // Helper function to determine program type (A or B) for alternating patterns
  const getProgramType = (dayNumber: number) => {
    if (sessionsPerWeek === 1.5) {
      // For 1.5 sessions per week, alternate A/B/A, B/A/B pattern
      const weekNumber = Math.ceil(dayNumber / sessionsPerWeek);
      const sessionInWeek = ((dayNumber - 1) % sessionsPerWeek) + 1;
      
      // Week 1: A/B/A, Week 2: B/A/B, Week 3: A/B/A, etc.
      const isWeekOdd = weekNumber % 2 === 1;
      const isSessionOdd = sessionInWeek % 2 === 1;
      
      if (isWeekOdd) {
        return isSessionOdd ? 'A' : 'B';
      } else {
        return isSessionOdd ? 'B' : 'A';
      }
    }
    return null; // No alternating pattern for whole numbers
  };

  return (
    <div className="mt-8 border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Day selection">
        {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
          const { weekNumber, sessionInWeek } = getDayInfo(day);
          const programType = getProgramType(day);
          
          return (
            <button
              key={day}
              onClick={() => onDayChange(day)}
              className={`
                whitespace-nowrap pb-4 px-4 border-b-2 font-medium text-sm flex-shrink-0
                ${activeDay === day
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400 dark:border-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
                }
              `}
              type="button"
            >
              Day {day}
              <div className="text-xs opacity-75">
                W{weekNumber}S{sessionInWeek}
                {programType && (
                  <span className={`ml-1 px-1 py-0.5 rounded text-xs ${
                    programType === 'A' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {programType}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
} 