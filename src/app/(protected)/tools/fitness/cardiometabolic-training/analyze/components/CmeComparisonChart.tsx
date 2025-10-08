'use client';

import type { CMESessionSummary } from '(protected)/tools/fitness/cardiometabolic-training/analyze/types/analysis';

export default function CMEComparisonChart({ primary, secondary }: { primary: CMESessionSummary | null; secondary: CMESessionSummary | null }) {
  return (
    <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-900 mb-3">Compare Sessions</h3>
      {!primary ? (
        <div className="text-sm text-gray-600 dark:text-slate-700">Select a primary session to compare.</div>
      ) : !secondary ? (
        <div className="text-sm text-gray-600 dark:text-slate-700">Optionally select a second session for comparison.</div>
      ) : (
        <div className="text-sm text-gray-900 dark:text-slate-900 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded border border-gray-300 dark:border-slate-400 p-2">
            <div className="text-xs text-gray-600 dark:text-slate-700 mb-1">Primary</div>
            <div className="font-medium">{primary.displayName}</div>
          </div>
          <div className="rounded border border-gray-300 dark:border-slate-400 p-2">
            <div className="text-xs text-gray-600 dark:text-slate-700 mb-1">Secondary</div>
            <div className="font-medium">{secondary.displayName}</div>
          </div>
        </div>
      )}
    </div>
  );
}


