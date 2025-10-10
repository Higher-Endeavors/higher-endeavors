'use client';

import { useState, useTransition } from 'react';
import BodyCompositionInput from '(protected)/tools/health/body-composition/components/BodyCompositionInput';
import BodyCompositionAnalysis from '(protected)/tools/health/body-composition/components/BodyCompositionAnalysis';
import RequiredSettingsSidebar from '(protected)/tools/health/body-composition/components/RequiredSettingsSidebar';
import UserSelector from '(protected)/components/UserSelector';
import type { UserSettings } from 'lib/types/userSettings.zod';

interface Props {
  isAdmin: boolean;
  currentUserId: number;
  userSettings: UserSettings | null;
  bio: { date_of_birth?: string; gender?: string } | null;
  initialEntries: any[];
  onSave: (input: any) => Promise<any>;
  onFetchEntries: (input: { userId: number }) => Promise<any[]>;
}

export default function BodyCompositionContent({ isAdmin, currentUserId, userSettings, bio, initialEntries, onSave, onFetchEntries }: Props) {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'analysis'>('input');
  const [showSettingsNotification, setShowSettingsNotification] = useState(true);
  const [entries, setEntries] = useState<any[]>(initialEntries || []);
  const [isPending, startTransition] = useTransition();

  const effectiveUserId = selectedUserId || currentUserId;
  const showBioNotification = !bio?.date_of_birth || !bio?.gender;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 order-2 lg:order-1">
        {isAdmin && (
          <UserSelector
            onUserSelect={(id) => {
              setSelectedUserId(id);
              const targetId = id || currentUserId;
              startTransition(async () => {
                const newEntries = await onFetchEntries({ userId: targetId });
                setEntries(newEntries);
              });
            }}
            currentUserId={currentUserId}
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
          <BodyCompositionInput
            key={`input-${effectiveUserId}`}
            userId={effectiveUserId}
            userSettings={userSettings}
            bioData={bio}
            onSave={(input) => {
              const promise = onSave(input);
              startTransition(async () => {
                const newEntries = await onFetchEntries({ userId: effectiveUserId });
                setEntries(newEntries);
              });
              return promise;
            }}  
          />
        ) : (
          <BodyCompositionAnalysis key={`analysis-${effectiveUserId}`} userId={effectiveUserId} entries={entries} userSettings={userSettings} />
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
  );
}


