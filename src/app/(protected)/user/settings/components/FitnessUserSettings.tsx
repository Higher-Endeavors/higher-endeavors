import React, { useEffect, useState } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import type { UserSettings, FitnessSettings, ResistanceTraining, CardioMetabolic } from '@/app/lib/types/userSettings.zod';

interface EquipmentItem {
  id: string;
  name: string;
}

interface ActivityFamily {
  id: string;
  name: string;
}

interface FitnessUserSettingsProps {
  setValue: UseFormSetValue<UserSettings>;
  fitness: FitnessSettings;
}

// Available CME metrics
const CME_METRICS = [
  'Pace',
  'Speed', 
  'Distance',
  'Duration',
  'Heart Rate',
  'Calories',
  'Cadence',
  'Strokes',
  'Power',
  'Weight'
];

function FitnessUserSettings({ setValue, fitness }: FitnessUserSettingsProps) {
  const [isEquipmentSectionOpen, setIsEquipmentSectionOpen] = useState(false);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(true);
  const [activityFamilies, setActivityFamilies] = useState<ActivityFamily[]>([]);
  const [isLoadingActivityFamilies, setIsLoadingActivityFamilies] = useState(true);
  
  // CME Metrics state
  const [selectedActivityFamily, setSelectedActivityFamily] = useState<string>('');
  const [activeActivityTab, setActiveActivityTab] = useState<string>(() => {
    // Initialize active tab from props using useState initializer
    const initialCMEMetrics = fitness.cardioMetabolic?.cmeMetrics || {};
    const configuredFamilies = Object.keys(initialCMEMetrics);
    return configuredFamilies.length > 0 ? configuredFamilies[0] : '';
  });

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

  useEffect(() => {
    let isMounted = true;
    async function fetchActivityFamilies() {
      setIsLoadingActivityFamilies(true);
      try {
        const res = await fetch('/api/cme-activity-family');
        if (!res.ok) throw new Error('Failed to fetch activity families');
        const data = await res.json();
        if (isMounted) setActivityFamilies(data);
      } catch (err) {
        if (isMounted) setActivityFamilies([]);
      } finally {
        if (isMounted) setIsLoadingActivityFamilies(false);
      }
    }
    fetchActivityFamilies();
    return () => { isMounted = false; };
  }, []);

  // Handler for updating resistanceTraining or cardioMetabolic settings
  const handlePillarSettingChange = <T extends keyof FitnessSettings, K extends keyof NonNullable<FitnessSettings[T]>>(
    section: T,
    key: K,
    value: FitnessSettings[T] extends object ? NonNullable<FitnessSettings[T]>[K] : any
  ) => {
    setValue(`fitness.${section}.${String(key)}` as any, value, { shouldDirty: true });
  };

  // Handler for updating CME metrics for a specific activity family
  const handleCMEMetricChange = (activityFamilyName: string, metricName: string, isChecked: boolean) => {
    const currentCMEMetrics = cardioMetabolic.cmeMetrics || {};
    const currentMetrics = currentCMEMetrics[activityFamilyName] || [];
    
    let updatedMetrics: string[];
    if (isChecked) {
      updatedMetrics = [...currentMetrics, metricName];
    } else {
      updatedMetrics = currentMetrics.filter(metric => metric !== metricName);
    }
    
    const updatedCMEMetrics = {
      ...currentCMEMetrics,
      [activityFamilyName]: updatedMetrics
    };
    
    handlePillarSettingChange('cardioMetabolic', 'cmeMetrics', updatedCMEMetrics);
  };

  // Handler for adding a new activity family
  const handleAddActivityFamily = () => {
    if (selectedActivityFamily && !cardioMetabolic.cmeMetrics?.[selectedActivityFamily]) {
      const currentCMEMetrics = cardioMetabolic.cmeMetrics || {};
      const updatedCMEMetrics = {
        ...currentCMEMetrics,
        [selectedActivityFamily]: []
      };
      
      handlePillarSettingChange('cardioMetabolic', 'cmeMetrics', updatedCMEMetrics);
      setActiveActivityTab(selectedActivityFamily);
      setSelectedActivityFamily('');
    }
  };

  // Handler for removing an activity family
  const handleRemoveActivityFamily = (activityFamilyName: string) => {
    const currentCMEMetrics = cardioMetabolic.cmeMetrics || {};
    const updatedCMEMetrics = { ...currentCMEMetrics };
    delete updatedCMEMetrics[activityFamilyName];
    
    handlePillarSettingChange('cardioMetabolic', 'cmeMetrics', updatedCMEMetrics);
    
    // If we're removing the currently active tab, switch to another available one
    if (activeActivityTab === activityFamilyName) {
      const remainingFamilies = Object.keys(updatedCMEMetrics);
      if (remainingFamilies.length > 0) {
        setActiveActivityTab(remainingFamilies[0]);
      } else {
        setActiveActivityTab('');
      }
    }
  };

  // Use optional chaining and default values
  const resistanceTraining: ResistanceTraining = fitness.resistanceTraining ?? {};
  const cardioMetabolic: CardioMetabolic = fitness.cardioMetabolic ?? {};
  const currentCMEMetrics = cardioMetabolic.cmeMetrics || {};

  return (
    <div>
      <h2 className="text-xl font-semibold dark:text-slate-600">Fitness Settings</h2>
      
      {/* Resistance Training Section */}
      <div className="mt-6 border rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h3 className="text-lg font-medium text-gray-700">Resistance Training</h3>
        </div>
        <div className="p-4 space-y-4">
          {/* Load Units */}
          <div>
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

          {/* Tracking Preferences */}
          <div>
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
          <div className="border rounded-lg overflow-hidden">
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
      </div>

      {/* CardioMetabolic Section */}
      <div className="mt-6 border rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h3 className="text-lg font-medium text-gray-700">CardioMetabolic Endurance</h3>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600">Configure your CME metrics below to customize tracking preferences for each activity family.</p>
        </div>
      </div>
      
      {/* CME Metrics Section */}
      <div className="mt-6 border rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h3 className="text-lg font-medium text-gray-700">CME Metrics</h3>
          <p className="text-sm text-gray-500 mt-1">Select which metrics to track for each activity family</p>
        </div>
        <div className="p-4">
          {/* Add Activity Family */}
          <div className="mb-4">
            <div className="flex space-x-2">
              <select
                value={selectedActivityFamily}
                onChange={(e) => setSelectedActivityFamily(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-600"
              >
                <option value="">Select an activity family...</option>
                {activityFamilies.map(family => (
                  <option key={family.id} value={family.name}>
                    {family.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddActivityFamily}
                disabled={!selectedActivityFamily}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>

          {/* Activity Family Tabs */}
          {Object.keys(currentCMEMetrics).length > 0 && (
            <div className="border-b border-gray-200 mb-4">
              <nav className="flex flex-wrap -mb-px">
                {Object.keys(currentCMEMetrics).map(familyName => (
                  <div key={familyName} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setActiveActivityTab(familyName)}
                      className={`py-2 px-3 text-sm font-medium ${
                        activeActivityTab === familyName
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {familyName}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveActivityFamily(familyName)}
                      className="ml-2 p-1 text-gray-400 hover:text-red-500"
                      title="Remove activity family"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </nav>
            </div>
          )}

          {/* Metrics Configuration for Active Tab */}
          {activeActivityTab && currentCMEMetrics[activeActivityTab] && (
            <div className="border rounded-lg p-3">
              <h4 className="font-medium text-gray-700 mb-3">{activeActivityTab}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                {CME_METRICS.map(metric => {
                  // Skip Strokes metric for activities where it's not relevant
                  if (metric === 'Strokes' && !['Swimming', 'Rowing', 'Watersport'].includes(activeActivityTab)) {
                    return null;
                  }
                  
                  // Skip Weight metric for activities where it's not relevant
                  if (metric === 'Weight' && !['Running', 'Walking'].includes(activeActivityTab)) {
                    return null;
                  }
                  
                  const isChecked = currentCMEMetrics[activeActivityTab].includes(metric);
                  const showUnitSelector = (metric === 'Pace' || metric === 'Speed') && isChecked;
                  const showDistanceUnitSelector = metric === 'Distance' && isChecked;
                  
                  return (
                    <div key={metric} className="flex items-center space-x-3">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => handleCMEMetricChange(activeActivityTab, metric, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">{metric}</span>
                      </label>
                      
                      {/* Unit selector for Pace/Speed */}
                      {showUnitSelector && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Units:</span>
                          <select
                            value={cardioMetabolic.speedUnit || 'mph'}
                            onChange={e => handlePillarSettingChange('cardioMetabolic', 'speedUnit', e.target.value)}
                            className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-600"
                          >
                            {metric === 'Pace' ? (
                              <>
                                <option value="min_mile">min/mile</option>
                                <option value="min_km">min/km</option>
                              </>
                            ) : (
                              <>
                                <option value="mph">mph</option>
                                <option value="kph">kph</option>
                              </>
                            )}
                          </select>
                        </div>
                      )}

                      {/* Unit selector for Distance */}
                      {showDistanceUnitSelector && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Units:</span>
                          <select
                            value={cardioMetabolic.distanceUnit || 'imperial'}
                            onChange={e => handlePillarSettingChange('cardioMetabolic', 'distanceUnit', e.target.value)}
                            className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-600"
                          >
                            <option value="imperial">Imperial (miles, yards)</option>
                            <option value="metric">Metric (km, meters)</option>
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Activity Families Message */}
          {Object.keys(currentCMEMetrics).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No CME activity families configured yet.</p>
              <p className="text-sm mt-1">Add an activity family above to customize metrics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FitnessUserSettings;
