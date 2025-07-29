export const webVitalsConfig = {
    maxBatchSize: parseInt(process.env.NEXT_PUBLIC_WEB_VITALS_BATCH_SIZE || '1'),
    flushInterval: parseInt(process.env.NEXT_PUBLIC_WEB_VITALS_FLUSH_INTERVAL || '30000'),
    endpoint: process.env.NEXT_PUBLIC_WEB_VITALS_ENDPOINT || '/api/web-vitals',
    enableValidation: process.env.NODE_ENV === 'development',
    enabled: process.env.NEXT_PUBLIC_ENABLE_WEB_VITALS !== 'false',
    samplingRate: parseFloat(process.env.NEXT_PUBLIC_WEB_VITALS_SAMPLING_RATE || '1.0'),
  };
  