// Core
'use client';

// Dependencies
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal } from 'flowbite-react';
import Select from 'react-select';
import { HiOutlineTrash } from 'react-icons/hi';
import { getCMEActivityFamilyConfig, getDefaultMetricsForActivityFamily } from '../lib/cmeMetricsConfig';
import type { FitnessSettings } from '@/app/lib/types/userSettings.zod';
import type { CMEActivityItem, ExerciseOption, Interval, MetricField } from '../types/cme.zod';

// Components

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (exercise: any) => void; // TODO: Define proper CME exercise type
  currentUserId: number;
  selectedUserId: number; // ID of the user whose preferences are being displayed
  editingExercise?: any | null;
  fitnessSettings?: FitnessSettings;
  userHeartRateZones?: any[]; // Add this prop for user's HR zones
  activities: CMEActivityItem[]; // Activities passed from parent component
}

export default function AddExerciseModal({ isOpen, onClose, onAdd, currentUserId, selectedUserId, editingExercise, fitnessSettings, userHeartRateZones, activities }: AddExerciseModalProps) {
  // CardioMetabolic Endurance Training fields
  const [exerciseName, setExerciseName] = useState(() => editingExercise?.activityName || '');
  const [stepType, setStepType] = useState(() => editingExercise?.stepType || 'Work');
  const [useIntervals, setUseIntervals] = useState(() => editingExercise?.useIntervals || false);
  const [intervals, setIntervals] = useState<Interval[]>(() => {
    if (editingExercise?.intervals) {
      return editingExercise.intervals;
    }
    return [{ 
      stepType: 'Work', 
      notes: '',
    }];
  });

  // Exercise library state - now using props instead of local state
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ExerciseOption | null>(() => {
    if (editingExercise) {
      const activityToSelect = activities.find(activity => 
        activity.name === editingExercise.activityName
      );
      
      if (activityToSelect) {
        return {
          value: activityToSelect.cme_activity_library_id,
          label: activityToSelect.name,
          activity: activityToSelect,
          source: activityToSelect.source
        };
      }
    }
    return null;
  });
  const [searchTerm, setSearchTerm] = useState('');

  // CME Metrics state - initialized based on selected activity
  const [selectedMetrics, setSelectedMetrics] = useState<Record<string, any>>(() => {
    if (selectedActivity?.activity?.activity_family) {
      const { initialMetrics } = getMetricsForActivityFamily(selectedActivity.activity.activity_family);
      return initialMetrics;
    }
    return {};
  });
  
  const [availableMetrics, setAvailableMetrics] = useState<MetricField[]>(() => {
    if (selectedActivity?.activity?.activity_family) {
      const { metrics } = getMetricsForActivityFamily(selectedActivity.activity.activity_family);
      return metrics;
    }
    return [];
  });

  const stepTypeOptions = [
    { value: 'Warm-Up', label: 'Warm-Up' },
    { value: 'Work', label: 'Work' },
    { value: 'Recovery', label: 'Recovery' },
    { value: 'Cool-Down', label: 'Cool-Down' },
  ];

  const heartRateZoneOptions = [
    { value: 'zone1', label: 'Zone 1 - Active Recovery', description: '50-60% of max HR, very light effort' },
    { value: 'zone2', label: 'Zone 2 - Aerobic Base', description: '60-70% of max HR, light effort, can talk easily' },
    { value: 'zone3', label: 'Zone 3 - Aerobic Threshold', description: '70-80% of max HR, moderate effort, can talk but not sing' },
    { value: 'zone4', label: 'Zone 4 - Lactate Threshold', description: '80-90% of max HR, hard effort, can say a few words' },
    { value: 'zone5', label: 'Zone 5 - VO2 Max', description: '90-100% of max HR, very hard effort, can\'t talk' },
  ];

  // Use user's actual heart rate zones if available, otherwise fall back to defaults
  const actualHeartRateZoneOptions = useMemo(() => {
    if (userHeartRateZones && userHeartRateZones.length > 0) {
      // Find general zones or use the first available zones
      const generalZones = userHeartRateZones.find(z => z.activityType === 'general');
      const zonesToUse = generalZones?.zones || userHeartRateZones[0]?.zones || [];
      
      return zonesToUse.map((zone: any) => ({
        value: `zone${zone.id}`,
        label: `Zone ${zone.id}`,
        description: zone.minBpm > 0 && zone.maxBpm > 0 
          ? `${zone.minBpm}-${zone.maxBpm} BPM` 
          : 'Zone not configured'
      }));
    }
    
    // Fall back to default zones if user hasn't configured any
    return heartRateZoneOptions;
  }, [userHeartRateZones]);

  // Helper function to determine which metrics to show for an activity family
  const getMetricsForActivityFamily = useCallback((activityFamily: string) => {
    const config = getCMEActivityFamilyConfig(activityFamily);
    if (!config) return { metrics: [], initialMetrics: {} };
    
    // Check if user has configured metrics for this activity family
    const userConfiguredMetrics = fitnessSettings?.cardioMetabolic?.cmeMetrics?.[activityFamily];
    
    let metricsToShow: typeof config.metrics;
    let initialMetrics: Record<string, any> = {};
    
    if (userConfiguredMetrics && userConfiguredMetrics.length > 0) {
      
      // Map user's "Heart Rate" preference to "Heart Rate Target" metric
      const mappedMetrics = userConfiguredMetrics.map(metricName => {
        if (metricName === 'Heart Rate') return 'Heart Rate Target';
        return metricName;
      });
      
      metricsToShow = config.metrics.filter(metric => 
        mappedMetrics.includes(metric.name)
      );
      
      // Initialize with user's configured metrics
      userConfiguredMetrics.forEach(metricName => {
        // Map the metric name for initialization
        const configMetricName = metricName === 'Heart Rate' ? 'Heart Rate Target' : metricName;
        const metric = config.metrics.find(m => m.name === configMetricName);
        if (metric) {
          initialMetrics[configMetricName] = '';
        }
      });
    } else {
      // User hasn't configured metrics - use defaults
      const defaultMetrics = getDefaultMetricsForActivityFamily(activityFamily);
      metricsToShow = config.metrics.filter(metric => 
        defaultMetrics.includes(metric.name)
      );
      
      // Initialize with default metrics
      defaultMetrics.forEach(metricName => {
        const metric = config.metrics.find(m => m.name === metricName);
        if (metric) {
          initialMetrics[metricName] = '';
        }
      });
    }
    
    return { metrics: metricsToShow, initialMetrics };
  }, [fitnessSettings]);

  // Load activities when modal opens or user changes
  useEffect(() => {
    if (isOpen) {
      // Activities are now passed as props, no need to fetch
      setIsLoadingActivities(false);
    }
  }, [isOpen]);

  // Create exercise options for dropdown
  const exerciseOptions: ExerciseOption[] = activities.map(activity => ({
    value: activity.cme_activity_library_id,
    label: activity.source === 'user' ? `${activity.name} (Custom)` : activity.name,
    activity,
    source: activity.source
  }));

  // Filter options based on search term
  const filteredOptions = exerciseOptions.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleIntervalChange = (idx: number, field: string, value: any) => {
    setIntervals(prev => prev.map((interval, i) =>
      i === idx ? { ...interval, [field]: value } : interval
    ));
  };

  const handleAddInterval = () => {
    setIntervals(prev => [
      ...prev,
      { 
        stepType: 'Work', 
        notes: '',
      }
    ]);
  };

  const handleRemoveInterval = (idx: number) => {
    setIntervals(prev => prev.filter((_, i) => i !== idx));
  };

  const handleActivitySelect = (option: ExerciseOption | null) => {
    setSelectedActivity(option);
    if (option) {
      setExerciseName(option.activity.name);
      
      // Update metrics for the selected activity
      if (option.activity.activity_family) {
        const { metrics, initialMetrics } = getMetricsForActivityFamily(option.activity.activity_family);
        setAvailableMetrics(metrics);
        setSelectedMetrics(initialMetrics);
      }
    } else {
      // Clear metrics when no activity is selected
      setAvailableMetrics([]);
      setSelectedMetrics({});
    }
  };

  const handleMetricChange = (metricName: string, value: any) => {
    setSelectedMetrics(prev => ({
      ...prev,
      [metricName]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedActivity) return;

    // Create the exercise object
    const exercise = {
      activityId: selectedActivity.value,
      activityName: selectedActivity.activity.name,
      activitySource: selectedActivity.source,
      activityFamily: selectedActivity.activity.activity_family,
      useIntervals,
      intervals: useIntervals ? intervals : [intervals[0]], // If not using intervals, just use the first one
      metrics: selectedMetrics, // Include the selected metrics
      notes: exerciseName !== selectedActivity.activity.name ? exerciseName : '', // Use custom name if different from selected
      createdAt: new Date().toISOString(),
      userId: selectedUserId // Use the selected user's ID, not the current user's ID
    };

    onAdd(exercise);
    onClose();
    
    // Reset form - the key prop will force a remount with fresh state
    // No need to manually reset state here
  };

  const renderMetricField = (metric: MetricField) => {
    const value = selectedMetrics[metric.name] || '';

    switch (metric.type) {
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleMetricChange(metric.name, e.target.value)}
            placeholder={metric.placeholder}
            min={metric.min}
            max={metric.max}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
          />
        );
      
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleMetricChange(metric.name, e.target.value)}
            placeholder={metric.placeholder}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
          />
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleMetricChange(metric.name, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
          >
            <option value="">Select {metric.label}</option>
            {metric.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'heartRateTarget':
        const heartRateType = selectedMetrics[`${metric.name}_type`] || 'zone';
        const heartRateValue = selectedMetrics[metric.name] || '';
        
        return (
          <div className="mt-1 space-y-3">
            {/* Radio buttons for zone vs custom */}
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`${metric.name}_type`}
                  value="zone"
                  checked={heartRateType === 'zone'}
                  onChange={() => handleMetricChange(`${metric.name}_type`, 'zone')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-white">Use Heart Rate Zones</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`${metric.name}_type`}
                  value="custom"
                  checked={heartRateType === 'custom'}
                  onChange={() => handleMetricChange(`${metric.name}_type`, 'custom')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-white">Custom Heart Rate Range</span>
              </label>
            </div>

            {/* Zone Selection */}
            {heartRateType === 'zone' && (
              <div>
                <label className="block text-sm font-medium dark:text-white mb-2">
                  Select Heart Rate Zone
                </label>
                <Select
                  options={actualHeartRateZoneOptions}
                  value={actualHeartRateZoneOptions.find((opt: { value: string; label: string; description: string }) => opt.value === heartRateValue)}
                  onChange={(opt: { value: string; label: string; description: string } | null) => handleMetricChange(metric.name, opt?.value || '')}
                  placeholder="Choose a heart rate zone..."
                  className="text-gray-600"
                  classNamePrefix="select"
                  styles={{ 
                    menu: base => ({ 
                      ...base, 
                      zIndex: 9999,
                      maxHeight: '200px',
                      overflow: 'auto'
                    }), 
                    control: base => ({ ...base, minWidth: 120, width: '100%' }) 
                  }}
                  formatOptionLabel={(option: any) => (
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  )}
                />
              </div>
            )}

            {/* Custom Heart Rate Range */}
            {heartRateType === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium dark:text-white">
                    Minimum Heart Rate (BPM)
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="220"
                    value={selectedMetrics[`${metric.name}_min`] || ''}
                    onChange={e => handleMetricChange(`${metric.name}_min`, e.target.value)}
                    placeholder="e.g., 120"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-white">
                    Maximum Heart Rate (BPM)
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="220"
                    value={selectedMetrics[`${metric.name}_max`] || ''}
                    onChange={e => handleMetricChange(`${metric.name}_max`, e.target.value)}
                    placeholder="e.g., 160"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                  />
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="xl">
      <Modal.Header className="dark:text-white">
        {editingExercise ? 'Edit Exercise' : 'Add CardioMetabolic Exercise'}
      </Modal.Header>
      <Modal.Body>
        {/* User Preferences Display */}
        {selectedUserId !== currentUserId && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Creating exercise for User ID:</strong> {selectedUserId}
              {fitnessSettings?.cardioMetabolic?.cmeMetrics && (
                <span className="ml-2">• Using their configured CME metrics</span>
              )}
              {userHeartRateZones && userHeartRateZones.length > 0 && (
                <span className="ml-2">• Using their heart rate zones</span>
              )}
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Exercise Selection */}
            <div className="col-span-2">
              <label htmlFor="exercise-select" className="block text-sm font-medium dark:text-white">
                Exercise Name
              </label>
              <Select
                id="exercise-select"
                options={filteredOptions}
                value={selectedActivity}
                onChange={handleActivitySelect}
                onInputChange={setSearchTerm}
                inputValue={searchTerm}
                placeholder="Search and select an exercise..."
                isLoading={isLoadingActivities}
                isClearable
                className="mt-1 text-gray-600"
                classNamePrefix="select"
                styles={{ 
                  menu: base => ({ ...base, zIndex: 9999 }), 
                  control: base => ({ ...base, minWidth: 120, width: '100%' }) 
                }}
                noOptionsMessage={() => "No exercises found"}
                loadingMessage={() => "Loading exercises..."}
              />
              {selectedActivity && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                  {selectedActivity.activity.equipment && (
                    <p className="text-sm text-gray-600">
                      <strong>Equipment:</strong> {selectedActivity.activity.equipment}
                    </p>
                  )}
                  {selectedActivity.source === 'user' && (
                    <p className="text-sm text-gray-600">
                      <strong>Type:</strong> Custom Exercise
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Custom Exercise Name (only show if different from selected) */}
            {selectedActivity && exerciseName !== selectedActivity.activity.name && (
              <div className="col-span-2">
                <label htmlFor="custom-exercise-name" className="block text-sm font-medium dark:text-white">
                  Custom Exercise Name
                </label>
                <input
                  id="custom-exercise-name"
                  type="text"
                  value={exerciseName}
                  onChange={e => setExerciseName(e.target.value)}
                  placeholder="Enter custom exercise name (optional)"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                />
              </div>
            )}

            {/* Step Type and Intervals - moved here below Exercise Name */}
            <div className="col-span-2">
              <div className="flex items-center space-x-6">
                {/* Step Type - only show if not using intervals */}
                {!useIntervals && (
                  <div className="flex-1">
                    <label htmlFor="stepType" className="block text-sm font-medium dark:text-white">
                      Step Type
                    </label>
                    <Select
                      id="stepType"
                      options={stepTypeOptions}
                      value={stepTypeOptions.find(opt => opt.value === stepType)}
                      onChange={opt => setStepType(opt?.value || 'Work')}
                      classNamePrefix="select"
                      className="mt-1 text-gray-600"
                    />
                  </div>
                )}

                {/* Intervals Checkbox */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="useIntervals"
                    checked={useIntervals}
                    onChange={e => setUseIntervals(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="useIntervals" className="text-sm font-medium dark:text-white">
                    Intervals
                  </label>
                </div>
              </div>
            </div>

            {/* CME Metrics Fields - only show when not using intervals */}
            {availableMetrics.length > 0 && !useIntervals && (
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium dark:text-white">Activity Metrics</h3>
                  {selectedActivity?.activity?.activity_family && (
                    <div className="text-sm text-gray-500">
                      {fitnessSettings?.cardioMetabolic?.cmeMetrics?.[selectedActivity.activity.activity_family] ? (
                        <span className="text-blue-600">Using your configured metrics</span>
                      ) : (
                        <span className="text-green-600">Using default metrics</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableMetrics.map(metric => (
                    <div key={metric.name}>
                      <label className="block text-sm font-medium dark:text-white">
                        {metric.label}
                        {metric.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {renderMetricField(metric)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Intervals Card Layout (Varied Sets style) */}
          {useIntervals ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium dark:text-white">Interval Details</h3>
                <button
                  type="button"
                  onClick={handleAddInterval}
                  className="px-2 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  + Add Interval
                </button>
              </div>
              
              {/* Show which metrics are being used */}
              {selectedActivity?.activity?.activity_family && (
                <div className="text-sm text-gray-500 text-center">
                  {fitnessSettings?.cardioMetabolic?.cmeMetrics?.[selectedActivity.activity.activity_family] ? (
                    <span className="text-blue-600">Using your configured metrics</span>
                  ) : (
                    <span className="text-green-600">Using default metrics</span>
                  )}
                </div>
              )}
              
              {intervals.map((interval, idx) => (
                <div key={idx} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium dark:text-white">Interval {idx + 1}</span>
                    {intervals.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveInterval(idx)}
                        className="text-red-500 hover:text-red-700 text-lg p-1"
                        aria-label="Remove interval"
                      >
                        <HiOutlineTrash />
                      </button>
                    )}
                  </div>
                  
                  {/* Step Type - first field in interval details */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium dark:text-white">Step Type</label>
                    <Select
                      options={stepTypeOptions}
                      value={stepTypeOptions.find(opt => opt.value === interval.stepType || 'Work')}
                      onChange={opt => handleIntervalChange(idx, 'stepType', opt?.value || 'Work')}
                      classNamePrefix="select"
                      className="mt-1 text-gray-600"
                    />
                  </div>
                  
                  {/* CME Metrics for Intervals - only show when intervals are enabled */}
                  {availableMetrics.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {availableMetrics.map(metric => (
                        <div key={metric.name}>
                          <label className="block text-sm font-medium dark:text-white">
                            {metric.label}
                            {metric.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {renderMetricField(metric)}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Notes - last field in interval details */}
                  <div>
                    <label className="block text-sm font-medium dark:text-white">Notes</label>
                    <input
                      type="text"
                      value={interval.notes}
                      onChange={e => handleIntervalChange(idx, 'notes', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Notes field - always visible when not using intervals */}
              <div className="mt-2">
                <label className="block text-sm font-medium dark:text-white">Notes</label>
                <input
                  type="text"
                  value={intervals[0].notes}
                  onChange={e => handleIntervalChange(0, 'notes', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-1"
                />
              </div>
            </div>
          )}
        </form>

        {/* Button Section - Moved outside form to match Resistance Training layout */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-white w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedActivity}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            onClick={handleSubmit}
          >
            {editingExercise ? 'Update Exercise' : 'Add Exercise'}
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
}