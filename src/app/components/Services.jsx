import Link from 'next/link';

const PerformanceTherapyIcon = () => (
    <svg className="w-[40px] h-[40px] text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4H6Zm7.25-2.095c.478-.86.75-1.85.75-2.905a5.973 5.973 0 0 0-.75-2.906 4 4 0 1 1 0 5.811ZM15.466 20c.34-.588.535-1.271.535-2v-1a5.978 5.978 0 0 0-1.528-4H18a4 4 0 0 1 4 4v1a2 2 0 0 1-2 2h-4.535Z" clipRule="evenodd"/>
    </svg>
  );

  const GuideIcon = () => (
    <svg class="w-[48px] h-[48px] text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.03v13m0-13c-2.819-.831-4.715-1.076-8.029-1.023A.99.99 0 0 0 3 6v11c0 .563.466 1.014 1.03 1.007 3.122-.043 5.018.212 7.97 1.023m0-13c2.819-.831 4.715-1.076 8.029-1.023A.99.99 0 0 1 21 6v11c0 .563-.466 1.014-1.03 1.007-3.122-.043-5.018.212-7.97 1.023"/>
    </svg>
  );

  const ToolsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-11">
  <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
</svg>

  );

  const ServiceCard = ({ icon, title, description, link }) => (
    <Link href={link} className="block">
      <div className="bg-heart-chakra p-6 rounded-3xl text-black shadow-md flex flex-col items-center h-full transition-transform hover:scale-105">
        <div className="mb-4 flex justify-center">{icon}</div>
        <h3 className="text-2xl font-bold mb-2 text-center">{title}</h3>
        <p className="text-xl text-center flex-grow flex items-center">{description}</p>
      </div>
    </Link>
  );
  
  const Services = () => {
    const services = [
      {
        icon: <PerformanceTherapyIcon />,
        title: 'Performance Therapy',
        description: 'A comprehensive and individualized approach that combines a variety of modalities in the realms of lifestyle management, healthcare, nutrition, and fitness to help you achieve your ideal self.',
        link: '/services/PerformanceTherapy',
      },
    {
      icon: <GuideIcon />,
      title: 'A Guide to Your Ideal Self',
      description: 'Our comprehensive guide integrates four key pillars: Lifestyle Management, Health, Nutrition, and Fitness, designed to support a holistic approach to living well, and achieving your ideal self. The information is concise and highly-actionable with the intent of providing you the information and tools necessary to make positive change in your life.',
      link: '',
    },
    {
      icon: <ToolsIcon />,
      title: 'HighEnd Tools',
      description: 'Higher Endeavors’ Tools are web-based apps and functionality that act as an extension of the “Guide to Your Ideal Self” which makes it easier and more effective for you to integrate the information learned into your daily life.',
      link: '',
    },
  ];

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">HighEnd Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
