interface SessionTrackerProps {
  breathCount: number;
  sessionDuration: number;
  isActive: boolean;
  wakeLockActive?: boolean;
  wakeLockSupported?: boolean;
}

export function SessionTracker({ breathCount, sessionDuration, isActive, wakeLockActive, wakeLockSupported }: SessionTrackerProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Session Progress</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{breathCount}</div>
          <div className="text-sm text-gray-600">Breaths Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{formatDuration(sessionDuration)}</div>
          <div className="text-sm text-gray-600">Session Duration</div>
        </div>
      </div>

      {/* Session Status */}
      <div className="mt-6 text-center">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
          }`}></div>
          {isActive ? 'Session Active' : 'Session Inactive'}
        </div>
      </div>

      {/* Progress Bar for Duration Sessions */}
      {isActive && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ 
                width: `${Math.min((sessionDuration / 60) * 100, 100)}%` 
              }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1 text-center">
            Progress: {Math.round((sessionDuration / 60) * 100)}%
          </div>
        </div>
      )}
    </div>
  );
}
