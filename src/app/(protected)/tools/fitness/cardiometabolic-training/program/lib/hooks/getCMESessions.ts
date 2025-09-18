import { getFetchBaseUrl } from 'lib/utils/clientUtils';
import { clientLogger } from 'lib/logging/logger.client';
import { useState, useEffect, useCallback } from 'react';

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
  activity_count: number;
  activity_summary: string;
  // Template information (only for templates)
  templateInfo?: {
    tierContinuumId?: number;
    tierContinuumName?: string;
  };
}

export async function getCMESessions(userId: number): Promise<CMESessionListItem[]> {
  const baseURL = await getFetchBaseUrl();
  const fetchURL = `${baseURL}/api/cme-sessions?userId=${userId}`;
  const res = await fetch(fetchURL, {
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
    activity_count: session.activity_count,
    activity_summary: session.activity_summary,
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

export interface CMESessionActivity {
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
  activities: CMESessionActivity[];
}> {
  const baseURL = await getFetchBaseUrl();
  const fetchURL = `${baseURL}/api/cme-sessions?id=${sessionId}&userId=${userId}`;
  const res = await fetch(fetchURL, {
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
  
  // Transform activities from the API response
  const activities: CMESessionActivity[] = (data.activities || []).map((act: any) => ({
    cme_session_activity_id: act.cme_session_activity_id,
    cme_session_id: act.cme_session_id,
    cme_activity_family_id: act.cme_activity_family_id,
    cme_activity_library_id: act.cme_activity_library_id,
    planned_steps: act.planned_steps,
    actual_steps: act.actual_steps,
    notes: act.notes,
    created_at: act.created_at,
    updated_at: act.updated_at,
    activityName: act.activity_name,
    activityFamily: act.activity_family,
  }));
  
  return { session, activities };
}

export async function getCMETemplates(): Promise<CMESessionListItem[]> {
  try {
    const baseURL = await getFetchBaseUrl();
    const fetchURL = `${baseURL}/api/cme-sessions?userId=1`;
    const response = await fetch(fetchURL, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch templates: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Map the API response to match CMESessionListItem interface
    return (data.sessions || []).map((session: any) => ({
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
      activity_count: session.activity_count,
      activity_summary: session.activity_summary,
      templateInfo: session.templateInfo,
    }));
  } catch (error) {
    clientLogger.error('Error fetching CME templates:', error);
    throw error;
  }
}

export function useCMETemplates() {
  const [templates, setTemplates] = useState<CMESessionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedTemplates = await getCMETemplates();

        if (isMounted) {
          setTemplates(fetchedTemplates);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch templates');
          clientLogger.error('Error fetching CME templates:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTemplates();

    return () => {
      isMounted = false;
    };
  }, []);

  return { templates, isLoading, error };
}
