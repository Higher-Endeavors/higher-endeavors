'use client';

import { useState, useEffect, useCallback } from 'react';

interface TierContinuum {
  tier_continuum_id: number;
  tier_continuum_name: string;
}

interface TemplateCategory {
  resist_program_template_categories_id: number;
  category_name: string;
  description?: string;
}

interface TemplateData {
  tiers: TierContinuum[];
  categories: TemplateCategory[];
}

interface TierResponse {
  tiers: TierContinuum[];
}

interface CategoryResponse {
  categories: TemplateCategory[];
}

interface UseTemplateDataReturn {
  data: TemplateData;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchWithCache<T>(url: string, ttl: number = CACHE_TTL): Promise<T> {
  const now = Date.now();
  const cached = cache.get(url);
  
  // Return cached data if still valid
  if (cached && (now - cached.timestamp) < cached.ttl) {
    return cached.data;
  }
  
  // Fetch fresh data
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Cache the result
  cache.set(url, { data, timestamp: now, ttl });
  
  return data;
}

export function useTemplateData(isAdmin: boolean = false): UseTemplateDataReturn {
  const [data, setData] = useState<TemplateData>({
    tiers: [
      { tier_continuum_id: 1, tier_continuum_name: 'Healthy' },
      { tier_continuum_id: 2, tier_continuum_name: 'Fit' },
      { tier_continuum_id: 3, tier_continuum_name: 'HighEnd' }
    ],
    categories: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!isAdmin) {
      setData({ tiers: [], categories: [] });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch both data sources in parallel
      const [tiersResponse, categoriesResponse] = await Promise.allSettled([
        fetchWithCache('/api/tier-continuum'),
        fetchWithCache('/api/template-categories')
      ]);

      const newData: TemplateData = {
        tiers: [],
        categories: []
      };

      // Handle tiers response
      if (tiersResponse.status === 'fulfilled') {
        newData.tiers = (tiersResponse.value as TierResponse).tiers || newData.tiers;
      } else {
        console.warn('Failed to fetch tiers:', tiersResponse.reason);
      }

      // Handle categories response
      if (categoriesResponse.status === 'fulfilled') {
        newData.categories = (categoriesResponse.value as CategoryResponse).categories || [];
      } else {
        console.warn('Failed to fetch categories:', categoriesResponse.reason);
      }

      setData(newData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch template data');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
}

// Convenience hooks for individual data types
export function useTierContinuum(isAdmin: boolean = false) {
  const { data, isLoading, error, refetch } = useTemplateData(isAdmin);
  return {
    tiers: data.tiers,
    isLoading,
    error,
    refetch
  };
}

export function useTemplateCategories(isAdmin: boolean = false) {
  const { data, isLoading, error, refetch } = useTemplateData(isAdmin);
  return {
    categories: data.categories,
    isLoading,
    error,
    refetch
  };
}
