'use client';

import type { CMESessionSummary } from '(protected)/tools/fitness/cardiometabolic-training/analyze/types/analysis';

export default function CMESessionAnalysisChart({ session }: { session: CMESessionSummary | null }) {
  return (
    <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-900 mb-3">Session Analysis</h3>
      {!session ? (
        <div className="text-sm text-gray-600 dark:text-slate-700">Select a session to view details.</div>
      ) : (
        <div className="text-sm text-gray-900 dark:text-slate-900">
          {/* Placeholder for charts/metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded border border-gray-300 dark:border-slate-400 p-2">
              <div className="text-xs text-gray-600 dark:text-slate-700">Date</div>
              <div className="font-medium">{session.date}</div>
            </div>
            <div className="rounded border border-gray-300 dark:border-slate-400 p-2">
              <div className="text-xs text-gray-600 dark:text-slate-700">Type</div>
              <div className="font-medium">{session.activityType}</div>
            </div>
            <div className="rounded border border-gray-300 dark:border-slate-400 p-2">
              <div className="text-xs text-gray-600 dark:text-slate-700">Duration</div>
              <div className="font-medium">{session.durationLabel}</div>
            </div>
            <div className="rounded border border-gray-300 dark:border-slate-400 p-2">
              <div className="text-xs text-gray-600 dark:text-slate-700">Distance</div>
              <div className="font-medium">{session.distanceLabel}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


