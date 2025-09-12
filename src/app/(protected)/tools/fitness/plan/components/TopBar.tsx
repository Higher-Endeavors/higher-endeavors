import { useState } from 'react';
import Section from './Section';
import Toggle from './Toggle';
import Chip from './Chip';

interface TopBarProps {
  onSave: () => void;
  planName: string;
  totalWeeks: number;
  startDate?: Date;
  onPlanConfigChange?: (config: { startDate: Date; totalWeeks: number; startDayOfWeek: number }) => void;
}

export default function TopBar({ onSave, planName, totalWeeks, startDate, onPlanConfigChange }: TopBarProps) {
  const [scenarioCompare, setScenarioCompare] = useState(false);
  const [showPlanConfig, setShowPlanConfig] = useState(false);

  return (
    <>
      <Section 
        title="Fitness Planning Dashboard" 
        subtitle="Plan → Program → Act → Analyze"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">Plan Profile</span>
              <select className="text-sm text-slate-700 border rounded-md px-2 py-1">
                <option>{planName}</option>
                <option>Base Season</option>
                <option>Custom</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Chip label={`${totalWeeks} weeks`} kind="info" />
              {startDate && (
                <Chip 
                  label={`Starts ${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`} 
                  kind="info" 
                />
              )}
            </div>
            <Toggle 
              checked={scenarioCompare} 
              onChange={setScenarioCompare} 
              label="Scenario Compare" 
            />
            <button
              onClick={() => setShowPlanConfig(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm shadow transition-colors"
            >
              Plan Setup
            </button>
            <button
              onClick={onSave}
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm shadow transition-colors"
            >
              Save Plan
            </button>
            <a
              href="/tools/fitness/plan/settings"
              className="px-3 py-1.5 rounded-xl bg-white border hover:bg-slate-50 text-slate-700 text-sm transition-colors"
            >
              Settings
            </a>
          </div>
        </div>
      </Section>

      {/* SCENARIO COMPARE DRAWER (overlay for demo) */}
      {scenarioCompare && (
        <div className="fixed inset-0 bg-black/30 grid place-items-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Scenario Compare</div>
                <div className="text-xs text-slate-500">Polarized vs Pyramidal — weekly volume & TIZ deltas</div>
              </div>
              <button 
                className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-sm" 
                onClick={() => setScenarioCompare(false)}
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {["Polarized","Pyramidal"].map((name) => (
                <div key={name} className="rounded-2xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-sky-500" />
                    <div className="text-sm font-medium">{name}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-slate-500">Total Volume (peak)</div>
                    <div className="text-right text-slate-800">540m</div>
                    <div className="text-slate-500">Z1–2</div>
                    <div className="text-right text-slate-800">~80%</div>
                    <div className="text-slate-500">Z3</div>
                    <div className="text-right text-slate-800">~12%</div>
                    <div className="text-slate-500">Z4–5</div>
                    <div className="text-right text-slate-800">~8%</div>
                  </div>
                  <div className="mt-4 grid grid-cols-8 gap-1">
                    {Array.from({ length: 16 }, (_, i) => (
                      <div key={i} className="h-3 rounded bg-slate-200 overflow-hidden">
                        <div className="h-full bg-sky-400" style={{ width: `${40 + (i * 3)}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PLAN CONFIGURATION MODAL */}
      {showPlanConfig && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Plan Configuration</h3>
              <button
                onClick={() => setShowPlanConfig(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <PlanConfigForm 
              onSave={(config) => {
                onPlanConfigChange?.(config);
                setShowPlanConfig(false);
              }}
              onCancel={() => setShowPlanConfig(false)}
              currentStartDate={startDate}
              currentTotalWeeks={totalWeeks}
            />
          </div>
        </div>
      )}
    </>
  );
}

// Plan Configuration Form Component
function PlanConfigForm({ onSave, onCancel, currentStartDate, currentTotalWeeks }: { 
  onSave: (config: { startDate: Date; totalWeeks: number; startDayOfWeek: number }) => void; 
  onCancel: () => void;
  currentStartDate?: Date;
  currentTotalWeeks?: number;
}) {
  const [startDate, setStartDate] = useState(
    currentStartDate ? currentStartDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [totalWeeks, setTotalWeeks] = useState(currentTotalWeeks || 24);
  const [startDayOfWeek, setStartDayOfWeek] = useState(1); // Monday = 1, Sunday = 0

  const dayOptions = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  // Calculate the actual start date that will be used
  const calculateActualStartDate = () => {
    const selectedDate = new Date(startDate);
    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysToSubtract = (dayOfWeek - startDayOfWeek + 7) % 7;
    
    const actualStartDate = new Date(selectedDate);
    actualStartDate.setDate(selectedDate.getDate() - daysToSubtract);
    return actualStartDate;
  };

  const actualStartDate = calculateActualStartDate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      startDate: new Date(startDate),
      totalWeeks,
      startDayOfWeek
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          Plan Start Date
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          Plan Duration (weeks)
        </label>
        <input
          type="number"
          min="1"
          max="52"
          value={totalWeeks}
          onChange={(e) => setTotalWeeks(parseInt(e.target.value) || 24)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          Week Starts On
        </label>
        <select
          value={startDayOfWeek}
          onChange={(e) => setStartDayOfWeek(parseInt(e.target.value))}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
        >
          {dayOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Preview of actual start date */}
      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
        <div className="text-sm font-medium text-slate-700 mb-1">Plan will start on:</div>
        <div className="text-lg font-semibold text-slate-800">
          {actualStartDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Week 1 will begin on this date
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          Update Plan
        </button>
      </div>
    </form>
  );
}
