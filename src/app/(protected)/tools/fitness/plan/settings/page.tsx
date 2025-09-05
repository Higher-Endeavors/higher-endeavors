'use client';

import React, { useState } from "react";
import type { PeriodizationPlan } from '../types/periodization.zod';
import { mockPlanData } from '../components/MockPlanData';
import DemoBanner from "../../../(components)/DemoBanner";

// Import settings components
import {
  PeriodizationStyle,
  VolumeRampDeload,
  AvailabilityConstraints,
  HealthGuardrails,
  WeeklySchedule
} from '../components';

interface TrainingSession {
  id: string;
  name: string;
  type: 'resistance' | 'cme' | 'recovery' | 'rest';
  activity?: string;
  time?: string;
  duration?: number;
  day?: string;
}

export default function PlanSettingsPage() {
  const [plan, setPlan] = useState<PeriodizationPlan>(mockPlanData);
  const [weeklySchedule, setWeeklySchedule] = useState<TrainingSession[]>([
    // Default schedule example
    { id: '1', name: 'Upper Body', type: 'resistance', day: 'monday', time: '07:00', duration: 60 },
    { id: '2', name: 'Running', type: 'cme', activity: 'running', day: 'tuesday', time: '07:00', duration: 45 },
    { id: '3', name: 'Lower Body', type: 'resistance', day: 'wednesday', time: '07:00', duration: 60 },
    { id: '4', name: 'Cycling', type: 'cme', activity: 'cycling', day: 'thursday', time: '07:00', duration: 60 },
    { id: '5', name: 'Full Body', type: 'resistance', day: 'friday', time: '07:00', duration: 60 },
    { id: '6', name: 'Recovery Walk', type: 'recovery', day: 'saturday', time: '09:00', duration: 30 },
    { id: '7', name: 'Rest Day', type: 'rest', day: 'sunday' },
  ]);

  const handlePlanChange = (updatedPlan: PeriodizationPlan) => {
    setPlan(updatedPlan);
  };

  const handleWeeklyScheduleChange = (updatedSchedule: TrainingSession[]) => {
    setWeeklySchedule(updatedSchedule);
  };

  const handleSave = () => {
    console.log('Saving plan settings:', plan);
    console.log('Saving weekly schedule:', weeklySchedule);
    // TODO: Implement actual save functionality
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-[1400px] space-y-4">
        <DemoBanner />
        
        {/* Header */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Fitness Plan Settings</h1>
              <p className="text-slate-600 mt-1">Configure your periodization, volume, and training parameters</p>
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

        {/* Weekly Schedule */}
        <WeeklySchedule 
          schedule={weeklySchedule}
          onScheduleChange={handleWeeklyScheduleChange}
        />

        {/* Settings Components */}
        <div className="grid grid-cols-2 gap-6">
          <PeriodizationStyle />
          <VolumeRampDeload />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <AvailabilityConstraints />
          <HealthGuardrails />
        </div>

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
