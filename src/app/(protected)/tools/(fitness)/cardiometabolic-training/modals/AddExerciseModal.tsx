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
  // Helper function to format duration from decimal minutes to MM:SS for input
  const formatDurationForInput = (duration: number) => {
    if (!duration || duration <= 0) return '';
    const minutes = Math.floor(duration);
    const seconds = Math.round((duration - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // CardioMetabolic Endurance Training fields
  const [exerciseName, setExerciseName] = useState(() => editingExercise?.activityName || '');
  const [stepType, setStepType] = useState(() => editingExercise?.stepType || 'Work');
  const [useIntervals, setUseIntervals] = useState(() => editingExercise?.useIntervals || false);
  const [intervals, setIntervals] = useState<Interval[]>(() => {
    if (editingExercise?.intervals) {
      // When editing, load the existing intervals
      return editingExercise.intervals.map((interval: any) => ({
        ...interval,
        // Ensure all required properties are present
        stepType: interval.stepType || 'Work',
        duration: interval.duration || 0,
        metrics: interval.metrics || {},
        notes: interval.notes || '',
        isRepeatBlock: interval.isRepeatBlock || false,
        blockId: interval.blockId,
        repeatCount: interval.repeatCount || '',
        isBlockHeader: interval.isBlockHeader || false,
        heartRateData: interval.heartRateData
      }));
    }
    return [{ 
      stepType: 'Work', 
      duration: 0,
      metrics: {},
      notes: '',
    }];
  });

  // Exercise library state - now using props instead of local state
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
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

  // CME Metrics state - initialized based on editingExercise data
  const [selectedMetrics, setSelectedMetrics] = useState<Record<string, any>>(() => {
    try {
      if (editingExercise?.activityFamily) {
        // If editing, populate with existing metric values from the exercise
        if (editingExercise.intervals && editingExercise.intervals.length > 0) {
          const existingMetrics: Record<string, any> = {};
          
          // Get the first interval's metrics (for non-interval exercises) or collect from all intervals
          if (!editingExercise.useIntervals && editingExercise.intervals[0]) {
            const firstInterval = editingExercise.intervals[0];
            
            // Map duration back to Duration field
            if (firstInterval.duration > 0) {
              const formattedDuration = formatDurationForInput(firstInterval.duration);
              existingMetrics['Duration'] = formattedDuration;
            }
            
            // Map other metrics (filter out internal metadata)
            if (firstInterval.metrics) {
              Object.entries(firstInterval.metrics).forEach(([key, value]) => {
                // Filter out internal metadata fields but keep actual metrics
                if (!key.endsWith('_type') && 
                    !key.endsWith('_min') && 
                    !key.endsWith('_max') &&
                    key !== 'Heart Rate Target_type' &&
                    key !== 'Heart Rate Target_min' &&
                    key !== 'Heart Rate Target_max') {
                  existingMetrics[key] = value;
                }
              });
            }
            
            // Map heart rate data (only the display value, not internal fields)
            if (firstInterval.heartRateData) {
              existingMetrics['Heart Rate Target'] = firstInterval.heartRateData.value;
              // Store internal fields separately for processing, not display
              existingMetrics['Heart Rate Target_type'] = firstInterval.heartRateData.type;
              existingMetrics['Heart Rate Target_min'] = firstInterval.heartRateData.min;
              existingMetrics['Heart Rate Target_max'] = firstInterval.heartRateData.max;
            }
          } else if (editingExercise.useIntervals) {
            // For interval exercises, collect metrics from all intervals
            editingExercise.intervals.forEach((interval: any) => {
              // Always include Duration if this interval has duration
              if (interval.duration > 0) {
                const formattedDuration = formatDurationForInput(interval.duration);
                existingMetrics['Duration'] = formattedDuration;
              }
              
              // Include other metrics (filter out internal metadata)
              if (interval.metrics) {
                Object.entries(interval.metrics).forEach(([key, value]) => {
                  // Filter out internal metadata fields but keep actual metrics
                  if (!key.endsWith('_type') && 
                      !key.endsWith('_min') && 
                      !key.endsWith('_max') &&
                      key !== 'Heart Rate Target_type' &&
                      key !== 'Heart Rate Target_min' &&
                      key !== 'Heart Rate Target_max') {
                    existingMetrics[key] = value;
                  }
                });
              }
              
              // Include heart rate data (only the display value, not internal fields)
              if (interval.heartRateData) {
                existingMetrics['Heart Rate Target'] = interval.heartRateData.value;
                // Store internal fields separately for processing, not display
                existingMetrics['Heart Rate Target_type'] = interval.heartRateData.type;
                existingMetrics['Heart Rate Target_min'] = interval.heartRateData.min;
                existingMetrics['Heart Rate Target_max'] = interval.heartRateData.max;
              }
            });
          }
          
          return existingMetrics;
        }
        
        // Fallback to empty metrics if no intervals
        const { initialMetrics } = getMetricsForActivityFamily(editingExercise.activityFamily);
        return initialMetrics;
      }
    } catch (error) {
      console.warn('Error initializing metrics from editingExercise:', error);
    }
    return {};
  });

  // Distance unit state - based on user preferences or default
  const [distanceUnit, setDistanceUnit] = useState<string>(() => {
    // Use user's preferred distance unit, default to imperial if undefined
    return fitnessSettings?.cardioMetabolic?.distanceUnit || 'imperial';
  });

  // Distance unit options based on user preference
  const distanceUnitOptions = useMemo(() => {
    if (distanceUnit === 'metric') {
      return [
        { value: 'km', label: 'Kilometers' },
        { value: 'm', label: 'Meters' }
      ];
    } else {
      return [
        { value: 'miles', label: 'Miles' },
        { value: 'yards', label: 'Yards' }
      ];
    }
  }, [distanceUnit]);
  
  const [availableMetrics, setAvailableMetrics] = useState<MetricField[]>(() => {
    if (editingExercise?.activityFamily) {
      const { metrics } = getMetricsForActivityFamily(editingExercise.activityFamily);
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
    setIntervals(prev => {
      const newIntervals = prev.map((interval, i) =>
        i === idx ? { ...interval, [field]: value } : interval
      );
      return newIntervals;
    });
  };

  const handleAddInterval = () => {
    setIntervals(prev => [
      ...prev,
      { 
        stepType: 'Work', 
        duration: 0,
        metrics: {}, // Start with completely blank metrics
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
      
      // Always update metrics when an activity is selected, whether editing or creating new
      // This ensures consistent metric display based on user configuration or defaults
      if (option.activity.activity_family) {
        const { metrics, initialMetrics } = getMetricsForActivityFamily(option.activity.activity_family);
        setAvailableMetrics(metrics);
        
        // If editing, preserve existing values for metrics that are still available
        if (editingExercise) {
          const preservedMetrics = { ...initialMetrics };
          Object.keys(selectedMetrics).forEach(key => {
            if (metrics.some(metric => metric.name === key)) {
              preservedMetrics[key] = selectedMetrics[key];
            }
          });
          setSelectedMetrics(preservedMetrics);
        } else {
          setSelectedMetrics(initialMetrics);
        }
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

    // Transform the selected metrics into the proper interval structure
    const transformMetricsToIntervals = (metrics: Record<string, any>, useIntervals: boolean) => {
      if (useIntervals) {
        // For intervals, handle repeatable blocks and expand them
        const expandedIntervals: any[] = [];
        
        intervals.forEach((interval, idx) => {
          if (interval.isBlockHeader && interval.blockId) {
            // This is a repeat block header - expand the block
            const blockSteps = intervals.filter(int => 
              int.blockId === interval.blockId && !int.isBlockHeader
            );
            const repeatCount = Number(interval.repeatCount) || 2;
            
            // Expand the block based on repeat count
            for (let repeat = 0; repeat < repeatCount; repeat++) {
              blockSteps.forEach((blockStep) => {
                const intervalData: any = {
                  stepType: blockStep.stepType,
                  notes: blockStep.notes,
                  duration: 0,
                  metrics: { ...blockStep.metrics },
                  heartRateData: undefined
                };

                // Handle duration if it exists in the interval metrics
                if (blockStep.metrics.Duration) {
                  // Parse MM:SS format and convert to total minutes
                  const durationStr = String(blockStep.metrics.Duration);
                  if (durationStr.includes(':')) {
                    const [minutes, seconds] = durationStr.split(':').map(Number);
                    intervalData.duration = minutes + (seconds / 60);
                  } else {
                    intervalData.duration = Number(durationStr) || 0;
                  }
                }

                // Handle heart rate data for this interval
                if (blockStep.metrics['Heart Rate Target']) {
                  intervalData.heartRateData = {
                    type: blockStep.metrics['Heart Rate Target_type'] || 'zone',
                    value: blockStep.metrics['Heart Rate Target'],
                    min: blockStep.metrics['Heart Rate Target_min'],
                    max: blockStep.metrics['Heart Rate Target_max']
                  };
                }

                expandedIntervals.push(intervalData);
              });
            }
          } else if (!interval.isRepeatBlock) {
            // Regular interval (not part of a repeatable block)
            const intervalData: any = {
              stepType: interval.stepType,
              notes: interval.notes,
              duration: 0,
              metrics: { ...interval.metrics },
              heartRateData: undefined
            };

            // Handle duration if it exists in the interval metrics
            if (interval.metrics.Duration) {
              // Parse MM:SS format and convert to total minutes
              const durationStr = String(interval.metrics.Duration);
              if (durationStr.includes(':')) {
                const [minutes, seconds] = durationStr.split(':').map(Number);
                intervalData.duration = minutes + (seconds / 60);
              } else {
                intervalData.duration = Number(durationStr) || 0;
              }
            }

            // Handle heart rate data for this interval
            if (interval.metrics['Heart Rate Target']) {
              intervalData.heartRateData = {
                type: interval.metrics['Heart Rate Target_type'] || 'zone',
                value: interval.metrics['Heart Rate Target'],
                min: interval.metrics['Heart Rate Target_min'],
                max: interval.metrics['Heart Rate Target_max']
              };
            }

            expandedIntervals.push(intervalData);
          }
        });
        
        return expandedIntervals;
      } else {
        // For single exercise, create one interval with all metrics
        const intervalData: any = {
          stepType: stepType,
          notes: intervals[0].notes,
          duration: 0,
          metrics: {}, // Store all metrics in a dedicated object
          heartRateData: undefined // Initialize heart rate data
        };

        // Map metrics to interval fields
        Object.entries(metrics).forEach(([metricName, value]) => {
          if (metricName === 'Duration') {
            // Parse MM:SS format and convert to total minutes
            const durationStr = String(value);
            if (durationStr.includes(':')) {
              const [minutes, seconds] = durationStr.split(':').map(Number);
              intervalData.duration = minutes + (seconds / 60);
            } else {
              intervalData.duration = Number(value) || 0;
            }
          } else if (metricName === 'Pace' || metricName === 'Speed') {
            intervalData.metrics[metricName] = String(value) || '';
          } else if (metricName === 'Heart Rate Target') {
            // Handle heart rate target specially
            const hrType = metrics[`${metricName}_type`];
            if (hrType === 'zone') {
              // Find the zone label for display
              const zoneOption = actualHeartRateZoneOptions.find((opt: { value: string; label: string; description: string }) => opt.value === value);
              intervalData.metrics['Heart Rate Zone'] = zoneOption?.label || value || '';
            } else if (hrType === 'custom') {
              const min = metrics[`${metricName}_min`];
              const max = metrics[`${metricName}_max`];
              intervalData.metrics['Heart Rate Range'] = `${min}-${max}`;
            }
            
            // Store heart rate data in the interval
            intervalData.heartRateData = {
              type: hrType || 'zone',
              value: value,
              min: metrics[`${metricName}_min`],
              max: metrics[`${metricName}_max`]
            };
          } else if (metricName === 'Distance') {
            intervalData.metrics[metricName] = String(value) || '';
          } else {
            // For other metrics, store in metrics object
            intervalData.metrics[metricName] = String(value) || '';
          }
        });

        return [intervalData];
      }
    };

    // Create the exercise object with proper structure
    const exercise = {
      activityId: selectedActivity.value,
      activityName: selectedActivity.activity.name,
      activitySource: selectedActivity.source === 'cme_library' ? 'library' : 'user',
      activityFamily: selectedActivity.activity.activity_family, // Add activity family for HR zone lookup
      useIntervals,
      intervals: transformMetricsToIntervals(selectedMetrics, useIntervals),
      notes: exerciseName !== selectedActivity.activity.name ? exerciseName : '',
      createdAt: new Date().toISOString(),
      userId: selectedUserId,
      // Calculate total repeat count from all repeat blocks
      totalRepeatCount: useIntervals ? intervals.reduce((total, interval) => {
        if (interval.isBlockHeader && interval.repeatCount) {
          return total + (Number(interval.repeatCount) || 0);
        }
        return total;
      }, 0) : 0,
      // Add heart rate data directly if it exists
      heartRateData: useIntervals 
        ? (() => {
            // For intervals, collect heart rate data from the first interval that has it
            const firstIntervalWithHR = intervals.find(interval => 
              interval.metrics['Heart Rate Target'] || 
              interval.metrics['Heart Rate Target_type']
            );
            
            if (firstIntervalWithHR?.metrics['Heart Rate Target']) {
              return {
                type: firstIntervalWithHR.metrics['Heart Rate Target_type'] || 'zone',
                value: firstIntervalWithHR.metrics['Heart Rate Target'],
                min: firstIntervalWithHR.metrics['Heart Rate Target_min'],
                max: firstIntervalWithHR.metrics['Heart Rate Target_max']
              };
            }
            return undefined;
          })()
        : (selectedMetrics['Heart Rate Target'] ? {
            type: selectedMetrics['Heart Rate Target_type'] || 'zone',
            value: selectedMetrics['Heart Rate Target'],
            min: selectedMetrics['Heart Rate Target_min'],
            max: selectedMetrics['Heart Rate Target_max']
          } : undefined)
    };

    onAdd(exercise);
    onClose();
    
    // Reset form - the key prop will force a remount with fresh state
    // No need to manually reset state here
  };

  const renderMetricField = (metric: MetricField, intervalIdx?: number) => {
    // For intervals, use the interval's own metrics; otherwise use global selectedMetrics
    const isIntervalMode = intervalIdx !== undefined;
    const value = isIntervalMode 
      ? intervals[intervalIdx]?.metrics?.[metric.name] || ''
      : selectedMetrics[metric.name] || '';

    const handleValueChange = (newValue: any) => {
      if (isIntervalMode) {
        // Update interval-specific metrics
        setIntervals(prev => prev.map((interval, i) => 
          i === intervalIdx 
            ? { ...interval, metrics: { ...interval.metrics, [metric.name]: newValue } }
            : interval
        ));
      } else {
        // Update global metrics (for non-interval mode)
        handleMetricChange(metric.name, newValue);
      }
    };



    switch (metric.type) {
      case 'number':
        // Special handling for Duration field to accept time format
        if (metric.name === 'Duration') {
          return (
            <input
              type="text"
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder="e.g., 3:30 (3 min 30 sec)"
              pattern="^[0-9]+:[0-5][0-9]$"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
            />
          );
        }
        
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleValueChange(e.target.value)}
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
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={metric.placeholder}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
          />
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleValueChange(e.target.value)}
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
      
      case 'distance':
        // Special handling for Distance field with unit dropdown
        return (
          <div className="flex space-x-2">
            <input
              type="number"
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder={metric.placeholder}
              min={metric.min}
              max={metric.max}
              className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
            />
            <select
              value={distanceUnit === 'metric' ? 'km' : 'miles'}
              onChange={(e) => setDistanceUnit(e.target.value === 'km' || e.target.value === 'm' ? 'metric' : 'imperial')}
              className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
            >
              {distanceUnitOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.value === 'km' ? 'km' : option.value === 'm' ? 'm' : option.value === 'miles' ? 'mi' : 'yd'}
                </option>
              ))}
            </select>
          </div>
        );
      
      case 'heartRateTarget':
        // For heart rate target, we need to handle the type and values separately
        const hrType = isIntervalMode 
          ? intervals[intervalIdx]?.metrics?.[`${metric.name}_type`] || 'zone'
          : selectedMetrics[`${metric.name}_type`] || 'zone';
        const hrValue = value;
        
        const handleHRTypeChange = (newType: string) => {
          if (isIntervalMode) {
            setIntervals(prev => prev.map((interval, i) => 
              i === intervalIdx 
                ? { ...interval, metrics: { ...interval.metrics, [`${metric.name}_type`]: newType } }
                : interval
            ));
          } else {
            handleMetricChange(`${metric.name}_type`, newType);
          }
        };

        const handleHRValueChange = (newValue: string) => {
          if (isIntervalMode) {
            setIntervals(prev => prev.map((interval, i) => 
              i === intervalIdx 
                ? { ...interval, metrics: { ...interval.metrics, [metric.name]: newValue } }
                : interval
            ));
          } else {
            handleMetricChange(metric.name, newValue);
          }
        };

        const handleHRMinMaxChange = (field: string, newValue: string) => {
          if (isIntervalMode) {
            setIntervals(prev => prev.map((interval, i) => 
              i === intervalIdx 
                ? { ...interval, metrics: { ...interval.metrics, [field]: newValue } }
                : interval
            ));
          } else {
            handleMetricChange(field, newValue);
          }
        };
        
        return (
          <div className="mt-1 space-y-3">
            {/* Radio buttons for zone vs custom */}
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`${metric.name}_type_${intervalIdx || 'global'}`}
                  value="zone"
                  checked={hrType === 'zone'}
                  onChange={() => handleHRTypeChange('zone')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-slate-200">Use Heart Rate Zones</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`${metric.name}_type_${intervalIdx || 'global'}`}
                  value="custom"
                  checked={hrType === 'custom'}
                  onChange={() => handleHRTypeChange('custom')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-slate-200">Custom Heart Rate Range</span>
              </label>
            </div>

            {/* Zone Selection */}
            {hrType === 'zone' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                  Select Heart Rate Zone
                </label>
                <Select
                  options={actualHeartRateZoneOptions}
                  value={actualHeartRateZoneOptions.find((opt: { value: string; label: string; description: string }) => opt.value === hrValue)}
                  onChange={(opt: { value: string; label: string; description: string } | null) => handleHRValueChange(opt?.value || '')}
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
            {hrType === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                    Minimum Heart Rate (BPM)
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="220"
                    value={isIntervalMode ? intervals[intervalIdx]?.metrics?.[`${metric.name}_min`] || '' : selectedMetrics[`${metric.name}_min`] || ''}
                    onChange={e => handleHRMinMaxChange(`${metric.name}_min`, e.target.value)}
                    placeholder="e.g., 120"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                    Maximum Heart Rate (BPM)
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="220"
                    value={isIntervalMode ? intervals[intervalIdx]?.metrics?.[`${metric.name}_max`] || '' : selectedMetrics[`${metric.name}_max`] || ''}
                    onChange={e => handleHRMinMaxChange(`${metric.name}_max`, e.target.value)}
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
              <label htmlFor="exercise-select" className="block text-sm font-medium text-gray-700 dark:text-slate-200">
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
                <label htmlFor="custom-exercise-name" className="block text-sm font-medium text-gray-700 dark:text-slate-200">
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
                    <label htmlFor="stepType" className="block text-sm font-medium text-gray-700 dark:text-slate-200">
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
                  <label htmlFor="useIntervals" className="text-sm font-medium text-gray-700 dark:text-slate-200">
                    Intervals
                  </label>
                </div>
              </div>
            </div>

            {/* CME Metrics Fields - only show when not using intervals */}
            {availableMetrics.length > 0 && !useIntervals && (
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-slate-200">Activity Metrics</h3>
                  {selectedActivity?.activity?.activity_family && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {fitnessSettings?.cardioMetabolic?.cmeMetrics?.[selectedActivity.activity.activity_family] ? (
                        <span className="text-blue-600 dark:text-blue-400">Using your configured metrics</span>
                      ) : (
                        <span className="text-green-600 dark:text-green-400">Using default metrics</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {availableMetrics.map(metric => (
                    <div key={metric.name}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
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

          {/* Intervals Card Layout (Simplified Garmin-style) */}
          {useIntervals ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-700 dark:text-slate-200">Interval Details</h3>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleAddInterval}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                  >
                    + Add Step
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Add a repeat block that wraps around existing steps
                      const newIntervals = [
                        ...intervals,
                        { 
                          stepType: 'Repeat Block',
                          duration: 0,
                          metrics: {},
                          notes: '',
                          isRepeatBlock: true,
                          blockId: Date.now() + Math.random(),
                          repeatCount: '', // Start with empty string for editable input
                          isBlockHeader: true // This is the header for the repeat block
                        }
                      ];
                      setIntervals(newIntervals);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                  >
                    + Add Repeat
                  </button>
                </div>
              </div>
              
              {/* Show which metrics are being used */}
              {selectedActivity?.activity?.activity_family && (
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  {fitnessSettings?.cardioMetabolic?.cmeMetrics?.[selectedActivity.activity.activity_family] ? (
                    <span className="text-blue-600 dark:text-blue-400">Using your configured metrics</span>
                  ) : (
                    <span className="text-green-600 dark:text-green-400">Using default metrics</span>
                  )}
                </div>
              )}
              
              {intervals.map((interval, idx) => {
                // Check if this interval is part of a repeat block
                const isInRepeatBlock = interval.isRepeatBlock && !interval.isBlockHeader;
                const isBlockHeader = interval.isBlockHeader;
                const blockId = interval.blockId;
                
                // Find all steps that belong to this repeat block
                const blockSteps = blockId ? intervals.filter(int => 
                  int.blockId === blockId && !int.isBlockHeader
                ) : [];
                
                if (isBlockHeader) {
                  // Render the repeat block header
                  return (
                    <div key={`block-header-${blockId}`} className="space-y-3">
                      {/* Repeat Block Header */}
                      <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-blue-600 dark:text-blue-400">🔄</span>
                            <span className="font-medium text-gray-700 dark:text-slate-200">Repeat</span>
                            <input
                              type="number"
                              min="1"
                              max="20"
                              value={interval.repeatCount || ''}
                              onChange={(e) => {
                                const newRepeatCount = e.target.value;
                                setIntervals(prev => prev.map((int, i) => 
                                  int.blockId === blockId 
                                    ? { ...int, repeatCount: newRepeatCount }
                                    : int
                                ));
                              }}
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                            />
                            <span className="text-gray-600 dark:text-slate-300">Times</span>
                          </div>
                                                      <button
                              type="button"
                              onClick={() => {
                                // Add a new step to this repeat block
                                const newStep = {
                                  stepType: 'Work',
                                  duration: 0,
                                  metrics: {},
                                  notes: '',
                                  isRepeatBlock: true,
                                  blockId: blockId,
                                  repeatCount: interval.repeatCount
                                };
                                
                                // Insert the new step after the last step in this block
                                const lastBlockStepIndex = intervals.findLastIndex(int => 
                                  int.blockId === blockId && !int.isBlockHeader
                                );
                                const insertIndex = lastBlockStepIndex + 1;
                                
                                setIntervals(prev => [
                                  ...prev.slice(0, insertIndex),
                                  newStep,
                                  ...prev.slice(insertIndex)
                                ]);
                              }}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                            >
                              + Add Step
                            </button>
                        </div>
                      </div>
                      
                      {/* Render all steps in this repeat block */}
                      {blockSteps.map((step, stepIdx) => (
                        <div key={`block-step-${stepIdx}`} className="ml-6 space-y-4 p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
                              Step {stepIdx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveInterval(intervals.findIndex(int => int === step))}
                              className="text-red-500 hover:text-red-700 text-lg p-1"
                              aria-label="Remove step"
                            >
                              <HiOutlineTrash />
                            </button>
                          </div>
                          
                          {/* Step Type */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">Step Type</label>
                            <Select
                              options={stepTypeOptions}
                              value={stepTypeOptions.find(opt => opt.value === step.stepType)}
                              onChange={opt => handleIntervalChange(intervals.findIndex(int => int === step), 'stepType', opt?.value || 'Work')}
                              classNamePrefix="select"
                              className="mt-1 text-gray-600"
                            />
                          </div>
                          
                          {/* CME Metrics */}
                          {availableMetrics.length > 0 && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                              {availableMetrics.map(metric => (
                                <div key={metric.name}>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                                    {metric.label}
                                    {metric.required && <span className="text-red-500 ml-1">*</span>}
                                  </label>
                                  {renderMetricField(metric, intervals.findIndex(int => int === step))}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Notes */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">Notes</label>
                            <input
                              type="text"
                              value={step.notes}
                              onChange={e => handleIntervalChange(intervals.findIndex(int => int === step), 'notes', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                } else if (!isInRepeatBlock) {
                  // Render individual steps (not in repeat blocks)
                  return (
                    <div key={`interval-${idx}`} className="space-y-4 p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
                          Step {idx + 1}
                        </span>
                        {intervals.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveInterval(idx)}
                            className="text-red-500 hover:text-red-700 text-lg p-1"
                            aria-label="Remove step"
                          >
                            <HiOutlineTrash />
                          </button>
                        )}
                      </div>
                      
                      {/* Step Type */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">Step Type</label>
                        <Select
                          options={stepTypeOptions}
                          value={stepTypeOptions.find(opt => opt.value === interval.stepType)}
                          onChange={opt => handleIntervalChange(idx, 'stepType', opt?.value || 'Work')}
                          classNamePrefix="select"
                          className="mt-1 text-gray-600"
                        />
                      </div>
                      
                      {/* CME Metrics */}
                      {availableMetrics.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                          {availableMetrics.map(metric => (
                            <div key={metric.name}>
                              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                                {metric.label}
                                {metric.required && <span className="text-red-500 dark:text-slate-200">*</span>}
                              </label>
                              {renderMetricField(metric, idx)}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Notes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">Notes</label>
                        <input
                          type="text"
                          value={interval.notes}
                          onChange={e => handleIntervalChange(idx, 'notes', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                        />
                      </div>
                    </div>
                  );
                }
                
                // Don't render steps that are part of repeat blocks here (they're rendered above)
                return null;
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Notes field - always visible when not using intervals */}
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">Notes</label>
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