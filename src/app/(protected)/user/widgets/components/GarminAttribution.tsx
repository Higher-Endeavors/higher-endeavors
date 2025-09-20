'use client';

import { useState, useEffect } from 'react';
import { getGarminDeviceInfo } from '../hooks/useGarminActivity';

interface GarminAttributionProps {
  className?: string;
}

export default function GarminAttribution({ className = '' }: GarminAttributionProps) {
  const [attribution, setAttribution] = useState<string>('');

  // Load attribution on component mount
  useEffect(() => {
    const loadAttribution = async () => {
      try {
        const deviceInfo = await getGarminDeviceInfo();
        setAttribution(deviceInfo.attribution);
      } catch (error) {
        // Handle error silently or set fallback
        setAttribution('');
      }
    };

    loadAttribution();
  }, []);

  if (!attribution) {
    return null;
  }

  return (
    <div className={`text-xs text-slate-500 ${className}`}>
      {attribution}
    </div>
  );
}
