import React from 'react';
import { ProgramExercisesPlanned, ExerciseSet, ExerciseLibraryItem } from '../types/resistance-training.zod';
import { calculateTimeUnderTension } from '../../lib/calculations/resistanceTrainingCalculations';
import { HiOutlineDotsVertical } from 'react-icons/hi';

interface ExerciseItemActProps {
  exercise: ProgramExercisesPlanned;
  exercises: ExerciseLibraryItem[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onChangeVariation?: (id: number) => void;
  actuals: { [setIdx: number]: { reps: string; load: string; duration?: string } };
  onActualChange: (setIdx: number, field: 'reps' | 'load' | 'duration', value: string) => void;
  readOnly?: boolean;
}

export default function ExerciseItemAct({ exercise, exercises, onEdit, onDelete, onChangeVariation, actuals = {}, onActualChange, readOnly = false }: ExerciseItemActProps) {
  // Helper functions copied from ExerciseItemPlan
  const getLoadUnit = (set: any) => set.loadUnit || 'lbs';
  const formatLoad = (load: string, unit?: string) => {
    if (!load || load === '0') return '0';
    if (load.toLowerCase().includes('bw') || load.toLowerCase().includes('band') || load.toLowerCase().includes('kg') || load.toLowerCase().includes('lbs')) {
      return load;
    }
    return `${load} ${unit || 'lbs'}`;
  };
  const getExerciseName = () => {
    const exerciseData = exercises.find(ex => {
      if (exercise.exerciseSource === 'user') {
        return ex.userExerciseLibraryId === exercise.userExerciseLibraryId;
      } else if (exercise.exerciseSource === 'cme_library') {
        // For CME activities, match by exerciseLibraryId and source
        return ex.exerciseLibraryId === exercise.exerciseLibraryId && ex.source === 'cme_library';
      } else {
        // For regular library exercises, match by exerciseLibraryId and source
        return ex.exerciseLibraryId === exercise.exerciseLibraryId && ex.source === 'library';
      }
    });
    return exerciseData?.name || `Exercise ${exercise.exerciseLibraryId || exercise.userExerciseLibraryId}`;
  };
  const formatNumberWithCommas = (x: number) => x.toLocaleString();
  const getTotalLoad = () => {
    if (!exercise.plannedSets) return { value: 0, unit: 'lbs' };
    const units = exercise.plannedSets.map(set => getLoadUnit(set));
    const mostCommonUnit = units.length > 0 ? units[0] : 'lbs';
    const totalValue = exercise.plannedSets.reduce((sum, set) => {
      const reps = set.reps || 0;
      const load = Number(set.load) || 0;
      return sum + (reps * load);
    }, 0);
    return { value: totalValue, unit: mostCommonUnit };
  };
  const getRIR = () => {
    if (!exercise.plannedSets || exercise.plannedSets.length === 0) return null;
    const rir = exercise.plannedSets[0].rir;
    return typeof rir === 'number' ? rir : null;
  };
  const getRPE = () => {
    if (!exercise.plannedSets || exercise.plannedSets.length === 0) return null;
    const rpe = exercise.plannedSets[0].rpe;
    return typeof rpe === 'number' ? rpe : null;
  };

  // Helper to calculate time under tension
  const calculateTimeUnderTension = (reps: number | undefined, tempo: string | undefined) => {
    if (!reps || !tempo) return 0;
    const [eccentric, pause1, concentric, pause2] = tempo.split('').map(Number);
    return reps * (eccentric + pause1 + concentric + pause2);
  };

  // Helper to calculate planned and actual load for this exercise
  const calculatePlannedLoadTally = () => {
    let plannedLoad = 0;
    (exercise.plannedSets || []).forEach((set) => {
      const plannedRepsVal = set.reps || 0;
      const plannedLoadVal = Number(set.load) || 0;
      plannedLoad += plannedRepsVal * plannedLoadVal;
    });
    return plannedLoad;
  };
  const calculateActualLoadTally = () => {
    let actualLoad = 0;
    (exercise.plannedSets || []).forEach((set, setIdx) => {
      const actual = actuals[setIdx] || {};
      const actualRepsVal = actual.reps ? Number(actual.reps) : 0;
      const actualLoadVal = actual.load ? Number(actual.load) : 0;
      if (actual.reps && actual.load) {
        actualLoad += actualRepsVal * actualLoadVal;
      }
    });
    return actualLoad;
  };

  // Helper to calculate actual reps for this exercise
  const calculateActualRepsTally = () => {
    let actualReps = 0;
    (exercise.plannedSets || []).forEach((set, setIdx) => {
      const actual = actuals[setIdx] || {};
      const actualRepsVal = actual.reps ? Number(actual.reps) : 0;
      if (actual.reps) {
        actualReps += actualRepsVal;
      }
    });
    return actualReps;
  };

  // Helper to calculate percentage difference and determine color class
  const getDeviationColor = (actual: number, planned: number): string => {
    if (planned === 0) return '';
    const percentageDiff = ((actual - planned) / planned) * 100;
    
    if (percentageDiff === 0) return ''; // No color for exact matches
    if (percentageDiff > 0) return 'bg-green-100 border-green-300 text-green-800'; // Green for exceeding planned
    if (percentageDiff >= -19) return 'bg-yellow-100 border-yellow-300 text-yellow-800'; // Yellow for 1-19% less
    return 'bg-red-100 border-red-300 text-red-800'; // Red for ≤20% less
  };

  // Helper to get color class for individual set values
  const getSetDeviationColor = (setIdx: number, type: 'reps' | 'load'): string => {
    const set = exercise.plannedSets?.[setIdx];
    const actual = actuals[setIdx];
    
    if (!set || !actual || !actual[type]) return '';
    
    const planned = type === 'reps' ? (set.reps || 0) : Number(set.load) || 0;
    const actualVal = Number(actual[type]);
    
    return getDeviationColor(actualVal, planned);
  };

  // Helper to get color class for summary values
  const getSummaryDeviationColor = (type: 'reps' | 'load'): string => {
    const plannedReps = exercise.plannedSets?.reduce((sum, set) => sum + (set.reps || 0), 0) || 0;
    const actualReps = calculateActualRepsTally();
    const plannedLoad = getTotalLoad().value;
    const actualLoad = calculateActualLoadTally();
    
    if (type === 'reps') {
      return getDeviationColor(actualReps, plannedReps);
    } else {
      return getDeviationColor(actualLoad, plannedLoad);
    }
  };

  // Helper to check if exercise is a Carry
  const isCarryExercise = (exerciseData?: ExerciseLibraryItem) => exerciseData?.exercise_family === 'Carry';

  // Helper to check if exercise is a Cycling exercise
  const isCyclingExercise = (exerciseData?: ExerciseLibraryItem) => exerciseData?.exercise_family === 'Cycling';

  // Helper to check if exercise is a Running exercise (but not Treadmill)
  const isRunningExercise = (exerciseData?: ExerciseLibraryItem) => exerciseData?.exercise_family === 'Running' && !exerciseData?.name?.toLowerCase().includes('treadmill');

  // Helper to check if exercise is a Treadmill exercise
  const isTreadmillExercise = (exerciseData?: ExerciseLibraryItem) => exerciseData?.name?.toLowerCase().includes('treadmill');

  // Helper to get total duration for CME exercises
  const getTotalDuration = () => {
    if (!exercise.plannedSets) return { value: 0, unit: 'minutes' };
    
    // Convert all durations and rest periods to seconds for accurate calculation
    const totalSeconds = exercise.plannedSets.reduce((sum, set) => {
      const restSec = set.restSec || 0;
      
      let durationInSeconds = 0;
      
      // Check if duration is explicitly set
      if (set.duration !== undefined && set.duration !== null) {
        const duration = set.duration;
        const unit = set.durationUnit || 'minutes';
        
        if (unit === 'seconds') {
          durationInSeconds = duration;
        } else {
          // Convert minutes to seconds
          durationInSeconds = duration * 60;
        }
      } else {
        // Calculate duration from pace and distance if available
        if (set.pace && set.distance) {
          const pace = set.pace;
          const distance = set.distance;
          
          // Parse pace (e.g., "6:00" = 6 minutes per mile)
          const paceMatch = pace.match(/^(\d+):(\d+)$/);
          if (paceMatch) {
            const paceMinutes = parseInt(paceMatch[1]);
            const paceSeconds = parseInt(paceMatch[2]);
            const totalPaceSeconds = (paceMinutes * 60) + paceSeconds;
            
            // Calculate duration: distance × pace
            durationInSeconds = distance * totalPaceSeconds;
          }
        }
      }
      
      // Add both exercise duration and rest period
      return sum + durationInSeconds + restSec;
    }, 0);
    
    // Convert back to appropriate unit for display
    if (totalSeconds >= 60) {
      return { value: Math.round(totalSeconds / 60), unit: 'minutes' };
    } else {
      return { value: totalSeconds, unit: 'seconds' };
    }
  };

  const [menuOpen, setMenuOpen] = React.useState<{ [key: number]: boolean }>({});
  const getExerciseId = () => {
    // Create a unique identifier that includes both ID and source
    let id;
    if (exercise.exerciseSource === 'user') {
      id = exercise.userExerciseLibraryId || 0;
    } else if (exercise.exerciseSource === 'cme_library') {
      // Use a large offset to avoid conflicts with regular library IDs
      id = (exercise.exerciseLibraryId || 0) + 1000000;
    } else {
      id = exercise.exerciseLibraryId || 0;
    }
    return id;
  };
  const toggleMenu = (id: number) => {
    setMenuOpen(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const closeMenu = () => setMenuOpen({});

  const exerciseData = getExerciseNameData();
  const isCarry = isCarryExercise(exerciseData);
  const isCycling = isCyclingExercise(exerciseData);
  const isRunning = isRunningExercise(exerciseData);
  const isTreadmill = isTreadmillExercise(exerciseData);
  const gridColsClass = isCarry ? "md:grid-cols-4" : isCycling ? "md:grid-cols-7" : isRunning ? "md:grid-cols-5" : isTreadmill ? "md:grid-cols-6" : "md:grid-cols-6";

  // Helper to get total distance for Carry exercises
  const getTotalDistance = () => {
    if (!exercise.plannedSets) return { value: 0, unit: 'yards' };
    const units = exercise.plannedSets.map(set => set.distanceUnit || 'yards');
    const mostCommonUnit = units.length > 0 ? units[0] : 'yards';
    const totalValue = exercise.plannedSets.reduce((sum, set) => sum + (set.distance || 0), 0);
    return { value: totalValue, unit: mostCommonUnit };
  };

  // Helper to get the ExerciseLibraryItem for the current exercise
  function getExerciseNameData() {
    return exercises.find(ex => {
      if (exercise.exerciseSource === 'user') {
        return ex.userExerciseLibraryId === exercise.userExerciseLibraryId;
      } else if (exercise.exerciseSource === 'cme_library') {
        // For CME activities, match by exerciseLibraryId and source
        return ex.exerciseLibraryId === exercise.exerciseLibraryId && ex.source === 'cme_library';
      } else {
        // For regular library exercises, match by exerciseLibraryId and source
        return ex.exerciseLibraryId === exercise.exerciseLibraryId && ex.source === 'library';
      }
    });
  }

  // Helper to determine if Total Load should be shown
  function shouldShowTotalLoad() {
    if (!exercise.plannedSets) return false;
    return exercise.plannedSets.every(set => set.load && !isNaN(Number(set.load)));
  }

  return (
    <div className="bg-white border rounded-lg p-4 mb-2 hover:shadow-md transition-shadow relative group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-gray-600 dark:text-slate-900 font-semibold">{exercise.pairing}</span>
          <span className="font-medium dark:text-slate-900">{getExerciseName()}</span>
        </div>
        <div className="relative">
          <button
            onClick={e => { e.preventDefault(); toggleMenu(getExerciseId()); }}
            aria-label="Exercise options"
            aria-expanded={!!menuOpen[getExerciseId()]}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <HiOutlineDotsVertical className="h-5 w-5 text-gray-600 dark:text-slate-900" aria-hidden="true" />
          </button>
          {menuOpen[getExerciseId()] && (
            <>
              <div className="fixed inset-0 z-10" onClick={closeMenu} />
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-20">
                <div className="py-1">
                  <button
                    onClick={e => { e.preventDefault(); onEdit(getExerciseId()); closeMenu(); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={e => { e.preventDefault(); onDelete(getExerciseId()); closeMenu(); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Mobile-friendly table layout */}
      <div className="mt-3">
        {/* Desktop table header - hidden on mobile */}
        <div className={`hidden md:grid ${isCarry ? "md:grid-cols-4" : isCycling ? "md:grid-cols-8" : isRunning ? "md:grid-cols-5" : isTreadmill ? "md:grid-cols-6" : "md:grid-cols-6"} gap-2 text-sm font-semibold text-gray-500 dark:text-slate-600`}>
          <div>Set</div>
          <div className="font-bold">
            {isCarry ? 'Distance' : isCycling ? 'Duration (min)' : isRunning ? 'Duration (min)' : isTreadmill ? 'Duration (min)' : 'Reps (Planned/Actual)'}
          </div>
          {isCycling && <div className="font-bold">Distance (mi)</div>}
          {isRunning && <div className="font-bold">Distance</div>}
          {isTreadmill && <div className="font-bold">Distance</div>}
          {!isCycling && !isRunning && !isTreadmill && <div className="font-bold">Load (Planned/Actual)</div>}
          {isCycling && <div className="font-bold">Speed (mph)</div>}
          {isCycling && <div className="font-bold">RPM</div>}
          {isCycling && <div className="font-bold">Watts</div>}
          {isCycling && <div className="font-bold">Resistance</div>}
          {isRunning && <div className="font-bold">Pace</div>}
          {isTreadmill && <div className="font-bold">Pace</div>}
          {isTreadmill && <div className="font-bold">Incline (%)</div>}
          {!isCarry && !isCycling && !isRunning && !isTreadmill && <div className="font-bold">Tempo</div>}
          <div className="font-bold">Rest</div>
          {!isCarry && !isCycling && !isRunning && !isTreadmill && <div className="font-bold">Time Under Tension</div>}
        </div>
        
        {/* Desktop table rows - hidden on mobile */}
        <div className={`hidden md:grid ${isCarry ? "md:grid-cols-4" : isCycling ? "md:grid-cols-8" : isRunning ? "md:grid-cols-5" : isTreadmill ? "md:grid-cols-6" : "md:grid-cols-6"} gap-2 text-sm dark:text-slate-600`}>
          {(exercise.plannedSets || []).map((set, setIdx) => {
            const exerciseData = getExerciseNameData();
            const isCarry = isCarryExercise(exerciseData);
            const isCycling = isCyclingExercise(exerciseData);
            const isRunning = isRunningExercise(exerciseData);
            const isTreadmill = isTreadmillExercise(exerciseData);
            const plannedReps = set.reps || 0;
            const plannedDistance = set.distance || 0;
            const plannedDistanceUnit = set.distanceUnit || 'yards';
            const plannedLoad = set.load || '';
            const plannedUnit = getLoadUnit(set);
            const actualReps = actuals[setIdx]?.reps ?? '';
            const actualDistance = set.distance ? actuals[setIdx]?.reps ?? '' : '';
            const actualLoad = actuals[setIdx]?.load ?? '';
            
            // For Cycling exercises, get the additional fields from the set
            const speed = set.speed ?? 0;
            const rpm = set.rpm ?? 0;
            const watts = set.watts ?? 0;
            const resistance = set.resistance ?? 0;
            
            return (
              <React.Fragment key={setIdx}>
                <div className="flex items-center">{set.set || setIdx + 1}</div>
                <div className="flex items-center gap-2">
                  {isCarry ? (
                    <>
                      <span>{plannedDistance} {plannedDistanceUnit}</span>
                      <span className="text-gray-400 dark:text-gray-600">/</span>
                      <span>{actualReps ? `${actualReps} ${plannedDistanceUnit}` : '-'}</span>
                    </>
                                        ) : isCycling ? (
                        <>
                          <span>{set.duration !== undefined && set.duration !== null ? set.duration : '-'} {set.durationUnit || 'minutes'}</span>
                          <span className="text-gray-400 dark:text-gray-600">/</span>
                          {readOnly ? (
                            <span className={`ml-1 px-2 py-0.5 rounded ${getSetDeviationColor(setIdx, 'reps') || 'bg-gray-100 text-gray-700'}`}>{actualReps || '-'}</span>
                          ) : (
                            <input
                              type="number"
                              min={0}
                              className={`w-14 px-1 py-0.5 border rounded ml-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${getSetDeviationColor(setIdx, 'reps') || 'border-gray-300'}`}
                              placeholder="Actual"
                              value={actualReps}
                              onChange={e => onActualChange(setIdx, 'reps', e.target.value)}
                            />
                          )}
                        </>
                      ) : isRunning ? (
                        <>
                          <span>{set.duration !== undefined && set.duration !== null ? set.duration : '-'} {set.durationUnit || 'minutes'}</span>
                          <span className="text-gray-400 dark:text-gray-600">/</span>
                          {readOnly ? (
                            <span className={`ml-1 px-2 py-0.5 rounded ${getSetDeviationColor(setIdx, 'reps') || 'bg-gray-100 text-gray-700'}`}>{actualReps || '-'}</span>
                          ) : (
                            <input
                              type="number"
                              min={0}
                              className={`w-14 px-1 py-0.5 border rounded ml-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${getSetDeviationColor(setIdx, 'reps') || 'border-gray-300'}`}
                              placeholder="Actual"
                              value={actualReps}
                              onChange={e => onActualChange(setIdx, 'reps', e.target.value)}
                            />
                          )}
                        </>
                      ) : isTreadmill ? (
                        <>
                          <span>{set.duration !== undefined && set.duration !== null ? set.duration : '-'} {set.durationUnit || 'minutes'}</span>
                          <span className="text-gray-400 dark:text-gray-600">/</span>
                          {readOnly ? (
                            <span className={`ml-1 px-2 py-0.5 rounded ${getSetDeviationColor(setIdx, 'reps') || 'bg-gray-100 text-gray-700'}`}>{actualReps || '-'}</span>
                          ) : (
                            <input
                              type="number"
                              min={0}
                              className={`w-14 px-1 py-0.5 border rounded ml-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${getSetDeviationColor(setIdx, 'reps') || 'border-gray-300'}`}
                              placeholder="Actual"
                              value={actualReps}
                              onChange={e => onActualChange(setIdx, 'reps', e.target.value)}
                            />
                          )}
                        </>
                      ) : (
                    <>
                      <span>{plannedReps}</span>
                      {readOnly ? (
                        <span className={`ml-1 px-2 py-0.5 rounded ${getSetDeviationColor(setIdx, 'reps') || 'bg-gray-100 text-gray-700'}`}>{actualReps || '-'}</span>
                      ) : (
                        <input
                          type="number"
                          min={0}
                          className={`w-14 px-1 py-0.5 border rounded ml-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${getSetDeviationColor(setIdx, 'reps') || 'border-gray-300'}`}
                          placeholder="Actual"
                          value={actualReps}
                          onChange={e => onActualChange(setIdx, 'reps', e.target.value)}
                        />
                      )}
                    </>
                  )}
                </div>
                {isCycling && <div className="flex items-center">{set.distance || '-'}</div>}
                {isRunning && <div className="flex items-center">{set.distance || '-'} {set.distanceUnit || 'miles'}</div>}
                {isTreadmill && <div className="flex items-center">{set.distance || '-'} {set.distanceUnit || 'miles'}</div>}
                {!isCycling && !isRunning && !isTreadmill && (
                  <div className="flex items-center gap-2">
                    <span>{formatLoad(plannedLoad, plannedUnit)}</span>
                    {readOnly ? (
                          <span className={`ml-1 px-2 py-0.5 rounded ${getSetDeviationColor(setIdx, 'load') || 'bg-gray-100 text-gray-700'}`}>{actualLoad || '-'}</span>
                    ) : (
                      <input
                        type="text"
                        className={`w-16 px-1 py-0.5 border rounded ml-1 ${getSetDeviationColor(setIdx, 'load') || 'border-gray-300'}`}
                        placeholder="Actual"
                        value={actualLoad}
                        onChange={e => onActualChange(setIdx, 'load', e.target.value)}
                      />
                    )}
                  </div>
                )}
                {isCycling && <div className="flex items-center">{speed || '-'}</div>}
                {isCycling && <div className="flex items-center">{rpm || '-'}</div>}
                {isCycling && <div className="flex items-center">{watts || '-'}</div>}
                {isCycling && <div className="flex items-center">{resistance || '-'}</div>}
                            {isRunning && <div className="flex items-center">{set.pace || '-'}</div>}
            {isTreadmill && <div className="flex items-center">{set.pace || '-'}</div>}
            {isTreadmill && <div className="flex items-center">{set.incline || '-'}%</div>}
                {!isCarry && !isCycling && !isRunning && !isTreadmill && <div className="flex items-center">{set.tempo || '2010'}</div>}
                <div className="flex items-center">{set.restSec || 0}s</div>
                {!isCarry && !isCycling && !isRunning && !isTreadmill && <div className="flex items-center">{calculateTimeUnderTension(set.reps, set.tempo)} sec.</div>}
              </React.Fragment>
            );
          })}
        </div>
        
        {/* Mobile-friendly card layout - shown on mobile */}
        <div className="md:hidden space-y-3">
          {(exercise.plannedSets || []).map((set, setIdx) => {
            const exerciseData = getExerciseNameData();
            const isCarry = isCarryExercise(exerciseData);
            const isCycling = isCyclingExercise(exerciseData);
            const isRunning = isRunningExercise(exerciseData);
            const isTreadmill = isTreadmillExercise(exerciseData);
            const plannedReps = set.reps || 0;
            const plannedDistance = set.distance || 0;
            const plannedDistanceUnit = set.distanceUnit || 'yards';
            const plannedLoad = set.load || '';
            const plannedUnit = getLoadUnit(set);
            const actualReps = actuals[setIdx]?.reps ?? '';
            const actualDistance = set.distance ? actuals[setIdx]?.reps ?? '' : '';
            const actualLoad = actuals[setIdx]?.load ?? '';
            
            // For Cycling exercises, get the additional fields from the set
            const speed = set.speed ?? 0;
            const rpm = set.rpm ?? 0;
            const watts = set.watts ?? 0;
            const resistance = set.resistance ?? 0;
            
            return (
              <div key={setIdx} className="bg-gray-50 rounded-lg p-3 border">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700 dark:text-gray-900">Set {set.set || setIdx + 1}</span>
                  <span className="text-sm font-bold text-gray-500 dark:text-gray-700">{set.restSec || 0}s Rest</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="font-bold text-gray-600 dark:text-gray-800 mb-1">
                      {isCarry ? 'Distance' : isCycling ? 'Duration (min)' : isRunning ? 'Duration (min)' : isTreadmill ? 'Duration (min)' : 'Reps'}
                    </div>
                    <div className="flex items-center gap-2">
                      {isCarry ? (
                        <>
                          <span className="text-gray-800 dark:text-gray-900">{plannedDistance} {plannedDistanceUnit}</span>
                          <span className="text-gray-400 dark:text-gray-600">/</span>
                          <span className="text-gray-800 dark:text-gray-900">{actualReps ? `${actualReps} ${plannedDistanceUnit}` : '-'}</span>
                        </>
                      ) : isCycling ? (
                        <>
                          <span className="text-gray-800 dark:text-gray-900">{set.duration !== undefined && set.duration !== null ? set.duration : '-'} {set.durationUnit || 'minutes'}</span>
                          <span className="text-gray-400 dark:text-gray-600">/</span>
                          {readOnly ? (
                            <span className={`px-2 py-1 rounded ${getSetDeviationColor(setIdx, 'reps') || 'bg-gray-100 text-gray-700 dark:text-gray-900'}`}>{actualReps || '-'}</span>
                          ) : (
                            <input
                              type="number"
                              min={0}
                              className={`w-16 px-2 py-1 border rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-gray-900 dark:text-gray-900 ${getSetDeviationColor(setIdx, 'reps') || 'border-gray-300'}`}
                              placeholder="Actual"
                              value={actualReps}
                              onChange={e => onActualChange(setIdx, 'reps', e.target.value)}
                            />
                          )}
                        </>
                      ) : isRunning ? (
                        <>
                          <span className="text-gray-800 dark:text-gray-900">{set.duration !== undefined && set.duration !== null ? set.duration : '-'} {set.durationUnit || 'minutes'}</span>
                          <span className="text-gray-400 dark:text-gray-600">/</span>
                          {readOnly ? (
                            <span className={`px-2 py-1 rounded ${getSetDeviationColor(setIdx, 'reps') || 'bg-gray-100 text-gray-700 dark:text-gray-900'}`}>{actualReps || '-'}</span>
                          ) : (
                            <input
                              type="number"
                              min={0}
                              className={`w-16 px-2 py-1 border rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-gray-900 dark:text-gray-900 ${getSetDeviationColor(setIdx, 'reps') || 'border-gray-300'}`}
                              placeholder="Actual"
                              value={actualReps}
                              onChange={e => onActualChange(setIdx, 'reps', e.target.value)}
                            />
                          )}
                        </>
                      ) : isTreadmill ? (
                        <>
                          <span className="text-gray-800 dark:text-gray-900">{set.duration !== undefined && set.duration !== null ? set.duration : '-'} {set.durationUnit || 'minutes'}</span>
                          <span className="text-gray-400 dark:text-gray-600">/</span>
                          {readOnly ? (
                            <span className={`px-2 py-1 rounded ${getSetDeviationColor(setIdx, 'reps') || 'bg-gray-100 text-gray-700 dark:text-gray-900'}`}>{actualReps || '-'}</span>
                          ) : (
                            <input
                              type="number"
                              min={0}
                              className={`w-16 px-2 py-1 border rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-gray-900 dark:text-gray-900 ${getSetDeviationColor(setIdx, 'reps') || 'border-gray-300'}`}
                              placeholder="Actual"
                              value={actualReps}
                              onChange={e => onActualChange(setIdx, 'reps', e.target.value)}
                            />
                          )}
                        </>
                      ) : (
                        <>
                          <span className="text-gray-800 dark:text-gray-900">{plannedReps}</span>
                          <span className="text-gray-400 dark:text-gray-600">/</span>
                          {readOnly ? (
                            <span className={`px-2 py-1 rounded ${getSetDeviationColor(setIdx, 'reps') || 'bg-gray-100 text-gray-700 dark:text-gray-900'}`}>{actualReps || '-'}</span>
                          ) : (
                            <input
                              type="number"
                              min={0}
                              className={`w-16 px-2 py-1 border rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-gray-900 dark:text-gray-900 ${getSetDeviationColor(setIdx, 'reps') || 'border-gray-300'}`}
                              placeholder="Actual"
                              value={actualReps}
                              onChange={e => onActualChange(setIdx, 'reps', e.target.value)}
                            />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {!isCycling && !isRunning && !isTreadmill && (
                    <div>
                      <div className="font-bold text-gray-600 dark:text-gray-800 mb-1">Load</div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-800 dark:text-gray-900">{formatLoad(plannedLoad, plannedUnit)}</span>
                        <span className="text-gray-400 dark:text-gray-600">/</span>
                        {readOnly ? (
                          <span className={`px-2 py-1 rounded ${getSetDeviationColor(setIdx, 'load') || 'bg-gray-100 text-gray-700 dark:text-gray-900'}`}>{actualLoad || '-'}</span>
                        ) : (
                          <input
                            type="text"
                            className={`w-20 px-2 py-1 border rounded text-gray-900 dark:text-gray-900 ${getSetDeviationColor(setIdx, 'load') || 'border-gray-300'}`}
                            placeholder="Actual"
                            value={actualLoad}
                            onChange={e => onActualChange(setIdx, 'load', e.target.value)}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {isTreadmill && (
                  <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                    <div>
                      <div className="font-bold text-gray-600 dark:text-gray-800 mb-1">Distance</div>
                      <span className="text-gray-800 dark:text-gray-900">{set.distance ?? '-'} {set.distanceUnit || 'miles'}</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-600 dark:text-gray-800 mb-1">Pace</div>
                      <span className="text-gray-800 dark:text-gray-900">{set.pace ?? '-'}</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-600 dark:text-gray-800 mb-1">Incline (%)</div>
                      <span className="text-gray-800 dark:text-gray-900">{set.incline ?? '-'}%</span>
                    </div>
                  </div>
                )}
                {isRunning && (
                  <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                    <div>
                      <div className="font-bold text-gray-600 dark:text-gray-800 mb-1">Distance</div>
                      <span className="text-gray-800 dark:text-gray-900">{set.distance ?? '-'} {set.distanceUnit || 'miles'}</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-600 dark:text-gray-800 mb-1">Pace</div>
                      <span className="text-gray-800 dark:text-gray-900">{set.pace ?? '-'}</span>
                    </div>
                  </div>
                )}
                {isCycling && (
                  <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                    <div>
                      <div className="font-bold text-gray-600 dark:text-gray-800 mb-1">Distance (mi)</div>
                      <span className="text-gray-800 dark:text-gray-900">{set.distance ?? '-'}</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-600 dark:text-gray-800 mb-1">Speed (mph)</div>
                      <span className="text-gray-800 dark:text-gray-900">{speed}</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-600 dark:text-gray-800 mb-1">RPM</div>
                      <span className="text-gray-800 dark:text-gray-900">{rpm}</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-600 dark:text-gray-800 mb-1">Watts</div>
                      <span className="text-gray-800 dark:text-gray-900">{watts}</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-600 dark:text-gray-800 mb-1">Resistance</div>
                      <span className="text-gray-800 dark:text-gray-900">{resistance}</span>
                    </div>
                  </div>
                )}
                {!isCarry && !isCycling && !isRunning && !isTreadmill && (
                  <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                    <div>
                      <div className="font-bold text-gray-600 dark:text-gray-800 mb-1">Tempo</div>
                      <span className="text-gray-800 dark:text-gray-900">{set.tempo || '2010'}</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-600 dark:text-gray-800 mb-1">TUT</div>
                      <span className="text-gray-800 dark:text-gray-900">{calculateTimeUnderTension(set.reps, set.tempo)} sec.</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Summary row and notes, as in Plan mode */}
      <div className="mt-3 border-t pt-3">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm font-medium text-purple-700">
            {isCarry ? (
              <div>
                <span className="mr-1">Total Distance:</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  {getTotalDistance().value} {getTotalDistance().unit}
                </span>
              </div>
            ) : isCycling ? (
              <div>
                <span className="mr-1">Total Duration:</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  {getTotalDuration().value} {getTotalDuration().unit}
                </span>
              </div>
            ) : isRunning ? (
              <div>
                <span className="mr-1">Total Duration:</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  {getTotalDuration().value} {getTotalDuration().unit}
                </span>
              </div>
            ) : isTreadmill ? (
              <div>
                <span className="mr-1">Total Duration:</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  {getTotalDuration().value} {getTotalDuration().unit}
                </span>
              </div>
            ) : (
              <>
                <div>
                  <span className="mr-1">Total Reps (Planned/Actual):</span>
                  <span className={`${getSummaryDeviationColor('reps')} px-2 py-0.5 rounded-full`}>
                    {exercise.plannedSets?.reduce((sum, set) => sum + (set.reps || 0), 0)} / {calculateActualRepsTally()}
                  </span>
                </div>
                {shouldShowTotalLoad() && (
                  <div>
                    <span className="mr-1">Total Load (Planned/Actual):</span>
                    <span className={`${getSummaryDeviationColor('load')} px-2 py-0.5 rounded-full`}>
                      {formatNumberWithCommas(getTotalLoad().value)} / {formatNumberWithCommas(calculateActualLoadTally())} {getTotalLoad().unit}
                    </span>
                  </div>
                )}
              </>
            )}
            {getRIR() !== null && (
              <div>
                <span className="mr-1">RIR:</span>
                <span>{getRIR()}</span>
              </div>
            )}
            {getRPE() !== null && (
              <div>
                <span className="mr-1">RPE:</span>
                <span>{getRPE()}</span>
              </div>
            )}
          </div>
          {exercise.notes && (
            <div className="text-sm text-gray-600">
              <span>
                <span className="font-medium dark:text-slate-900">Notes: </span>
                <span className="dark:text-slate-900">{exercise.notes}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 