// Core
'use client';
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";

// Dependencies

// Components
import UserSelector from "../../../components/UserSelector";
import ProgramBrowser from "./components/ProgramBrowser";
import ProgramSettings from "./components/ProgramSettings";
import ExerciseList from "./components/ExerciseList";
import SessionSummary from "./components/SessionSummary";
import RelatedContent from "../../(components)/RelatedContent";
import OnboardingChecklist from "../../(components)/OnboardingChecklist";

export default function ResistanceTrainingPage() {
  const resistanceTrainingArticles = [
    {
      title: "Understanding Periodization",
      description: "Learn about different periodization models and how to apply them to your training program.",
      href: "/guides/fitness/periodization"
    },
    {
      title: "Exercise Selection Principles",
      description: "Guidelines for selecting exercises based on your training goals and experience level.",
      href: "/guides/fitness/exercise-selection"
    },
    {
      title: "Volume and Intensity Management",
      description: "How to properly manage training volume and intensity for optimal progress.",
      href: "/guides/fitness/volume-intensity"
    }
  ];

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
          <ExerciseList />
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