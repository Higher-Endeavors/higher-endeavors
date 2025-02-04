import React from 'react';
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
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
  const [activeExercise, setActiveExercise] = React.useState<Exercise | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedExercise = exercises.find(ex => ex.id === active.id);
    setActiveExercise(draggedExercise || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveExercise(null);
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = exercises.findIndex((ex) => ex.id === active.id);
      const newIndex = exercises.findIndex((ex) => ex.id === over?.id);

      // Create new array with the moved exercise
      const newExercises = arrayMove(exercises, oldIndex, newIndex);

      // Update pairings for all exercises
      const updatedExercises = updatePairings(newExercises);
      onExercisesChange(updatedExercises);
    }
  };

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

  const ExerciseRow = ({ exercise }: { exercise: Exercise }) => {
    return (
      <tr className="border-b dark:border-gray-700">
        <td className="px-4 py-2">{exercise.pairing}</td>
        <td className="px-4 py-2">{exercise.name || 'Unnamed Exercise'}</td>
        <td className="px-4 py-2">{`${exercise.sets || 0} x ${exercise.reps || 0}`}</td>
        <td className="px-4 py-2">
          {typeof exercise.load === 'number' 
            ? `${exercise.load || 0} ${exercise.loadUnit || 'lbs'}`
            : exercise.load || 'BW'}
        </td>
        <td className="px-4 py-2">{exercise.tempo || '2010'}</td>
        <td className="px-4 py-2">{`${exercise.rest || 0}s`}</td>
        <td className="px-4 py-2">{exercise.notes || ''}</td>
      </tr>
    );
  };

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={exercises.map(ex => ex.id)}
          strategy={verticalListSortingStrategy}
        >
          <ExerciseListNoSSR
            exercises={exercises}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </SortableContext>

        {mounted && createPortal(
          <DragOverlay>
            {activeExercise ? (
              <div className="p-4 bg-white shadow-lg rounded-lg">
                <p className="font-medium">{activeExercise.name}</p>
                <p className="text-sm text-gray-600">
                  {activeExercise.sets} × {activeExercise.reps} @ {activeExercise.load}kg
                </p>
              </div>
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
} 