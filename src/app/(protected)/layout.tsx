'use client';

import { useState, ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import UserSidebar from '(protected)/components/UserSidebar';
import UserSettingsProviderWrapper from '(protected)/components/UserSettingsProviderWrapper';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <SessionProvider>
      <UserSettingsProviderWrapper>
        <div className="flex min-h-screen">
          <UserSidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
          <main className={`flex-1 bg-background transition-all duration-200 ${sidebarExpanded ? 'md:ml-60' : 'md:ml-16'} `}>
            {children}
          </main>
        </div>
      </UserSettingsProviderWrapper>
    </SessionProvider>
  );
}