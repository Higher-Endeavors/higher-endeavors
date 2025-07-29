import { NextRequest, NextResponse } from 'next/server';
import { getRatingStatistics, getDailyMetrics, getMetricPercentiles } from '../../lib/web-vitals/web-vitals-db';
import { TimeframeQuerySchema, MetricNameQuerySchema } from '../../lib/types/web-vitals';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30 days';
    const metric = searchParams.get('metric');

    // Validate query parameters
    const timeframeValidation = TimeframeQuerySchema.safeParse({ 
      timeframe: timeframe as string 
    });
    
    if (!timeframeValidation.success) {
      return NextResponse.json({
        error: 'Invalid timeframe',
        details: timeframeValidation.error.issues
      }, { status: 400 });
    }

    let metricName;
    if (metric) {
      const metricValidation = MetricNameQuerySchema.safeParse({ 
        metricName: metric as string 
      });
      
      if (!metricValidation.success) {
        return NextResponse.json({
          error: 'Invalid metric name',
          details: metricValidation.error.issues
        }, { status: 400 });
      }
      metricName = metricValidation.data.metricName;
    }

    // Fetch different types of statistics
    const [ratingStats, dailyMetrics, percentiles] = await Promise.all([
      getRatingStatistics(timeframeValidation.data.timeframe),
      getDailyMetrics(30),
      metricName ? getMetricPercentiles(metricName, timeframeValidation.data.timeframe) : null
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ratingStats,
        dailyMetrics,
        percentiles
      },
      timeframe: timeframeValidation.data.timeframe,
      metric: metricName
    });

  } catch (error) {
    console.error('Error fetching web vitals stats:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
