import { auth } from 'auth';
import { SessionProvider } from 'next-auth/react';
import CMEAnalyzeClient from '(protected)/tools/fitness/cardiometabolic-training/analyze/components/CMEAnalyzeClient';
import { getUserSettings } from 'lib/actions/userSettings';
import { getActivityData, getActivityDataById } from 'api/garmin-connect/activity/lib/activity-data-utils';
import type { CMESessionSummary } from '(protected)/tools/fitness/cardiometabolic-training/analyze/types/analysis';
import { getCMEFamilyForActivity } from '(protected)/tools/fitness/cardiometabolic-training/lib/activity-mapping';

export default async function AnalyzePage() {
  const session = await auth();
  const loggedInUserId = session?.user?.id ? Number(session.user.id) : 1;
  // Load initial user settings (pace unit and distance unit)
  const settings = await getUserSettings();
  const distanceUnit = settings?.general?.distanceUnit as 'miles' | 'km' | 'm' | undefined;
  const initialPaceUnit: 'min/mi' | 'min/km' = distanceUnit === 'miles' ? 'min/mi' : 'min/km';

  // Load initial sessions (server-side) for the selector
  const records = await getActivityData({ userId: loggedInUserId, dataType: 'activityDetails', limit: 200 });
  const fullRecords = await Promise.all(records.map(async (r) => (await getActivityDataById('activityDetails', r.id)) || r));
  const initialSessions: CMESessionSummary[] = fullRecords.map((item: any) => {
    const d = item.data;
    const recordId = Number(item.id);
    const date = new Date(Number(d.startTimeInSeconds) * 1000);
    const dateLabel = isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
    // Coerce numeric fields that may come back as strings
    const rawDistance = (d as any).distanceInMeters;
    const distanceMeters = typeof rawDistance === 'number' ? rawDistance : (typeof rawDistance === 'string' ? Number(rawDistance) : undefined);
    const rawDuration = (d as any).durationInSeconds;
    const durationSeconds = typeof rawDuration === 'number' ? rawDuration : (typeof rawDuration === 'string' ? Number(rawDuration) : 0);
    const rawAvgSpeed = (d as any).averageSpeedInMetersPerSecond;
    const avgSpeedMps = typeof rawAvgSpeed === 'number' ? rawAvgSpeed : (typeof rawAvgSpeed === 'string' ? Number(rawAvgSpeed) : undefined);
    const rawCalories = (d as any).activeKilocalories;
    const caloriesKcal = typeof rawCalories === 'number' ? rawCalories : (typeof rawCalories === 'string' ? Number(rawCalories) : undefined);
    let distanceLabel = '-';
    if (typeof distanceMeters === 'number') {
      if (distanceUnit === 'miles') distanceLabel = `${(distanceMeters / 1609.344).toFixed(2)} mi`;
      else if (distanceUnit === 'km') distanceLabel = `${(distanceMeters / 1000).toFixed(2)} km`;
      else distanceLabel = `${Math.round(distanceMeters)} m`;
    }
    const family = getCMEFamilyForActivity(d.activityType);
    return {
      recordId,
      summaryId: String(d.summaryId),
      displayName: `${dateLabel} · ${d.activityType}${d.activityName ? ` · ${d.activityName}` : ''}`,
      date: dateLabel,
      activityType: d.activityType,
      durationSeconds,
      durationLabel: formatDuration(durationSeconds),
      distanceMeters,
      distanceLabel,
      family: family || undefined,
      caloriesKcal,
      avgSpeedMps,
    } as CMESessionSummary;
  });
  // Preload Weekly Volume (Time) for default Trends (4 Weeks)
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 28);
  const weekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const offset = day === 0 ? -6 : 1 - day; // Monday-start
    d.setDate(d.getDate() + offset);
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const labelForWeekStart = (d: Date): string => d.toLocaleDateString();
  const weekKeyToMinutes = new Map<number, number>();
  const familyToWeekKeyMinutes = new Map<string, Map<number, number>>();
  const detailed = fullRecords
    .map((r: any) => r?.data)
    .filter((d: any) => !!d && typeof d.startTimeInSeconds !== 'undefined');
  for (const d of detailed) {
    const dt = new Date(Number(d.startTimeInSeconds) * 1000);
    if (dt < startDate || dt > now) continue;
    const fam = getCMEFamilyForActivity(d.activityType);
    if (!fam) continue; // only CME-related
    const key = weekStart(dt).getTime();
    const minutes = Math.round((Number(d.durationInSeconds) || 0) / 60);
    weekKeyToMinutes.set(key, (weekKeyToMinutes.get(key) || 0) + minutes);
    if (!familyToWeekKeyMinutes.has(fam)) familyToWeekKeyMinutes.set(fam, new Map<number, number>());
    const famMap = familyToWeekKeyMinutes.get(fam)!;
    famMap.set(key, (famMap.get(key) || 0) + minutes);
  }
  const endWeek = weekStart(now).getTime();
  const startWeek = weekStart(startDate).getTime();
  const initialWeeklyLabels: string[] = [];
  const initialWeeklyValues: number[] = [];
  const initialWeeklyFamilySeries: { label: string; values: number[] }[] = [];
  const families = Array.from(familyToWeekKeyMinutes.keys());
  const famMaps = families.map((f) => ({ label: f, map: familyToWeekKeyMinutes.get(f)! }));
  for (let t = startWeek; t <= endWeek; t += 7 * 24 * 60 * 60 * 1000) {
    initialWeeklyLabels.push(labelForWeekStart(new Date(t)));
    initialWeeklyValues.push(weekKeyToMinutes.get(t) ?? 0);
    for (const { label, map } of famMaps) {
      const series = initialWeeklyFamilySeries.find((s) => s.label === label);
      if (!series) {
        initialWeeklyFamilySeries.push({ label, values: [map.get(t) ?? 0] });
      } else {
        series.values.push(map.get(t) ?? 0);
      }
    }
  }
  const firstWithDevice = detailed.find((d: any) => d?.deviceName);
  const initialWeeklyAttribution = firstWithDevice?.deviceName ? `Data sourced from Garmin (${firstWithDevice.deviceName})` : undefined;
  return (
    <SessionProvider>
      <CMEAnalyzeClient 
        userId={loggedInUserId} 
        initialSessions={initialSessions}
        initialDistanceUnit={distanceUnit || 'miles'}
        initialPaceUnit={initialPaceUnit}
        initialWeekly={{ labels: initialWeeklyLabels, values: initialWeeklyValues, familySeries: initialWeeklyFamilySeries, attribution: initialWeeklyAttribution }}
      />
    </SessionProvider>
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
