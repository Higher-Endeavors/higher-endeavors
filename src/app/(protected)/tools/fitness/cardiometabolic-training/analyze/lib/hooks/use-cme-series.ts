'use client';


export type SeriesPoint = {
  t: number; // seconds from start
  hr?: number;
  pace?: number; // minutes per unit (min/mi or min/km) computed client-side
  speed?: number; // m/s
  elev?: number; // meters
  cadence?: number; // spm
  power?: number; // watts
};

export type SessionSeries = {
  id: string;
  label: string;
  points: SeriesPoint[];
};

export function movingAverage(values: number[], windowSize = 5): number[] {
  if (windowSize <= 1) return values;
  const half = Math.floor(windowSize / 2);
  return values.map((_, i) => {
    const start = Math.max(0, i - half);
    const end = Math.min(values.length - 1, i + half);
    const slice = values.slice(start, end + 1);
    const sum = slice.reduce((a, b) => a + b, 0);
    return sum / slice.length;
  });
}

export function toPace(speedMps: number, unit: 'min/mi' | 'min/km'): number | undefined {
  if (!speedMps || speedMps <= 0) return undefined;
  const metersPerUnit = unit === 'min/mi' ? 1609.344 : 1000;
  const secondsPerUnit = metersPerUnit / speedMps;
  return secondsPerUnit / 60; // minutes per unit
}

// Effect-free loader for series used by clients that avoid useEffect
export async function fetchCMESessionSeries(appliedIds: string[], unit: 'min/mi' | 'min/km'): Promise<SessionSeries[]> {
  const results: SessionSeries[] = [];
  for (const id of appliedIds) {
    const res = await fetch(`/api/garmin-connect/activity/data?id=${encodeURIComponent(id)}&type=activityDetails`);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const json = await res.json();
    const d = json?.data?.data;
    if (!d) continue;
    const samples: any[] = Array.isArray(d.samples) ? d.samples : [];
    const rawPoints: SeriesPoint[] = samples.map((s) => ({
      t: Number(s.timerDurationInSeconds ?? s.clockDurationInSeconds ?? s.startTimeInSeconds ?? 0),
      hr: typeof s.heartRate === 'number' ? s.heartRate : undefined,
      speed: typeof s.speedMetersPerSecond === 'number' ? s.speedMetersPerSecond : undefined,
      elev: typeof s.elevationInMeters === 'number' ? s.elevationInMeters : undefined,
      cadence: typeof s.stepsPerMinute === 'number' ? s.stepsPerMinute : undefined,
      power: typeof (s as any).powerInWatts === 'number'
        ? (s as any).powerInWatts
        : typeof (s as any).power === 'number'
          ? (s as any).power
          : typeof (s as any).watts === 'number'
            ? (s as any).watts
            : undefined,
    })).filter(p => Number.isFinite(p.t));
    rawPoints.sort((a, b) => a.t - b.t);
    const t0 = rawPoints.length ? rawPoints[0].t : 0;
    rawPoints.forEach(p => { p.t = Math.max(0, p.t - t0); });
    rawPoints.forEach(p => { if (typeof p.speed === 'number') p.pace = toPace(p.speed, unit); });
    const hrValues = rawPoints.map(p => p.hr ?? NaN);
    const paceValues = rawPoints.map(p => p.pace ?? NaN);
    const powerValues = rawPoints.map(p => p.power ?? NaN);
    const smHr = movingAverage(hrValues.map(v => Number.isFinite(v) ? v : 0));
    const smPace = movingAverage(paceValues.map(v => Number.isFinite(v) ? v : 0));
    const smPower = movingAverage(powerValues.map(v => Number.isFinite(v) ? v : 0));
    rawPoints.forEach((p, i) => {
      if (Number.isFinite(hrValues[i])) p.hr = smHr[i];
      if (Number.isFinite(paceValues[i])) p.pace = smPace[i];
      if (Number.isFinite(powerValues[i])) p.power = smPower[i];
    });
    results.push({ id, label: d.activityName || d.activityType || id, points: rawPoints });
  }
  return results;
}


