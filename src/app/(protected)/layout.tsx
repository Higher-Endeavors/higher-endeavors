'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import UserSidebar from './components/UserSidebar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen">
        <UserSidebar />
        <main className="flex-1 bg-background">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
} 