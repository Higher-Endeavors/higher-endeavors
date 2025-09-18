import React from 'react';
import { SessionProvider } from "next-auth/react";
import Header from 'components/Header';
import Footer from 'components/Footer';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
    </SessionProvider>
  );
} 