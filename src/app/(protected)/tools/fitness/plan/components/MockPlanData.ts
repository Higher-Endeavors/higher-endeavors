import type { PeriodizationPlan, Phase, Goal, Event, PlanSettings } from '../types/periodization.zod';

export const mockPlanData: PeriodizationPlan = {
  id: 'plan-1',
  name: '2024 Training Plan',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  totalWeeks: 52,
  settings: {
    showResistance: true,
    showCME: true,
    showRecovery: true,
    showGoals: true,
    showEvents: true,
    timeGranularity: 'weeks'
  },
  phases: [
    // Resistance Training Phases
    {
      id: 'res-1',
      name: 'Strength: Linear',
      type: 'resistance',
      startWeek: 0,
      duration: 8,
      intensity: 6,
      volume: 180,
      color: 'bg-blue-100 border-blue-300',
      deload: false,
      periodizationStyle: 'Linear',
      phaseFocus: 'Strength',
      programs: [
        { id: 'prog-1', name: 'A', weeks: [0, 1, 2], sessions: ['Monday', 'Wednesday', 'Friday'] },
        { id: 'prog-2', name: 'B', weeks: [3, 4, 5], sessions: ['Monday', 'Wednesday', 'Friday'] },
        { id: 'prog-3', name: 'C', weeks: [6, 7], sessions: ['Monday', 'Wednesday', 'Friday'] }
      ]
    },
    {
      id: 'res-2',
      name: 'Hypertrophy: Undulating',
      type: 'resistance',
      startWeek: 8,
      duration: 6,
      intensity: 7,
      volume: 240,
      color: 'bg-blue-100 border-blue-300',
      deload: false,
      periodizationStyle: 'Undulating',
      phaseFocus: 'Hypertrophy',
      programs: [
        { id: 'prog-4', name: 'A', weeks: [8, 9], sessions: ['Monday', 'Wednesday', 'Friday'] },
        { id: 'prog-5', name: 'B', weeks: [10, 11], sessions: ['Monday', 'Wednesday', 'Friday'] },
        { id: 'prog-6', name: 'C', weeks: [12, 13], sessions: ['Monday', 'Wednesday', 'Friday'] }
      ]
    },
    {
      id: 'res-3',
      name: 'Power: Linear',
      type: 'resistance',
      startWeek: 14,
      duration: 4,
      intensity: 8,
      volume: 200,
      color: 'bg-blue-100 border-blue-300',
      deload: true,
      periodizationStyle: 'Linear',
      phaseFocus: 'Power',
      programs: [
        { id: 'prog-7', name: 'A', weeks: [14, 15], sessions: ['Monday', 'Wednesday', 'Friday'] },
        { id: 'prog-8', name: 'B', weeks: [16, 17], sessions: ['Monday', 'Wednesday', 'Friday'] }
      ]
    },
    // CME Phases
    {
      id: 'cme-1',
      name: 'Base Building',
      type: 'cme',
      startWeek: 0,
      duration: 12,
      intensity: 4,
      volume: 300,
      color: 'bg-green-100 border-green-300',
      deload: false,
      subPhases: [
        {
          id: 'sub-3',
          name: 'Running',
          modality: 'running',
          volume: 180,
          intensity: 4,
          color: 'bg-green-200',
          weeklyVolumes: [150, 160, 170, 180, 190, 200, 180, 160, 170, 180, 190, 200], // 12 weeks with ramp/deload
          weeklyTIZ: [
            { z1: 90, z2: 45, z3: 15, z4: 0, z5: 0 },   // Week 1: 150m total
            { z1: 96, z2: 48, z3: 16, z4: 0, z5: 0 },   // Week 2: 160m total
            { z1: 102, z2: 51, z3: 17, z4: 0, z5: 0 },  // Week 3: 170m total
            { z1: 108, z2: 54, z3: 18, z4: 0, z5: 0 },  // Week 4: 180m total
            { z1: 114, z2: 57, z3: 19, z4: 0, z5: 0 },  // Week 5: 190m total
            { z1: 120, z2: 60, z3: 20, z4: 0, z5: 0 },  // Week 6: 200m total
            { z1: 108, z2: 54, z3: 18, z4: 0, z5: 0 },  // Week 7: 180m total (deload)
            { z1: 96, z2: 48, z3: 16, z4: 0, z5: 0 },   // Week 8: 160m total
            { z1: 102, z2: 51, z3: 17, z4: 0, z5: 0 },  // Week 9: 170m total
            { z1: 108, z2: 54, z3: 18, z4: 0, z5: 0 },  // Week 10: 180m total
            { z1: 114, z2: 57, z3: 19, z4: 0, z5: 0 },  // Week 11: 190m total
            { z1: 120, z2: 60, z3: 20, z4: 0, z5: 0 }   // Week 12: 200m total
          ]
        },
        {
          id: 'sub-4',
          name: 'Cycling',
          modality: 'cycling',
          volume: 120,
          intensity: 4,
          color: 'bg-green-300',
          weeklyVolumes: [100, 110, 120, 130, 140, 120, 100, 110, 120, 130, 140, 120], // 12 weeks with ramp/deload
          weeklyTIZ: [
            { z1: 60, z2: 30, z3: 10, z4: 0, z5: 0 },   // Week 1: 100m total
            { z1: 66, z2: 33, z3: 11, z4: 0, z5: 0 },   // Week 2: 110m total
            { z1: 72, z2: 36, z3: 12, z4: 0, z5: 0 },   // Week 3: 120m total
            { z1: 78, z2: 39, z3: 13, z4: 0, z5: 0 },   // Week 4: 130m total
            { z1: 84, z2: 42, z3: 14, z4: 0, z5: 0 },   // Week 5: 140m total
            { z1: 72, z2: 36, z3: 12, z4: 0, z5: 0 },   // Week 6: 120m total (deload)
            { z1: 60, z2: 30, z3: 10, z4: 0, z5: 0 },   // Week 7: 100m total
            { z1: 66, z2: 33, z3: 11, z4: 0, z5: 0 },   // Week 8: 110m total
            { z1: 72, z2: 36, z3: 12, z4: 0, z5: 0 },   // Week 9: 120m total
            { z1: 78, z2: 39, z3: 13, z4: 0, z5: 0 },   // Week 10: 130m total
            { z1: 84, z2: 42, z3: 14, z4: 0, z5: 0 },   // Week 11: 140m total
            { z1: 72, z2: 36, z3: 12, z4: 0, z5: 0 }    // Week 12: 120m total
          ]
        }
      ]
    },
    {
      id: 'cme-2',
      name: 'Threshold Work',
      type: 'cme',
      startWeek: 12,
      duration: 8,
      intensity: 7,
      volume: 360,
      color: 'bg-green-100 border-green-300',
      deload: false,
      subPhases: [
        {
          id: 'sub-5',
          name: 'Running',
          modality: 'running',
          volume: 240,
          intensity: 7,
          color: 'bg-green-200',
          weeklyVolumes: [200, 220, 240, 260, 240, 220, 200, 180] // 8 weeks with threshold progression
        },
        {
          id: 'sub-6',
          name: 'Cycling',
          modality: 'cycling',
          volume: 120,
          intensity: 7,
          color: 'bg-green-300',
          weeklyVolumes: [100, 110, 120, 130, 120, 110, 100, 90] // 8 weeks with threshold progression
        }
      ]
    },
    {
      id: 'cme-3',
      name: 'Race Prep',
      type: 'cme',
      startWeek: 20,
      duration: 6,
      intensity: 8,
      volume: 420,
      color: 'bg-green-100 border-green-300',
      deload: true,
      subPhases: [
        {
          id: 'sub-7',
          name: 'Running',
          modality: 'running',
          volume: 280,
          intensity: 8,
          color: 'bg-green-200',
          weeklyVolumes: [300, 320, 300, 280, 260, 240] // 6 weeks with taper
        },
        {
          id: 'sub-8',
          name: 'Cycling',
          modality: 'cycling',
          volume: 140,
          intensity: 8,
          color: 'bg-green-300',
          weeklyVolumes: [150, 160, 150, 140, 130, 120] // 6 weeks with taper
        }
      ]
    },
    // Recovery Phases
    {
      id: 'rec-1',
      name: 'Active Recovery',
      type: 'recovery',
      startWeek: 6,
      duration: 1,
      intensity: 2,
      volume: 60,
      color: 'bg-purple-100 border-purple-300',
      deload: true
    },
    {
      id: 'rec-2',
      name: 'Deload Week',
      type: 'recovery',
      startWeek: 13,
      duration: 1,
      intensity: 2,
      volume: 120,
      color: 'bg-purple-100 border-purple-300',
      deload: true
    },
    {
      id: 'rec-3',
      name: 'Taper',
      type: 'recovery',
      startWeek: 26,
      duration: 2,
      intensity: 3,
      volume: 180,
      color: 'bg-purple-100 border-purple-300',
      deload: true
    }
  ],
  goals: [
    {
      id: 'goal-1',
      name: 'Squat 300lbs',
      type: 'metric',
      targetDate: new Date('2024-06-01'),
      targetValue: 300,
      currentValue: 275,
      unit: 'lbs',
      status: 'pending'
    },
    {
      id: 'goal-2',
      name: '5K Race',
      type: 'milestone',
      targetDate: new Date('2024-08-15'),
      status: 'pending'
    },
    {
      id: 'goal-3',
      name: 'Deadlift 400lbs',
      type: 'metric',
      targetDate: new Date('2024-10-01'),
      targetValue: 400,
      currentValue: 365,
      unit: 'lbs',
      status: 'pending'
    }
  ],
  events: [
    {
      id: 'event-1',
      name: 'Powerlifting Meet',
      date: new Date('2024-06-15'),
      type: 'competition',
      color: 'bg-red-100 border-red-300'
    },
    {
      id: 'event-2',
      name: '5K Race',
      date: new Date('2024-08-15'),
      type: 'competition',
      color: 'bg-red-100 border-red-300'
    },
    {
      id: 'event-3',
      name: 'Body Comp Test',
      date: new Date('2024-09-01'),
      type: 'test',
      color: 'bg-orange-100 border-orange-300'
    },
    {
      id: 'event-4',
      name: 'Vacation',
      date: new Date('2024-07-01'),
      type: 'travel',
      color: 'bg-yellow-100 border-yellow-300'
    }
  ]
};
