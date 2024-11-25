import Link from 'next/link';

const Promotion = () => {
    return (
      <section className="p-12">
          <div className="bg-throat-chakra text-white pb-8 sm:text-md md:text-xl lg:text-2xl xl:text-4xl font-semibold rounded-3xl shadow-lg">
            <p className="py-8 px-12 xl:px-24 text-center" >
            Join Higher Endeavors' Beta Testing Program
            </p>
            <p className="px-12 pb-8 xl:px-24">Limited to only 20 participants. Click the button below to apply and claim your spot.</p>
            <Link href="/contact?inquiry=beta">
              <button className="hover:shadow-form rounded-md bg-purple-500 hover:bg-[#9400D3] py-3 px-8 text-base font-semibold text-white outline-none flex mx-auto">
                  Contact Us
              </button>
            </Link>
          </div>
      </section>
    );
  }
  export default Promotion