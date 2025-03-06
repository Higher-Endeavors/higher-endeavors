import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useUserSettings } from '@/app/lib/hooks/useUserSettings';
import { 
  PhaseFocus, 
  PeriodizationType, 
  ProgressionFrequency 
} from '@/app/lib/types/pillars/fitness';

export function useUserManagement() {
  const { data: session } = useSession();
  const { settings: userSettings, isLoading: settingsLoading } = useUserSettings();
  const [isAdmin, setIsAdmin] = useState(false);
  const current_user_id = session?.user?.id ? parseInt(session.user.id) : 0;
  const [selected_user_id, setSelectedUserId] = useState<number>(current_user_id);

  // Debug logs
  useEffect(() => {
    console.log('User Management State:', {
      isAdmin,
      session_user_id: session?.user?.id,
      selected_user_id,
      settingsLoading
    });
  }, [isAdmin, session?.user?.id, selected_user_id, settingsLoading]);

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

  const handleUserSelect = (user_id: number) => {
    setSelectedUserId(user_id);
  };

  return {
    session,
    userSettings,
    settingsLoading,
    isAdmin,
    selected_user_id,
    setSelectedUserId,
    handleUserSelect,
    current_user_id
  };
}