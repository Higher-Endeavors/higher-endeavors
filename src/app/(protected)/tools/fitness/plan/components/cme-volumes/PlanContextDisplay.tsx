import React from 'react';
import type { CMEVolumeContext } from './cme-volumes.zod';
import { formatPlanDate, calculatePlanProgress, debugWeekCalculation } from './utils';

interface PlanContextDisplayProps {
  planContext?: CMEVolumeContext;
}

export default function PlanContextDisplay({ planContext }: PlanContextDisplayProps) {
  if (!planContext) return null;


  const getCurrentWeekInfo = () => {
    if (planContext.currentWeek === undefined || planContext.currentWeek === null) return null;
    
    const currentDate = new Date(planContext.planStartDate);
    currentDate.setDate(currentDate.getDate() + (planContext.currentWeek * 7));
    
    return {
      weekNumber: planContext.currentWeek + 1,
      date: currentDate,
    };
  };

  const currentWeek = getCurrentWeekInfo();
  
  // Debug information (remove in production)
  const debugInfo = debugWeekCalculation(planContext.planStartDate, planContext.totalWeeks);
  
  // Console log for debugging
  console.log('CME Volumes Plan Context Debug:', debugInfo);

  return (
    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-1">Plan Context</h4>
          <div className="text-xs text-slate-600 space-y-1">
            <div>Start Date: {formatPlanDate(planContext.planStartDate)}</div>
            <div>Total Duration: {planContext.totalWeeks} weeks</div>
            {currentWeek ? (
              <div className="text-sky-600 font-medium">
                Current Week: Week {currentWeek.weekNumber} ({formatPlanDate(currentWeek.date)})
              </div>
            ) : (
              <div className="text-amber-600 font-medium">
                Outside Plan Range
              </div>
            )}
            {/* Debug info - remove in production */}
            <div className="text-xs text-slate-400 mt-2">
              Debug: Current Week of Year: {debugInfo.currentWeekOfYear}, Plan Start Week: {debugInfo.planStartWeekOfYear}, Calculated Plan Week: {debugInfo.currentPlanWeek}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">Plan Progress</div>
          <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
            <div 
              className={`h-full transition-all duration-300 ${
                planContext.currentWeek !== null && planContext.currentWeek !== undefined
                  ? 'bg-sky-400' 
                  : 'bg-amber-400'
              }`}
              style={{ 
                width: `${planContext.currentWeek !== null && planContext.currentWeek !== undefined
                  ? calculatePlanProgress(planContext.currentWeek, planContext.totalWeeks)
                  : 0}%` 
              }}
            />
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {planContext.currentWeek !== null && planContext.currentWeek !== undefined
              ? `${Math.round(calculatePlanProgress(planContext.currentWeek, planContext.totalWeeks))}%`
              : 'N/A'
            }
          </div>
        </div>
      </div>
    </div>
  );
}
