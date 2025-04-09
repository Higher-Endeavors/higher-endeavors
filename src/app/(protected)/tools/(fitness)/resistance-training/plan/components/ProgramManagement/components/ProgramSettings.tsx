'use client';

import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { programSettingsSchema, PhaseFocus, PeriodizationType, progression_rules, phase_focus_type } from '@/app/lib/types/pillars/fitness';
import type { z } from 'zod';

export type ProgramSettingsFormData = z.infer<typeof programSettingsSchema>;

interface ProgramSettingsProps {
  program_name: string;
  phase_focus: phase_focus_type;
  periodization_type: keyof typeof PeriodizationType;
  notes?: string;
  progression_rules?: progression_rules;
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
  program_name,
  phase_focus,
  periodization_type,
  notes,
  progression_rules,
  onSettingsChange
}: ProgramSettingsProps) {
  /**
   * State Management:
   * - customPhaseFocus: Handles custom training focus input
   * - showCustomPhaseFocus: Controls visibility of custom focus input field
   */
  const [customPhaseFocus, setCustomPhaseFocus] = useState<string>('');
  const [showCustomPhaseFocus, setShowCustomPhaseFocus] = useState(
    !phaseFocusOptions.find(option => option.value === phase_focus)
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
      name: program_name,
      phase_focus: phase_focus || 'GPP',
      periodization_type: periodization_type || 'None',
      notes: notes || '',
      progression_rules: {
        type: progression_rules?.type || 'None',
        settings: {
          volume_increment_percentage: progression_rules?.settings?.volume_increment_percentage ?? 5,
          load_increment_percentage: progression_rules?.settings?.load_increment_percentage ?? 2.5,
          program_length: progression_rules?.settings?.program_length ?? 4,
          weekly_volume_percentages: progression_rules?.settings?.weekly_volume_percentages ?? [100, 80, 90, 60]
        }
      }
    }
  });

  /**
   * Watch specific form fields for changes
   * - current_periodization_type: Used to show/hide progression settings
   * - program_length: Used to adjust weekly volume percentages
   */
  const current_periodization_type = watch('periodization_type') as keyof typeof PeriodizationType;
  const program_length = watch('progression_rules.settings.program_length') as number;

  /**
   * Automatically update weekly volume percentages when switching to Undulating periodization
   * Only triggers when explicitly changing to Undulating from a different type
   * Default pattern: Week 1 (100%), Week 2 (80%), Week 3 (90%), Week 4 (60%)
   */

  /**
   * Form Submission Handler
   * Processes the form data and calls the parent component's update function
   * All validation is handled by Zod schema before this point
   */
  const onSubmit = (data: ProgramSettingsFormData) => {
    onSettingsChange(data);
  };

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
          name="phase_focus"
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
                    setCustomPhaseFocus(field.value as string);
                  } else {
                    setShowCustomPhaseFocus(false);
                    field.onChange(option?.value);
                    onSettingsChange({ phase_focus: option?.value as phase_focus_type });
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
                    const value = e.target.value;
                    setCustomPhaseFocus(value);
                    field.onChange(value);
                    onSettingsChange({ phase_focus: value as phase_focus_type });
                  }}
                  placeholder="Enter custom phase/focus"
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-900"
                />
              )}
              {errors.phase_focus && (
                <p className="mt-1 text-sm text-red-600">{errors.phase_focus.message}</p>
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
          name="periodization_type"
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
                  const currentSettings = watch('progression_rules.settings');
                  onSettingsChange({
                    periodization_type: newType,
                    progression_rules: {
                      type: newType,
                      settings: {
                        ...currentSettings,
                        // Only override settings if explicitly switching to Undulating
                        ...(newType === 'Undulating' && field.value !== 'Undulating' ? {
                          weekly_volume_percentages: [100, 80, 90, 60]
                        } : {})
                      }
                    }
                  });
                }}
                className="basic-single dark:text-slate-700"
                classNamePrefix="select"
                styles={customSelectStyles}
              />
              {errors.periodization_type && (
                <p className="mt-1 text-sm text-red-600">{errors.periodization_type.message}</p>
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
          name="progression_rules.settings.program_length"
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
                    progression_rules: {
                      type: current_periodization_type,
                      settings: {
                        program_length: value === '' ? 4 : Number(value)
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
                      progression_rules: {
                        type: current_periodization_type,
                        settings: {
                          program_length: defaultValue
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
              {errors.progression_rules?.settings?.program_length && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.progression_rules.settings.program_length.message}
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
      {current_periodization_type === 'Linear' && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700">Linear Progression Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Volume Increment (%)
              </label>
              <Controller
                name="progression_rules.settings.volume_increment_percentage"
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
                            progression_rules: {
                              type: current_periodization_type,
                              settings: {
                                volume_increment_percentage: Number(value)
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
                            progression_rules: {
                              type: current_periodization_type,
                              settings: {
                                volume_increment_percentage: defaultValue
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
                    {errors.progression_rules?.settings?.volume_increment_percentage && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.progression_rules.settings.volume_increment_percentage.message}
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
                name="progression_rules.settings.load_increment_percentage"
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
                            progression_rules: {
                              type: current_periodization_type,
                              settings: {
                                load_increment_percentage: Number(value)
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
                            progression_rules: {
                              type: current_periodization_type,
                              settings: {
                                load_increment_percentage: defaultValue
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
                    {errors.progression_rules?.settings?.load_increment_percentage && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.progression_rules.settings.load_increment_percentage.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      )}

      {current_periodization_type === 'Undulating' && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700">Undulating Progression Settings</h3>
          <Controller
            name="progression_rules.settings.weekly_volume_percentages"
            control={control}
            defaultValue={[100, 80, 90, 60]}
            render={({ field }) => {
              const program_length = watch('progression_rules.settings.program_length') || 4;
              // Ensure we have enough values for all weeks
              const currentValues = [...(field.value || [])];
              while (currentValues.length < program_length) {
                currentValues.push(100);
              }
              
              return (
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: program_length }, (_, index) => (
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
                            progression_rules: {
                              type: current_periodization_type,
                              settings: {
                                weekly_volume_percentages: newValue
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