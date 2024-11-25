import { Suspense } from 'react';
import { SessionProvider } from "next-auth/react"
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import PillarColumn from './components/PillarColumn';
import ToolCard from './components/ToolCard';
import StructuralBalanceMini from './components/StructuralBalanceMini';

export default function Dashboard() {
  return (
    <SessionProvider>
        <Header />
        <main className="min-h-screen py-4 md:py-8 mx-5">
            {/* Calendar Placeholder */}
            <div className="mb-8 p-4 border rounded-lg bg-gray-50">
            <h2 className="text-xl font-semibold">Calendar</h2>
            <p className="text-gray-600">Calendar functionality coming soon...</p>
            </div>

            {/* Four Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <PillarColumn title="Lifestyle Management">
                <div className="text-gray-500">Lifestyle Management tools coming soon...</div>
            </PillarColumn>
            <PillarColumn title="Health">
                <div className="text-gray-500">Health tools coming soon...</div>
            </PillarColumn>
            <PillarColumn title="Nutrition">
                <div className="text-gray-500">Nutrition tools coming soon...</div>
            </PillarColumn>
            <PillarColumn title="Fitness">
                <ToolCard 
                title="Structural Balance"
                description="Calculate balanced lift loads based on your master lift"
                >
                <StructuralBalanceMini />
                </ToolCard>
                {/* Add more fitness tools */}
            </PillarColumn>
            </div>

            {/* Guide Content Section */}
            <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Recent Articles</h2>
            {/* Uncomment when ready to implement */}
            {/* <Suspense fallback={<div>Loading recent articles...</div>}>
                <RecentArticles limit={5} />
            </Suspense> */}
            </div>
        </main>
        <Footer />
    </SessionProvider>
  );
} 