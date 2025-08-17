'use client';

import React, { useState, useEffect } from 'react';
import { Toast } from 'flowbite-react';
import { HiCheck, HiX } from 'react-icons/hi';
import { saveHeartRateZones, deleteHeartRateZones, type HeartRateZoneData } from '../lib/actions/saveHeartRateZones';

interface HeartRateZone {
  id: number;
  name: string;
  description: string;
  minBpm: number;
  maxBpm: number;
  color: string;
}

interface ActivityZones {
  [activity: string]: HeartRateZone[];
}

interface HeartRateZonesProps {
  onZonesChange?: (zones: HeartRateZone[]) => void;
  initialZones?: HeartRateZone[];
  userAge?: number;
  initialHeartRateZones?: HeartRateZoneData[] | null;
  isLoading?: boolean;
  preferredCalculationMethod?: CalculationMethod;
}

type CalculationMethod = 'age' | 'manual' | 'karvonen' | 'custom';

const defaultZones: HeartRateZone[] = [
  {
    id: 1,
    name: 'Zone 1 - Active Recovery',
    description: 'Very light intensity, active recovery',
    minBpm: 0,
    maxBpm: 0,
    color: 'bg-blue-100 border-blue-300'
  },
  {
    id: 2,
    name: 'Zone 2 - Aerobic Base',
    description: 'Light intensity, aerobic base building',
    minBpm: 0,
    maxBpm: 0,
    color: 'bg-green-100 border-green-300'
  },
  {
    id: 3,
    name: 'Zone 3 - Aerobic Threshold',
    description: 'Moderate intensity, aerobic threshold',
    minBpm: 0,
    maxBpm: 0,
    color: 'bg-yellow-100 border-yellow-300'
  },
  {
    id: 4,
    name: 'Zone 4 - Lactate Threshold',
    description: 'High intensity, lactate threshold',
    minBpm: 0,
    maxBpm: 0,
    color: 'bg-orange-100 border-orange-300'
  },
  {
    id: 5,
    name: 'Zone 5 - Anaerobic',
    description: 'Maximum intensity, anaerobic capacity',
    minBpm: 0,
    maxBpm: 0,
    color: 'bg-red-100 border-red-300'
  }
];

const activityOptions = [
  { value: 'general', label: 'General' },
  { value: 'running', label: 'Running' },
  { value: 'cycling', label: 'Cycling' },
  { value: 'swimming', label: 'Swimming' },
  { value: 'rowing', label: 'Rowing' },
];

export default function HeartRateZones({ 
  onZonesChange, 
  initialZones, 
  userAge, 
  initialHeartRateZones, 
  isLoading = false,
  preferredCalculationMethod 
}: HeartRateZonesProps) {
  const [zones, setZones] = useState<HeartRateZone[]>(initialZones || defaultZones);
  const [calculationMethod, setCalculationMethod] = useState<CalculationMethod>(preferredCalculationMethod || 'age');
  const [maxHeartRate, setMaxHeartRate] = useState<number>(0);
  const [restingHeartRate, setRestingHeartRate] = useState<number>(0);
  const [customMaxHR, setCustomMaxHR] = useState<number>(0);
  
  // Multi-activity custom zones
  const [enableMultiActivity, setEnableMultiActivity] = useState<boolean>(false);
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [activityZones, setActivityZones] = useState<ActivityZones>({});
  const [activeActivityTab, setActiveActivityTab] = useState<string>('general');

  // UI state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [showErrorToast, setShowErrorToast] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Initialize zones and other data from props when they become available
  React.useEffect(() => {
    if (initialHeartRateZones && initialHeartRateZones.length > 0) {
      // Find any zones data to get the calculation method and other values
      const anyZones = initialHeartRateZones[0];
      
      if (anyZones) {
        // Set the calculation method from the data
        setCalculationMethod(anyZones.calculationMethod);
        setMaxHeartRate(anyZones.maxHeartRate || 0);
        setRestingHeartRate(anyZones.restingHeartRate || 0);
        
        // For manual method, set customMaxHR
        if (anyZones.calculationMethod === 'manual' && anyZones.maxHeartRate) {
          setCustomMaxHR(anyZones.maxHeartRate);
        }
      }

      // Handle zones data - user might have general zones or only activity-specific zones
      const generalZones = initialHeartRateZones.find(d => d.activityType === 'general');
      if (generalZones && generalZones.zones) {
        setZones(generalZones.zones);
      }

      // Set activity-specific zones
      const activityData: ActivityZones = {};
      initialHeartRateZones.forEach(item => {
        if (item.activityType !== 'general') {
          activityData[item.activityType] = item.zones;
        }
      });
      setActivityZones(activityData);

      // Enable multi-activity if there are activity-specific zones
      if (Object.keys(activityData).length > 0) {
        setEnableMultiActivity(true);
        
        // Set the first activity as active (no more automatic 'general' tab)
        const firstActivity = Object.keys(activityData)[0];
        setActiveActivityTab(firstActivity);
      } else if (generalZones && generalZones.zones && generalZones.zones.some(zone => zone.minBpm > 0)) {
        // Only set general as active if we actually have general zones with data
        setActiveActivityTab('general');
      }
    }
  }, [initialHeartRateZones]);

  const saveZonesToDatabase = async (activityType: string = 'general') => {
    try {
      setIsSaving(true);
      setShowErrorToast(false);
      setShowSuccessToast(false);

      const zonesToSave = activityType === 'general' ? zones : activityZones[activityType];
      if (!zonesToSave) return;

      const zoneData: HeartRateZoneData = {
        calculationMethod,
        activityType: activityType as any,
        zones: zonesToSave,
        maxHeartRate: maxHeartRate > 0 ? maxHeartRate : undefined,
        restingHeartRate: restingHeartRate > 0 ? restingHeartRate : undefined
      };

      const result = await saveHeartRateZones(zoneData);
      
      if (result.success) {
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      } else {
        setErrorMessage(result.error || 'Failed to save heart rate zones');
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 3000);
      }
    } catch (error) {
      console.error('Error saving heart rate zones:', error);
      setErrorMessage('An unexpected error occurred while saving');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleZoneChange = (zoneId: number, field: 'minBpm' | 'maxBpm', value: number, activity: string = 'general') => {
    if (activity === 'general') {
      const updatedZones = zones.map(zone => 
        zone.id === zoneId ? { ...zone, [field]: value } : zone
      );
      setZones(updatedZones);
      
      if (onZonesChange) {
        onZonesChange(updatedZones);
      }
    } else {
      const currentActivityZones = activityZones[activity] || [...defaultZones];
      const updatedActivityZones = currentActivityZones.map(zone => 
        zone.id === zoneId ? { ...zone, [field]: value } : zone
      );
      
      setActivityZones(prev => ({
        ...prev,
        [activity]: updatedActivityZones
      }));
    }
  };

  const calculateZonesFromMaxHR = (maxHR: number) => {
    if (maxHR <= 0) return;
    
    const calculatedZones = zones.map(zone => {
      let minBpm = 0;
      let maxBpm = 0;
      
      switch (zone.id) {
        case 1:
          minBpm = Math.round(maxHR * 0.5);
          maxBpm = Math.round(maxHR * 0.6);
          break;
        case 2:
          minBpm = Math.round(maxHR * 0.6);
          maxBpm = Math.round(maxHR * 0.7);
          break;
        case 3:
          minBpm = Math.round(maxHR * 0.7);
          maxBpm = Math.round(maxHR * 0.8);
          break;
        case 4:
          minBpm = Math.round(maxHR * 0.8);
          maxBpm = Math.round(maxHR * 0.9);
          break;
        case 5:
          minBpm = Math.round(maxHR * 0.9);
          maxBpm = maxHR;
          break;
      }
      
      return { ...zone, minBpm, maxBpm };
    });
    
    setZones(calculatedZones);
    
    if (onZonesChange) {
      onZonesChange(calculatedZones);
    }
  };

  const calculateZonesFromKarvonen = (maxHR: number, restingHR: number) => {
    if (maxHR <= 0 || restingHR <= 0) return;
    
    // Calculate Heart Rate Reserve
    const hrReserve = maxHR - restingHR;
    
    const calculatedZones = zones.map(zone => {
      let minBpm = 0;
      let maxBpm = 0;
      
      switch (zone.id) {
        case 1:
          minBpm = Math.round(hrReserve * 0.5 + restingHR);
          maxBpm = Math.round(hrReserve * 0.6 + restingHR);
          break;
        case 2:
          minBpm = Math.round(hrReserve * 0.6 + restingHR);
          maxBpm = Math.round(hrReserve * 0.7 + restingHR);
          break;
        case 3:
          minBpm = Math.round(hrReserve * 0.7 + restingHR);
          maxBpm = Math.round(hrReserve * 0.8 + restingHR);
          break;
        case 4:
          minBpm = Math.round(hrReserve * 0.8 + restingHR);
          maxBpm = Math.round(hrReserve * 0.9 + restingHR);
          break;
        case 5:
          minBpm = Math.round(hrReserve * 0.9 + restingHR);
          maxBpm = maxHR;
          break;
      }
      
      return { ...zone, minBpm, maxBpm };
    });
    
    setZones(calculatedZones);
    
    if (onZonesChange) {
      onZonesChange(calculatedZones);
    }
  };

  const calculateMaxHRFromAge = () => {
    if (!userAge || userAge <= 0) return;
    const calculatedMaxHR = 220 - userAge;
    setMaxHeartRate(calculatedMaxHR);
    calculateZonesFromMaxHR(calculatedMaxHR);
  };

  const calculateMaxHRKarvonen = () => {
    if (!userAge || userAge <= 0 || restingHeartRate <= 0) return;
    const calculatedMaxHR = 220 - userAge;
    setMaxHeartRate(calculatedMaxHR);
    calculateZonesFromKarvonen(calculatedMaxHR, restingHeartRate);
  };

  const calculateFromCustomMaxHR = () => {
    if (customMaxHR <= 0) return;
    setMaxHeartRate(customMaxHR);
    calculateZonesFromMaxHR(customMaxHR);
  };

  const handleCalculationMethodChange = (method: CalculationMethod) => {
    setCalculationMethod(method);
    // Reset values when changing methods
    setMaxHeartRate(0);
    setRestingHeartRate(0);
    setCustomMaxHR(0);
    
    // Reset zones
    const resetZones = zones.map(zone => ({ ...zone, minBpm: 0, maxBpm: 0 }));
    setZones(resetZones);
    
    if (onZonesChange) {
      onZonesChange(resetZones);
    }
  };

  const handleAddActivity = () => {
    if (selectedActivity && !activityZones[selectedActivity]) {
      setActivityZones(prev => ({
        ...prev,
        [selectedActivity]: [...defaultZones]
      }));
      setActiveActivityTab(selectedActivity);
      setSelectedActivity('');
    }
  };

  const handleRemoveActivity = async (activity: string) => {
    try {
      const result = await deleteHeartRateZones(activity);
      if (result.success) {
        const newActivityZones = { ...activityZones };
        delete newActivityZones[activity];
        setActivityZones(newActivityZones);
        
        // If we're removing the currently active tab, switch to another available one
        if (activeActivityTab === activity) {
          const remainingActivities = Object.keys(newActivityZones);
          if (remainingActivities.length > 0) {
            setActiveActivityTab(remainingActivities[0]);
          } else {
            // If no activities left, check if we have general zones, otherwise stay on 'general' with empty zones
            setActiveActivityTab('general');
          }
        }
      } else {
        setErrorMessage(result.error || 'Failed to delete activity zones');
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 3000);
      }
    } catch (error) {
      console.error('Error deleting activity zones:', error);
      setErrorMessage('Failed to delete activity zones');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    }
  };

  const getCurrentZones = () => {
    if (activeActivityTab === 'general') {
      // Check if we have general zones with actual data
      if (zones.some(zone => zone.minBpm > 0)) {
        return zones;
      }
      // If no general zones exist, return default zones
      return [...defaultZones];
    }
    return activityZones[activeActivityTab] || [...defaultZones];
  };

  const renderCalculationInputs = () => {
    switch (calculationMethod) {
      case 'age':
        return (
          <div>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">
                <strong>Age:</strong> {userAge ? `${userAge} years old` : 'Not available'}
              </p>
            </div>
            <button
              type="button"
              onClick={calculateMaxHRFromAge}
              disabled={!userAge || userAge <= 0}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Calculate from Age
            </button>
            {maxHeartRate > 0 && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                <span className="font-medium text-gray-600">Calculated Max HR: </span>
                <span className="text-gray-600">{maxHeartRate} BPM</span>
              </div>
            )}
          </div>
        );

      case 'karvonen':
        return (
          <div className="space-y-4">
            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600">
                <strong>Age:</strong> {userAge ? `${userAge} years old` : 'Not available'}
              </p>
            </div>
            <div>
              <label htmlFor="restingHR" className="block mb-1 text-sm font-medium text-gray-600">
                Resting Heart Rate (BPM)
              </label>
              <input
                type="number"
                id="restingHR"
                value={restingHeartRate || ''}
                onChange={(e) => setRestingHeartRate(Number(e.target.value))}
                placeholder="Enter resting HR"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
              />
            </div>
            <button
              type="button"
              onClick={calculateMaxHRKarvonen}
              disabled={!userAge || userAge <= 0 || restingHeartRate <= 0}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Calculate
            </button>
            {maxHeartRate > 0 && (
              <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                <span className="font-medium text-gray-600">Calculated Max HR: </span>
                <span className="text-gray-700">{maxHeartRate} BPM</span>
              </div>
            )}
          </div>
        );

      case 'manual':
        return (
          <div>
            <label htmlFor="customMaxHR" className="block mb-1 text-sm font-medium text-gray-600">
              Max Heart Rate (BPM)
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                id="customMaxHR"
                value={customMaxHR || ''}
                onChange={(e) => setCustomMaxHR(Number(e.target.value))}
                placeholder="Enter max HR"
                className="flex-1 px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
              />
              <button
                type="button"
                onClick={calculateFromCustomMaxHR}
                disabled={customMaxHR <= 0}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Calculate
              </button>
            </div>
            {maxHeartRate > 0 && (
              <div className="mt-2 p-2 bg-purple-50 rounded text-sm">
                <span className="font-medium text-gray-600">Max HR Set: </span>
                <span className="text-gray-600">{maxHeartRate} BPM</span>
              </div>
            )}
          </div>
        );

      case 'custom':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-600">
                <strong>Custom Mode:</strong> Manually set each zone's heart rate ranges below. 
                This allows you to input your own specific values or use values from fitness testing.
              </p>
            </div>
            
            {/* Multi-activity checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableMultiActivity"
                checked={enableMultiActivity}
                onChange={(e) => setEnableMultiActivity(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="enableMultiActivity" className="text-sm font-medium text-gray-600">
                Customize HR Zones for Different Activities
              </label>
            </div>
            
            {/* Activity selection */}
            {enableMultiActivity && (
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <select
                    value={selectedActivity}
                    onChange={(e) => setSelectedActivity(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                  >
                    <option value="">Select an activity...</option>
                    {activityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddActivity}
                    disabled={!selectedActivity}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                
                {/* Activity tabs */}
                {Object.keys(activityZones).length > 0 && (
                  <div className="border-b border-gray-200">
                    <nav className="flex flex-wrap -mb-px">
                      {/* Only show General tab if we have general zones or if no other activities exist */}
                      {(zones.some(zone => zone.minBpm > 0) || Object.keys(activityZones).length === 0) && (
                        <button
                          type="button"
                          onClick={() => setActiveActivityTab('general')}
                          className={`py-2 px-3 text-sm font-medium ${
                            activeActivityTab === 'general'
                              ? 'border-b-2 border-purple-500 text-purple-600'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          General
                        </button>
                      )}
                      {Object.keys(activityZones).map(activity => (
                        <div key={activity} className="flex items-center">
                          <button
                            type="button"
                            onClick={() => setActiveActivityTab(activity)}
                            className={`py-2 px-3 text-sm font-medium ${
                              activeActivityTab === activity
                                ? 'border-b-2 border-purple-500 text-purple-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            {activityOptions.find(opt => opt.value === activity)?.label}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveActivity(activity)}
                            className="ml-2 p-1 text-gray-400 hover:text-red-500"
                            title="Remove activity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </nav>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const currentZones = getCurrentZones();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-600">Heart Rate Zones</h2>
      
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500">
              <HiCheck className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal">Heart rate zones saved successfully</div>
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
            <div className="ml-3 text-sm font-normal">{errorMessage}</div>
          </Toast>
        </div>
      )}
      
      {/* Calculation Method Selection */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <h3 className="text-lg font-medium text-gray-600">Calculation Method</h3>
        
        <div>
          <label htmlFor="calculationMethod" className="block mb-2 text-sm font-medium text-gray-600">
            Select how you want to calculate your heart rate zones:
          </label>
          <select
            id="calculationMethod"
            value={calculationMethod}
            onChange={(e) => handleCalculationMethodChange(e.target.value as CalculationMethod)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
          >
            <option value="age">Age-based (220 - age formula)</option>
            <option value="karvonen">Karvonen Method (HR Reserve + Resting HR)</option>
            <option value="manual">Max HR (BPM)</option>
            <option value="custom">Custom Zone Ranges</option>
          </select>
          
          {/* Auto-load indicator */}
          {maxHeartRate > 0 && (
            <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>✓ Auto-loaded:</strong> Your {calculationMethod === 'age' ? 'age-based' : 
                  calculationMethod === 'karvonen' ? 'Karvonen method' : 
                  calculationMethod === 'manual' ? 'manual max HR' : 'custom'} zones have been loaded.
                {maxHeartRate > 0 && ` Max HR: ${maxHeartRate} BPM`}
                {restingHeartRate > 0 && ` Resting HR: ${restingHeartRate} BPM`}
                {Object.keys(activityZones).length > 0 && (
                  <span> Activity zones: {Object.keys(activityZones).map(activity => 
                    activityOptions.find(opt => opt.value === activity)?.label || activity
                  ).join(', ')}</span>
                )}
              </p>
            </div>
          )}
          
          {/* Show when preferred method is loaded */}
          {preferredCalculationMethod && preferredCalculationMethod !== 'age' && (
            <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>✓ Method loaded:</strong> Your preferred calculation method ({preferredCalculationMethod}) has been automatically selected.
              </p>
            </div>
          )}
        </div>

        {/* Dynamic Input Fields */}
        <div className="mt-4">
          {renderCalculationInputs()}
        </div>
      </div>

      {/* Zones Display and Editing */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-600">
            Zone Configuration
            {activeActivityTab !== 'general' && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                - {activityOptions.find(opt => opt.value === activeActivityTab)?.label}
              </span>
            )}
          </h3>
          
          {/* Save Button */}
          <button
            type="button"
            onClick={() => saveZonesToDatabase(activeActivityTab)}
            disabled={isSaving}
            className={`px-4 py-2 text-sm font-medium rounded-md text-white ${
              isSaving 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700'
            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
          >
            {isSaving ? 'Saving...' : 'Save Zones'}
          </button>
        </div>
        
        {currentZones.map((zone) => (
          <div
            key={zone.id}
            className={`p-4 border-2 rounded-lg ${zone.color}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-600">{zone.name}</h4>
                <p className="text-sm text-gray-600">{zone.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor={`min-${zone.id}`} className="block mb-1 text-sm font-medium text-gray-600">
                  Min BPM
                </label>
                <input
                  type="number"
                  id={`min-${zone.id}`}
                  value={zone.minBpm || ''}
                  onChange={(e) => handleZoneChange(zone.id, 'minBpm', Number(e.target.value), activeActivityTab)}
                  placeholder="Min BPM"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                />
              </div>
              
              <div>
                <label htmlFor={`max-${zone.id}`} className="block mb-1 text-sm font-medium text-gray-600">
                  Max BPM
                </label>
                <input
                  type="number"
                  id={`max-${zone.id}`}
                  value={zone.maxBpm || ''}
                  placeholder="Max BPM"
                  onChange={(e) => handleZoneChange(zone.id, 'maxBpm', Number(e.target.value), activeActivityTab)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                />
              </div>
            </div>
            
            {zone.minBpm > 0 && zone.maxBpm > 0 && (
              <div className="mt-3 p-2 bg-white rounded border text-sm">
                <span className="font-medium text-gray-600">Range: </span>
                <span className="text-gray-600">
                  {zone.minBpm} - {zone.maxBpm} BPM
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          Zone Summary
          {activeActivityTab !== 'general' && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              - {activityOptions.find(opt => opt.value === activeActivityTab)?.label}
            </span>
          )}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-sm">
          {currentZones.map((zone) => (
            <div key={zone.id} className="text-center">
              <div className={`w-full h-3 rounded-t ${zone.color.split(' ')[0]} border-t border-l border-r ${zone.color.split(' ')[1]}`}></div>
              <div className="p-2 bg-white border border-gray-200 rounded-b">
                <div className="font-medium text-gray-600">Zone {zone.id}</div>
                {zone.minBpm > 0 && zone.maxBpm > 0 ? (
                  <div className="text-gray-600">
                    {zone.minBpm}-{zone.maxBpm}
                  </div>
                ) : (
                  <div className="text-gray-600">Not set</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
