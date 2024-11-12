import { NextResponse } from 'next/server';
import { SingleQuery } from '@/app/lib/dbAdapter';

export async function GET(request: Request) {
  // const { searchParams } = new URL(request.url);

  let query = `SELECT * FROM struct_bal_ref_lifts_list;`;
  

  try {
    const result = await SingleQuery(query);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching reference lifts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

