'use client'

import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { UserSettings, NotificationType, CircumferenceMeasurement, BodyFatMethod } from '../types/settings';

const SettingsForm = () => {
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('general');

  const handleSettingChange = (section: keyof UserSettings, key: string, value: any) => {
    updateSettings({
      [section]: {
        ...settings[section],
        [key]: value,
      },
    });
  };

  const notificationTypes: NotificationType[] = ['email', 'text', 'app'];

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'lifestyle', label: 'Lifestyle' },
    { id: 'health', label: 'Health' },
    { id: 'nutrition', label: 'Nutrition' },
    { id: 'fitness', label: 'Fitness' },
  ];

  return (
    <div className="bg-gray-50 rounded-lg shadow">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-6 text-sm font-medium ${
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
                value={settings.general.heightUnit}
                onChange={(e) => handleSettingChange('general', 'heightUnit', e.target.value)}
                className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600"
              >
                <option value="ft_in">Feet & Inches</option>
                <option value="in">Inches</option>
                <option value="cm">Centimeters</option>
              </select>
            </div>

            {/* Weight Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Weight Unit</label>
              <select
                value={settings.general.weightUnit}
                onChange={(e) => handleSettingChange('general', 'weightUnit', e.target.value)}
                className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600"
              >
                <option value="lbs">Pounds (lbs)</option>
                <option value="kgs">Kilograms (kg)</option>
              </select>
            </div>

            {/* Temperature Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Temperature Unit</label>
              <select
                value={settings.general.temperatureUnit}
                onChange={(e) => handleSettingChange('general', 'temperatureUnit', e.target.value)}
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
                value={settings.general.timeFormat}
                onChange={(e) => handleSettingChange('general', 'timeFormat', e.target.value)}
                className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600"
              >
                <option value="12h">12-hour</option>
                <option value="24h">24-hour</option>
              </select>
            </div>

            {/* Notifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Notifications</label>
              <div className="mt-2 space-y-2">
                {notificationTypes.map((type) => (
                  <label key={type} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.general.notifications.includes(type)}
                      onChange={(e) => {
                        const notifications = e.target.checked
                          ? [...settings.general.notifications, type]
                          : settings.general.notifications.filter((t) => t !== type);
                        handleSettingChange('general', 'notifications', notifications);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 pr-2 text-sm text-gray-600 capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Placeholder sections for other tabs */}
        {activeTab === 'lifestyle' && (
          <div>
            <h2 className="text-xl font-semibold dark:text-slate-600">Lifestyle Settings</h2>
            {/* Device Integration */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Device Integration</label>
              <div className="mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.lifestyle.deviceIntegration.enabled}
                    onChange={(e) => handleSettingChange('lifestyle', 'deviceIntegration', {
                      ...settings.lifestyle.deviceIntegration,
                      enabled: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Enable Device Integration</span>
                </label>
              </div>
            </div>
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
                      checked={settings.health.bodyFatMethods.includes(value as BodyFatMethod)}
                      onChange={(e) => {
                        const methods = e.target.checked
                          ? [...settings.health.bodyFatMethods, value as BodyFatMethod]
                          : settings.health.bodyFatMethods.filter(m => m !== value);
                        handleSettingChange('health', 'bodyFatMethods', methods);
                      }}
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
                value={settings.health.circumferenceUnit}
                onChange={(e) => handleSettingChange('health', 'circumferenceUnit', e.target.value)}
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
                      checked={settings.health.circumferenceMeasurements.includes(measurement as CircumferenceMeasurement)}
                      onChange={(e) => {
                        const measurements = e.target.checked
                          ? [...settings.health.circumferenceMeasurements, measurement as CircumferenceMeasurement]
                          : settings.health.circumferenceMeasurements.filter(m => m !== measurement);
                        handleSettingChange('health', 'circumferenceMeasurements', measurements);
                      }}
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
                value={settings.nutrition.foodMeasurement}
                onChange={(e) => handleSettingChange('nutrition', 'foodMeasurement', e.target.value)}
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
                value={settings.nutrition.hydrationUnit}
                onChange={(e) => handleSettingChange('nutrition', 'hydrationUnit', e.target.value)}
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
                value={settings.fitness.resistanceTraining.weightUnit}
                onChange={(e) => handleSettingChange('fitness', 'resistanceTraining', {
                  ...settings.fitness.resistanceTraining,
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
                value={settings.fitness.cardioMetabolic.speedUnit}
                onChange={(e) => handleSettingChange('fitness', 'cardioMetabolic', {
                  ...settings.fitness.cardioMetabolic,
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
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => {
              // TODO: Implement save to database
              console.log('Saving settings:', settings);
            }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsForm; 