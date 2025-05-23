// Core
'use client';
import { SessionProvider } from "next-auth/react";
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

export default function CardiometabolicTrainingPage() {
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
            <RelatedContent articles={cardiometabolicTrainingArticles} />
          </div>
        </div>
      </div>
      <Footer />
    </SessionProvider>
  );
}
