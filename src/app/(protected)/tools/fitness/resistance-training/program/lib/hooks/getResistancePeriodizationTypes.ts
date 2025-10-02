import { SingleQuery } from 'lib/dbAdapter';

export interface ResistancePeriodizationType {
  resistPeriodizationId: number;
  resistPeriodizationName: string;
}

export async function getResistancePeriodizationTypes(): Promise<ResistancePeriodizationType[]> {
  const query = `
    SELECT resist_periodization_id, resist_periodization_name
    FROM resist_periodization_type
    ORDER BY resist_periodization_name
  `;

  const result = await SingleQuery(query);
  const rows = result.rows as Array<{
    resist_periodization_id: number;
    resist_periodization_name: string;
  }>;

  return rows.map(row => ({
    resistPeriodizationId: row.resist_periodization_id,
    resistPeriodizationName: row.resist_periodization_name,
  }));
}

