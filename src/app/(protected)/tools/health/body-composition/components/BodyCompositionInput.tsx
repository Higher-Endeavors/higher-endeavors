'use client';

import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { calculateAllMetrics } from '../utils/calculations';
import { validateMeasurements, type ValidationError } from '../utils/validation';
import type { BodyCompositionEntry, CircumferenceMeasurements, SkinfoldMeasurements } from '../types';
import { useToast } from '@/app/lib/toast';
import { HiCheck } from 'react-icons/hi';
import type { UserSettings } from '@/app/lib/types/userSettings.zod';
import { clientLogger } from '@/app/lib/logging/logger.client';
// import type { CircumferenceMeasurement } from '../../../../user/settings/types/settings';

interface UserBioData {
  dateOfBirth: string;
  gender: string;
}

const defaultCircumferenceMeasurements: CircumferenceMeasurements = {
  neck: 0,
  shoulders: 0,
  chest: 0,
  waist: 0,
  hips: 0,
  leftBicepRelaxed: 0,
  leftBicepFlexed: 0,
  rightBicepRelaxed: 0,
  rightBicepFlexed: 0,
  leftForearm: 0,
  rightForearm: 0,
  leftThigh: 0,
  rightThigh: 0,
  leftCalf: 0,
  rightCalf: 0,
};

const defaultSkinfoldMeasurements: SkinfoldMeasurements = {
  chest: 0,
  abdomen: 0,
  thigh: 0,
  triceps: 0,
  axilla: 0,
  subscapula: 0,
  suprailiac: 0,
};

const formatMeasurementTitle = (key: string): string => {
  const parts = key.split(/(?=[A-Z])/).filter(Boolean);
  
  if (parts[0].toLowerCase() === 'left' || parts[0].toLowerCase() === 'right') {
    const side = parts.shift()!.toLowerCase();
    const measurement = parts.map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' ');
    return `${measurement} - ${side.charAt(0).toUpperCase() + side.slice(1)}`;
  }
  
  return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' ');
};

const formatUnit = (unit: string | undefined, type: 'weight' | 'circumference'): string => {
  if (type === 'weight') {
    return unit === 'kg' ? 'kg' : 'lbs';
  }
  return unit === 'cm' ? 'cm' : 'in';
};

type FormInputs = {
  weight: number;
  bodyFatMethod: 'manual' | 'skinfold';
  manualBodyFat: number;
  isMale: boolean;
  skinfold: SkinfoldMeasurements;
  circumference: CircumferenceMeasurements;
};

interface BodyCompositionInputProps {
  userId: number;
}

export default function BodyCompositionInput({ userId }: BodyCompositionInputProps) {
  const { success } = useToast();
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [calculatedMetrics, setCalculatedMetrics] = useState<{
    bodyFatPercentage: number;
    fatMass: number;
    fatFreeMass: number;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [bioData, setBioData] = useState<UserBioData | null>(null);
  const [bioError, setBioError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchSettings() {
      try {
        const res = await fetch('/api/user-settings');
        if (!res.ok) throw new Error('Failed to fetch user settings');
        const data = await res.json();
        if (isMounted) setUserSettings(data);
      } catch (error) {
        if (isMounted) setUserSettings(null);
      }
    }
    fetchSettings();
    return () => { isMounted = false; };
  }, []);

  // Fetch user's bio data
  useEffect(() => {
    const fetchBioData = async () => {
      try {
        const response = await fetch('/api/user/bio');
        if (!response.ok) throw new Error('Failed to fetch bio data');
        
        const data = await response.json();
        if (data.date_of_birth && data.gender) {
          setBioData({
            dateOfBirth: data.date_of_birth,
            gender: data.gender
          });
        } else {
          setBioError('Please complete your profile with date of birth and gender information.');
        }
      } catch (error) {
        clientLogger.error('Error loading bio data', error);
        setBioError('Failed to load profile data. Some features may be limited.');
      }
    };

    fetchBioData();
  }, []);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const { 
    register, 
    handleSubmit, 
    control, 
    setValue, 
    watch, 
    reset,
    formState: { errors: formErrors } 
  } = useForm<FormInputs>({
    defaultValues: {
      weight: 0,
      bodyFatMethod: 'manual',
      manualBodyFat: 0,
      isMale: bioData?.gender === 'male',
      skinfold: defaultSkinfoldMeasurements,
      circumference: defaultCircumferenceMeasurements,
    }
  });

  // Update form when bio data is loaded
  useEffect(() => {
    if (bioData) {
      setValue('isMale', bioData.gender === 'male');
    }
  }, [bioData, setValue]);

  const bodyFatMethod = watch('bodyFatMethod');
  const weight = watch('weight');
  const manualBodyFat = watch('manualBodyFat');

  // Get the enabled circumference measurements from user settings
  const enabledCircumferenceMeasurements = Array.isArray(userSettings?.health?.circumferenceMeasurements)
    ? userSettings?.health?.circumferenceMeasurements
    : [];

  // Get units from user settings
  const weightUnit = formatUnit(
    typeof userSettings?.general?.weightUnit === 'string' ? userSettings.general.weightUnit : undefined,
    'weight'
  );
  const circumferenceUnit = formatUnit(
    typeof userSettings?.health?.circumferenceUnit === 'string' ? userSettings.health.circumferenceUnit : undefined,
    'circumference'
  );

  // Get the enabled body fat methods from user settings
  const enabledBodyFatMethods = Array.isArray(userSettings?.health?.bodyFatMethods)
    ? userSettings?.health?.bodyFatMethods
    : [];
  
  // Check if manual entry should be available (if manual or bioelectrical is enabled)
  const showManualEntry = enabledBodyFatMethods.includes('manual') || enabledBodyFatMethods.includes('bioelectrical');

  // Set default body fat method based on available methods
  useEffect(() => {
    if (enabledBodyFatMethods.length > 0) {
      // If manual entry is available, default to it
      if (showManualEntry) {
        setValue('bodyFatMethod', 'manual');
      }
      // Otherwise if skinfold is available, default to it
      else if (enabledBodyFatMethods.includes('skinfold')) {
        setValue('bodyFatMethod', 'skinfold');
      }
    }
  }, [enabledBodyFatMethods, showManualEntry, setValue]);

  // Filter the circumference measurements based on user settings
  const getFilteredCircumferenceMeasurements = () => {
    const measurements: Partial<CircumferenceMeasurements> = {};
    Object.entries(defaultCircumferenceMeasurements).forEach(([key]) => {
      // Handle special case for biceps - show all bicep measurements if biceps is enabled
      if (key.toLowerCase().includes('bicep') && enabledCircumferenceMeasurements.includes('biceps')) {
        measurements[key as keyof CircumferenceMeasurements] = defaultCircumferenceMeasurements[key as keyof CircumferenceMeasurements];
        return;
      }

      // For other measurements, simplify the key and check if it's enabled
      const settingKey = key.toLowerCase()
        .replace(/^(left|right)/, '')  // Remove left/right only from the start
        .replace(/(relaxed|flexed)$/, ''); // Remove relaxed/flexed only from the end
      
        if (enabledCircumferenceMeasurements.includes(settingKey)) {
        // if (enabledCircumferenceMeasurements.includes(settingKey as CircumferenceMeasurement)) {
        measurements[key as keyof CircumferenceMeasurements] = defaultCircumferenceMeasurements[key as keyof CircumferenceMeasurements];
      }
    });
    return measurements;
  };

  // Auto-calculate for manual body fat method
  useEffect(() => {
    if (bodyFatMethod === 'manual' && weight > 0 && manualBodyFat > 0) {
      const fatMass = (weight * manualBodyFat) / 100;
      const fatFreeMass = weight - fatMass;
      setCalculatedMetrics({
        bodyFatPercentage: manualBodyFat,
        fatMass,
        fatFreeMass
      });
    }
  }, [weight, manualBodyFat, bodyFatMethod]);

  const getErrorForField = (fieldPath: string[]): string | undefined => {
    return validationErrors.find(error => 
      error.path.join('.') === fieldPath.join('.')
    )?.message;
  };

  const calculateMetrics = () => {
    if (!bioData) {
      setValidationErrors([{ 
        path: ['bio'], 
        message: 'Please complete your profile with date of birth and gender information.' 
      }]);
      return;
    }

    const formValues = watch();
    const age = calculateAge(bioData.dateOfBirth);
    const errors = validateMeasurements(
      formValues.weight,
      age,
      formValues.manualBodyFat,
      formValues.skinfold,
      formValues.circumference,
      formValues.bodyFatMethod
    );

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    const metrics = calculateAllMetrics(
      formValues.weight,
      formValues.skinfold,
      age,
      bioData.gender === 'male'
    );
    setCalculatedMetrics(metrics);
  };

  const onSubmit = async (data: FormInputs) => {
    clientLogger.info('Form submission started');
    
    const errors = validateMeasurements(
      data.weight,
      bioData ? calculateAge(bioData.dateOfBirth) : 0,
      data.manualBodyFat,
      data.skinfold,
      data.circumference,
      data.bodyFatMethod
    );

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSaving(true);
    
    try {
      const entryData = {
        age: bioData ? calculateAge(bioData.dateOfBirth) : 0,
        isMale: data.isMale,
        bodyFatMethod: data.bodyFatMethod,
        manualBodyFat: data.bodyFatMethod === 'manual' ? data.manualBodyFat : undefined,
        skinfoldMeasurements: data.bodyFatMethod === 'skinfold' ? data.skinfold : undefined,
        circumferenceMeasurements: data.circumference,
        calculatedMetrics: calculatedMetrics
      };

      const payload = {
        weight: data.weight,
        bodyFatPercentage: calculatedMetrics?.bodyFatPercentage || data.manualBodyFat,
        entryData: entryData,
        targetUserId: userId
      };

      const response = await fetch('/api/body-composition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(`Failed to save measurements: ${responseData.error || 'Unknown error'}`);
      }

      setValidationErrors([]);
      
      // Reset form to initial state
      reset({
        weight: 0,
        bodyFatMethod: 'manual',
        manualBodyFat: 0,
        isMale: bioData?.gender === 'male',
        skinfold: defaultSkinfoldMeasurements,
        circumference: defaultCircumferenceMeasurements,
      });
      setCalculatedMetrics(null);
      
      // Show success toast
      success('Measurements saved successfully!');
      
    } catch (error) {
      clientLogger.error('Error saving body composition measurements', error);
      setValidationErrors([{ 
        path: ['save'], 
        message: error instanceof Error ? error.message : 'Failed to save measurements. Please try again.' 
      }]);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative">
      {bioError && (
        <div className="mb-4 p-4 bg-yellow-100 text-yellow-700 rounded-md">
          {bioError}
        </div>
      )}



      <form 
        onSubmit={(e) => {
          e.preventDefault();
          clientLogger.info('Form submit event triggered');
          const formData = watch();
          clientLogger.info('Form data:', { formData });
          
          // Ensure we have required values
          if (!formData.weight || formData.weight <= 0) {
            clientLogger.error('Invalid weight value');
            return;
          }

          if (formData.bodyFatMethod === 'manual' && (!formData.manualBodyFat || formData.manualBodyFat <= 0)) {
            clientLogger.error('Invalid manual body fat value');
            return;
          }

          handleSubmit(onSubmit)(e);
        }} 
        className="space-y-6"
      >
        {validationErrors.some(error => error.path.join('.') === 'save') && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md">
            {getErrorForField(['save'])}
          </div>
        )}

        <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Basic Measurements</h2>
          <div className="space-y-2">
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
              Body Weight ({weightUnit})
            </label>
            <input
              type="number"
              step="0.1"
              {...register('weight', { 
                valueAsNumber: true,
                required: 'Weight is required',
                min: { value: 1, message: 'Weight must be greater than 0' }
              })}
              className={`w-full rounded-md border ${
                getErrorForField(['weight']) || formErrors.weight ? 'border-red-500' : 'border-gray-300'
              } bg-white py-2 px-3 text-sm dark:text-slate-900`}
            />
            {(getErrorForField(['weight']) || formErrors.weight) && (
              <p className="text-sm text-red-500">{getErrorForField(['weight']) || formErrors.weight?.message}</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Body Fat Measurement</h2>
          {enabledBodyFatMethods.length === 0 ? (
            <p className="text-gray-600 italic">No body fat measurement methods selected. Please configure your preferences in the settings.</p>
          ) : (
            <div className="space-y-6">
              {(showManualEntry || enabledBodyFatMethods.includes('skinfold')) && (
                <div className="space-y-2">
                  <label htmlFor="bodyFatMethod" className="block text-sm font-medium text-gray-700">
                    Measurement Method
                  </label>
                  <div className="relative">
                    <select
                      {...register('bodyFatMethod')}
                      className="appearance-none w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm dark:text-slate-900 cursor-pointer"
                    >
                      {showManualEntry && (
                        <option value="manual">Manual Body Fat %</option>
                      )}
                      {enabledBodyFatMethods.includes('skinfold') && (
                        <option value="skinfold">Skinfold Measurements</option>
                      )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {bodyFatMethod === 'manual' && showManualEntry && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="manualBodyFat" className="block text-sm font-medium text-gray-700">
                      Manual Body Fat %
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      {...register('manualBodyFat', { 
                        valueAsNumber: true,
                        validate: (value) => {
                          if (watch('bodyFatMethod') === 'manual') {
                            if (!value) return 'Body fat percentage is required';
                            if (value < 0 || value > 100) return 'Body fat percentage must be between 0 and 100';
                          }
                          return true;
                        }
                      })}
                      className={`w-full rounded-md border ${
                        getErrorForField(['manualBodyFatPercentage']) || formErrors.manualBodyFat ? 'border-red-500' : 'border-gray-300'
                      } bg-white py-2 px-3 text-sm dark:text-slate-900`}
                    />
                    {(getErrorForField(['manualBodyFatPercentage']) || formErrors.manualBodyFat) && (
                      <p className="text-sm text-red-500">
                        {getErrorForField(['manualBodyFatPercentage']) || formErrors.manualBodyFat?.message}
                      </p>
                    )}
                  </div>

                  {calculatedMetrics && (
                    <div className="mt-4 space-y-2 p-4 bg-gray-50 rounded-md">
                      <p className="text-gray-700">Fat Mass: {calculatedMetrics.fatMass.toFixed(2)} lbs.</p>
                      <p className="text-gray-700">Fat Free Mass: {calculatedMetrics.fatFreeMass.toFixed(2)} lbs.</p>
                    </div>
                  )}
                </div>
              )}

              {bodyFatMethod === 'skinfold' && enabledBodyFatMethods.includes('skinfold') && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(defaultSkinfoldMeasurements).map(([key]) => (
                      <div key={key} className="space-y-2">
                        <label
                          htmlFor={`skinfold.${key}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          {formatMeasurementTitle(key)} (mm)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          {...register(`skinfold.${key as keyof SkinfoldMeasurements}`, { valueAsNumber: true })}
                          className={`w-full rounded-md border ${
                            getErrorForField(['skinfold', key]) ? 'border-red-500' : 'border-gray-300'
                          } bg-white py-2 px-3 text-sm dark:text-slate-900`}
                        />
                        {getErrorForField(['skinfold', key]) && (
                          <p className="text-sm text-red-500">{getErrorForField(['skinfold', key])}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={calculateMetrics}
                    className="w-full rounded-md bg-purple-500 hover:bg-purple-600 py-2 px-4 text-white"
                  >
                    Calculate Body Fat
                  </button>

                  {calculatedMetrics && (
                    <div className="mt-4 space-y-2 p-4 bg-gray-50 rounded-md">
                      <p className="text-gray-700">Calculated Body Fat: {calculatedMetrics.bodyFatPercentage.toFixed(2)}%</p>
                      <p className="text-gray-700">Fat Mass: {calculatedMetrics.fatMass.toFixed(2)} lbs.</p>
                      <p className="text-gray-700">Fat Free Mass: {calculatedMetrics.fatFreeMass.toFixed(2)} lbs.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Circumference Measurements</h2>
          {enabledCircumferenceMeasurements.length === 0 ? (
            <p className="text-gray-600 italic">No circumference measurements selected. Please configure your preferences in the settings.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(getFilteredCircumferenceMeasurements()).map(([key]) => (
                <div key={key} className="space-y-2">
                  <label
                    htmlFor={`circumference.${key}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    {formatMeasurementTitle(key)} ({circumferenceUnit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register(`circumference.${key as keyof CircumferenceMeasurements}`, { valueAsNumber: true })}
                    className={`w-full rounded-md border ${
                      getErrorForField(['circumference', key]) ? 'border-red-500' : 'border-gray-300'
                    } bg-white py-2 px-3 text-sm dark:text-slate-900`}
                  />
                  {getErrorForField(['circumference', key]) && (
                    <p className="text-sm text-red-500">{getErrorForField(['circumference', key])}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-md bg-purple-500 hover:bg-purple-600 py-3 px-4 text-white font-semibold disabled:opacity-50 relative"
        >
          {isSaving ? (
            <>
              <span className="opacity-0">Save Measurements</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            </>
          ) : (
            'Save Measurements'
          )}
        </button>
      </form>
    </div>
  );
}