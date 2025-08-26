import { NextResponse } from 'next/server';
import { SingleQuery } from '@/app/lib/dbAdapter';

export async function GET() {
  try {
    const result = await SingleQuery(
      'SELECT tier_continuum_id, tier_continuum_name FROM highend_tier_continuum ORDER BY tier_continuum_id'
    );
    
    return NextResponse.json({ 
      tiers: result.rows,
      success: true 
    });
  } catch (error) {
    console.error('Error fetching tier continuum data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch tier continuum data',
        success: false 
      }, 
      { status: 500 }
    );
  }
}
