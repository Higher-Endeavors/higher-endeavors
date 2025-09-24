// Core
'use client';

import Header from 'components/Header';
import Footer from 'components/Footer';
import GoalList from '(protected)/tools/lifestyle/goal-tracker/components/GoalList';
import OnboardingChecklist from '(protected)/tools/(components)/OnboardingChecklist';
import RelatedContent from '(protected)/tools/(components)/RelatedContent';
import DemoBanner from '(protected)/tools/(components)/DemoBanner';

export default function GoalTrackerPage() {

    const GoalSettingArticles = [
        {
          title: "Goal Setting",
          description: "Learn how to set goals and track your progress.",
          href: ""
        },
        
      ];
  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      <h1 className="text-3xl font-bold my-8">Goal Tracker</h1>
      <DemoBanner />
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-grow space-y-4">
          <GoalList />
        </div>
        {/* Sidebar (optional for future expansion) */}
        <div className="lg:w-80 flex-shrink-0">
          <OnboardingChecklist />
          <RelatedContent articles={GoalSettingArticles} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
