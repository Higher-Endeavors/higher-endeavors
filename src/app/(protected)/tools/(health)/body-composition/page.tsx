'use client';

import { useState, useEffect } from 'react';
import { useSession, SessionProvider } from 'next-auth/react';
import BodyCompositionInput from './components/BodyCompositionInput';
import BodyCompositionAnalysis from './components/BodyCompositionAnalysis';
import UserSelector from '../../../components/UserSelector';
import RequiredSettingsSidebar from './components/RequiredSettingsSidebar';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import type { UserSettings } from '@/app/lib/types/userSettings.zod';

function BodyCompositionContent() {
  const { data: session } = useSession();
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'analysis'>('input');
  const [showSettingsNotification, setShowSettingsNotification] = useState(true);
  const [bioData, setBioData] = useState<{ date_of_birth?: string; gender?: string } | null>(null);

  // Fetch bio data
  useEffect(() => {
    const fetchBioData = async () => {
      try {
        const response = await fetch('/api/user/bio');
        if (!response.ok) throw new Error('Failed to fetch bio data');
        
        const data = await response.json();
        setBioData({
          date_of_birth: data.date_of_birth,
          gender: data.gender
        });
      } catch (error) {
        console.error('Error loading bio data:', error);
        setBioData(null);
      }
    };

    fetchBioData();
  }, []);

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

  // Fetch user settings
  useEffect(() => {
    let isMounted = true;
    async function fetchSettings() {
      setSettingsLoading(true);
      try {
        const res = await fetch('/api/user-settings');
        if (!res.ok) throw new Error('Failed to fetch user settings');
        const data = await res.json();
        if (isMounted) setUserSettings(data);
      } catch (error) {
        if (isMounted) setUserSettings(null);
      } finally {
        if (isMounted) setSettingsLoading(false);
      }
    }
    fetchSettings();
    return () => { isMounted = false; };
  }, []);

  const handleUserSelect = (userId: number | null) => {
    setSelectedUserId(userId);
  };

  if (!session?.user?.id) {
    return <div>Please sign in to access this feature.</div>;
  }

  if (settingsLoading) {
    return <div>Loading settings...</div>;
  }

  const showBioNotification = !bioData?.date_of_birth || !bioData?.gender;

  return (
    <div className="container mx-auto mb-12 px-4">
      <h1 className="text-4xl font-bold mx-auto px-12 py-8 lg:px-36 xl:px-72">Body Composition Tracker</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 order-2 lg:order-1">
          {isAdmin && (
            <UserSelector
              onUserSelect={handleUserSelect}
              currentUserId={parseInt(session.user.id)}
            />
          )}

          <div className="mb-6 flex space-x-4">
            <button
              onClick={() => setActiveTab('input')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'input'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white dark:bg-[#e0e0e0] text-gray-700'
              }`}
            >
              Data Input
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'analysis'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white dark:bg-[#e0e0e0] text-gray-700'
              }`}
            >
              Analysis
            </button>
          </div>

          {activeTab === 'input' ? (
            <BodyCompositionInput userId={selectedUserId || parseInt(session.user.id)} />
          ) : (
            <BodyCompositionAnalysis userId={selectedUserId || parseInt(session.user.id)} />
          )}
        </div>

        {showBioNotification && userSettings && (
          <div className="lg:col-span-4 order-1 lg:order-2">
            <RequiredSettingsSidebar
              userSettings={userSettings}
              showNotification={showSettingsNotification}
              onDismiss={() => setShowSettingsNotification(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function BodyCompositionPage() {
  return (
    <SessionProvider>
      <Header />
      <BodyCompositionContent />
      <Footer />
    </SessionProvider>
  );
} 