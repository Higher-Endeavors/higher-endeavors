'use client';

import { useEffect, useState } from 'react';
import { useSession, SessionProvider } from 'next-auth/react';

interface Props {
  isConnected: boolean;
  userId?: string;
}

export function GarminConnectButton({ isConnected, userId }: Props) {
  const handleConnect = () => {
    window.location.href = '/api/garmin/connect';
  };

  const handleDisconnect = async () => {
    try {
      const response = await fetch('/api/garmin/disconnect', {
        method: 'POST',
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {isConnected ? (
        <>
          <p className="text-green-600">
            Connected to Garmin (User ID: {userId})
          </p>
          <button
            onClick={handleDisconnect}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Disconnect from Garmin
          </button>
        </>
      ) : (
        <button
          onClick={handleConnect}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Connect to Garmin
        </button>
      )}
    </div>
  );
}

function GarminPageContent() {
  const { data: session } = useSession({ required: true });
  const userId = session?.user?.id;
  const [isConnected, setIsConnected] = useState(false);
  const [garminUserId, setGarminUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (userId) {
      fetch(`/api/garmin/status?userId=${userId}`)
        .then(res => res.json())
        .then(data => {
          setIsConnected(data.connected);
          setGarminUserId(data.garminUserId);
        })
        .catch(err => console.error('Error checking Garmin connection:', err));
    }
  }, [userId]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Garmin Connection</h1>
      <GarminConnectButton isConnected={isConnected} userId={garminUserId} />
    </div>
  );
}

export default function GarminPage() {
  return (
    <SessionProvider>
      <GarminPageContent />
    </SessionProvider>
  );
}