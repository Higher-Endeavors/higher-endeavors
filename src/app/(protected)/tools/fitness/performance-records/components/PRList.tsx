import ExercisePRCard from "./ExercisePRCard";
import type { ExercisePerformanceRecords } from '../lib/performance-records.zod';

interface PRListProps {
  records: ExercisePerformanceRecords;
  isLoading?: boolean;
  error?: string | null;
}

export default function PRList({ records, isLoading, error }: PRListProps) {
  if (isLoading) {
    return (
      <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6 mb-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-600 dark:text-slate-600">Loading performance records...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6 mb-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-red-600 dark:text-red-400">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!records || Object.keys(records).length === 0) {
    return (
      <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6 mb-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-600 dark:text-slate-600">No performance records found. Start logging your workouts to see your personal records!</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(records).map(([exerciseName, exerciseRecords]) => (
        <ExercisePRCard 
          key={exerciseName}
          exerciseName={exerciseName}
          records={exerciseRecords}
        />
      ))}
    </div>
  );
}