'use client';

import { useState } from 'react';
import CMEUnifiedChart from '(protected)/tools/fitness/cardiometabolic-training/analyze/components/cme-unified-chart';
import type { SessionSeries } from '(protected)/tools/fitness/cardiometabolic-training/analyze/lib/hooks/use-cme-series';

type AnalysisMode = 'summary' | 'trends';
type TrendType = 'hrToPace';
type PaceUnit = 'min/mi' | 'min/km';

export default function CMEUnifiedAnalysis({ series = [] as SessionSeries[], initialPaceUnit = 'min/mi' as PaceUnit }: { series?: SessionSeries[]; initialPaceUnit?: PaceUnit }) {
  const [mode, setMode] = useState<AnalysisMode>('summary');
  const [trendType, setTrendType] = useState<TrendType>('hrToPace');
  const [fixedHr, setFixedHr] = useState<number>(150);
  const [paceUnit, setPaceUnit] = useState<PaceUnit>(initialPaceUnit);
  const [showHr, setShowHr] = useState(true);
  const [showPace, setShowPace] = useState(true);
  const [showCadence, setShowCadence] = useState(false);
  const [showElev, setShowElev] = useState(false);
  const [showPower, setShowPower] = useState(false);

  return (
    <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-900">Analysis</h3>
          <select
            className="rounded border border-gray-300 dark:border-slate-400 bg-white text-gray-900 dark:text-slate-900 px-2 py-1 text-sm"
            value={mode}
            onChange={(e) => setMode(e.target.value as AnalysisMode)}
          >
            <option value="summary">Summary</option>
            <option value="trends">Trends</option>
          </select>
        </div>

        {mode === 'trends' && (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-800">
              <span>Trend</span>
              <select
                className="rounded border border-gray-300 dark:border-slate-400 bg-white text-gray-900 dark:text-slate-900 px-2 py-1"
                value={trendType}
                onChange={(e) => setTrendType(e.target.value as TrendType)}
              >
                <option value="hrToPace">HR → Pace</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-800">
              <span>Fixed HR</span>
              <input
                type="number"
                min={60}
                max={220}
                step={1}
                value={fixedHr}
                onChange={(e) => setFixedHr(Number(e.target.value))}
                className="w-20 rounded border border-gray-300 dark:border-slate-400 bg-white text-gray-900 dark:text-slate-900 px-2 py-1"
              />
              <span>bpm</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-800">
              <span>Pace</span>
              <select
                className="rounded border border-gray-300 dark:border-slate-400 bg-white text-gray-900 dark:text-slate-900 px-2 py-1"
                value={paceUnit}
                onChange={(e) => setPaceUnit(e.target.value as PaceUnit)}
              >
                <option value="min/mi">min/mi</option>
                <option value="min/km">min/km</option>
              </select>
            </label>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mb-3">
        <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-slate-800"><input type="checkbox" checked={showHr} onChange={(e) => setShowHr(e.target.checked)} /> HR</label>
        <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-slate-800"><input type="checkbox" checked={showPace} onChange={(e) => setShowPace(e.target.checked)} /> Pace</label>
        <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-slate-800"><input type="checkbox" checked={showPower} onChange={(e) => setShowPower(e.target.checked)} /> Power</label>
        <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-slate-800"><input type="checkbox" checked={showCadence} onChange={(e) => setShowCadence(e.target.checked)} /> Cadence</label>
        <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-slate-800"><input type="checkbox" checked={showElev} onChange={(e) => setShowElev(e.target.checked)} /> Elevation</label>
      </div>

      {series.length === 0 ? (
        <div className="text-sm text-gray-600 dark:text-slate-700">Select sessions and click Compare / Analyze to begin.</div>
      ) : (
        <CMEUnifiedChart series={series} show={{ hr: showHr, pace: showPace, cadence: showCadence, elev: showElev, power: showPower }} fixedHr={mode === 'trends' ? fixedHr : undefined} paceUnit={paceUnit} />
      )}
    </div>
  );
}


