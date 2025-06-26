'use client'

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Toast } from 'flowbite-react';
import { HiCheck, HiX } from 'react-icons/hi';
import type { UserSettings, BodyFatMethod, CircumferenceMeasurement } from '../types/settings';
import { useUserSettings } from '@/app/lib/hooks/useUserSettings';
import { useRouter } from 'next/navigation';
import GeneralUserSettings from './GeneralUserSettings';
import LifestyleUserSettings from './LifestyleUserSettings';
import HealthUserSettings from './HealthUserSettings';
import NutritionUserSettings from './NutritionUserSettings';
import FitnessUserSettings from './FitnessUserSettings';

const SettingsForm = () => {
  const router = useRouter();
  const { settings: dbSettings, updateSettings, isMutating } = useUserSettings();
  const [activeTab, setActiveTab] = useState('general');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { isDirty, dirtyFields },
  } = useForm<UserSettings>({
    mode: 'onChange',
  });

  // Update form values when dbSettings change
  useEffect(() => {
    if (dbSettings) {
      reset(dbSettings as UserSettings);
    }
  }, [dbSettings, reset]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Save handler
  const onSubmit = async (data: UserSettings) => {
    try {
      await updateSettings(data);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      console.error('Error saving settings:', error);
    }
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'lifestyle', label: 'Lifestyle' },
    { id: 'health', label: 'Health' },
    { id: 'nutrition', label: 'Nutrition' },
    { id: 'fitness', label: 'Fitness' },
  ];

  if (!dbSettings) {
    return <div>Loading settings...</div>;
  }

  // Watch pillar_settings for dynamic fields
  const lifestyle = watch('lifestyle') || {};
  const health = watch('health') || {};
  const nutrition = watch('nutrition') || {};
  const fitness = watch('fitness') || {};

  // Handler functions for health settings
  const handleBodyFatMethodChange = (value: string, checked: boolean) => {
    const methods = checked
      ? [...(health.bodyFatMethods || []), value]
      : (health.bodyFatMethods || []).filter((method: string) => method !== value);
    setValue('health.bodyFatMethods', methods as BodyFatMethod[]);
  };

  const handleCircumferenceChange = (measurement: string, checked: boolean) => {
    const measurements = checked
      ? [...(health.circumferenceMeasurements || []), measurement]
      : (health.circumferenceMeasurements || []).filter((m: string) => m !== measurement);
    setValue('health.circumferenceMeasurements', measurements as CircumferenceMeasurement[]);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-50 rounded-lg shadow">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500">
              <HiCheck className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal">Settings updated successfully</div>
          </Toast>
        </div>
      )}
      {/* Error Toast */}
      {showErrorToast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500">
              <HiX className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal">Failed to update settings</div>
          </Toast>
        </div>
      )}
      {/* Unsaved Changes Indicator */}
      {isDirty && (
        <div className="bg-yellow-50 p-4 border-l-4 border-yellow-400">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You have unsaved changes. Don't forget to save your settings!
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex flex-wrap -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-4 sm:px-4 md:px-6 text-xs sm:text-sm font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      {/* Settings Content */}
      <div className="p-6">
        {activeTab === 'general' && (
          <GeneralUserSettings register={register} control={control} />
        )}
        {activeTab === 'lifestyle' && (
          <LifestyleUserSettings register={register} setValue={setValue} watch={watch} />
        )}
        {activeTab === 'health' && (
          <HealthUserSettings setValue={setValue} watch={watch} health={health} />
        )}
        {activeTab === 'nutrition' && (
          <NutritionUserSettings setValue={setValue} nutrition={nutrition} />
        )}
        {activeTab === 'fitness' && (
          <FitnessUserSettings setValue={setValue} fitness={fitness} />
        )}
        {/* Save Button */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={isMutating || !isDirty}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
              isMutating 
                ? 'bg-purple-400' 
                : !isDirty 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {isMutating ? 'Saving...' : isDirty ? 'Save Settings' : 'No Changes'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default SettingsForm; 