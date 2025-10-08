'use client';

import { useState } from 'react';
import CMEUnifiedChart from '(protected)/tools/fitness/cardiometabolic-training/analyze/components/CmeUnifiedChart';
import CMETrendWeeklyVolume from '(protected)/tools/fitness/cardiometabolic-training/analyze/components/CmeTrendWeeklyVolume';
import CMETrendHrToPace from '(protected)/tools/fitness/cardiometabolic-training/analyze/components/CmeTrendHrToPace';
import CMETrendPaceToHr from '(protected)/tools/fitness/cardiometabolic-training/analyze/components/CmeTrendPaceToHr';
import { movingAverage } from '(protected)/tools/fitness/cardiometabolic-training/analyze/lib/hooks/use-cme-series';
import type { SessionSeries } from '(protected)/tools/fitness/cardiometabolic-training/analyze/lib/hooks/use-cme-series';
import { getCMEFamilyForActivity } from '(protected)/tools/fitness/cardiometabolic-training/lib/activity-mapping';
import GarminAttribution from '(protected)/user/widgets/components/GarminAttribution';

type AnalysisMode = 'summary' | 'trends';
type TrendType = 'weeklyVolume' | 'weeklyDistance' | 'hrToPace' | 'paceToHr';
type PaceUnit = 'min/mi' | 'min/km';

export default function CMEUnifiedAnalysis({ mode = 'trends' as AnalysisMode, series = [] as SessionSeries[], initialPaceUnit = 'min/mi' as PaceUnit, distanceUnit = 'miles' as 'miles' | 'km' | 'm', initialWeekly }: { mode?: AnalysisMode; series?: SessionSeries[]; initialPaceUnit?: PaceUnit; distanceUnit?: 'miles' | 'km' | 'm'; initialWeekly?: { labels: string[]; values: number[]; familySeries: { label: string; values: number[] }[]; attribution?: string } }) {
  const [trendType, setTrendType] = useState<TrendType>('weeklyVolume');
  const [weeklyLabels, setWeeklyLabels] = useState<string[]>(initialWeekly?.labels ?? []);
  const [weeklyValues, setWeeklyValues] = useState<number[]>(initialWeekly?.values ?? []);
  const [weeklyLoading, setWeeklyLoading] = useState<boolean>(false);
  const [weeklyError, setWeeklyError] = useState<string | null>(null);
  const [weeklyFamilySeries, setWeeklyFamilySeries] = useState<{ label: string; values: number[] }[]>(initialWeekly?.familySeries ?? []);
  const [weeklyDistanceLabels, setWeeklyDistanceLabels] = useState<string[]>([]);
  const [weeklyDistanceValues, setWeeklyDistanceValues] = useState<number[]>([]);
  const [weeklyDistanceFamilySeries, setWeeklyDistanceFamilySeries] = useState<{ label: string; values: number[] }[]>([]);
  const [weeklyDistanceLoading, setWeeklyDistanceLoading] = useState<boolean>(false);
  const [weeklyDistanceError, setWeeklyDistanceError] = useState<string | null>(null);
  const [hrToPaceLabels, setHrToPaceLabels] = useState<string[]>([]);
  const [hrToPaceValues, setHrToPaceValues] = useState<number[]>([]);
  const [hrToPaceLoading, setHrToPaceLoading] = useState<boolean>(false);
  const [hrToPaceError, setHrToPaceError] = useState<string | null>(null);
  const [hrToPaceMeta, setHrToPaceMeta] = useState<{ names: string[]; durations: number[]; distances: number[] }>({ names: [], durations: [], distances: [] });
  const [paceToHrLabels, setPaceToHrLabels] = useState<string[]>([]);
  const [paceToHrValues, setPaceToHrValues] = useState<number[]>([]);
  const [paceToHrLoading, setPaceToHrLoading] = useState<boolean>(false);
  const [paceToHrError, setPaceToHrError] = useState<string | null>(null);
  const [paceToHrMeta, setPaceToHrMeta] = useState<{ names: string[]; durations: number[]; distances: number[] }>({ names: [], durations: [], distances: [] });
  const [targetPace, setTargetPace] = useState<string>('07:00');
  const [fixedHr, setFixedHr] = useState<number>(150);
  const [paceUnit, setPaceUnit] = useState<PaceUnit>(initialPaceUnit);
  const [trendRange, setTrendRange] = useState<'week' | '4w' | '3m' | '6m' | '12m'>('4w');
  const [excludeRecovery, setExcludeRecovery] = useState<boolean>(true);
  const [showHr, setShowHr] = useState(true);
  const [showPace, setShowPace] = useState(true);
  const [showCadence, setShowCadence] = useState(false);
  const [showElev, setShowElev] = useState(false);
  const [showPower, setShowPower] = useState(false);
  const [attribution, setAttribution] = useState<string | null>(initialWeekly?.attribution ?? null);

  // Event-driven loader for Weekly Volume (no effects)
  const loadWeeklyVolume = async (range: 'week' | '4w' | '3m' | '6m' | '12m') => {
    try {
      setWeeklyLoading(true);
      setWeeklyError(null);
      const days = daysForRange(range);
      const params = new URLSearchParams();
      params.set('type', 'activityDetails');
      params.set('limit', '1000');
      params.set('days', String(days));
      const res = await fetch(`/api/garmin-connect/activity/data?${params.toString()}`);
      if (!res.ok) throw new Error('Load failed');
      const json = await res.json();
      const items: any[] = Array.isArray(json?.data) ? json.data : [];
      // Filter to CME families
      const activities = items
        .map((it) => it?.data)
        .filter(Boolean)
        .filter((d: any) => !!getCMEFamilyForActivity(d.activityType));
      // Aggregate minutes per Monday-start week (use numeric timestamps for Safari compatibility)
      const weekKeyToMinutes = new Map<number, number>();
      const familyToWeekKeyMinutes = new Map<string, Map<number, number>>();
      for (const d of activities) {
        const dt = new Date(Number(d.startTimeInSeconds) * 1000);
        const ws = weekStart(dt);
        const key = ws.getTime();
        const minutes = Math.round((d.durationInSeconds || 0) / 60);
        weekKeyToMinutes.set(key, (weekKeyToMinutes.get(key) || 0) + minutes);
        const fam = getCMEFamilyForActivity(d.activityType) || 'Other';
        if (!familyToWeekKeyMinutes.has(fam)) familyToWeekKeyMinutes.set(fam, new Map<number, number>());
        const famMap = familyToWeekKeyMinutes.get(fam)!;
        famMap.set(key, (famMap.get(key) || 0) + minutes);
      }

      // Build contiguous weekly bins from timeframe start to current week, filling zeros
      const now = new Date();
      const endWeek = weekStart(now).getTime();
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - days);
      const startWeek = weekStart(startDate).getTime();

      const labels: string[] = [];
      const values: number[] = [];
      const familySeriesAccum: { label: string; values: number[] }[] = [];
      const families = Array.from(familyToWeekKeyMinutes.keys());
      const famMaps = families.map((f) => ({ label: f, map: familyToWeekKeyMinutes.get(f)! }));
      for (let t = startWeek; t <= endWeek; t += 7 * 24 * 60 * 60 * 1000) {
        labels.push(labelForWeekStart(new Date(t)));
        values.push(weekKeyToMinutes.get(t) ?? 0);
        for (const { label, map } of famMaps) {
          const series = familySeriesAccum.find((s) => s.label === label);
          if (!series) {
            familySeriesAccum.push({ label, values: [map.get(t) ?? 0] });
          } else {
            series.values.push(map.get(t) ?? 0);
          }
        }
      }
      setWeeklyLabels(labels);
      setWeeklyValues(values);
      setWeeklyFamilySeries(familySeriesAccum);
      const deviceName = (activities.find((d: any) => d?.deviceName) as any)?.deviceName as string | undefined;
      setAttribution(deviceName ? `Data sourced from Garmin (${deviceName})` : null);
    } catch (e: any) {
      setWeeklyError(e?.message || 'Failed to load weekly volume');
      setWeeklyLabels([]);
      setWeeklyValues([]);
    } finally {
      setWeeklyLoading(false);
    }
  };
  const loadHrToPace = async (range: 'week' | '4w' | '3m' | '6m' | '12m', targetHr: number, unit: 'min/mi' | 'min/km') => {
    try {
      setHrToPaceLoading(true);
      setHrToPaceError(null);
      const days = daysForRange(range);
      const listParams = new URLSearchParams();
      listParams.set('type', 'activityDetails');
      listParams.set('limit', '500');
      listParams.set('days', String(days));
      const listRes = await fetch(`/api/garmin-connect/activity/data?${listParams.toString()}`);
      if (!listRes.ok) throw new Error('Load failed');
      const listJson = await listRes.json();
      const items: any[] = Array.isArray(listJson?.data) ? listJson.data : [];
      let runs = items
        .map((it) => it?.data ? { id: it.id, data: it.data } : null)
        .filter(Boolean)
        .filter((r: any) => getCMEFamilyForActivity(r.data.activityType) === 'Running');
      // Oldest to newest (left-to-right)
      runs.sort((a: any, b: any) => Number(a.data.startTimeInSeconds) - Number(b.data.startTimeInSeconds));
      const deviceNameRuns = (() => {
        const first = runs.find((r: any) => r && r.data && r.data.deviceName);
        return first && first.data ? (first.data.deviceName as string) : undefined;
      })();

      const labels: string[] = [];
      const values: number[] = [];
      const names: string[] = [];
      const durations: number[] = [];
      const distances: number[] = [];
      const hrWindow = 3;

      for (const r of runs) {
        if (!r) continue;
        const recId = (r as any).id as string | number;
        const detailRes = await fetch(`/api/garmin-connect/activity/data?id=${encodeURIComponent(recId)}&type=activityDetails`);
        if (!detailRes.ok) continue;
        const detailJson = await detailRes.json();
        const d = detailJson?.data?.data;
        const samples: any[] = Array.isArray(d?.samples) ? d.samples : [];
        const date = new Date(Number(d?.startTimeInSeconds) * 1000);
        const label = isNaN(date.getTime()) ? String(recId) : date.toLocaleDateString();

        const hrArr = samples.map((s) => (typeof s.heartRate === 'number' ? s.heartRate : NaN));
        const speedArr = samples.map((s) => (typeof s.speedMetersPerSecond === 'number' ? s.speedMetersPerSecond : NaN));
        const tArr = samples.map((s, i) => {
          const t = Number(s.timerDurationInSeconds ?? s.clockDurationInSeconds ?? i);
          return Number.isFinite(t) ? t : i;
        });
        const smHrRaw = movingAverage(hrArr.map((v) => (Number.isFinite(v) ? v : 0)), 5);
        const smSpd = movingAverage(speedArr.map((v) => (Number.isFinite(v) ? v : 0)), 5);
        const bestLag = excludeRecovery ? estimateBestLag(smHrRaw, smSpd, 0, 60) : 0;
        const smHr = applyLag(smHrRaw, bestLag);
        const metersPerUnit = unit === 'min/mi' ? 1609.344 : 1000;
        const paceArr = smSpd.map((spd) => (spd > 0 ? (metersPerUnit / spd) / 60 : NaN));
        const workMask = excludeRecovery ? buildWorkMask(smSpd, tArr) : new Array(smSpd.length).fill(true);
        const keepMask = excludeRecovery ? robustKeepMask(paceArr, tArr) : new Array(paceArr.length).fill(true);
        const selectedPaces: number[] = [];
        for (let i = 0; i < smHr.length; i++) {
          const hr = smHr[i];
          const spd = smSpd[i];
          if (workMask[i] && keepMask[i] && Number.isFinite(hr) && Number.isFinite(spd) && Math.abs(hr - targetHr) <= hrWindow && spd > 0) {
            const paceMin = (metersPerUnit / spd) / 60;
            const dt = i > 0 ? Math.max(1, (tArr[i] - tArr[i - 1]) || 1) : 1;
            for (let k = 0; k < dt; k++) selectedPaces.push(paceMin);
          }
        }
        if (selectedPaces.length > 0) {
          const avg = selectedPaces.reduce((a, b) => a + b, 0) / selectedPaces.length;
          labels.push(label);
          values.push(avg);
          names.push(d?.activityName || d?.activityType || String(recId));
          durations.push(Number(d?.durationInSeconds) || 0);
          const distRaw = (d as any)?.distanceInMeters;
          distances.push(typeof distRaw === 'number' ? distRaw : (typeof distRaw === 'string' ? Number(distRaw) : 0));
        }
      }

      setHrToPaceLabels(labels);
      setHrToPaceValues(values);
      setHrToPaceMeta({ names, durations, distances });
      setAttribution(deviceNameRuns ? `Data sourced from Garmin (${deviceNameRuns})` : null);
    } catch (e: any) {
      setHrToPaceError(e?.message || 'Failed to load HR→Pace');
      setHrToPaceLabels([]);
      setHrToPaceValues([]);
    } finally {
      setHrToPaceLoading(false);
    }
  };
  const loadWeeklyDistance = async (range: 'week' | '4w' | '3m' | '6m' | '12m') => {
    try {
      setWeeklyDistanceLoading(true);
      setWeeklyDistanceError(null);
      const days = daysForRange(range);
      const params = new URLSearchParams();
      params.set('type', 'activityDetails');
      params.set('limit', '1000');
      params.set('days', String(days));
      const res = await fetch(`/api/garmin-connect/activity/data?${params.toString()}`);
      if (!res.ok) throw new Error('Load failed');
      const json = await res.json();
      const items: any[] = Array.isArray(json?.data) ? json.data : [];
      const activities = items
        .map((it) => it?.data)
        .filter(Boolean)
        .filter((d: any) => !!getCMEFamilyForActivity(d.activityType));
      const weekKeyToDistance = new Map<number, number>();
      const familyToWeekKeyDistance = new Map<string, Map<number, number>>();
      for (const d of activities) {
        const dt = new Date(Number(d.startTimeInSeconds) * 1000);
        const ws = weekStart(dt);
        const key = ws.getTime();
        const distMetersRaw = (d as any).distanceInMeters;
        const distMeters = typeof distMetersRaw === 'number' ? distMetersRaw : (typeof distMetersRaw === 'string' ? Number(distMetersRaw) : 0);
        const dist = distanceUnit === 'miles' ? distMeters / 1609.344 : distanceUnit === 'km' ? distMeters / 1000 : distMeters;
        weekKeyToDistance.set(key, (weekKeyToDistance.get(key) || 0) + dist);
        const fam = getCMEFamilyForActivity(d.activityType) || 'Other';
        if (!familyToWeekKeyDistance.has(fam)) familyToWeekKeyDistance.set(fam, new Map<number, number>());
        const famMap = familyToWeekKeyDistance.get(fam)!;
        famMap.set(key, (famMap.get(key) || 0) + dist);
      }

      const now = new Date();
      const endWeek = weekStart(now).getTime();
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - days);
      const startWeek = weekStart(startDate).getTime();

      const labels: string[] = [];
      const values: number[] = [];
      const familySeriesAccum: { label: string; values: number[] }[] = [];
      const families = Array.from(familyToWeekKeyDistance.keys());
      const famMaps = families.map((f) => ({ label: f, map: familyToWeekKeyDistance.get(f)! }));
      for (let t = startWeek; t <= endWeek; t += 7 * 24 * 60 * 60 * 1000) {
        labels.push(labelForWeekStart(new Date(t)));
        values.push(Number((weekKeyToDistance.get(t) ?? 0).toFixed(2)));
        for (const { label, map } of famMaps) {
          const series = familySeriesAccum.find((s) => s.label === label);
          if (!series) {
            familySeriesAccum.push({ label, values: [Number((map.get(t) ?? 0).toFixed(2))] });
          } else {
            series.values.push(Number((map.get(t) ?? 0).toFixed(2)));
          }
        }
      }
      setWeeklyDistanceLabels(labels);
      setWeeklyDistanceValues(values);
      setWeeklyDistanceFamilySeries(familySeriesAccum);
      const deviceNameDist = (activities.find((d: any) => d?.deviceName) as any)?.deviceName as string | undefined;
      setAttribution(deviceNameDist ? `Data sourced from Garmin (${deviceNameDist})` : null);
    } catch (e: any) {
      setWeeklyDistanceError(e?.message || 'Failed to load weekly distance');
      setWeeklyDistanceLabels([]);
      setWeeklyDistanceValues([]);
      setWeeklyDistanceFamilySeries([]);
    } finally {
      setWeeklyDistanceLoading(false);
    }
  };
  const loadPaceToHr = async (range: 'week' | '4w' | '3m' | '6m' | '12m', targetPaceMin: number, unit: 'min/mi' | 'min/km') => {
    try {
      setPaceToHrLoading(true);
      setPaceToHrError(null);
      const days = daysForRange(range);
      const listParams = new URLSearchParams();
      listParams.set('type', 'activityDetails');
      listParams.set('limit', '500');
      listParams.set('days', String(days));
      const listRes = await fetch(`/api/garmin-connect/activity/data?${listParams.toString()}`);
      if (!listRes.ok) throw new Error('Load failed');
      const listJson = await listRes.json();
      const items: any[] = Array.isArray(listJson?.data) ? listJson.data : [];
      let runs = items
        .map((it) => it?.data ? { id: it.id, data: it.data } : null)
        .filter(Boolean)
        .filter((r: any) => getCMEFamilyForActivity(r.data.activityType) === 'Running');
      // Oldest to newest (left-to-right)
      runs.sort((a: any, b: any) => Number(a.data.startTimeInSeconds) - Number(b.data.startTimeInSeconds));
      const deviceNamePace = (() => {
        const first = runs.find((r: any) => r && r.data && r.data.deviceName);
        return first && first.data ? (first.data.deviceName as string) : undefined;
      })();

      const labels: string[] = [];
      const values: number[] = [];
      const names: string[] = [];
      const durations: number[] = [];
      const distances: number[] = [];
      const tolSec = 5;

      for (const r of runs) {
        if (!r) continue;
        const recId = (r as any).id as string | number;
        const detailRes = await fetch(`/api/garmin-connect/activity/data?id=${encodeURIComponent(recId)}&type=activityDetails`);
        if (!detailRes.ok) continue;
        const detailJson = await detailRes.json();
        const d = detailJson?.data?.data;
        const samples: any[] = Array.isArray(d?.samples) ? d.samples : [];
        const date = new Date(Number(d?.startTimeInSeconds) * 1000);
        const label = isNaN(date.getTime()) ? String(recId) : date.toLocaleDateString();

        const hrArr = samples.map((s) => (typeof s.heartRate === 'number' ? s.heartRate : NaN));
        const speedArr = samples.map((s) => (typeof s.speedMetersPerSecond === 'number' ? s.speedMetersPerSecond : NaN));
        const tArr = samples.map((s, i) => {
          const t = Number(s.timerDurationInSeconds ?? s.clockDurationInSeconds ?? i);
          return Number.isFinite(t) ? t : i;
        });
        const smHrRaw = movingAverage(hrArr.map((v) => (Number.isFinite(v) ? v : 0)), 5);
        const smSpd = movingAverage(speedArr.map((v) => (Number.isFinite(v) ? v : 0)), 5);
        const bestLag = excludeRecovery ? estimateBestLag(smHrRaw, smSpd, 0, 60) : 0;
        const smHr = applyLag(smHrRaw, bestLag);
        const metersPerUnit = unit === 'min/mi' ? 1609.344 : 1000;
        const paceArr = smSpd.map((spd) => (spd > 0 ? (metersPerUnit / spd) / 60 : NaN));
        const workMask = excludeRecovery ? buildWorkMask(smSpd, tArr) : new Array(smSpd.length).fill(true);
        const keepMask = excludeRecovery ? robustKeepMask(paceArr, tArr) : new Array(paceArr.length).fill(true);

        const selectedHr: number[] = [];
        for (let i = 0; i < paceArr.length; i++) {
          const pace = paceArr[i];
          const hr = smHr[i];
          if (workMask[i] && keepMask[i] && Number.isFinite(pace) && Number.isFinite(hr) && Math.abs(pace - targetPaceMin) <= tolSec / 60) {
            const dt = i > 0 ? Math.max(1, (tArr[i] - tArr[i - 1]) || 1) : 1;
            for (let k = 0; k < dt; k++) selectedHr.push(hr as number);
          }
        }
        if (selectedHr.length > 0) {
          const avgHr = selectedHr.reduce((a, b) => a + b, 0) / selectedHr.length;
          labels.push(label);
          values.push(avgHr);
          names.push(d?.activityName || d?.activityType || String(recId));
          durations.push(Number(d?.durationInSeconds) || 0);
          const distRaw = (d as any)?.distanceInMeters;
          distances.push(typeof distRaw === 'number' ? distRaw : (typeof distRaw === 'string' ? Number(distRaw) : 0));
        }
      }

      setPaceToHrLabels(labels);
      setPaceToHrValues(values);
      setPaceToHrMeta({ names, durations, distances });
      setAttribution(deviceNamePace ? `Data sourced from Garmin (${deviceNamePace})` : null);
    } catch (e: any) {
      setPaceToHrError(e?.message || 'Failed to load Pace→HR');
      setPaceToHrLabels([]);
      setPaceToHrValues([]);
      setPaceToHrMeta({ names: [], durations: [], distances: [] });
    } finally {
      setPaceToHrLoading(false);
    }
  };

  function parsePaceToMinutes(text: string): number | null {
    const m = /^\s*(\d{1,2}):(\d{2})\s*$/.exec(text || '');
    if (!m) return null;
    const mm = Number(m[1]);
    const ss = Number(m[2]);
    if (!Number.isFinite(mm) || !Number.isFinite(ss)) return null;
    return mm + ss / 60;
  }

  // Recovery exclusion helpers
  function estimateBestLag(hr: number[], spd: number[], minLag: number, maxLag: number): number {
    let bestLag = 0;
    let bestCorr = -Infinity;
    for (let lag = minLag; lag <= maxLag; lag += 5) {
      const h = applyLag(hr, lag);
      const corr = correlation(h, spd);
      if (corr > bestCorr) { bestCorr = corr; bestLag = lag; }
    }
    return bestLag;
  }
  function applyLag(arr: number[], lagSec: number): number[] {
    const lag = Math.max(0, Math.round(lagSec));
    const pad = new Array(lag).fill(arr.length ? arr[0] : 0);
    const shifted = pad.concat(arr).slice(0, arr.length);
    return shifted;
  }
  function correlation(a: number[], b: number[]): number {
    const n = Math.min(a.length, b.length);
    if (n === 0) return 0;
    let sa = 0, sb = 0, saa = 0, sbb = 0, sab = 0;
    for (let i = 0; i < n; i++) { const x = a[i], y = b[i]; sa += x; sb += y; saa += x*x; sbb += y*y; sab += x*y; }
    const num = (n * sab - sa * sb);
    const den = Math.sqrt((n * saa - sa * sa) * (n * sbb - sb * sb));
    return den > 0 ? num / den : 0;
  }
  function percentile(arr: number[], p: number): number | null {
    const vals = arr.filter((v) => Number.isFinite(v)).slice().sort((x, y) => x - y);
    if (!vals.length) return null;
    const idx = Math.floor((p / 100) * (vals.length - 1));
    return vals[idx];
  }
  function median(arr: number[]): number {
    const vals = arr.filter((v) => Number.isFinite(v)).slice().sort((x, y) => x - y);
    if (!vals.length) return 0;
    const mid = Math.floor(vals.length / 2);
    return vals.length % 2 ? vals[mid] : (vals[mid - 1] + vals[mid]) / 2;
  }
  function buildWorkMask(speed: number[], t: number[]): boolean[] {
    const pct60 = percentile(speed, 60) || 0;
    const floor = 1.0;
    const th = Math.max(floor, pct60);
    const raw = speed.map((v) => Number.isFinite(v) && (v as number) >= th);
    const out = raw.slice();
    for (let i = 1; i < out.length - 1; i++) {
      const gap = !out[i] && out[i-1] && out[i+1];
      const dt = (t[i+1] - t[i-1]) || 2;
      if (gap && dt <= 3) out[i] = true;
    }
    let i = 0;
    while (i < out.length) {
      if (!out[i]) { i++; continue; }
      let j = i;
      while (j + 1 < out.length && out[j+1]) j++;
      const dur = (t[j] - t[i]) || (j - i);
      if (dur < 20) { for (let k = i; k <= j; k++) out[k] = false; }
      i = j + 1;
    }
    return out;
  }
  function robustKeepMask(series: number[], t: number[]): boolean[] {
    const out = new Array(series.length).fill(true);
    const w = 15; // seconds
    for (let i = 0; i < series.length; i++) {
      const t0 = t[i] - w/2, t1 = t[i] + w/2;
      const neigh: number[] = [];
      for (let k = 0; k < series.length; k++) {
        if (t[k] >= t0 && t[k] <= t1 && Number.isFinite(series[k])) neigh.push(series[k] as number);
      }
      if (neigh.length < 5 || !Number.isFinite(series[i])) { out[i] = false; continue; }
      const med = median(neigh);
      const mad = median(neigh.map((v) => Math.abs(v - med))) || 1e-6;
      const sigma = Math.abs((series[i] as number) - med) / (1.4826 * mad);
      out[i] = sigma <= 2.5;
    }
    return out;
  }

  // Initial Weekly Volume is preloaded on the server and passed via props; further loads are user-driven by control changes.

  return (
    <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-4">
      <div className="grid grid-cols-3 items-center gap-3 mb-3">
        {/* Left spacer/title */}
        <div className="flex items-center gap-3"><h3 className="text-lg font-semibold text-gray-900 dark:text-slate-900">Analysis</h3></div>

        {/* Center: Trend type (emphasis) with Fixed HR below if applicable */}
        <div className="flex flex-col items-center justify-center gap-2">
          {mode === 'trends' && (
            <>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-800">
                <span>Trend</span>
                <select
                  className="rounded border border-gray-300 dark:border-slate-400 bg-white text-gray-900 dark:text-slate-900 px-2 py-1"
                  value={trendType}
                  onChange={(e) => {
                    const val = e.target.value as TrendType;
                    setTrendType(val);
                    if (val === 'weeklyVolume') {
                      void loadWeeklyVolume(trendRange);
                    }
                    if (val === 'weeklyDistance') {
                      void loadWeeklyDistance(trendRange);
                    }
                    if (val === 'hrToPace') {
                      void loadHrToPace(trendRange, fixedHr, paceUnit);
                    }
                    if (val === 'paceToHr') {
                      const mins = parsePaceToMinutes(targetPace);
                      if (Number.isFinite(mins)) void loadPaceToHr(trendRange, mins as number, paceUnit);
                    }
                  }}
                >
                  <option value="weeklyVolume">Weekly Volume (Time)</option>
                  <option value="weeklyDistance">Weekly Volume (Distance)</option>
                  <option value="hrToPace">HR → Pace</option>
                  <option value="paceToHr">Pace → HR</option>
                </select>
              </label>
              {trendType === 'hrToPace' && (
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-800">
                  <span>Fixed HR</span>
                  <input
                    type="number"
                    min={60}
                    max={220}
                    step={1}
                    value={fixedHr}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setFixedHr(v);
                      void loadHrToPace(trendRange, v, paceUnit);
                    }}
                    className="w-20 rounded border border-gray-300 dark:border-slate-400 bg-white text-gray-900 dark:text-slate-900 px-2 py-1"
                  />
                  <span>bpm</span>
                </label>
              )}
              {trendType === 'paceToHr' && (
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-800">
                  <span>Target Pace</span>
                  <input
                    type="text"
                    value={targetPace}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTargetPace(v);
                      const mins = parsePaceToMinutes(v);
                      if (Number.isFinite(mins)) void loadPaceToHr(trendRange, mins as number, paceUnit);
                    }}
                    placeholder="mm:ss"
                    className="w-24 rounded border border-gray-300 dark:border-slate-400 bg-white text-gray-900 dark:text-slate-900 px-2 py-1"
                  />
                  <span>{paceUnit === 'min/mi' ? '/mi' : '/km'}</span>
                </label>
              )}
              {(trendType === 'hrToPace' || trendType === 'paceToHr') && (
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-800">
                  <input
                    type="checkbox"
                    checked={excludeRecovery}
                    onChange={(e) => {
                      const v = e.target.checked;
                      setExcludeRecovery(v);
                      if (trendType === 'hrToPace') {
                        void loadHrToPace(trendRange, fixedHr, paceUnit);
                      } else {
                        const mins = parsePaceToMinutes(targetPace);
                        if (Number.isFinite(mins)) void loadPaceToHr(trendRange, mins as number, paceUnit);
                      }
                    }}
                  />
                  <span>Exclude recovery</span>
                </label>
              )}
            </>
          )}
        </div>

        {/* Right: Timeframe */}
        <div className="flex items-center justify-end gap-3">
          {mode === 'trends' && (
            <>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-800">
                <span>Timeframe</span>
                <select
                  className="rounded border border-gray-300 dark:border-slate-400 bg-white text-gray-900 dark:text-slate-900 px-2 py-1"
                  value={trendRange}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setTrendRange(val);
                    if (trendType === 'weeklyVolume') {
                      void loadWeeklyVolume(val);
                    }
                    if (trendType === 'weeklyDistance') {
                      void loadWeeklyDistance(val);
                    }
                    if (trendType === 'hrToPace') {
                      void loadHrToPace(val, fixedHr, paceUnit);
                    }
                    if (trendType === 'paceToHr') {
                      const mins = parsePaceToMinutes(targetPace);
                      if (Number.isFinite(mins)) void loadPaceToHr(val, mins as number, paceUnit);
                    }
                  }}
                >
                  <option value="week">This Week</option>
                  <option value="4w">4 Weeks</option>
                  <option value="3m">3 Months</option>
                  <option value="6m">6 Months</option>
                  <option value="12m">12 Months</option>
                </select>
              </label>
            </>
          )}
        </div>
      </div>

      {mode === 'summary' && (
        <div className="flex items-center gap-4 mb-3">
          <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-slate-800"><input type="checkbox" checked={showHr} onChange={(e) => setShowHr(e.target.checked)} /> HR</label>
          <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-slate-800"><input type="checkbox" checked={showPace} onChange={(e) => setShowPace(e.target.checked)} /> Pace</label>
          <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-slate-800"><input type="checkbox" checked={showPower} onChange={(e) => setShowPower(e.target.checked)} /> Power</label>
          {/**
           * Temporarily hidden until we decide if Cadence should be included
           * <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-slate-800"><input type="checkbox" checked={showCadence} onChange={(e) => setShowCadence(e.target.checked)} /> Cadence</label>
           */}
          <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-slate-800"><input type="checkbox" checked={showElev} onChange={(e) => setShowElev(e.target.checked)} /> Elevation</label>
        </div>
      )}

      {mode === 'summary' ? (
        series.length === 0 ? (
          <div className="text-sm text-gray-600 dark:text-slate-700">Select sessions and click Compare / Analyze to begin.</div>
        ) : (
          <CMEUnifiedChart series={series} show={{ hr: showHr, pace: showPace, cadence: showCadence, elev: showElev, power: showPower }} fixedHr={undefined} paceUnit={paceUnit} />
        )
      ) : trendType === 'weeklyVolume' ? (
        weeklyLoading ? (
          <div className="text-sm text-gray-600 dark:text-slate-700">Loading weekly volume…</div>
        ) : weeklyError ? (
          <div className="text-sm text-red-700">{weeklyError}</div>
        ) : (
          <CMETrendWeeklyVolume labels={weeklyLabels} values={weeklyValues} familySeries={weeklyFamilySeries} />
        )
      ) : trendType === 'weeklyDistance' ? (
        weeklyDistanceLoading ? (
          <div className="text-sm text-gray-600 dark:text-slate-700">Loading weekly distance…</div>
        ) : weeklyDistanceError ? (
          <div className="text-sm text-red-700">{weeklyDistanceError}</div>
        ) : (
          <CMETrendWeeklyVolume labels={weeklyDistanceLabels} values={weeklyDistanceValues} familySeries={weeklyDistanceFamilySeries} yLabel={distanceUnit === 'miles' ? 'Miles' : distanceUnit === 'km' ? 'Kilometers' : 'Meters'} unitSuffix={distanceUnit === 'miles' ? 'mi' : distanceUnit === 'km' ? 'km' : 'm'} />
        )
      ) : trendType === 'hrToPace' ? (
        hrToPaceLoading ? (
          <div className="text-sm text-gray-600 dark:text-slate-700">Loading HR → Pace…</div>
        ) : hrToPaceError ? (
          <div className="text-sm text-red-700">{hrToPaceError}</div>
        ) : (
          <CMETrendHrToPace labels={hrToPaceLabels} values={hrToPaceValues} unit={paceUnit} fixedHr={fixedHr} names={hrToPaceMeta.names} durationsSec={hrToPaceMeta.durations} distancesMeters={hrToPaceMeta.distances} distanceUnit={distanceUnit} />
        )
      ) : trendType === 'paceToHr' ? (
        paceToHrLoading ? (
          <div className="text-sm text-gray-600 dark:text-slate-700">Loading Pace → HR…</div>
        ) : paceToHrError ? (
          <div className="text-sm text-red-700">{paceToHrError}</div>
        ) : (
          <CMETrendPaceToHr labels={paceToHrLabels} values={paceToHrValues} unit={paceUnit} targetPaceMin={parsePaceToMinutes(targetPace) as number} names={paceToHrMeta.names} durationsSec={paceToHrMeta.durations} distancesMeters={paceToHrMeta.distances} distanceUnit={distanceUnit} />
        )
      ) : (
        <CMEUnifiedChart series={series} show={{ hr: showHr, pace: showPace, cadence: showCadence, elev: showElev, power: showPower }} fixedHr={mode === 'trends' ? fixedHr : undefined} paceUnit={paceUnit} />
      )}
      <GarminAttribution attribution={attribution || undefined} className="mt-2" />
    </div>
  );
}

// Helpers for weekly volume (no effects, event-driven)
function daysForRange(r: 'week' | '4w' | '3m' | '6m' | '12m'): number {
  switch (r) {
    case 'week': return 7;
    case '4w': return 28;
    case '3m': return 90;
    case '6m': return 180;
    case '12m': return 365;
  }
}

function weekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const offset = day === 0 ? -6 : 1 - day; // Monday
  d.setDate(d.getDate() + offset);
  d.setHours(0, 0, 0, 0);
  return d;
}

function labelForWeekStart(d: Date): string {
  return d.toLocaleDateString();
}

// Note: This exported function is a placeholder to satisfy TS; real loader is inside component scope.


