import { NextRequest, NextResponse } from "next/server";
import { query } from '../../lib/db';

export async function POST(request: NextRequest) {
  const { firstname, lastname, email, message } = await request.json();

  try {
    const res = await query(
      "INSERT INTO email_contacts(first_name, last_name, email_address, contact_message) VALUES($1, $2, $3, $4)",
      [firstname, lastname, email, message]
    );
    return NextResponse.json({ message: "Success: message stored" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "COULD NOT STORE MESSAGE" }, { status: 500 });
  }
}