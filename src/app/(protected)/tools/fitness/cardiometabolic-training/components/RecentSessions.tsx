import Link from 'next/link';
import { auth } from 'auth';
import { SingleQuery } from 'lib/dbAdapter';
import { getActivityData, getActivityDataById } from 'api/garmin-connect/activity/lib/activity-data-utils';
import { getUserSettings } from 'lib/actions/userSettings';
import type { ActivityData } from 'api/garmin-connect/activity/types';
import { isCMEActivity, getCMEIconForActivityType } from '(protected)/tools/fitness/cardiometabolic-training/lib/activity-mapping';

type RecentSessionsProps = {
  page?: number;
  perPage?: number;
};

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const parts = [] as string[];
  if (hrs > 0) parts.push(`${hrs}h`);
  if (mins > 0) parts.push(`${mins}m`);
  if (hrs === 0 && mins === 0) parts.push(`${secs}s`);
  return parts.join(' ');
}

function formatDistance(meters: number | undefined, unit: 'miles' | 'km' | 'm'): string {
  if (!meters || meters <= 0) return '-';
  if (unit === 'miles') {
    const miles = meters / 1609.344;
    return `${miles.toFixed(2)} mi`;
  }
  if (unit === 'km') {
    const km = meters / 1000;
    return `${km.toFixed(2)} km`;
  }
  return `${Math.round(meters)} m`;
}

function formatDateFromEpoch(epochSeconds: number | string, offsetSeconds: number | string, _hour12: boolean): string {
  const epoch = Number(epochSeconds);
  const offset = Number(offsetSeconds);
  if (!Number.isFinite(epoch) || !Number.isFinite(offset)) return '-';
  const date = new Date((epoch + offset) * 1000);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
}

export default async function RecentSessions(props: RecentSessionsProps) {
  const perPage = Math.max(1, Math.min(props.perPage ?? 5, 25));
  const page = Math.max(1, props.page ?? 1);
  const offset = (page - 1) * perPage;

  const session = await auth();
  if (!session?.user?.email) {
    return (
      <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6 mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-slate-900">Recent Sessions</h3>
        <p className="text-sm text-gray-600 dark:text-slate-700">Please sign in to view your recent sessions.</p>
      </div>
    );
  }

  const settings = await getUserSettings();
  const distanceUnit = (settings?.general?.distanceUnit ?? 'miles') as 'miles' | 'km' | 'm';
  const hour12 = settings?.general?.timeFormat ? settings.general.timeFormat === '12h' : true;

  const userResult = await SingleQuery('SELECT id FROM users WHERE email = $1', [session.user.email]);
  const userId = userResult.rows[0]?.id as number | undefined;
  if (!userId) {
    return (
      <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6 mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-slate-900">Recent Sessions</h3>
        <p className="text-sm text-gray-600 dark:text-slate-700">User not found.</p>
      </div>
    );
  }

  // Fetch a larger batch to allow filtering to CME activities before paginating
  const fetchLimit = Math.max(perPage * 20, 100);
  const base = await getActivityData({
    userId,
    dataType: 'activityDetails',
    limit: fetchLimit,
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
  });

  const full = await Promise.all(
    base.map(async (r) => (await getActivityDataById(r.dataType, r.id)) ?? r)
  );

  const filtered = (full.map((r) => r.data) as ActivityData[])
    .filter(a => a?.activityType && isCMEActivity(a.activityType));
  const totalFiltered = filtered.length;
  const items = filtered.slice(offset, offset + perPage);

  return (
    <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-900">Recent Sessions</h3>
        <Link href="/tools/fitness/cardiometabolic-training/analyze" className="text-sm text-blue-700 dark:text-blue-800 hover:underline">
          View all
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-slate-700">No recent sessions found.</p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-slate-300">
          {items.map((a) => (
            <li key={a.summaryId} className="py-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded bg-white dark:bg-white text-sm">
                      {getCMEIconForActivityType(a.activityType)}
                    </span>
                    <span className="font-medium truncate text-gray-900 dark:text-slate-900">{a.activityName ?? a.activityType ?? 'Activity'}</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-slate-700">
                    {formatDateFromEpoch(a.startTimeInSeconds as any, a.startTimeOffsetInSeconds as any, hour12)} · {a.activityType}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-900 dark:text-slate-900">
                  <div><span className="text-gray-600 dark:text-slate-700">Duration:</span> {formatDuration(a.durationInSeconds)}</div>
                  <div><span className="text-gray-600 dark:text-slate-700">Distance:</span> {formatDistance(a.distanceInMeters, distanceUnit)}</div>
                  {typeof a.averageHeartRateInBeatsPerMinute === 'number' && (
                    <div><span className="text-gray-600 dark:text-slate-700">Avg HR:</span> {a.averageHeartRateInBeatsPerMinute} bpm</div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex items-center justify-between">
        <Link
          href={`?page=${Math.max(1, page - 1)}`}
          className={`px-3 py-1 rounded border border-gray-300 dark:border-slate-400 text-sm text-gray-900 dark:text-slate-900 ${page === 1 ? 'pointer-events-none opacity-50' : 'hover:bg-gray-200 dark:hover:bg-gray-300'}`}
          aria-disabled={page === 1}
        >
          Prev
        </Link>
        <div className="text-xs text-gray-600 dark:text-slate-700">Page {page}</div>
        <Link
          href={`?page=${page + 1}`}
          className={`px-3 py-1 rounded border border-gray-300 dark:border-slate-400 text-sm text-gray-900 dark:text-slate-900 ${(offset + perPage) >= totalFiltered ? 'pointer-events-none opacity-50' : 'hover:bg-gray-200 dark:hover:bg-gray-300'}`}
          aria-disabled={(offset + perPage) >= totalFiltered}
        >
          Next
        </Link>
      </div>
    </div>
  );
}


