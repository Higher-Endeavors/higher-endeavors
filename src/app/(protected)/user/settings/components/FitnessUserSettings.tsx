import React from 'react';
import { UseFormSetValue } from 'react-hook-form';
import type { UserSettings } from '@/app/lib/types/userSettings';

interface FitnessUserSettingsProps {
  setValue: UseFormSetValue<UserSettings>;
  fitness: any;
}

const FitnessUserSettings: React.FC<FitnessUserSettingsProps> = ({ setValue, fitness }) => (
  <div>
    <h2 className="text-xl font-semibold dark:text-slate-600">Fitness Settings</h2>
    {/* Resistance Training */}
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700">Load Units</label>
      <select
        value={fitness.resistanceTraining?.weightUnit}
        onChange={(e) => setValue('pillar_settings.fitness.resistanceTraining.weightUnit', e.target.value)}
        className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600"
      >
        <option value="lbs">Pounds (lbs)</option>
        <option value="kgs">Kilograms (kg)</option>
      </select>
    </div>
    {/* CardioMetabolic */}
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700">Running Speed/Pace Unit</label>
      <select
        value={fitness.cardioMetabolic?.speedUnit}
        onChange={(e) => setValue('pillar_settings.fitness.cardioMetabolic.speedUnit', e.target.value)}
        className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600"
      >
        <option value="mph">Miles per Hour</option>
        <option value="kph">Kilometers per Hour</option>
        <option value="min_mile">Minutes per Mile</option>
        <option value="min_km">Minutes per Kilometer</option>
      </select>
    </div>
  </div>
);

export default FitnessUserSettings;
