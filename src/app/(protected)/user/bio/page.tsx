'use client';

import React, { useState, useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import BioForm from './components/BioForm';
import HeartRateZones from './components/HeartRateZones';
import { getHeartRateZones, type HeartRateZoneData } from './lib/actions/saveHeartRateZones';

export default function UserBioPage() {
  const [userAge, setUserAge] = useState<number | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('bio');
  const [heartRateZones, setHeartRateZones] = useState<HeartRateZoneData[] | null>(null);
  const [isLoadingHRZones, setIsLoadingHRZones] = useState(true);

  // Fetch user age from bio data
  useEffect(() => {
    const fetchUserAge = async () => {
      try {
        const response = await fetch('/api/user/bio');
        if (response.ok) {
          const data = await response.json();
          if (data.date_of_birth) {
            const birthDate = new Date(data.date_of_birth);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              setUserAge(age - 1);
            } else {
              setUserAge(age);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user age:', error);
      }
    };

    fetchUserAge();
  }, []);

  // Fetch heart rate zones data
  useEffect(() => {
    const fetchHeartRateZones = async () => {
      try {
        setIsLoadingHRZones(true);
        const result = await getHeartRateZones();
        if (result.success) {
          setHeartRateZones(result.data || null);
        }
      } catch (error) {
        console.error('Error fetching heart rate zones:', error);
      } finally {
        setIsLoadingHRZones(false);
      }
    };

    fetchHeartRateZones();
  }, []);

  const tabs = [
    { id: 'bio', label: 'Personal Information' },
    { id: 'heart-rate', label: 'Heart Rate Zones' },
  ];

  return (
    <SessionProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">User Profile</h1>
            
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex flex-wrap -mb-px">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-4 sm:px-4 md:px-6 text-xs sm:text-sm font-medium whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-b-2 border-purple-500 text-purple-600'
                        : 'text-gray-200 hover:text-purple-400'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            
            {/* Content */}
            <div className="bg-white rounded-lg shadow">
              {activeTab === 'bio' && (
                <div className="p-6">
                  <BioForm />
                </div>
              )}
              
              {activeTab === 'heart-rate' && (
                <div className="p-6">
                  <HeartRateZones 
                    userAge={userAge} 
                    initialHeartRateZones={heartRateZones}
                    isLoading={isLoadingHRZones}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </SessionProvider>
  );
} 