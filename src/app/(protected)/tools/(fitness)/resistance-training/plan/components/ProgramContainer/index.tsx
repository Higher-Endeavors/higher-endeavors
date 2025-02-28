'use client';

import React from 'react';
import ProgramHeader from './ProgramHeader';
import ProgramSettings from './ProgramSettings';
import WeekProgram from './WeekProgram';
import { Program, Exercise, ProgramListItem } from '@/app/lib/types/pillars/fitness';
import { ProgramSettingsFormData } from './ProgramSettings';

// Debug configuration
const DEBUG = {
  PROPS: false,
  STATE: false,
  EVENTS: false
};

const debugLog = (type: keyof typeof DEBUG, message: string, data?: any) => {
  if (DEBUG[type]) {
    console.log(`[ProgramContainer] ${message}`, data || '');
  }
};

interface ProgramContainerProps {
  program: Program;
  weekExercises: { [key: number]: Exercise[] };
  activeWeek: number;
  handlers: {
    handleProgramSelect: (program: ProgramListItem) => void;
    handleProgramDelete: (programId: number) => void;
    handleSettingsChange: (settings: Partial<ProgramSettingsFormData>) => void;
    handleWeekChange: (weekNumber: number) => void;
    handleWeekExercisesChange: (exercises: Exercise[]) => void;
    handleEditExercise: (id: number) => void;
    handleDeleteExercise: (id: number) => void;
  };
  isAdmin?: boolean;
  selectedUserId?: number;
  onUserSelect?: (userId: number) => void;
}

/**
 * ProgramContainer serves as the main container for the resistance training program interface.
 * It coordinates between the header, settings, and week program components.
 */
export default function ProgramContainer({
  program,
  weekExercises,
  activeWeek,
  handlers,
  isAdmin = false,
  selectedUserId = program.userId,
  onUserSelect
}: ProgramContainerProps) {
  debugLog('PROPS', 'Component rendered with props:', {
    program,
    activeWeek,
    isAdmin,
    selectedUserId
  });

  return (
    <div className="space-y-6">
      {/* Program Header Section */}
      <ProgramHeader
        isAdmin={isAdmin}
        currentUserId={program.userId}
        selectedUserId={selectedUserId}
        onUserSelect={onUserSelect || (() => {})}
        onProgramSelect={handlers.handleProgramSelect}
        onProgramDelete={handlers.handleProgramDelete}
      />

      {/* Program Settings Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <ProgramSettings
          programName={program.programName}
          phaseFocus={program.phaseFocus}
          periodizationType={program.periodizationType}
          notes={program.notes}
          progressionRules={program.progressionRules}
          onSettingsChange={handlers.handleSettingsChange}
        />
      </div>

      {/* Week Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-4" aria-label="Week selection">
          {Array.from(
            { length: program.progressionRules?.settings?.programLength || 4 },
            (_, i) => i + 1
          ).map((week) => (
            <button
              key={week}
              onClick={() => handlers.handleWeekChange(week)}
              className={`
                whitespace-nowrap pb-4 px-4 border-b-2 font-medium text-sm
                ${activeWeek === week
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400 dark:border-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
                }
              `}
            >
              Week {week}
            </button>
          ))}
        </nav>
      </div>

      {/* Week Program Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <WeekProgram
          weekNumber={activeWeek}
          exercises={weekExercises[activeWeek] || []}
          onExercisesChange={handlers.handleWeekExercisesChange}
          onEdit={handlers.handleEditExercise}
          onDelete={handlers.handleDeleteExercise}
        />
      </div>
    </div>
  );
}

// Export sub-components for convenience
export { ProgramHeader, ProgramSettings, WeekProgram };