import { useState, useEffect } from 'react';
import { getResistanceTemplates } from '(protected)/tools/fitness/resistance-training/lib/hooks/getResistanceTemplates';
import { ProgramListItem } from '(protected)/tools/fitness/resistance-training/types/resistance-training.zod';
import { clientLogger } from 'lib/logging/logger.client';

export function useResistanceTemplates() {
  const [templates, setTemplates] = useState<ProgramListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedTemplates = await getResistanceTemplates();

        if (isMounted) {
          setTemplates(fetchedTemplates);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch templates');
          clientLogger.error('Error fetching resistance templates:', err);
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