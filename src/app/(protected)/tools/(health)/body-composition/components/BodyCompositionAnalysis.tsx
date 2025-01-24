'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import type { BodyCompositionEntry } from '../types';
import AssessmentReview from './AssessmentReview';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  entries: BodyCompositionEntry[];
}

type TimeframeOption = '1M' | '3M' | '6M' | '1Y' | 'ALL';

export default function BodyCompositionAnalysis() {
  const [timeframe, setTimeframe] = useState<TimeframeOption | ''>('');
  const [expandedSection, setExpandedSection] = useState<'charts' | 'reports' | 'insights' | null>('reports');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [entries, setEntries] = useState<BodyCompositionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/body-composition', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch entries');
        }

        const data = await response.json();
        setEntries(data.entries);
      } catch (err) {
        console.error('Error fetching entries:', err);
        setError('Failed to load body composition entries');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, []);

  const toggleSection = (section: 'charts' | 'reports' | 'insights') => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const filterEntriesByTimeframe = (entries: BodyCompositionEntry[], timeframe: TimeframeOption) => {
    const now = new Date();
    const timeframeMap = {
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365,
      'ALL': Infinity
    };

    const daysToSubtract = timeframeMap[timeframe];
    const cutoffDate = new Date(now.setDate(now.getDate() - daysToSubtract));

    return entries.filter(entry => new Date(entry.date) >= cutoffDate);
  };

  const getWeightChartData = (entries: BodyCompositionEntry[]) => {
    if (!entries || entries.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: 'Weight (lbs)',
          data: [],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      };
    }

    const filteredEntries = timeframe ? filterEntriesByTimeframe(entries, timeframe as TimeframeOption) : entries;
    const sortedEntries = [...filteredEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      labels: sortedEntries.map(entry => new Date(entry.date).toLocaleDateString()),
      datasets: [{
        label: 'Weight (lbs)',
        data: sortedEntries.map(entry => entry.weight),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    };
  };

  const getBodyFatChartData = (entries: BodyCompositionEntry[]) => {
    if (!entries || entries.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Manual Body Fat %',
            data: [],
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          },
          {
            label: 'Calculated Body Fat %',
            data: [],
            borderColor: 'rgb(54, 162, 235)',
            tension: 0.1
          }
        ]
      };
    }

    const filteredEntries = timeframe ? filterEntriesByTimeframe(entries, timeframe as TimeframeOption) : entries;
    const sortedEntries = [...filteredEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      labels: sortedEntries.map(entry => new Date(entry.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Manual Body Fat %',
          data: sortedEntries.map(entry => entry.manualBodyFatPercentage),
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        },
        {
          label: 'Calculated Body Fat %',
          data: sortedEntries.map(entry => entry.calculatedBodyFatPercentage),
          borderColor: 'rgb(54, 162, 235)',
          tension: 0.1
        }
      ]
    };
  };

  const getCompositionChartData = (entries: BodyCompositionEntry[]) => {
    if (!entries || entries.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Fat Mass (lbs)',
            data: [],
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          },
          {
            label: 'Fat Free Mass (lbs)',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }
        ]
      };
    }

    const filteredEntries = timeframe ? filterEntriesByTimeframe(entries, timeframe as TimeframeOption) : entries;
    const sortedEntries = [...filteredEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      labels: sortedEntries.map(entry => new Date(entry.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Fat Mass (lbs)',
          data: sortedEntries.map(entry => entry.fatMass),
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        },
        {
          label: 'Fat Free Mass (lbs)',
          data: sortedEntries.map(entry => entry.fatFreeMass),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    };
  };

  const getCircumferenceChartData = (entries: BodyCompositionEntry[]) => {
    if (!entries || entries.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Waist (cm)',
            data: [],
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          },
          {
            label: 'Chest (cm)',
            data: [],
            borderColor: 'rgb(54, 162, 235)',
            tension: 0.1
          },
          {
            label: 'Hips (cm)',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }
        ]
      };
    }

    const filteredEntries = timeframe ? filterEntriesByTimeframe(entries, timeframe as TimeframeOption) : entries;
    const sortedEntries = [...filteredEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      labels: sortedEntries.map(entry => new Date(entry.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Waist (cm)',
          data: sortedEntries.map(entry => entry.circumferenceMeasurements?.waist),
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        },
        {
          label: 'Chest (cm)',
          data: sortedEntries.map(entry => entry.circumferenceMeasurements?.chest),
          borderColor: 'rgb(54, 162, 235)',
          tension: 0.1
        },
        {
          label: 'Hips (cm)',
          data: sortedEntries.map(entry => entry.circumferenceMeasurements?.hips),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    };
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += typeof context.parsed.y === 'number' ? context.parsed.y.toFixed(2) : context.parsed.y;
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return typeof value === 'number' ? value.toFixed(2) : value;
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Expandable Charts Section */}
      <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md">
        <button
          onClick={() => toggleSection('charts')}
          className="w-full px-6 py-4 flex justify-between items-center text-left"
        >
          <h2 className="text-xl font-semibold text-gray-700">Charts</h2>
          <svg
            className={`w-6 h-6 transform transition-transform ${
              expandedSection === 'charts' ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {expandedSection === 'charts' && (
          <div className="p-6 border-t border-gray-200">
            <div className="mb-6">
              <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700 mb-2">
                Analysis Timeframe
              </label>
              <div className="relative">
                <select
                  id="timeframe"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value as TimeframeOption)}
                  className="appearance-none w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm dark:text-slate-900 cursor-pointer"
                >
                  <option value="" disabled>Select Timeframe</option>
                  <option value="1M">Last Month</option>
                  <option value="3M">Last 3 Months</option>
                  <option value="6M">Last 6 Months</option>
                  <option value="1Y">Last Year</option>
                  <option value="ALL">All Time</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Weight Trend</h3>
                {entries && entries.length > 0 ? (
                  <Line options={chartOptions} data={getWeightChartData(entries)} />
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    No weight data available
                  </div>
                )}
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Body Fat % Trend</h3>
                {entries && entries.length > 0 ? (
                  <Line options={chartOptions} data={getBodyFatChartData(entries)} />
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    No body fat data available
                  </div>
                )}
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Fat Mass vs Fat Free Mass</h3>
                {entries && entries.length > 0 ? (
                  <Line options={chartOptions} data={getCompositionChartData(entries)} />
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    No composition data available
                  </div>
                )}
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Key Circumference Changes</h3>
                {entries && entries.length > 0 ? (
                  <Line options={chartOptions} data={getCircumferenceChartData(entries)} />
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    No circumference data available
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expandable Reports Section */}
      <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md">
        <button
          onClick={() => toggleSection('reports')}
          className="w-full px-6 py-4 flex justify-between items-center text-left"
        >
          <h2 className="text-xl font-semibold text-gray-700">Reports</h2>
          <svg
            className={`w-6 h-6 transform transition-transform ${
              expandedSection === 'reports' ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {expandedSection === 'reports' && (
          <div className="p-6 border-t border-gray-200">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : entries.length > 0 ? (
              <AssessmentReview
                entries={entries}
                selectedEntryId={selectedEntryId}
                onEntrySelect={setSelectedEntryId}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No assessments available. Start by adding your first body composition measurement.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expandable Insights Section */}
      <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md">
        <button
          onClick={() => toggleSection('insights')}
          className="w-full px-6 py-4 flex justify-between items-center text-left"
        >
          <h2 className="text-xl font-semibold text-gray-700">Insights</h2>
          <svg
            className={`w-6 h-6 transform transition-transform ${
              expandedSection === 'insights' ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {expandedSection === 'insights' && (
          <div className="p-6 border-t border-gray-200">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Pattern Analysis</h3>
                <p className="text-gray-600">
                  AI-driven insights about your body composition patterns will be shown here.
                  This will include correlations with other health metrics and lifestyle factors.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Recommendations</h3>
                <p className="text-gray-600">
                  Personalized recommendations based on your data will appear here,
                  helping you optimize your fitness journey.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 