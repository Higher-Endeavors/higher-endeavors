'use server';
import { z } from 'zod';
import { UserSettingsSchema } from '@/app/lib/types/userSettings.zod';

// The state type for useFormState
export type UpdateUserSettingsState =
  | { error: string; issues: z.ZodIssue[]; success?: undefined }
  | { success: boolean; error?: undefined; issues?: undefined }
  | null;

export async function updateUserSettings(
  prevState: UpdateUserSettingsState,
  formData: FormData
): Promise<UpdateUserSettingsState> {
  // Helper to reconstruct nested object from dot notation keys and handle arrays
  function formDataToNestedObject(formData: FormData): any {
    const obj: any = {};
    // Get all unique keys
    const keys = Array.from(formData.keys());
    const uniqueKeys = Array.from(new Set(keys));
    for (const key of uniqueKeys) {
      const values = formData.getAll(key);
      // If only one value, use the value directly (except for arrays)
      const value = values.length > 1 ? values : values[0];
      // Split dot notation
      const path = key.split('.');
      let curr = obj;
      for (let i = 0; i < path.length; i++) {
        const part = path[i];
        if (i === path.length - 1) {
          // If already set and is array, push
          if (curr[part] !== undefined) {
            if (Array.isArray(curr[part])) {
              curr[part] = curr[part].concat(value);
            } else {
              curr[part] = [curr[part], value].flat();
            }
          } else {
            curr[part] = value;
          }
        } else {
          if (!curr[part]) curr[part] = {};
          curr = curr[part];
        }
      }
    }
    return obj;
  }

  // Helper to recursively coerce 'true'/'false' to booleans and numeric strings to numbers
  function coerceTypes(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(coerceTypes);
    } else if (obj && typeof obj === 'object') {
      const result: any = {};
      for (const key in obj) {
        result[key] = coerceTypes(obj[key]);
      }
      return result;
    } else if (obj === 'true') {
      return true;
    } else if (obj === 'false') {
      return false;
    } else if (typeof obj === 'string' && obj !== '' && !isNaN(obj as any)) {
      // Only coerce to number if it is a valid number string (not empty)
      return obj.trim() === '' ? obj : Number(obj);
    }
    return obj;
  }

  const data = formDataToNestedObject(formData);
  const coercedData = coerceTypes(data);
  console.log('Nested FormData:', coercedData);
  const parsed = UserSettingsSchema.safeParse(coercedData);
  console.log('Parsed data:', parsed);
  if (!parsed.success) {
    return { error: 'Invalid data', issues: parsed.error.issues };
  }
  // TODO: Update the user settings in the database here
  // Example: await db.userSettings.update({ ...parsed.data })
  return { success: true };
} 