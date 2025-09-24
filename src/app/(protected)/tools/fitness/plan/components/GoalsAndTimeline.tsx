import Link from 'next/link';
import Section from '(protected)/tools/fitness/plan/components/Section';
import Chip from '(protected)/tools/fitness/plan/components/Chip';

// Mock data - in real implementation, this would come from Goal Tracker API
const mockGoals = [
  {
    id: 1,
    name: "Chicago Marathon 2025",
    category: "Fitness",
    targetDate: "2025-11-10",
    priority: "A",
    status: "active",
    progress: 35,
    metrics: [
      { label: "Target Time", value: "3:30:00" },
      { label: "Current 5K", value: "22:45" }
    ]
  },
  {
    id: 2,
    name: "Base Building Phase",
    category: "Fitness", 
    targetDate: "2025-06-15",
    priority: "B",
    status: "active",
    progress: 60,
    metrics: [
      { label: "Weekly Volume", value: "8.5h" },
      { label: "Z2 Target", value: "80%" }
    ]
  },
  {
    id: 3,
    name: "Weight Management",
    category: "Health",
    targetDate: "2025-08-01", 
    priority: "C",
    status: "active",
    progress: 25,
    metrics: [
      { label: "Target Weight", value: "165 lbs" },
      { label: "Current", value: "172 lbs" }
    ]
  }
];

export default function GoalsAndTimeline() {
  const activeGoals = mockGoals.filter(goal => goal.status === 'active');
  const primaryGoal = activeGoals.find(goal => goal.priority === 'A');
  const secondaryGoals = activeGoals.filter(goal => goal.priority !== 'A');

  return (
    <Section 
      title="Goals & Timeline" 
      subtitle="Active goals from Goal Tracker"
    >
      <div className="space-y-4">
        {/* Primary Goal */}
        {primaryGoal && (
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm text-slate-900">{primaryGoal.name}</h4>
              <Chip label={primaryGoal.priority} kind="ok" />
            </div>
            <div className="text-xs text-slate-600 mb-2">
              Target: {new Date(primaryGoal.targetDate).toLocaleDateString()}
            </div>
            <div className="space-y-1">
              {primaryGoal.metrics.map((metric, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="text-slate-500">{metric.label}:</span>
                  <span className="text-slate-700 font-medium">{metric.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Progress</span>
                <span>{primaryGoal.progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div 
                  className="bg-sky-500 h-1.5 rounded-full" 
                  style={{ width: `${primaryGoal.progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Secondary Goals */}
        {secondaryGoals.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-slate-600">Supporting Goals</h5>
            {secondaryGoals.map(goal => (
              <div key={goal.id} className="border border-slate-200 rounded-md p-2 bg-white">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-800">{goal.name}</span>
                  <Chip label={goal.priority} />
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(goal.targetDate).toLocaleDateString()} • {goal.progress}% complete
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create New Goal Link */}
        <div className="pt-2 border-t border-slate-200">
          <Link 
            href="/tools/goal-tracker"
            className="flex items-center gap-2 text-xs text-sky-600 hover:text-sky-700 font-medium"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Goal
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-900">{activeGoals.length}</div>
            <div className="text-xs text-slate-500">Active Goals</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-900">
              {primaryGoal ? Math.round((new Date(primaryGoal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0}
            </div>
            <div className="text-xs text-slate-500">Days to Target</div>
          </div>
        </div>
      </div>
    </Section>
  );
}
