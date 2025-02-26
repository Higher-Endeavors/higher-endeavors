'use client';

import React, { useState } from 'react';
import ProgramSettings from './ProgramSettings';
import type { ProgramSettingsFormData } from './ProgramSettings';

interface ProgramSettingsSectionProps {
  name: string;
  phaseFocus: ProgramSettingsFormData['phaseFocus'];
  periodizationType: ProgramSettingsFormData['periodizationType'];
  progressionRules?: {
    type: string;
    settings: {
      volumeIncrementPercentage?: number;
      loadIncrementPercentage?: number;
      programLength?: number;
      weeklyVolumePercentages?: number[];
    };
  };
  onSettingsChange: (settings: Partial<ProgramSettingsFormData>) => void;
}

export default function ProgramSettingsSection({
  name,
  phaseFocus,
  periodizationType,
  progressionRules,
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
            programName={name}
            phaseFocus={phaseFocus}
            periodizationType={periodizationType}
            progressionRules={progressionRules}
            onSettingsChange={onSettingsChange}
          />
        )}
      </div>
    </div>
  );
}