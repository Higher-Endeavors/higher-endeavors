'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSession } from "next-auth/react"

type FormData = {
  exercise_name: string;
  struct_bal_lift_load: number;
};

type RefLift = {
  id: number;
  exercise_name: string;
  struct_bal_ref_lift_load: number;
};

type BalLift = {
  id: number;
  exercise_name: string;
  bal_lift_load: number;
};

function doCalculate(refLifts: RefLift[], formValues: FormData) {
  const masterLiftIdx = refLifts.map(e => e.id).indexOf(Number(formValues.exercise_name));
  const masterLiftRefLoad = refLifts[masterLiftIdx].struct_bal_ref_lift_load;
  const masterLiftNewLoad = Number(formValues.struct_bal_lift_load);
  
  return refLifts.map((refLift) => {
    const loadFactor = refLift.struct_bal_ref_lift_load / masterLiftRefLoad;
    const newLoad = Math.round(masterLiftNewLoad * loadFactor);
    return {
      id: refLift.id,
      exercise_name: refLift.exercise_name,
      bal_lift_load: newLoad
    };
  });
}

export default function StructuralBalanceMini() {
  const { register, getValues, formState: { errors } } = useForm<FormData>();
  const [balLifts, setBalLifts] = useState<BalLift[]>([]);
  const [isListVisible, setIsListVisible] = useState(false);
  const { data: session } = useSession();

  // Placeholder data - you'll want to fetch this from your API
  const refLifts: RefLift[] = [
    { id: 1, exercise_name: "Back Squat", struct_bal_ref_lift_load: 100 },
    { id: 2, exercise_name: "Bench Press", struct_bal_ref_lift_load: 75 },
    // Add more reference lifts as needed
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <select
          {...register('exercise_name', { required: true })}
          className="flex-1 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm"
        >
          <option value="">Select Lift</option>
          {refLifts.map((refLift) => (
            <option key={refLift.id} value={refLift.id}>
              {refLift.exercise_name}
            </option>
          ))}
        </select>
        <input
          type="number"
          {...register('struct_bal_lift_load', { required: true })}
          placeholder="Load (lbs)"
          className="w-24 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm"
        />
      </div>

      <button
        onClick={() => {
          const formValues = getValues();
          setBalLifts(doCalculate(refLifts, formValues));
          setIsListVisible(true);
        }}
        className="w-full rounded-md bg-purple-500 hover:bg-purple-600 py-2 px-4 text-sm text-white"
      >
        Calculate
      </button>

      {isListVisible && balLifts.length > 0 && (
        <div className="mt-3 space-y-2">
          {balLifts.map((lift) => (
            <div key={lift.id} className="flex justify-between text-sm">
              <span>{lift.exercise_name}</span>
              <span className="font-medium">{lift.bal_lift_load} lbs</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 