import React, { useState } from 'react';
import { HiCog, HiChartBar, HiClipboardList, HiCalendar, HiClock } from 'react-icons/hi';
import type { ResistancePlanningFields } from './planning-types.zod';

interface ResistanceTrainingFieldsProps {
  onDataChange?: (data: ResistancePlanningFields) => void;
  clickedDate?: Date;
  existingData?: ResistancePlanningFields;
}

export default function ResistanceTrainingFields({ onDataChange, clickedDate, existingData }: ResistanceTrainingFieldsProps) {
  const [activeTab, setActiveTab] = useState<'phase' | 'periodization' | 'programs'>('phase');
  const [notes, setNotes] = useState(existingData?.notes || '');

  // Get initial values based on existing data
  const getInitialPhaseData = () => ({
    phaseFocus: existingData?.phase?.phaseFocus || '',
    startDate: existingData?.phase?.startDate || (clickedDate ? clickedDate.toISOString().split('T')[0] : ''),
    duration: existingData?.phase?.duration || 4,
    endDate: existingData?.phase?.endDate || '',
    programmingRules: existingData?.phase?.programmingRules || [],
  });

  const getInitialPeriodizationData = () => ({
    type: existingData?.periodization?.type || undefined,
    startDate: existingData?.periodization?.startDate || (clickedDate ? clickedDate.toISOString().split('T')[0] : ''),
    duration: existingData?.periodization?.duration || 4,
    endDate: existingData?.periodization?.endDate || '',
    settings: {
      volumeIncrement: existingData?.periodization?.settings?.volumeIncrement || 0,
      loadIncrement: existingData?.periodization?.settings?.loadIncrement || 0,
      weeklyVolumes: existingData?.periodization?.settings?.weeklyVolumes || [100, 80, 90, 60],
    },
  });

  const [phaseData, setPhaseData] = useState(getInitialPhaseData);
  const [periodizationData, setPeriodizationData] = useState<{
    type?: 'Linear' | 'Undulating';
    startDate: string;
    duration: number;
    endDate: string;
    settings: {
      volumeIncrement: number;
      loadIncrement: number;
      weeklyVolumes: number[];
    };
  }>(getInitialPeriodizationData);
  const [programData, setProgramData] = useState({
    selectedPrograms: [] as string[],
    assignmentWeeks: [] as number[],
  });

  const phaseFocusOptions = [
    { value: 'GPP', label: 'General Physical Preparedness (GPP)' },
    { value: 'Strength', label: 'Strength' },
    { value: 'Hypertrophy', label: 'Hypertrophy' },
    { value: 'Power', label: 'Power' },
    { value: 'Endurance', label: 'Muscular Endurance' },
    { value: 'Recovery', label: 'Recovery' },
    { value: 'Intensification', label: 'Intensification' },
    { value: 'Accumulation', label: 'Accumulation' },
    { value: 'Other', label: 'Other (Custom)' }
  ];

  const periodizationOptions = [
    { value: 'Linear', label: 'Linear' },
    { value: 'Undulating', label: 'Undulating' }
  ];


  // Helper function to calculate end date
  const calculateEndDate = (startDate: string, duration: number) => {
    if (startDate && duration) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + (duration * 7) - 1);
      return end.toISOString().split('T')[0];
    }
    return '';
  };

  const tabs = [
    { id: 'phase', label: 'Phase/Focus Block', icon: HiCog, description: 'Set training phase and programming rules' },
    { id: 'periodization', label: 'Periodization Block', icon: HiChartBar, description: 'Configure progression patterns' },
    { id: 'programs', label: 'Specific Programs', icon: HiClipboardList, description: 'Assign programs to specific weeks' },
  ];

  const handlePhaseDataChange = (field: string, value: any) => {
    const newData = { ...phaseData, [field]: value };
    
    // Calculate end date if start date or duration changed
    if (field === 'startDate' || field === 'duration') {
      newData.endDate = calculateEndDate(
        field === 'startDate' ? value : newData.startDate,
        field === 'duration' ? value : newData.duration
      );
    }
    
    setPhaseData(newData);
    onDataChange?.({ 
      phase: newData, 
      periodization: periodizationData, 
      programs: programData 
    });
  };

  const handlePeriodizationDataChange = (field: string, value: any) => {
    const newData = { ...periodizationData, [field]: value };
    
    // Calculate end date if start date or duration changed
    if (field === 'startDate' || field === 'duration') {
      newData.endDate = calculateEndDate(
        field === 'startDate' ? value : newData.startDate,
        field === 'duration' ? value : newData.duration
      );
    }
    
    setPeriodizationData(newData);
    onDataChange?.({ 
      phase: phaseData, 
      periodization: newData, 
      programs: programData 
    });
  };

  const handleProgramDataChange = (field: string, value: any) => {
    const newData = { ...programData, [field]: value };
    setProgramData(newData);
    onDataChange?.({ 
      phase: phaseData, 
      periodization: periodizationData, 
      programs: newData 
    });
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-sky-500 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'phase' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Phase Focus
              </label>
              <select
                value={phaseData.phaseFocus}
                onChange={(e) => handlePhaseDataChange('phaseFocus', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
              >
                <option value="">Select phase focus...</option>
                {phaseFocusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Phase Date and Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  <HiCalendar className="inline h-4 w-4 mr-1" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={phaseData.startDate}
                  onChange={(e) => handlePhaseDataChange('startDate', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  <HiClock className="inline h-4 w-4 mr-1" />
                  Duration (weeks)
                </label>
                <input
                  type="number"
                  value={phaseData.duration}
                  onChange={(e) => handlePhaseDataChange('duration', Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
                  min="1"
                  max="52"
                />
              </div>
            </div>

            {/* Phase End Date (calculated) */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                End Date
              </label>
              <input
                type="date"
                value={phaseData.endDate}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-700"
                readOnly
              />
              <p className="text-xs text-slate-500 mt-1">
                Automatically calculated from start date and duration
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Programming Rules
              </label>
              <div className="space-y-2">
                {phaseData.programmingRules.length > 0 ? (
                  <div className="space-y-1">
                    {phaseData.programmingRules.map((rule, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                        <span className="text-sm text-slate-700">{rule}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newRules = phaseData.programmingRules.filter((_, i) => i !== index);
                            handlePhaseDataChange('programmingRules', newRules);
                          }}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-slate-500">
                    <p className="text-sm">No programming rules defined</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    // TODO: Implement programming rule creation modal
                    console.log('Add programming rule clicked');
                  }}
                  className="w-full text-center text-sky-600 hover:text-sky-700 text-sm font-medium py-2 border border-dashed border-sky-300 rounded-lg hover:border-sky-400 transition-colors"
                >
                  + Add Programming Rule
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'periodization' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Periodization Type
              </label>
              <select
                value={periodizationData.type}
                onChange={(e) => handlePeriodizationDataChange('type', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
              >
                <option value="">Select periodization type...</option>
                {periodizationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Periodization Date and Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  <HiCalendar className="inline h-4 w-4 mr-1" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={periodizationData.startDate}
                  onChange={(e) => handlePeriodizationDataChange('startDate', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  <HiClock className="inline h-4 w-4 mr-1" />
                  Duration (weeks)
                </label>
                <input
                  type="number"
                  value={periodizationData.duration}
                  onChange={(e) => handlePeriodizationDataChange('duration', Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
                  min="1"
                  max="52"
                />
              </div>
            </div>

            {/* Periodization End Date (calculated) */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                End Date
              </label>
              <input
                type="date"
                value={periodizationData.endDate}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-700"
                readOnly
              />
              <p className="text-xs text-slate-500 mt-1">
                Automatically calculated from start date and duration
              </p>
            </div>

            {periodizationData.type === 'Linear' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Volume Increment (%)
                  </label>
                  <input
                    type="number"
                    value={periodizationData.settings.volumeIncrement}
                    onChange={(e) => handlePeriodizationDataChange('settings', {
                      ...periodizationData.settings,
                      volumeIncrement: Number(e.target.value)
                    })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Load Increment (%)
                  </label>
                  <input
                    type="number"
                    value={periodizationData.settings.loadIncrement}
                    onChange={(e) => handlePeriodizationDataChange('settings', {
                      ...periodizationData.settings,
                      loadIncrement: Number(e.target.value)
                    })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
                    placeholder="2.5"
                  />
                </div>
              </div>
            )}

            {periodizationData.type === 'Undulating' && (
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Weekly Volume Percentages
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {periodizationData.settings.weeklyVolumes.map((volume, index) => (
                    <div key={index}>
                      <label className="text-xs text-slate-600">Week {index + 1}</label>
                      <input
                        type="number"
                        value={volume}
                        onChange={(e) => {
                          const newVolumes = [...periodizationData.settings.weeklyVolumes];
                          newVolumes[index] = Number(e.target.value);
                          handlePeriodizationDataChange('settings', {
                            ...periodizationData.settings,
                            weeklyVolumes: newVolumes
                          });
                        }}
                        className="w-full border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'programs' && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">
                Program selection functionality will be integrated in future steps. 
                This will allow you to assign specific resistance training programs to individual weeks.
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
              if (onDataChange) {
                const currentData = {
                  phase: phaseData.phaseFocus ? {
                    phaseFocus: phaseData.phaseFocus,
                    startDate: phaseData.startDate,
                    duration: phaseData.duration,
                    endDate: phaseData.endDate,
                    programmingRules: phaseData.programmingRules,
                  } : undefined,
                  periodization: periodizationData.type ? {
                    type: periodizationData.type,
                    startDate: periodizationData.startDate,
                    duration: periodizationData.duration,
                    endDate: periodizationData.endDate,
                    settings: periodizationData.settings,
                  } : undefined,
                  programs: programData.selectedPrograms.length > 0 ? programData : undefined,
                  notes: e.target.value,
                };
                onDataChange(currentData);
              }
            }}
            placeholder="Additional notes about this resistance training planning item..."
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
          />
        </div>
      </div>
    </div>
  );
}
