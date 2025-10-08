'use client';

import { useEffect, useState } from 'react';

type PaceUnit = 'min/mi' | 'min/km';

export default function CMETrendsChart({ appliedIds = [] as string[] }: { appliedIds?: string[] }) {
  const [fixedHr, setFixedHr] = useState<number>(150);
  const [paceUnit, setPaceUnit] = useState<PaceUnit>('min/mi');

  // Initialize pace unit from user settings distance unit
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch('/api/user-settings');
        if (!res.ok) return;
        const settings = await res.json();
        const distanceUnit = settings?.general?.distanceUnit as 'miles' | 'km' | 'm' | undefined;
        if (!isMounted) return;
        if (distanceUnit === 'miles') setPaceUnit('min/mi');
        else setPaceUnit('min/km');
      } catch {
        // ignore
      }
    })();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-900">Trends</h3>
        <div className="flex items-center gap-3">
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
      </div>

      {appliedIds.length === 0 ? (
        <div className="text-sm text-gray-600 dark:text-slate-700">Select sessions and click Compare / Analyze to begin.</div>
      ) : (
        <div className="text-sm text-gray-600 dark:text-slate-700">
          Ready to analyze pace at {fixedHr} bpm across {appliedIds.length} session(s). Results will display here.
        </div>
      )}
    </div>
  );
}


