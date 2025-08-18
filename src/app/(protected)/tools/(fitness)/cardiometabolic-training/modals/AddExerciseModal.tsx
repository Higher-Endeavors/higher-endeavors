// Core
'use client';

// Dependencies
import { useState, useEffect, useCallback } from 'react';
import { Modal } from 'flowbite-react';
import Select from 'react-select';
import { HiOutlineTrash } from 'react-icons/hi';
import { clientLogger } from '@/app/lib/logging/logger.client';
import { getCMEActivityLibrary } from '../../lib/hooks/getCMEActivityLibrary';
import { getCMEActivityFamilyConfig, getDefaultMetricsForActivityFamily } from '../lib/cmeMetricsConfig';

// Components

interface CMEActivityItem {
  cme_activity_library_id: number;
  name: string;
  source: 'cme_library' | 'user';
  activity_family?: string;
  equipment?: string;
}

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (exercise: any) => void; // TODO: Define proper CME exercise type
  currentUserId: number;
  editingExercise?: any | null;
}

interface ExerciseOption {
  value: number;
  label: string;
  activity: CMEActivityItem;
  source: 'cme_library' | 'user';
}

interface MetricField {
  name: string;
  type: 'number' | 'text' | 'select';
  label: string;
  placeholder?: string;
  unit?: string;
  min?: number;
  max?: number;
  options?: { value: string; label: string }[];
  required?: boolean;
}

export default function AddExerciseModal({ isOpen, onClose, onAdd, currentUserId, editingExercise }: AddExerciseModalProps) {
  // CardioMetabolic Endurance Training fields
  const [exerciseName, setExerciseName] = useState('');
  const [stepType, setStepType] = useState('Work');
  const [useIntervals, setUseIntervals] = useState(false);
  const [intervals, setIntervals] = useState([
    { stepType: 'Work', duration: 5, intensity: '', intensityMetric: 'Pace', notes: '' }
  ]);

  // Exercise library state
  const [cmeActivities, setCmeActivities] = useState<CMEActivityItem[]>([]);
  const [userActivities, setUserActivities] = useState<CMEActivityItem[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<ExerciseOption | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // CME Metrics state
  const [selectedMetrics, setSelectedMetrics] = useState<Record<string, any>>({});
  const [availableMetrics, setAvailableMetrics] = useState<MetricField[]>([]);

  const stepTypeOptions = [
    { value: 'Warm-Up', label: 'Warm-Up' },
    { value: 'Work', label: 'Work' },
    { value: 'Recovery', label: 'Recovery' },
    { value: 'Cool-Down', label: 'Cool-Down' },
  ];

  // Fetch CME activities from the library
  const fetchCMEActivities = useCallback(async () => {
    try {
      setIsLoadingActivities(true);
      
      // Use the existing hook to fetch CME activity library
      const cmeData = await getCMEActivityLibrary();
      setCmeActivities(cmeData.map(activity => ({
        ...activity,
        activity_family: activity.activity_family || undefined,
        equipment: activity.equipment || undefined
      })));

      // Fetch user's custom CME activities (if API exists)
      try {
        const userResponse = await fetch(`/api/user-exercise-library?userId=${currentUserId}&type=cme`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserActivities(userData.exercises?.map((exercise: any) => ({
            cme_activity_library_id: exercise.userExerciseLibraryId,
            name: exercise.name,
            source: 'user' as const,
            activity_family: exercise.category,
            equipment: exercise.equipment
          })) || []);
        }
      } catch (error) {
        // User exercises API might not exist yet, that's okay
        clientLogger.info('User exercises API not available yet');
        setUserActivities([]);
      }
    } catch (error) {
      clientLogger.error('Error fetching CME activities', error);
      setCmeActivities([]);
    } finally {
      setIsLoadingActivities(false);
    }
  }, [currentUserId]);

  // Load activities when modal opens or user changes
  useEffect(() => {
    if (isOpen) {
      fetchCMEActivities();
    }
  }, [isOpen, fetchCMEActivities]);

  // Load editing exercise data when editingExercise changes
  useEffect(() => {
    if (editingExercise) {
      setExerciseName(editingExercise.activityName);
      setUseIntervals(editingExercise.useIntervals);
      setIntervals(editingExercise.intervals);
      
      // Find and set the selected activity
      const activityToSelect = cmeActivities.find(activity => 
        activity.name === editingExercise.activityName
      ) || userActivities.find(activity => 
        activity.name === editingExercise.activityName
      );
      
      if (activityToSelect) {
        setSelectedActivity({
          value: activityToSelect.cme_activity_library_id,
          label: activityToSelect.name,
          activity: activityToSelect,
          source: activityToSelect.source
        });
      }
    } else {
      // Reset form for new exercise
      setExerciseName('');
      setUseIntervals(false);
      setIntervals([{ stepType: 'Work', duration: 5, intensity: '', intensityMetric: 'Pace', notes: '' }]);
      setSelectedActivity(null);
      setSelectedMetrics({});
      setAvailableMetrics([]);
    }
  }, [editingExercise, cmeActivities, userActivities]);

  // Update available metrics when activity changes
  useEffect(() => {
    if (selectedActivity?.activity?.activity_family) {
      const activityFamily = selectedActivity.activity.activity_family;
      const config = getCMEActivityFamilyConfig(activityFamily);
      
      if (config) {
        setAvailableMetrics(config.metrics);
        // Initialize selected metrics with default values
        const defaultMetrics = getDefaultMetricsForActivityFamily(activityFamily);
        const initialMetrics: Record<string, any> = {};
        defaultMetrics.forEach(metricName => {
          const metric = config.metrics.find(m => m.name === metricName);
          if (metric) {
            initialMetrics[metricName] = '';
          }
        });
        setSelectedMetrics(initialMetrics);
      }
    } else {
      setAvailableMetrics([]);
      setSelectedMetrics({});
    }
  }, [selectedActivity]);

  // Create exercise options for dropdown
  const exerciseOptions: ExerciseOption[] = [
    ...userActivities.map(activity => ({
      value: activity.cme_activity_library_id,
      label: `${activity.name} (Custom)`,
      activity,
      source: 'user' as const
    })),
    ...cmeActivities.map(activity => ({
      value: activity.cme_activity_library_id,
      label: activity.name,
      activity,
      source: 'cme_library' as const
    }))
  ];

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
      { stepType: 'Work', duration: 5, intensity: '', intensityMetric: 'Pace', notes: '' }
    ]);
  };

  const handleRemoveInterval = (idx: number) => {
    setIntervals(prev => prev.filter((_, i) => i !== idx));
  };

  const handleActivitySelect = (option: ExerciseOption | null) => {
    setSelectedActivity(option);
    if (option) {
      setExerciseName(option.activity.name);
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
      userId: currentUserId
    };

    onAdd(exercise);
    onClose();
    
    // Reset form
    setExerciseName('');
    setSelectedActivity(null);
    setIntervals([{ stepType: 'Work', duration: 5, intensity: '', intensityMetric: 'Pace', notes: '' }]);
    setUseIntervals(true);
    setSelectedMetrics({});
    setAvailableMetrics([]);
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
                  {selectedActivity.activity.activity_family && (
                    <p className="text-sm text-gray-600">
                      <strong>Category:</strong> {selectedActivity.activity.activity_family}
                    </p>
                  )}
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

            {/* CME Metrics Fields */}
            {availableMetrics.length > 0 && (
              <div className="col-span-2">
                <h3 className="text-lg font-medium dark:text-white mb-3">Activity Metrics</h3>
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
                  {/* First row: Step Type and Duration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium dark:text-white">Step Type</label>
                      <Select
                        options={stepTypeOptions}
                        value={stepTypeOptions.find(opt => opt.value === interval.stepType || 'Work')}
                        onChange={opt => handleIntervalChange(idx, 'stepType', opt?.value || 'Work')}
                        classNamePrefix="select"
                        className="mt-1 text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium dark:text-white">Duration (min)</label>
                      <input
                        type="number"
                        min="1"
                        value={interval.duration}
                        onChange={e => handleIntervalChange(idx, 'duration', Number(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-1"
                      />
                    </div>
                  </div>
                  {/* Second row: Intensity and Intensity Metric */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium dark:text-white">Intensity</label>
                      <input
                        type="text"
                        value={interval.intensity}
                        onChange={e => handleIntervalChange(idx, 'intensity', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium dark:text-white">Intensity Metric</label>
                      <Select
                        options={[
                          { value: 'Pace', label: 'Pace' },
                          { value: 'Heart Rate', label: 'Heart Rate' },
                          { value: 'Watts', label: 'Watts' },
                          { value: 'Other', label: 'Other' },
                        ]}
                        value={[{ value: 'Pace', label: 'Pace' }].find(opt => opt.value === interval.intensityMetric)}
                        onChange={opt => handleIntervalChange(idx, 'intensityMetric', opt?.value || 'Pace')}
                        className="mt-1 text-gray-600"
                        styles={{ menu: base => ({ ...base, zIndex: 9999 }), control: base => ({ ...base, minWidth: 120, width: '100%' }) }}
                      />
                    </div>
                  </div>
                  {/* Third row: Notes */}
                  <div className="mt-2">
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