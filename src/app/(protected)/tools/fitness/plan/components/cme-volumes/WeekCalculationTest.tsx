import React from 'react';
import { calculateCurrentWeek, getWeekOfYear, debugWeekCalculation } from './utils';

interface WeekCalculationTestProps {
  planStartDate: Date;
  totalWeeks: number;
}

export default function WeekCalculationTest({ planStartDate, totalWeeks }: WeekCalculationTestProps) {
  const now = new Date();
  const currentWeekOfYear = getWeekOfYear(now);
  const planStartWeekOfYear = getWeekOfYear(planStartDate);
  const calculatedCurrentWeek = calculateCurrentWeek(planStartDate, totalWeeks);
  const debugInfo = debugWeekCalculation(planStartDate, totalWeeks);

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h4 className="text-sm font-medium text-yellow-800 mb-2">Week Calculation Test (Debug)</h4>
      <div className="text-xs text-yellow-700 space-y-1">
        <div><strong>Current Date:</strong> {now.toISOString()}</div>
        <div><strong>Current Week of Year:</strong> {currentWeekOfYear}</div>
        <div><strong>Plan Start Date:</strong> {planStartDate.toISOString()}</div>
        <div><strong>Plan Start Week of Year:</strong> {planStartWeekOfYear}</div>
        <div><strong>Calculated Current Week (0-based):</strong> {calculatedCurrentWeek}</div>
        <div><strong>Within Plan Range:</strong> {debugInfo.withinPlanRange ? 'Yes' : 'No'}</div>
        <div><strong>Year Boundary Crossed:</strong> {debugInfo.yearBoundaryCrossed ? 'Yes' : 'No'}</div>
      </div>
    </div>
  );
}
