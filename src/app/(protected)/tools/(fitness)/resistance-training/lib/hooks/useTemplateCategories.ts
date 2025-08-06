import { useState, useEffect } from 'react';
import { getTemplateCategories, TemplateCategory } from './getTemplateCategories';
import { clientLogger } from '@/app/lib/logging/logger.client';

export function useTemplateCategories(isAdmin: boolean) {
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      setCategories([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;

    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedCategories = await getTemplateCategories();
        
        if (isMounted) {
          setCategories(fetchedCategories);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch categories');
          clientLogger.error('Error fetching template categories:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [isAdmin]);

  return { categories, isLoading, error };
} 