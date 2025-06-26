import React, { useEffect, useState } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import type { UserSettings, FitnessSettings } from '../types/settings';

interface EquipmentItem {
  id: string;
  name: string;
}

interface FitnessUserSettingsProps {
  setValue: UseFormSetValue<UserSettings>;
  fitness: FitnessSettings;
}

function FitnessUserSettings({ setValue, fitness }: FitnessUserSettingsProps) {
  const [isEquipmentSectionOpen, setIsEquipmentSectionOpen] = useState(false);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchEquipment() {
      setIsLoadingEquipment(true);
      try {
        const res = await fetch('/api/equipment');
        if (!res.ok) throw new Error('Failed to fetch equipment');
        const data = await res.json();
        if (isMounted) setEquipment(data);
      } catch (err) {
        if (isMounted) setEquipment([]);
      } finally {
        if (isMounted) setIsLoadingEquipment(false);
      }
    }
    fetchEquipment();
    return () => { isMounted = false; };
  }, []);

  // Handler for updating resistanceTraining settings
  const handlePillarSettingChange = (section: string, key: string, value: any) => {
    setValue(`fitness.${section}.${key}` as any, value, { shouldDirty: true });
  };

  const resistanceTraining = fitness.resistanceTraining || {};
  const cardioMetabolic = fitness.cardioMetabolic || {};

  return (
    <div>
      <h2 className="text-xl font-semibold dark:text-slate-600">Fitness Settings</h2>
      {/* Resistance Training */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">Load Units</label>
        <select
          value={resistanceTraining.loadUnit || 'lbs'}
          onChange={e => handlePillarSettingChange('resistanceTraining', 'loadUnit', e.target.value)}
          className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600"
        >
          <option value="lbs">Pounds (lbs)</option>
          <option value="kg">Kilograms (kg)</option>
        </select>
      </div>
      {/* CardioMetabolic */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">Running Speed Units</label>
        <select
          value={cardioMetabolic.speedUnit || 'mph'}
          onChange={e => handlePillarSettingChange('cardioMetabolic', 'speedUnit', e.target.value)}
          className="mt-1 pl-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600"
        >
          <option value="mph">Miles per Hour (mph)</option>
          <option value="kph">Kilometers per Hour (kph)</option>
          <option value="min_mile">Minutes per Mile</option>
          <option value="min_km">Minutes per Kilometer</option>
        </select>
      </div>
      {/* Tracking Preferences */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Preferences</label>
        <div className="space-y-2 space-x-2">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={!!resistanceTraining.trackRPE}
              onChange={e => handlePillarSettingChange('resistanceTraining', 'trackRPE', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600">Track RPE (Rate of Perceived Exertion)</span>
          </label>
          {resistanceTraining.trackRPE && (
            <div className="ml-6 mt-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">RPE Scale</label>
              <select
                value={resistanceTraining.rpeScale || '0-10'}
                onChange={e => handlePillarSettingChange('resistanceTraining', 'rpeScale', e.target.value)}
                className="pl-2 py-1 block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-slate-600"
              >
                <option value="0-10">0-10</option>
                <option value="6-20">6-20</option>
              </select>
            </div>
          )}
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={!!resistanceTraining.trackRIR}
              onChange={e => handlePillarSettingChange('resistanceTraining', 'trackRIR', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600">Track RIR (Reps in Reserve)</span>
          </label>
        </div>
      </div>
      {/* Available Equipment - Collapsible Section */}
      <div className="mt-6 border rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setIsEquipmentSectionOpen(open => !open)}
          className="w-full px-4 py-2 text-left bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
        >
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Available Equipment</span>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                const currentEquipment = resistanceTraining.availableEquipment || [];
                const allSelected = equipment.length === currentEquipment.length;
                const updatedEquipment = allSelected
                  ? []
                  : equipment.map(item => item.id);
                handlePillarSettingChange('resistanceTraining', 'availableEquipment', updatedEquipment);
              }}
              className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-600"
            >
              {equipment.length === (resistanceTraining.availableEquipment || []).length
                ? 'Deselect All'
                : 'Select All'}
            </button>
          </div>
          <svg
            className={`w-5 h-5 transform transition-transform text-gray-700 dark:text-slate-900 ${isEquipmentSectionOpen ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isEquipmentSectionOpen && (
          <div className="p-4 bg-white">
            {isLoadingEquipment ? (
              <div className="text-sm text-gray-500">Loading equipment...</div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                {equipment.map(item => (
                  <label key={item.id} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={(resistanceTraining.availableEquipment || []).includes(item.id)}
                      onChange={e => {
                        const currentEquipment = resistanceTraining.availableEquipment || [];
                        const updatedEquipment = e.target.checked
                          ? [...currentEquipment, item.id]
                          : currentEquipment.filter((id: string) => id !== item.id);
                        handlePillarSettingChange('resistanceTraining', 'availableEquipment', updatedEquipment);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">{item.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FitnessUserSettings;
