'use client';

import React, { useState } from "react";
import type { PeriodizationPlan } from './types/periodization.zod';
import { mockPlanData } from './components/MockPlanData';
import DemoBanner from "../../(components)/DemoBanner";

// Import all the new components
import {
  TopBar,
  GoalsAndTimeline,
  GanttChart,
  PlanHealth,
  ConflictsWarnings,
  Calendar
} from './components';

export default function PlanCanvasWireframe() {
  const [plan, setPlan] = useState<PeriodizationPlan>(mockPlanData);

  const handlePlanChange = (updatedPlan: PeriodizationPlan) => {
    setPlan(updatedPlan);
  };

  const handleSave = () => {
    console.log('Saving plan:', plan);
    // TODO: Implement actual save functionality
  };


  return (
    <div className="w-full min-h-screen p-4">
      {/* App Shell Grid */}
      <div className="mx-auto max-w-[1400px] space-y-4">
        <DemoBanner />
        {/* === TOP BAR === */}
        <TopBar 
          onSave={handleSave}
          planName={plan.name}
          totalWeeks={plan.totalWeeks}
        />

        {/* === GOALS & TIMELINE + GANTT CHART === */}
        <div className="grid grid-cols-[1fr_3fr] gap-4">
          <GoalsAndTimeline />
          <GanttChart
            plan={plan}
            onPlanChange={handlePlanChange}
          />
        </div>

        {/* === CALENDAR & TIZ TARGETS === */}
        <div className="grid grid-cols-1 gap-4">
          <Calendar />
        </div>

        {/* === PLAN HEALTH & CONFLICTS === */}
        <div className="grid grid-cols-2 gap-4">
          <PlanHealth />
          <ConflictsWarnings />
        </div>
      </div>
    </div>
  );
}
