import { auth } from "auth";
import { SessionProvider } from "next-auth/react";
import BalancedLiftsForm from '(protected)/tools/fitness/structural-balance/components/BalancedLiftsForm';
import Header from 'components/Header';
import Footer from 'components/Footer';
import FeatureRoadmap from '(protected)/tools/feature-roadmap/components/FeatureRoadmap';
import RelatedContent from '(protected)/tools/(components)/RelatedContent';
import { serverLogger } from 'lib/logging/logger.server';
import { getApiBaseUrl } from 'lib/utils/apiUtils';

type RefLift = {
  id: number;
  exercise_name: string;
  struct_bal_ref_lift_load: number;
  struct_bal_ref_lift_note: string;
};
type RefLifts = RefLift[];

const structuralBalanceFeatures = [
  {
    title: "Save Your Calculations",
    description: "Save your structural balance calculations for future reference",
    status: "in-progress" as const,
  },
  {
    title: "Progress Tracking",
    description: "Track your structural balance progress over time",
    status: "in-progress" as const,
  },
  {
    title: "Apply to Your Training",
    description: "Use your structural balance calculations to program your resistance training",
    status: "planned" as const,
  },
];

const relatedArticles = [
  {
    title: "Structural Balance",
    description: "Learn the fundamentals of structural balance training",
    href: "/guide/structural-balance",
  },
  {
    title: "Fitness Overview",
    description: "An overview of Higher Endeavors' approach to fitness",
    href: "/guide/fitness-overview",
  },
];

export default async function BalancedLiftsPage() {
  const session = await auth();
  // if (!session?.user) {
  //   return (
  //     <div className="container mx-auto px-4">
  //       <h1 className="text-2xl font-bold mb-4">You must be signed in.</h1>
  //     </div>
  //   );
  // }

  const getRefLifts = async (): Promise<RefLifts> => {
    const apiBaseUrl = await getApiBaseUrl();
    const fetchUrl = `${apiBaseUrl}/api/reference-lifts`;

    try {
      const response = await fetch(`${fetchUrl}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
       cache: 'force-cache',
      });
      const refLifts = await response.json();
      return refLifts.rows;
    } catch (error) {
      await serverLogger.error('Error in structural balance page', error);
      return [];
    }
  };

  const refLifts = await getRefLifts();

  return (
    <SessionProvider>
      <div>
        <Header />
        <div className="container mx-auto mb-12 px-4">
          <h1 className="text-4xl font-bold mx-auto px-12 py-8 lg:px-36 xl:px-72">Structural Balance Tool</h1>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <BalancedLiftsForm refLifts={refLifts} />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <FeatureRoadmap features={structuralBalanceFeatures} />
              <RelatedContent articles={relatedArticles} />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </SessionProvider>
  );
}
