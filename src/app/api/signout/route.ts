import { type NextRequest, NextResponse } from 'next/server';
import { signOut } from "@/app/auth"

  
  export async function POST(request: NextRequest) {
    await signOut();
    return NextResponse.redirect(new URL("/", request.url))
    

  }