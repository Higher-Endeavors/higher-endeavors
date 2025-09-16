import { useState, useEffect } from 'react';

export interface BodyCompositionEntry {
  id: string;
  date: string;
  weight: number | null;
  bodyFatPercentage: number | null;
  fatMass: number | null;
  fatFreeMass: number | null;
  circumferenceMeasurements: Record<string, number>;
  skinfoldMeasurements: Record<string, number>;
}

export interface BodyCompositionData {
  entries: BodyCompositionEntry[];
  latestEntry: BodyCompositionEntry | null;
  fourWeekTrend: {
    weight: { current: number | null; previous: number | null; change: number | null };
    bodyFatPercentage: { current: number | null; previous: number | null; change: number | null };
    fatMass: { current: number | null; previous: number | null; change: number | null };
    fatFreeMass: { current: number | null; previous: number | null; change: number | null };
  };
}

export function useBodyComposition() {
  const [data, setData] = useState<BodyCompositionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBodyComposition = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/body-composition');
        
        if (!response.ok) {
          throw new Error('Failed to fetch body composition data');
        }

        const result = await response.json();
        const entries = result.entries || [];

        // Get the most recent entry
        const latestEntry = entries.length > 0 ? entries[0] : null;

        // Calculate 4-week trend (entries from 4 weeks ago)
        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
        
        const fourWeekEntry = entries.find((entry: BodyCompositionEntry) => {
          const entryDate = new Date(entry.date);
          return entryDate <= fourWeeksAgo;
        });

        // Calculate trends
        const fourWeekTrend = {
          weight: {
            current: latestEntry?.weight || null,
            previous: fourWeekEntry?.weight || null,
            change: latestEntry?.weight && fourWeekEntry?.weight 
              ? latestEntry.weight - fourWeekEntry.weight 
              : null
          },
          bodyFatPercentage: {
            current: latestEntry?.bodyFatPercentage || null,
            previous: fourWeekEntry?.bodyFatPercentage || null,
            change: latestEntry?.bodyFatPercentage && fourWeekEntry?.bodyFatPercentage 
              ? latestEntry.bodyFatPercentage - fourWeekEntry.bodyFatPercentage 
              : null
          },
          fatMass: {
            current: latestEntry?.fatMass || null,
            previous: fourWeekEntry?.fatMass || null,
            change: latestEntry?.fatMass && fourWeekEntry?.fatMass 
              ? latestEntry.fatMass - fourWeekEntry.fatMass 
              : null
          },
          fatFreeMass: {
            current: latestEntry?.fatFreeMass || null,
            previous: fourWeekEntry?.fatFreeMass || null,
            change: latestEntry?.fatFreeMass && fourWeekEntry?.fatFreeMass 
              ? latestEntry.fatFreeMass - fourWeekEntry.fatFreeMass 
              : null
          }
        };

        setData({
          entries,
          latestEntry,
          fourWeekTrend
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBodyComposition();
  }, []);

  return { data, loading, error };
}
