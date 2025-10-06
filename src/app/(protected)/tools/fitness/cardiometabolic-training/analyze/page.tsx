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
  return (
    <SessionProvider>
      <CMEAnalyzeClient 
        userId={loggedInUserId} 
        initialSessions={initialSessions}
        initialDistanceUnit={distanceUnit || 'miles'}
        initialPaceUnit={initialPaceUnit}
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
