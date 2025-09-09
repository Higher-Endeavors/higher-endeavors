import { Suspense } from 'react';
import { SessionProvider } from "next-auth/react"
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import CalendarWidget from './components/CalendarWidget';
import MetricsDashboard from './components/MetricsDashboard';
import { getRecentArticles, getRecentRecipes } from '@/app/lib/cmsAdapter';
import { getRecentUpdates } from '@/app/lib/cmsAdapter.js';
import RecentContent from '../../guide/components/RecentContent';
import RecentRecipes from '../../guide/components/RecentRecipes';
import RecentNews from './components/RecentNews';
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
        {/* Calendar Widget */}
        <div className="mb-8">
          <CalendarWidget />
        </div>

        {/* Metrics Dashboard */}
        <div className="mb-8">
          <MetricsDashboard />
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