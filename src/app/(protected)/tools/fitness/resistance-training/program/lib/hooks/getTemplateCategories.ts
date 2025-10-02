import { SingleQuery } from 'lib/dbAdapter';

export interface TemplateCategoryOption {
  resistProgramTemplateCategoriesId: number;
  categoryName: string;
  description?: string | null;
}

export async function getTemplateCategories(): Promise<TemplateCategoryOption[]> {
  const query = `
    SELECT resist_program_template_categories_id, category_name, description
    FROM resist_program_template_categories
    ORDER BY category_name
  `;

  const result = await SingleQuery(query);
  const rows = result.rows as Array<{
    resist_program_template_categories_id: number;
    category_name: string;
    description: string | null;
  }>;

  return rows.map(row => ({
    resistProgramTemplateCategoriesId: row.resist_program_template_categories_id,
    categoryName: row.category_name,
    description: row.description,
  }));
}
