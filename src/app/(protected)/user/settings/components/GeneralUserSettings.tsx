import React from 'react';
import { UseFormRegister, Control } from 'react-hook-form';
import type { UserSettings } from '@/app/lib/types/userSettings.zod';
import GarminConnectSettings from './GarminConnectSettings';
  /* import { UseFormRegister, Controller, Control } from 'react-hook-form';
  import type { UserSettings } from '../types/settings'; */

interface GeneralUserSettingsProps {
  register: UseFormRegister<UserSettings>;
  control: Control<UserSettings>;
  watch?: any;
  onGarminUpdate?: () => void;
}

const GeneralUserSettings = ({ register, control, watch, onGarminUpdate }: GeneralUserSettingsProps) => {
  const garminConnect = watch?.('general.garminConnect');
  
  return (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold dark:text-slate-600">General Settings</h2>
    {/* Height Unit */}
    <div>
      <label className="block text-sm font-medium text-gray-700">Height Unit</label>
      <select {...register('general.heightUnit')} className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600">
        <option value="ft_in">Feet & Inches</option>
        <option value="in">Inches</option>
        <option value="cm">Centimeters</option>
      </select>
    </div>
    {/* Weight Unit */}
    <div>
      <label className="block text-sm font-medium text-gray-700">Weight Unit</label>
      <select {...register('general.weightUnit')} className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600">
        <option value="lbs">Pounds (lbs)</option>
        <option value="kgs">Kilograms (kg)</option>
      </select>
    </div>
    {/* Temperature Unit */}
    <div>
      <label className="block text-sm font-medium text-gray-700">Temperature Unit</label>
      <select {...register('general.temperatureUnit')} className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600">
        <option value="F">Fahrenheit (°F)</option>
        <option value="C">Celsius (°C)</option>
      </select>
    </div>
    {/* Time Format */}
    <div>
      <label className="block text-sm font-medium text-gray-700">Time Format</label>
      <select {...register('general.timeFormat')} className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600">
        <option value="12h">12-hour</option>
        <option value="24h">24-hour</option>
      </select>
    </div>
    {/* Date Format */}
    <div>
      <label className="block text-sm font-medium text-gray-700">Date Format</label>
      <select {...register('general.dateFormat')} className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600">
        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
      </select>
    </div>
    {/* Website Functionality Section */}
    <div className="pt-4 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Website Functionality</h3>
      {/* Sidebar Expansion Mode */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Sidebar Expansion (Desktop Only)</label>
        <select {...register('general.sidebarExpandMode')} className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600">
          <option value="hover">Expand on Hover</option>
          <option value="click">Expand on Click</option>
        </select>
      </div>
      {/* Notifications (booleans) */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Notifications</label>
        <div className="mt-2 space-y-2">
          <label className="inline-flex items-center">
            <input type="checkbox" {...register('general.notificationsEmail')} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="ml-2 pr-2 text-sm text-gray-600">Email</span>
          </label>
          <label className="inline-flex items-center">
            <input type="checkbox" {...register('general.notificationsText')} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="ml-2 pr-2 text-sm text-gray-600">Text</span>
          </label>
          <label className="inline-flex items-center">
            <input type="checkbox" {...register('general.notificationsApp')} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="ml-2 pr-2 text-sm text-gray-600">App</span>
          </label>
        </div>
      </div>
    </div>
    
    {/* Garmin Connect Integration */}
    <GarminConnectSettings 
      garminConnect={garminConnect} 
      onUpdate={onGarminUpdate || (() => {})} 
    />
  </div>
  );
};

export default GeneralUserSettings;
