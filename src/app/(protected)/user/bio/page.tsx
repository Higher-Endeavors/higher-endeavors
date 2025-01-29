import React from 'react';
import { SessionProvider } from 'next-auth/react';
import Header from '@/app/components/header';
import Footer from '@/app/components/footer';
import BioForm from './components/BioForm';

export default function UserBioPage() {
  return (
    <SessionProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">User Profile</h1>
            <div className="bg-white rounded-lg shadow p-6">
              <BioForm />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </SessionProvider>
  );
} 