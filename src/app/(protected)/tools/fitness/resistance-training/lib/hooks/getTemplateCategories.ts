import { getApiBaseUrl } from 'lib/utils/apiUtils';

export interface TemplateCategory {
  resist_program_template_categories_id: number;
  category_name: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
}

export async function getTemplateCategories(): Promise<TemplateCategory[]> {
  const apiBaseUrl = await getApiBaseUrl();
  const fetchUrl = `${apiBaseUrl}/api/resistance-training/template-categories`;

  const res = await fetch(`${fetchUrl}`, {
    cache: 'force-cache',
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch template categories: ${res.status} ${res.statusText}`);
  }
  
  const data = await res.json();
  
  if (!data.categories || !Array.isArray(data.categories)) {
    throw new Error('Invalid response format: expected categories array');
  }
  
  return data.categories;
} 