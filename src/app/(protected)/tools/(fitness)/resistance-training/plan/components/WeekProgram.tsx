import React from 'react';
// Remove DnD imports
// import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
// import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
// import { createPortal } from 'react-dom';
import { Exercise } from '../../shared/types';
import ExerciseListNoSSR from './ExerciseList';

interface WeekProgramProps {
  weekNumber: number;
  exercises: Exercise[];
  onExercisesChange: (exercises: Exercise[]) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function WeekProgram({
  weekNumber,
  exercises,
  onExercisesChange,
  onEdit,
  onDelete
}: WeekProgramProps) {
  // Remove DnD state and handlers
  // const [activeExercise, setActiveExercise] = React.useState<Exercise | null>(null);
  // const [mounted, setMounted] = React.useState(false);

  // React.useEffect(() => {
  //   setMounted(true);
  // }, []);

  // const sensors = useSensors(
  //   useSensor(PointerSensor),
  //   useSensor(KeyboardSensor, {
  //     coordinateGetter: sortableKeyboardCoordinates,
  //   })
  // );

  // const handleDragStart = (event: DragStartEvent) => {
  //   const { active } = event;
  //   const draggedExercise = exercises.find(ex => ex.id === active.id);
  //   setActiveExercise(draggedExercise || null);
  // };

  // const handleDragEnd = (event: DragEndEvent) => {
  //   setActiveExercise(null);
  //   const { active, over } = event;

  //   if (active.id !== over?.id) {
  //     const oldIndex = exercises.findIndex((ex) => ex.id === active.id);
  //     const newIndex = exercises.findIndex((ex) => ex.id === over?.id);

  //     // Create new array with the moved exercise
  //     const newExercises = arrayMove(exercises, oldIndex, newIndex);

  //     // Update pairings for all exercises
  //     const updatedExercises = updatePairings(newExercises);
  //     onExercisesChange(updatedExercises);
  //   }
  // };

  // Modified updatePairings function to handle group changes
  const updatePairings = (exercises: Exercise[]): Exercise[] => {
    let currentGroup = 'A';
    let currentNumber = 1;

    return exercises.map((exercise, index) => {
      if (exercise.pairing.startsWith('WU') || exercise.pairing.startsWith('CD')) {
        return exercise;
      }

      // Start a new group if this is the first exercise or if previous exercise was in a different group
      if (index === 0 || (exercises[index - 1].pairing.charAt(0) !== currentGroup)) {
        currentGroup = String.fromCharCode(currentGroup.charCodeAt(0));
        currentNumber = 1;
      }

      const newPairing = `${currentGroup}${currentNumber}`;
      currentNumber = currentNumber === 1 ? 2 : 1;
      if (currentNumber === 1) {
        currentGroup = String.fromCharCode(currentGroup.charCodeAt(0) + 1);
      }

      return { ...exercise, pairing: newPairing };
    });
  };

  return (
    <div>
      {/* Remove DnD Context wrapper */}
      <ExerciseListNoSSR
        exercises={exercises}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
} 