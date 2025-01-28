'use client'

import React, { useState, useEffect } from 'react';
import { useUserSettings } from '@/app/lib/hooks/useUserSettings';
import { Toast } from 'flowbite-react';
import { HiCheck, HiX } from 'react-icons/hi';
import type { NotificationType, CircumferenceMeasurement, BodyFatMethod } from '../types/settings';
import { useRouter } from 'next/navigation';

const SettingsForm = () => {
  const router = useRouter();
  const { settings: dbSettings, updateSettings, isMutating } = useUserSettings();
  const [settings, setSettings] = useState(dbSettings);
  const [activeTab, setActiveTab] = useState('general');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Update local settings when database settings are loaded
  useEffect(() => {
    if (dbSettings) {
      setSettings(dbSettings);
    }
  }, [dbSettings]);

  // Check for unsaved changes
  useEffect(() => {
    if (!dbSettings || !settings) return;
    
    const hasChanges = JSON.stringify(dbSettings) !== JSON.stringify(settings);
    setHasUnsavedChanges(hasChanges);
  }, [settings, dbSettings]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSettingChange = (key: string, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [key]: value,
    });
  };

  const handlePillarSettingChange = (pillar: string, key: string, value: any) => {
    if (!settings) return;
    
    const updatedPillarSettings = {
      ...settings.pillar_settings,
      [pillar]: {
        ...(settings.pillar_settings[pillar] || {}),
        [key]: value,
      },
    };
    
    setSettings({
      ...settings,
      pillar_settings: updatedPillarSettings,
    });
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      await updateSettings(settings);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      setHasUnsavedChanges(false);
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

  if (!settings) {
    return <div>Loading settings...</div>;
  }

  // Initialize pillar settings if they don't exist
  const pillarSettings = settings.pillar_settings || {};
  const lifestyle = pillarSettings.lifestyle || {};
  const health = pillarSettings.health || {};
  const nutrition = pillarSettings.nutrition || {};
  const fitness = pillarSettings.fitness || {};

  // Handler functions for health settings
  const handleBodyFatMethodChange = (value: string, checked: boolean) => {
    const methods = checked
      ? [...(health.bodyFatMethods || []), value]
      : (health.bodyFatMethods || []).filter((method: string) => method !== value);
    handlePillarSettingChange('health', 'bodyFatMethods', methods);
  };

  const handleCircumferenceChange = (measurement: string, checked: boolean) => {
    const measurements = checked
      ? [...(health.circumferenceMeasurements || []), measurement]
      : (health.circumferenceMeasurements || []).filter((m: string) => m !== measurement);
    handlePillarSettingChange('health', 'circumferenceMeasurements', measurements);
  };

  return (
    <div className="bg-gray-50 rounded-lg shadow">
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
      {hasUnsavedChanges && (
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
          <div className="space-y-6">
            <h2 className="text-xl font-semibold dark:text-slate-600">General Settings</h2>
            
            {/* Height Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Height Unit</label>
              <select
                value={settings.height_unit}
                onChange={(e) => handleSettingChange('height_unit', e.target.value)}
                className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600"
              >
                <option value="imperial">Feet & Inches</option>
                <option value="metric">Centimeters</option>
              </select>
            </div>

            {/* Weight Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Weight Unit</label>
              <select
                value={settings.weight_unit}
                onChange={(e) => handleSettingChange('weight_unit', e.target.value)}
                className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600"
              >
                <option value="lbs">Pounds (lbs)</option>
                <option value="kg">Kilograms (kg)</option>
              </select>
            </div>

            {/* Temperature Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Temperature Unit</label>
              <select
                value={settings.temperature_unit}
                onChange={(e) => handleSettingChange('temperature_unit', e.target.value)}
                className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600"
              >
                <option value="F">Fahrenheit (°F)</option>
                <option value="C">Celsius (°C)</option>
              </select>
            </div>

            {/* Time Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Time Format</label>
              <select
                value={settings.time_format}
                onChange={(e) => handleSettingChange('time_format', e.target.value)}
                className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600"
              >
                <option value="12h">12-hour</option>
                <option value="24h">24-hour</option>
              </select>
            </div>

            {/* Date Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Date Format</label>
              <select
                value={settings.date_format}
                onChange={(e) => handleSettingChange('date_format', e.target.value)}
                className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            {/* Notifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Notifications</label>
              <div className="mt-2 space-y-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications_email}
                    onChange={(e) => handleSettingChange('notifications_email', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 pr-2 text-sm text-gray-600">Email</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications_text}
                    onChange={(e) => handleSettingChange('notifications_text', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 pr-2 text-sm text-gray-600">Text</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications_app}
                    onChange={(e) => handleSettingChange('notifications_app', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 pr-2 text-sm text-gray-600">App</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lifestyle' && (
          <div>
            <h2 className="text-xl font-semibold dark:text-slate-600">Lifestyle Settings</h2>
            <p className="mt-4 text-gray-600 italic">Lifestyle Settings Coming Soon.</p>
            {/* Device Integration - Coming Soon
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Device Integration</label>
              <div className="mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={lifestyle.deviceIntegration?.enabled}
                    onChange={(e) => handlePillarSettingChange('lifestyle', 'deviceIntegration', {
                      ...lifestyle.deviceIntegration,
                      enabled: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Enable Device Integration</span>
                </label>
              </div>
            </div>
            */}
          </div>
        )}

        {activeTab === 'health' && (
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
                onChange={(e) => handlePillarSettingChange('health', 'circumferenceUnit', e.target.value)}
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
        )}

        {activeTab === 'nutrition' && (
          <div>
            <h2 className="text-xl font-semibold dark:text-slate-600">Nutrition Settings</h2>
            {/* Food Measurement */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Food Measurement</label>
              <select
                value={nutrition.foodMeasurement}
                onChange={(e) => handlePillarSettingChange('nutrition', 'foodMeasurement', e.target.value)}
                className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600"
              >
                <option value="grams">Grams</option>
                <option value="lbs_oz">Pounds & Ounces</option>
                <option value="oz">Ounces</option>
              </select>
            </div>

            {/* Hydration Unit */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Hydration Unit</label>
              <select
                value={nutrition.hydrationUnit}
                onChange={(e) => handlePillarSettingChange('nutrition', 'hydrationUnit', e.target.value)}
                className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600"
              >
                <option value="oz">Fluid Ounces</option>
                <option value="liters">Liters</option>
                <option value="grams">Grams</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'fitness' && (
          <div>
            <h2 className="text-xl font-semibold dark:text-slate-600">Fitness Settings</h2>
            {/* Resistance Training */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Load Units</label>
              <select
                value={fitness.resistanceTraining?.weightUnit}
                onChange={(e) => handlePillarSettingChange('fitness', 'resistanceTraining', {
                  ...fitness.resistanceTraining,
                  weightUnit: e.target.value
                })}
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
                onChange={(e) => handlePillarSettingChange('fitness', 'cardioMetabolic', {
                  ...fitness.cardioMetabolic,
                  speedUnit: e.target.value
                })}
                className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600"
              >
                <option value="mph">Miles per Hour</option>
                <option value="kph">Kilometers per Hour</option>
                <option value="min_mile">Minutes per Mile</option>
                <option value="min_km">Minutes per Kilometer</option>
              </select>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6">
          <button
            type="button"
            disabled={isMutating || !hasUnsavedChanges}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
              isMutating 
                ? 'bg-purple-400' 
                : !hasUnsavedChanges 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            onClick={handleSaveSettings}
          >
            {isMutating ? 'Saving...' : hasUnsavedChanges ? 'Save Settings' : 'No Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsForm; 