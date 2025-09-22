'use server';

import { getClient } from 'lib/dbAdapter';
import { z } from 'zod';
import type { ProgramForAnalysis } from '../../types/analysis.zod';

const GetProgramsForAnalysisInput = z.object({
  userId: z.number().int(),
});

export async function getProgramsForAnalysis(input: z.infer<typeof GetProgramsForAnalysisInput>): Promise<{
  success: boolean;
  programs?: ProgramForAnalysis[];
  error?: string;
}> {
  const parse = GetProgramsForAnalysisInput.safeParse(input);
  if (!parse.success) {
    return { success: false, error: 'Invalid input' };
  }

  const { userId } = parse.data;
  const client = await getClient();

  try {
    // Fetch programs with exercise counts and actual data indicators
    const query = `
      SELECT 
        rp.program_id as "resistanceProgramId",
        rp.program_name as "programName",
        rp.program_duration as "programDuration",
        rp.phase_focus as "phaseFocus",
        rp.periodization_type as "periodizationType",
        rp.created_at as "createdAt",
        COUNT(rpe.program_exercises_id) as "exerciseCount",
        COUNT(CASE WHEN rpe.actual_sets IS NOT NULL AND rpe.actual_sets::text != '[]' THEN 1 END) as "actualDataCount"
      FROM resist_programs rp
      LEFT JOIN resist_program_exercises rpe ON rp.program_id = rpe.program_id
      WHERE rp.user_id = $1 AND rp.deleted IS NOT TRUE
      GROUP BY rp.program_id, rp.program_name, rp.program_duration, rp.phase_focus, rp.periodization_type, rp.created_at
      HAVING COUNT(rpe.program_exercises_id) > 0
      ORDER BY rp.created_at DESC
    `;
    
    const result = await client.query(query, [userId]);
    
    const programs: ProgramForAnalysis[] = result.rows.map((row: any) => ({
      resistanceProgramId: row.resistanceProgramId,
      programName: row.programName,
      programDuration: row.programDuration || 0,
      phaseFocus: row.phaseFocus,
      periodizationType: row.periodizationType,
      createdAt: row.createdAt,
      hasActualData: parseInt(row.actualDataCount) > 0,
      exerciseCount: parseInt(row.exerciseCount)
    }));
    
    return { success: true, programs };
  } catch (error) {
    console.error('Error fetching programs for analysis:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch programs' 
    };
  } finally {
    client.release();
  }
}
