'use client';

import React, { useState } from 'react';
import CMEVolumes, { defaultSettings } from '../components/cme-volumes/CMEVolumes';
import { calculateCurrentWeek } from '../components/cme-volumes/utils';
import type { CMEVolumeSettings, CMEVolumePlan } from '../components/cme-volumes/cme-volumes.zod';
import DemoBanner from '../../../(components)/DemoBanner';

export default function CMEVolumesPage() {
  const [settings, setSettings] = useState<CMEVolumeSettings>(defaultSettings);
  const [plan, setPlan] = useState<CMEVolumePlan[]>([]);

  const handleSettingsChange = (newSettings: CMEVolumeSettings) => {
    setSettings(newSettings);
  };

  const handlePlanChange = (newPlan: CMEVolumePlan[]) => {
    setPlan(newPlan);
    console.log('CME Volume Plan updated:', newPlan);
  };

  const handleSave = () => {
    console.log('Saving CME Volume settings:', settings);
    console.log('Saving CME Volume plan:', plan);
    // TODO: Implement actual save functionality
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-6xl space-y-6">
        <DemoBanner />
        
        {/* Header */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">CME Volume Planning</h1>
              <p className="text-slate-600 mt-1">
                Configure your cardiometabolic exercise volume, ramp rates, and time in zone targets
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm shadow transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>

        {/* CME Volumes Component */}
        <CMEVolumes
          settings={settings}
          onSettingsChange={handleSettingsChange}
          planContext={{
            planStartDate: new Date('2024-01-01'), // Example start date
            totalWeeks: 24, // Example: 24-week plan
            currentWeek: calculateCurrentWeek(new Date('2024-01-01'), 24),
          }}
          onPlanChange={handlePlanChange}
          showPreview={true}
        />

        {/* Plan Summary */}
        {plan.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Generated Plan Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-sm text-slate-600">Total Weeks</div>
                <div className="text-2xl font-bold text-slate-800">{plan.length}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-sm text-slate-600">Peak Volume</div>
                <div className="text-2xl font-bold text-slate-800">
                  {Math.max(...plan.map(w => w.totalVolume))} min/week
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-sm text-slate-600">Average Volume</div>
                <div className="text-2xl font-bold text-slate-800">
                  {Math.round(plan.reduce((sum, w) => sum + w.totalVolume, 0) / plan.length)} min/week
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Back */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <a
            href="/tools/fitness/plan"
            className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Planning Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
