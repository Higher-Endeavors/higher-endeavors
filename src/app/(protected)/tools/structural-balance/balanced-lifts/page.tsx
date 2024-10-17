import React from 'react';
import BalancedLiftsForm from './components/BalancedLiftsForm';
import BalancedLiftsList from './components/BalancedLiftsList';

export default function BalancedLiftsPage() {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Balanced Lifts Calculator</h1>
      <BalancedLiftsForm />
      <BalancedLiftsList />
    </div>
  );
}
