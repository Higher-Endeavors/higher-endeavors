'use client';

import React, { useState } from "react";

// Import all the new components
import {
  TopBar,
  GoalsAndTimeline,
  PeriodizationStyle,
  VolumeRampDeload,
  ModalityMix,
  ZoneModel,
  AvailabilityConstraints,
  HealthGuardrails,
  GanttChart,
  WeeklyVolume,
  PlanHealth,
  ConflictsWarnings,
  QuickFixes,
  AuditTrail,
  Calendar,
  TIZTargets,
  LegendNotes
} from './components';

export default function PlanCanvasWireframe() {
  const [deloadEvery, setDeloadEvery] = useState(3);
  const [z2share, setZ2share] = useState(70);

  return (
    <div className="w-full min-h-screen bg-slate-50 p-4">
      {/* App Shell Grid */}
      <div className="mx-auto max-w-[1400px] grid grid-rows-[auto_1fr_auto] gap-4 min-h-[92vh]">
        {/* === TOP BAR (A) === */}
        <TopBar />

        {/* === MAIN BODY (B, C, D) === */}
        <div className="grid grid-cols-[320px_1fr_360px] gap-4 min-h-0">
          {/* LEFT CONTROL PANEL (B) */}
          <div className="flex flex-col gap-4 min-h-0 overflow-y-auto pr-1">
            <GoalsAndTimeline />
            <PeriodizationStyle />
            <VolumeRampDeload />
            <ModalityMix />
            <ZoneModel />
            <AvailabilityConstraints />
            <HealthGuardrails />
          </div>

          {/* CENTER (C) – GANTT + WEEKLY VOLUME */}
          <div className="flex flex-col gap-4 min-h-0 overflow-hidden">
            <GanttChart deloadEvery={deloadEvery} z2share={z2share} />
            <WeeklyVolume deloadEvery={deloadEvery} />
          </div>

          {/* RIGHT PANEL (D) — Health, Warnings, Quick Fixes */}
          <div className="flex flex-col gap-4 min-h-0 overflow-y-auto pl-1">
            <PlanHealth />
            <ConflictsWarnings />
            <QuickFixes />
            <AuditTrail />
          </div>
        </div>

        {/* === BOTTOM (E) — Calendar + TIZ Ring + Palette === */}
        <div className="grid grid-cols-[1fr_280px] gap-4">
          <Calendar />
          <TIZTargets />
        </div>

        {/* === LEGEND & NOTES (F) === */}
        <LegendNotes />
      </div>
    </div>
  );
}
