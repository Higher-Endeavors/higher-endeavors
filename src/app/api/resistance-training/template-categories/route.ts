import { NextResponse } from 'next/server';
import { SingleQuery } from 'lib/dbAdapter';
import { auth } from 'auth';
import { serverLogger } from 'lib/logging/logger.server';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin using session role
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all template categories
    const result = await SingleQuery(
      `SELECT 
        resist_program_template_categories_id,
        category_name,
        description,
        created_at,
        updated_at
       FROM resist_program_template_categories 
       ORDER BY category_name`,
      []
    );

    return NextResponse.json({
      categories: result.rows
    });

  } catch (error) {
    serverLogger.error('Error fetching template categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template categories' },
      { status: 500 }
    );
  }
} 