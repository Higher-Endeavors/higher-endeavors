import React from 'react';

interface ContinuumStage {
  title: string;
  subtitle: string;
  description: string;
}

const stages: ContinuumStage[] = [
  {
    title: 'I Am Healthy',
    subtitle: 'Build Your Foundation',
    description:
      'This is where the journey begins, or begins again. Being healthy focuses on the fundamentals: sleep, breathing, hydration, balanced nutrition, and foundational movement. It\'s about restoring balance and removing dysfunction so you can build something greater.',
  },
  {
    title: 'I Am Fit',
    subtitle: 'Develop Resilience',
    description:
      'With a solid foundation in place, the next step is to expand your capacity. Being fit helps you strengthen your body, sharpen your mind, and develop resilience through strength, endurance, structure, and consistency across all Four Pillars.',
  },
  {
    title: 'I Am HighEnd',
    subtitle: 'Live Your Vision',
    description:
      'This is the refinement phase, where life is optimized and aligned with your Ideal Self. Living a HighEnd mentality helps you fine-tune each area of life to reflect your values, goals, and aspirations so that the way you live reflects who you are becoming.',
  },
];

const ContinuumCard = ({ title, subtitle, description }: ContinuumStage) => (
  <div className="bg-sacral-chakra p-6 rounded-3xl text-black shadow-md flex flex-col items-center h-full transition-transform hover:scale-105">
    <h3 className="text-2xl font-bold mb-1 text-center">{title}</h3>
    <h4 className="text-md font-bold mb-2 text-center">{subtitle}</h4>
    <p className="text-xl text-center flex-grow">{description}</p>
  </div>
);

const Continuum = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">The Ideal Self Continuum</h2>
        <p className="text-center text-gray-700 max-w-2xl mx-auto mb-12 text-lg dark:text-gray-100">
          No matter where you're starting from, Higher Endeavors helps you progress step-by-step toward your ideal self.
          This Continuum shows the stages of transformation across Lifestyle, Health, Nutrition, and Fitness.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stages.map((stage) => (
            <ContinuumCard key={stage.title} {...stage} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Continuum;