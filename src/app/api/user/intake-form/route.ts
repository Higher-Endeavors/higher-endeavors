import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { dbAdapter } from '@/app/lib/dbAdapter';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const userId = await dbAdapter.getUserIdByEmail(session.user.email);

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

    const result = await dbAdapter.query(query, [userId, data]);
    
    return NextResponse.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error('Error saving intake form:', error);
    return NextResponse.json(
      { error: 'Failed to save intake form' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await dbAdapter.getUserIdByEmail(session.user.email);

    // Get only the intake form data
    const query = `
      SELECT intake_responses
      FROM user_intake
      WHERE user_id = $1;
    `;

    const result = await dbAdapter.query(query, [userId]);
    
    // If no data exists yet, return an empty object (this is not an error condition)
    return NextResponse.json(result.rows[0]?.intake_responses || {});
  } catch (error) {
    // Only log the error but still return an empty object
    console.error('Error retrieving intake form:', error);
    return NextResponse.json({});
  }
} 