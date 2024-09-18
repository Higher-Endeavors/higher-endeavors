'use client';

import { useState } from 'react';
import ExerciseLog from './ExerciseLog';
import ExerciseForm from './ExerciseForm';
import DataAnalysis from './DataAnalysis';

export default function GreaseTheGroove() {
  const [activeTab, setActiveTab] = useState('log');

  return (
    <div>
      <div className="flex mb-4 text-black">
        <button
          className={`mr-2 px-4 py-2 rounded ${activeTab === 'log' ? 'bg-blue-500' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('log')}
        >
          Log
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'analysis' ? 'bg-blue-500' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('analysis')}
        >
          Analysis
        </button>
      </div>
      {activeTab === 'log' ? (
        <>
          <ExerciseForm />
          <ExerciseLog />
        </>
      ) : (
        <DataAnalysis />
      )}
    </div>
  );
}