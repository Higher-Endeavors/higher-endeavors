'use client';

import React, { useState } from "react";
import type { PeriodizationPlan } from '(protected)/tools/fitness/plan/types/periodization.zod';
import DemoBanner from '(protected)/tools/(components)/DemoBanner';

// Import all the new components
import TopBar from './components/TopBar';
import GoalsAndTimeline from './components/GoalsAndTimeline';
import GanttChart from './components/GanttChart';
import PlanHealth from './components/PlanHealth';
import ConflictsWarnings from './components/ConflictsWarnings';
import Calendar from './components/Calendar';

import CalendarWidget from '(protected)/user/dashboard/components/CalendarWidget';
import PlanningModal from './components/planning-modal/PlanningModal';
import { usePlanningModal } from './components/planning-modal/usePlanningModal';

export default function PlanCanvasWireframe() {
  const [plan, setPlan] = useState<PeriodizationPlan>({
    id: 'plan-1',
    name: 'My Training Plan',
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 7 * 24 * 60 * 60 * 1000), // 24 weeks from now
    totalWeeks: 24,
    settings: {
      showResistance: true,
      showCME: true,
      showRecovery: true,
      showGoals: true,
      showEvents: true,
      timeGranularity: 'weeks'
    },
    phases: [],
    goals: [],
    planningItems: []
  });
  const planningModal = usePlanningModal({ plan, onPlanChange: setPlan });

  const handlePlanningItemClick = (item: any, date: Date, week: number, modality: string) => {
    planningModal.openModal(date, week, modality, item);
  };

  const handlePlanChange = (updatedPlan: PeriodizationPlan) => {
    setPlan(updatedPlan);
  };

  const handleSave = () => {
    console.log('Saving plan:', plan);
    // TODO: Implement actual save functionality
  };

  const handlePlanConfigChange = (config: { startDate: Date; totalWeeks: number; startDayOfWeek: number }) => {
    // Find the start of the week based on the selected start day
    const selectedDate = new Date(config.startDate);
    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysToSubtract = (dayOfWeek - config.startDayOfWeek + 7) % 7;
    
    const actualStartDate = new Date(selectedDate);
    actualStartDate.setDate(selectedDate.getDate() - daysToSubtract);
    
    const endDate = new Date(actualStartDate.getTime() + config.totalWeeks * 7 * 24 * 60 * 60 * 1000);
    
    console.log('Plan Config Debug:', {
      selectedDate: selectedDate.toISOString().split('T')[0],
      dayOfWeek,
      startDayOfWeek: config.startDayOfWeek,
      daysToSubtract,
      actualStartDate: actualStartDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
    
    setPlan(prevPlan => ({
      ...prevPlan,
      startDate: actualStartDate,
      endDate,
      totalWeeks: config.totalWeeks,
      // Note: startDayOfWeek would be stored in settings if needed for week calculations
    }));
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
          startDate={plan.startDate}
          onPlanConfigChange={handlePlanConfigChange}
        />


        {/* === GOALS & TIMELINE + GANTT CHART === */}
        <div className="grid grid-cols-[1fr_3fr] gap-4">
          <GoalsAndTimeline />
          <GanttChart
            plan={plan}
            onPlanChange={handlePlanChange}
            onEmptyCellClick={(date, week, modality) => {
              planningModal.openModal(date, week, modality);
            }}
            onPlanningItemClick={handlePlanningItemClick}
          />
        </div>

        {/* === CALENDAR & TIZ TARGETS === */}
        <div className="grid grid-cols-1 gap-4">
          <CalendarWidget />
          <Calendar />
        </div>

        {/* === PLAN HEALTH & CONFLICTS === */}
        <div className="grid grid-cols-2 gap-4">
          <PlanHealth />
          <ConflictsWarnings />
        </div>
      </div>

      {/* Planning Modal */}
        <PlanningModal
          key={planningModal.editingItem?.id || planningModal.clickedDate?.toISOString() || 'new'}
          isOpen={planningModal.isOpen}
          onClose={planningModal.closeModal}
          onSave={planningModal.handleSave}
          clickedDate={planningModal.clickedDate}
          clickedWeek={planningModal.clickedWeek}
          clickedModality={planningModal.clickedModality}
          editingItem={planningModal.editingItem}
        />
    </div>
  );
}
