'use client';

import React, { useState } from 'react';
import type { RecoveryPlanningFields } from './planning-types.zod';

interface RecoveryTrainingFieldsProps {
  onDataChange: (data: RecoveryPlanningFields) => void;
  clickedDate?: Date;
  existingData?: RecoveryPlanningFields;
}

export default function RecoveryTrainingFields({
  onDataChange,
  clickedDate,
  existingData
}: RecoveryTrainingFieldsProps) {
  const calculateEndDate = (startDate: string, duration: number): string => {
    if (!startDate) return '';
    const start = new Date(startDate);
    const end = new Date(start.getTime() + duration * 7 * 24 * 60 * 60 * 1000);
    return end.toISOString().split('T')[0];
  };

  const getInitialData = (): RecoveryPlanningFields => {
    if (existingData) {
      return {
        ...existingData,
        endDate: existingData.endDate || calculateEndDate(existingData.startDate || '', existingData.duration || 1)
      };
    }

    const startDate = clickedDate ? clickedDate.toISOString().split('T')[0] : '';
    const duration = 1;
    const endDate = startDate ? calculateEndDate(startDate, duration) : '';

    return {
      recoveryType: undefined,
      startDate,
      duration,
      endDate,
      // Commented out for future implementation
      // intensity: 'low',
      // weeklyRecoveryDays: 2,
      // recoveryActivities: [],
      // sleepTarget: 8,
      // stressLevel: 'low',
      // nutritionFocus: 'general',
      notes: ''
    };
  };

  const [recoveryData, setRecoveryData] = useState<RecoveryPlanningFields>(getInitialData);

  const handleDataChange = (updates: Partial<RecoveryPlanningFields>) => {
    const newData = { ...recoveryData, ...updates };
    
    // Calculate end date if start date or duration changes
    if (updates.startDate !== undefined || updates.duration !== undefined) {
      const startDate = updates.startDate !== undefined ? updates.startDate : recoveryData.startDate;
      const duration = updates.duration !== undefined ? updates.duration : recoveryData.duration;
      newData.endDate = startDate ? calculateEndDate(startDate, duration) : '';
    }
    
    setRecoveryData(newData);
    onDataChange(newData);
  };

  const recoveryTypeOptions = [
    { value: 'Taper', label: 'Taper', description: 'Gradual reduction in training load before competition' },
    { value: 'Deload', label: 'Deload', description: 'Reduced intensity/volume for recovery and adaptation' },
    { value: 'Rest', label: 'Rest', description: 'Complete rest from training' },
    { value: 'Recovery', label: 'Recovery', description: 'General recovery period' },
    { value: 'Active Recovery', label: 'Active Recovery', description: 'Light activity to promote recovery' },
    { value: 'Passive Recovery', label: 'Passive Recovery', description: 'Minimal activity, focus on rest' }
  ];

  // Commented out for future implementation
  // const intensityOptions = [
  //   { value: 'very_low', label: 'Very Low', description: 'Minimal activity, complete rest' },
  //   { value: 'low', label: 'Low', description: 'Light activity, easy movement' },
  //   { value: 'moderate', label: 'Moderate', description: 'Gentle activity, light training' }
  // ];

  // const stressLevelOptions = [
  //   { value: 'very_low', label: 'Very Low', description: 'Minimal stress, maximum recovery' },
  //   { value: 'low', label: 'Low', description: 'Reduced stress, focus on recovery' },
  //   { value: 'medium', label: 'Medium', description: 'Moderate stress, balanced approach' },
  //   { value: 'high', label: 'High', description: 'Higher stress, limited recovery' }
  // ];

  // const nutritionFocusOptions = [
  //   { value: 'hydration', label: 'Hydration', description: 'Focus on fluid balance and electrolyte replacement' },
  //   { value: 'anti_inflammatory', label: 'Anti-Inflammatory', description: 'Foods and nutrients to reduce inflammation' },
  //   { value: 'protein_synthesis', label: 'Protein Synthesis', description: 'Support muscle repair and growth' },
  //   { value: 'general', label: 'General', description: 'Balanced nutrition for overall health' }
  // ];

  // const recoveryActivityOptions = [
  //   'Yoga', 'Stretching', 'Foam Rolling', 'Massage', 'Sauna', 'Cold Therapy',
  //   'Walking', 'Swimming', 'Cycling', 'Meditation', 'Breathing Exercises',
  //   'Sleep Optimization', 'Hydration Focus', 'Nutrition Planning'
  // ];

  return (
    <div className="space-y-4">
      {/* Recovery Type */}
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          Recovery Type
        </label>
        <select
          value={recoveryData.recoveryType || ''}
          onChange={(e) => handleDataChange({ recoveryType: e.target.value as any || undefined })}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
        >
          <option value="">Select recovery type...</option>
          {recoveryTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} - {option.description}
            </option>
          ))}
        </select>
      </div>

      {/* Date and Duration Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Start Date
          </label>
          <input
            type="date"
            value={recoveryData.startDate}
            onChange={(e) => handleDataChange({ startDate: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Duration (weeks)
          </label>
          <input
            type="number"
            min="1"
            max="52"
            value={recoveryData.duration}
            onChange={(e) => handleDataChange({ duration: parseInt(e.target.value) || 1 })}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
          />
        </div>
      </div>

      {/* End Date (calculated) */}
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          End Date
        </label>
        <input
          type="date"
          value={recoveryData.endDate}
          className="w-full border rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-700"
          readOnly
        />
        <p className="text-xs text-slate-500 mt-1">
          Automatically calculated from start date and duration
        </p>
      </div>

      {/* Intensity and Stress Level - Commented out for future implementation */}
      {/* <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Intensity Level
          </label>
          <select
            value={recoveryData.intensity}
            onChange={(e) => handleDataChange({ intensity: e.target.value as any })}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
          >
            {intensityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} - {option.description}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Stress Level
          </label>
          <select
            value={recoveryData.stressLevel}
            onChange={(e) => handleDataChange({ stressLevel: e.target.value as any })}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
          >
            {stressLevelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} - {option.description}
              </option>
            ))}
          </select>
        </div>
      </div> */}

      {/* Recovery Details - Commented out for future implementation */}
      {/* <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Weekly Recovery Days
          </label>
          <input
            type="number"
            min="1"
            max="7"
            value={recoveryData.weeklyRecoveryDays}
            onChange={(e) => handleDataChange({ weeklyRecoveryDays: parseInt(e.target.value) || 1 })}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Sleep Target (hours)
          </label>
          <input
            type="number"
            min="6"
            max="12"
            value={recoveryData.sleepTarget}
            onChange={(e) => handleDataChange({ sleepTarget: parseInt(e.target.value) || 8 })}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
          />
        </div>
      </div> */}

      {/* Nutrition Focus - Commented out for future implementation */}
      {/* <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          Nutrition Focus
        </label>
        <select
          value={recoveryData.nutritionFocus}
          onChange={(e) => handleDataChange({ nutritionFocus: e.target.value as any })}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
        >
          {nutritionFocusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} - {option.description}
            </option>
          ))}
        </select>
      </div> */}

      {/* Recovery Activities - Commented out for future implementation */}
      {/* <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          Recovery Activities
        </label>
        <div className="grid grid-cols-2 gap-2">
          {recoveryActivityOptions.map((activity) => (
            <label key={activity} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={recoveryData.recoveryActivities?.includes(activity) || false}
                onChange={(e) => {
                  const currentActivities = recoveryData.recoveryActivities || [];
                  const newActivities = e.target.checked
                    ? [...currentActivities, activity]
                    : currentActivities.filter(a => a !== activity);
                  handleDataChange({ recoveryActivities: newActivities });
                }}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span className="text-sm text-slate-700">{activity}</span>
            </label>
          ))}
        </div>
      </div> */}

      {/* Notes */}
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          Notes
        </label>
        <textarea
          value={recoveryData.notes || ''}
          onChange={(e) => handleDataChange({ notes: e.target.value })}
          placeholder="Additional notes about this recovery period..."
          rows={3}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
        />
      </div>
    </div>
  );
}
