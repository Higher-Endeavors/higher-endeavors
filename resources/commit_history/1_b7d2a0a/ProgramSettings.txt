'use client';

import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { programSettingsSchema } from '../../shared/schemas/program';
import type { z } from 'zod';

type ProgramSettingsFormData = z.infer<typeof programSettingsSchema>;

interface ProgramSettingsProps {
  name: string;
  phaseFocus: ProgramSettingsFormData['phaseFocus'];
  periodizationType: ProgramSettingsFormData['periodizationType'];
  progressionRules?: {
    type: string;
    settings: {
      volumeIncrementPercentage?: number;
      loadIncrementPercentage?: number;
      programLength?: number;
      weeklyVolumePercentages?: number[];
    };
  };
  onSettingsChange: (settings: Partial<ProgramSettingsFormData>) => void;
}

const phaseFocusOptions = [
  { value: 'GPP', label: 'General Physical Preparedness' },
  { value: 'Strength', label: 'Strength' },
  { value: 'Hypertrophy', label: 'Hypertrophy' },
  { value: 'Power', label: 'Power' },
  { value: 'Endurance', label: 'Muscular Endurance' },
  { value: 'Recovery', label: 'Recovery' },
  { value: 'Intensification', label: 'Intensification' },
  { value: 'Accumulation', label: 'Accumulation' },
  { value: 'Other', label: 'Other (Custom)' }
] as const;

const periodizationOptions = [
  { value: 'None' as const, label: 'None' },
  { value: 'Linear' as const, label: 'Linear Periodization' },
  { value: 'Undulating' as const, label: 'Undulating Periodization' },
  { value: 'Custom' as const, label: 'Custom Periodization' }
] as const;

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
  progressionRules,
  onSettingsChange
}: ProgramSettingsProps) {
  const [customPhaseFocus, setCustomPhaseFocus] = useState('');
  const [showCustomPhaseFocus, setShowCustomPhaseFocus] = useState(
    !phaseFocusOptions.find(option => option.value === phaseFocus)
  );

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProgramSettingsFormData>({
    resolver: zodResolver(programSettingsSchema),
    defaultValues: {
      name,
      phaseFocus,
      periodizationType,
      progressionRules: {
        type: periodizationType,
        settings: {
          volumeIncrementPercentage: progressionRules?.settings?.volumeIncrementPercentage ?? 5,
          loadIncrementPercentage: progressionRules?.settings?.loadIncrementPercentage ?? 2.5,
          programLength: progressionRules?.settings?.programLength ?? 4,
          weeklyVolumePercentages: progressionRules?.settings?.weeklyVolumePercentages ?? [100, 80, 90, 60]
        }
      }
    }
  });

  // Update form values when props change
  useEffect(() => {
    console.log('Props updated:', { name, phaseFocus, periodizationType, progressionRules });
    setValue('name', name);
    setValue('phaseFocus', phaseFocus);
    setValue('periodizationType', periodizationType);
    setValue('progressionRules', {
      type: periodizationType,
      settings: {
        volumeIncrementPercentage: progressionRules?.settings?.volumeIncrementPercentage ?? 5,
        loadIncrementPercentage: progressionRules?.settings?.loadIncrementPercentage ?? 2.5,
        programLength: progressionRules?.settings?.programLength ?? 4,
        weeklyVolumePercentages: progressionRules?.settings?.weeklyVolumePercentages ?? [100, 80, 90, 60]
      }
    });
  }, [name, phaseFocus, periodizationType, progressionRules, setValue]);

  const currentPeriodizationType = watch('periodizationType');
  const programLength = watch('progressionRules.settings.programLength');

  // Only update weeklyVolumePercentages when explicitly switching to Undulating
  useEffect(() => {
    if (currentPeriodizationType === 'Undulating' && periodizationType !== 'Undulating') {
      setValue('progressionRules.settings.weeklyVolumePercentages', [100, 80, 90, 60]);
    }
  }, [currentPeriodizationType, periodizationType, setValue]);

  // Log form values on change
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      console.log('Form value changed:', { name, type, value });
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = (data: ProgramSettingsFormData) => {
    console.log('Form submitted:', data);
    onSettingsChange(data);
  };

  return (
    <form className="space-y-6">
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
                onChange={(e) => {
                  field.onChange(e);
                  onSettingsChange({ name: e.target.value });
                }}
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
                value={phaseFocusOptions.find(option => 
                  showCustomPhaseFocus ? option.value === 'Other' : option.value === field.value
                )}
                onChange={(option) => {
                  if (option?.value === 'Other') {
                    setShowCustomPhaseFocus(true);
                    setCustomPhaseFocus(field.value);
                  } else {
                    setShowCustomPhaseFocus(false);
                    field.onChange(option?.value);
                    onSettingsChange({ phaseFocus: option?.value });
                  }
                }}
                className="basic-single dark:text-slate-700"
                classNamePrefix="select"
                styles={customSelectStyles}
              />
              {showCustomPhaseFocus && (
                <input
                  type="text"
                  value={customPhaseFocus}
                  onChange={(e) => {
                    setCustomPhaseFocus(e.target.value);
                    field.onChange(e.target.value);
                    onSettingsChange({ phaseFocus: e.target.value });
                  }}
                  placeholder="Enter custom phase/focus"
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-900"
                />
              )}
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
                onChange={(option) => {
                  const newType = option?.value ?? 'Linear';
                  field.onChange(newType);
                  // When periodization type changes, update the program settings
                  const currentSettings = watch('progressionRules.settings');
                  onSettingsChange({
                    periodizationType: newType,
                    progressionRules: {
                      type: newType,
                      settings: {
                        ...currentSettings,
                        // Only override settings if explicitly switching to Undulating
                        ...(newType === 'Undulating' && field.value !== 'Undulating' ? {
                          weeklyVolumePercentages: [100, 80, 90, 60]
                        } : {})
                      }
                    }
                  });
                }}
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

      {/* Program Length */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                onChange={(e) => {
                  const value = e.target.value === '' ? '' : Number(e.target.value);
                  field.onChange(value);
                  onSettingsChange({
                    progressionRules: {
                      type: currentPeriodizationType,
                      settings: {
                        programLength: value === '' ? 4 : Number(value)
                      }
                    }
                  });
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value === '' || Number(value) < 1) {
                    const defaultValue = 4;
                    field.onChange(defaultValue);
                    onSettingsChange({
                      progressionRules: {
                        type: currentPeriodizationType,
                        settings: {
                          programLength: defaultValue
                        }
                      }
                    });
                  }
                }}
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
        <p className="mt-1 text-sm text-gray-500">
          Set the duration of your training program
        </p>
      </div>

      {/* Progression Settings */}
      {currentPeriodizationType === 'Linear' && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700">Linear Progression Settings</h3>
          <div className="grid grid-cols-2 gap-4">
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
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow empty string for in-progress typing
                        field.onChange(value === '' ? '' : Number(value));
                        // Only update settings if we have a valid number
                        if (value !== '') {
                          onSettingsChange({
                            progressionRules: {
                              type: currentPeriodizationType,
                              settings: {
                                volumeIncrementPercentage: Number(value)
                              }
                            }
                          });
                        }
                      }}
                      onBlur={(e) => {
                        const value = e.target.value;
                        // On blur, if empty, revert to default
                        if (value === '') {
                          const defaultValue = 5;
                          field.onChange(defaultValue);
                          onSettingsChange({
                            progressionRules: {
                              type: currentPeriodizationType,
                              settings: {
                                volumeIncrementPercentage: defaultValue
                              }
                            }
                          });
                        }
                      }}
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
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow empty string for in-progress typing
                        field.onChange(value === '' ? '' : Number(value));
                        // Only update settings if we have a valid number
                        if (value !== '') {
                          onSettingsChange({
                            progressionRules: {
                              type: currentPeriodizationType,
                              settings: {
                                loadIncrementPercentage: Number(value)
                              }
                            }
                          });
                        }
                      }}
                      onBlur={(e) => {
                        const value = e.target.value;
                        // On blur, if empty, revert to default
                        if (value === '') {
                          const defaultValue = 2.5;
                          field.onChange(defaultValue);
                          onSettingsChange({
                            progressionRules: {
                              type: currentPeriodizationType,
                              settings: {
                                loadIncrementPercentage: defaultValue
                              }
                            }
                          });
                        }
                      }}
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
            defaultValue={[100, 80, 90, 60]}
            render={({ field }) => {
              const programLength = watch('progressionRules.settings.programLength') || 4;
              // Ensure we have enough values for all weeks
              const currentValues = [...(field.value || [])];
              while (currentValues.length < programLength) {
                currentValues.push(100);
              }
              
              return (
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: programLength }, (_, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-700">
                        Week {index + 1} Volume (%)
                      </label>
                      <input
                        type="number"
                        value={currentValues[index]}
                        onChange={(e) => {
                          const value = e.target.value;
                          const newValue = [...currentValues];
                          newValue[index] = value === '' ? 100 : Number(value);
                          field.onChange(newValue);
                          onSettingsChange({
                            progressionRules: {
                              type: currentPeriodizationType,
                              settings: {
                                weeklyVolumePercentages: newValue
                              }
                            }
                          });
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-900 p-2"
                        placeholder="100"
                        min="0"
                        max="100"
                        step="5"
                      />
                    </div>
                  ))}
                </div>
              );
            }}
          />
        </div>
      )}
    </form>
  );
} 