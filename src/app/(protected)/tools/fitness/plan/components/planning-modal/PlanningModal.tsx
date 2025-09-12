import React, { useState } from 'react';
import { HiX } from 'react-icons/hi';
import ResistanceTrainingFields from './ResistanceTrainingFields';
import CMETrainingFields from './CMETrainingFields';
import RecoveryTrainingFields from './RecoveryTrainingFields';
import type { 
  PlanningType, 
  PlanningItem, 
  ResistancePlanningFields,
  CardiometabolicPlanningFields,
  RecoveryPlanningFields,
  MilestoneEventPlanningFields,
  planningTypeInfo
} from './planning-types.zod';
import { planningTypeInfo as typeInfo } from './planning-types.zod';

interface PlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: PlanningItem) => void;
  clickedDate?: Date;
  clickedWeek?: number;
  clickedModality?: string;
  editingItem?: PlanningItem | null;
}

export default function PlanningModal({
  isOpen,
  onClose,
  onSave,
  clickedDate,
  clickedWeek,
  clickedModality,
  editingItem
}: PlanningModalProps) {
  // Initialize state based on props (following AddExerciseModal pattern)
  const getInitialPlanningType = () => {
    if (editingItem) return editingItem.type;
    return clickedModality ? getPlanningTypeFromModality(clickedModality) : 'event';
  };

  const getInitialResistanceData = (): ResistancePlanningFields => {
    if (editingItem?.resistance) return editingItem.resistance;
    return {
      phase: undefined,
      periodization: undefined,
      programs: undefined,
      notes: '',
    };
  };

  const getInitialCmeData = (): CardiometabolicPlanningFields => {
    if (editingItem?.cardiometabolic) return editingItem.cardiometabolic;
    return {
      macrocyclePhase: '',
      focusBlock: '',
      startDate: '',
      duration: 4,
      endDate: '',
      activityType: 'mixed',
      weeklyVolume: undefined,
      intensityDistribution: undefined,
      rampRate: undefined,
      sessions: {
        selectedSessions: [],
        assignmentWeeks: [],
      },
      notes: '',
    };
  };

  const getInitialRecoveryData = (): RecoveryPlanningFields => {
    if (editingItem?.recovery) return editingItem.recovery;
    return {
      recoveryType: undefined,
      startDate: '',
      duration: 1,
      endDate: '',
      notes: '',
    };
  };

  const getInitialMilestoneData = (): MilestoneEventPlanningFields => {
    if (editingItem?.milestone) return editingItem.milestone;
    const startDate = clickedDate ? clickedDate.toISOString().split('T')[0] : '';
    return {
      name: '',
      description: '',
      startDate,
      endDate: startDate,
      duration: 1,
      notes: '',
    };
  };

  const getInitialEventData = (): MilestoneEventPlanningFields => {
    if (editingItem?.event) return editingItem.event;
    const startDate = clickedDate ? clickedDate.toISOString().split('T')[0] : '';
    return {
      name: '',
      description: '',
      startDate,
      endDate: startDate,
      duration: 1,
      notes: '',
    };
  };

  const [planningType, setPlanningType] = useState<PlanningType | ''>(getInitialPlanningType);
  const [resistanceData, setResistanceData] = useState<ResistancePlanningFields>(getInitialResistanceData);
  const [cmeData, setCmeData] = useState<CardiometabolicPlanningFields>(getInitialCmeData);
  const [recoveryData, setRecoveryData] = useState<RecoveryPlanningFields>(getInitialRecoveryData);
  const [milestoneData, setMilestoneData] = useState<MilestoneEventPlanningFields>(getInitialMilestoneData);
  const [eventData, setEventData] = useState<MilestoneEventPlanningFields>(getInitialEventData);

  // Map modality to planning type
  const getPlanningTypeFromModality = (modality: string): PlanningType | '' => {
    const modalityMap: { [key: string]: PlanningType } = {
      'resistance': 'resistance',
      'cme': 'cardiometabolic',
      'recovery': 'recovery',
      'goals': 'event', // Default to event for goals modality
    };
    return modalityMap[modality] || '';
  };


  // Helper function to calculate end date
  const calculateEndDate = (startDate: string, duration: number): string => {
    if (!startDate || !duration) return '';
    const start = new Date(startDate);
    const end = new Date(start.getTime() + duration * 7 * 24 * 60 * 60 * 1000);
    return end.toISOString().split('T')[0];
  };

  // Event handlers for milestone data
  const handleMilestoneStartDateChange = (startDate: string) => {
    const endDate = calculateEndDate(startDate, milestoneData.duration);
    setMilestoneData(prev => ({ ...prev, startDate, endDate }));
  };

  const handleMilestoneDurationChange = (duration: number) => {
    const endDate = calculateEndDate(milestoneData.startDate, duration);
    setMilestoneData(prev => ({ ...prev, duration, endDate }));
  };

  // Event handlers for event data
  const handleEventStartDateChange = (startDate: string) => {
    const endDate = calculateEndDate(startDate, eventData.duration);
    setEventData(prev => ({ ...prev, startDate, endDate }));
  };

  const handleEventDurationChange = (duration: number) => {
    const endDate = calculateEndDate(eventData.startDate, duration);
    setEventData(prev => ({ ...prev, duration, endDate }));
  };

  const handleSave = () => {
    if (!planningType) return;

    // Helper function to create resistance data with only filled sections
    const createResistanceData = (data: typeof resistanceData) => {
      const result: any = {};
      
      if (data.phase?.phaseFocus) {
        result.phase = data.phase;
      }
      if (data.periodization?.type) {
        result.periodization = data.periodization;
      }
      if (data.programs?.selectedPrograms && data.programs.selectedPrograms.length > 0) {
        result.programs = data.programs;
      }
      if (data.notes) {
        result.notes = data.notes;
      }
      
      return Object.keys(result).length > 0 ? result : undefined;
    };

    // Helper function to create CME data with only filled sections
    const createCMEData = (data: typeof cmeData) => {
      const result: any = {};
      
      // Only include fields that have been explicitly set (not undefined)
      if (data.macrocyclePhase) result.macrocyclePhase = data.macrocyclePhase;
      if (data.focusBlock) result.focusBlock = data.focusBlock;
      if (data.startDate) result.startDate = data.startDate;
      if (data.duration !== 4) result.duration = data.duration;
      if (data.endDate) result.endDate = data.endDate;
      if (data.activityType !== 'mixed') result.activityType = data.activityType;
      if (data.weeklyVolume !== undefined) result.weeklyVolume = data.weeklyVolume;
      if (data.rampRate !== undefined) result.rampRate = data.rampRate;
      if (data.intensityDistribution) result.intensityDistribution = data.intensityDistribution;
      if (data.sessions?.selectedSessions && data.sessions.selectedSessions.length > 0) {
        result.sessions = data.sessions;
      }
      if (data.weekOverrides) result.weekOverrides = data.weekOverrides;
      if (data.notes) result.notes = data.notes;
      
      return Object.keys(result).length > 0 ? result : undefined;
    };

    // Helper function to create recovery data with only filled sections
    const createRecoveryData = (data: typeof recoveryData) => {
      const result: any = {};
      
      if (data.recoveryType || data.startDate || data.duration !== 1 || 
          data.endDate || data.notes) {
        
        if (data.recoveryType) result.recoveryType = data.recoveryType;
        if (data.startDate) result.startDate = data.startDate;
        if (data.duration !== 1) result.duration = data.duration;
        if (data.endDate) result.endDate = data.endDate;
        if (data.notes) result.notes = data.notes;
      }
      
      return Object.keys(result).length > 0 ? result : undefined;
    };


    const planningItem: PlanningItem = {
      id: editingItem?.id || `planning-${Date.now()}`,
      type: planningType as PlanningType,
      resistance: planningType === 'resistance' ? createResistanceData(resistanceData) : undefined,
      cardiometabolic: planningType === 'cardiometabolic' ? createCMEData(cmeData) : undefined,
      recovery: planningType === 'recovery' ? createRecoveryData(recoveryData) : undefined,
      milestone: planningType === 'milestone' ? milestoneData : undefined,
      event: planningType === 'event' ? eventData : undefined,
      createdAt: editingItem?.createdAt || new Date().toISOString(),
    };

    onSave(planningItem);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                {editingItem ? 'Edit Planning Item' : 'Add Planning Item'}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {clickedWeek ? `Week ${clickedWeek + 1}` : 'Select planning details'}
                {clickedModality && (
                  <span className="ml-2 px-2 py-1 bg-sky-100 text-sky-700 rounded-full text-xs">
                    {clickedModality.charAt(0).toUpperCase() + clickedModality.slice(1)}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <HiX className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Planning Type Selection */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Planning Type
              </label>
              <select
                value={planningType}
                onChange={(e) => setPlanningType(e.target.value as PlanningType | '')}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
              >
                <option value="">Select a planning type...</option>
                {Object.entries(typeInfo).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.icon} {info.label} - {info.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Type-specific fields */}
            {planningType && (
              <div className="space-y-4">
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-lg font-medium text-slate-800 mb-4">
                    {typeInfo[planningType as PlanningType]?.label} Details
                  </h3>
                  
                  {planningType === 'resistance' && (
                    <ResistanceTrainingFields 
                      key={editingItem?.id || 'new'}
                      onDataChange={setResistanceData} 
                      clickedDate={clickedDate}
                      existingData={editingItem?.resistance}
                    />
                  )}
                  
                  {planningType === 'cardiometabolic' && (
                    <CMETrainingFields 
                      key={editingItem?.id || 'new'}
                      onDataChange={setCmeData} 
                      clickedDate={clickedDate}
                      existingData={editingItem?.cardiometabolic}
                    />
                  )}
                  
                  {planningType === 'recovery' && (
                    <RecoveryTrainingFields 
                      key={editingItem?.id || 'new'}
                      onDataChange={setRecoveryData} 
                      clickedDate={clickedDate}
                      existingData={editingItem?.recovery}
                    />
                  )}
                  
                  {planningType === 'goal' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                      <div className="mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">Goals are managed in the Goal Tracker</h3>
                        <p className="text-blue-700 mb-4">
                          All goals are managed within the Goal Tracker tool. 
                          Your goals will automatically appear in the Planning Chart once created.
                        </p>
                        <a
                          href="/tools/lifestyle/goal-tracker"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Go to Goal Tracker
                        </a>
                      </div>
                    </div>
                  )}

                  {planningType === 'milestone' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={milestoneData.name}
                          onChange={(e) => setMilestoneData({...milestoneData, name: e.target.value})}
                          placeholder="Enter milestone name..."
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                          Description
                        </label>
                        <textarea
                          value={milestoneData.description || ''}
                          onChange={(e) => setMilestoneData({...milestoneData, description: e.target.value})}
                          placeholder="Describe this milestone..."
                          rows={3}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-700 mb-2 block">
                            Start Date *
                          </label>
                          <input
                            type="date"
                            value={milestoneData.startDate}
                            onChange={(e) => handleMilestoneStartDateChange(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
                            required
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
                            value={milestoneData.duration}
                            onChange={(e) => handleMilestoneDurationChange(parseInt(e.target.value) || 1)}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={milestoneData.endDate}
                          className="w-full border rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-700"
                          readOnly
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Automatically calculated from start date and duration
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                          Notes
                        </label>
                        <textarea
                          value={milestoneData.notes || ''}
                          onChange={(e) => setMilestoneData({...milestoneData, notes: e.target.value})}
                          placeholder="Any additional notes about this milestone..."
                          rows={2}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
                        />
                      </div>
                    </div>
                  )}

                  {planningType === 'event' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={eventData.name}
                          onChange={(e) => setEventData({...eventData, name: e.target.value})}
                          placeholder="Enter event name..."
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                          Description
                        </label>
                        <textarea
                          value={eventData.description || ''}
                          onChange={(e) => setEventData({...eventData, description: e.target.value})}
                          placeholder="Describe this event..."
                          rows={3}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-700 mb-2 block">
                            Start Date *
                          </label>
                          <input
                            type="date"
                            value={eventData.startDate}
                            onChange={(e) => handleEventStartDateChange(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
                            required
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
                            value={eventData.duration}
                            onChange={(e) => handleEventDurationChange(parseInt(e.target.value) || 1)}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={eventData.endDate}
                          className="w-full border rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-700"
                          readOnly
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Automatically calculated from start date and duration
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                          Notes
                        </label>
                        <textarea
                          value={eventData.notes || ''}
                          onChange={(e) => setEventData({...eventData, notes: e.target.value})}
                          placeholder="Any additional notes about this event..."
                          rows={2}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!planningType}
                className="px-4 py-2 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingItem ? 'Update Planning Item' : 'Add Planning Item'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
