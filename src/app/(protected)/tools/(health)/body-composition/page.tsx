'use client';

import { useState } from 'react';
import BodyCompositionInput from './components/BodyCompositionInput';
import BodyCompositionAnalysis from './components/BodyCompositionAnalysis';

import { SessionProvider } from 'next-auth/react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

const tabs = [
  { id: 'input', label: 'Data Input' },
  { id: 'analysis', label: 'Analysis' }
];

export default function BodyCompositionPage() {
  const [activeTab, setActiveTab] = useState('input');

  return (
    <SessionProvider>
        <Header />
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Body Composition Tracker</h1>
      
      <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-b-2 border-purple-500 text-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'input' && <BodyCompositionInput />}
          {activeTab === 'analysis' && <BodyCompositionAnalysis />}
            </div>
          </div>
        </div>
        <Footer />
    </SessionProvider>
  );
} 