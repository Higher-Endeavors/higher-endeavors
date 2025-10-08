'use client';

import { useState } from 'react';
import type { CMESessionSummary } from '(protected)/tools/fitness/cardiometabolic-training/analyze/types/analysis';
import { isCMEActivity } from '(protected)/tools/fitness/cardiometabolic-training/lib/activity-mapping';

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
  distanceUnit?: 'miles' | 'km' | 'm';
  paceUnit: 'min/mi' | 'min/km';
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  collapsible?: boolean;
};

export default function CMESessionSelector({ sessions, loading, error, family = 'All', onFamilyChange, startDate, endDate, onStartDateChange, onEndDateChange, selectedIds = [], onToggleSelect, onApplySelection, onClearSelection, page = 1, onPageChange, distanceUnit = 'miles', paceUnit, collapsed = false, onToggleCollapse, collapsible = false }: Props) {
  const perPage = 5;

  // Only include CME-related activities
  const cmeSessions = sessions.filter((s) => isCMEActivity(s.activityType));
  const total = cmeSessions.length;
  const offset = (page - 1) * perPage;
  const paged = cmeSessions.slice(offset, offset + perPage);
  return (
    <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-900">Select Sessions</h3>
        {collapsible && (
          <button
            className="text-gray-500 hover:text-gray-700 focus:outline-none transition-transform duration-200 cursor-pointer"
            onClick={() => onToggleCollapse && onToggleCollapse()}
            style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}
            aria-label={collapsed ? 'Expand' : 'Collapse'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        )}
      </div>
      {collapsed ? null : loading ? (
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
                <input type="date" className="w-full rounded border border-gray-300 dark:border-slate-400 bg-white text-gray-900 dark:text-slate-900 px-1 py-1 text-[11px]" value={startDate || ''} onChange={(e) => onStartDateChange && onStartDateChange(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-slate-800 mb-1">To</label>
                <input type="date" className="w-full rounded border border-gray-300 dark:border-slate-400 bg-white text-gray-900 dark:text-slate-900 px-1 py-1 text-[11px]" value={endDate || ''} onChange={(e) => onEndDateChange && onEndDateChange(e.target.value)} />
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
                      <div className="text-xs text-gray-600">{renderDetails(s, paceUnit, distanceUnit)}</div>
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


function renderDetails(s: CMESessionSummary, paceUnit: 'min/mi' | 'min/km', distanceUnit: 'miles' | 'km' | 'm') {
  const duration = s.durationLabel;
  const distance = s.distanceLabel;
  const calories = typeof s.caloriesKcal === 'number' ? `${Math.round(s.caloriesKcal)} kcal` : undefined;
  // Prefer average speed from data if present; otherwise compute pace from distance/duration
  let paceOrSpeed: string | undefined;
  if (typeof s.avgSpeedMps === 'number' && s.avgSpeedMps > 0) {
    // Convert to pace for running/cycling style
    const metersPerUnit = paceUnit === 'min/mi' ? 1609.344 : 1000;
    const secondsPerUnit = metersPerUnit / s.avgSpeedMps;
    const minutes = secondsPerUnit / 60;
    const mm = Math.floor(minutes);
    const ss = Math.round((minutes - mm) * 60).toString().padStart(2, '0');
    paceOrSpeed = `${mm}:${ss} ${paceUnit === 'min/mi' ? '/mi' : '/km'}`;
  } else if (typeof s.durationSeconds === 'number' && typeof s.distanceMeters === 'number' && s.distanceMeters > 0) {
    if (paceUnit === 'min/mi') {
      const miles = s.distanceMeters / 1609.344;
      if (miles > 0) {
        const minutes = s.durationSeconds / 60;
        const minPerMile = minutes / miles;
        const mm = Math.floor(minPerMile);
        const ss = Math.round((minPerMile - mm) * 60).toString().padStart(2, '0');
        paceOrSpeed = `${mm}:${ss} /mi`;
      }
    } else {
      const km = s.distanceMeters / 1000;
      if (km > 0) {
        const minutes = s.durationSeconds / 60;
        const minPerKm = minutes / km;
        const mm = Math.floor(minPerKm);
        const ss = Math.round((minPerKm - mm) * 60).toString().padStart(2, '0');
        paceOrSpeed = `${mm}:${ss} /km`;
      }
    }
  }

  const parts = [duration, distance];
  if (paceOrSpeed) parts.push(paceOrSpeed);
  if (calories) parts.push(calories);
  return parts.join(' · ');
}


