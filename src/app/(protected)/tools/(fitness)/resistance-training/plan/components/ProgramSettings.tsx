'use client';

import React from 'react';
import Select from 'react-select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { programSettingsSchema } from '../../shared/schemas/program';
import type { z } from 'zod';

type ProgramSettingsFormData = z.infer<typeof programSettingsSchema>;

interface ProgramSettingsProps {
  name: string;
  phaseFocus: string;
  periodizationType: string;
  onSettingsChange: (settings: Partial<ProgramSettingsFormData>) => void;
}

const phaseFocusOptions = [
  { value: 'GPP', label: 'General Physical Preparedness' },
  { value: 'Strength', label: 'Strength' },
  { value: 'Hypertrophy', label: 'Hypertrophy' },
  { value: 'Intensification', label: 'Intensification' },
  { value: 'Accumulation', label: 'Accumulation' }
];

const periodizationOptions = [
  { value: 'Linear', label: 'Linear Progression' },
  { value: 'Undulating', label: 'Undulating Periodization' },
  { value: 'Custom', label: 'Custom Progression' }
];

const customSelectStyles = {
  control: (base: any) => ({
    ...base,
    backgroundColor: 'white',
  }),
  option: (base: any) => ({
    ...base,
    color: 'black',
  }),
  singleValue: (base: any) => ({
    ...base,
    color: 'var(--tw-text-slate-700)',
  }),
};

export default function ProgramSettings({
  name,
  phaseFocus,
  periodizationType,
  onSettingsChange
}: ProgramSettingsProps) {
  const { control, handleSubmit, watch, formState: { errors } } = useForm<ProgramSettingsFormData>({
    resolver: zodResolver(programSettingsSchema),
    defaultValues: {
      name,
      phaseFocus: phaseFocus as ProgramSettingsFormData['phaseFocus'],
      periodizationType: periodizationType as ProgramSettingsFormData['periodizationType'],
      progressionRules: {
        type: periodizationType as ProgramSettingsFormData['periodizationType'],
        settings: {
          volumeIncrementPercentage: 5,
          loadIncrementPercentage: 2.5,
          programLength: 4
        }
      }
    }
  });

  const currentPeriodizationType = watch('periodizationType');

  const onSubmit = (data: ProgramSettingsFormData) => {
    onSettingsChange(data);
  };

  // Auto-save on form changes
  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name) {
        handleSubmit(onSubmit)();
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, handleSubmit, onSubmit]);

  return (
    <form onChange={handleSubmit(onSubmit)} className="space-y-6">
      {/* Program Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Program Name
        </label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <div>
              <input
                {...field}
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-900 dark:placeholder-gray-300"
                placeholder="Enter program name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
          )}
        />
      </div>

      {/* Phase/Focus */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phase/Focus
        </label>
        <Controller
          name="phaseFocus"
          control={control}
          render={({ field }) => (
            <div>
              <Select
                {...field}
                options={phaseFocusOptions}
                value={phaseFocusOptions.find(option => option.value === field.value)}
                onChange={(option) => field.onChange(option?.value)}
                className="basic-single dark:text-slate-700"
                classNamePrefix="select"
                styles={customSelectStyles}
              />
              {errors.phaseFocus && (
                <p className="mt-1 text-sm text-red-600">{errors.phaseFocus.message}</p>
              )}
            </div>
          )}
        />
        <p className="mt-1 text-sm text-gray-500">
          Select the primary focus of this training program
        </p>
      </div>

      {/* Periodization Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Periodization Type
        </label>
        <Controller
          name="periodizationType"
          control={control}
          render={({ field }) => (
            <div>
              <Select
                {...field}
                options={periodizationOptions}
                value={periodizationOptions.find(option => option.value === field.value)}
                onChange={(option) => field.onChange(option?.value)}
                className="basic-single dark:text-slate-700"
                classNamePrefix="select"
                styles={customSelectStyles}
              />
              {errors.periodizationType && (
                <p className="mt-1 text-sm text-red-600">{errors.periodizationType.message}</p>
              )}
            </div>
          )}
        />
        <p className="mt-1 text-sm text-gray-500">
          Choose how the program will progress over time
        </p>
      </div>

      {/* Progression Settings */}
      {currentPeriodizationType === 'Linear' && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700">Linear Progression Settings</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Program Length (weeks)
              </label>
              <Controller
                name="progressionRules.settings.programLength"
                control={control}
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      type="number"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-900 p-2"
                      placeholder="4"
                      min="1"
                      max="52"
                      step="1"
                    />
                    {errors.progressionRules?.settings?.programLength && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.progressionRules.settings.programLength.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Volume Increment (%)
              </label>
              <Controller
                name="progressionRules.settings.volumeIncrementPercentage"
                control={control}
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      type="number"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-900 p-2"
                      placeholder="5"
                      min="0"
                      max="100"
                      step="1"
                    />
                    {errors.progressionRules?.settings?.volumeIncrementPercentage && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.progressionRules.settings.volumeIncrementPercentage.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Load Increment (%)
              </label>
              <Controller
                name="progressionRules.settings.loadIncrementPercentage"
                control={control}
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      type="number"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-900 p-2"
                      placeholder="2.5"
                      min="0"
                      max="100"
                      step="0.5"
                    />
                    {errors.progressionRules?.settings?.loadIncrementPercentage && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.progressionRules.settings.loadIncrementPercentage.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      )}

      {currentPeriodizationType === 'Undulating' && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700">Undulating Progression Settings</h3>
          <Controller
            name="progressionRules.settings.weeklyVolumePercentages"
            control={control}
            defaultValue={[100, 50, 75, 25]}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((week, index) => (
                  <div key={week}>
                    <label className="block text-sm font-medium text-gray-700">
                      Week {week} Volume (%)
                    </label>
                    <input
                      type="number"
                      value={field.value?.[index] ?? ''}
                      onChange={(e) => {
                        const newValue = [...(field.value || [])];
                        newValue[index] = Number(e.target.value);
                        field.onChange(newValue);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder={(index === 0 ? 100 : index === 1 ? 50 : index === 2 ? 75 : 25).toString()}
                      min="0"
                      max="100"
                      step="5"
                    />
                  </div>
                ))}
              </div>
            )}
          />
        </div>
      )}
    </form>
  );
} 