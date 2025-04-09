'use client';

import React, { useState } from 'react';
import ProgramSettings from './ProgramSettings';
import type { ProgramSettingsFormData } from './ProgramSettings';
import { PeriodizationType, PhaseFocus, progression_rules } from '@/app/lib/types/pillars/fitness';

/**
 * Props interface for the ProgramSettingsSection component
 * Using snake_case for database-mapped properties
 */
interface ProgramSettingsSectionProps {
  name: string;
  phase_focus: keyof typeof PhaseFocus;
  periodization_type: keyof typeof PeriodizationType;
  progression_rules?: progression_rules;
  onSettingsChange: (settings: Partial<ProgramSettingsFormData>) => void;
}

export default function ProgramSettingsSection({
  name,
  phase_focus,
  periodization_type,
  progression_rules,
  onSettingsChange
}: ProgramSettingsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div 
          className="flex justify-between items-center mb-4 cursor-pointer" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h2 className="text-xl font-semibold dark:text-slate-900">Program Settings</h2>
          <button
            className="text-gray-500 hover:text-gray-700 focus:outline-none transition-transform duration-200"
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
        {isExpanded && (
          <ProgramSettings
            program_name={name}
            phase_focus={phase_focus}
            periodization_type={periodization_type}
            progression_rules={progression_rules}
            onSettingsChange={onSettingsChange}
          />
        )}
      </div>
    </div>
  );
}