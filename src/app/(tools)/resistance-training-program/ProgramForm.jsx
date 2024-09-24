import React, { useState } from 'react';
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

type Exercise = {
  name: string;
  pairing: string;
  sets: number;
  reps: number;
  load: number;
  tempo: string;
  rest: number;
  notes: string;
};

type ProgramFormData = {
  name: string;
  exercises: Exercise[];
};

const ProgramForm: React.FC = () => {
  const { register, control, handleSubmit, formState: { errors } } = useForm<ProgramFormData>();
  const { fields, append, move } = useFieldArray({
    control,
    name: "exercises"
  });

  const onSubmit: SubmitHandler<ProgramFormData> = async (data) => {
    try {
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save program');
      const result = await response.json();
      console.log('Program saved with ID:', result.id);
      // Handle successful save (e.g., show success message, redirect)
    } catch (error) {
      console.error('Error saving program:', error);
      // Handle error (e.g., show error message)
    }
  };

  const addExercise = () => {
    append({ name: '', pairing: '', sets: 0, reps: 0, load: 0, tempo: '', rest: 0, notes: '' });
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    move(result.source.index, result.destination.index);
  };

  const updatePairing = () => {
    let currentGroup = 'A';
    let currentNumber = 1;
    fields.forEach((field, index) => {
      if (index > 0 && field.pairing[0] !== fields[index - 1].pairing[0]) {
        currentGroup = String.fromCharCode(currentGroup.charCodeAt(0) + 1);
        currentNumber = 1;
      }
      field.pairing = `${currentGroup}${currentNumber}`;
      currentNumber++;
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name", { required: "Program name is required" })} placeholder="Program Name" />
      {errors.name && <p>{errors.name.message}</p>}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="exercises">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {fields.map((field, index) => (
                <Draggable key={field.id} draggableId={field.id} index={index}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      <input {...register(`exercises.${index}.name` as const, { required: "Exercise name is required" })} placeholder="Exercise Name" />
                      <input {...register(`exercises.${index}.pairing` as const)} placeholder="Pairing" readOnly />
                      <input type="number" {...register(`exercises.${index}.sets` as const, { required: "Sets are required" })} placeholder="Sets" />
                      <input type="number" {...register(`exercises.${index}.reps` as const, { required: "Reps are required" })} placeholder="Reps" />
                      <input type="number" {...register(`exercises.${index}.load` as const)} placeholder="Load (kg)" />
                      <input {...register(`exercises.${index}.tempo` as const)} placeholder="Tempo" />
                      <input type="number" {...register(`exercises.${index}.rest` as const)} placeholder="Rest (seconds)" />
                      <textarea {...register(`exercises.${index}.notes` as const)} placeholder="Notes" />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <button type="button" onClick={addExercise}>Add Exercise</button>
      <button type="button" onClick={updatePairing}>Update Pairing</button>
      <button type="submit">Save Program</button>
    </form>
  );
};

export default ProgramForm;
