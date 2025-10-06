'use client';

import type { CMESessionSummary } from '(protected)/tools/fitness/cardiometabolic-training/analyze/types/analysis';
import { getCMEFamilyForActivity, type CMEFamily } from '(protected)/tools/fitness/cardiometabolic-training/lib/activity-mapping';

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (hrs > 0) parts.push(`${hrs}h`);
  if (mins > 0) parts.push(`${mins}m`);
  if (parts.length === 0) parts.push(`${seconds % 60}s`);
  return parts.join(' ');
}

export async function fetchCMESessions(distanceUnit: 'miles' | 'km' | 'm' = 'miles'): Promise<CMESessionSummary[]> {
  const params = new URLSearchParams();
  params.set('type', 'activityDetails');
  params.set('limit', '500');
  params.set('days', '365');
  const res = await fetch(`/api/garmin-connect/activity/data?${params.toString()}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const json = await res.json();
  if (!json.success || !Array.isArray(json.data)) throw new Error('Invalid response');
  return json.data.map((item: any) => {
    const d = item.data;
    const recordId = Number(item.id);
    const date = new Date(Number(d.startTimeInSeconds) * 1000);
    const dateLabel = isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
    const distanceMeters = typeof d.distanceInMeters === 'number' ? d.distanceInMeters : undefined;
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
      durationSeconds: d.durationInSeconds,
      durationLabel: formatDuration(d.durationInSeconds),
      distanceMeters,
      distanceLabel,
      family: family || undefined,
    } as CMESessionSummary;
  });
}


