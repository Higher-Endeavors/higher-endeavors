'use client';

import React from 'react';
import UserSelector from '@/app/components/UserSelector';
import ProgramBrowser from './ProgramBrowser';
import { SavedProgram } from '@/app/lib/types/pillars/fitness/zod_schemas';

interface ProgramHeaderProps {
  isAdmin: boolean;
  currentUserId: number;
  selectedUserId: number | null;
  onUserSelect: (userId: number | null) => void;
  onProgramSelect: (program: SavedProgram) => void;
  onProgramDelete?: (programId: string) => void;
}

export default function ProgramHeader({
  isAdmin,
  currentUserId,
  selectedUserId,
  onUserSelect,
  onProgramSelect,
  onProgramDelete
}: ProgramHeaderProps) {
  return (
    <div>
      {/* UserSelector - show for admin users */}
      {isAdmin && (
        <div className="mb-6">
          <UserSelector
            onUserSelect={onUserSelect}
            currentUserId={currentUserId}
            className="w-full max-w-md"
          />
        </div>
      )}

      {/* Program Browser */}
      <div className="mb-6">
        <ProgramBrowser
          onProgramSelect={onProgramSelect}
          currentUserId={selectedUserId || currentUserId}
          isAdmin={isAdmin}
          onProgramDelete={onProgramDelete}
        />
      </div>
    </div>
  );
} 