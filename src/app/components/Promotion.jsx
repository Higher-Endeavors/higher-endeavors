import Link from 'next/link';

const Promotion = () => {
  return (
    <section className="p-12">
      <div className="bg-throat-chakra text-white pb-8 font-semibold rounded-3xl shadow-lg">
        <p className="py-8 px-12 xl:px-24 sm:text-md md:text-xl lg:text-2xl xl:text-4xl text-center">
          Be an Early Adopter of Higher Endeavors
        </p>
        <p className="px-12 pb-4 xl:px-24 sm:text-sm md:text-lg lg:text-xl xl:text-2xl text-center">
          The journey to your ideal self starts now. This is the first step in a long-term vision to bring transformative tools to those who seek more from life.
        </p>
        <p className="px-12 pb-4 xl:px-24 sm:text-sm md:text-lg lg:text-xl xl:text-2xl text-center">
          Join today as an Early Adopter and lock in exclusive access for just <strong>$5/month</strong>. This special pricing won&apos;t last.
        </p>
        <p className="px-12 pb-8 xl:px-24 sm:text-sm md:text-lg lg:text-xl xl:text-2xl text-center">
          Help shape the future of Higher Endeavors while accelerating your own growth.
        </p>
        <Link href="/contact?inquiry=early-adopter">
          <button className="hover:shadow-form rounded-md bg-purple-500 hover:bg-[#9400D3] py-3 px-8 text-base font-semibold text-white outline-none shadow-lg flex mx-auto">
            Join Now
          </button>
        </Link>
      </div>
    </section>
  );
}

export default Promotion;