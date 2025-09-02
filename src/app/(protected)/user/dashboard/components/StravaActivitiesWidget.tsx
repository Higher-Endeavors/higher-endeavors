'use client'

import Link from 'next/link';

interface StravaActivity {
  strava_activity_id: number;
  name: string;
  sport_type: string;
  start_date: string;
  distance?: number;
  moving_time?: number;
  total_elevation_gain?: number;
  average_speed?: number;
  calories?: number;
}

interface StravaActivitiesWidgetProps {
  activities: StravaActivity[];
  isLoading?: boolean;
  error?: string;
}

const StravaActivitiesWidget = ({ activities, isLoading, error }: StravaActivitiesWidgetProps) => {
  // Determine connection status based on data availability
  const hasActivities = activities && activities.length > 0;
  const isConnected = hasActivities || (!isLoading && !error);

  const formatDistance = (distance?: number) => {
    if (!distance) return null;
    return (distance / 1000).toFixed(1) + ' km';
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-[#e0e0e0] rounded-lg border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Recent Strava Activities</h3>
          <img 
            src="/api_logo_pwrdBy_strava_horiz_orange.svg" 
            alt="Strava" 
            className="h-4 w-auto opacity-60"
          />
        </div>
        <div className="text-center py-4">
          <p className="text-gray-600 mb-3">Connect your Strava account to see recent activities</p>
          <Link 
            href="/user/settings"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Connect Strava →
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#e0e0e0] rounded-lg border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Recent Strava Activities</h3>
          <img 
            src="/api_logo_pwrdBy_strava_horiz_orange.svg" 
            alt="Strava" 
            className="h-4 w-auto opacity-60"
          />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-[#e0e0e0] rounded-lg border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Recent Strava Activities</h3>
          <img 
            src="/api_logo_pwrdBy_strava_horiz_orange.svg" 
            alt="Strava" 
            className="h-4 w-auto opacity-60"
          />
        </div>
        <div className="text-center py-4">
          <p className="text-red-600 mb-3">Error loading activities</p>
          <Link 
            href="/user/settings"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Check Settings →
          </Link>
        </div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white dark:bg-[#e0e0e0] rounded-lg border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Recent Strava Activities</h3>
          <img 
            src="/api_logo_pwrdBy_strava_horiz_orange.svg" 
            alt="Strava" 
            className="h-4 w-auto opacity-60"
          />
        </div>
        <div className="text-center py-4">
          <p className="text-gray-600 mb-3">No activities found</p>
          <Link 
            href="/user/settings"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Sync Activities →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#e0e0e0] rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Recent Strava Activities</h3>
        <img 
          src="/api_logo_pwrdBy_strava_horiz_orange.svg" 
          alt="Strava" 
          className="h-4 w-auto opacity-60"
        />
      </div>
      <div className="space-y-3">
        {activities.slice(0, 5).map((activity) => (
          <div key={activity.strava_activity_id} className="border-b border-gray-100 pb-2 last:border-b-0">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-800 truncate">
                  {activity.name}
                </h4>
                <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                  <span className="capitalize">{activity.sport_type}</span>
                  <span>•</span>
                  <span>{formatDate(activity.start_date)}</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                  {formatDistance(activity.distance) && (
                    <span>{formatDistance(activity.distance)}</span>
                  )}
                  {formatDuration(activity.moving_time) && (
                    <span>{formatDuration(activity.moving_time)}</span>
                  )}
                  {activity.calories && (
                    <span>{activity.calories} cal</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100">
        <Link 
          href="/user/settings"
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          View All Activities →
        </Link>
      </div>
    </div>
  );
};

export default StravaActivitiesWidget;
