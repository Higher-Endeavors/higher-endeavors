'use client';

type DistanceUnit = 'miles' | 'km' | 'm';
type PaceUnit = 'min/mi' | 'min/km';
import GarminAttribution from '(protected)/user/widgets/components/GarminAttribution';
import { getCMEFamilyForActivity } from '(protected)/tools/fitness/cardiometabolic-training/lib/activity-mapping';

export type SessionStat = {
  id: string;
  dateLabel: string;
  name: string;
  activityType?: string;
  distanceMeters?: number;
  durationSeconds?: number;
  avgHr?: number;
  maxHr?: number;
  avgSpeedMps?: number;
  caloriesKcal?: number;
  elevGainMeters?: number;
  elevLossMeters?: number;
  avgRunCadenceSpm?: number;
  avgBikeCadenceRpm?: number;
  avgSwimCadenceSpm?: number;
  numberOfActiveLengths?: number;
};

function formatDuration(seconds?: number): string {
  if (!Number.isFinite(seconds)) return '-';
  const s = Math.max(0, Math.floor(seconds as number));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (parts.length === 0) parts.push(`${s % 60}s`);
  return parts.join(' ');
}

function formatDistance(meters?: number, unit: DistanceUnit = 'miles'): string {
  if (!Number.isFinite(meters)) return '-';
  const m = meters as number;
  if (unit === 'miles') return `${(m / 1609.344).toFixed(2)} mi`;
  if (unit === 'km') return `${(m / 1000).toFixed(2)} km`;
  return `${Math.round(m)} m`;
}

function paceFromSpeedMps(speed?: number, unit: PaceUnit = 'min/mi'): string {
  if (!Number.isFinite(speed) || (speed as number) <= 0) return '-';
  const metersPerUnit = unit === 'min/mi' ? 1609.344 : 1000;
  const secondsPerUnit = metersPerUnit / (speed as number);
  const minutes = secondsPerUnit / 60;
  const mm = Math.floor(minutes);
  const ss = Math.round((minutes - mm) * 60).toString().padStart(2, '0');
  return `${mm}:${ss} ${unit === 'min/mi' ? '/mi' : '/km'}`;
}

function speedFromMps(speed?: number, distanceUnit: DistanceUnit = 'miles'): string {
  if (!Number.isFinite(speed)) return '-';
  const mps = speed as number;
  if (distanceUnit === 'miles') return `${(mps * 2.236936).toFixed(1)} mph`;
  return `${(mps * 3.6).toFixed(1)} km/h`;
}

function formatElevation(meters?: number, distanceUnit: DistanceUnit = 'miles'): string {
  if (!Number.isFinite(meters)) return '-';
  const m = meters as number;
  if (distanceUnit === 'miles') {
    // Imperial mapping when distance unit is miles
    const feet = m * 3.28084;
    return `${Math.round(feet)} ft`;
  }
  // Metric mapping for km or m
  return `${Math.round(m)} m`;
}

export default function CMESessionStats({ stats, distanceUnit = 'miles', paceUnit = 'min/mi', attribution }: { stats: SessionStat[]; distanceUnit?: DistanceUnit; paceUnit?: PaceUnit; attribution?: string }) {
  if (!stats || stats.length === 0) return null;

  const isComparison = stats.length > 1;

  function buildRowsForSession(s: SessionStat) {
    const family = getCMEFamilyForActivity(s.activityType || '');
    const common: Array<{ key: string; label: string; render: (sx: SessionStat) => string | number }> = [
      { key: 'distance', label: 'Distance', render: (sx) => formatDistance(sx.distanceMeters, distanceUnit) },
      { key: 'duration', label: 'Duration', render: (sx) => formatDuration(sx.durationSeconds) },
      { key: 'avgHr', label: 'Avg HR', render: (sx) => (Number.isFinite(sx.avgHr) ? `${Math.round(sx.avgHr as number)} bpm` : '-') },
      { key: 'maxHr', label: 'Max HR', render: (sx) => (Number.isFinite(sx.maxHr) ? `${Math.round(sx.maxHr as number)} bpm` : '-') },
      { key: 'cal', label: 'Calories', render: (sx) => (Number.isFinite(sx.caloriesKcal) ? Math.round(sx.caloriesKcal as number) : '-') },
      { key: 'elevGain', label: 'Elev Gain', render: (sx) => formatElevation(sx.elevGainMeters, distanceUnit) },
      { key: 'elevLoss', label: 'Elev Loss', render: (sx) => formatElevation(sx.elevLossMeters, distanceUnit) },
    ];
    if (family === 'Cycling') {
      common.splice(2, 0, { key: 'avgSpeed', label: 'Avg Speed', render: (sx) => speedFromMps(sx.avgSpeedMps, distanceUnit) });
      common.push({ key: 'bikeCadence', label: 'Bike Cadence', render: (sx) => (Number.isFinite(sx.avgBikeCadenceRpm) ? `${Math.round(sx.avgBikeCadenceRpm as number)} rpm` : '-') });
    } else if (family === 'Swimming') {
      common.splice(2, 0, { key: 'avgSpeed', label: 'Avg Speed', render: (sx) => speedFromMps(sx.avgSpeedMps, distanceUnit) });
      common.push({ key: 'swimCadence', label: 'Swim Cadence', render: (sx) => (Number.isFinite(sx.avgSwimCadenceSpm) ? `${Math.round(sx.avgSwimCadenceSpm as number)} spm` : '-') });
      common.push({ key: 'lengths', label: 'Active Lengths', render: (sx) => (Number.isFinite(sx.numberOfActiveLengths) ? Math.round(sx.numberOfActiveLengths as number) : '-') });
    } else {
      // Running/Walking default
      common.splice(2, 0, { key: 'avgPace', label: 'Avg Pace', render: (sx) => paceFromSpeedMps(sx.avgSpeedMps, paceUnit) });
      common.push({ key: 'runCadence', label: 'Run Cadence', render: (sx) => (Number.isFinite(sx.avgRunCadenceSpm) ? `${Math.round(sx.avgRunCadenceSpm as number)} spm` : '-') });
    }
    return common;
  }

  if (!isComparison) {
    const s = stats[0];
    return (
      <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-900 mb-2">Stats</h3>
        <div className="text-sm text-gray-700 dark:text-slate-800 mb-3">{s.dateLabel} · {s.name}</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-900 dark:text-slate-900">
          {buildRowsForSession(s).map((row) => (
            <div key={row.key} className="bg-white dark:bg-white rounded border border-gray-200 dark:border-slate-300 p-2">
              <div className="text-xs text-gray-600 dark:text-slate-700">{row.label}</div>
              <div className="font-medium">{row.render(s)}</div>
            </div>
          ))}
        </div>
        <GarminAttribution attribution={attribution} className="mt-2" />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-4 overflow-x-auto">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-900 mb-2">Stats (Comparison)</h3>
      <table className="min-w-full text-sm text-left text-gray-900 dark:text-slate-900">
        <thead>
          <tr>
            <th className="px-2 py-1">Metric</th>
            {stats.map((s) => (
              <th key={s.id} className="px-2 py-1 whitespace-nowrap">{s.dateLabel} · {s.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(() => {
            // union of all metric rows across sessions (so rows align)
            const keysSeen = new Map<string, { label: string }>();
            stats.forEach((s) => buildRowsForSession(s).forEach((r) => { if (!keysSeen.has(r.key)) keysSeen.set(r.key, { label: r.label }); }));
            const rows = Array.from(keysSeen.entries()).map(([key, meta]) => ({ key, label: meta.label }));
            return rows.map((row) => (
              <tr key={row.key} className="border-t border-gray-200 dark:border-slate-300">
                <td className="px-2 py-1 text-gray-600 dark:text-slate-700 whitespace-nowrap">{row.label}</td>
                {stats.map((s) => {
                  const renderer = buildRowsForSession(s).find((r) => r.key === row.key)?.render;
                  return (
                    <td key={s.id + row.key} className="px-2 py-1 whitespace-nowrap">{renderer ? renderer(s) : '-'}</td>
                  );
                })}
              </tr>
            ));
          })()}
        </tbody>
      </table>
      <GarminAttribution attribution={attribution} className="mt-2" />
    </div>
  );
}


