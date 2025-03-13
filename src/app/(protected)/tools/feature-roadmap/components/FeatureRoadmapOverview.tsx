"use client";

import React, { useState, useMemo } from 'react';
import { Feature, FeaturePillar } from '../types';

interface FeatureRoadmapOverviewProps {
  features: Feature[];
}

export default function FeatureRoadmapOverview({ features }: FeatureRoadmapOverviewProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedPillar, setSelectedPillar] = useState<string>('all');

  const filteredFeatures = useMemo(() => {
    return features.filter(feature => {
      const matchesStatus = statusFilter === 'all' || feature.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || feature.priority === priorityFilter;
      const matchesPillar = selectedPillar === 'all' || feature.pillar === selectedPillar;
      return matchesStatus && matchesPriority && matchesPillar;
    });
  }, [features, statusFilter, priorityFilter, selectedPillar]);

  const pillars: FeaturePillar[] = ['Lifestyle', 'Health', 'Nutrition', 'Fitness'];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 bg-white dark:bg-[#e0e0e0] p-4 rounded-lg shadow">
        <select
          className="dark:bg-blue-400 px-3 py-2 border rounded-md"
          value={selectedPillar}
          onChange={(e) => setSelectedPillar(e.target.value)}
        >
          <option value="all">All Pillars</option>
          {pillars.map(pillar => (
            <option key={pillar} value={pillar}>{pillar}</option>
          ))}
        </select>

        <select
          className="dark:bg-blue-400 px-3 py-2 border rounded-md"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="planned">Planned</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          className="dark:bg-blue-400 px-3 py-2 border rounded-md"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="grid gap-6">
        {pillars.map(pillar => {
          const pillarFeatures = filteredFeatures.filter(f => f.pillar === pillar);
          if (selectedPillar !== 'all' && pillar !== selectedPillar) return null;
          if (pillarFeatures.length === 0) return null;

          return (
            <div key={pillar} className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">{pillar}</h2>
              <div className="space-y-4">
                {pillarFeatures.map((feature, index) => (
                  <div key={index} className="border-l-4 border-green-800 pl-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg text-slate-600">{feature.title}</h3>
                        <p className="text-gray-600 mt-1">{feature.description}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`text-sm px-2 py-1 rounded ${
                          feature.priority === 'high' ? 'bg-red-200 text-red-800' :
                          feature.priority === 'medium' ? 'bg-orange-200 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {feature.priority.charAt(0).toUpperCase() + feature.priority.slice(1)} Priority
                        </span>
                        {feature.expectedCompletion && (
                          <span className="text-sm text-gray-500">
                            Expected: {new Date(feature.expectedCompletion).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`text-sm mt-2 inline-block px-2 py-1 rounded ${
                      feature.status === 'completed' ? 'bg-green-100 text-green-800' :
                      feature.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {feature.status.charAt(0).toUpperCase() + feature.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 