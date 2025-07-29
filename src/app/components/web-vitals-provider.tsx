'use client';

import { useWebVitalsBatcher } from '@/app/lib/hooks/use-web-vitals';

interface WebVitalsProviderProps {
  config?: {
    maxBatchSize?: number;
    flushInterval?: number;
    endpoint?: string;
    enableValidation?: boolean;
  };
}

export function WebVitalsProvider({ config }: WebVitalsProviderProps = {}) {
  const { flushQueue, getQueueSize, getSessionId } = useWebVitalsBatcher({
    maxBatchSize: 10,
    flushInterval: 30000, // 30 seconds
    endpoint: '/api/web-vitals',
    enableValidation: true,
    ...config
  });

  // Optional: Add development tools
  if (process.env.NODE_ENV === 'development') {
    // You can add debugging info here
    console.log('Web Vitals session:', getSessionId());
  }

  // This component doesn't render anything visible
  return null;
}