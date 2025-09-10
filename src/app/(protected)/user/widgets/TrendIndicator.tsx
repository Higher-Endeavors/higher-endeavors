import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import type { TrendIndicatorProps } from './types';

export default function TrendIndicator({ 
  trend, 
  value, 
  className = '' 
}: TrendIndicatorProps) {
  const getIcon = () => {
    switch (trend) {
      case 'up':
        return <FaArrowUp className="w-3 h-3" />;
      case 'down':
        return <FaArrowDown className="w-3 h-3" />;
      default:
        return <FaMinus className="w-3 h-3" />;
    }
  };

  const getColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-slate-500';
    }
  };

  return (
    <div className={`flex items-center gap-1 text-xs ${getColor()} ${className}`}>
      {getIcon()}
      <span>{value}</span>
    </div>
  );
}
