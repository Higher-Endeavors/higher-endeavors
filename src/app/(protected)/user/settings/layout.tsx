import React from 'react';
import { SessionProvider } from "next-auth/react";
import { SettingsProvider } from './context/SettingsContext';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <SettingsProvider>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </SettingsProvider>
    </SessionProvider>
  );
} 