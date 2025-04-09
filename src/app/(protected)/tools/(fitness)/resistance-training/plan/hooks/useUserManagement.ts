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
  const [selected_user_id, setSelectedUserId] = useState<number>(0);

  // Initialize selected_user_id when session loads
  useEffect(() => {
    if (current_user_id) {
      setSelectedUserId(current_user_id);
    }
  }, [current_user_id]);

  // Check admin status from session
  useEffect(() => {
    if (session?.user?.role) {
      setIsAdmin(session.user.role === 'admin');
    }
  }, [session?.user?.role]);

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