import { useState, useEffect } from 'react';
import { getResistanceTemplates } from './getResistanceTemplates';
import { ProgramListItem } from '../../types/resistance-training.zod';

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
          console.error('Error fetching resistance templates:', err);
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