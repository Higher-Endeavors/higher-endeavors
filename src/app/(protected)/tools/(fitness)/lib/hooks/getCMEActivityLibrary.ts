import { CMEActivityLibraryItem } from '../../cardiometabolic-training/types/cme-training.zod';

export async function getCMEActivityLibrary(): Promise<CMEActivityLibraryItem[]> {
  const res = await fetch('/api/cme-activity-library', {
    cache: 'force-cache',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch CME activities: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error('Invalid response format: expected an array');
  }
  return data.map((activity: any) => ({
    cme_activity_library_id: activity.cme_activity_library_id,
    name: activity.name,
    source: 'cme_library' as const,
    activity_family: activity.activity_family || null,
    equipment: activity.equipment || null,
  }));
} 