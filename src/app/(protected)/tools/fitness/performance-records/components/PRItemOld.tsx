import type { PerformanceRecord } from '../lib/performance-records.zod';
import type { StructuralBalanceImbalance } from '../lib/hooks/useStructuralBalanceAnalysis';
import StructuralBalanceAlert from './StructuralBalanceAlert';

interface PRItemOldProps {
  record: PerformanceRecord;
  exerciseName: string;
  imbalances?: StructuralBalanceImbalance[];
}

export default function PRItemOld({ record, exerciseName, imbalances = [] }: PRItemOldProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter imbalances for this specific rep count
  const repCountImbalances = imbalances.filter(imbalance => imbalance.repCount === record.repCount);

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow relative group">
      {/* Performance data above divider - single row for non-small devices */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4">
        <div>
          <span className="text-gray-600 dark:text-slate-900 font-semibold">
            {record.repCount} rep{record.repCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div>
          <span className="font-medium dark:text-slate-900">
            {record.maxLoad} {record.loadUnit}
          </span>
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-slate-600">
            {formatDate(record.date)}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium dark:text-slate-900">Program: </span>
          <span className="dark:text-slate-900">{record.programName}</span>
        </div>
      </div>
      
      {/* Divider line before structural balance alerts */}
      {repCountImbalances.length > 0 && (
        <div className="border-t border-gray-300 dark:border-gray-600 pt-4 mt-4">
          {/* Structural Balance Alerts for this specific rep count */}
          <StructuralBalanceAlert 
            imbalances={repCountImbalances} 
            exerciseName={exerciseName} 
          />
        </div>
      )}
    </div>
  );
}
