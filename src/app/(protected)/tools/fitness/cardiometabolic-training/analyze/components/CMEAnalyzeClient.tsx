'use client';

import { useMemo, useState } from 'react';
import CMESessionSelector from '(protected)/tools/fitness/cardiometabolic-training/analyze/components/CmeSessionSelector';
import CMEUnifiedAnalysis from '(protected)/tools/fitness/cardiometabolic-training/analyze/components/CmeUnifiedAnalysis';
import CMESessionStats, { type SessionStat } from '(protected)/tools/fitness/cardiometabolic-training/analyze/components/CmeSessionStats';
import type { CMESessionSummary } from '(protected)/tools/fitness/cardiometabolic-training/analyze/types/analysis';
import { fetchCMESessionSeries, type SessionSeries } from '(protected)/tools/fitness/cardiometabolic-training/analyze/lib/hooks/use-cme-series';

type Props = {
  userId: number;
  initialSessions: CMESessionSummary[];
  initialDistanceUnit: 'miles' | 'km' | 'm';
  initialPaceUnit: 'min/mi' | 'min/km';
  initialWeekly?: { labels: string[]; values: number[]; familySeries: { label: string; values: number[] }[]; attribution?: string };
};

export default function CMEAnalyzeClient({ userId, initialSessions, initialDistanceUnit, initialPaceUnit, initialWeekly }: Props) {
  const [mode, setMode] = useState<'summary' | 'trends'>('trends');
  const [selectorCollapsed, setSelectorCollapsed] = useState<boolean>(true);
  const [family, setFamily] = useState<'All' | string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [series, setSeries] = useState<SessionSeries[]>([]);
  const [page, setPage] = useState<number>(1);
  const [stats, setStats] = useState<SessionStat[]>([]);
  const [statsAttribution, setStatsAttribution] = useState<string | undefined>(undefined);

  const sessions = useMemo(() => {
    let s = initialSessions;
    if (family && family !== 'All') {
      s = s.filter((x) => x.family === family);
    }
    if (startDate) {
      const sd = new Date(startDate);
      s = s.filter((x) => new Date(x.date) >= sd);
    }
    if (endDate) {
      const ed = new Date(endDate);
      s = s.filter((x) => new Date(x.date) <= ed);
    }
    return s;
  }, [initialSessions, family, startDate, endDate]);

  async function applySelection(ids: string[]) {
    try {
      setLoading(true);
      setError(null);
      const loaded = await fetchCMESessionSeries(ids, initialPaceUnit);
      setSeries(loaded);
      // Fetch full activity details for richer stats
      const mapped: SessionStat[] = [];
      for (const id of ids) {
        const res = await fetch(`/api/garmin-connect/activity/data?id=${encodeURIComponent(id)}&type=activityDetails`);
        if (!res.ok) continue;
        const json = await res.json();
        const d = json?.data?.data;
        if (!d) continue;
        const date = new Date(Number(d.startTimeInSeconds) * 1000);
        const distRaw = (d as any).distanceInMeters;
        const distanceMeters = typeof distRaw === 'number' ? distRaw : (typeof distRaw === 'string' ? Number(distRaw) : undefined);
        const durRaw = (d as any).durationInSeconds;
        const durationSeconds = typeof durRaw === 'number' ? durRaw : (typeof durRaw === 'string' ? Number(durRaw) : undefined);
        const avgSpdRaw = (d as any).averageSpeedInMetersPerSecond;
        let avgSpeedMps = typeof avgSpdRaw === 'number' ? avgSpdRaw : (typeof avgSpdRaw === 'string' ? Number(avgSpdRaw) : undefined);
        if ((!Number.isFinite(avgSpeedMps as number) || (avgSpeedMps as number) <= 0) && Number.isFinite(distanceMeters) && Number.isFinite(durationSeconds) && (durationSeconds as number) > 0) {
          avgSpeedMps = (distanceMeters as number) / (durationSeconds as number);
        }
        const elevGainRaw = (d as any).totalElevationGainInMeters;
        const elevLossRaw = (d as any).totalElevationLossInMeters;
        const runCadRaw = (d as any).averageRunCadenceInStepsPerMinute;
        mapped.push({
          id: String(id),
          dateLabel: isNaN(date.getTime()) ? '-' : date.toLocaleDateString(),
          name: d.activityName ? `${d.activityType} · ${d.activityName}` : d.activityType,
          activityType: d.activityType,
          distanceMeters,
          durationSeconds,
          avgSpeedMps,
          caloriesKcal: typeof d.activeKilocalories === 'number' ? d.activeKilocalories : undefined,
          avgHr: typeof d.averageHeartRateInBeatsPerMinute === 'number' ? d.averageHeartRateInBeatsPerMinute : undefined,
          maxHr: typeof d.maxHeartRateInBeatsPerMinute === 'number' ? d.maxHeartRateInBeatsPerMinute : undefined,
          elevGainMeters: typeof elevGainRaw === 'number' ? elevGainRaw : (typeof elevGainRaw === 'string' ? Number(elevGainRaw) : undefined),
          elevLossMeters: typeof elevLossRaw === 'number' ? elevLossRaw : (typeof elevLossRaw === 'string' ? Number(elevLossRaw) : undefined),
          avgRunCadenceSpm: typeof runCadRaw === 'number' ? runCadRaw : (typeof runCadRaw === 'string' ? Number(runCadRaw) : undefined),
          avgBikeCadenceRpm: typeof d.averageBikeCadenceInRoundsPerMinute === 'number' ? d.averageBikeCadenceInRoundsPerMinute : (typeof d.averageBikeCadenceInRoundsPerMinute === 'string' ? Number(d.averageBikeCadenceInRoundsPerMinute) : undefined),
          avgSwimCadenceSpm: typeof d.averageSwimCadenceInStrokesPerMinute === 'number' ? d.averageSwimCadenceInStrokesPerMinute : (typeof d.averageSwimCadenceInStrokesPerMinute === 'string' ? Number(d.averageSwimCadenceInStrokesPerMinute) : undefined),
          numberOfActiveLengths: typeof d.numberOfActiveLengths === 'number' ? d.numberOfActiveLengths : (typeof d.numberOfActiveLengths === 'string' ? Number(d.numberOfActiveLengths) : undefined),
        });
      }
      setStats(mapped);
      // Attribution from device_name if any of the selected has it
      const deviceName = loaded.length > 0 ? undefined : undefined;
      // Fallback: check first selected full detail response processed above (we don't keep it here; re-fetch lightweight for attribution)
      try {
        if (ids.length > 0) {
          const res0 = await fetch(`/api/garmin-connect/activity/data?id=${encodeURIComponent(ids[0])}&type=activityDetails`);
          if (res0.ok) {
            const j0 = await res0.json();
            const dn = j0?.data?.data?.deviceName as string | undefined;
            setStatsAttribution(dn ? `Data sourced from Garmin (${dn})` : undefined);
          }
        }
      } catch {}
    } catch (e: any) {
      setError(e?.message || 'Failed to load series');
      setSeries([]);
      setStats([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen py-4 md:py-8 mx-5">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">CME Analysis</h1>

      {/* Global Analysis mode toggle */}
      <div className="flex items-center justify-center mb-6">
        <div className="inline-flex rounded-md border border-gray-300 dark:border-slate-400 overflow-hidden">
          <button
            type="button"
            onClick={() => { setMode('summary'); setSelectorCollapsed(false); }}
            className={`px-3 py-1 text-sm ${mode === 'summary' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-white text-gray-900 dark:text-slate-900'}`}
          >
            Summary
          </button>
          <button
            type="button"
            onClick={() => { setMode('trends'); setSelectorCollapsed(true); }}
            className={`px-3 py-1 text-sm ${mode === 'trends' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-white text-gray-900 dark:text-slate-900'}`}
          >
            Trends
          </button>
        </div>
      </div>

      {/* Analysis Chart */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="space-y-4">
          <CMEUnifiedAnalysis mode={mode} series={series} initialPaceUnit={initialPaceUnit} distanceUnit={initialDistanceUnit} initialWeekly={initialWeekly} />
        </div>
      </div>

      {/* Session Selector (left 1/3) and Stats (right 2/3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1">
          <CMESessionSelector
            sessions={sessions}
            loading={loading}
            error={error}
            family={family}
            onFamilyChange={(f) => { setFamily(f as any); setSelectedIds([]); setPage(1); }}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={(v) => { setStartDate(v); setSelectedIds([]); setPage(1); }}
            onEndDateChange={(v) => { setEndDate(v); setSelectedIds([]); setPage(1); }}
            selectedIds={selectedIds}
            onToggleSelect={(id) => setSelectedIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
            onApplySelection={(ids) => applySelection(ids)}
            onClearSelection={() => { setSelectedIds([]); setSeries([]); }}
            page={page}
            onPageChange={setPage}
            distanceUnit={initialDistanceUnit}
            paceUnit={initialPaceUnit}
            collapsed={selectorCollapsed}
            onToggleCollapse={() => setSelectorCollapsed(!selectorCollapsed)}
            collapsible={true}
          />
        </div>
        <div className="md:col-span-2">
          <CMESessionStats stats={stats} distanceUnit={initialDistanceUnit} paceUnit={initialPaceUnit} attribution={statsAttribution} />
        </div>
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (hrs > 0) parts.push(`${hrs}h`);
  if (mins > 0) parts.push(`${mins}m`);
  if (parts.length === 0) parts.push(`${seconds % 60}s`);
  return parts.join(' ');
}


