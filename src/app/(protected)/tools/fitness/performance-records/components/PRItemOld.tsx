import type { PerformanceRecord } from '../lib/performance-records.zod';

interface PRItemOldProps {
  record: PerformanceRecord;
  exerciseName: string;
}

export default function PRItemOld({ record, exerciseName }: PRItemOldProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white border rounded-lg p-4 mb-2 hover:shadow-md transition-shadow relative group">
      {/* Top row: Reps and Load */}
      <div className="flex items-center justify-between">
        <span className="text-gray-600 dark:text-slate-900 font-semibold">
          {record.repCount} rep{record.repCount !== 1 ? 's' : ''}
        </span>
        <span className="font-medium dark:text-slate-900">
          {record.maxLoad} {record.loadUnit}
        </span>
      </div>
      {/* Bottom row: Date and Program */}
      <div className="mt-3 border-t pt-3 flex justify-between items-center">
        <span className="text-sm text-gray-500 dark:text-slate-600">
          {formatDate(record.date)}
        </span>
        <div className="text-sm text-gray-600">
          <span className="font-medium dark:text-slate-900">Program: </span>
          <span className="dark:text-slate-900">{record.programName}</span>
        </div>
      </div>
    </div>
  );
}
