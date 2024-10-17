import React from 'react';
import ReferenceLiftsList from './components/ReferenceLiftsList';
import ReferenceLiftsForm from './components/ReferenceLiftsForm';

export default function ReferenceLiftsPage() {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Reference Lifts</h1>
      <ReferenceLiftsForm />
      <ReferenceLiftsList />
    </div>
  );
}
