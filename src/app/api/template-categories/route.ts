import { NextResponse } from 'next/server';
import { SingleQuery } from 'lib/dbAdapter';

export async function GET() {
  try {
    const result = await SingleQuery(
      'SELECT resist_program_template_categories_id, category_name, description FROM resist_program_template_categories ORDER BY category_name'
    );
    
    return NextResponse.json({ 
      categories: result.rows,
      success: true 
    });
  } catch (error) {
    console.error('Error fetching template categories:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch template categories',
        success: false 
      }, 
      { status: 500 }
    );
  }
}
