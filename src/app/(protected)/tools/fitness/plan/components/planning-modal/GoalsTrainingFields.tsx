'use client';

import React, { useState } from 'react';
import type { GoalsPlanningFields } from './planning-types.zod';

interface GoalsTrainingFieldsProps {
  onDataChange: (data: GoalsPlanningFields) => void;
  clickedDate?: Date;
  existingData?: GoalsPlanningFields;
}

export default function GoalsTrainingFields({
  onDataChange,
  clickedDate,
  existingData
}: GoalsTrainingFieldsProps) {
  const calculateEndDate = (startDate: string, duration: number): string => {
    if (!startDate) return '';
    const start = new Date(startDate);
    const end = new Date(start.getTime() + duration * 7 * 24 * 60 * 60 * 1000);
    return end.toISOString().split('T')[0];
  };

  const getInitialData = (): GoalsPlanningFields => {
    if (existingData) {
      const data = { ...existingData };
      
      // Ensure single-date items have duration = 1 and endDate = startDate
      if (data.itemType === 'goal' || data.itemType === 'milestone' || 
          (data.itemType === 'event' && data.eventType !== 'vacation' && data.eventType !== 'trip')) {
        data.duration = 1;
        data.endDate = data.startDate || '';
      } else if (data.itemType === 'event' && (data.eventType === 'vacation' || data.eventType === 'trip')) {
        // For duration-based events, calculate endDate if not already set
        data.endDate = data.endDate || calculateEndDate(data.startDate || '', data.duration || 1);
      }
      
      return data;
    }

    const startDate = clickedDate ? clickedDate.toISOString().split('T')[0] : '';
    const duration = 1;
    const endDate = startDate || '';

    return {
      itemType: 'goal',
      name: '',
      description: '',
      startDate,
      endDate,
      duration,
      priority: 'medium',
      status: 'planned',
      goalType: 'performance',
      targetValue: '',
      measurementUnit: '',
      successCriteria: '',
      eventType: 'other',
      location: '',
      preparationWeeks: 0,
      trainingImpact: 'medium',
      trainingNotes: '',
      notes: ''
    };
  };

  const [goalsData, setGoalsData] = useState<GoalsPlanningFields>(getInitialData);

  const handleDataChange = (updates: Partial<GoalsPlanningFields>) => {
    const newData = { ...goalsData, ...updates };
    
    // Handle duration logic based on item type and event type
    if (updates.itemType !== undefined || updates.eventType !== undefined) {
      const itemType = updates.itemType !== undefined ? updates.itemType : goalsData.itemType;
      const eventType = updates.eventType !== undefined ? updates.eventType : goalsData.eventType;
      
      // For single-date items (goals, milestones, most events), set duration to 1
      if (itemType === 'goal' || itemType === 'milestone' || 
          (itemType === 'event' && eventType !== 'vacation' && eventType !== 'trip')) {
        newData.duration = 1;
        newData.endDate = newData.startDate || '';
      }
    }
    
    // Calculate end date if start date or duration changes
    if (updates.startDate !== undefined || updates.duration !== undefined) {
      const startDate = updates.startDate !== undefined ? updates.startDate : goalsData.startDate;
      const duration = updates.duration !== undefined ? updates.duration : goalsData.duration;
      
      // Only calculate endDate for duration-based events (vacation/trip)
      if (goalsData.itemType === 'event' && (goalsData.eventType === 'vacation' || goalsData.eventType === 'trip')) {
        newData.endDate = startDate ? calculateEndDate(startDate, duration) : '';
      } else {
        // For single-date items, endDate is the same as startDate
        newData.endDate = startDate || '';
      }
    }
    
    setGoalsData(newData);
    onDataChange(newData);
  };

  const itemTypeOptions = [
    { value: 'goal', label: 'Goal', description: 'A specific objective to achieve' },
    { value: 'milestone', label: 'Milestone', description: 'A significant checkpoint or achievement' },
    { value: 'event', label: 'Event', description: 'A specific occasion or happening' }
  ];

  const goalTypeOptions = [
    { value: 'performance', label: 'Performance', description: 'Athletic or physical performance goals' },
    { value: 'body_composition', label: 'Body Composition', description: 'Weight, muscle mass, body fat goals' },
    { value: 'health', label: 'Health', description: 'Health-related objectives' },
    { value: 'skill', label: 'Skill', description: 'Learning new skills or techniques' },
    { value: 'lifestyle', label: 'Lifestyle', description: 'Lifestyle changes or habits' },
    { value: 'career', label: 'Career', description: 'Professional development goals' },
    { value: 'personal', label: 'Personal', description: 'Personal development objectives' },
    { value: 'other', label: 'Other', description: 'Other types of goals' }
  ];

  const eventTypeOptions = [
    { value: 'race', label: 'Race', description: 'Running, cycling, or other competitive races' },
    { value: 'competition', label: 'Competition', description: 'Sports competitions or tournaments' },
    { value: 'assessment', label: 'Assessment', description: 'Fitness tests or evaluations' },
    { value: 'milestone', label: 'Milestone', description: 'Significant life milestones' },
    { value: 'wedding', label: 'Wedding', description: 'Wedding or wedding-related events' },
    { value: 'vacation', label: 'Vacation', description: 'Vacation or travel' },
    { value: 'trip', label: 'Trip', description: 'Business or personal trips' },
    { value: 'work', label: 'Work', description: 'Work-related events or deadlines' },
    { value: 'personal', label: 'Personal', description: 'Personal events or occasions' },
    { value: 'other', label: 'Other', description: 'Other types of events' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', description: 'Nice to have, not urgent' },
    { value: 'medium', label: 'Medium', description: 'Important but not critical' },
    { value: 'high', label: 'High', description: 'Very important, high priority' },
    { value: 'critical', label: 'Critical', description: 'Must achieve, highest priority' }
  ];

  const statusOptions = [
    { value: 'planned', label: 'Planned', description: 'Scheduled for the future' },
    { value: 'in_progress', label: 'In Progress', description: 'Currently working on it' },
    { value: 'completed', label: 'Completed', description: 'Successfully achieved' },
    { value: 'cancelled', label: 'Cancelled', description: 'No longer pursuing' }
  ];

  const trainingImpactOptions = [
    { value: 'high', label: 'High Impact', description: 'Significantly affects training schedule' },
    { value: 'medium', label: 'Medium Impact', description: 'Moderately affects training' },
    { value: 'low', label: 'Low Impact', description: 'Minimal effect on training' },
    { value: 'none', label: 'No Impact', description: 'Does not affect training' }
  ];

  return (
    <div className="space-y-4">
      {/* Item Type */}
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          Item Type
        </label>
        <select
          value={goalsData.itemType}
          onChange={(e) => handleDataChange({ itemType: e.target.value as any })}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
        >
          {itemTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} - {option.description}
            </option>
          ))}
        </select>
      </div>

      {/* Name and Description */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Name *
          </label>
          <input
            type="text"
            value={goalsData.name}
            onChange={(e) => handleDataChange({ name: e.target.value })}
            placeholder="Enter goal, milestone, or event name..."
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Description
          </label>
          <textarea
            value={goalsData.description || ''}
            onChange={(e) => handleDataChange({ description: e.target.value })}
            placeholder="Describe this goal, milestone, or event..."
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
          />
        </div>
      </div>

      {/* Date Fields */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {goalsData.itemType === 'event' && (goalsData.eventType === 'vacation' || goalsData.eventType === 'trip') ? 'Start Date' : 'Date'}
          </label>
          <input
            type="date"
            value={goalsData.startDate}
            onChange={(e) => handleDataChange({ startDate: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
          />
          <p className="text-xs text-slate-500 mt-1">
            {goalsData.itemType === 'event' && (goalsData.eventType === 'vacation' || goalsData.eventType === 'trip') 
              ? 'When does this event start?' 
              : 'When is this goal, milestone, or event scheduled?'}
          </p>
        </div>
      </div>

      {/* Duration Fields - Only for vacation/trip events */}
      {goalsData.itemType === 'event' && (goalsData.eventType === 'vacation' || goalsData.eventType === 'trip') && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Duration (weeks)
            </label>
            <input
              type="number"
              min="1"
              max="52"
              value={goalsData.duration}
              onChange={(e) => handleDataChange({ duration: parseInt(e.target.value) || 1 })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              End Date
            </label>
            <input
              type="date"
              value={goalsData.endDate}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-700"
              readOnly
            />
            <p className="text-xs text-slate-500 mt-1">
              Automatically calculated
            </p>
          </div>
        </div>
      )}

      {/* Priority and Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Priority
          </label>
          <select
            value={goalsData.priority}
            onChange={(e) => handleDataChange({ priority: e.target.value as any })}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} - {option.description}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Status
          </label>
          <select
            value={goalsData.status}
            onChange={(e) => handleDataChange({ status: e.target.value as any })}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} - {option.description}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Goal-specific fields */}
      {goalsData.itemType === 'goal' && (
        <div className="space-y-4">
          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-sm font-medium text-slate-700 mb-3">Goal Details</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Goal Type
                </label>
                <select
                  value={goalsData.goalType || 'performance'}
                  onChange={(e) => handleDataChange({ goalType: e.target.value as any })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
                >
                  {goalTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Target Value
                </label>
                <input
                  type="text"
                  value={goalsData.targetValue || ''}
                  onChange={(e) => handleDataChange({ targetValue: e.target.value })}
                  placeholder="e.g., 5:30, 10%, 50kg"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Measurement Unit
                </label>
                <input
                  type="text"
                  value={goalsData.measurementUnit || ''}
                  onChange={(e) => handleDataChange({ measurementUnit: e.target.value })}
                  placeholder="e.g., minutes, percentage, kg"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Success Criteria
                </label>
                <input
                  type="text"
                  value={goalsData.successCriteria || ''}
                  onChange={(e) => handleDataChange({ successCriteria: e.target.value })}
                  placeholder="How will you know you've succeeded?"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event-specific fields */}
      {goalsData.itemType === 'event' && (
        <div className="space-y-4">
          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-sm font-medium text-slate-700 mb-3">Event Details</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Event Type
                </label>
                <select
                  value={goalsData.eventType || 'other'}
                  onChange={(e) => handleDataChange({ eventType: e.target.value as any })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
                >
                  {eventTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Location
                </label>
                <input
                  type="text"
                  value={goalsData.location || ''}
                  onChange={(e) => handleDataChange({ location: e.target.value })}
                  placeholder="Where will this event take place?"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Preparation Weeks
              </label>
              <input
                type="number"
                min="0"
                max="52"
                value={goalsData.preparationWeeks || 0}
                onChange={(e) => handleDataChange({ preparationWeeks: parseInt(e.target.value) || 0 })}
                placeholder="How many weeks of preparation needed?"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
              />
              <p className="text-xs text-slate-500 mt-1">
                Number of weeks you want to prepare for this event
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Training Impact */}
      <div className="border-t border-slate-200 pt-4">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Training Impact</h4>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Training Impact Level
            </label>
            <select
              value={goalsData.trainingImpact}
              onChange={(e) => handleDataChange({ trainingImpact: e.target.value as any })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
            >
              {trainingImpactOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Training Notes
            </label>
            <textarea
              value={goalsData.trainingNotes || ''}
              onChange={(e) => handleDataChange({ trainingNotes: e.target.value })}
              placeholder="How will this affect your training? Any specific considerations?"
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* General Notes */}
      <div className="border-t border-slate-200 pt-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Additional Notes
          </label>
          <textarea
            value={goalsData.notes || ''}
            onChange={(e) => handleDataChange({ notes: e.target.value })}
            placeholder="Any additional notes about this goal, milestone, or event..."
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
          />
        </div>
      </div>
    </div>
  );
}
