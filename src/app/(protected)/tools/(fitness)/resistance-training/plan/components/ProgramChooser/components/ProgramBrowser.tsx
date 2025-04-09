'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { program, exercise, saved_program, program_list_item } from '@/app/lib/types/pillars/fitness';
import { HiOutlineDotsVertical, HiOutlinePencil, HiOutlineTrash, HiOutlineDuplicate } from 'react-icons/hi';
import { Modal } from 'flowbite-react';

// How many programs to show per page
const ITEMS_PER_PAGE = 5;

interface ProgramBrowserProps {
  onProgramSelect: (program: program_list_item) => void;
  currentUserId: number;
  isAdmin?: boolean;
  onProgramDelete?: (programId: number) => void;
}

/**
* MenuState tracks which program's action menu is currently open.
 * It's an object where:
 * - Keys are program IDs (like "program123")
 * - Values are booleans (true = menu is open, false = menu is closed)
 * 
 * Example:
 * {
 *   "program123": true,   // This program's menu is visible
 *   "program456": false,  // This program's menu is hidden
 * } 
 * Interface for tracking menu state
 * Using camelCase as this is React component state
 */
interface MenuState {
  [key: string]: boolean;
}

/**
 * Interface for filter state
 * Using camelCase as this is React component state
 */
interface FilterState {
  search: string;
  dateRange: 'all' | 'week' | 'month' | 'year';
  phaseFocus: string;
  periodizationType: string;
  sortBy: 'newest' | 'oldest' | 'name';
}

/**
 * ProgramBrowser is like a file explorer for workout programs. It lets users:
 * 1. View a list of saved workout programs
 * 2. Search and filter programs by different criteria
 * 3. Sort programs by date or name
 * 4. Perform actions like edit, duplicate, or delete programs
 * 
 * The component handles:
 * - Loading programs from the server
 * - Pagination (showing programs in smaller groups)
 * - Program management (duplicate/delete)
 * - Search and filtering
 */
export default function ProgramBrowser({ 
  onProgramSelect, 
  currentUserId, 
  isAdmin = false,
  onProgramDelete
}: ProgramBrowserProps) {
  // Track the state of programs and UI (using camelCase for React state)
  const [programs, setPrograms] = useState<program_list_item[]>([]);
  const [menuState, setMenuState] = useState<MenuState>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<program_list_item | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState({
    programs: true,
    delete: false,
    duplicate: false
  });
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Search and filter settings (using camelCase for React state)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    dateRange: 'all',
    phaseFocus: '',
    periodizationType: '',
    sortBy: 'newest'
  });

  // Additional state for exercise filtering
  // const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  // const [showSuggestions, setShowSuggestions] = useState(false);
  // const [commonExercises, setCommonExercises] = useState<string[]>([]);



// Future Enhancement: Exercise filtering state
// const [exercises, setExercises] = useState<exercise[]>([]);

// const fetchExercises = async () => {
//   try {
//     const exercises = await exerciseService.fetchAll();
//     setExercises(exercises);
//   } catch (error) {
//     console.error('Error fetching exercises:', error);
//   }
// };

  /**
   * Fetches programs from the server for the current user
   * For admin users, can fetch programs for other users
   */
   // Filter logic
const getFilteredPrograms = useCallback((programs: program_list_item[]) => {
  return programs.filter(program => {
    if (filters.search && !program.program_name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    if (filters.phaseFocus && program.phase_focus !== filters.phaseFocus) {
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
}, [filters]);
  
const fetchPrograms = async () => {
  try {
    setIsLoading(prev => ({ ...prev, programs: true }));
    setHasAttemptedLoad(false);
    
    const response = await fetch(`/api/resistance-training/programs?userId=${currentUserId}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch programs');
    }
    
    const data = await response.json();
    setPrograms(data.programs);
    
  } catch (error) {
    handleError(error, 'fetch programs');
  } finally {
    setTimeout(() => {
      setHasAttemptedLoad(true);
      setIsLoading(prev => ({ ...prev, programs: false }));
    }, 2000);
  }
};

  // Error handling utility
const handleError = (error: unknown, action: string) => {
  const errorMessage = error instanceof Error ? error.message : `Failed to ${action}`;
  setError(errorMessage);
};

 
// Apply filters to programs 
const filteredPrograms = useMemo(() => 
  getFilteredPrograms(programs),
  [programs, getFilteredPrograms]
);

const getPaginatedPrograms = useCallback(() => {
  const indexOfLastProgram = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstProgram = indexOfLastProgram - ITEMS_PER_PAGE;
  return filteredPrograms.slice(indexOfFirstProgram, indexOfLastProgram);
}, [currentPage, filteredPrograms]);

  useEffect(() => {
    setCurrentPage(1);
    fetchPrograms();
  }, [currentUserId, isAdmin]);

  useEffect(() => {
    return () => {
      setMenuState({});
      setProgramToDelete(null);
    };
  }, []);

  const paginationInfo = useMemo(() => ({
    totalPages: Math.ceil(filteredPrograms.length / ITEMS_PER_PAGE),
    currentPage,
    hasNextPage: currentPage < Math.ceil(filteredPrograms.length / ITEMS_PER_PAGE),
    hasPrevPage: currentPage > 1
  }), [filteredPrograms.length, currentPage]);

  const currentPrograms = getPaginatedPrograms();

  // Event handlers (using camelCase as these are React-specific)
  const handleMenuClick = useCallback((e: React.MouseEvent, programId: number) => {
    e.stopPropagation();
    setMenuState(prev => ({
      ...prev,
      [programId.toString()]: !prev[programId.toString()]
    }));
  }, []);

  const handleViewEdit = useCallback((e: React.MouseEvent, program: program_list_item) => {
    e.stopPropagation();
    onProgramSelect(program);
    setMenuState(prev => ({ ...prev, [program.id]: false }));
  }, [onProgramSelect]);

  const handleDuplicateClick = useCallback(async (e: React.MouseEvent, program: program_list_item) => {
    e.stopPropagation();
    try {
      setIsLoading(prev => ({ ...prev, duplicate: true }));
      // ... duplicate logic ...
    } catch (error) {
      handleError(error, 'duplicate program');
    } finally {
      setIsLoading(prev => ({ ...prev, duplicate: false }));
    }
  }, [currentUserId, fetchPrograms]);

  const handleDeleteClick = useCallback((e: React.MouseEvent, program: program_list_item) => {
    e.stopPropagation();
    setProgramToDelete(program);
    setShowDeleteConfirm(true);
    setMenuState(prev => ({ ...prev, [program.id]: false }));
  }, []);

  const handleDeleteConfirm = async () => {
    if (!programToDelete) return;

    try {
      const response = await fetch(`/api/resistance-training/program/${programToDelete.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete program');
      }

      const updatedPrograms = programs.filter(p => p.id !== programToDelete.id);
      setPrograms(updatedPrograms);
      if (onProgramDelete) {
        onProgramDelete(programToDelete.id);
      }
      setShowDeleteConfirm(false);
      setProgramToDelete(null);
    } catch (error) {
      console.error('Error deleting program:', error);
    }
  };

  const handlePageChange = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
  }, []);

  // const handleExerciseSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = e.target.value;
  //   setFilters({ ...filters, exerciseSearch: value });
  //   setShowSuggestions(true);
  // };

  // const addExercise = (exercise: string) => {
  //   if (!selectedExercises.includes(exercise)) {
  //     setSelectedExercises([...selectedExercises, exercise]);
  //   }
  //   setShowSuggestions(false);
  // };

  // const removeExercise = (exercise: string) => {
  //   const newSelectedExercises = selectedExercises.filter(e => e !== exercise);
  //   setSelectedExercises(newSelectedExercises);
  // };

  // const filteredExerciseSuggestions = commonExercises.filter(exercise =>
  //   exercise.toLowerCase().includes(filters.exerciseSearch.toLowerCase())
  // );
  const totalPages = Math.ceil(filteredPrograms.length / ITEMS_PER_PAGE);

  return (
    <div className="bg-gray-100 dark:bg-[#e0e0e0] rounded-lg shadow p-6">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-900">Saved Programs</h2>
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
        <div className="mt-4">
          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            <input
              type="text"
              placeholder="Search programs..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-white dark:border-gray-300 dark:text-slate-900"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />

            {/* Future Enhancement: Exercise Search Section
            <div className="relative">
              <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md bg-white">
                {selectedExercises.map(exercise => (
                  <span key={exercise} className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded">
                    {exercise}
                    <button onClick={() => removeExercise(exercise)} className="ml-1">×</button>
                  </span>
                ))}
                
                <input
                  type="text"
                  placeholder="Search by exercise..."
                  className="flex-grow min-w-[200px] border-none focus:ring-0"
                  onChange={handleExerciseSearch}
                />
              </div>

              {showSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="p-2 border-b border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500">Common Exercises</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {commonExercises.slice(0, 5).map(exercise => (
                        <button
                          key={exercise}
                          onClick={() => addExercise(exercise)}
                          className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                        >
                          {exercise}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <ul className="max-h-48 overflow-y-auto">
                    {filteredExerciseSuggestions.map(exercise => (
                      <li
                        key={exercise}
                        onClick={() => addExercise(exercise)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {exercise}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            */}

            <div className="grid grid-cols-2 gap-4">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-white dark:border-gray-300 dark:text-slate-900"
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as 'all' | 'week' | 'month' | 'year' })}
              >
                <option value="all">All Time</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-white dark:border-gray-300 dark:text-slate-900"
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as 'newest' | 'oldest' | 'name' })}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name</option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-white dark:border-gray-300 dark:text-slate-900"
                value={filters.phaseFocus}
                onChange={(e) => setFilters({ ...filters, phaseFocus: e.target.value })}
              >
                <option value="">All Phases/ Focus</option>
                <option value="GPP">GPP</option>
                <option value="Strength">Strength</option>
                <option value="Hypertrophy">Hypertrophy</option>
                <option value="Power">Power</option>
                <option value="Endurance">Endurance</option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-white dark:border-gray-300 dark:text-slate-900"
                value={filters.periodizationType}
                onChange={(e) => setFilters({ ...filters, periodizationType: e.target.value })}
              >
                <option value="">All Periodization Types</option>
                <option value="Linear">Linear</option>
                <option value="Undulating">Undulating</option>
                <option value="Block">Block</option>
                <option value="None">None</option>
              </select>
            </div>
          </div>

          {/* Programs List */}
          {isLoading.programs && !hasAttemptedLoad ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-red-600 text-center p-4">
              {error}
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              <p className="text-lg font-medium mb-2">No Saved Programs</p>
              <p className="text-sm text-center">Create your first Resistance Training Program to get started</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {currentPrograms.map((program) => (
                  <div
                    key={program.id}
                    className="border border-gray-200 dark:border-gray-300 rounded-md p-4 hover:bg-gray-50 dark:hover:bg-gray-100 cursor-pointer relative bg-white dark:bg-white"
                    onClick={() => onProgramSelect(program)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <h3 className="font-medium text-gray-900 dark:text-slate-900">{program.program_name}</h3>
                        <span className="text-sm text-gray-500 dark:text-slate-600">
                          {format(new Date(program.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="relative">
                        <button
                          onClick={(e) => handleMenuClick(e, program.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-200 rounded-full"
                        >
                          <HiOutlineDotsVertical className="w-5 h-5 text-gray-500 dark:text-slate-600" />
                        </button>
                        {menuState[program.id] && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-white rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-300">
                            <div className="py-1">
                              <button
                                onClick={(e) => handleViewEdit(e, program)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-slate-900 hover:bg-gray-100 dark:hover:bg-gray-200"
                              >
                                <HiOutlinePencil className="mr-2" />
                                View/Edit
                              </button>
                              <button
                                onClick={(e) => handleDuplicateClick(e, program)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-slate-900 hover:bg-gray-100 dark:hover:bg-gray-200"
                              >
                                <HiOutlineDuplicate className="mr-2" />
                                Duplicate
                              </button>
                              <button
                                onClick={(e) => handleDeleteClick(e, program)}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-700 hover:bg-gray-100 dark:hover:bg-gray-200"
                              >
                                <HiOutlineTrash className="mr-2" />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500 dark:text-slate-600">
                      <div className="flex flex-col space-y-1">
                        <div className="flex space-x-4">
                          <span>Type: {program.periodization_type || 'None'}</span>
                          <span>Phase: {program.phase_focus || 'Not specified'}</span>
                        </div>
                        {program.exercise_summary && program.exercise_summary.exercises && program.exercise_summary.exercises.length > 0 && (
                          <div className="mt-2">
                            <span className="font-medium">Exercises ({program.exercise_summary.total_exercises}): </span>
                            <span>{program.exercise_summary.exercises.map((ex: { name: string }) => ex.name).join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {paginationInfo.totalPages > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!paginationInfo.hasPrevPage}
                    className={`px-3 py-1 rounded ${
                      !paginationInfo.hasPrevPage
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-300 dark:text-gray-600'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-200 dark:text-slate-900 dark:hover:bg-gray-300'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: paginationInfo.totalPages }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => handlePageChange(number)}
                      className={`px-3 py-1 rounded ${
                        paginationInfo.currentPage === number
                          ? 'bg-blue-600 text-white dark:bg-blue-700'
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-200 dark:text-slate-900 dark:hover:bg-gray-300'
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!paginationInfo.hasNextPage}
                    className={`px-3 py-1 rounded ${
                      !paginationInfo.hasNextPage
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-300 dark:text-gray-600'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-200 dark:text-slate-900 dark:hover:bg-gray-300'
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
        <Modal.Header className="dark:text-slate-900">
          Delete Program
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-100">
              Are you sure you want to delete "{programToDelete?.program_name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setProgramToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-900 bg-gray-100 dark:bg-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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

/**
 * Test Considerations:
 * 1. Loading States
 *    - Check if loading spinner shows when fetching programs
 *    - Verify error messages display when fetch fails
 * 
 * 2. Program Display
 *    - Verify programs display correctly in the list view
 *    - Verify pagination works (next/previous/page numbers)
 * 
 * 3. Filtering and Sorting
 *    - Test search functionality
 *    - Verify date range filters
 *    - Check phase and type filters
 *    - Confirm sort orders work
 * 
 * 4. Program Actions
 *    - Test program selection
 *    - Verify duplicate functionality
 *    - Confirm delete with modal works
 *    - Check admin-only features
 * 
 * 5. Error Handling
 *    - Test API failure scenarios
 *    - Verify error messages
 *    - Check recovery from errors
 */ 