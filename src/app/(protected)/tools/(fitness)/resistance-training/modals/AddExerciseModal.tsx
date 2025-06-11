// Core
'use client';

// Dependencies
import { useState } from 'react';
import { Modal } from 'flowbite-react';
import Select from 'react-select';
import React from 'react';
import { BsPlus, BsDash } from 'react-icons/bs';

// Components
import AdvancedExerciseSearch from './AdvancedExerciseSearch';

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
}


export default function AddExerciseModal({ isOpen, onClose }: AddExerciseModalProps) {
  const [isVariedSets, setIsVariedSets] = useState(false);
  const [isAdvancedSets, setIsAdvancedSets] = useState(false);
  const [useAlternateUnit, setUseAlternateUnit] = useState(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [setsCount, setSetsCount] = useState(3); // default to 3 sets
  const [variedSets, setVariedSets] = useState<{ reps: string; load: string; rest: string; subSets: { reps: string; load: string; rest: string }[] }[]>([
    { reps: '', load: '', rest: '', subSets: [] },
    { reps: '', load: '', rest: '', subSets: [] },
    { reps: '', load: '', rest: '', subSets: [] },
  ]);

  const defaultUnit = 'lbs';
  const alternateUnit = 'kg';

  // Keep variedSets array in sync with setsCount
  React.useEffect(() => {
    if (isVariedSets) {
      setVariedSets((prev) => {
        const newArr = [...prev];
        if (setsCount > prev.length) {
          for (let i = prev.length; i < setsCount; i++) {
            newArr.push({ reps: '', load: '', rest: '', subSets: [] });
          }
        } else if (setsCount < prev.length) {
          newArr.length = setsCount;
        }
        return newArr;
      });
    }
  }, [setsCount, isVariedSets]);

  return (
    <Modal show={isOpen} onClose={onClose} size="xl">
      <Modal.Header className="dark:text-white">
        Add Exercise
      </Modal.Header>
      <Modal.Body>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Exercise Selection Section */}
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="exercise-select" className="block text-sm font-medium dark:text-white">
                  Exercise Name
                </label>
                <button
                    type="button"
                    onClick={() => setIsAdvancedSearchOpen(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                    Advanced Search
                </button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    className="basic-single dark:text-slate-700"
                    classNamePrefix="select"
                    placeholder="Select or search for an exercise..."
                    isClearable
                  />
                </div>
              </div>
            </div>

            {/* Pairing Input */}
            <div>
              <label htmlFor="exercise-pairing" className="block text-sm font-medium dark:text-white">
                Pairing
              </label>
              <input
                id="exercise-pairing"
                type="text"
                placeholder="e.g., A1, B2"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
              />
            </div>

            {/* Sets Input Section */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="exercise-sets" className="block text-sm font-medium dark:text-white">
                  Sets
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="variedSets"
                    checked={isVariedSets}
                    onChange={(e) => setIsVariedSets(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="variedSets" className="text-sm font-medium dark:text-white">
                    Varied sets
                  </label>
                </div>
              </div>
              <input
                id="exercise-sets"
                type="number"
                min="1"
                placeholder="Enter number of sets"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                value={setsCount}
                onChange={e => {
                  const val = Math.max(1, Number(e.target.value));
                  setSetsCount(val);
                }}
              />
            </div>

            {/* Reps Input */}
            {!isVariedSets ? (
              <div>
                <label htmlFor="exercise-reps" className="block text-sm font-medium dark:text-white">
                  Reps
                </label>
                <input
                  id="exercise-reps"
                  type="number"
                  placeholder="Enter number of reps"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                />
              </div>
            ) : (
              <div />
            )}

            {/* Load Input with Unit Toggle */}
            {!isVariedSets ? (
              <div>
                <div className="flex items-center space-x-1">
                  <label htmlFor="exercise-load" className="block text-sm font-medium dark:text-white">
                    Load
                  </label>
                  <div className="group relative">
                    <svg className="h-4 w-4 text-gray-400 hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="exercise-load"
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                    placeholder={`Enter weight in ${useAlternateUnit ? alternateUnit : defaultUnit}, BW, or band color`}
                  />
                  <button
                    type="button"
                    onClick={() => setUseAlternateUnit(!useAlternateUnit)}
                    className="mt-1 px-2 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md flex items-center space-x-1 text-gray-700"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span>{useAlternateUnit ? 'kg' : 'lbs'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setUseAlternateUnit(!useAlternateUnit)}
                  className="mt-1 px-2 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md flex items-center space-x-1 text-gray-700"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>{useAlternateUnit ? 'kg' : 'lbs'}</span>
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400">Load unit applies to all sets</span>
              </div>
            )}

            {/* Tempo Input */}
            <div>
              <label htmlFor="exercise-tempo" className="block text-sm font-medium dark:text-white">
                Tempo (4 digits, X for explosive)
              </label>
              <input
                id="exercise-tempo"
                type="text"
                placeholder="e.g., 2010"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
              />
            </div>

            {/* Rest Input */}
            {(!isVariedSets || !isAdvancedSets) && (
              <div>
                <label htmlFor="exercise-rest" className="block text-sm font-medium dark:text-white">
                  Rest (seconds)
                </label>
                <input
                  id="exercise-rest"
                  type="number"
                  placeholder="Enter rest period"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                />
              </div>
            )}

            {/* Notes Field */}
            <div className="col-span-2">
              <label htmlFor="exercise-notes" className="block text-sm font-medium dark:text-white">
                Notes
              </label>
              <textarea
                id="exercise-notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black p-2"
                placeholder="Add any additional notes about the exercise"
              />
            </div>
          </div>

          {/* Varied Sets Form */}
          {isVariedSets && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium dark:text-white">Set Details</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="advancedSets"
                      checked={isAdvancedSets}
                      onChange={(e) => setIsAdvancedSets(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="advancedSets" className="text-sm font-medium dark:text-white">
                      Advanced Sets
                    </label>
                  </div>
                </div>
              </div>
              <div className="grid gap-4">
                {variedSets.map((set, idx) => (
                  <div key={idx} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium dark:text-white">Set {idx + 1}</span>
                      {isAdvancedSets && (
                        <button
                          type="button"
                          onClick={() => {
                            setVariedSets(prev => prev.map((s, i) => i === idx ? {
                              ...s,
                              subSets: [
                                ...s.subSets,
                                { reps: s.reps, load: s.load, rest: s.rest }
                              ]
                            } : s));
                          }}
                          aria-label={`Add subset to set ${idx + 1}`}
                          className="p-1 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full border border-blue-200"
                        >
                          <BsPlus className="w-5 h-5" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                    {/* Main set inputs */}
                    <div className={`grid grid-cols-${isAdvancedSets ? '3' : '2'} gap-4`}>
                      <div>
                        <label className="block text-sm dark:text-white">Reps</label>
                        <input
                          type="number"
                          placeholder="Enter reps"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                          value={set.reps}
                          onChange={e => {
                            const newVal = e.target.value;
                            setVariedSets(prev => prev.map((s, i) => i === idx ? { ...s, reps: newVal } : s));
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm dark:text-white">Load</label>
                        <input
                          type="text"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                          placeholder={`Enter weight in ${useAlternateUnit ? alternateUnit : defaultUnit} or band color`}
                          value={set.load}
                          onChange={e => {
                            const newVal = e.target.value;
                            setVariedSets(prev => prev.map((s, i) => i === idx ? { ...s, load: newVal } : s));
                          }}
                        />
                      </div>
                      {isAdvancedSets && (
                        <div>
                          <label className="block text-sm dark:text-white">Rest</label>
                          <input
                            type="number"
                            placeholder="Enter rest"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                            value={set.rest}
                            onChange={e => {
                              const newVal = e.target.value;
                              setVariedSets(prev => prev.map((s, i) => i === idx ? { ...s, rest: newVal } : s));
                            }}
                          />
                        </div>
                      )}
                    </div>
                    {/* Sub-sets */}
                    {isAdvancedSets && set.subSets.map((subSet, subSetIdx) => (
                      <div key={subSetIdx} className="space-y-4 p-4 border rounded-lg mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium dark:text-white">
                            Set {idx + 1}.{subSetIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setVariedSets(prev => prev.map((s, i) => i === idx ? {
                                ...s,
                                subSets: s.subSets.filter((_, j) => j !== subSetIdx)
                              } : s));
                            }}
                            aria-label={`Remove subset ${subSetIdx + 1} from set ${idx + 1}`}
                            className="p-1 text-red-600 bg-red-50 hover:bg-red-100 rounded-full border border-red-200"
                          >
                            <BsDash className="w-5 h-5" aria-hidden="true" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm dark:text-white">Reps</label>
                            <input
                              type="number"
                              placeholder="Enter reps"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                              value={subSet.reps}
                              onChange={e => {
                                const newVal = e.target.value;
                                setVariedSets(prev => prev.map((s, i) => i === idx ? {
                                  ...s,
                                  subSets: s.subSets.map((ss, j) => j === subSetIdx ? { ...ss, reps: newVal } : ss)
                                } : s));
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm dark:text-white">Load</label>
                            <input
                              type="text"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                              placeholder={`Enter weight in ${useAlternateUnit ? alternateUnit : defaultUnit} or band color`}
                              value={subSet.load}
                              onChange={e => {
                                const newVal = e.target.value;
                                setVariedSets(prev => prev.map((s, i) => i === idx ? {
                                  ...s,
                                  subSets: s.subSets.map((ss, j) => j === subSetIdx ? { ...ss, load: newVal } : ss)
                                } : s));
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm dark:text-white">Rest</label>
                            <input
                              type="number"
                              placeholder="Enter rest"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-black"
                              value={subSet.rest}
                              onChange={e => {
                                const newVal = e.target.value;
                                setVariedSets(prev => prev.map((s, i) => i === idx ? {
                                  ...s,
                                  subSets: s.subSets.map((ss, j) => j === subSetIdx ? { ...ss, rest: newVal } : ss)
                                } : s));
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

            <AdvancedExerciseSearch
            isOpen={isAdvancedSearchOpen}
            onClose={() => setIsAdvancedSearchOpen(false)}
            onSelect={(exercise) => {
                // Handle the selected exercise
                console.log('Selected exercise:', exercise);
                setIsAdvancedSearchOpen(false);
            }}
            />

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