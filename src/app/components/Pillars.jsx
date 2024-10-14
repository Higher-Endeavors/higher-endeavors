import Link from 'next/link';

const LifestyleIcon = () => (
  <svg className="w-[40px] h-[40px] text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v9m-5 0H4.6a.6.6 0 0 1-.6-.6v-3.8a.6.6 0 0 1 .6-.6h2.4a1 1 0 0 1 1 1v4zm5 0h2.4a.6.6 0 0 0 .6-.6v-3.8a.6.6 0 0 0-.6-.6H17a1 1 0 0 0-1 1v4zm0 0h-5m-4 4h12a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1zm12-16c.4 1.5 2 3.5 4 4"/>
  </svg>
);

const HealthIcon = () => (
  <svg className="w-[40px] h-[40px] text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.5 18.6V21M18 18.6v2.4m-13-2.4v2.4m-1.5-8.4v3.6c0 .7.3 1.3.8 1.7l5.7 4.9c.5.4 1.2.4 1.7 0l5.7-4.9c.5-.4.8-1 .8-1.7v-3.6m-4.3-2.8-6.4-2.8-6.4 2.8m17.1 0-6.4-2.8m6.4 2.8L12 4.7m6.4 2.9v-.6c0-.4-.3-.8-.7-.9l-5.4-1.3c-.2 0-.4 0-.6.1L6.3 6.1c-.4.1-.7.5-.7.9v.6"/>
  </svg>
);

const NutritionIcon = () => (
  <svg className="w-[40px] h-[40px] text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.6 8.4h0m-4.7 11.3-6.6-6.6a1 1 0 0 1 0-1.4l7.3-7.4a1 1 0 0 1 .7-.3H18a2 2 0 0 1 2 2v5.5a1 1 0 0 1-.3.7l-7.5 7.5a1 1 0 0 1-1.3 0Z"/>
  </svg>
);

const FitnessIcon = () => (
  <svg className="w-[40px] h-[40px] text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.4 18H19c.6 0 1-.4 1-1v-5c0-.6-.4-1-1-1H5a1 1 0 0 0-1 1v5c0 .6.4 1 1 1h2.6m9.4-7V5c0-.6-.4-1-1-1H8a1 1 0 0 0-1 1v6m-2 7h14v2c0 .6-.4 1-1 1H6a1 1 0 0 1-1-1v-2Zm7-7h.01M12 16h.01M8 16h.01M16 16h.01"/>
  </svg>
);

const PillarCard = ({ icon, title, description, link }) => (
  <Link href={link} className="block">
    <div className="bg-sacral-chakra p-6 rounded-3xl text-black shadow-md flex flex-col items-center h-full transition-transform hover:scale-105">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="text-2xl font-bold mb-2 text-center">{title}</h3>
      <p className="text-xl text-center flex-grow flex items-center">{description}</p>
    </div>
  </Link>
);

const Pillars = () => {
  const pillars = [
    {
      icon: <LifestyleIcon />,
      title: 'Lifestyle Management',
      description: 'Lifestyle management encompasses how you structure your daily life and, more importantly, why you make the choices you do. This includes your daily routines, habits, social interactions, work-life balance, hobbies, and activities. Understanding and optimizing these aspects can lead to a fulfilling and balanced life, enabling you to become the best version of yourself.',
      link: '/guide/lifestyle-management',
    },
    {
      icon: <HealthIcon />,
      title: 'Health',
      description: 'Health is often perceived simply as the absence of disease. However, at Higher Endeavors, we view health as a dynamic continuum ranging from death to vibrant vitality. Our approach incorporates the principles of Functional Medicine, focusing on achieving balance within the individual through personalized, holistic care. This overview explores the importance of various health aspects and guides you on a journey toward realizing your ideal self.',
      link: '/guide/health',
    },
    {
      icon: <NutritionIcon />,
      title: 'Nutrition',
      description: 'Fuel your body with the right foods to support your goals and overall health.',
      link: '/guide/nutrition',
    },
    {
      icon: <FitnessIcon />,
      title: 'Fitness',
      description: 'Develop a strong, flexible, and resilient body through targeted exercise.',
      link: '/guide/fitness',
    },
  ];

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">HighEnd Pillars</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, index) => (
            <PillarCard key={index} {...pillar} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pillars;