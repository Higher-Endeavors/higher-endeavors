'use client';

import React, { useState } from 'react';
import type { CardiometabolicPlanningFields } from './planning-types.zod';

interface CMETrainingFieldsProps {
  onDataChange: (data: CardiometabolicPlanningFields) => void;
  clickedDate?: Date;
  existingData?: CardiometabolicPlanningFields;
}

export default function CMETrainingFields({ 
  onDataChange, 
  clickedDate,
  existingData 
}: CMETrainingFieldsProps) {
  // Helper function to calculate end date
  const calculateEndDate = (startDate: string, duration: number): string => {
    if (!startDate) return '';
    const start = new Date(startDate);
    const end = new Date(start.getTime() + duration * 7 * 24 * 60 * 60 * 1000);
    return end.toISOString().split('T')[0];
  };

  // Get initial data for each tab
  const getInitialMacrocycleData = () => {
    if (existingData) {
      return {
        macrocyclePhase: existingData.macrocyclePhase || '',
        startDate: existingData.startDate || (clickedDate ? clickedDate.toISOString().split('T')[0] : ''),
        duration: existingData.duration || 4,
        endDate: existingData.endDate || calculateEndDate(existingData.startDate || '', existingData.duration || 4),
      };
    }
    
    return {
      macrocyclePhase: '',
      startDate: clickedDate ? clickedDate.toISOString().split('T')[0] : '',
      duration: 4,
      endDate: clickedDate ? calculateEndDate(clickedDate.toISOString().split('T')[0], 4) : '',
    };
  };

  const getInitialFocusBlockData = () => {
    if (existingData) {
      return {
        focusBlock: existingData.focusBlock || '',
        startDate: existingData.startDate || (clickedDate ? clickedDate.toISOString().split('T')[0] : ''),
        duration: existingData.duration || 4,
        endDate: existingData.endDate || calculateEndDate(existingData.startDate || '', existingData.duration || 4),
      };
    }
    
    return {
      focusBlock: '',
      startDate: clickedDate ? clickedDate.toISOString().split('T')[0] : '',
      duration: 4,
      endDate: clickedDate ? calculateEndDate(clickedDate.toISOString().split('T')[0], 4) : '',
    };
  };

  const getInitialVolumeData = () => {
    if (existingData) {
      return {
        activityType: existingData.activityType || 'mixed',
        weeklyVolume: existingData.weeklyVolume,
        intensityDistribution: existingData.intensityDistribution,
        rampRate: existingData.rampRate,
        startDate: existingData.startDate || (clickedDate ? clickedDate.toISOString().split('T')[0] : ''),
        duration: existingData.duration || 4,
        endDate: existingData.endDate || calculateEndDate(existingData.startDate || '', existingData.duration || 4),
      };
    }
    
    return {
      activityType: 'mixed',
      weeklyVolume: undefined, // Start with undefined instead of default value
      intensityDistribution: undefined, // Start with undefined instead of default values
      rampRate: undefined, // Start with undefined instead of default value
      startDate: clickedDate ? clickedDate.toISOString().split('T')[0] : '',
      duration: 4,
      endDate: clickedDate ? calculateEndDate(clickedDate.toISOString().split('T')[0], 4) : '',
    };
  };

  const [activeTab, setActiveTab] = useState<'macrocycle' | 'focus' | 'volume' | 'sessions'>('macrocycle');
  const [macrocycleData, setMacrocycleData] = useState(getInitialMacrocycleData);
  const [focusData, setFocusData] = useState(getInitialFocusBlockData);
  const [volumeData, setVolumeData] = useState(getInitialVolumeData);
  const [intensityPreset, setIntensityPreset] = useState<string>('pyramidal');
  const [notes, setNotes] = useState(existingData?.notes || '');

  // Handle data changes for each tab
  const handleMacrocycleDataChange = (updates: any) => {
    const newData = { ...macrocycleData, ...updates };
    
    // Calculate end date if start date or duration changed
    if (updates.startDate !== undefined || updates.duration !== undefined) {
      const startDate = updates.startDate !== undefined ? updates.startDate : macrocycleData.startDate;
      const duration = updates.duration !== undefined ? updates.duration : macrocycleData.duration;
      if (startDate) {
        newData.endDate = calculateEndDate(startDate, duration);
      }
    }
    
    setMacrocycleData(newData);
    
    // Update parent with combined data
    const combinedData = {
      macrocyclePhase: newData.macrocyclePhase,
      focusBlock: focusData.focusBlock,
      startDate: newData.startDate,
      duration: newData.duration,
      endDate: newData.endDate,
      activityType: volumeData.activityType as 'running' | 'cycling' | 'swimming' | 'mixed',
      weeklyVolume: volumeData.weeklyVolume,
      intensityDistribution: volumeData.intensityDistribution,
      rampRate: volumeData.rampRate,
      sessions: existingData?.sessions || {
        selectedSessions: [],
        assignmentWeeks: [],
      },
    };
    onDataChange(combinedData);
  };

  const handleFocusDataChange = (updates: any) => {
    const newData = { ...focusData, ...updates };
    
    // Calculate end date if start date or duration changed
    if (updates.startDate !== undefined || updates.duration !== undefined) {
      const startDate = updates.startDate !== undefined ? updates.startDate : focusData.startDate;
      const duration = updates.duration !== undefined ? updates.duration : focusData.duration;
      if (startDate) {
        newData.endDate = calculateEndDate(startDate, duration);
      }
    }
    
    setFocusData(newData);
    
    // Update parent with combined data
    const combinedData = {
      macrocyclePhase: macrocycleData.macrocyclePhase,
      focusBlock: newData.focusBlock,
      startDate: newData.startDate,
      duration: newData.duration,
      endDate: newData.endDate,
      activityType: volumeData.activityType as 'running' | 'cycling' | 'swimming' | 'mixed',
      weeklyVolume: volumeData.weeklyVolume,
      intensityDistribution: volumeData.intensityDistribution,
      rampRate: volumeData.rampRate,
      sessions: existingData?.sessions || {
        selectedSessions: [],
        assignmentWeeks: [],
      },
    };
    onDataChange(combinedData);
  };

  const handleVolumeDataChange = (updates: any) => {
    const newData = { ...volumeData, ...updates };
    
    // Calculate end date if start date or duration changed
    if (updates.startDate !== undefined || updates.duration !== undefined) {
      const startDate = updates.startDate !== undefined ? updates.startDate : volumeData.startDate;
      const duration = updates.duration !== undefined ? updates.duration : volumeData.duration;
      if (startDate) {
        newData.endDate = calculateEndDate(startDate, duration);
      }
    }
    
    setVolumeData(newData);
    
    // Update parent with combined data
    const combinedData = {
      macrocyclePhase: macrocycleData.macrocyclePhase,
      focusBlock: focusData.focusBlock,
      startDate: newData.startDate,
      duration: newData.duration,
      endDate: newData.endDate,
      activityType: newData.activityType,
      weeklyVolume: newData.weeklyVolume,
      intensityDistribution: newData.intensityDistribution,
      rampRate: newData.rampRate,
      sessions: existingData?.sessions || {
        selectedSessions: [],
        assignmentWeeks: [],
      },
    };
    onDataChange(combinedData);
  };

  // Handle intensity distribution preset changes
  const handleIntensityPresetChange = (presetValue: string) => {
    setIntensityPreset(presetValue);
    
    if (presetValue !== 'custom') {
      const preset = intensityDistributionPresets.find(p => p.value === presetValue);
      if (preset && preset.distribution) {
        handleVolumeDataChange({ intensityDistribution: preset.distribution });
      }
    }
  };

  const macrocyclePhaseOptions = [
    { value: 'Base', label: 'Base' },
    { value: 'Build', label: 'Build' },
    { value: 'Peak', label: 'Peak' },
    { value: 'Race/ Event', label: 'Race/ Event' },
    { value: 'Recovery/ Taper', label: 'Recovery/ Taper' },
    { value: 'Other', label: 'Other' },
    { value: 'None', label: 'None' }
  ];

  const focusBlockOptions = [
    { value: 'None', label: 'None' },
    { value: 'Aerobic Base', label: 'Aerobic Base' },
    { value: 'Tempo/ Lactate Threshold', label: 'Tempo/ Lactate Threshold' },
    { value: 'VO2 Max', label: 'VO2 Max' },
    { value: 'Anaerobic Capacity', label: 'Anaerobic Capacity' },
    { value: 'Lactate Tolerance', label: 'Lactate Tolerance' },
    { value: 'Speed / Neuromuscular Power', label: 'Speed / Neuromuscular Power' },
    { value: 'Muscular Endurance', label: 'Muscular Endurance' },
    { value: 'Race‑Pace Specificity', label: 'Race‑Pace Specificity' },
    { value: 'Concurrent/ Undulating', label: 'Concurrent/ Undulating' },
    { value: 'Polarized', label: 'Polarized' },
    { value: 'Pyramidal', label: 'Pyramidal' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Active Recovery', label: 'Active Recovery' },
    { value: 'Other', label: 'Other' }
  ];

  const activityTypeOptions = [
    { value: 'running', label: 'Running' },
    { value: 'cycling', label: 'Cycling' },
    { value: 'swimming', label: 'Swimming' },
    { value: 'mixed', label: 'Mixed' }
  ];

  const intensityDistributionPresets = [
    { 
      value: 'polarized', 
      label: 'Polarized (80/20)', 
      description: '80% low intensity, 20% high intensity',
      distribution: { z1: 80, z2: 0, z3: 20, z4: 0, z5: 0 }
    },
    { 
      value: 'pyramidal', 
      label: 'Pyramidal', 
      description: 'Gradual increase from low to high intensity',
      distribution: { z1: 70, z2: 20, z3: 10, z4: 0, z5: 0 }
    },
    { 
      value: 'threshold-focused', 
      label: 'Threshold-Focused', 
      description: 'Emphasis on lactate threshold training',
      distribution: { z1: 50, z2: 30, z3: 15, z4: 4, z5: 1 }
    },
    { 
      value: 'sweet-spot', 
      label: 'Sweet Spot', 
      description: 'Focus on high-end aerobic training',
      distribution: { z1: 40, z2: 45, z3: 10, z4: 4, z5: 1 }
    },
    { 
      value: 'base-building', 
      label: 'Base Building', 
      description: 'Emphasis on aerobic base development',
      distribution: { z1: 85, z2: 10, z3: 3, z4: 1, z5: 1 }
    },
    { 
      value: 'race-specific', 
      label: 'Race-Specific', 
      description: 'High intensity for race preparation',
      distribution: { z1: 30, z2: 20, z3: 25, z4: 15, z5: 10 }
    },
    { 
      value: 'recovery', 
      label: 'Recovery', 
      description: 'Low intensity recovery training',
      distribution: { z1: 95, z2: 5, z3: 0, z4: 0, z5: 0 }
    },
    { 
      value: 'custom', 
      label: 'Custom', 
      description: 'Manually set zone distribution'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('macrocycle')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'macrocycle'
              ? 'border-sky-500 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          Macrocycle Phase
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('focus')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'focus'
              ? 'border-sky-500 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          Focus Block
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('volume')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'volume'
              ? 'border-sky-500 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          Volume & Intensity
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'sessions'
              ? 'border-sky-500 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          Sessions
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'macrocycle' && (
          <div className="space-y-4">
            {/* Macrocycle Phase */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Macrocycle Phase
              </label>
              <select
                value={macrocycleData.macrocyclePhase}
                onChange={(e) => handleMacrocycleDataChange({ macrocyclePhase: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
              >
                <option value="">Select macrocycle phase...</option>
                {macrocyclePhaseOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
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
                  value={macrocycleData.startDate}
                  onChange={(e) => handleMacrocycleDataChange({ startDate: e.target.value })}
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
                  value={macrocycleData.duration}
                  onChange={(e) => handleMacrocycleDataChange({ duration: parseInt(e.target.value) || 1 })}
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
                value={macrocycleData.endDate}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-700"
                readOnly
              />
              <p className="text-xs text-slate-500 mt-1">
                Automatically calculated from start date and duration
              </p>
            </div>
          </div>
        )}

        {activeTab === 'focus' && (
          <div className="space-y-4">
            {/* Focus Block */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Focus Block
              </label>
              <select
                value={focusData.focusBlock}
                onChange={(e) => handleFocusDataChange({ focusBlock: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
              >
                <option value="">Select focus block...</option>
                {focusBlockOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
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
                  value={focusData.startDate}
                  onChange={(e) => handleFocusDataChange({ startDate: e.target.value })}
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
                  value={focusData.duration}
                  onChange={(e) => handleFocusDataChange({ duration: parseInt(e.target.value) || 1 })}
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
                value={focusData.endDate}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-700"
                readOnly
              />
              <p className="text-xs text-slate-500 mt-1">
                Automatically calculated from start date and duration
              </p>
            </div>
          </div>
        )}

        {activeTab === 'volume' && (
          <div className="space-y-4">
            {/* Activity Type */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Activity Type
              </label>
              <select
                value={volumeData.activityType}
                onChange={(e) => handleVolumeDataChange({ activityType: e.target.value as any })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
              >
                <option value="">Select activity type...</option>
                {activityTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Weekly Volume */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Weekly Volume (minutes)
              </label>
              <input
                type="number"
                min="60"
                max="600"
                value={volumeData.weeklyVolume || ''}
                onChange={(e) => handleVolumeDataChange({ weeklyVolume: parseInt(e.target.value) || undefined })}
                placeholder="Enter weekly volume in minutes"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
              />
            </div>

            {/* Ramp Rate */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Volume Ramp Rate (% per week)
              </label>
              <input
                type="number"
                min="4"
                max="12"
                step="0.5"
                value={volumeData.rampRate || ''}
                onChange={(e) => handleVolumeDataChange({ rampRate: parseFloat(e.target.value) || undefined })}
                placeholder="5"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
              />
            </div>

            {/* Intensity Distribution */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Intensity Distribution
              </label>
              
              {/* Preset Selection */}
              <div className="mb-4">
                <label className="text-xs text-slate-600 mb-1 block">
                  Distribution Pattern
                </label>
                <select
                  value={intensityPreset}
                  onChange={(e) => handleIntensityPresetChange(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
                >
                  {intensityDistributionPresets.map((preset) => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label} - {preset.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Zone Inputs */}
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(volumeData.intensityDistribution || { z1: 60, z2: 25, z3: 10, z4: 4, z5: 1 }).map(([zone, value]) => (
                  <div key={zone}>
                    <label className="text-xs text-slate-600 mb-1 block">
                      {zone.toUpperCase()}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={value}
                      onChange={(e) => {
                        setIntensityPreset('custom'); // Switch to custom when manually editing
                        const currentDistribution = volumeData.intensityDistribution || { z1: 60, z2: 25, z3: 10, z4: 4, z5: 1 };
                        handleVolumeDataChange({
                          intensityDistribution: {
                            ...currentDistribution,
                            [zone]: parseInt(e.target.value) || 0
                          }
                        });
                      }}
                      className="w-full border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
                    />
                  </div>
                ))}
              </div>
              
              {/* Total Percentage Display */}
              <div className="mt-2 text-xs text-slate-500">
                Total: {Object.values(volumeData.intensityDistribution || { z1: 60, z2: 25, z3: 10, z4: 4, z5: 1 }).reduce((sum, val) => sum + val, 0)}%
                {Object.values(volumeData.intensityDistribution || { z1: 60, z2: 25, z3: 10, z4: 4, z5: 1 }).reduce((sum, val) => sum + val, 0) !== 100 && (
                  <span className="text-amber-600 ml-1">(Should equal 100%)</span>
                )}
              </div>
            </div>


            {/* Date and Duration Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Start Date
                </label>
                <input
                  type="date"
                  value={volumeData.startDate}
                  onChange={(e) => handleVolumeDataChange({ startDate: e.target.value })}
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
                  value={volumeData.duration}
                  onChange={(e) => handleVolumeDataChange({ duration: parseInt(e.target.value) || 1 })}
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
                value={volumeData.endDate}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-700"
                readOnly
              />
              <p className="text-xs text-slate-500 mt-1">
                Automatically calculated from start date and duration
              </p>
            </div>

          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-4">
            {/* Sessions Placeholder */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-slate-700 mb-2">Sessions</h4>
              <p className="text-sm text-slate-600">
                Session selection will be added in a future step.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Notes Section - Independent of tabs */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              // Update the parent component with the notes
              const combinedData = {
                macrocyclePhase: macrocycleData.macrocyclePhase,
                focusBlock: focusData.focusBlock,
                startDate: macrocycleData.startDate || focusData.startDate || volumeData.startDate,
                duration: volumeData.duration,
                endDate: volumeData.endDate,
                activityType: volumeData.activityType as 'running' | 'cycling' | 'swimming' | 'mixed',
                weeklyVolume: volumeData.weeklyVolume,
                intensityDistribution: volumeData.intensityDistribution,
                rampRate: volumeData.rampRate,
                sessions: {
                  selectedSessions: [],
                  assignmentWeeks: [],
                },
                notes: e.target.value,
              };
              onDataChange(combinedData);
            }}
            placeholder="Additional notes about this CME training planning item..."
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
          />
        </div>
      </div>
    </div>
  );
}
