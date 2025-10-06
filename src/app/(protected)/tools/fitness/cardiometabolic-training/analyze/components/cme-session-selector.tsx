'use client';

import { useState } from 'react';
import type { CMESessionSummary } from '(protected)/tools/fitness/cardiometabolic-training/analyze/types/analysis';

type Props = {
  sessions: CMESessionSummary[];
  loading: boolean;
  error: string | null;
  family?: string | 'All';
  onFamilyChange?: (family: string | 'All') => void;
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (v: string) => void;
  onEndDateChange?: (v: string) => void;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onApplySelection?: (ids: string[]) => void;
  onClearSelection?: () => void;
  page?: number;
  onPageChange?: (page: number) => void;
};

export default function CMESessionSelector({ sessions, loading, error, family = 'All', onFamilyChange, startDate, endDate, onStartDateChange, onEndDateChange, selectedIds = [], onToggleSelect, onApplySelection, onClearSelection, page = 1, onPageChange }: Props) {
  const perPage = 5;

  const total = sessions.length;
  const offset = (page - 1) * perPage;
  const paged = sessions.slice(offset, offset + perPage);
  return (
    <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-900 mb-3">Select Sessions</h3>
      {loading ? (
        <div className="text-sm text-gray-600 dark:text-slate-700">Loading sessions…</div>
      ) : error ? (
        <div className="text-sm text-red-700">{error}</div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
            <label className="block text-sm text-gray-700 dark:text-slate-800 mb-1">Activity Family</label>
            <select
              className="w-full rounded border border-gray-300 dark:border-slate-400 bg-white text-gray-900 dark:text-slate-900 px-2 py-1"
              value={family}
              onChange={(e) => onFamilyChange && onFamilyChange(e.target.value as any)}
            >
              <option value="All">All</option>
              <option value="Running">Running</option>
              <option value="Cycling">Cycling</option>
              <option value="Swimming">Swimming</option>
              <option value="Rowing">Rowing</option>
              <option value="Walking">Walking</option>
              <option value="Nordic & Snow">Nordic & Snow</option>
              <option value="Watersport">Watersport</option>
            </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 dark:text-slate-800 mb-1">From</label>
                <input type="date" className="w-full rounded border border-gray-300 dark:border-slate-400 bg-white text-gray-900 dark:text-slate-900 px-2 py-1" value={startDate || ''} onChange={(e) => onStartDateChange && onStartDateChange(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-slate-800 mb-1">To</label>
                <input type="date" className="w-full rounded border border-gray-300 dark:border-slate-400 bg-white text-gray-900 dark:text-slate-900 px-2 py-1" value={endDate || ''} onChange={(e) => onEndDateChange && onEndDateChange(e.target.value)} />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-slate-800 mb-1">Pick Sessions</label>
            <ul className="divide-y divide-gray-200 dark:divide-slate-300 rounded border border-gray-200 dark:border-slate-300 bg-white">
              {paged.map((s) => (
                <li key={String(s.recordId)} className="px-3 py-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="h-4 w-4" checked={selectedIds.includes(String(s.recordId))} onChange={() => onToggleSelect && onToggleSelect(String(s.recordId))} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{s.displayName}</div>
                      <div className="text-xs text-gray-600">{s.durationLabel} · {s.distanceLabel}</div>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between mt-3">
              <button
                type="button"
                className={`px-3 py-1 rounded border border-gray-300 dark:border-slate-400 text-sm text-gray-900 dark:text-slate-900 ${page === 1 ? 'pointer-events-none opacity-50' : 'hover:bg-gray-200 dark:hover:bg-gray-300'}`}
                onClick={() => onPageChange && onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Prev
              </button>
              <div className="text-xs text-gray-600">Page {page}</div>
              <button
                type="button"
                className={`px-3 py-1 rounded border border-gray-300 dark:border-slate-400 text-sm text-gray-900 dark:text-slate-900 ${(offset + perPage) >= total ? 'pointer-events-none opacity-50' : 'hover:bg-gray-200 dark:hover:bg-gray-300'}`}
                onClick={() => onPageChange && onPageChange((offset + perPage) >= total ? page : page + 1)}
                disabled={(offset + perPage) >= total}
              >
                Next
              </button>
            </div>
            <div className="text-xs text-gray-600 mt-2">Checked sessions will be included in analysis across pages.</div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className={`px-3 py-1 rounded border border-gray-300 dark:border-slate-400 text-sm text-gray-900 dark:text-slate-900 ${selectedIds.length === 0 ? 'pointer-events-none opacity-50' : 'hover:bg-gray-200 dark:hover:bg-gray-300'}`}
              onClick={() => onApplySelection && onApplySelection(selectedIds)}
              disabled={selectedIds.length === 0}
            >
              Analyze/ Compare
            </button>
            <button
              type="button"
              className={`px-3 py-1 rounded border border-gray-300 dark:border-slate-400 text-sm text-gray-900 dark:text-slate-900 ${selectedIds.length === 0 ? 'pointer-events-none opacity-50' : 'hover:bg-gray-200 dark:hover:bg-gray-300'}`}
              onClick={() => onClearSelection && onClearSelection()}
              disabled={selectedIds.length === 0}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


