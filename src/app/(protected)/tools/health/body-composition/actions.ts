'use server';

import { auth } from 'auth';
import { SingleQuery } from 'lib/dbAdapter';
import { revalidatePath } from 'next/cache';
import {
  GetBodyCompositionEntriesInputSchema,
  SaveBodyCompositionInputSchema,
  type BodyCompositionEntry,
  type SaveBodyCompositionInput,
} from '(protected)/tools/health/body-composition/types/body-composition.zod';

async function checkAdminAccess(userId: number): Promise<boolean> {
  const userRole = await SingleQuery('SELECT role FROM users WHERE id = $1', [userId]);
  return userRole.rows[0]?.role === 'admin';
}

function normalizeDbRowToEntry(entry: any): BodyCompositionEntry {
  const weight = typeof entry.weight === 'number' ? entry.weight : typeof entry.weight === 'string' ? Number(entry.weight) : null;
  const bodyFatPercentage = entry.body_fat_percentage != null ? Number(entry.body_fat_percentage) : null;
  let fatMass: number | null = null;
  let fatFreeMass: number | null = null;
  if (weight != null && bodyFatPercentage != null) {
    fatMass = (weight * bodyFatPercentage) / 100;
    fatFreeMass = weight - fatMass;
  }
  const entryData = entry.entry_data || {};
  return {
    id: String(entry.id),
    date: entry.created_at,
    weight: weight as number,
    bodyFatPercentage,
    fatMass,
    fatFreeMass,
    circumferenceMeasurements: entryData.circumferenceMeasurements || {},
    skinfoldMeasurements: entryData.skinfoldMeasurements || {},
  };
}

export async function getBodyCompositionEntries(input: { userId: number }): Promise<BodyCompositionEntry[]> {
  const parsed = GetBodyCompositionEntriesInputSchema.parse(input);
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const sessionUserId = parseInt(session.user.id);
  const isAdmin = await checkAdminAccess(sessionUserId);
  const effectiveUserId = isAdmin ? parsed.userId : sessionUserId;

  const result = await SingleQuery(
    `SELECT * FROM body_composition_entries WHERE user_id = $1 ORDER BY created_at DESC`,
    [effectiveUserId]
  );

  return result.rows.map(normalizeDbRowToEntry);
}

export async function saveBodyComposition(input: SaveBodyCompositionInput): Promise<{ success: true; entry: BodyCompositionEntry }>
{
  const parsed = SaveBodyCompositionInputSchema.parse(input);
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const sessionUserId = parseInt(session.user.id);
  const isAdmin = await checkAdminAccess(sessionUserId);
  const effectiveUserId = isAdmin ? parsed.userId : sessionUserId;

  const entryData = {
    age: parsed.age,
    isMale: parsed.isMale,
    bodyFatMethod: parsed.bodyFatMethod,
    manualBodyFat: parsed.bodyFatMethod === 'manual' ? parsed.manualBodyFat : undefined,
    skinfoldMeasurements: parsed.bodyFatMethod === 'skinfold' ? parsed.skinfoldMeasurements : undefined,
    circumferenceMeasurements: parsed.circumferenceMeasurements,
  };

  const bodyFatPercentage = parsed.bodyFatMethod === 'manual' && typeof parsed.manualBodyFat === 'number'
    ? parsed.manualBodyFat
    : null;

  const result = await SingleQuery(
    `INSERT INTO body_composition_entries (user_id, weight, body_fat_percentage, entry_data)
     VALUES ($1, $2, $3, $4)
     RETURNING id, created_at, weight, body_fat_percentage, entry_data`,
    [effectiveUserId, parsed.weight, bodyFatPercentage, entryData]
  );

  const entry = normalizeDbRowToEntry(result.rows[0]);
  revalidatePath('/(protected)/tools/health/body-composition');
  return { success: true, entry };
}


