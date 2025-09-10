import React, { useState } from 'react';
import { HiChevronDown, HiPlus, HiTrash } from 'react-icons/hi';
import type { CMEVolumeSettings, CMEActivity } from './cme-volumes.zod';

interface VolumeSettingsProps {
  settings: CMEVolumeSettings;
  onSettingsChange: (settings: CMEVolumeSettings) => void;
}

const activityOptions = [
  { value: 'running', label: 'Running', icon: '🏃', color: 'bg-red-100 text-red-700' },
  { value: 'cycling', label: 'Cycling', icon: '🚴', color: 'bg-blue-100 text-blue-700' },
  { value: 'swimming', label: 'Swimming', icon: '🏊', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'rowing', label: 'Rowing', icon: '🚣', color: 'bg-orange-100 text-orange-700' },
  { value: 'hiking', label: 'Hiking', icon: '🥾', color: 'bg-green-100 text-green-700' },
  { value: 'other', label: 'Other', icon: '🏃', color: 'bg-gray-100 text-gray-700' },
];

export default function VolumeSettings({ settings, onSettingsChange }: VolumeSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingActivity, setEditingActivity] = useState<string | null>(null);

  const handleBaseSettingsChange = (field: keyof CMEVolumeSettings, value: number) => {
    onSettingsChange({
      ...settings,
      [field]: value,
    });
  };

  const handleActivityChange = (activityId: string, field: keyof CMEActivity, value: any) => {
    const updatedActivities = settings.activities.map(activity =>
      activity.id === activityId ? { ...activity, [field]: value } : activity
    );
    onSettingsChange({
      ...settings,
      activities: updatedActivities,
    });
  };

  const handleAddActivity = () => {
    const newActivity: CMEActivity = {
      id: `activity-${Date.now()}`,
      name: 'New Activity',
      modality: 'running',
      baseVolume: 60,
      volumePercentage: 100 / (settings.activities.length + 1),
      color: 'bg-gray-100 text-gray-700',
      icon: '🏃',
    };

    // Recalculate percentages to maintain 100% total
    const updatedActivities = [...settings.activities, newActivity].map((activity, index) => ({
      ...activity,
      volumePercentage: 100 / (settings.activities.length + 1),
    }));

    onSettingsChange({
      ...settings,
      activities: updatedActivities,
    });
  };

  const handleRemoveActivity = (activityId: string) => {
    if (settings.activities.length <= 1) return; // Keep at least one activity

    const updatedActivities = settings.activities.filter(activity => activity.id !== activityId);
    
    // Recalculate percentages to maintain 100% total
    const recalculatedActivities = updatedActivities.map(activity => ({
      ...activity,
      volumePercentage: 100 / updatedActivities.length,
    }));

    onSettingsChange({
      ...settings,
      activities: recalculatedActivities,
    });
  };

  const getActivityOption = (modality: string) => {
    return activityOptions.find(option => option.value === modality) || activityOptions[0];
  };

  return (
    <div className="space-y-4">
      {/* Base Volume Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-600 mb-1 block">Baseline Weekly Volume</label>
          <div className="flex">
            <input
              type="number"
              className="w-full border rounded-l-md px-2 py-1 text-sm"
              value={settings.baselineVolume}
              onChange={(e) => handleBaseSettingsChange('baselineVolume', Number(e.target.value))}
              min={0}
            />
            <span className="bg-slate-100 border border-l-0 rounded-r-md px-2 py-1 text-sm text-slate-600">min</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-600 mb-1 block">Peak Volume Cap</label>
          <div className="flex">
            <input
              type="number"
              className="w-full border rounded-l-md px-2 py-1 text-sm"
              value={settings.peakVolume}
              onChange={(e) => handleBaseSettingsChange('peakVolume', Number(e.target.value))}
              min={0}
            />
            <span className="bg-slate-100 border border-l-0 rounded-r-md px-2 py-1 text-sm text-slate-600">min</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-600 mb-1 block">Max Ramp Rate</label>
          <div className="flex">
            <input
              type="number"
              className="w-full border rounded-l-md px-2 py-1 text-sm"
              value={settings.rampRate}
              onChange={(e) => handleBaseSettingsChange('rampRate', Number(e.target.value))}
              min={4}
              max={12}
            />
            <span className="bg-slate-100 border border-l-0 rounded-r-md px-2 py-1 text-sm text-slate-600">%</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-600 mb-1 block">Deload Cadence</label>
          <div className="flex">
            <input
              type="number"
              className="w-full border rounded-l-md px-2 py-1 text-sm"
              value={settings.deloadEvery}
              onChange={(e) => handleBaseSettingsChange('deloadEvery', Number(e.target.value))}
              min={2}
              max={5}
            />
            <span className="bg-slate-100 border border-l-0 rounded-r-md px-2 py-1 text-sm text-slate-600">wks</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-600 mb-1 block">Deload Reduction</label>
          <div className="flex">
            <input
              type="number"
              className="w-full border rounded-l-md px-2 py-1 text-sm"
              value={settings.deloadReduction}
              onChange={(e) => handleBaseSettingsChange('deloadReduction', Number(e.target.value))}
              min={10}
              max={30}
            />
            <span className="bg-slate-100 border border-l-0 rounded-r-md px-2 py-1 text-sm text-slate-600">%</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-600 mb-1 block">Phase Duration</label>
          <div className="flex">
            <input
              type="number"
              className="w-full border rounded-l-md px-2 py-1 text-sm"
              value={settings.phaseDuration}
              onChange={(e) => handleBaseSettingsChange('phaseDuration', Number(e.target.value))}
              min={2}
              max={12}
            />
            <span className="bg-slate-100 border border-l-0 rounded-r-md px-2 py-1 text-sm text-slate-600">wks</span>
          </div>
        </div>
      </div>

      {/* Activities Configuration */}
      <div className="border-t border-slate-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            <span>Activity Configuration</span>
            <HiChevronDown className={`h-4 w-4 transform transition-transform ${isExpanded ? '' : '-rotate-180'}`} />
          </button>
          <button
            type="button"
            onClick={handleAddActivity}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-sky-100 text-sky-700 hover:bg-sky-200 rounded transition-colors"
          >
            <HiPlus className="h-3 w-3" />
            Add Activity
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-3">
            {settings.activities.map((activity) => {
              const activityOption = getActivityOption(activity.modality);
              const isEditing = editingActivity === activity.id;

              return (
                <div key={activity.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-600 mb-1 block">Activity Name</label>
                          <input
                            type="text"
                            className="w-full border rounded px-2 py-1 text-sm"
                            value={activity.name}
                            onChange={(e) => handleActivityChange(activity.id, 'name', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-600 mb-1 block">Modality</label>
                          <select
                            className="w-full border rounded px-2 py-1 text-sm"
                            value={activity.modality}
                            onChange={(e) => {
                              const selectedOption = activityOptions.find(opt => opt.value === e.target.value);
                              handleActivityChange(activity.id, 'modality', e.target.value);
                              if (selectedOption) {
                                handleActivityChange(activity.id, 'icon', selectedOption.icon);
                                handleActivityChange(activity.id, 'color', selectedOption.color);
                              }
                            }}
                          >
                            {activityOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.icon} {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-600 mb-1 block">Base Volume (min/week)</label>
                          <input
                            type="number"
                            className="w-full border rounded px-2 py-1 text-sm"
                            value={activity.baseVolume}
                            onChange={(e) => handleActivityChange(activity.id, 'baseVolume', Number(e.target.value))}
                            min={0}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-600 mb-1 block">Volume %</label>
                          <input
                            type="number"
                            className="w-full border rounded px-2 py-1 text-sm"
                            value={activity.volumePercentage}
                            onChange={(e) => handleActivityChange(activity.id, 'volumePercentage', Number(e.target.value))}
                            min={0}
                            max={100}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingActivity(null)}
                          className="px-3 py-1 text-xs bg-sky-600 text-white rounded hover:bg-sky-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingActivity(null)}
                          className="px-3 py-1 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{activity.icon}</span>
                        <div>
                          <div className="text-sm font-medium text-slate-700">{activity.name}</div>
                          <div className="text-xs text-slate-500">
                            {activity.baseVolume} min/week • {activity.volumePercentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingActivity(activity.id)}
                          className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
                        >
                          Edit
                        </button>
                        {settings.activities.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveActivity(activity.id)}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          >
                            <HiTrash className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
