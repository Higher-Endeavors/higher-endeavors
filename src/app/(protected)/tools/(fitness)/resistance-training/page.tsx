// Core

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";
import { getExerciseLibrary } from '../lib/hooks/getExerciseLibrary';
import { getUserExerciseLibrary } from '../lib/hooks/getUserExerciseLibrary';
import { ExerciseLibraryItem } from '../resistance-training/types/resistance-training.zod';
import RelatedContent from "../../(components)/RelatedContent";
import OnboardingChecklist from "../../(components)/OnboardingChecklist";
import ResistanceTrainingClient from "./components/ResistanceTraining.client";
import { auth } from '@/app/auth';
import { getUserSettings } from '@/app/lib/actions/userSettings';
import type { FitnessSettings } from '@/app/lib/types/userSettings.zod';

// Components
import UserSelector from "../../../components/UserSelector";
import ProgramBrowser from "./components/ProgramBrowser";
import ProgramSettings from "./components/ProgramSettings";
import ExerciseList from "./components/ExerciseList";
import SessionSummary from "./components/SessionSummary";

export default async function ResistanceTrainingPage() {
  const session = await auth();
  const loggedInUserId = session?.user?.id ? Number(session.user.id) : 1;

  let libraryExercises: ExerciseLibraryItem[] = [];
  let userExercises: ExerciseLibraryItem[] = [];
  let error: Error | null = null;
  let fitnessSettings: FitnessSettings | undefined = undefined;
  try {
    libraryExercises = await getExerciseLibrary();
    userExercises = await getUserExerciseLibrary(loggedInUserId);
    const userSettings = await getUserSettings();
    fitnessSettings = userSettings?.fitness;
  } catch (err: any) {
    error = err;
  }

  const allExercises = [...userExercises, ...libraryExercises];

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
      <div className="container mx-auto px-4 py-8">
        <Header />
        <h1 className="text-3xl font-bold my-8">Resistance Training Program</h1>
        <div className="flex flex-col lg:flex-row gap-6">
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