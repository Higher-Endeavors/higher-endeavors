/**
 * Get the week of the year for a given date (1-52)
 * @param date - The date to get the week number for
 * @returns Week number of the year (1-52)
 */
export function getWeekOfYear(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

/**
 * Calculate the current week in a plan based on the start date
 * Uses the same week-of-year calculation as the Gantt Chart
 * @param planStartDate - The start date of the plan
 * @param totalWeeks - Total number of weeks in the plan
 * @returns The current week number (0-based) or null if outside plan range
 */
export function calculateCurrentWeek(planStartDate: Date, totalWeeks: number): number | null {
  const now = new Date();
  
  const currentWeekOfYear = getWeekOfYear(now);
  const planStartWeekOfYear = getWeekOfYear(planStartDate);
  
  // Calculate which week of the plan we're in (0-based)
  let currentPlanWeek = currentWeekOfYear - planStartWeekOfYear;
  
  // Handle year boundary crossing
  if (currentPlanWeek < 0) {
    currentPlanWeek += 52; // Add 52 weeks for next year
  }
  
  // Return null if we're before the plan starts or after it ends
  if (currentPlanWeek < 0 || currentPlanWeek >= totalWeeks) {
    return null;
  }
  
  return currentPlanWeek;
}

/**
 * Get the date for a specific week in the plan
 * @param planStartDate - The start date of the plan
 * @param weekNumber - The week number (0-based)
 * @returns The date for that week
 */
export function getWeekDate(planStartDate: Date, weekNumber: number): Date {
  const weekDate = new Date(planStartDate);
  weekDate.setDate(weekDate.getDate() + (weekNumber * 7));
  return weekDate;
}

/**
 * Format a date for display in the plan context
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatPlanDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Calculate plan progress percentage
 * @param currentWeek - Current week (0-based)
 * @param totalWeeks - Total weeks in plan
 * @returns Progress percentage (0-100)
 */
export function calculatePlanProgress(currentWeek: number, totalWeeks: number): number {
  return Math.min(100, Math.max(0, ((currentWeek + 1) / totalWeeks) * 100));
}

/**
 * Debug utility to help troubleshoot week calculations
 * @param planStartDate - The start date of the plan
 * @param totalWeeks - Total number of weeks in the plan
 * @returns Debug information about week calculations
 */
export function debugWeekCalculation(planStartDate: Date, totalWeeks: number) {
  const now = new Date();
  const currentWeekOfYear = getWeekOfYear(now);
  const planStartWeekOfYear = getWeekOfYear(planStartDate);
  
  let currentPlanWeek = currentWeekOfYear - planStartWeekOfYear;
  const yearBoundaryCrossed = currentPlanWeek < 0;
  
  if (yearBoundaryCrossed) {
    currentPlanWeek += 52;
  }
  
  return {
    now: now.toISOString(),
    currentWeekOfYear,
    planStartWeekOfYear,
    planStartDate: planStartDate.toISOString(),
    currentPlanWeek,
    yearBoundaryCrossed,
    withinPlanRange: currentPlanWeek >= 0 && currentPlanWeek < totalWeeks,
    totalWeeks,
  };
}
