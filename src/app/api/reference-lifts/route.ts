import { NextResponse } from 'next/server';
import { SingleQuery } from 'lib/dbAdapter';
import { serverLogger } from 'lib/logging/logger.server';

export async function GET(request: Request) {
  // const { searchParams } = new URL(request.url);

  let query = `SELECT * FROM struct_bal_ref_lifts_list;`;
  

  try {
    const result = await SingleQuery(query);
    return NextResponse.json(result);
  } catch (error) {
    await serverLogger.error('Error fetching reference lifts', error);
    return Response.json({ error: 'Failed to fetch reference lifts' }, { status: 500 });
  }
}

