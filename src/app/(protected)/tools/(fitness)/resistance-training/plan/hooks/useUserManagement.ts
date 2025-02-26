import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useUserSettings } from '@/app/lib/hooks/useUserSettings';
import { PhaseFocus, PeriodizationType, ProgressionFrequency } from '@/app/lib/types/pillars/fitness';

export function useUserManagement() {
  const { data: session } = useSession();
  const { settings: userSettings, isLoading: settingsLoading } = useUserSettings();
  const [isAdmin, setIsAdmin] = useState(false);
  const currentUserId = session?.user?.id ? parseInt(session.user.id) : 0;
  const [selectedUserId, setSelectedUserId] = useState<number>(currentUserId);

    // Debug logs
    useEffect(() => {
        console.log('User Management State:', {
          isAdmin,
          sessionUserId: session?.user?.id,
          selectedUserId,
          settingsLoading
        });
      }, [isAdmin, session?.user?.id, selectedUserId, settingsLoading]);

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/users');
          setIsAdmin(response.ok);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      }
    };

    checkAdminStatus();
  }, [session?.user?.id]);

  const handleUserSelect = (userId: number) => {
    setSelectedUserId(userId);
  };

  return {
    session,
    userSettings,
    settingsLoading,
    isAdmin,
    selectedUserId,
    setSelectedUserId,
    handleUserSelect
  };
}