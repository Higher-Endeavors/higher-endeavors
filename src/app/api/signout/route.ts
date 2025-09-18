import { type NextRequest, NextResponse } from 'next/server';
import { signOut } from "auth"

  
  export async function POST(request: NextRequest) {
    await signOut();
    return NextResponse.redirect(new URL("/", request.url))
    

  }