// Core

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";

// Dependencies

// Hooks
import { getExerciseLibrary } from '../lib/hooks/getExerciseLibrary';
import { ExerciseLibraryItem } from '../resistance-training/types/resistance-training.types';

// Components
import UserSelector from "../../../components/UserSelector";
import ProgramBrowser from "./components/ProgramBrowser";
import ProgramSettings from "./components/ProgramSettings";
import ExerciseList from "./components/ExerciseList";
import SessionSummary from "./components/SessionSummary";
import RelatedContent from "../../(components)/RelatedContent";
import OnboardingChecklist from "../../(components)/OnboardingChecklist";
import ResistanceTrainingClient from "./ResistanceTrainingClient";

export default async function ResistanceTrainingPage() {
  let exercises: ExerciseLibraryItem[] = [];
  let error: Error | null = null;
  try {
    exercises = await getExerciseLibrary();
  } catch (err: any) {
    error = err;
  }

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
        <h1 className="text-3xl font-bold my-8">Resistance Training Program Planning</h1>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-grow space-y-4">
            <ResistanceTrainingClient exercises={exercises} initialUserId={1} />
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