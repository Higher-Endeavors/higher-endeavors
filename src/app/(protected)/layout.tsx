'use client';

import { useState, ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import UserSidebar from './components/UserSidebar';
import UserSettingsProviderWrapper from './components/UserSettingsProviderWrapper';
import { useEnvironment } from '../context/EnvironmentContext';


export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const { isQA, isDevelopment } = useEnvironment();

  return (
    <SessionProvider>
      <UserSettingsProviderWrapper>
        <div className="flex min-h-screen">
          <UserSidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
          <main className={`flex-1 bg-background transition-all duration-200 ${sidebarExpanded ? 'md:ml-60' : 'md:ml-16'} ${isQA ? 'qa-banner-offset' : isDevelopment ? 'dev-banner-offset' : ''}`}>
            {children}
          </main>
        </div>
      </UserSettingsProviderWrapper>
    </SessionProvider>
  );
}