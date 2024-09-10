import React from 'react';

interface MasterLiftProps {
  masterLift: string;
  setMasterLift: (lift: string) => void;
  masterWeight: number;
  setMasterWeight: (weight: number) => void;
  unit: 'kg' | 'lbs';
  setUnit: (unit: 'kg' | 'lbs') => void;
  reps: number;
  setReps: (reps: number) => void;
  onCalculate: () => void;
  onSave: () => void;
}

const MasterLift = ({
  masterLift,
  setMasterLift,
  masterWeight,
  setMasterWeight,
  unit,
  setUnit,
  reps,
  setReps,
  onCalculate,
  onSave,
}: MasterLiftProps): JSX.Element => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="masterLift" className="block text-sm font-medium text-gray-700">Master Lift</label>
        <select
          id="masterLift"
          value={masterLift}
          onChange={(e) => setMasterLift(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">Select a lift</option>
          <option value="Squat">Squat</option>
          <option value="Bench Press">Bench Press</option>
          <option value="Deadlift">Deadlift</option>
          <option value="Overhead Press">Overhead Press</option>
        </select>
      </div>
      
      {/* Add similar input fields for weight, unit, and reps */}
      
      <div className="flex space-x-4">
        <button
          onClick={onCalculate}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Calculate
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default MasterLift;