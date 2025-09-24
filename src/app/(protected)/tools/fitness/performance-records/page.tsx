"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import PRList from "./components/PRList";
import PRListOld from "./components/PRListOld";
import TimeframeSelectorOld from "./components/TimeframeSelectorOld";
import { usePerformanceRecords } from "./lib/hooks/usePerformanceRecords";

export default function PerformanceRecordsPage() {
  const { data: session } = useSession();
  const [useCardLayout, setUseCardLayout] = useState(true);
  const [timeframe, setTimeframe] = useState('all');
  
  const { data, isLoading, error, refetch } = usePerformanceRecords(
    session?.user?.id ? parseInt(session.user.id) : 0,
    timeframe
  );

  if (!session?.user?.id) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Performance Records</h1>
          <p className="text-gray-600 dark:text-gray-400">Please sign in to view your performance records.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Performance Records</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Your personal records across all resistance training exercises
        </p>
        
        <div className="flex items-center space-x-6">
          <TimeframeSelectorOld 
            selectedTimeframe={timeframe} 
            onTimeframeChange={setTimeframe} 
          />
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Layout:
            </label>
            <button
              onClick={() => setUseCardLayout(true)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                useCardLayout
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setUseCardLayout(false)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                !useCardLayout
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>
      
      {data && (
        <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Showing {data.totalRecords} records across {data.totalExercises} exercises
        </div>
      )}
      
      {useCardLayout ? (
        <PRList 
          records={data?.records || {}} 
          isLoading={isLoading} 
          error={error} 
        />
      ) : (
        <PRListOld 
          records={data?.records || {}} 
          isLoading={isLoading} 
          error={error} 
        />
      )}
    </div>
  );
}
