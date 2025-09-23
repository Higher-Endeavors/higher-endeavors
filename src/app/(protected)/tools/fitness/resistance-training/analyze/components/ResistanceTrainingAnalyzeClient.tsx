'use client';

import React, { useState, useMemo } from 'react';
import UserSelector from '(protected)/components/UserSelector';
import VolumeAnalysisChart from './VolumeAnalysisChart';
import ExerciseAnalysisChart from './ExerciseAnalysisChart';
import ProgramBrowser from '(protected)/tools/fitness/resistance-training/program/components/ProgramBrowser';
import ExerciseSelector from '(protected)/tools/fitness/resistance-training/components/ExerciseSelector';
import { useProgramsForAnalysis } from '../lib/hooks/useProgramsForAnalysis';
import { useExerciseSelection } from '../lib/hooks/useExerciseSelection';
import { useExerciseAnalysis } from '../lib/hooks/useExerciseAnalysis';
import type { ProgramForAnalysis } from '../types/analysis.zod';
import type { ProgramListItem } from '(protected)/tools/fitness/resistance-training/types/resistance-training.zod';
import { useProgramAnalysis } from '../lib/hooks/useProgramAnalysis';
import { calculateVolumeProgression } from '../lib/volumeCalculations';
import { clientLogger } from 'lib/logging/logger.client';
import { getResistanceProgram } from '(protected)/tools/fitness/resistance-training/program/lib/hooks/getResistanceProgram';

interface ResistanceTrainingAnalyzeClientProps {
  userId: number;
}

export default function ResistanceTrainingAnalyzeClient({ userId }: ResistanceTrainingAnalyzeClientProps) {
  const [selectedUserId, setSelectedUserId] = useState<number>(userId);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<number[]>([]);
  const [loadUnit, setLoadUnit] = useState<'lbs' | 'kg'>('lbs');
  const [programData, setProgramData] = useState<{ periodizationType?: string; progressionRules?: any } | null>(null);
  const [timeframe, setTimeframe] = useState<string>('year');
  const [analysisMode, setAnalysisMode] = useState<'program' | 'exercise'>('program');

  // Exercise selection state
  const {
    selectedExercise,
    isLoading: isExerciseLoading,
    error: exerciseError,
    selectExercise,
    clearSelection
  } = useExerciseSelection();

  // Fetch programs for the selected user
  const { 
    programs: analysisPrograms, 
    isLoading: isLoadingPrograms, 
    error: programsError 
  } = useProgramsForAnalysis(selectedUserId);

  // Convert ProgramForAnalysis to ProgramListItem format for ProgramBrowser
  const programs = useMemo(() => {
    return analysisPrograms.map((program): ProgramListItem => ({
      resistanceProgramId: program.resistanceProgramId,
      userId: selectedUserId,
      programName: program.programName,
      phaseFocus: program.phaseFocus || undefined,
      periodizationType: program.periodizationType || undefined,
      programDuration: program.programDuration,
      createdAt: program.createdAt,
      exerciseCount: program.exerciseCount,
      exerciseSummary: {
        totalExercises: program.exerciseCount,
        exercises: [] // We don't have exercise names in ProgramForAnalysis
      }
    }));
  }, [analysisPrograms, selectedUserId]);

  // Create program data status map for analysis indicators
  const programDataStatus = useMemo(() => {
    const statusMap = new Map<number, { hasActualData: boolean; exerciseCount: number }>();
    analysisPrograms.forEach(program => {
      statusMap.set(program.resistanceProgramId, {
        hasActualData: program.hasActualData,
        exerciseCount: program.exerciseCount
      });
    });
    return statusMap;
  }, [analysisPrograms]);

  // Fetch analysis data for the selected program
  const { 
    analysis, 
    isLoading: isLoadingAnalysis, 
    error: analysisError 
  } = useProgramAnalysis(selectedProgramId, selectedUserId, loadUnit);

  // Fetch exercise analysis data
  const {
    analysis: exerciseAnalysis,
    isLoading: isLoadingExerciseAnalysis,
    error: exerciseAnalysisError
  } = useExerciseAnalysis(
    selectedUserId, 
    selectedExercise?.exerciseId || null, 
    timeframe
  );

  // Reset selected exercises when program changes - handled in handleProgramSelect
  // Auto-select all exercises when analysis loads - handled in handleProgramSelect

  const handleProgramSelect = async (program: ProgramListItem) => {
    setSelectedProgramId(program.resistanceProgramId);
    setSelectedExercises([]); // Reset selected exercises when program changes
    setProgramData(null); // Reset program data
    
    try {
      // Fetch program data to get periodization type and progression rules
      const { program: programDetails } = await getResistanceProgram(program.resistanceProgramId, selectedUserId);
      setProgramData({
        periodizationType: programDetails.periodizationType,
        progressionRules: programDetails.progressionRules
      });
    } catch (error) {
      clientLogger.error('Failed to fetch program details:', error);
      // Continue with analysis even if program details fail to load
    }
    
    clientLogger.info('Selected program for analysis:', { 
      programId: program.resistanceProgramId, 
      programName: program.programName 
    });
  };

  const handleExerciseToggle = (exerciseId: number) => {
    setSelectedExercises(prev => 
      prev.includes(exerciseId) 
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const handleLoadUnitChange = (unit: 'lbs' | 'kg') => {
    setLoadUnit(unit);
  };

  // Calculate progression metrics if analysis is available
  const progressionMetrics = analysis ? calculateVolumeProgression(analysis.overallVolumeData) : null;

  // Calculate planned weekly progression percentages
  const plannedWeeklyProgression = useMemo(() => {
    if (!analysis?.overallVolumeData || analysis.overallVolumeData.length < 2) {
      return null;
    }

    const plannedData = analysis.overallVolumeData.map(d => d.plannedVolume);
    const percentages = [];

    for (let i = 0; i < plannedData.length; i++) {
      if (i === 0) {
        percentages.push(100); // Week 1 is always 100% (baseline)
      } else {
        const baseline = plannedData[0];
        const current = plannedData[i];
        if (baseline > 0) {
          const percentage = (current / baseline) * 100;
          percentages.push(Math.round(percentage));
        } else {
          percentages.push(100);
        }
      }
    }

    return percentages;
  }, [analysis]);

  // Calculate actual weekly progression percentages
  const actualWeeklyProgression = useMemo(() => {
    if (!analysis?.overallVolumeData || analysis.overallVolumeData.length < 2) {
      return null;
    }

    const actualData = analysis.overallVolumeData.map(d => d.actualVolume);
    const percentages = [];

    for (let i = 0; i < actualData.length; i++) {
      if (i === 0) {
        percentages.push(100); // Week 1 is always 100% (baseline)
      } else {
        const baseline = actualData[0];
        const current = actualData[i];
        if (baseline !== null && baseline > 0 && current !== null) {
          const percentage = (current / baseline) * 100;
          percentages.push(Math.round(percentage));
        } else {
          percentages.push(null); // NA for missing data
        }
      }
    }

    return percentages;
  }, [analysis]);

  // Calculate consistency based on planned vs actual percentages
  const consistency = useMemo(() => {
    if (!plannedWeeklyProgression || !actualWeeklyProgression) {
      return null;
    }

    let totalDeviation = 0;
    let validWeeks = 0;

    for (let i = 0; i < plannedWeeklyProgression.length; i++) {
      const planned = plannedWeeklyProgression[i];
      const actual = actualWeeklyProgression[i];

      // Skip weeks with NA (incomplete sessions)
      if (actual !== null) {
        const deviation = Math.abs(planned - actual);
        totalDeviation += deviation;
        validWeeks++;
      }
    }

    if (validWeeks === 0) {
      return null;
    }

    // Calculate average deviation and convert to consistency percentage
    const averageDeviation = totalDeviation / validWeeks;
    // Consistency = 100% - average deviation (lower deviation = higher consistency)
    const consistencyPercentage = Math.max(0, 100 - averageDeviation);
    
    return {
      percentage: Math.round(consistencyPercentage),
      validWeeks,
      totalWeeks: plannedWeeklyProgression.length
    };
  }, [plannedWeeklyProgression, actualWeeklyProgression]);

  // Auto-select all exercises when analysis loads (without useEffect)
  if (analysis && analysis.exerciseData.length > 0 && selectedExercises.length === 0) {
    setSelectedExercises(analysis.exerciseData.map((ex: any) => ex.exerciseId));
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Resistance Training Analysis
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Analyze your program's volume progressions and adherence to progressive overload principles
          </p>
        </div>

        {/* User Selection */}
        <div className="mb-6">
          <UserSelector
            onUserSelect={(userId) => {
              if (userId !== null && userId !== selectedUserId) {
                setSelectedUserId(userId);
                setSelectedProgramId(null);
                setSelectedExercises([]);
                clearSelection(); // Clear exercise selection when user changes
              }
            }}
            currentUserId={selectedUserId}
            showAdminFeatures={true}
          />
        </div>

        {/* Analysis Mode Toggle */}
        <div className="mb-6">
          <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-700 mb-4">
              Analysis Mode
            </h2>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setAnalysisMode('program');
                  clearSelection();
                }}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  analysisMode === 'program'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                Program Analysis
              </button>
              <button
                onClick={() => {
                  setAnalysisMode('exercise');
                  setSelectedProgramId(null);
                  setSelectedExercises([]);
                }}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  analysisMode === 'exercise'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                Exercise Analysis
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-700 mt-2">
              {analysisMode === 'program' 
                ? 'Analyze volume progressions across entire programs'
                : 'Analyze individual exercise progressions across all programs'
              }
            </p>
          </div>
        </div>

        {/* Program Selection - Only show in program mode */}
        {analysisMode === 'program' && (
          <div className="mb-6">
            <ProgramBrowser
              onProgramSelect={handleProgramSelect}
              currentUserId={selectedUserId}
              isAdmin={true}
              analysisMode={true}
              selectedProgramId={selectedProgramId}
              programDataStatus={programDataStatus}
            />
          </div>
        )}

        {/* Exercise Selection - Only show in exercise mode */}
        {analysisMode === 'exercise' && (
          <div className="mb-6">
            <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-700 mb-4">
                Select Exercise for Analysis
              </h2>
              <ExerciseSelector
                onExerciseSelect={selectExercise}
                selectedExercise={selectedExercise}
                userId={selectedUserId}
                isLoading={isExerciseLoading}
                disabled={isExerciseLoading}
              />
              {exerciseError && (
                <div className="mt-2 text-red-600 dark:text-red-400 text-sm">
                  {exerciseError}
                </div>
              )}
            </div>
          </div>
        )}


        {/* Analysis Results */}
        {((analysisMode === 'program' && selectedProgramId) || (analysisMode === 'exercise' && selectedExercise)) && (
          <>
            {/* Program Analysis */}
            {analysisMode === 'program' && (
              <>
                {isLoadingAnalysis ? (
                  <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600 dark:text-gray-700">Analyzing program...</span>
                    </div>
                  </div>
                ) : analysisError ? (
                  <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
                    <div className="text-red-600 dark:text-red-400">
                      Error analyzing program: {analysisError}
                    </div>
                  </div>
                ) : analysis ? (
                  <div className="space-y-6">
                    {/* Volume Analysis Chart */}
                    <VolumeAnalysisChart
                      analysis={analysis}
                      selectedExercises={selectedExercises}
                      onExerciseToggle={handleExerciseToggle}
                      loadUnit={loadUnit}
                      onLoadUnitChange={handleLoadUnitChange}
                      timeframe={timeframe}
                      onTimeframeChange={setTimeframe}
                      showTimeframeSelector={false}
                    />

                    {/* Progression Analysis */}
                    {(programData || plannedWeeklyProgression || actualWeeklyProgression) && (
                      <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-700 mb-4">
                          Progression Analysis
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-700">Progressive</p>
                            <p className={`text-2xl font-bold ${programData?.progressionRules ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                              {programData?.progressionRules ? 'Yes' : 'Not Set'}
                            </p>
                            {programData?.progressionRules && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                Rules: {typeof programData.progressionRules === 'string' ? programData.progressionRules : 'Configured'}
                              </p>
                            )}
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-700">Periodization Type</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-700 capitalize">
                              {programData?.periodizationType || 'Not Set'}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-700">Planned Weekly Progression</p>
                            <div className="text-lg font-semibold text-gray-900 dark:text-gray-700">
                              {plannedWeeklyProgression ? (
                                <div className="flex flex-wrap justify-center gap-1">
                                  {plannedWeeklyProgression.map((percentage, index) => (
                                    <span key={index} className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded text-sm border border-gray-300 dark:border-gray-500">
                                      {percentage}%
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                'Not Available'
                              )}
                            </div>
                            {plannedWeeklyProgression && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                Week 1-{plannedWeeklyProgression.length} vs baseline
                              </p>
                            )}
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-700">Actual Weekly Progression</p>
                            <div className="text-lg font-semibold text-gray-900 dark:text-gray-700">
                              {actualWeeklyProgression ? (
                                <div className="flex flex-wrap justify-center gap-1">
                                  {actualWeeklyProgression.map((percentage, index) => (
                                    <span 
                                      key={index} 
                                      className={`px-2 py-1 rounded text-sm border ${
                                        percentage === null 
                                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600' 
                                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
                                      }`}
                                    >
                                      {percentage === null ? 'NA' : `${percentage}%`}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                'No Data'
                              )}
                            </div>
                            {actualWeeklyProgression && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                Week 1-{actualWeeklyProgression.length} vs baseline
                              </p>
                            )}
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-700">Consistency</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-700">
                              {consistency ? `${consistency.percentage}%` : 'N/A'}
                            </p>
                            {consistency && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {consistency.validWeeks}/{consistency.totalWeeks} weeks completed
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Volume Summary */}
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                          <h4 className="text-md font-medium text-gray-900 dark:text-gray-700 mb-3">Volume Summary</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                              <p className="text-sm text-gray-600 dark:text-gray-700">Total Planned Volume</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-gray-700">
                                {analysis.totalPlannedVolume.toFixed(1)} {loadUnit}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600 dark:text-gray-700">Total Actual Volume</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-gray-700">
                                {analysis.totalActualVolume ? `${analysis.totalActualVolume.toFixed(1)} ${loadUnit}` : 'No data'}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600 dark:text-gray-700">Volume Adherence</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-gray-700">
                                {analysis.averageVolumePercentage ? `${analysis.averageVolumePercentage.toFixed(1)}%` : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </>
            )}

            {/* Exercise Analysis */}
            {analysisMode === 'exercise' && (
              <>
                {isLoadingExerciseAnalysis ? (
                  <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600 dark:text-gray-700">Analyzing exercise...</span>
                    </div>
                  </div>
                ) : exerciseAnalysisError ? (
                  <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
                    <div className="text-red-600 dark:text-red-400">
                      Error analyzing exercise: {exerciseAnalysisError}
                    </div>
                  </div>
                ) : exerciseAnalysis ? (
                  <div className="space-y-6">
                    {/* Exercise Analysis Chart */}
                    <ExerciseAnalysisChart
                      analysis={exerciseAnalysis}
                      loadUnit={loadUnit}
                      onLoadUnitChange={handleLoadUnitChange}
                      timeframe={timeframe}
                      onTimeframeChange={setTimeframe}
                    />
                  </div>
                ) : (
                  <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      No exercise data available for the selected timeframe.
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
