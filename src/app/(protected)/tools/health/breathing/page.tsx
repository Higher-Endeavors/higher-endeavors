// Core
import { SessionProvider } from "next-auth/react";
import Header from 'components/Header';
import Footer from 'components/Footer';
import RelatedContent from '(protected)/tools/(components)/RelatedContent';
import OnboardingChecklist from '(protected)/tools/(components)/OnboardingChecklist';
import BreathingToolClient from '(protected)/tools/health/breathing/components/BreathingToolClient';
import { auth } from 'auth';

// Components
import DemoBanner from "(protected)/tools/(components)/DemoBanner";

export default async function BreathingToolPage() {
  const session = await auth();

  const breathingArticles = [
    {
      title: "Breathing Techniques for Stress Relief",
      description: "Learn how proper breathing can help reduce stress and improve focus.",
      href: "/guide/breathing-techniques"
    },
    {
      title: "The Science of Breath",
      description: "Understanding the physiological benefits of controlled breathing.",
      href: "/guide/science-of-breath"
    },
  ];

  return (
    <SessionProvider>
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <Header />
        <h1 className="text-2xl sm:text-3xl font-bold my-4 sm:my-8">Breathing Tool</h1>
        <DemoBanner />
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          <div className="flex-grow space-y-4">
            <BreathingToolClient />
          </div>
          <div className="lg:w-80 flex-shrink-0">
            <OnboardingChecklist />
            <RelatedContent articles={breathingArticles} />
          </div>
        </div>
      </div>
      <Footer />
    </SessionProvider>
  );
}
