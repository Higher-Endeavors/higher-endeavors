import { ProgramListItem } from '../../types/resistance-training.zod';
import { clientLogger } from '@/app/lib/logging/logger.client';
import { getApiBaseUrl } from '@/app/lib/utils/apiUtils';

export async function  getResistanceTemplates(): Promise<ProgramListItem[]> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/resistance-training/programs?userId=1`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch templates: ${response.statusText}`);
    }

    const data = await response.json();
    return data.programs || [];
  } catch (error) {
    clientLogger.error('Error fetching resistance templates:', error);
    throw error;
  }
}