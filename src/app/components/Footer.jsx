"use client";

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import garminLogo from '@/public/Garmin_Connect_app_1024x1024-02.png';

const Footer = () => {
  const { data: session } = useSession();

  return (
    <footer className="footer bg-root-chakra py-12 px-12 sm:text-m lg:text-xl text-[#C7DBFF]">
      <div className="flex flex-wrap justify-between items-start">
        <div className="flex flex-wrap gap-x-24">
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
        
        {/* Data Sources Section */}
        <div className="flex flex-col items-end space-y-2">
          <p className="text-sm text-[#C7DBFF] opacity-75">Biometric data sourced from</p>
          <div className="flex items-center space-x-3">
            <Image 
              src={garminLogo} 
              alt="Garmin Connect" 
              width={24}
              height={24}
              className="rounded"
            />
            <span className="text-sm text-[#C7DBFF]">Garmin Connect</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;