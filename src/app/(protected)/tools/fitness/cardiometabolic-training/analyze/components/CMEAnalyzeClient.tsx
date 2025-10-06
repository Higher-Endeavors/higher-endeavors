'use client';

import { useMemo, useState } from 'react';
import CMESessionSelector from '(protected)/tools/fitness/cardiometabolic-training/analyze/components/cme-session-selector';
import CMEUnifiedAnalysis from '(protected)/tools/fitness/cardiometabolic-training/analyze/components/cme-unified-analysis';
import type { CMESessionSummary } from '(protected)/tools/fitness/cardiometabolic-training/analyze/types/analysis';
import { fetchCMESessionSeries, type SessionSeries } from '(protected)/tools/fitness/cardiometabolic-training/analyze/lib/hooks/use-cme-series';

type Props = {
  userId: number;
  initialSessions: CMESessionSummary[];
  initialDistanceUnit: 'miles' | 'km' | 'm';
  initialPaceUnit: 'min/mi' | 'min/km';
};

export default function CMEAnalyzeClient({ userId, initialSessions, initialDistanceUnit, initialPaceUnit }: Props) {
  const [family, setFamily] = useState<'All' | string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [series, setSeries] = useState<SessionSeries[]>([]);
  const [page, setPage] = useState<number>(1);

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
    } catch (e: any) {
      setError(e?.message || 'Failed to load series');
      setSeries([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen py-4 md:py-8 mx-5">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">CME Analysis</h1>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="col-span-1">
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
          />
        </div>
        <div className="space-y-4">
          <CMEUnifiedAnalysis series={series} initialPaceUnit={initialPaceUnit} />
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


