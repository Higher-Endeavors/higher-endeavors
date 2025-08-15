// Core

import { SessionProvider } from "next-auth/react";
import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";
import { getExerciseLibrary } from '../lib/hooks/getExerciseLibrary';
import { getUserExerciseLibrary } from '../lib/hooks/getUserExerciseLibrary';
import { getCMEActivityLibrary } from '../lib/hooks/getCMEActivityLibrary';
import { transformCMEActivitiesToExerciseLibrary } from './lib/actions/cmeTransformations';
import { ExerciseLibraryItem } from '../resistance-training/types/resistance-training.zod';
import { CMEActivityLibraryItem } from '../cardiometabolic-training/types/cme-training.zod';
import RelatedContent from "../../(components)/RelatedContent";
import OnboardingChecklist from "../../(components)/OnboardingChecklist";
import ResistanceTrainingClient from "./components/ResistanceTraining.client";
import { auth } from '@/app/auth';
import { getUserSettings } from '@/app/lib/actions/userSettings';
import type { FitnessSettings } from '@/app/lib/types/userSettings.zod';

export default async function ResistanceTrainingPage() {
  const session = await auth();
  const loggedInUserId = session?.user?.id ? Number(session.user.id) : 1;

  let libraryExercises: ExerciseLibraryItem[] = [];
  let userExercises: ExerciseLibraryItem[] = [];
  let cmeActivities: CMEActivityLibraryItem[] = [];
  let error: Error | null = null;
  let fitnessSettings: FitnessSettings | undefined = undefined;
  try {
    libraryExercises = await getExerciseLibrary();
    userExercises = await getUserExerciseLibrary(loggedInUserId);
    cmeActivities = await getCMEActivityLibrary();
    const userSettings = await getUserSettings();
    fitnessSettings = userSettings?.fitness;
  } catch (err: any) {
    error = err;
  }

  // Transform CME activities to match ExerciseLibraryItem format for compatibility
  const transformedCMEActivities: ExerciseLibraryItem[] = transformCMEActivitiesToExerciseLibrary(cmeActivities);

  // Combine all exercises and activities for the AddExerciseModal
  const allExercises: ExerciseLibraryItem[] = [...userExercises, ...libraryExercises, ...transformedCMEActivities];

  const resistanceTrainingArticles = [
    {
      title: "Tempo Overview",
      description: "Learn how to use tempo to improve your training.",
      href: "/guide/tempo-overview"
    },
  ];

  if (error) {
    return (
      <div className="text-red-500">
        Error loading exercises: {error.message}
      </div>
    );
  }

  return (
    <SessionProvider>
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <Header />
        <h1 className="text-2xl sm:text-3xl font-bold my-4 sm:my-8">Resistance Training Program</h1>
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          <div className="flex-grow space-y-4">
            <ResistanceTrainingClient
              exercises={allExercises}
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