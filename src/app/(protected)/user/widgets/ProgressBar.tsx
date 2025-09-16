import type { ProgressBarProps } from './types';

export default function ProgressBar({
  current,
  target,
  unit = '',
  color = 'bg-blue-500',
  showPercentage = true,
  className = ''
}: ProgressBarProps) {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div className={`mt-3 ${className}`}>
      <div className="flex justify-between text-xs text-slate-600 mb-1">
        <span>Goal: {target.toLocaleString()}{unit}</span>
        {showPercentage && (
          <span>{Math.round(percentage)}%</span>
        )}
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div 
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
