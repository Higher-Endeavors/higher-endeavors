import { useState } from 'react';
import Section from '(protected)/tools/fitness/plan/components/Section';
import Toggle from '(protected)/tools/fitness/plan/components/Toggle';
import Chip from '(protected)/tools/fitness/plan/components/Chip';

interface TopBarProps {
  onSave: () => void;
  planName: string;
  totalWeeks: number;
}

export default function TopBar({ onSave, planName, totalWeeks }: TopBarProps) {
  const [scenarioCompare, setScenarioCompare] = useState(false);

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
            </div>
            <Toggle 
              checked={scenarioCompare} 
              onChange={setScenarioCompare} 
              label="Scenario Compare" 
            />
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
    </>
  );
}
