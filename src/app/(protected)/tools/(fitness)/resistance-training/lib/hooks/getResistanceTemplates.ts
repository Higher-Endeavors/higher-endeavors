import { ProgramListItem } from '../../types/resistance-training.zod';

export async function getResistanceTemplates(): Promise<ProgramListItem[]> {
  try {
    const response = await fetch('/api/resistance-training/programs?userId=1');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch templates: ${response.statusText}`);
    }

    const data = await response.json();
    return data.programs || [];
  } catch (error) {
    console.error('Error fetching resistance templates:', error);
    throw error;
  }
}