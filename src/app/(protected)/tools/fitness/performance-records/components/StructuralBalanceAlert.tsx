import type { StructuralBalanceImbalance } from '../lib/hooks/useStructuralBalanceAnalysis';

interface StructuralBalanceAlertProps {
  imbalances: StructuralBalanceImbalance[];
  exerciseName: string;
}

export default function StructuralBalanceAlert({ imbalances, exerciseName }: StructuralBalanceAlertProps) {
  if (!imbalances || imbalances.length === 0) {
    return null;
  }

  const getSeverityColor = (severity: 'yellow' | 'red') => {
    switch (severity) {
      case 'yellow':
        return 'bg-yellow-100 border-yellow-400 text-yellow-900 dark:bg-yellow-900/30 dark:border-yellow-600 dark:text-yellow-100';
      case 'red':
        return 'bg-red-100 border-red-400 text-red-900 dark:bg-red-900/30 dark:border-red-600 dark:text-red-100';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-900 dark:bg-gray-900/30 dark:border-gray-600 dark:text-gray-100';
    }
  };

  const getSeverityIcon = (severity: 'yellow' | 'red') => {
    switch (severity) {
      case 'yellow':
        return '⚠️';
      case 'red':
        return '🚨';
      default:
        return 'ℹ️';
    }
  };

  const formatRatio = (ratio: number) => {
    return ratio.toFixed(2);
  };

  const formatDeviation = (deviation: number) => {
    return `${deviation.toFixed(1)}%`;
  };

  const formatLoad = (load: number) => {
    if (Number.isInteger(load)) {
      return load.toString();
    }

    return load.toFixed(1);
  };

  const computeIdealLoad = (idealRatio: number, comparedLoad: number, loadUnit: string) => {
    const idealLoad = idealRatio * comparedLoad;

    if (loadUnit.toLowerCase() !== 'lb' && loadUnit.toLowerCase() !== 'lbs') {
      return formatLoad(idealLoad);
    }

    const roundedToNearestFive = Math.round(idealLoad / 5) * 5;
    return formatLoad(roundedToNearestFive);
  };

  return (
    <div className="mt-4 space-y-2">
      <div className="text-sm font-medium text-gray-700 dark:text-gray-600 mb-2">
        Structural Balance Alerts
      </div>
      {imbalances.map((imbalance, index) => (
        <div
          key={`${imbalance.comparedExercise}-${imbalance.repCount}-${index}`}
          className={`p-3 rounded-lg border text-sm ${getSeverityColor(imbalance.severity)}`}
        >
          <div className="flex items-start space-x-2">
            <span className="text-lg flex-shrink-0">
              {getSeverityIcon(imbalance.severity)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-medium">
                vs {imbalance.comparedExercise} ({imbalance.repCount} reps)
              </div>
              <div className="text-xs mt-1 space-y-1">
                <div>
                  <span className="font-medium">Your ratio:</span> {formatRatio(imbalance.actualRatio)} 
                  <span className="text-xs opacity-75 ml-1">
                    ({imbalance.userLoad} {imbalance.loadUnit} ÷ {imbalance.comparedLoad} {imbalance.loadUnit})
                  </span>
                </div>
                <div>
                  <span className="font-medium">Ideal ratio:</span> {formatRatio(imbalance.idealRatio)}
                </div>
                <div>
                  <span className="font-medium">Ideal load:</span> {computeIdealLoad(imbalance.idealRatio, imbalance.comparedLoad, imbalance.loadUnit)} {imbalance.loadUnit}
                </div>
                <div>
                  <span className="font-medium">Deviation:</span> {formatDeviation(imbalance.deviation)}
                  {imbalance.deviation >= 20 ? ' (Significant imbalance)' : ' (Minor imbalance)'}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
