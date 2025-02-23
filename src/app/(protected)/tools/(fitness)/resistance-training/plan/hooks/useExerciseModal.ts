import { Exercise } from "@/app/lib/types/pillars/fitness";
import { useState } from "react";

export function useExerciseModal() {
    const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
    const [isExerciseSearchOpen, setIsExerciseSearchOpen] = useState(false);
    const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
    const [editingExercise, setEditingExercise] = useState<Exercise | undefined>();
    const [selectedExerciseName, setSelectedExerciseName] = useState('');
    const [selectedExercise, setSelectedExercise] = useState<Exercise | undefined>();
  
    return {
      isExerciseModalOpen, setIsExerciseModalOpen,
      isExerciseSearchOpen, setIsExerciseSearchOpen,
      isAdvancedSearchOpen, setIsAdvancedSearchOpen,
      editingExercise, setEditingExercise,
      selectedExerciseName, setSelectedExerciseName,
      selectedExercise, setSelectedExercise
    };
  }