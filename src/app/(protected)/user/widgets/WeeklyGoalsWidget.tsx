// import { FaBullseye } from 'react-icons/fa';

interface GoalData {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

interface WeeklyGoalsWidgetProps {
  className?: string;
  onClick?: () => void;
}

export default function WeeklyGoalsWidget({ 
  className = '',
  onClick 
}: WeeklyGoalsWidgetProps) {
  const goals: GoalData[] = [
    {
      id: 'workouts',
      name: 'Workouts',
      current: 4,
      target: 5,
      unit: 'sessions',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800'
    },
    {
      id: 'volume',
      name: 'Volume',
      current: 245,
      target: 300,
      unit: 'min',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800'
    },
    {
      id: 'zones',
      name: 'Zone 2 Time',
      current: 135,
      target: 120,
      unit: 'min',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-800'
    }
  ];

  const overallProgress = Math.round(
    goals.reduce((sum, goal) => sum + (goal.current / goal.target), 0) / goals.length * 100
  );

  const getStatusColor = () => {
    if (overallProgress >= 100) return 'text-green-600';
    if (overallProgress >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBgColor = () => {
    if (overallProgress >= 100) return 'bg-green-50';
    if (overallProgress >= 80) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const getStatusBorderColor = () => {
    if (overallProgress >= 100) return 'border-green-200';
    if (overallProgress >= 80) return 'border-yellow-200';
    return 'border-red-200';
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 ${getStatusBgColor()} ${getStatusBorderColor()} hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 ${getStatusColor()} flex items-center justify-center`}>
            🎯
          </div>
          <h4 className={`text-sm font-medium ${getStatusColor()}`}>
            Weekly Goals
          </h4>
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
            Demo Data
          </span>
        </div>
        <div className="text-xs text-slate-600">
          {overallProgress}% Complete
        </div>
      </div>

      {/* Individual goals */}
      <div className="space-y-3">
        {goals.map((goal) => {
          const percentage = Math.round((goal.current / goal.target) * 100);
          
          return (
            <div key={goal.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">{goal.name}</span>
                <span className={`${goal.textColor} font-medium`}>
                  {goal.current}/{goal.target} {goal.unit}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div 
                  className={`${goal.color.replace('text-', 'bg-')} h-1.5 rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall progress */}
      <div className="mt-3 pt-2 border-t border-slate-200">
        <div className="flex justify-between text-xs text-slate-600 mb-1">
          <span>Overall Progress</span>
          <span>{overallProgress}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className={`${getStatusColor().replace('text-', 'bg-')} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(overallProgress, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
