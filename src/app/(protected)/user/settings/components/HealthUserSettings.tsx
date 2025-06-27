import React from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import type { UserSettings } from '@/app/lib/types/userSettings';
// import type { UserSettings, CircumferenceUnit } from '../types/settings';

interface HealthUserSettingsProps {
  setValue: UseFormSetValue<UserSettings>;
  watch: UseFormWatch<UserSettings>;
  health: any;
}

const HealthUserSettings: React.FC<HealthUserSettingsProps> = ({ setValue, watch, health }) => {
  // Handler functions for health settings
  const handleBodyFatMethodChange = (value: string, checked: boolean) => {
    const methods = checked
      ? [...(health.bodyFatMethods || []), value]
      : (health.bodyFatMethods || []).filter((method: string) => method !== value);
      setValue('pillar_settings.health.bodyFatMethods', methods);
      // setValue('health.bodyFatMethods', methods);
  };

  const handleCircumferenceChange = (measurement: string, checked: boolean) => {
    const measurements = checked
      ? [...(health.circumferenceMeasurements || []), measurement]
      : (health.circumferenceMeasurements || []).filter((m: string) => m !== measurement);
      setValue('pillar_settings.health.circumferenceMeasurements', measurements);
      // setValue('health.circumferenceMeasurements', measurements);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold dark:text-slate-600">Health Settings</h2>
      {/* Body Fat Measurement Methods */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Body Fat Measurement Methods</label>
        <div className="space-y-2">
          {[
            { value: 'manual', label: 'Manual Entry' },
            { value: 'bioelectrical', label: 'Bioelectrical Impedance' },
            { value: 'skinfold', label: '7-Site Skinfold' }
          ].map(({ value, label }) => (
            <label key={value} className="inline-flex items-center mr-4">
              <input
                type="checkbox"
                checked={health.bodyFatMethods?.includes(value)}
                onChange={(e) => handleBodyFatMethodChange(value, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">{label}</span>
            </label>
          ))}
        </div>
      </div>
      {/* Circumference Unit */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Circumference Measurement Unit</label>
        <select
          value={health.circumferenceUnit}
          onChange={(e) => setValue('pillar_settings.health.circumferenceUnit', e.target.value)}
          // onChange={(e) => setValue('health.circumferenceUnit', e.target.value as CircumferenceUnit)}
          className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600"
        >
          <option value="in">Inches</option>
          <option value="cm">Centimeters</option>
        </select>
      </div>
      {/* Circumference Measurements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Circumference Measurements to Track</label>
        <div className="grid grid-cols-2 gap-2">
          {['neck', 'shoulders', 'chest', 'waist', 'hips', 'biceps', 'forearm', 'thigh', 'calf'].map((measurement) => (
            <label key={measurement} className="inline-flex items-center">
              <input
                type="checkbox"
                checked={health.circumferenceMeasurements?.includes(measurement)}
                onChange={(e) => handleCircumferenceChange(measurement, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600 capitalize">{measurement}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthUserSettings;
