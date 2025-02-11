'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Program } from '../../shared/types';
import { HiDotsVertical } from 'react-icons/hi';
import { Modal } from 'flowbite-react';

interface SavedProgram extends Omit<Program, 'createdAt' | 'updatedAt'> {
  program_name: string;
  periodization_type: string;
  created_at: string;
  updated_at: string;
  exerciseCount?: number;
  notes?: string;
  weeks?: any[];
}

interface ProgramBrowserProps {
  onProgramSelect: (program: SavedProgram) => void;
  currentUserId: number;
  isAdmin: boolean;
}

export default function ProgramBrowser({ onProgramSelect, currentUserId, isAdmin }: ProgramBrowserProps) {
  const [programs, setPrograms] = useState<SavedProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<SavedProgram | null>(null);
  const ITEMS_PER_PAGE = 5;
  const [filters, setFilters] = useState({
    search: '',
    dateRange: 'all', // all, week, month, year
    phaseFocus: '',
    periodizationType: '',
    exercise: '',
    sortBy: 'newest' // newest, oldest, name
  });

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/resistance-training/programs?userId=${currentUserId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch programs');
      }
      
      const data = await response.json();
      console.log('Debug - Programs API Response:', data);
      setPrograms(data.programs);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Debug - useEffect triggered with currentUserId:', currentUserId);
    setCurrentPage(1); // Reset to first page when user changes
    fetchPrograms();
  }, [currentUserId, isAdmin]);

  const filteredPrograms = programs.filter(program => {
    if (filters.search && !program.program_name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    if (filters.phaseFocus && program.phaseFocus !== filters.phaseFocus) {
      return false;
    }

    if (filters.periodizationType && program.periodization_type !== filters.periodizationType) {
      return false;
    }

    // Date range filtering
    if (filters.dateRange !== 'all') {
      const date = new Date(program.created_at);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = diff / (1000 * 60 * 60 * 24);

      switch (filters.dateRange) {
        case 'week':
          if (days > 7) return false;
          break;
        case 'month':
          if (days > 30) return false;
          break;
        case 'year':
          if (days > 365) return false;
          break;
      }
    }

    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'name':
        return a.program_name.localeCompare(b.program_name);
      default:
        return 0;
    }
  });

  // Get current programs
  const indexOfLastProgram = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstProgram = indexOfLastProgram - ITEMS_PER_PAGE;
  const currentPrograms = filteredPrograms.slice(indexOfFirstProgram, indexOfLastProgram);
  const totalPages = Math.ceil(filteredPrograms.length / ITEMS_PER_PAGE);

  // Change page
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleMenuClick = (e: React.MouseEvent, programId: string) => {
    e.stopPropagation(); // Prevent card click when clicking menu
    setActiveMenu(activeMenu === programId ? null : programId);
  };

  const handleViewEdit = async (e: React.MouseEvent, program: SavedProgram) => {
    e.stopPropagation();
    try {
      // Fetch the complete program data including exercises and progression rules
      const response = await fetch(`/api/resistance-training/program/${program.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch program data');
      }
      const programData = await response.json();

      // Combine the program metadata with the fetched data
      const fullProgram = {
        ...program,
        exercises: programData.weeks?.[0]?.days?.[0]?.exercises || [],
        progressionRules: program.progressionRules || {
          type: program.periodization_type,
          settings: {
            volumeIncrementPercentage: 10,
            loadIncrementPercentage: 5,
            programLength: 4,
            weeklyVolumePercentages: [100, 80, 90, 60]
          }
        }
      };

      onProgramSelect(fullProgram);
      setActiveMenu(null);
    } catch (error) {
      console.error('Error loading program:', error);
    }
  };

  const handleDuplicate = async (e: React.MouseEvent, program: SavedProgram) => {
    e.stopPropagation();
    try {
      // First, fetch the original program to get its weeks and exercises
      const originalResponse = await fetch(`/api/resistance-training/program/${program.id}`);
      if (!originalResponse.ok) {
        throw new Error('Failed to fetch original program data');
      }
      const originalData = await originalResponse.json();

      // Transform the weeks data to ensure each exercise has a sets array
      const transformedWeeks = originalData.weeks.map((week: any) => ({
        ...week,
        days: week.days.map((day: any) => ({
          ...day,
          exercises: day.exercises.map((exercise: any) => ({
            ...exercise,
            // Transform sets number into an array of set objects
            sets: Array.isArray(exercise.sets) ? exercise.sets : Array.from({ length: exercise.sets }, (_, i) => ({
              setNumber: i + 1,
              reps: exercise.reps,
              load: exercise.load,
              loadUnit: exercise.loadUnit || 'lbs',
              tempo: exercise.tempo || '2010',
              rest: exercise.rest || 60,
              notes: ''
            }))
          }))
        }))
      }));

      const duplicatedProgram = {
        name: `${program.program_name} (Copy)`,
        periodizationType: program.periodization_type,
        phaseFocus: program.phaseFocus,
        progressionRules: program.progressionRules,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + (4 * 7 * 24 * 60 * 60 * 1000)).toISOString(),
        notes: program.notes || '',
        weeks: transformedWeeks,
        userId: currentUserId
      };
      
      console.log('Sending duplicated program data:', duplicatedProgram);
      
      const response = await fetch('/api/resistance-training/program', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicatedProgram),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to duplicate program: ${errorText}`);
      }

      // Refresh the programs list
      fetchPrograms();
    } catch (error) {
      console.error('Error duplicating program:', error);
    }
    setActiveMenu(null);
  };

  const handleDeleteClick = (e: React.MouseEvent, program: SavedProgram) => {
    e.stopPropagation();
    setProgramToDelete(program);
    setShowDeleteConfirm(true);
    setActiveMenu(null);
  };

  const handleDeleteConfirm = async () => {
    if (!programToDelete) return;

    try {
      const response = await fetch(`/api/resistance-training/program/${programToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete program');
      }

      // Update the local state by removing the deleted program
      setPrograms(programs.filter(p => p.id !== programToDelete.id));
      setShowDeleteConfirm(false);
      setProgramToDelete(null);

    } catch (error) {
      console.error('Error deleting program:', error);
    }
  };

  return (
    <div className="bg-gray-100 rounded-lg shadow p-6">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h2 className="text-xl font-semibold dark:text-slate-900">Saved Programs</h2>
        <button
          className="text-gray-500 hover:text-gray-700 focus:outline-none transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="p-4">
          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            <input
              type="text"
              placeholder="Search programs..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              >
                <option value="all">All Time</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name</option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={filters.phaseFocus}
                onChange={(e) => setFilters({ ...filters, phaseFocus: e.target.value })}
              >
                <option value="">All Phases</option>
                <option value="GPP">GPP</option>
                <option value="Strength">Strength</option>
                <option value="Hypertrophy">Hypertrophy</option>
                <option value="Power">Power</option>
                <option value="Endurance">Endurance</option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={filters.periodizationType}
                onChange={(e) => setFilters({ ...filters, periodizationType: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="Linear">Linear</option>
                <option value="Undulating">Undulating</option>
                <option value="Block">Block</option>
                <option value="None">None</option>
              </select>
            </div>
          </div>

          {/* Programs List */}
          {loading ? (
            <div className="text-center py-4 text-gray-900">Loading programs...</div>
          ) : filteredPrograms.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No programs found
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {currentPrograms.map((program) => (
                  <div
                    key={program.id}
                    className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer relative bg-white text-gray-900"
                    onClick={() => onProgramSelect(program)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <h3 className="font-medium text-gray-900">{program.program_name}</h3>
                        <span className="text-sm text-gray-500">
                          {format(new Date(program.created_at), 'MMM d, yyyy')}
                        </span>
                        {program.exerciseCount && (
                          <span className="text-sm text-gray-500">
                            {program.exerciseCount} exercises
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <button
                          onClick={(e) => handleMenuClick(e, program.id)}
                          className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-600"
                        >
                          <HiDotsVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                        {activeMenu === program.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                            <div className="py-1">
                              <button
                                onClick={(e) => handleViewEdit(e, program)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                              >
                                View/Edit
                              </button>
                              <button
                                onClick={(e) => handleDuplicate(e, program)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                              >
                                Duplicate
                              </button>
                              <button
                                onClick={(e) => handleDeleteClick(e, program)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-600"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col space-y-2">
                        <div className="flex space-x-4">
                          <span>{program.periodization_type || 'No type'}</span>
                        </div>
                        <div className="text-xs">
                          {program.exercises?.map(exercise => exercise.name).join(', ') || 'No exercises'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => handlePageChange(number)}
                      className={`px-3 py-1 rounded ${
                        currentPage === number
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${
                      currentPage === totalPages
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setProgramToDelete(null);
        }}
        size="md"
      >
        <Modal.Header>Delete Program</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete "{programToDelete?.program_name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setProgramToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete Program
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
} 