// Core
import { SessionProvider } from "next-auth/react";
import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";
import { auth } from '@/app/auth';
import { getUserSettings } from '@/app/lib/actions/userSettings';
import type { FitnessSettings } from '@/app/lib/types/userSettings.zod';

// Dependencies

// Components
import CardiometabolicTrainingClient from "./components/CMETraining.client";
import RelatedContent from "../../(components)/RelatedContent";
import OnboardingChecklist from "../../(components)/OnboardingChecklist";
import DemoBanner from "../../(components)/DemoBanner";

export default async function CardiometabolicTrainingPage() {
  const session = await auth();
  const loggedInUserId = session?.user?.id ? Number(session.user.id) : 1;

  let fitnessSettings: FitnessSettings | undefined = undefined;
  try {
    const userSettings = await getUserSettings();
    fitnessSettings = userSettings?.fitness;
  } catch (err: any) {
    console.error('Error loading user settings:', err);
  }

  const cardiometabolicTrainingArticles = [
    {
      title: "Tempo Overview",
      description: "Learn how to use tempo to improve your training.",
      href: "/guide/tempo-overview"
    },
  ];

  return (
    <SessionProvider>
      <div className="container mx-auto px-4 py-8">
        <Header />
        <h1 className="text-3xl font-bold my-8">CardioMetabolic Endurance Training Program Planning</h1>
        <DemoBanner />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-grow space-y-4">
            <CardiometabolicTrainingClient
              initialUserId={loggedInUserId}
              userId={loggedInUserId}
              fitnessSettings={fitnessSettings}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <OnboardingChecklist />
            <RelatedContent articles={cardiometabolicTrainingArticles} />
          </div>
        </div>
      </div>
      <Footer />
    </SessionProvider>
  );
}
