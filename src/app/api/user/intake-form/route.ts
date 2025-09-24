import { NextResponse } from 'next/server';
import { auth } from 'auth';
import { SingleQuery } from 'lib/dbAdapter';
import { serverLogger } from 'lib/logging/logger.server';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Log the data being sent
    serverLogger.info('Intake form submission data:', { body: data });

    // Get user ID
    const userResult = await SingleQuery(
      'SELECT id FROM users WHERE email = $1',
      [session.user.email]
    );
    
    const userId = userResult.rows[0]?.id;
    
    if (!userId) {
      await serverLogger.error('User ID not found for email', null, { email: session.user.email });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Ensure data is a valid object before storing
    const sanitizedData = {
      ...data,
      // Convert any undefined values to null for PostgreSQL
      currentWeight: data.currentWeight || null,
      idealWeight: data.idealWeight || null,
      weightOneYearAgo: data.weightOneYearAgo || null,
      numberOfChildren: data.numberOfChildren || null,
      motivationLevel: data.motivationLevel || null
    };

    // Insert or update the intake form data
    const query = `
      INSERT INTO user_intake (user_id, intake_responses)
      VALUES ($1, $2)
      ON CONFLICT (user_id)
      DO UPDATE SET
        intake_responses = $2,
        submitted_date = now()
      RETURNING id;
    `;

    try {
      const result = await SingleQuery(query, [userId, sanitizedData]);
      return NextResponse.json({ success: true, id: result.rows[0].id });
    } catch (dbError) {
      await serverLogger.error('Database error saving intake form', dbError, { userId });
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      );
    }
  } catch (error) {
    await serverLogger.error('Error in intake form submission', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID
    const userResult = await SingleQuery(
      'SELECT id FROM users WHERE email = $1',
      [session.user.email]
    );
    
    const userId = userResult.rows[0]?.id;
    
    if (!userId) {
      await serverLogger.error('User ID not found for email', null, { email: session.user.email });
      return NextResponse.json({});
    }

    // Get only the intake form data
    const query = `
      SELECT intake_responses
      FROM user_intake
      WHERE user_id = $1;
    `;

    const result = await SingleQuery(query, [userId]);
    
    // If no data exists yet, return an empty object (this is not an error condition)
    return NextResponse.json(result.rows[0]?.intake_responses || {});
  } catch (error) {
    await serverLogger.error('Error retrieving intake form', error);
    return NextResponse.json(
      { error: 'Failed to retrieve intake form' },
      { status: 500 }
    );
  }
} 