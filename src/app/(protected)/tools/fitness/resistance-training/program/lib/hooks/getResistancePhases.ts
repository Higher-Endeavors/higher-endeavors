import { SingleQuery } from 'lib/dbAdapter';

export interface ResistancePhase {
  resistPhaseId: number;
  resistPhaseName: string;
}

export async function getResistancePhases(): Promise<ResistancePhase[]> {
  const query = `
    SELECT resist_phase_id, resist_phase_name
    FROM resist_phase
    ORDER BY resist_phase_name
  `;

  const result = await SingleQuery(query);
  const rows = result.rows as Array<{
    resist_phase_id: number;
    resist_phase_name: string;
  }>;

  return rows.map(row => ({
    resistPhaseId: row.resist_phase_id,
    resistPhaseName: row.resist_phase_name,
  }));
}

