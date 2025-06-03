// Core
'use client';

import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import GoalList from './components/GoalList';

export default function GoalTrackerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      <h1 className="text-3xl font-bold my-8">Goal Tracker</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-grow space-y-4">
          <GoalList />
        </div>
        {/* Sidebar (optional for future expansion) */}
        {/* <div className="lg:w-80 flex-shrink-0"> */}
        {/*   Sidebar content here */}
        {/* </div> */}
      </div>
      <Footer />
    </div>
  );
}
