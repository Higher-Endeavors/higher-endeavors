// Core
import { SessionProvider } from "next-auth/react";
// import Header from "../../../../components/Header";
// import Footer from "../../../../components/Footer";
import { auth } from '@/app/auth';
import { getUserSettings } from '@/app/lib/actions/userSettings';
import { getCMEActivityLibrary } from '../../lib/hooks/getCMEActivityLibrary';
import { SingleQuery } from '@/app/lib/dbAdapter';
import type { FitnessSettings } from '@/app/lib/types/userSettings.zod';
import type { CMEActivityItem } from '../lib/types/cme.zod';

// Components
import CardiometabolicTrainingClient from "../components/CMETraining.client";
import RelatedContent from "../../../(components)/RelatedContent";
import OnboardingChecklist from "../../../(components)/OnboardingChecklist";
import DemoBanner from "../../../(components)/DemoBanner";

// Function to fetch user's heart rate zones
async function getUserHeartRateZones(userId: number) {
  try {
    const result = await SingleQuery(
      `SELECT 
        hr_zone_id,
        calculation_method,
        activity_type,
        zone_ranges,
        max_heart_rate,
        resting_heart_rate
      FROM user_bio_hr_zones 
      WHERE user_id = $1
      ORDER BY activity_type, hr_zone_id`,
      [userId]
    );

    if (result.rows.length === 0) {
      return [];
    }

    return result.rows.map((row: any) => ({
      hrZoneId: row.hr_zone_id,
      calculationMethod: row.calculation_method,
      activityType: row.activity_type,
      zones: row.zone_ranges || [], // This is already parsed JSON from the database
      maxHeartRate: row.max_heart_rate,
      restingHeartRate: row.resting_heart_rate
    }));
  } catch (error) {
    console.error('Error fetching heart rate zones:', error);
    return [];
  }
}

export default async function ProgramPage() {
  const session = await auth();
  const loggedInUserId = session?.user?.id ? Number(session.user.id) : 1;

  let fitnessSettings: FitnessSettings | undefined = undefined;
  let cmeActivities: CMEActivityItem[] = [];
  let userHeartRateZones: any[] = [];
  let error: Error | null = null;

  try {
    // Fetch all data at the page level
    const [userSettings, cmeData, hrZones] = await Promise.all([
      getUserSettings(),
      getCMEActivityLibrary(),
      getUserHeartRateZones(loggedInUserId)
    ]);

    fitnessSettings = userSettings?.fitness;
    
    // Transform CME library activities
    cmeActivities = cmeData.map((activity: any) => ({
      cme_activity_library_id: activity.cme_activity_library_id,
      name: activity.name,
      source: 'cme_library' as const,
      activity_family: activity.activity_family || undefined,
      equipment: activity.equipment || undefined
    }));

    userHeartRateZones = hrZones;
  } catch (err: any) {
    error = err;
    console.error('Error loading CME training data:', err);
  }

  // All activities come from CME library only
  const allActivities: CMEActivityItem[] = cmeActivities;

  const cardiometabolicTrainingArticles = [
    {
      title: "Tempo Overview",
      description: "Learn how to use tempo to improve your training.",
      href: "/guide/tempo-overview"
    },
  ];

  if (error) {
    return (
      <div className="text-red-500">
        Error loading CME training data: {error.message}
      </div>
    );
  }

  return (
    <SessionProvider>
      <div className="container mx-auto px-4 py-8">
        {/* <Header /> */}
        <h1 className="text-3xl font-bold my-8">CardioMetabolic Endurance Training Programming</h1>
        <DemoBanner />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-grow space-y-4">
            <CardiometabolicTrainingClient
              initialUserId={loggedInUserId}
              userId={loggedInUserId}
              fitnessSettings={fitnessSettings}
              userHeartRateZones={userHeartRateZones}
              activities={allActivities}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <OnboardingChecklist />
            <RelatedContent articles={cardiometabolicTrainingArticles} />
          </div>
        </div>
      </div>
      {/* <Footer /> */}
    </SessionProvider>
  );
}
