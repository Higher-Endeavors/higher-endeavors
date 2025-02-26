'use client';

import React from 'react';
import UserSelector from '@/app/components/UserSelector';
import ProgramBrowser from '../ProgramBrowser/ProgramBrowser';
import { ProgramListItem } from '@/app/lib/types/pillars/fitness';

// For debugging - can be commented out when not needed
const DEBUG_MODE = false;
function logDebug(message: string, data?: any) {
  if (DEBUG_MODE) {
    console.log(`[ProgramHeader] ${message}`, data || '');
  }
}

/**
 * This defines what information ProgramHeader needs to work properly.
 * Think of it like a list of requirements for the component to function:
 * 
 * @param isAdmin - Is the current user an admin? (yes/no)
 * @param currentUserId - The ID number of the user who is logged in
 * @param selectedUserId - The ID of the user whose programs we're viewing (can be null)
 * @param onUserSelect - A function that runs when an admin picks a different user to view
 * @param onProgramSelect - A function that runs when someone picks a program from the list
 * @param onProgramDelete - A function that runs when someone deletes a program (optional)
 */
interface ProgramHeaderProps {
  isAdmin: boolean;
  currentUserId: number;
  selectedUserId: number;
  onUserSelect: (userId: number) => void;
  onProgramSelect: (program: ProgramListItem) => void;
  onProgramDelete?: (programId: number) => void;
}

/**
 * ProgramHeader is like the control center for viewing and managing workout programs.
 * It shows two main things:
 * 1. A user selector (only visible to admins) to pick whose programs to view
 * 2. A program browser to view and select workout programs
 * 
 * How it works:
 * - If you're an admin, you'll see a dropdown to select different users
 * - Below that, everyone sees the program browser where you can view and select programs
 * - The programs shown are either your own or the selected user's (if you're an admin)
 */
export default function ProgramHeader({
  isAdmin,
  currentUserId,
  selectedUserId,
  onUserSelect,
  onProgramSelect,
  onProgramDelete
}: ProgramHeaderProps) {
  // Log component render for debugging
  logDebug('Rendering ProgramHeader', {
    isAdmin,
    currentUserId,
    selectedUserId
  });

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

/**
 * Test Considerations:
 * 1. Check if UserSelector appears only for admin users
 * 2. Verify ProgramBrowser shows up for all users
 * 3. Test that the correct user's programs are shown (current user vs selected user)
 * 4. Ensure all callback functions (onUserSelect, onProgramSelect, onProgramDelete) work
 * 5. Test admin vs non-admin view differences
 */ 