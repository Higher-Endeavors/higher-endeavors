import React, { useState, useEffect } from 'react';
import { UseFormRegister, Control } from 'react-hook-form';
import { signIn } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import type { UserSettings } from '@/app/lib/types/userSettings.zod';
import { syncStravaData, disconnectStravaAccount } from '../lib/actions/stravaActions';
import { setupStravaWebhookSubscription, getStravaWebhookStatus, getEnvironmentMode } from '../lib/actions/stravaWebhookActions';
import { useToast } from '@/app/lib/toast';
import { useStravaConnection } from '@/app/lib/hooks/useStravaConnection';

interface GeneralUserSettingsProps {
  register: UseFormRegister<UserSettings>;
  control: Control<UserSettings>;
}

const GeneralUserSettings = ({ register, control }: GeneralUserSettingsProps) => {
  const { data: session } = useSession();
  const { success, error } = useToast();
  const { status: stravaStatus, isLoading: isLoadingStrava, refreshStatus } = useStravaConnection();
  const [isLoadingStravaAction, setIsLoadingStravaAction] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<{
    active: boolean;
    subscription: any;
  }>({
    active: false,
    subscription: null,
  });
  const [isDevelopment, setIsDevelopment] = useState(false);

  const handleConnectStrava = () => {
    signIn('strava', { 
      callbackUrl: '/user/settings?strava=connected' 
    });
  };

  const checkWebhookStatus = async () => {
    try {
      const result = await getStravaWebhookStatus();
      if (result.success) {
        setWebhookStatus({
          active: !!result.subscription,
          subscription: result.subscription,
        });
      }
    } catch (err) {
      console.error('Error checking webhook status:', err);
    }
  };

  // Check environment mode and webhook status when Strava is connected
  useEffect(() => {
    const checkEnvironment = async () => {
      try {
        const envMode = await getEnvironmentMode();
        setIsDevelopment(envMode.isDevelopment ?? false);
        
        if (stravaStatus.connected && !(envMode.isDevelopment ?? false)) {
          checkWebhookStatus();
        }
      } catch (err) {
        console.error('Error checking environment mode:', err);
      }
    };
    
    checkEnvironment();
  }, [stravaStatus.connected]);

  const handleSyncStrava = async () => {
    setIsLoadingStravaAction(true);
    try {
      const result = await syncStravaData();
      if (result.success) {
        success(result.message);
        // Refresh status after sync
        await refreshStatus();
      } else {
        error(result.message);
      }
    } catch (err) {
      error('Failed to sync Strava data');
    } finally {
      setIsLoadingStravaAction(false);
    }
  };

  const handleSetupWebhook = async () => {
    setIsLoadingStravaAction(true);
    try {
      const result = await setupStravaWebhookSubscription();
      if (result.success) {
        success(result.message);
        await checkWebhookStatus();
      } else {
        error(result.message);
      }
    } catch (err: any) {
      error(err.message || 'Failed to setup webhook');
    } finally {
      setIsLoadingStravaAction(false);
    }
  };

  const handleDisconnectStrava = async () => {
    if (!confirm('Are you sure you want to disconnect your Strava account? This will stop syncing your activities.')) {
      return;
    }

    setIsLoadingStravaAction(true);
    try {
      const result = await disconnectStravaAccount();
      if (result.success) {
        success(result.message);
        // Refresh status after disconnect
        await refreshStatus();
      } else {
        error(result.message);
      }
    } catch (err) {
      error('Failed to disconnect Strava account');
    } finally {
      setIsLoadingStravaAction(false);
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex-shrink-0">
              <img 
                src="/api_logo_pwrdBy_strava_horiz_orange.svg" 
                alt="Strava" 
                className="h-5 sm:h-6 w-auto max-w-[120px] sm:max-w-[150px]"
              />
            </div>
            <p className="text-xs text-gray-500 flex-shrink min-w-0">
              {stravaStatus.connected 
                ? `Connected • ${isDevelopment ? 'Manual sync (dev mode)' : (webhookStatus.active ? 'Auto-sync enabled' : 'Manual sync only')} • Last sync: ${stravaStatus.lastSync ? new Date(stravaStatus.lastSync).toLocaleDateString() : 'Never'}`
                : 'Connect your Strava account to sync activities'
              }
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 sm:flex-nowrap">
            {stravaStatus.connected ? (
              <>
                {!isDevelopment && !webhookStatus.active && (
                  <button
                    type="button"
                    onClick={handleSetupWebhook}
                    disabled={isLoadingStravaAction}
                    className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 disabled:opacity-50"
                  >
                    {isLoadingStravaAction ? 'Setting up...' : 'Enable Auto-sync'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSyncStrava}
                  disabled={isLoadingStravaAction}
                  className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50"
                >
                  {isLoadingStravaAction ? 'Syncing...' : (isDevelopment ? 'Sync Now' : 'Manual Sync')}
                </button>
                <button
                  type="button"
                  onClick={handleDisconnectStrava}
                  disabled={isLoadingStravaAction}
                  className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleConnectStrava}
                className="inline-flex items-center"
              >
                <img 
                  src="/btn_strava_connect_with_white.svg" 
                  alt="Connect with Strava" 
                  className="h-12 w-auto"
                />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  </div>
  );
};

export default GeneralUserSettings;
