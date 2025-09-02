import { useState, useEffect } from 'react';
import { getStravaConnectionStatus } from '@/app/(protected)/user/settings/lib/actions/stravaActions';

interface StravaConnectionStatus {
  connected: boolean;
  lastSync: string | null;
  athleteId: number | null;
}

export function useStravaConnection() {
  const [status, setStatus] = useState<StravaConnectionStatus>({
    connected: false,
    lastSync: null,
    athleteId: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const connectionStatus = await getStravaConnectionStatus();
      setStatus(connectionStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check Strava status');
      console.error('Error checking Strava status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial status check on mount
  useEffect(() => {
    checkStatus();
  }, []);

  return {
    status,
    isLoading,
    error,
    refreshStatus: checkStatus,
  };
}
