'use client';

import React, { useState, useEffect } from 'react';
import { clientLogger } from '@/app/lib/logging/logger.client';

interface User {
  id: number;
  name: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface UserSelectorProps {
  onUserSelect: (userId: number | null) => void;
  currentUserId: number;
  showAdminFeatures?: boolean;
  onAdminStatusChange?: (isAdmin: boolean) => void;
}

export default function UserSelector({ 
  onUserSelect, 
  currentUserId, 
  showAdminFeatures = false,
  onAdminStatusChange 
}: UserSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number>(currentUserId);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
          setIsAdmin(true);
          onAdminStatusChange?.(true);
        } else {
          setIsAdmin(false);
          onAdminStatusChange?.(false);
        }
      } catch (error) {
        clientLogger.error('Error fetching users', error);
        setIsAdmin(false);
        onAdminStatusChange?.(false);
        setError('Failed to fetch users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [onAdminStatusChange]);

  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = parseInt(event.target.value);
    setSelectedUserId(userId);
    onUserSelect(userId);
  };

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  // Always render the component, but conditionally show content
  return (
    <div className="mb-4">
      {showAdminFeatures && isAdmin && (
        <div className="mb-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            Admin Mode
          </span>
        </div>
      )}
      {isAdmin ? (
        <div className="relative">
          <select
            id="user-selector"
            value={selectedUserId}
            onChange={handleUserChange}
            className="appearance-none w-full rounded-md border border-gray-300 bg-white dark:bg-[#e0e0e0] py-2 pl-3 pr-10 text-sm dark:text-slate-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.first_name && user.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : user.name || user.email}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      ) : (
        // Show nothing for non-admin users, but component still renders
        null
      )}
    </div>
  );
} 