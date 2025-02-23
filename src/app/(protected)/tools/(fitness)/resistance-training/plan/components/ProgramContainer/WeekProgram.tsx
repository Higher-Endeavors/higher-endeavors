import React from 'react';
// Remove DnD imports
// import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
// import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
// import { createPortal } from 'react-dom';
import { Exercise } from '@/app/lib/types/pillars/fitness';
import ExerciseList from '../ExerciseManagement/ExerciseList';

interface WeekProgramProps {
  weekNumber: number;
  exercises: Exercise[];
  onExercisesChange: (exercises: Exercise[]) => void;
  onEdit: (id: number) => void;    // Changed from string to number
  onDelete: (id: number) => void;  // Changed from string to number
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

    /**
   * TODO: This function will be used when drag-and-drop functionality is re-implemented.
   * It updates exercise pairings (A1, A2, B1, etc.) when exercises are reordered.
   * Currently preserved for future DnD implementation.
   */
  // Modified updatePairings function to handle group changes
  const updatePairings = (exercises: Exercise[]): Exercise[] => {
    let currentGroup = 'A';
    let currentNumber = 1;

    return exercises.map((exercise, index) => {
      // Keep warm-up and cool-down exercises as is
      if (exercise.pairing?.startsWith('WU') || exercise.pairing?.startsWith('CD')) {
        return exercise;
      }

      // If this is the first exercise or if we need to start a new group
      if (index === 0 || currentNumber > 2) {
        currentNumber = 1;
        if (index > 0) {
          // Increment the group letter (A -> B -> C, etc.)
          currentGroup = String.fromCharCode(currentGroup.charCodeAt(0) + 1);
        }
      }

      const newPairing = `${currentGroup}${currentNumber}`;
      currentNumber++;

      return { ...exercise, pairing: newPairing };
    });
  };

  return (
    <div>
      {/* Remove DnD Context wrapper */}
      <ExerciseList
        exercises={exercises}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
} 