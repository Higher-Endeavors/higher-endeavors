"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import PRList from "./components/PRList";
import TimeframeSelectorOld from "./components/TimeframeSelectorOld";
import { usePerformanceRecords } from "./lib/hooks/usePerformanceRecords";
import { useStructuralBalanceAnalysis } from "./lib/hooks/useStructuralBalanceAnalysis";

export default function PerformanceRecordsPage() {
  const { data: session } = useSession();
  const [timeframe, setTimeframe] = useState('all');
  
  const { data, isLoading, error, refetch } = usePerformanceRecords(
    session?.user?.id ? parseInt(session.user.id) : 0,
    timeframe
  );

  const { 
    data: structuralBalanceData, 
    isLoading: isStructuralBalanceLoading, 
    error: structuralBalanceError 
  } = useStructuralBalanceAnalysis(
    session?.user?.id ? parseInt(session.user.id) : 0
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
        
        <TimeframeSelectorOld 
          selectedTimeframe={timeframe} 
          onTimeframeChange={setTimeframe} 
        />
      </div>
      
      {data && (
        <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Showing {data.totalRecords} records across {data.totalExercises} exercises
          {structuralBalanceData && structuralBalanceData.totalImbalances > 0 && (
            <span className="ml-4 text-orange-600 dark:text-orange-400 font-medium">
              • {structuralBalanceData.totalImbalances} structural balance issue{structuralBalanceData.totalImbalances !== 1 ? 's' : ''} detected
            </span>
          )}
        </div>
      )}
      
      <PRList 
        records={data?.records || {}} 
        imbalances={structuralBalanceData?.imbalances || {}}
        isLoading={isLoading} 
        error={error} 
      />
    </div>
  );
}
