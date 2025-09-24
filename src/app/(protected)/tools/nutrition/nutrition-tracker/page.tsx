'use client';
import React from 'react';
import { useSession } from 'next-auth/react';
import { SessionProvider } from "next-auth/react";
import Header from 'components/Header';
import Footer from 'components/Footer';

// Dependencies

// Components
import UserSelector from '(protected)/components/UserSelector';
import DailySummary from '(protected)/tools/nutrition/nutrition-tracker/components/DailySummary';
import HydrationTracker from '(protected)/tools/nutrition/nutrition-tracker/components/HydrationTracker';
import NutritionList from '(protected)/tools/nutrition/nutrition-tracker/components/NutritionList';
import DailyNutritionSettings from '(protected)/tools/nutrition/nutrition-tracker/components/DailyNutritionSettings';
import OnboardingChecklist from '(protected)/tools/(components)/OnboardingChecklist';
import RelatedContent from '(protected)/tools/(components)/RelatedContent';
import DateSelector from '(protected)/components/DateSelector';
import DemoBanner from '(protected)/tools/(components)/DemoBanner';

function NutritionTrackerContent() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ? Number(session.user.id) : 1;

  const nutritionTrackerArticles = [
    {
      title: "Nutrition Overview",
      description: "Learn about Higher Endeavors' nutrition philosophy.",
      href: "/guide/nutrition-overview"
    },
    {
      title: "Sauerkraut",
      description: "Sauerkraut is a fermented cabbage that is a great source of probiotics.",
      href: "/guide/recipes/sauerkraut"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      <h1 className="text-3xl font-bold my-8">Nutrition Tracker</h1>
      <DemoBanner />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-grow space-y-4">
          <div className="flex gap-4 max-w-md items-center">
            <UserSelector
              onUserSelect={() => {}}
              currentUserId={currentUserId}
              showAdminFeatures={true}
            />
            <DateSelector />
          </div>
          <DailySummary />
          <HydrationTracker />
          <NutritionList />
          <DailyNutritionSettings />
        </div>

        {/* Sidebar */}
        <div className="lg:w-80 flex-shrink-0">
          <OnboardingChecklist />
          <RelatedContent articles={nutritionTrackerArticles} />
        </div>
      </div>
    </div>
  );
}

export default function NutritionTrackerPage() {
  return (
    <SessionProvider>
      <NutritionTrackerContent />
      <Footer />
    </SessionProvider>
  );
}
