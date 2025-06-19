// Core
'use client';
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";

// Dependencies

// Hooks
import { useExerciseLibrary } from "../lib/hooks/useExerciseLibrary";

// Components
import UserSelector from "../../../components/UserSelector";
import ProgramBrowser from "./components/ProgramBrowser";
import ProgramSettings from "./components/ProgramSettings";
import ExerciseList from "./components/ExerciseList";
import SessionSummary from "./components/SessionSummary";
import RelatedContent from "../../(components)/RelatedContent";
import OnboardingChecklist from "../../(components)/OnboardingChecklist";

export default function ResistanceTrainingPage() {
  // Initialize the exercise library hook
  const { exercises, isLoading, error, fetchExercises } = useExerciseLibrary();

  useEffect(() => {
    console.log('Page mounted, exercises:', exercises);
    console.log('Loading state:', isLoading);
    if (error) console.error('Exercise loading error:', error);
  }, [exercises, isLoading, error]);

  const resistanceTrainingArticles = [
    {
      title: "Tempo Overview",
      description: "Learn how to use tempo to improve your training.",
      href: "/guide/tempo-overview"
    },
  ];

  // Handle loading and error states
  if (error) {
    console.error('Failed to load exercise library:', error);
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
          {/* Main Content */}
          <div className="flex-grow space-y-4">
            <div className="max-w-md">
              <UserSelector
                onUserSelect={() => {}}
                currentUserId={1}
              />
            </div>
            <ProgramBrowser />
            <ProgramSettings />
            <ExerciseList 
              exercises={exercises}
              isLoading={isLoading}
            />
            <SessionSummary />
          </div>

          {/* Sidebar */}
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