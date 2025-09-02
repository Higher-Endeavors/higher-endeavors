import React, { useState, useEffect } from 'react';
import { UseFormRegister, Control } from 'react-hook-form';
import { signIn } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import type { UserSettings } from '@/app/lib/types/userSettings.zod';
import { getStravaConnectionStatus, syncStravaData, disconnectStravaAccount } from '../lib/actions/stravaActions';
import { useToast } from '@/app/lib/toast';
import StravaDebugViewer from './StravaDebugViewer';

interface GeneralUserSettingsProps {
  register: UseFormRegister<UserSettings>;
  control: Control<UserSettings>;
}

const GeneralUserSettings = ({ register, control }: GeneralUserSettingsProps) => {
  const { data: session } = useSession();
  const { success, error } = useToast();
  const [stravaStatus, setStravaStatus] = useState<{
    connected: boolean;
    lastSync: string | null;
    athleteId: number | null;
  }>({
    connected: false,
    lastSync: null,
    athleteId: null,
  });
  const [isLoadingStrava, setIsLoadingStrava] = useState(false);

  // Check Strava connection status on mount
  useEffect(() => {
    const checkStravaStatus = async () => {
      try {
        const status = await getStravaConnectionStatus();
        setStravaStatus(status);
      } catch (err) {
        console.error('Error checking Strava status:', err);
      }
    };
    checkStravaStatus();
  }, []);

  const handleConnectStrava = () => {
    signIn('strava', { 
      callbackUrl: '/user/settings?strava=connected' 
    });
  };

  const handleSyncStrava = async () => {
    setIsLoadingStrava(true);
    try {
      const result = await syncStravaData();
      if (result.success) {
        success(result.message);
        // Refresh status after sync
        const status = await getStravaConnectionStatus();
        setStravaStatus(status);
      } else {
        error(result.message);
      }
    } catch (err) {
      error('Failed to sync Strava data');
    } finally {
      setIsLoadingStrava(false);
    }
  };

  const handleDisconnectStrava = async () => {
    if (!confirm('Are you sure you want to disconnect your Strava account? This will stop syncing your activities.')) {
      return;
    }

    setIsLoadingStrava(true);
    try {
      const result = await disconnectStravaAccount();
      if (result.success) {
        success(result.message);
        setStravaStatus({
          connected: false,
          lastSync: null,
          athleteId: null,
        });
      } else {
        error(result.message);
      }
    } catch (err) {
      error('Failed to disconnect Strava account');
    } finally {
      setIsLoadingStrava(false);
    }
  };

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

    {/* Third Party Apps Section */}
    <div className="pt-4 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Third Party Apps</h3>
      
      {/* Strava Connection */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Strava</h4>
              <p className="text-xs text-gray-500">
                {stravaStatus.connected 
                  ? `Connected • Last sync: ${stravaStatus.lastSync ? new Date(stravaStatus.lastSync).toLocaleDateString() : 'Never'}`
                  : 'Connect your Strava account to sync activities'
                }
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {stravaStatus.connected ? (
              <>
                <button
                  type="button"
                  onClick={handleSyncStrava}
                  disabled={isLoadingStrava}
                  className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50"
                >
                  {isLoadingStrava ? 'Syncing...' : 'Sync Now'}
                </button>
                <button
                  type="button"
                  onClick={handleDisconnectStrava}
                  disabled={isLoadingStrava}
                  className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleConnectStrava}
                className="px-3 py-1 text-xs font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600"
              >
                Connect
              </button>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Debug Section - Remove this after fixing the issue */}
    {stravaStatus.connected && (
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Debug: Raw Strava Data</h3>
        <StravaDebugViewer />
      </div>
    )}
  </div>
  );
};

export default GeneralUserSettings;
