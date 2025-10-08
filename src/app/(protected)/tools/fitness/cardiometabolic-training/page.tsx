import Link from 'next/link';
import Header from 'components/Header';
import Footer from 'components/Footer';
import RecentSessions from '(protected)/tools/fitness/cardiometabolic-training/components/RecentSessions';
import WeeklyCMEVolumeWidget from '(protected)/user/widgets/WeeklyCMEVolumeWidget';
import TimeInZonesWidget from '(protected)/user/widgets/TimeInZonesWidget';
import { getGarminDeviceAttribution } from 'lib/actions/userSettings';
import { Suspense } from 'react';

export default async function CardiometabolicTrainingDashboard({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = (await searchParams) || {};
  const phases = [
    {
      name: 'Plan',
      description: 'Plan the phases and blocks for your CME training plan',
      href: '/tools/fitness/plan',
      icon: '📝',
      color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
    },
    {
      name: 'Program',
      description: 'Design and customize your CME training sessions',
      href: '/tools/fitness/cardiometabolic-training/program',
      icon: '🏃‍♂️',
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
    },
    // {
    //   name: 'Act',
    //   description: 'Execute your workouts with real-time tracking',
    //   href: '/tools/fitness/cardiometabolic-training/act',
    //   icon: '⚡',
    //   color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
    // },
    {
      name: 'Analyze',
      description: 'Review performance data and track your progress',
      href: '/tools/fitness/cardiometabolic-training/analyze',
      icon: '📊',
      color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700'
    }
  ];

  const pageParam = typeof sp.page === 'string' ? parseInt(sp.page, 10) : 1;
  const page = Number.isNaN(pageParam) ? 1 : Math.max(1, pageParam);
  const garminAttribution = await getGarminDeviceAttribution();

  return (
    <div>
      <Header />
      <main className="min-h-screen py-4 md:py-8 mx-5">
        <h1 className="text-4xl font-bold text-center mb-4">CardioMetabolic Endurance Training</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-12">
          A comprehensive three-phase approach to CME training
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {phases.map((phase) => (
            <Link
              key={phase.name}
              href={phase.href}
              className={`block p-6 rounded-lg border-2 transition-all duration-200 hover:shadow-lg hover:scale-105 ${phase.color}`}
            >
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-4">{phase.icon}</span>
                <h2 className="text-2xl font-bold">{phase.name}</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {phase.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2">
            <Suspense fallback={<div className="rounded-lg border p-4">Loading recent sessions…</div>}>
              <RecentSessions page={page} perPage={5} />
            </Suspense>
          </div>
          <div>
            <div className="space-y-4">
              <WeeklyCMEVolumeWidget garminAttribution={garminAttribution} />
              <TimeInZonesWidget garminAttribution={garminAttribution} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
