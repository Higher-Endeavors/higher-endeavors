import React from 'react';
import { Feature, FeaturePillar } from '(protected)/tools/feature-roadmap/types';
import FeatureRoadmapOverview from '(protected)/tools/feature-roadmap/components/FeatureRoadmapOverview';

import { SessionProvider } from 'next-auth/react';
import Header from 'components/Header';
import Footer from 'components/Footer';

const PLANNED_FEATURES: Feature[] = [
  {
    title: 'Resistance Training Programming',
    description: 'Tool to create resistance training programs',
    status: 'in-progress',
    pillar: 'Fitness',
    priority: 'high',
    expectedCompletion: '01-01-2025',
  },
  {
    title: 'CardioMetabolic Training Programming',
    description: 'Tool to create cardio metabolic training programs',
    status: 'planned',
    pillar: 'Fitness',
    priority: 'low',
    expectedCompletion: '',
  },
  {
    title: 'Nutrition Tracking',
    description: 'Plan and track your nutrition',
    status: 'planned',
    pillar: 'Nutrition',
    priority: 'high',
    expectedCompletion: '02-01-2025',
  },
  {
    title: 'Wearable Device Integration',
    description: 'Connect your wearable devices to the app',
    status: 'planned',
    pillar: 'Lifestyle',
    priority: 'medium',
    expectedCompletion: '02-01-2025',
  },
  {
    title: 'Biometric Tracking and Analysis',
    description: 'Track and analyze your biometric data, including heart rate, HRV, weight, body composition, and more',
    status: 'planned',
    pillar: 'Health',
    priority: 'medium',
    expectedCompletion: '',
  },
  {
    title: 'Goal Setting and Tracking',
    description: 'Set and track your goals across all Pillars',
    status: 'planned',
    pillar: 'Lifestyle',
    priority: 'medium',
    expectedCompletion: '01-01-2025',
  },
  {
    title: 'User Calendar Functionality',
    description: 'Add training sessions, meals/ snacks, reminders and other events to your calendar',
    status: 'planned',
    pillar: 'Lifestyle',
    priority: 'medium',
    expectedCompletion: '',
  },
  // Add more mock features here...
];

export default function FeatureRoadmapPage() {
  return (
    <SessionProvider>
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Feature Roadmap</h1>
          <FeatureRoadmapOverview features={PLANNED_FEATURES} />
        </div>
        <Footer />
      </div>
    </SessionProvider>
  );
} 