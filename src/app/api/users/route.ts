import { type NextRequest, NextResponse } from "next/server";
import { getClient, SingleQuery } from "lib/dbAdapter";
import { auth } from "auth";
import { serverLogger } from 'lib/logging/logger.server';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const userRole = await SingleQuery(
      'SELECT role FROM users WHERE id = $1',
      [session.user.id]
    );

    if (!userRole.rows[0] || userRole.rows[0].role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all users
    const result = await SingleQuery(
      'SELECT id, name, email, first_name, last_name FROM users ORDER BY COALESCE(first_name, name, email)',
      []
    );

    return NextResponse.json({
      users: result.rows
    });
  } catch (error) {
    await serverLogger.error('Error in users API route', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
} 