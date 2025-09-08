'use client';

import { useEnvironment } from '../context/EnvironmentContext';

interface EnvironmentIndicatorProps {
  className?: string;
  showInProduction?: boolean;
}

export default function EnvironmentIndicator({ 
  className = '', 
  showInProduction = false 
}: EnvironmentIndicatorProps) {
  const { environment, isQA, isDevelopment, isProduction } = useEnvironment();

  // Don't show in production unless explicitly requested
  if (isProduction && !showInProduction) {
    return null;
  }

  const getEnvironmentColor = () => {
    if (isQA) return 'bg-red-500 text-white';
    if (isDevelopment) return 'bg-teal-500 text-white';
    if (isProduction) return 'bg-green-500 text-white';
    return 'bg-gray-500 text-white';
  };

  const getEnvironmentText = () => {
    if (isQA) return 'QA';
    if (isDevelopment) return 'DEV';
    if (isProduction) return 'PROD';
    return environment.toUpperCase();
  };

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-mono font-bold ${getEnvironmentColor()} ${className}`}>
      {getEnvironmentText()}
    </div>
  );
}
