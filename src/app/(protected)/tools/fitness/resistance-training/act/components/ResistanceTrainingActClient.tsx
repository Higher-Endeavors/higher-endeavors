'use client';

import React, { useState } from 'react';
import UserSelector from '(protected)/components/UserSelector';
import { useProgramsForAnalysis } from '../../analyze/lib/hooks/useProgramsForAnalysis';
import type { ProgramForAnalysis } from '../../analyze/types/analysis.zod';
import { clientLogger } from 'lib/logging/logger.client';

interface ResistanceTrainingActClientProps {
  userId: number;
}

export default function ResistanceTrainingActClient({ userId }: ResistanceTrainingActClientProps) {
  const [selectedUserId, setSelectedUserId] = useState<number>(userId);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);

  // Fetch programs for the selected user
  const { 
    programs, 
    isLoading: isLoadingPrograms, 
    error: programsError 
  } = useProgramsForAnalysis(selectedUserId);

  const handleProgramSelect = (program: ProgramForAnalysis) => {
    setSelectedProgramId(program.resistanceProgramId);
    clientLogger.info('Selected program for execution:', { 
      programId: program.resistanceProgramId, 
      programName: program.programName 
    });
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Resistance Training - Act
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Execute your resistance training programs and track your progress
          </p>
        </div>

        {/* User Selection */}
        <div className="mb-6">
          <UserSelector
            onUserSelect={(userId) => {
              if (userId !== null && userId !== selectedUserId) {
                setSelectedUserId(userId);
                setSelectedProgramId(null);
              }
            }}
            currentUserId={selectedUserId}
            showAdminFeatures={true}
          />
        </div>

        {/* Program Selection */}
        <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-700 mb-4">
            Select Program to Execute
          </h2>
          
          {isLoadingPrograms ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-700">Loading programs...</span>
            </div>
          ) : programsError ? (
            <div className="text-red-600 dark:text-red-400">
              Error loading programs: {programsError}
            </div>
          ) : programs.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-center py-8">
              No programs found. Create a resistance training program first.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {programs.map((program) => (
                <button
                  key={program.resistanceProgramId}
                  onClick={() => handleProgramSelect(program)}
                  className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                    selectedProgramId === program.resistanceProgramId
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 dark:text-gray-700 mb-2">
                    {program.programName}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-700">
                    <p>Duration: {program.programDuration} weeks</p>
                    <p>Exercises: {program.exerciseCount}</p>
                    {program.resistPhaseName && <p>Phase: {program.resistPhaseName}</p>}
                    {program.resistPeriodizationName && <p>Type: {program.resistPeriodizationName}</p>}
                    <p className={`font-medium ${program.hasActualData ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                      {program.hasActualData ? 'Has actual data' : 'Planned only'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Program Execution Area */}
        {selectedProgramId && (
          <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-700 mb-4">
              Program Execution
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Program execution functionality will be implemented here.
            </p>
          </div>
        )}

        {/* Instructions */}
        {!selectedProgramId && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              How to Use the Act Phase
            </h3>
            <ul className="text-blue-800 dark:text-blue-200 space-y-2">
              <li>• Select a program from the list above to begin execution</li>
              <li>• Track your actual performance against planned sets and reps</li>
              <li>• Record your RPE, RIR, and other training metrics</li>
              <li>• Monitor your progress and adherence to the program</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
