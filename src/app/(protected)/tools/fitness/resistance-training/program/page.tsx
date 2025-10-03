// Core

import { SessionProvider } from "next-auth/react";
import Header from 'components/Header';
import Footer from 'components/Footer';
import { getExerciseLibrary } from '(protected)/tools/fitness/lib/hooks/getExerciseLibrary';
import { getUserExerciseLibrary } from '(protected)/tools/fitness/lib/hooks/getUserExerciseLibrary';
import { getCMEActivityLibrary } from '(protected)/tools/fitness/lib/hooks/getCMEActivityLibrary';
import { transformCMEActivitiesToExerciseLibrary } from '(protected)/tools/fitness/resistance-training/lib/actions/cmeTransformations';
import { getResistancePhases } from '(protected)/tools/fitness/resistance-training/program/lib/hooks/getResistancePhases';
import { getResistancePeriodizationTypes } from '(protected)/tools/fitness/resistance-training/program/lib/hooks/getResistancePeriodizationTypes';
import { getTierContinuum } from '(protected)/tools/fitness/resistance-training/program/lib/hooks/getTierContinuum';
import { getTemplateCategories } from '(protected)/tools/fitness/resistance-training/program/lib/hooks/getTemplateCategories';
import RelatedContent from '(protected)/tools/(components)/RelatedContent';
import OnboardingChecklist from '(protected)/tools/(components)/OnboardingChecklist';
import ResistanceTrainingClient from '(protected)/tools/fitness/resistance-training/program/components/ResistanceTraining.client';
import { auth } from 'auth';
import { getUserSettings } from 'lib/actions/userSettings';
import type { FitnessSettings } from 'lib/types/userSettings.zod';

export default async function ResistanceTrainingPage() {
  const session = await auth();
  const loggedInUserId = session?.user?.id ? Number(session.user.id) : 1;

  const [userSettings, phases, periodizationTypes, tierContinuum, templateCategories] = await Promise.all([
    getUserSettings().catch(() => undefined),
    getResistancePhases().catch(() => []),
    getResistancePeriodizationTypes().catch(() => []),
    getTierContinuum().catch(() => []),
    getTemplateCategories().catch(() => []),
  ]);

  const fitnessSettings: FitnessSettings | undefined = userSettings?.fitness;

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
              initialPhases={phases}
              initialPeriodizationTypes={periodizationTypes}
              initialTierContinuum={tierContinuum}
              initialTemplateCategories={templateCategories}
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