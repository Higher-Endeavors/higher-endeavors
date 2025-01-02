'use client';

import { useState } from 'react';
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

export default function BodyCompositionInput() {
  const [weight, setWeight] = useState<number>(0);
  const [manualBodyFat, setManualBodyFat] = useState<number>(0);
  const [age, setAge] = useState<number>(0);
  const [isMale, setIsMale] = useState<boolean>(true);
  const [circumference, setCircumference] = useState<CircumferenceMeasurements>(defaultCircumferenceMeasurements);
  const [skinfold, setSkinfold] = useState<SkinfoldMeasurements>(defaultSkinfoldMeasurements);
  const [calculatedMetrics, setCalculatedMetrics] = useState<{
    bodyFatPercentage: number;
    fatMass: number;
    fatFreeMass: number;
  } | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const getErrorForField = (fieldPath: string[]): string | undefined => {
    return errors.find(error => 
      error.path.join('.') === fieldPath.join('.')
    )?.message;
  };

  const handleCircumferenceChange = (key: keyof CircumferenceMeasurements) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setCircumference(prev => ({
      ...prev,
      [key]: value
    }));
    setErrors(prev => prev.filter(error => error.path.join('.') !== `circumference.${key}`));
  };

  const handleSkinfoldChange = (key: keyof SkinfoldMeasurements) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setSkinfold(prev => ({
      ...prev,
      [key]: value
    }));
    setErrors(prev => prev.filter(error => error.path.join('.') !== `skinfold.${key}`));
  };

  const calculateMetrics = () => {
    const validationErrors = validateMeasurements(weight, age, manualBodyFat, skinfold, circumference);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const metrics = calculateAllMetrics(weight, skinfold, age, isMale);
    setCalculatedMetrics(metrics);
  };

  const handleSave = async () => {
    const validationErrors = validateMeasurements(weight, age, manualBodyFat, skinfold, circumference);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);
    try {
      const entry: BodyCompositionEntry = {
        date: new Date(),
        weight,
        manualBodyFatPercentage: manualBodyFat,
        skinfoldMeasurements: skinfold,
        circumferenceMeasurements: circumference,
        calculatedBodyFatPercentage: calculatedMetrics?.bodyFatPercentage,
        fatMass: calculatedMetrics?.fatMass,
        fatFreeMass: calculatedMetrics?.fatFreeMass,
        userId: 'placeholder-user-id', // This will be replaced with actual user ID
      };

      // TODO: Implement API call to save the entry
      console.log('Saving entry:', entry);
      
      setErrors([]);
    } catch (error) {
      setErrors([{ path: ['save'], message: 'Failed to save measurements. Please try again.' }]);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {errors.some(error => error.path.join('.') === 'save') && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          {getErrorForField(['save'])}
        </div>
      )}

      <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Basic Measurements</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
              Body Weight (kg)
            </label>
            <input
              id="weight"
              type="number"
              step="0.1"
              value={weight || ''}
              onChange={(e) => {
                setWeight(parseFloat(e.target.value) || 0);
                setErrors(prev => prev.filter(error => error.path.join('.') !== 'weight'));
              }}
              className={`w-full rounded-md border ${
                getErrorForField(['weight']) ? 'border-red-500' : 'border-gray-300'
              } bg-white py-2 px-3 text-sm`}
            />
            {getErrorForField(['weight']) && (
              <p className="text-sm text-red-500">{getErrorForField(['weight'])}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="manual-bf" className="block text-sm font-medium text-gray-700">
              Manual Body Fat %
            </label>
            <input
              id="manual-bf"
              type="number"
              step="0.1"
              value={manualBodyFat || ''}
              onChange={(e) => {
                setManualBodyFat(parseFloat(e.target.value) || 0);
                setErrors(prev => prev.filter(error => error.path.join('.') !== 'manualBodyFatPercentage'));
              }}
              className={`w-full rounded-md border ${
                getErrorForField(['manualBodyFatPercentage']) ? 'border-red-500' : 'border-gray-300'
              } bg-white py-2 px-3 text-sm`}
            />
            {getErrorForField(['manualBodyFatPercentage']) && (
              <p className="text-sm text-red-500">{getErrorForField(['manualBodyFatPercentage'])}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Skinfold Measurements</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                Age
              </label>
              <input
                id="age"
                type="number"
                value={age || ''}
                onChange={(e) => {
                  setAge(parseInt(e.target.value) || 0);
                  setErrors(prev => prev.filter(error => error.path.join('.') !== 'age'));
                }}
                className={`w-full rounded-md border ${
                  getErrorForField(['age']) ? 'border-red-500' : 'border-gray-300'
                } bg-white py-2 px-3 text-sm`}
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
                  onClick={() => setIsMale(true)}
                  className={`flex-1 py-2 px-4 rounded-md ${
                    isMale
                      ? 'bg-purple-500 text-white'
                      : 'bg-white border border-gray-300 text-gray-700'
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setIsMale(false)}
                  className={`flex-1 py-2 px-4 rounded-md ${
                    !isMale
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
            {Object.entries(skinfold).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <label
                  htmlFor={`skinfold-${key}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)} (mm)
                </label>
                <input
                  id={`skinfold-${key}`}
                  type="number"
                  step="0.1"
                  value={value || ''}
                  onChange={handleSkinfoldChange(key as keyof SkinfoldMeasurements)}
                  className={`w-full rounded-md border ${
                    getErrorForField(['skinfold', key]) ? 'border-red-500' : 'border-gray-300'
                  } bg-white py-2 px-3 text-sm`}
                />
                {getErrorForField(['skinfold', key]) && (
                  <p className="text-sm text-red-500">{getErrorForField(['skinfold', key])}</p>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={calculateMetrics}
            className="w-full rounded-md bg-purple-500 hover:bg-purple-600 py-2 px-4 text-white"
          >
            Calculate Body Fat
          </button>

          {calculatedMetrics && (
            <div className="mt-4 space-y-2 p-4 bg-gray-50 rounded-md">
              <p className="text-gray-700">Calculated Body Fat: {calculatedMetrics.bodyFatPercentage.toFixed(1)}%</p>
              <p className="text-gray-700">Fat Mass: {calculatedMetrics.fatMass.toFixed(1)} kg</p>
              <p className="text-gray-700">Fat Free Mass: {calculatedMetrics.fatFreeMass.toFixed(1)} kg</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Circumference Measurements</h2>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(circumference).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <label
                htmlFor={`circumference-${key}`}
                className="block text-sm font-medium text-gray-700"
              >
                {key.split(/(?=[A-Z])/).join(' ')} (cm)
              </label>
              <input
                id={`circumference-${key}`}
                type="number"
                step="0.1"
                value={value || ''}
                onChange={handleCircumferenceChange(key as keyof CircumferenceMeasurements)}
                className={`w-full rounded-md border ${
                  getErrorForField(['circumference', key]) ? 'border-red-500' : 'border-gray-300'
                } bg-white py-2 px-3 text-sm`}
              />
              {getErrorForField(['circumference', key]) && (
                <p className="text-sm text-red-500">{getErrorForField(['circumference', key])}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full rounded-md bg-purple-500 hover:bg-purple-600 py-3 px-4 text-white font-semibold disabled:opacity-50"
      >
        {isSaving ? 'Saving...' : 'Save Measurements'}
      </button>
    </div>
  );
} 