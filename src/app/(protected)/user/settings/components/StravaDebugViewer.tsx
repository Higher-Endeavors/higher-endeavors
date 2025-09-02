'use client'

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface StravaDebugData {
  success: boolean;
  connection?: {
    id: number;
    athlete_id: number;
    last_sync: string | null;
    is_active: boolean;
  };
  athlete?: any;
  activities?: any[];
  activityCount?: number;
  sampleActivity?: any;
  error?: string;
  message?: string;
}

const StravaDebugViewer = () => {
  const { data: session } = useSession();
  const [debugData, setDebugData] = useState<StravaDebugData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDebugData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/strava-debug');
      const data = await response.json();
      setDebugData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchDebugData();
    }
  }, [session]);

  if (loading) {
    return <div className="p-4">Loading Strava debug data...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-red-800 font-medium">Error</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchDebugData}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!debugData) {
    return <div className="p-4">No debug data available</div>;
  }

  if (!debugData.success) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h3 className="text-yellow-800 font-medium">Issue</h3>
        <p className="text-yellow-600">{debugData.error}</p>
        <p className="text-yellow-600 text-sm mt-1">{debugData.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Strava Debug Data</h3>
        <button 
          onClick={fetchDebugData}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Connection Info */}
      {debugData.connection && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium mb-2 text-gray-900">Connection Status</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-900">
            <div>Connection ID: {debugData.connection.id}</div>
            <div>Athlete ID: {debugData.connection.athlete_id}</div>
            <div>Last Sync: {debugData.connection.last_sync || 'Never'}</div>
            <div>Active: {debugData.connection.is_active ? 'Yes' : 'No'}</div>
          </div>
        </div>
      )}

      {/* Athlete Profile */}
      {debugData.athlete && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium mb-2 text-gray-900">Athlete Profile</h4>
          <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40 text-gray-900">
            {JSON.stringify(debugData.athlete, null, 2)}
          </pre>
        </div>
      )}

      {/* Activities Summary */}
      {debugData.activities && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium mb-2 text-gray-900">Activities ({debugData.activityCount})</h4>
          <div className="space-y-2">
            {debugData.activities.map((activity, index) => (
              <div key={activity.id} className="bg-white p-2 rounded border text-sm">
                <div className="font-medium text-gray-900">{activity.name || 'Unnamed Activity'}</div>
                <div className="text-gray-600">
                  {activity.sport_type} • {new Date(activity.start_date).toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  ID: {activity.id} • Distance: {activity.distance}m • Time: {activity.moving_time}s
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sample Activity Raw Data */}
      {debugData.sampleActivity && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium mb-2 text-gray-900">Sample Activity Raw Data</h4>
          <p className="text-sm text-gray-600 mb-2">
            This shows the exact structure of data returned by Strava API
          </p>
          <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-96 text-gray-900">
            {JSON.stringify(debugData.sampleActivity, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default StravaDebugViewer;
