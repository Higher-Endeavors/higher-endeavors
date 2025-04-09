import { useSensors, useSensor, KeyboardSensor, PointerSensor } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import type { exercise } from '@/app/lib/types/pillars/fitness';

export function useDragAndDrop() {
  /* Commented out until DND functionality is implemented
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedExercise = program.exercises.find(ex => ex.id === active.id);
    setActiveExercise(draggedExercise);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveExercise(undefined);
    const { active, over } = event;

    if (active.id !== over?.id) {
      setProgram((prev) => {
        const oldIndex = prev.exercises.findIndex((ex) => ex.id === active.id);
        const newIndex = prev.exercises.findIndex((ex) => ex.id === over?.id);

        const newExercises = arrayMove(prev.exercises, oldIndex, newIndex);
        const updatedExercises = updatePairings(newExercises);

        return {
          ...prev,
          exercises: updatedExercises
        };
      });
    }
  };

  return {
    sensors,
    handleDragStart,
    handleDragEnd
  };
  */
  
  // Return empty object until DND is implemented
  return {};
}