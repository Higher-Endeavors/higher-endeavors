import { type NextRequest, NextResponse } from 'next/server';
import { signOut } from "@/app/auth"

  
  export async function POST(request: NextRequest) {
    console.log("Signout")
    await signOut();
    return NextResponse.json(
        { status: 200 }
      );
    

  }