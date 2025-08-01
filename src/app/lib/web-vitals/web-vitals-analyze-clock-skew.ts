import { serverLogger } from '@/app/lib/logging/logger.server';
import type { WebVitalsBatch } from '@/app/lib/types/web-vitals';

export interface ClockSkewAnalysis {
  averageSkew: number;
  maxSkew: number;
  samplesAnalyzed: number;
  hasSignificantSkew: boolean;
  skewThreshold: number;
}

export function analyzeClockSkew(batches: Array<{ timestamp: number, receivedAt: number }>): ClockSkewAnalysis {
  if (batches.length === 0) {
    return {
      averageSkew: 0,
      maxSkew: 0,
      samplesAnalyzed: 0,
      hasSignificantSkew: false,
      skewThreshold: 30000
    };
  }

  const skewAnalysis = batches.map(batch => ({
    skew: batch.timestamp - batch.receivedAt,
    absoluteSkew: Math.abs(batch.timestamp - batch.receivedAt)
  }));
  
  const avgSkew = skewAnalysis.reduce((sum, item) => sum + item.skew, 0) / skewAnalysis.length;
  const maxSkew = Math.max(...skewAnalysis.map(item => item.absoluteSkew));
  const skewThreshold = 30000; // 30 seconds
  const hasSignificantSkew = Math.abs(avgSkew) > skewThreshold;
  
  const analysis: ClockSkewAnalysis = {
    averageSkew: avgSkew,
    maxSkew,
    samplesAnalyzed: batches.length,
    hasSignificantSkew,
    skewThreshold
  };

  // Log analysis results
  serverLogger.info('Clock skew analysis completed', {
    averageSkewSeconds: `${(avgSkew / 1000).toFixed(2)}s`,
    maxSkewSeconds: `${(maxSkew / 1000).toFixed(2)}s`,
    samplesAnalyzed: batches.length,
    hasSignificantSkew
  });
  
  // Warn if seeing systematic clock issues
  if (hasSignificantSkew) {
    serverLogger.warn('Significant clock skew detected across clients', {
      averageSkewSeconds: `${(avgSkew / 1000).toFixed(2)}s`,
      maxSkewSeconds: `${(maxSkew / 1000).toFixed(2)}s`,
      thresholdSeconds: `${(skewThreshold / 1000).toFixed(2)}s`,
      samplesAnalyzed: batches.length
    });
  }

  return analysis;
}

export function analyzeWebVitalsBatchClockSkew(batches: WebVitalsBatch[]): ClockSkewAnalysis {
  const batchData = batches.map(batch => ({
    timestamp: batch.timestamp,
    receivedAt: Date.now() // This would ideally come from when the batch was received
  }));

  return analyzeClockSkew(batchData);
}
  