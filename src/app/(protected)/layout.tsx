'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import UserSidebar from './components/UserSidebar';
import UserSettingsProviderWrapper from './components/UserSettingsProviderWrapper';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <UserSettingsProviderWrapper>
        <div className="flex min-h-screen">
          <UserSidebar />
          <main className="flex-1 bg-background">
            {children}
          </main>
        </div>
      </UserSettingsProviderWrapper>
    </SessionProvider>
  );
} 