'use client';

import { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import React from 'react';
// Template categories are now passed as props from parent component

interface SessionSettingsProps {
  sessionName: string;
  setSessionName: (name: string) => void;
  macrocyclePhase: string;
  setMacrocyclePhase: (phase: string) => void;
  focusBlock: string;
  setFocusBlock: (focus: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  tierContinuumId?: number;
  setTierContinuumId?: (id: number) => void;
  isAdmin?: boolean;
  isLoading?: boolean;
  isTemplateSession?: boolean;
}

export default function SessionSettings({ 
  sessionName, 
  setSessionName, 
  macrocyclePhase, 
  setMacrocyclePhase, 
  focusBlock, 
  setFocusBlock, 
  notes, 
  setNotes, 
  tierContinuumId, 
  setTierContinuumId, 
  isAdmin = false, 
  isLoading = false, 
  isTemplateSession = false
}: SessionSettingsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showCustomPhaseFocus, setShowCustomPhaseFocus] = useState(false);
  const [customPhaseFocus, setCustomPhaseFocus] = useState('');

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



  return (
    <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6 mb-4">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-900">Session Settings</h2>
        <button
          className="text-gray-500 hover:text-gray-700 focus:outline-none transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <form className="space-y-6 mt-4">
          {isLoading && (
            <div className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-blue-600 dark:text-blue-400">Loading session...</span>
            </div>
          )}
          
          {/* Session Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Name
            </label>
            <input
              id="session-name-input"
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white dark:bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 dark:text-gray-900 p-2"
              placeholder="Enter session name"
              value={sessionName}
              onChange={e => setSessionName(e.target.value)}
            />
          </div>

          {/* Macrocycle Phase */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Macrocycle Phase
            </label>
            <Select
              options={macrocyclePhaseOptions}
              value={macrocyclePhaseOptions.find(opt => opt.value === macrocyclePhase) || null}
              onChange={opt => setMacrocyclePhase(opt?.value || '')}
              className="basic-single dark:text-slate-700"
              classNamePrefix="select"
            />
            {showCustomPhaseFocus && (
              <input
                type="text"
                value={customPhaseFocus}
                onChange={(e) => setCustomPhaseFocus(e.target.value)}
                placeholder="Enter custom phase/focus"
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-900"
              />
            )}
            <p className="mt-1 text-sm text-gray-500">
              Select the phase of this training session
            </p>
          </div>

          {/* Focus Block */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Focus Block
            </label>
            <Select
              options={focusBlockOptions}
              value={focusBlockOptions.find(opt => opt.value === focusBlock) || null}
              onChange={opt => setFocusBlock(opt?.value || '')}
              className="basic-single dark:text-slate-700"
              classNamePrefix="select"
            />
            <p className="mt-1 text-sm text-gray-500">
              Choose the focus block of this training session
            </p>
          </div>

          {/* Session Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Notes
            </label>
            <textarea
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white dark:bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 dark:text-gray-900 p-2"
              placeholder="Enter session notes (optional)"
              rows={4}
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
            <p className="mt-1 text-sm text-gray-500">
              Add any additional notes or comments about the session
            </p>
          </div>

          {/* Tier Continuum - Admin Only */}
          {isAdmin && setTierContinuumId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tier Continuum
              </label>
              <Select
                options={[
                  { value: 1, label: 'Healthy' },
                  { value: 2, label: 'Fit' },
                  { value: 3, label: 'HighEnd' }
                ]}
                value={[
                  { value: 1, label: 'Healthy' },
                  { value: 2, label: 'Fit' },
                  { value: 3, label: 'HighEnd' }
                ].find(opt => opt.value === tierContinuumId) || null}
                onChange={opt => {
                  if (opt?.value !== undefined) {
                    setTierContinuumId(opt.value);
                  }
                }}
                className="basic-single dark:text-slate-700"
                classNamePrefix="select"
                placeholder="Select tier continuum..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Set the tier continuum level for this session template
              </p>
            </div>
          )}


        </form>
      )}
    </div>
  );
}