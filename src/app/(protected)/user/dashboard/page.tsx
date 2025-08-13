import { Suspense } from 'react';
import { SessionProvider } from "next-auth/react"
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import PillarColumn from './components/PillarColumn';
import ToolCard from './components/ToolCard';
import StructuralBalanceMini from './components/StructuralBalanceMini';
import { getRecentArticles, getRecentRecipes } from '@/app/lib/cmsAdapter';
import { getRecentUpdates } from '@/app/lib/cmsAdapter.js';
import RecentContent from '../../guide/components/RecentContent';
import RecentRecipes from '../../guide/components/RecentRecipes';
import RecentNews from './components/RecentNews';
import Link from 'next/link';
import type { Recipe } from '../../guide/components/RecentRecipes';
import { serverLogger } from '@/app/lib/logging/logger.server';

export default async function Dashboard() {
  const recentArticles = await getRecentArticles();
  const recentRecipes: Recipe[] = await getRecentRecipes();
  const recentUpdates = await getRecentUpdates();
  
  serverLogger.info('Dashboard rendered', { 
    component: 'Dashboard',
    timestamp: new Date().toISOString()
  });

  return (
    <SessionProvider>
      <Header />
      <main className="min-h-screen py-4 md:py-8 mx-5">
        {/* Calendar Placeholder */}
        <div className="mb-8 p-4 border rounded-lg bg-gray-50 dark:bg-[#e0e0e0]">
          <h2 className="text-xl text-gray-800 font-semibold">Calendar</h2>
          <p className="text-gray-600">Calendar functionality coming soon...</p>
        </div>

        {/* Four Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <PillarColumn title="Lifestyle">
            <Link 
              href="/tools/sleep-quiz" 
              className="block p-4 border rounded-lg bg-white dark:bg-[#e0e0e0] shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800">
                Sleep Quality Assessment →
              </h3>
              <p className="text-gray-600">Evaluate your sleep quality and get personalized recommendations</p>
            </Link>
          </PillarColumn>
          <PillarColumn title="Health">
            <Link 
              href="/tools/body-composition" 
              className="block p-4 border rounded-lg bg-white dark:bg-[#e0e0e0] shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800">
                Body Composition Tracker →
              </h3>
              <p className="text-gray-600">Track and analyze your body composition measurements over time</p>
            </Link>
          </PillarColumn>
          <PillarColumn title="Nutrition">
            <div className="text-gray-500">Nutrition tools coming soon...</div>
          </PillarColumn>
          <PillarColumn title="Fitness">
            {/* <ToolCard 
              title="Structural Balance"
              description="Calculate balanced lift loads based on your master lift"
            >
              <StructuralBalanceMini />
            </ToolCard> */}
            <Link 
              href="/tools/structural-balance" 
              className="block p-4 border rounded-lg bg-white dark:bg-[#e0e0e0] shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800">
                Structural Balance Tool →
              </h3>
              <p className="text-gray-600">Access the complete structural balance calculator with additional features</p>
            </Link>
          </PillarColumn>
        </div>

        {/* Add separator here */}
        <hr className="border-gray-500 my-8" />

        {/* Guide Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <RecentNews updates={recentUpdates} />
          </div>
          <div>
            <Suspense fallback={<div>Loading recent articles...</div>}>
              <RecentContent articles={recentArticles} />
            </Suspense>
          </div>
          <div>
            <Suspense fallback={<div>Loading recent recipes...</div>}>
              <RecentRecipes recipes={recentRecipes} />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </SessionProvider>
  );
} 