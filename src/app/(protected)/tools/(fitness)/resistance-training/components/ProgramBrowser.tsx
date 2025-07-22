'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { Modal } from 'flowbite-react';
import { HiOutlineDotsVertical, HiOutlinePencil, HiOutlineTrash, HiOutlineDuplicate } from 'react-icons/hi';
import { ProgramListItem } from '../types/resistance-training.zod';
import { getResistancePrograms } from '../lib/hooks/getResistancePrograms';
import { deleteResistanceProgram } from '../lib/actions/deleteResistanceProgram';
import { duplicateResistanceProgram } from '../lib/actions/duplicateResistanceProgram';

// How many programs to show per page
const ITEMS_PER_PAGE = 5;

interface ProgramBrowserProps {
  onProgramSelect?: (program: ProgramListItem) => void;
  currentUserId: number;
  isAdmin?: boolean;
  onProgramDelete?: (programId: number) => void;
}

interface MenuState {
  [key: string]: boolean;
}

interface FilterState {
  search: string;
  dateRange: 'all' | 'week' | 'month' | 'year';
  phaseFocus: string;
  periodizationType: string;
  sortBy: 'newest' | 'oldest' | 'name';
}

export default function ProgramBrowser({ 
  onProgramSelect, 
  currentUserId, 
  isAdmin = false,
  onProgramDelete
}: ProgramBrowserProps) {
  // State management
  const [programs, setPrograms] = useState<ProgramListItem[]>([]);
  const [menuState, setMenuState] = useState<MenuState>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<ProgramListItem | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [programToDuplicate, setProgramToDuplicate] = useState<ProgramListItem | null>(null);
  const [newProgramName, setNewProgramName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState({
    programs: true,
    delete: false,
    duplicate: false
  });
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  // Search and filter settings
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    dateRange: 'all',
    phaseFocus: '',
    periodizationType: '',
    sortBy: 'newest'
  });

  // Fetch programs from the server
  const fetchPrograms = useCallback(async () => {
    try {
      setIsLoading(prev => ({ ...prev, programs: true }));
      setHasAttemptedLoad(false);
      setError(null);
      
      const fetchedPrograms = await getResistancePrograms(currentUserId);
      setPrograms(fetchedPrograms);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch programs';
      setError(errorMessage);
      console.error('Error fetching programs:', error);
    } finally {
      setTimeout(() => {
        setHasAttemptedLoad(true);
        setIsLoading(prev => ({ ...prev, programs: false }));
      }, 500);
    }
  }, [currentUserId]);

  // Filter logic - simplified to avoid dependency issues
  const filteredPrograms = useMemo(() => {
    return programs.filter(program => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const programNameMatch = program.programName.toLowerCase().includes(searchTerm);
        
        // Check if any exercise names match the search term
        let exerciseMatch = false;
        if (program.exerciseSummary && program.exerciseSummary.exercises && Array.isArray(program.exerciseSummary.exercises)) {
          exerciseMatch = program.exerciseSummary.exercises.some((ex: { name: string }) => 
            ex.name.toLowerCase().includes(searchTerm)
          );
        }
        
        // Return false if neither program name nor exercises match
        if (!programNameMatch && !exerciseMatch) {
          return false;
        }
      }

      if (filters.phaseFocus && program.phaseFocus !== filters.phaseFocus) {
        return false;
      }

      if (filters.periodizationType && program.periodizationType !== filters.periodizationType) {
        return false;
      }

      // Date range filtering
      if (filters.dateRange !== 'all') {
        const date = new Date(program.createdAt);
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
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name':
          return a.programName.localeCompare(b.programName);
        default:
          return 0;
      }
    });
  }, [programs, filters]);

  const currentPrograms = useMemo(() => {
    const indexOfLastProgram = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstProgram = indexOfLastProgram - ITEMS_PER_PAGE;
    return filteredPrograms.slice(indexOfFirstProgram, indexOfLastProgram);
  }, [currentPage, filteredPrograms]);

  // Load programs on mount and when user changes
  useEffect(() => {
    setCurrentPage(1);
    fetchPrograms();
  }, [currentUserId]);

  // Cleanup on unmount
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

  // Event handlers
  const handleMenuClick = useCallback((e: React.MouseEvent, programId: number) => {
    e.stopPropagation();
    setMenuState(prev => ({
      ...prev,
      [programId.toString()]: !prev[programId.toString()]
    }));
  }, []);

  const handleViewEdit = useCallback((e: React.MouseEvent, program: ProgramListItem) => {
    e.stopPropagation();
    if (onProgramSelect) {
      onProgramSelect(program);
    }
    setMenuState(prev => ({ ...prev, [program.resistanceProgramId]: false }));
  }, [onProgramSelect]);

  const handleDuplicateClick = useCallback((e: React.MouseEvent, program: ProgramListItem) => {
    e.stopPropagation();
    setProgramToDuplicate(program);
    setNewProgramName(`${program.programName} (Copy)`);
    setShowDuplicateModal(true);
    setMenuState(prev => ({ ...prev, [program.resistanceProgramId]: false }));
  }, []);

  const handleDeleteClick = useCallback((e: React.MouseEvent, program: ProgramListItem) => {
    e.stopPropagation();
    setProgramToDelete(program);
    setShowDeleteConfirm(true);
    setMenuState(prev => ({ ...prev, [program.resistanceProgramId]: false }));
  }, []);

  const handleDeleteConfirm = async () => {
    if (!programToDelete) return;

    try {
      setIsLoading(prev => ({ ...prev, delete: true }));
      
      const result = await deleteResistanceProgram(
        { programId: programToDelete.resistanceProgramId }, 
        currentUserId
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete program');
      }

      const updatedPrograms = programs.filter(p => p.resistanceProgramId !== programToDelete.resistanceProgramId);
      setPrograms(updatedPrograms);
      
      if (onProgramDelete) {
        onProgramDelete(programToDelete.resistanceProgramId);
      }
      
      setShowDeleteConfirm(false);
      setProgramToDelete(null);
    } catch (error) {
      console.error('Error deleting program:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete program');
    } finally {
      setIsLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handleDuplicateConfirm = async () => {
    if (!programToDuplicate || !newProgramName.trim()) return;

    try {
      setIsLoading(prev => ({ ...prev, duplicate: true }));
      
      const result = await duplicateResistanceProgram(
        {
          programId: programToDuplicate.resistanceProgramId,
          newProgramName: newProgramName.trim()
        },
        currentUserId
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to duplicate program');
      }

      // Refresh the programs list to show the new duplicated program
      await fetchPrograms();
      
      setShowDuplicateModal(false);
      setProgramToDuplicate(null);
      setNewProgramName('');
    } catch (error) {
      console.error('Error duplicating program:', error);
      setError(error instanceof Error ? error.message : 'Failed to duplicate program');
    } finally {
      setIsLoading(prev => ({ ...prev, duplicate: false }));
    }
  };

  const handlePageChange = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
  }, []);

  const handleProgramClick = useCallback((program: ProgramListItem) => {
    if (onProgramSelect) {
      onProgramSelect(program);
    }
  }, [onProgramSelect]);

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
              placeholder="Search programs or exercises..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-white dark:border-gray-300 dark:text-slate-900"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />

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
                <option value="">All Phases/Focus</option>
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
                    key={program.resistanceProgramId}
                    className="border border-gray-200 dark:border-gray-300 rounded-md p-4 hover:bg-gray-50 dark:hover:bg-gray-100 cursor-pointer relative bg-white dark:bg-white"
                    onClick={() => handleProgramClick(program)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <h3 className="font-medium text-gray-900 dark:text-slate-900">{program.programName}</h3>
                        <span className="text-sm text-gray-500 dark:text-slate-600">
                          {format(new Date(program.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="relative">
                        <button
                          onClick={(e) => handleMenuClick(e, program.resistanceProgramId)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-200 rounded-full"
                        >
                          <HiOutlineDotsVertical className="w-5 h-5 text-gray-500 dark:text-slate-600" />
                        </button>
                        {menuState[program.resistanceProgramId] && (
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
                          <span>Type: {program.periodizationType || 'None'}</span>
                          <span>Phase: {program.phaseFocus || 'Not specified'}</span>
                        </div>
                        {program.exerciseSummary && program.exerciseSummary.exercises && program.exerciseSummary.exercises.length > 0 && (
                          <div className="mt-2">
                            <span className="font-medium">Exercises: </span>
                            <span>{program.exerciseSummary.exercises.map((ex: { name: string }) => ex.name).join(', ')}</span>
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
              Are you sure you want to delete "{programToDelete?.programName}"? This action cannot be undone.
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
                disabled={isLoading.delete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isLoading.delete ? 'Deleting...' : 'Delete Program'}
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Duplicate Program Modal */}
      <Modal
        show={showDuplicateModal}
        onClose={() => {
          setShowDuplicateModal(false);
          setProgramToDuplicate(null);
          setNewProgramName('');
        }}
        size="md"
      >
        <Modal.Header className="dark:text-slate-900">
          Duplicate Program
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-100">
              Enter a name for the duplicated program:
            </p>
            <input
              type="text"
              value={newProgramName}
              onChange={(e) => setNewProgramName(e.target.value)}
              placeholder="Enter program name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-white dark:border-gray-300 dark:text-slate-900"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDuplicateModal(false);
                  setProgramToDuplicate(null);
                  setNewProgramName('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-900 bg-gray-100 dark:bg-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDuplicateConfirm}
                disabled={isLoading.duplicate || !newProgramName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading.duplicate ? 'Duplicating...' : 'Duplicate Program'}
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}