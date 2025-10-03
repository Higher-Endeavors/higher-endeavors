import { SingleQuery } from 'lib/dbAdapter';

export interface TierContinuumOption {
  tierContinuumId: number;
  tierContinuumName: string;
}

export async function getTierContinuum(): Promise<TierContinuumOption[]> {
  const query = `
    SELECT tier_continuum_id, tier_continuum_name
    FROM highend_tier_continuum
    ORDER BY tier_continuum_name
  `;

  const result = await SingleQuery(query);
  const rows = result.rows as Array<{
    tier_continuum_id: number;
    tier_continuum_name: string;
  }>;

  return rows.map(row => ({
    tierContinuumId: row.tier_continuum_id,
    tierContinuumName: row.tier_continuum_name,
  }));
}

