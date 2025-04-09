'use client';

import React from 'react';
import UserSelector from '@/app/components/UserSelector';
import ProgramBrowser from '../ProgramBrowser/ProgramBrowser';
import { program_list_item } from '@/app/lib/types/pillars/fitness';

interface ProgramChooserProps {
  isAdmin: boolean;
  currentUserId: number;
  selectedUserId: number;
  onUserSelect: (userId: number) => void;
  onProgramSelect: (program: program_list_item) => void;
  onProgramDelete?: (programId: number) => void;
}

export default function ProgramChooser({
  isAdmin,
  currentUserId,
  selectedUserId,
  onUserSelect,
  onProgramSelect,
  onProgramDelete
}: ProgramChooserProps) {

  return (
    <div>
      {/* UserSelector - Only admins can see this part */}
      {isAdmin && (
        <div className="mb-6">
          <UserSelector
            onUserSelect={onUserSelect}
            currentUserId={currentUserId}
            className="w-full max-w-md"
          />
        </div>
      )}

      {/* Program Browser - Everyone sees this part */}
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
