'use client';

import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { programSettingsSchema, PhaseFocus, PeriodizationType } from '@/app/lib/types/pillars/fitness';
import type { z } from 'zod';

/**
 * Debug Configuration
 * Toggle these constants to enable/disable different types of debugging
 */
const DEBUG = {
  FORM: false,      // Log form changes
  VALIDATION: false, // Log validation errors
  STATE: false,     // Log state changes
  EFFECTS: false    // Log effect triggers
};

/**
 * Debugging utilities for different aspects of the component
 */
const Debug = {
  form: (message: string, data?: any) => {
    if (DEBUG.FORM) console.log(`[ProgramSettings:Form] ${message}`, data || '');
  },
  validation: (message: string, data?: any) => {
    if (DEBUG.VALIDATION) console.log(`[ProgramSettings:Validation] ${message}`, data || '');
  },
  state: (message: string, data?: any) => {
    if (DEBUG.STATE) console.log(`[ProgramSettings:State] ${message}`, data || '');
  },
  effect: (message: string, data?: any) => {
    if (DEBUG.EFFECTS) console.log(`[ProgramSettings:Effect] ${message}`, data || '');
  }
};

/**
 * Think of ProgramSettings like a control panel for your workout program.
 * Just like a video game has settings for difficulty, sound, and graphics,
 * a workout program has settings for:
 * - What the program is called
 * - What it's meant to do (get stronger, build muscle, etc.)
 * - How it changes over time
 * - How long it lasts
 * - Special rules for progression
 * 
 * Technical Details:
 * - Uses react-hook-form for form management
 * - Implements Zod schema validation
 * - Provides real-time updates via onSettingsChange callback
 * - Handles both basic and advanced program configuration
 */

// This creates a type based on our validation rules (programSettingsSchema)
export type ProgramSettingsFormData = z.infer<typeof programSettingsSchema>;

/**
 * What information the ProgramSettings needs to work:
 * 
 * Basic Settings:
 * @param name - What you want to call your program
 * @param phaseFocus - What the program is trying to achieve (like "Get Stronger" or "Build Muscle")
 * @param periodizationType - How the program changes over time (Linear = steady changes, Undulating = varies up and down)
 * @param notes - Any extra information you want to remember about the program
 * 
 * Advanced Settings:
 * @param progressionRules - Special rules for how the program gets harder over time
 *    - type: What kind of progression (Linear, Undulating)
 *    - settings: The specific numbers and rules:
 *        - volumeIncrementPercentage: How much to increase the work by (Linear)
 *        - loadIncrementPercentage: How much to increase the weight by (Linear)
 *        - programLength: How many weeks the program lasts
 *        - weeklyVolumePercentages: How hard each week is (Undulating)
 * 
 * Functions:
 * @param onSettingsChange - What to do when settings are changed
 * 
 * Technical Note:
 * The component uses Partial<ProgramSettingsFormData> to allow updating individual
 * settings without requiring all settings to be provided at once.
 */
interface ProgramSettingsProps {
  name: string;
  phaseFocus: ProgramSettingsFormData['phaseFocus'];
  periodizationType: ProgramSettingsFormData['periodizationType'];
  notes?: string;
  progressionRules?: {
    type: string;
    settings: {
      volumeIncrementPercentage?: number;  // For Linear progression
      loadIncrementPercentage?: number;    // For Linear progression
      programLength?: number;              // Length in weeks
      weeklyVolumePercentages?: number[];  // For Undulating progression
    };
  };
  onSettingsChange: (settings: Partial<ProgramSettingsFormData>) => void;
}

/**
 * These are all the different types of training focus you can choose from.
 * Think of it like choosing what kind of superhero you want to be:
 * - GPP: Good at everything (like Batman)
 * - Strength: Super strong (like Hulk)
 * - Hypertrophy: Build muscle (like Captain America)
 * - Power: Explosive strength (like Thor)
 * - Endurance: Keep going longer (like Flash)
 * 
 * Technical Note:
 * Using 'as const' makes this a readonly tuple type, ensuring type safety
 * when used with react-select
 */
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

/**
 * These are the different ways your program can progress over time:
 * - None: Stays the same (like doing the same workout every time)
 * - Linear: Gradually gets harder (like climbing stairs)
 * - Undulating: Goes up and down (like riding a roller coaster)
 * - Custom: Your own special way
 * 
 * Technical Note:
 * Defined as a const array to ensure type safety with react-select
 */
const periodizationOptions = [
  { value: 'None', label: 'None' },
  { value: 'Linear', label: 'Linear Periodization' },
  { value: 'Undulating', label: 'Undulating Periodization' },
  { value: 'Custom', label: 'Custom Periodization' }
] as const;

/**
 * These styles make the dropdown menus look good and match our color scheme.
 * 
 * Technical Note:
 * Customizes react-select components to match the application's theme
 * while maintaining accessibility in both light and dark modes
 */
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
  notes,
  progressionRules,
  onSettingsChange
}: ProgramSettingsProps) {
  /**
   * State Management:
   * - customPhaseFocus: Handles custom training focus input
   * - showCustomPhaseFocus: Controls visibility of custom focus input field
   */
  const [customPhaseFocus, setCustomPhaseFocus] = useState('');
  const [showCustomPhaseFocus, setShowCustomPhaseFocus] = useState(
    !phaseFocusOptions.find(option => option.value === phaseFocus)
  );

  /**
   * Form Setup and Validation
   * - control: Manages form inputs
   * - handleSubmit: Processes form submission
   * - watch: Monitors specific form field changes
   * - setValue: Updates form fields programmatically
   * - errors: Tracks validation errors
   * 
   * Default values are set for all fields, with fallbacks if not provided
   */
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProgramSettingsFormData>({
    resolver: zodResolver(programSettingsSchema),
    defaultValues: {
      name,
      phaseFocus: phaseFocus || 'GPP',
      periodizationType: periodizationType || 'None',
      notes: notes || '',
      progressionRules: {
        type: progressionRules?.type || 'None',
        settings: {
          volumeIncrementPercentage: progressionRules?.settings?.volumeIncrementPercentage ?? 5,
          loadIncrementPercentage: progressionRules?.settings?.loadIncrementPercentage ?? 2.5,
          programLength: progressionRules?.settings?.programLength ?? 4,
          weeklyVolumePercentages: progressionRules?.settings?.weeklyVolumePercentages ?? [100, 80, 90, 60]
        }
      }
    }
  });

  /**
   * Watch specific form fields for changes
   * - currentPeriodizationType: Used to show/hide progression settings
   * - programLength: Used to adjust weekly volume percentages
   */
  const currentPeriodizationType = watch('periodizationType');
  const programLength = watch('progressionRules.settings.programLength');

  /**
   * Automatically update weekly volume percentages when switching to Undulating periodization
   * Only triggers when explicitly changing to Undulating from a different type
   * Default pattern: Week 1 (100%), Week 2 (80%), Week 3 (90%), Week 4 (60%)
   */
  useEffect(() => {
    Debug.effect('Periodization type changed:', {
      current: currentPeriodizationType,
      previous: periodizationType
    });
    
    if (currentPeriodizationType === 'Undulating' && periodizationType !== 'Undulating') {
      Debug.effect('Updating weekly volume percentages to default pattern');
      setValue('progressionRules.settings.weeklyVolumePercentages', [100, 80, 90, 60]);
    }
  }, [currentPeriodizationType, periodizationType, setValue]);

  /**
   * Development Helper:
   * Logs form value changes during development
   * Helps track what's changing and when
   */
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      Debug.form('Form value changed:', { name, type, value });
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  /**
   * Form Submission Handler
   * Processes the form data and calls the parent component's update function
   * All validation is handled by Zod schema before this point
   */
  const onSubmit = (data: ProgramSettingsFormData) => {
    console.log('Form submitted:', data);
    onSettingsChange(data);
  };

  // Add state change logging
  useEffect(() => {
    Debug.state('Custom Phase Focus changed:', customPhaseFocus);
  }, [customPhaseFocus]);

  useEffect(() => {
    Debug.state('Show Custom Phase Focus changed:', showCustomPhaseFocus);
  }, [showCustomPhaseFocus]);

  // Add validation logging
  useEffect(() => {
    Debug.validation('Current form errors:', errors);
  }, [errors]);

  return (
    <form className="space-y-6">
      {/* Program Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Program Name
        </label>
        <Controller
          name="name"
          control={control}
          defaultValue={name}
          render={({ field }) => (
            <div>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white dark:bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 dark:text-gray-900 p-2"
                placeholder="Enter program name"
                value={field.value || ''}
                onChange={(e) => {
                  const newValue = e.target.value;
                  field.onChange(newValue);
                  onSettingsChange({ name: newValue });
                }}
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
          defaultValue="GPP"
          render={({ field }) => (
            <div>
              <Select
                {...field}
                options={phaseFocusOptions}
                value={phaseFocusOptions.find(option => 
                  showCustomPhaseFocus ? option.value === 'Other' : option.value === (field.value || 'GPP')
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
          defaultValue="None"
          render={({ field }) => (
            <div>
              <Select
                {...field}
                options={periodizationOptions}
                value={periodizationOptions.find(option => option.value === (field.value || 'None'))}
                onChange={(option) => {
                  const newType = option?.value ?? 'None';
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

      {/* Program Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Program Notes
        </label>
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <div>
              <textarea
                {...field}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white dark:bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 dark:text-gray-900 p-2"
                placeholder="Enter program notes (optional)"
                rows={4}
                onChange={(e) => {
                  field.onChange(e);
                  onSettingsChange({ notes: e.target.value });
                }}
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
              )}
            </div>
          )}
        />
        <p className="mt-1 text-sm text-gray-500">
          Add any additional notes or comments about the program
        </p>
      </div>
    </form>
  );
} 