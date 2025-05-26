// Core
'use client';
import { SessionProvider } from "next-auth/react";
import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";

// Dependencies

// Components
import UserSelector from "../../../components/UserSelector";
import DailySummary from "./components/DailySummary";
import NutritionList from "./components/NutritionList";
import OnboardingChecklist from "../../(components)/OnboardingChecklist";
import RelatedContent from "../../(components)/RelatedContent";

export default function NutritionTrackerPage() {
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
        <SessionProvider>
        <div className="container mx-auto px-4 py-8">
            <Header />
            <h1 className="text-3xl font-bold my-8">Nutrition Tracker</h1>

        <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content */}
            <div className="flex-grow space-y-4">
            <div className="max-w-md">
                <UserSelector
                onUserSelect={() => {}}
                currentUserId={1}
                />
            </div>
                <DailySummary />
                <NutritionList />
            </div>

            {/* Sidebar */}
            <div className="lg:w-80 flex-shrink-0">
            <OnboardingChecklist />
                <RelatedContent articles={nutritionTrackerArticles} />
            </div>
            </div>
        </div>
        <Footer />
        </SessionProvider>
    );
    }
