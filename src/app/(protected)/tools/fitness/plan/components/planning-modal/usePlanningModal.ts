import { useState } from 'react';
import type { PlanningItem } from './planning-types.zod';
import type { PeriodizationPlan } from '../../types/periodization.zod';

interface UsePlanningModalProps {
  plan: PeriodizationPlan;
  onPlanChange: (plan: PeriodizationPlan) => void;
}

export function usePlanningModal({ plan, onPlanChange }: UsePlanningModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [clickedDate, setClickedDate] = useState<Date | undefined>();
  const [clickedWeek, setClickedWeek] = useState<number | undefined>();
  const [clickedModality, setClickedModality] = useState<string | undefined>();
  const [editingItem, setEditingItem] = useState<PlanningItem | null>(null);

  const openModal = (date?: Date, week?: number, modality?: string, item?: PlanningItem) => {
    setClickedDate(date);
    setClickedWeek(week);
    setClickedModality(modality);
    setEditingItem(item || null);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setClickedDate(undefined);
    setClickedWeek(undefined);
    setClickedModality(undefined);
    setEditingItem(null);
  };

  const handleSave = (item: PlanningItem) => {
    console.log('Planning item saved:', item);
    
    if (editingItem) {
      // Update existing item
      const updatedPlan = {
        ...plan,
        planningItems: (plan.planningItems || []).map(existingItem => 
          existingItem.id === editingItem.id ? item : existingItem
        )
      };
      onPlanChange(updatedPlan);
    } else {
      // Add new item
      const updatedPlan = {
        ...plan,
        planningItems: [...(plan.planningItems || []), item]
      };
      onPlanChange(updatedPlan);
    }
    
    closeModal();
  };

  return {
    isOpen,
    clickedDate,
    clickedWeek,
    clickedModality,
    editingItem,
    openModal,
    closeModal,
    handleSave,
  };
}
