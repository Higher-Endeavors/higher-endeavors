'use client';

import React, { useState } from 'react';

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
  { value: 'running', label: 'Running' },
  { value: 'cycling', label: 'Cycling' },
  { value: 'swimming', label: 'Swimming' },
  { value: 'rowing', label: 'Rowing' },
];

export default function HeartRateZones({ onZonesChange, initialZones, userAge }: HeartRateZonesProps) {
  const [zones, setZones] = useState<HeartRateZone[]>(initialZones || defaultZones);
  const [calculationMethod, setCalculationMethod] = useState<CalculationMethod>('age');
  const [maxHeartRate, setMaxHeartRate] = useState<number>(0);
  const [restingHeartRate, setRestingHeartRate] = useState<number>(0);
  const [customMaxHR, setCustomMaxHR] = useState<number>(0);
  
  // Multi-activity custom zones
  const [enableMultiActivity, setEnableMultiActivity] = useState<boolean>(false);
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [activityZones, setActivityZones] = useState<ActivityZones>({});
  const [activeActivityTab, setActiveActivityTab] = useState<string>('general');

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

  const handleRemoveActivity = (activity: string) => {
    const newActivityZones = { ...activityZones };
    delete newActivityZones[activity];
    setActivityZones(newActivityZones);
    
    if (activeActivityTab === activity) {
      setActiveActivityTab('general');
    }
  };

  const getCurrentZones = () => {
    if (activeActivityTab === 'general') {
      return zones;
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
                <span className="text-gray-600">{maxHeartRate} BPM</span>
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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-600">Heart Rate Zones</h2>
      
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
        </div>

        {/* Dynamic Input Fields */}
        <div className="mt-4">
          {renderCalculationInputs()}
        </div>
      </div>

      {/* Zones Display and Editing */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-600">
          Zone Configuration
          {activeActivityTab !== 'general' && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              - {activityOptions.find(opt => opt.value === activeActivityTab)?.label}
            </span>
          )}
        </h3>
        
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
