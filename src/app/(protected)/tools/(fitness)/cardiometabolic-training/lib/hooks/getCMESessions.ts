import { getApiBaseUrl } from '@/app/lib/utils/apiUtils';

export interface CMESessionListItem {
  cme_session_id: number;
  user_id: number;
  session_name: string;
  macrocycle_phase?: string;
  focus_block?: string;
  notes?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at?: string;
  exercise_count: number;
  exercise_summary: string;
}

export async function getCMESessions(userId: number): Promise<CMESessionListItem[]> {
  const res = await fetch(`${getApiBaseUrl()}/api/cme-sessions?userId=${userId}`, {
    credentials: 'include',
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch CME sessions: ${res.status} ${res.statusText}`);
  }
  
  const data = await res.json();
  
  if (!data.sessions || !Array.isArray(data.sessions)) {
    throw new Error('Invalid response format: expected sessions array');
  }
  
  return data.sessions.map((session: any) => ({
    cme_session_id: session.cme_session_id,
    user_id: session.user_id,
    session_name: session.session_name,
    macrocycle_phase: session.macrocycle_phase,
    focus_block: session.focus_block,
    notes: session.notes,
    start_date: session.start_date,
    end_date: session.end_date,
    created_at: session.created_at,
    updated_at: session.updated_at,
    exercise_count: session.exercise_count,
    exercise_summary: session.exercise_summary,
  }));
}

export interface CMESession {
  cme_session_id: number;
  user_id: number;
  session_name: string;
  macrocycle_phase?: string;
  focus_block?: string;
  notes?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at?: string;
}

export interface CMESessionExercise {
  cme_session_activity_id: number;
  cme_session_id: number;
  cme_activity_family_id?: number;
  cme_activity_library_id?: number;
  planned_steps: any[];
  actual_steps: any[];
  notes?: string;
  created_at: string;
  updated_at?: string;
  // Derived fields for easier frontend usage
  activityName?: string;
  activityFamily?: string;
}

export async function getCMESession(sessionId: number, userId: number): Promise<{
  session: CMESession;
  exercises: CMESessionExercise[];
}> {
  const res = await fetch(`${getApiBaseUrl()}/api/cme-sessions?id=${sessionId}&userId=${userId}`, {
    credentials: 'include',
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch CME session: ${res.status} ${res.statusText}`);
  }
  
  const data = await res.json();
  
  if (!data.session_id) {
    throw new Error('Invalid response format: expected session data');
  }
  
  // Transform the API response to match our types
  const session: CMESession = {
    cme_session_id: data.session_id,
    user_id: data.user_id,
    session_name: data.session_name,
    macrocycle_phase: data.macrocycle_phase,
    focus_block: data.focus_block,
    notes: data.notes,
    start_date: data.start_date,
    end_date: data.end_date,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
  
  // Transform exercises from the API response
  const exercises: CMESessionExercise[] = (data.exercises || []).map((ex: any) => ({
    cme_session_activity_id: ex.cme_session_activity_id,
    cme_session_id: ex.cme_session_id,
    cme_activity_family_id: ex.cme_activity_family_id,
    cme_activity_library_id: ex.cme_activity_library_id,
    planned_steps: ex.planned_steps,
    actual_steps: ex.actual_steps,
    notes: ex.notes,
    created_at: ex.created_at,
    updated_at: ex.updated_at,
    activityName: ex.activity_name,
    activityFamily: ex.activity_family,
  }));
  
  return { session, exercises };
}
