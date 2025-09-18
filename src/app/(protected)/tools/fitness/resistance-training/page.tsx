// Core

import { SessionProvider } from "next-auth/react";
import Header from 'components/Header';
import Footer from 'components/Footer';
import { getExerciseLibrary } from '(protected)/tools/fitness/lib/hooks/getExerciseLibrary';
import { getUserExerciseLibrary } from '(protected)/tools/fitness/lib/hooks/getUserExerciseLibrary';
import { getCMEActivityLibrary } from '(protected)/tools/fitness/lib/hooks/getCMEActivityLibrary';
import { transformCMEActivitiesToExerciseLibrary } from '(protected)/tools/fitness/resistance-training/lib/actions/cmeTransformations';
import { ExerciseLibraryItem } from '(protected)/tools/fitness/resistance-training/types/resistance-training.zod';
import { CMEActivityLibraryItem } from '(protected)/tools/fitness/cardiometabolic-training/lib/types/cme.zod';
import RelatedContent from '(protected)/tools/(components)/RelatedContent';
import OnboardingChecklist from '(protected)/tools/(components)/OnboardingChecklist';
import ResistanceTrainingClient from '(protected)/tools/fitness/resistance-training/components/ResistanceTraining.client';
import { auth } from 'auth';
import { getUserSettings } from 'lib/actions/userSettings';
import type { FitnessSettings } from 'lib/types/userSettings.zod';

export default async function ResistanceTrainingPage() {
  const session = await auth();
  const loggedInUserId = session?.user?.id ? Number(session.user.id) : 1;

  let fitnessSettings: FitnessSettings | undefined = undefined;
  let error: Error | null = null;
  
  try {
    const userSettings = await getUserSettings();
    fitnessSettings = userSettings?.fitness;
  } catch (err: any) {
    error = err;
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error loading user settings: {error.message}
      </div>
    );
  }

  const resistanceTrainingArticles = [
    {
      title: "Tempo Overview",
      description: "Learn how to use tempo to improve your training.",
      href: "/guide/tempo-overview"
    },
  ];

  return (
    <SessionProvider>
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <Header />
        <h1 className="text-2xl sm:text-3xl font-bold my-4 sm:my-8">Resistance Training Program</h1>
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          <div className="flex-grow space-y-4">
            <ResistanceTrainingClient
              exercises={[]} // Empty array since we fetch dynamically
              initialUserId={loggedInUserId}
              userId={loggedInUserId}
              fitnessSettings={fitnessSettings}
            />
          </div>
          <div className="lg:w-80 flex-shrink-0">
            <OnboardingChecklist />
            <RelatedContent articles={resistanceTrainingArticles} />
          </div>
        </div>
      </div>
      <Footer />
    </SessionProvider>
  );
}