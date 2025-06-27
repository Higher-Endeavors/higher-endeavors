import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import type { UserSettings } from '@/app/lib/types/userSettings';
  /* import { UseFormRegister, Controller, Control } from 'react-hook-form';
  import type { UserSettings } from '../types/settings'; */

interface GeneralUserSettingsProps {
  register: UseFormRegister<UserSettings>;
  control: Control<UserSettings>;
}

const GeneralUserSettings: React.FC<GeneralUserSettingsProps> = ({ register, control }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold dark:text-slate-600">General Settings</h2>
    {/* Height Unit */}
    <div>
      <label className="block text-sm font-medium text-gray-700">Height Unit</label>
      <select {...register('height_unit')} className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600">Add commentMore actions
        <option value="imperial">Feet & Inches</option>
        <option value="metric">Centimeters</option>
      {/* <select {...register('general.heightUnit')} className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600">
        <option value="ft_in">Feet & Inches</option>
        <option value="in">Inches</option>
        <option value="cm">Centimeters</option> */}
      </select>
    </div>
    {/* Weight Unit */}
    <div>
      <label className="block text-sm font-medium text-gray-700">Weight Unit</label>
      <select {...register('weight_unit')} className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600">
      {/* <select {...register('general.weightUnit')} className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600"> */}
        <option value="lbs">Pounds (lbs)</option>
        <option value="kg">Kilograms (kg)</option>
      </select>
    </div>
    {/* Temperature Unit */}
    <div>
      <label className="block text-sm font-medium text-gray-700">Temperature Unit</label>
      <select {...register('temperature_unit')} className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600"></select>
      {/* <select {...register('general.temperatureUnit')} className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600"> */}
        <option value="F">Fahrenheit (°F)</option>
        <option value="C">Celsius (°C)</option>
      </select>
    </div>
    {/* Time Format */}
    <div>
      <label className="block text-sm font-medium text-gray-700">Time Format</label>
      <select {...register('time_format')} className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600">
      {/* <select {...register('general.timeFormat')} className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600"> */}
        <option value="12h">12-hour</option>
        <option value="24h">24-hour</option>
      </select>
    </div>
    {/* Date Format */}
    <div>
      <label className="block text-sm font-medium text-gray-700">Date Format</label>
      <select {...register('date_format')} className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600">
      {/* <select {...register('general.dateFormat')} className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600"> */}
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
          <input type="checkbox" {...register('notifications_email')} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />Add commentMore actions
          <span className="ml-2 pr-2 text-sm text-gray-600">Email</span>
        </label>
        <label className="inline-flex items-center">
          <input type="checkbox" {...register('notifications_text')} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <span className="ml-2 pr-2 text-sm text-gray-600">Text</span>
        </label>
        <label className="inline-flex items-center">
          <input type="checkbox" {...register('notifications_app')} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <span className="ml-2 pr-2 text-sm text-gray-600">App</span>
        </label>
      </div>
      {/* <label className="block text-sm font-medium text-gray-700">Notifications</label>
      <Controller
        name="general.notifications"
        control={control}
        render={({ field }) => (
          <div className="mt-2 space-y-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={field.value?.includes('email')}
                onChange={e => {
                  const checked = e.target.checked;
                  const newValue = checked
                    ? [...(field.value || []), 'email']
                    : (field.value || []).filter((n: string) => n !== 'email');
                  field.onChange(newValue);
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 pr-2 text-sm text-gray-600">Email</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={field.value?.includes('text')}
                onChange={e => {
                  const checked = e.target.checked;
                  const newValue = checked
                    ? [...(field.value || []), 'text']
                    : (field.value || []).filter((n: string) => n !== 'text');
                  field.onChange(newValue);
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 pr-2 text-sm text-gray-600">Text</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={field.value?.includes('app')}
                onChange={e => {
                  const checked = e.target.checked;
                  const newValue = checked
                    ? [...(field.value || []), 'app']
                    : (field.value || []).filter((n: string) => n !== 'app');
                  field.onChange(newValue);
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 pr-2 text-sm text-gray-600">App</span>
            </label>
          </div>
        )}
      /> */}
    </div>
  </div>
);

export default GeneralUserSettings;
