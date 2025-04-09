'use client';

import React from 'react';
import ProgramHeader from './ProgramHeader';
import ProgramSettings from './ProgramSettings';
import WeekProgram from './WeekProgram';
import { program, exercise, program_list_item, phase_focus_type, PeriodizationType, progression_rules } from '@/app/lib/types/pillars/fitness';
import { ProgramSettingsFormData } from './ProgramSettings';
import { validateProgressionRules } from '../../utils/programTransformations';

/**
 * Props interface for the ProgramContainer component
 * Using camelCase as these are React-specific props
 */
interface ProgramContainerProps {
  program: program;
  weekExercises: { [key: number]: exercise[] };
  activeWeek: number;
  handlers: {
    handleProgramSelect: (program: program_list_item) => void;
    handleProgramDelete: (programId: number) => void;
    handleSettingsChange: (settings: Partial<ProgramSettingsFormData>) => void;
    handleWeekChange: (weekNumber: number) => void;
    handleWeekExercisesChange: (exercises: exercise[]) => void;
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
  selectedUserId = program.user_id,
  onUserSelect
}: ProgramContainerProps) {

  return (
    <div className="space-y-6">
      {/* Program Header Section */}
      <ProgramHeader
        isAdmin={isAdmin}
        currentUserId={program.user_id}
        selectedUserId={selectedUserId}
        onUserSelect={onUserSelect || (() => {})}
        onProgramSelect={handlers.handleProgramSelect}
        onProgramDelete={handlers.handleProgramDelete}
      />

      {/* Program Settings Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <ProgramSettings
          program_name={program.program_name}
          phase_focus={program.phase_focus as phase_focus_type}
          periodization_type={program.periodization_type as keyof typeof PeriodizationType}
          notes={program.notes}
          progression_rules={validateProgressionRules(program.progression_rules as progression_rules)}
          onSettingsChange={handlers.handleSettingsChange}
        />
      </div>

      {/* Week Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-4" aria-label="Week selection">
          {Array.from(
            { length: program.progression_rules?.settings?.program_length || 4 },
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
          week_number={activeWeek}
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