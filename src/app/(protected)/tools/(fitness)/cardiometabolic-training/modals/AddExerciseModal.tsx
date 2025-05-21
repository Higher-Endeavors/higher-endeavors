// Core
'use client';

// Dependencies
import { useState } from 'react';
import { Modal } from 'flowbite-react';
import Select from 'react-select';

// Components


interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
}


export default function AddExerciseModal({ isOpen, onClose }: AddExerciseModalProps) {
  // CardioMetabolic Endurance Training fields
  const [exerciseName, setExerciseName] = useState('');
  const [pairing, setPairing] = useState('Work');
  const [useIntervals, setUseIntervals] = useState(true);
  const [intervals, setIntervals] = useState([
    { duration: 5, intensity: '', intensityMetric: 'Pace', notes: '' }
  ]);

  const pairingOptions = [
    { value: 'Warm-Up', label: 'Warm-Up' },
    { value: 'Work', label: 'Work' },
    { value: 'Recovery', label: 'Recovery' },
    { value: 'Cool-Down', label: 'Cool-Down' },
  ];
  const intensityMetricOptions = [
    { value: 'Pace', label: 'Pace' },
    { value: 'Heart Rate', label: 'Heart Rate' },
    { value: 'Watts', label: 'Watts' },
    { value: 'Other', label: 'Other' },
  ];

  const handleIntervalChange = (idx: number, field: string, value: any) => {
    setIntervals(prev => prev.map((interval, i) =>
      i === idx ? { ...interval, [field]: value } : interval
    ));
  };

  const handleAddInterval = () => {
    setIntervals(prev => [
      ...prev,
      { duration: 5, intensity: '', intensityMetric: 'Pace', notes: '' }
    ]);
  };

  const handleRemoveInterval = (idx: number) => {
    setIntervals(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="xl">
      <Modal.Header className="dark:text-white">
        Add CardioMetabolic Exercise
      </Modal.Header>
      <Modal.Body>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Exercise Name */}
            <div className="col-span-2">
              <label htmlFor="exercise-name" className="block text-sm font-medium dark:text-white">
                Exercise Name
              </label>
              <input
                id="exercise-name"
                type="text"
                value={exerciseName}
                onChange={e => setExerciseName(e.target.value)}
                placeholder="e.g., Treadmill Intervals"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
              />
            </div>

            {/* Pairing/Grouping */}
            <div>
              <label htmlFor="pairing" className="block text-sm font-medium dark:text-white">
                Pairing / Grouping
              </label>
              <Select
                id="pairing"
                options={pairingOptions}
                value={pairingOptions.find(opt => opt.value === pairing)}
                onChange={opt => setPairing(opt?.value || 'Work')}
                classNamePrefix="select"
                className="dark:text-slate-700"
              />
            </div>

            {/* Intervals Checkbox */}
            <div className="flex items-center space-x-2 mt-6">
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

          {/* Intervals Table or Single Interval */}
          {useIntervals ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-semibold dark:text-white">Intervals</h3>
                <button
                  type="button"
                  onClick={handleAddInterval}
                  className="px-2 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  + Add Interval
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="px-2 py-1 border">#</th>
                      <th className="px-2 py-1 border">Duration (min)</th>
                      <th className="px-2 py-1 border">Intensity</th>
                      <th className="px-2 py-1 border">Intensity Metric</th>
                      <th className="px-2 py-1 border">Notes</th>
                      <th className="px-2 py-1 border"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {intervals.map((interval, idx) => (
                      <tr key={idx}>
                        <td className="px-2 py-1 border text-center">{idx + 1}</td>
                        <td className="px-2 py-1 border">
                          <input
                            type="number"
                            min="1"
                            value={interval.duration}
                            onChange={e => handleIntervalChange(idx, 'duration', Number(e.target.value))}
                            className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-1"
                          />
                        </td>
                        <td className="px-2 py-1 border">
                          <input
                            type="text"
                            value={interval.intensity}
                            onChange={e => handleIntervalChange(idx, 'intensity', e.target.value)}
                            className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-1"
                          />
                        </td>
                        <td className="px-2 py-1 border min-w-[120px]">
                          <Select
                            options={intensityMetricOptions}
                            value={intensityMetricOptions.find(opt => opt.value === interval.intensityMetric)}
                            onChange={opt => handleIntervalChange(idx, 'intensityMetric', opt?.value || 'Pace')}
                            classNamePrefix="select"
                            className="dark:text-slate-700"
                            styles={{ menu: base => ({ ...base, zIndex: 9999 }), control: base => ({ ...base, minWidth: 120, width: '100%' }) }}
                          />
                        </td>
                        <td className="px-2 py-1 border">
                          <input
                            type="text"
                            value={interval.notes}
                            onChange={e => handleIntervalChange(idx, 'notes', e.target.value)}
                            className="w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-1"
                          />
                        </td>
                        <td className="px-2 py-1 border text-center">
                          {intervals.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveInterval(idx)}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-md font-semibold dark:text-white">Interval</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium dark:text-white">Duration (min)</label>
                  <input
                    type="number"
                    min="1"
                    value={intervals[0].duration}
                    onChange={e => handleIntervalChange(0, 'duration', Number(e.target.value))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-white">Intensity</label>
                  <input
                    type="text"
                    value={intervals[0].intensity}
                    onChange={e => handleIntervalChange(0, 'intensity', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-white">Intensity Metric</label>
                  <Select
                    options={intensityMetricOptions}
                    value={intensityMetricOptions.find(opt => opt.value === intervals[0].intensityMetric)}
                    onChange={opt => handleIntervalChange(0, 'intensityMetric', opt?.value || 'Pace')}
                    classNamePrefix="select"
                    className="dark:text-slate-700"
                    styles={{ menu: base => ({ ...base, zIndex: 9999 }), control: base => ({ ...base, minWidth: 120, width: '100%' }) }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-white">Notes</label>
                  <input
                    type="text"
                    value={intervals[0].notes}
                    onChange={e => handleIntervalChange(0, 'notes', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-1"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Exercise
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}