'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Program, Exercise, PhaseFocus, PeriodizationType, ProgressionRules, VolumeTarget } from '@/app/lib/types/pillars/fitness';
import { HiOutlineDotsVertical, HiOutlinePencil, HiOutlineTrash, HiOutlineDuplicate } from 'react-icons/hi';
import { Modal } from 'flowbite-react';
import { SavedProgram, SavedProgramWithOptional } from '@/app/lib/types/pillars/fitness/zod_schemas';

interface ProgramBrowserProps {
  onProgramSelect: (program: SavedProgram) => void;
  currentUserId: number;
  isAdmin?: boolean;
  simplified?: boolean;
  onProgramsChange?: (programs: SavedProgram[]) => void;
}

interface MenuState {
  [key: string]: boolean;
}

export default function ProgramBrowser({ 
  onProgramSelect, 
  currentUserId, 
  isAdmin = false,
  simplified = false,
  onProgramsChange
}: ProgramBrowserProps) {
  const [programs, setPrograms] = useState<SavedProgram[]>([]);
  const [menuState, setMenuState] = useState<MenuState>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<SavedProgram | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 9;
  const totalPages = Math.ceil(programs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPrograms = programs.slice(startIndex, endIndex);

  const fetchPrograms = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/resistance-training/programs${isAdmin ? `?userId=${currentUserId}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch programs');
      const data = await response.json();
      setPrograms(data.programs);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch programs');
      console.error('Error fetching programs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Debug - useEffect triggered with currentUserId:', currentUserId);
    setCurrentPage(1); // Reset to first page when user changes
    fetchPrograms();
  }, [currentUserId, isAdmin]);

  const handleMenuClick = (e: React.MouseEvent, programId: string) => {
    e.stopPropagation();
    setMenuState(prev => ({
      ...prev,
      [programId]: !prev[programId]
    }));
  };

  const handleViewEdit = async (e: React.MouseEvent, program: SavedProgram) => {
    e.stopPropagation();
    onProgramSelect(program);
    setMenuState(prev => ({ ...prev, [program.id]: false }));
  };

  const handleDuplicateClick = async (e: React.MouseEvent, program: SavedProgram) => {
    e.stopPropagation();
    try {
      const duplicatedProgram = {
        ...program,
        name: `${program.program_name} (Copy)`,
        userId: currentUserId
      };

      const response = await fetch('/api/resistance-training/program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicatedProgram)
      });

      if (!response.ok) throw new Error('Failed to duplicate program');

      await fetchPrograms();
      setMenuState(prev => ({ ...prev, [program.id]: false }));
    } catch (error) {
      console.error('Error duplicating program:', error);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, program: SavedProgram) => {
    e.stopPropagation();
    setProgramToDelete(program);
    setShowDeleteConfirm(true);
    setMenuState(prev => ({ ...prev, [program.id]: false }));
  };

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
      if (onProgramsChange) {
        onProgramsChange(updatedPrograms);
      }
      setShowDeleteConfirm(false);
      setProgramToDelete(null);
    } catch (error) {
      console.error('Error deleting program:', error);
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentPrograms.map((program) => (
          <div
            key={program.id}
            className="relative p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {program.program_name}
              </h3>
              {!simplified && (
                <div className="relative">
                  <button
                    onClick={(e) => handleMenuClick(e, program.id)}
                    className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  >
                    <HiOutlineDotsVertical className="w-5 h-5" />
                  </button>
                  {menuState[program.id] && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1">
                        <button
                          onClick={(e) => handleViewEdit(e, program)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <HiOutlinePencil className="mr-2" />
                          View/Edit
                        </button>
                        <button
                          onClick={(e) => handleDuplicateClick(e, program)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <HiOutlineDuplicate className="mr-2" />
                          Duplicate
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(e, program)}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <HiOutlineTrash className="mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              <p>Phase: {program.phase_focus}</p>
              <p>Type: {program.periodization_type}</p>
              <p>Created: {format(new Date(program.created_at), 'MMM d, yyyy')}</p>
            </div>

            <button
              onClick={() => onProgramSelect(program)}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Select Program
            </button>
          </div>
        ))}
      </div>

      {!simplified && totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      <Modal
        show={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setProgramToDelete(null);
        }}
        size="md"
      >
        <Modal.Header className="dark:text-white">
          Delete Program
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete "{programToDelete?.program_name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setProgramToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
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
    </>
  );
} 