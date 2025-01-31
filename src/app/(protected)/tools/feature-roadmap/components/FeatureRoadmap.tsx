import React, { type JSX } from 'react';

interface FeatureRoadmapProps {
  features: {
    title: string;
    description: string;
    status: 'planned' | 'in-progress' | 'completed';
  }[];
}

const FeatureRoadmap = ({ features }: FeatureRoadmapProps): React.ReactElement => {
  return (
    <div className="bg-white dark:bg-[#e0e0e0] rounded-lg shadow-md p-6">
      <h2 className="text-slate-800 text-xl font-semibold mb-4">Feature Roadmap</h2>
      <div className="space-y-4">
        {features.map((feature, index) => (
          <div key={index} className="border-l-4 border-green-800 pl-4">
            <h3 className="font-medium text-lg text-slate-600">{feature.title}</h3>
            <p className="text-gray-600 mt-1">{feature.description}</p>
            <span className={`text-sm mt-2 inline-block px-2 py-1 rounded ${
              feature.status === 'completed' ? 'bg-green-100 text-green-800' :
              feature.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {feature.status.charAt(0).toUpperCase() + feature.status.slice(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureRoadmap; 