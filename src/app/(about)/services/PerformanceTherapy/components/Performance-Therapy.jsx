import Link from 'next/link';

const PerformanceTherapyPage = () => {
  return (
    <div className="container mx-auto px-12 py-8 lg:px-36 xl:px-72">
      <h1 className="text-3xl font-bold mb-6">Performance Therapy</h1>
      <p>
      Performance Therapy is an all-encompassing approach designed by Higher Endeavors to help individuals reach their ideal selves. By integrating four key pillars—lifestyle, health, nutrition, and fitness—our services provide a holistic pathway to personal growth and well-being. This comprehensive care model ensures that every aspect of the individual is addressed to create lasting change.
      </p>
      
      <section className="my-8">
        <h2 className="text-2xl font-semibold mb-4">Who is it For?</h2>
        <p>
        Performance Therapy is for anyone with aspirations to improve their health, nutrition, fitness, or lifestyle. Whether you have specific goals or simply seek to elevate your quality of life, our services are tailored to meet your unique needs. Through a personalized intake process, Higher Endeavors’ practitioners collaborate with you to identify your goals and develop an approach that will best help you achieve them.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">What We Offer</h2>
        <p>
        Based on your personal objectives, our practitioners will evaluate which aspects of your life require focus. Typically, the most profound and long-lasting results stem from an integrated approach that addresses all four pillars. Below is an overview of each category:
        </p>
        <ul>
          <li className="font-bold pt-4">Lifestyle</li>
            <ul className="list-disc pl-6 mt-2">
              <li>Aligns beliefs, choices, habits, and routines with personal goals.</li>
              <li>Encourages sustainable changes that support the pursuit of one’s ideal self.</li>
            </ul>
            <li className="font-bold pt-4">Health</li>
            <ul className="list-disc pl-6 mt-2">
              <li>Focuses on achieving balance within the body to promote overall well-being.</li>
              <li>Incorporates principles of Functional Medicine to address dysfunction and optimize health.</li>
            </ul>
          <li className="font-bold pt-4">Nutrition</li>
            <ul className="list-disc pl-6 mt-2">
              <li>Provides tailored nutritional plans based on individual needs.</li>
              <li>Supports balanced health and optimizes bodily functions.</li>
            </ul>
          <li className="font-bold pt-4">Fitness</li>
            <ul className="list-disc pl-6 mt-2">
              <li>Targets physical dysfunctions and enhances physical capabilities.</li>
              <li>Uses strength and conditioning modalities alongside manual therapy to improve performance and health.</li>
            </ul>
        </ul>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">Why Choose Performance Therapy?</h2>
        <p>
        You deserve to feel fulfilled in every area of your life. With the right knowledge and effort, almost any aspect of your well-being can be improved. We believe that everyone has a unique vision of their ideal self, and it's up to each individual to define and strive toward that vision.
        </p>
        <p className="mt-4">
        At Higher Endeavors, our comprehensive approach sets us apart. By taking a holistic view of the individual and understanding how various factors interconnect and influence one another, we help you make progressive changes that not only help you reach your goals but also bring you closer to your ideal self.
        </p>
      </section>
      <section>
        <h2 className="text-2xl font-semibold my-4 mt-8">When Should You Begin?</h2>
        <p>
        The best time to start is now—if you're ready to commit. Improving your life and achieving your goals can be both physically and mentally demanding. You must be prepared to devote the necessary time and energy to make meaningful changes. If you’re not ready at the moment, come back when you feel prepared to embrace the challenge. All we ask is that you remain open and willing to change.
        </p>
        <p className="mt-4">
        Our practitioners will work with you to determine the ideal frequency and duration of sessions based on your goals and current position in your journey. Sessions can range from as little as 10 minutes to over two hours, with frequencies varying from once a month to several times a week.
        </p>
      </section>
      <section>
        <h2 className="text-2xl font-semibold my-4 mt-8">Where We Operate</h2>
        <p>Thanks to the global connectivity of the internet, Higher Endeavors can work with clients anywhere in the world. Much of the guidance we offer can be delivered via online consultations. For those requiring in-person services, such as manual therapy, we have practitioners based in the suburbs of Chicago, Illinois, and Dallas, Texas. 
        </p>
      </section>
      <section className="my-4">
        <p>If you are interested in working with us, please... 
          <Link href="/contact" className="block text-center sm:inline-block sm:pl-12 pt-4">
            <button className="hover:shadow-form rounded-md bg-purple-500 hover:bg-[#9400D3] py-3 px-8 text-base font-semibold text-white outline-none">
              Contact Us
            </button>
          </Link>
        </p>
      </section>
    </div>
  );
};

export default PerformanceTherapyPage;
