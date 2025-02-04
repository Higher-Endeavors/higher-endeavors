'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Program } from '../../shared/types';
import { HiDotsVertical } from 'react-icons/hi';

interface SavedProgram extends Program {
  createdAt: string;
  updatedAt: string;
  exerciseCount?: number;
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
  const [filters, setFilters] = useState({
    search: '',
    dateRange: 'all', // all, week, month, year
    phaseFocus: '',
    periodizationType: '',
    exercise: '',
    sortBy: 'newest' // newest, oldest, name
  });
  const [isOpen, setIsOpen] = useState(false);

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

  const handleMenuClick = (e: React.MouseEvent, programId: string) => {
    e.stopPropagation(); // Prevent card click when clicking menu
    setActiveMenu(activeMenu === programId ? null : programId);
  };

  const handleViewEdit = (e: React.MouseEvent, program: SavedProgram) => {
    e.stopPropagation();
    onProgramSelect(program);
    setActiveMenu(null);
  };

  const handleDuplicate = async (e: React.MouseEvent, program: SavedProgram) => {
    e.stopPropagation();
    try {
      const duplicatedProgram = {
        ...program,
        program_name: `${program.program_name} (Copy)`,
        id: undefined // Let the server generate a new ID
      };
      
      const response = await fetch('/api/resistance-training/program', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicatedProgram),
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate program');
      }

      // Refresh the programs list
      fetchPrograms();
    } catch (error) {
      console.error('Error duplicating program:', error);
    }
    setActiveMenu(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full"
        >
          <h2 className="text-lg font-semibold dark:text-white">Saved Programs</h2>
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              >
                <option value="all">All Time</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name</option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
            <div className="text-center py-4 dark:text-white">Loading programs...</div>
          ) : filteredPrograms.length === 0 ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No programs found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPrograms.map((program) => (
                <div
                  key={program.id}
                  className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer dark:border-gray-700 dark:hover:bg-gray-700 relative"
                  onClick={() => onProgramSelect(program)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <h3 className="font-medium dark:text-white">{program.program_name}</h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(program.created_at), 'MMM d, yyyy')}
                      </span>
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
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex space-x-4">
                      <span>{program.periodization_type || 'No type'}</span>
                      <span>•</span>
                      <span>{program.exercise_count || 0} exercises</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 