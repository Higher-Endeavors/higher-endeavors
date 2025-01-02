'use client';

import { useState } from 'react';
import BodyCompositionInput from './components/BodyCompositionInput';
import BodyCompositionAnalysis from './components/BodyCompositionAnalysis';
import RequiredSettingsSidebar from './components/RequiredSettingsSidebar';

import { SessionProvider } from 'next-auth/react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function BodyCompositionPage() {
  const [activeTab, setActiveTab] = useState<'input' | 'analysis'>('input');
  // TODO: Replace with actual API call to get user settings
  const [userSettings, setUserSettings] = useState({});
  const [showSettingsNotification, setShowSettingsNotification] = useState(true);

  return (
    <SessionProvider>
        <Header />
      <div className="container mx-auto mb-12 px-4">
        <h1 className="text-4xl font-bold mx-auto px-12 py-8 lg:px-36 xl:px-72">Body Composition Tracker</h1>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 order-2 lg:order-1">
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
            <BodyCompositionInput />
          ) : (
            <BodyCompositionAnalysis />
          )}
        </div>

        <div className="lg:col-span-4 order-1 lg:order-2">
          <RequiredSettingsSidebar
            userSettings={userSettings}
            showNotification={showSettingsNotification}
            onDismiss={() => setShowSettingsNotification(false)}
          />
        </div>
      </div>
      </div>
      <Footer />
    </SessionProvider>
  );
} 