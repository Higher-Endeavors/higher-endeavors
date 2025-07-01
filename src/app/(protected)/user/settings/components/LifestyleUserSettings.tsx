import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import type { UserSettings } from '@/app/lib/types/userSettings.zod';
// import type { UserSettings } from '../types/settings';

interface LifestyleUserSettingsProps {
  register: UseFormRegister<UserSettings>;
  setValue: UseFormSetValue<UserSettings>;
  watch: UseFormWatch<UserSettings>;
}

const LifestyleUserSettings: React.FC<LifestyleUserSettingsProps> = () => (
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
            // checked={lifestyle.deviceIntegration?.enabled}
            onChange={(e) => setValue('pillar_settings.lifestyle.deviceIntegration.enabled', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-600">Enable Device Integration</span>
        </label>
      </div>
    </div>
    */}
  </div>
);

export default LifestyleUserSettings;
