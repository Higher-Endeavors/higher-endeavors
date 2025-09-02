"use client";

import { useSession } from 'next-auth/react';

const Footer = () => {
  const { data: session } = useSession();

  return (
    <footer className="footer bg-root-chakra py-12 px-4 sm:px-12 sm:text-m lg:text-xl text-[#C7DBFF]">
      {/* Navigation Links */}
      <div className="flex flex-wrap gap-x-12 sm:gap-x-24">
        <ul>
          <li className="hover:text-[#CBAACB] pb-4"><a href="/about-us">About Us</a></li>
          <li className="hover:text-[#CBAACB]"><a href="/contact">Contact Us</a></li>
        </ul>
        <ul>
          <li className="hover:text-[#CBAACB]"><a href="/privacy-policy">Privacy Policy</a></li>
        </ul>
        <ul>
          {session?.user && (
            <li className="hover:text-[#CBAACB] pb-4"><a href="/news-updates">News & Updates</a></li>
          )}
          {session?.user && (
            <li className="hover:text-[#CBAACB]"><a href="/tools/feature-roadmap">Feature Roadmap</a></li>
          )}
        </ul>
      </div>
      
      {/* Third Party Logos Section */}
      <div className="mt-8 pt-6 border-t border-[#C7DBFF]/20">
        <div className="flex flex-wrap items-center justify-center gap-6">
          {/* Strava Logo */}
          <img 
            src="/api_logo_pwrdBy_strava_horiz_orange.svg" 
            alt="Powered by Strava" 
            className="h-6 sm:h-8 w-auto max-w-[120px] sm:max-w-[180px] opacity-80"
          />
          
          {/* Future: Garmin Logo */}
          {/* <img 
            src="/garmin-logo.svg" 
            alt="Compatible with Garmin" 
            className="h-6 sm:h-8 w-auto max-w-[120px] sm:max-w-[150px] opacity-80"
          /> */}
          
          {/* Future: Other Third Party Logos */}
          {/* Add more logos here as needed */}
        </div>
      </div>
    </footer>
  );
}

export default Footer;