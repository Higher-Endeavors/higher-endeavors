import { SingleQuery } from '@/app/lib/dbAdapter';

/**
 * Gets the internal user ID from a Garmin user ID
 * @param garminUserId The Garmin user ID
 * @returns The internal user ID or null if not found
 */
export async function getUserIdFromGarminId(garminUserId: string): Promise<number | null> {
  try {
    const result = await SingleQuery(
      'SELECT user_id FROM user_garmin_tokens WHERE garmin_user_id = $1',
      [garminUserId]
    );
    
    return result.rows.length > 0 ? result.rows[0].user_id : null;
  } catch (error) {
    console.error('Error getting user ID from Garmin ID:', error);
    return null;
  }
}

/**
 * Validates if the user has the required Garmin permission
 * @param userId The internal user ID
 * @param permission The permission to check, e.g. 'WORKOUT_IMPORT'
 * @returns True if the user has the permission, false otherwise
 */
export async function userHasGarminPermission(userId: number, permission: string): Promise<boolean> {
  try {
    const result = await SingleQuery(
      'SELECT permissions FROM user_garmin_tokens WHERE user_id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return false;
    }
    
    const permissions = result.rows[0].permissions;
    
    // If permissions is a string array in JSON format
    if (permissions && typeof permissions === 'string') {
      try {
        const parsedPermissions = JSON.parse(permissions);
        return Array.isArray(parsedPermissions) && parsedPermissions.includes(permission);
      } catch (e) {
        return false;
      }
    }
    
    // If permissions is a PostgreSQL array
    return Array.isArray(permissions) && permissions.includes(permission);
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
}

/**
 * Helper function to format date strings consistently
 * @param date Date object or string to format
 * @returns Formatted date string in YYYY-MM-DD format
 */
export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    // Try to parse the string as a date
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      // If parsing fails, assume it's already in the correct format
      return date;
    }
    date = dateObj;
  }
  
  return date.toISOString().split('T')[0];
}

/**
 * Helper function to check if the given value is a valid ISO date string
 * @param dateString The string to check
 * @returns True if the string is a valid ISO date, false otherwise
 */
export function isValidDateString(dateString: string): boolean {
  if (!dateString) return false;
  
  // Check basic format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  
  // Check if it's a valid date
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Update permissions for a Garmin user
 * @param garminUserId The Garmin user ID
 * @param permissions Array of permission strings
 */
export async function updateGarminPermissions(garminUserId: string, permissions: string[]): Promise<boolean> {
  try {
    await SingleQuery(
      'UPDATE user_garmin_tokens SET permissions = $1 WHERE garmin_user_id = $2',
      [permissions, garminUserId]
    );
    return true;
  } catch (error) {
    console.error('Error updating Garmin permissions:', error);
    return false;
  }
} 