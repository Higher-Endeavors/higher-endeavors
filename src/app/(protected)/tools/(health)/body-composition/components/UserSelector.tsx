'use client';

import { useState, useEffect } from 'react';
import { Select } from 'flowbite-react';

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
}

export default function UserSelector({ onUserSelect, currentUserId }: UserSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number>(currentUserId);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = parseInt(event.target.value);
    setSelectedUserId(userId);
    onUserSelect(userId);
  };

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="mb-4">
      <Select
        id="user-selector"
        value={selectedUserId}
        onChange={handleUserChange}
        className="w-full"
      >
        <option value={currentUserId}>My Data</option>
        {users
          .filter(user => user.id !== currentUserId)
          .map(user => (
            <option key={user.id} value={user.id}>
              {user.first_name && user.last_name 
                ? `${user.first_name} ${user.last_name}`
                : user.name || user.email}
            </option>
          ))}
      </Select>
    </div>
  );
} 