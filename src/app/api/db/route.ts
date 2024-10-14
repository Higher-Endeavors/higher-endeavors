import { type NextRequest, NextResponse } from "next/server";
const Client = require("pg").Client;
const client = new Client();

//
// This need sto be refactored into a general db function


export async function POST(request: NextRequest) {
  const username = process.env.NEXT_PUBLIC_EMAIL_USERNAME;
  const password = process.env.NEXT_PUBLIC_EMAIL_PASSWORD;
  const myEmail = process.env.NEXT_PUBLIC_PERSONAL_EMAIL;
  await client.connect();

  const { firstname, lastname, email, message } = await request.json();

  const query = {
    text: "INSERT INTO email_contacts(first_name, last_name, email_address, contact_message) VALUES($1, $2, $3, $4)",
    values: [firstname, lastname, email, message],
  };
  try {
    const res = await client.query(query);
    await client.end();
    return NextResponse.json({ message: "Success: message stored" });
  } catch (error) {
    console.log(error);
    NextResponse.json({ error: "COULD NOT STORE MESSAGE" }, { status: 500 });
  }
}
