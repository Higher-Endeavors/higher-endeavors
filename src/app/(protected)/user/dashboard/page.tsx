import { Suspense } from 'react';
import { SessionProvider } from "next-auth/react"
import Header from 'components/Header';
import Footer from 'components/Footer';
import CalendarWidget from '(protected)/user/dashboard/components/CalendarWidget';
import MetricsDashboard from '(protected)/user/dashboard/components/MetricsDashboard';
import { getRecentArticles, getRecentRecipes } from 'lib/cmsAdapter';
import { getRecentUpdates } from 'lib/cmsAdapter.js';
import RecentContent from '(protected)/guide/components/RecentContent';
import RecentRecipes from '(protected)/guide/components/RecentRecipes';
import RecentNews from '(protected)/user/dashboard/components/RecentNews';
import type { Recipe } from '(protected)/guide/components/RecentRecipes';
import { serverLogger } from 'lib/logging/logger.server';

export default async function Dashboard() {
  const recentArticles = await getRecentArticles();
  const recentRecipes: Recipe[] = await getRecentRecipes();
  const recentUpdates = await getRecentUpdates();
  
  serverLogger.debug('Dashboard rendered', { 
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