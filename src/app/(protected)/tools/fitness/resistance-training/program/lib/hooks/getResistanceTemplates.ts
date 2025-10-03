import { ProgramListItem } from '(protected)/tools/fitness/resistance-training/types/resistance-training.zod';
import { clientLogger } from 'lib/logging/logger.client';
import { getFetchBaseUrl } from 'lib/utils/clientUtils';

export async function  getResistanceTemplates(): Promise<ProgramListItem[]> {
  try {
    const baseURL = await getFetchBaseUrl();
    const fetchURL = `${baseURL}/api/resistance-training/programs?userId=1`;
    const response = await fetch(fetchURL, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch templates: ${response.statusText}`);
    }

    const data = await response.json();
    return (data.programs || []).map((program: any) => ({
      ...program,
      resistPhaseId: typeof program.resistPhaseId === 'number' ? program.resistPhaseId : null,
      resistPhaseName: program.resistPhaseName ?? undefined,
      resistPeriodizationId: typeof program.resistPeriodizationId === 'number' ? program.resistPeriodizationId : null,
      resistPeriodizationName: program.resistPeriodizationName ?? undefined,
    }));
  } catch (error) {
    clientLogger.error('Error fetching resistance templates:', error);
    throw error;
  }
}