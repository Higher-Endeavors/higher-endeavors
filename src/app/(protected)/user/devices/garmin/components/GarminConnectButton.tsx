'use client';

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