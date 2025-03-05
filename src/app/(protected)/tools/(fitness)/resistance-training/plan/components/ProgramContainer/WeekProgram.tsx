import React from 'react';
// Remove DnD imports
// import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
// import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
// import { createPortal } from 'react-dom';
import { exercise } from '@/app/lib/types/pillars/fitness';
import ExerciseList from '../ExerciseManagement/ExerciseList';

/**
 * Props interface for the WeekProgram component
 * Using snake_case for database-mapped properties and camelCase for React handlers
 */
interface WeekProgramProps {
  week_number: number;  // Changed to snake_case as it maps to database
  exercises: exercise[];
  onExercisesChange: (exercises: exercise[]) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function WeekProgram({
  week_number,  // Changed to snake_case
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
  //     const updatedExercises = update_pairings(newExercises);
  //     onExercisesChange(updatedExercises);
  //   }
  // };

  /**
   * Updates exercise pairings (A1, A2, B1, etc.) when exercises are reordered.
   * This helper function follows snake_case convention as it works with database-mapped types.
   * 
   * @param exercises - Array of exercises to update pairings for
   * @returns Updated array of exercises with new pairings
   */
  const update_pairings = (exercises: exercise[]): exercise[] => {
    let current_group = 'A';
    let current_number = 1;

    return exercises.map((exercise, index) => {
      // Keep warm-up and cool-down exercises as is
      if (exercise.pairing?.startsWith('WU') || exercise.pairing?.startsWith('CD')) {
        return exercise;
      }

      // If this is the first exercise or if we need to start a new group
      if (index === 0 || current_number > 2) {
        current_number = 1;
        if (index > 0) {
          // Increment the group letter (A -> B -> C, etc.)
          current_group = String.fromCharCode(current_group.charCodeAt(0) + 1);
        }
      }

      const new_pairing = `${current_group}${current_number}`;
      current_number++;

      return { ...exercise, pairing: new_pairing };
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