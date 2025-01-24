'use client';

import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { calculateAllMetrics } from '../utils/calculations';
import { validateMeasurements, type ValidationError } from '../utils/validation';
import type { BodyCompositionEntry, CircumferenceMeasurements, SkinfoldMeasurements } from '../types';

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

type FormInputs = {
  weight: number;
  bodyFatMethod: 'manual' | 'skinfold';
  manualBodyFat: number;
  age: number;
  isMale: boolean;
  skinfold: SkinfoldMeasurements;
  circumference: CircumferenceMeasurements;
};

export default function BodyCompositionInput() {
  const [calculatedMetrics, setCalculatedMetrics] = useState<{
    bodyFatPercentage: number;
    fatMass: number;
    fatFreeMass: number;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const { register, handleSubmit, control, setValue, watch, formState: { errors: formErrors } } = useForm<FormInputs>({
    defaultValues: {
      weight: 0,
      bodyFatMethod: 'manual',
      manualBodyFat: 0,
      age: 0,
      isMale: true,
      skinfold: defaultSkinfoldMeasurements,
      circumference: defaultCircumferenceMeasurements,
    }
  });

  const bodyFatMethod = watch('bodyFatMethod');
  const weight = watch('weight');
  const manualBodyFat = watch('manualBodyFat');

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
    const formValues = watch();
    const errors = validateMeasurements(
      formValues.weight,
      formValues.age,
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
      formValues.age,
      formValues.isMale
    );
    setCalculatedMetrics(metrics);
  };

  const onSubmit = async (data: FormInputs) => {
    console.log('Form submission started');
    
    const errors = validateMeasurements(
      data.weight,
      data.age,
      data.manualBodyFat,
      data.skinfold,
      data.circumference,
      data.bodyFatMethod
    );
    console.log('Validation completed, errors:', errors.map(err => ({
      path: err.path.join('.'),
      message: err.message
    })));

    if (errors.length > 0) {
      console.log('Validation failed with the following errors:', 
        errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n')
      );
      setValidationErrors(errors);
      return;
    }

    console.log('Setting saving state to true');
    setIsSaving(true);
    
    try {
      console.log('Building entry data');
      const entryData = {
        age: data.age,
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
        entryData: entryData
      };

      console.log('Sending payload:', payload);

      try {
        console.log('Starting fetch request');
        const response = await fetch('/api/body-composition', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          credentials: 'include'
        });
        console.log('Fetch request completed');

        console.log('Response status:', response.status);
        
        const responseData = await response.json();
        console.log('Response data:', responseData);

        if (!response.ok) {
          throw new Error(`Failed to save measurements: ${responseData.error || 'Unknown error'}`);
        }

        console.log('Request successful, clearing validation errors');
        setValidationErrors([]);
        alert('Measurements saved successfully!');
        
      } catch (fetchError) {
        console.error('Fetch error:', {
          name: fetchError instanceof Error ? fetchError.name : 'Unknown',
          message: fetchError instanceof Error ? fetchError.message : String(fetchError),
          stack: fetchError instanceof Error ? fetchError.stack : undefined
        });
        throw fetchError; // Re-throw to be caught by outer try-catch
      }
    } catch (error) {
      console.error('Full error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      setValidationErrors([{ 
        path: ['save'], 
        message: error instanceof Error ? error.message : 'Failed to save measurements. Please try again.' 
      }]);
    } finally {
      console.log('Setting saving state to false');
      setIsSaving(false);
    }
  };

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        console.log('Form submit event triggered');
        const formData = watch();
        console.log('Form data:', formData);
        
        // Ensure we have required values
        if (!formData.weight || formData.weight <= 0) {
          console.log('Invalid weight value');
          return;
        }

        if (formData.bodyFatMethod === 'manual' && (!formData.manualBodyFat || formData.manualBodyFat <= 0)) {
          console.log('Invalid manual body fat value');
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
            Body Weight (lbs.)
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
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="bodyFatMethod" className="block text-sm font-medium text-gray-700">
              Measurement Method
            </label>
            <select
              {...register('bodyFatMethod')}
              className="appearance-none w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm dark:text-slate-900 cursor-pointer"
            >
              <option value="manual">Manual Body Fat %</option>
              <option value="skinfold">Skinfold Measurements</option>
            </select>
          </div>

          {bodyFatMethod === 'manual' && (
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

          {bodyFatMethod === 'skinfold' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                    Age
                  </label>
                  <input
                    type="number"
                    {...register('age', { valueAsNumber: true })}
                    className={`w-full rounded-md border ${
                      getErrorForField(['age']) ? 'border-red-500' : 'border-gray-300'
                    } bg-white py-2 px-3 text-sm dark:text-slate-900`}
                  />
                  {getErrorForField(['age']) && (
                    <p className="text-sm text-red-500">{getErrorForField(['age'])}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setValue('isMale', true)}
                      className={`flex-1 py-2 px-4 rounded-md ${
                        watch('isMale')
                          ? 'bg-purple-500 text-white'
                          : 'bg-white border border-gray-300 text-gray-700'
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('isMale', false)}
                      className={`flex-1 py-2 px-4 rounded-md ${
                        !watch('isMale')
                          ? 'bg-purple-500 text-white'
                          : 'bg-white border border-gray-300 text-gray-700'
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>
              </div>

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
      </div>

      <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Circumference Measurements</h2>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(defaultCircumferenceMeasurements).map(([key]) => (
            <div key={key} className="space-y-2">
              <label
                htmlFor={`circumference.${key}`}
                className="block text-sm font-medium text-gray-700"
              >
                {formatMeasurementTitle(key)} (cm)
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
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-md bg-purple-500 hover:bg-purple-600 py-3 px-4 text-white font-semibold disabled:opacity-50"
      >
        {isSaving ? 'Saving...' : 'Save Measurements'}
      </button>
    </form>
  );
} 