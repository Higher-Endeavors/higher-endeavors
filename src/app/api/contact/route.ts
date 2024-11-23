import { NextResponse } from "next/server";
import { VerifaliaRestClient } from "verifalia";
import { adminNoticeEmail } from "@/app/lib/admin-notice-email";
const Client = require("pg").Client;

const username = process.env.VERIFALIA_USERNAME;
const password = process.env.VERIFALIA_PASSWORD;

const verifalia = new VerifaliaRestClient({
  username: username!,
  password: password!,
});

export async function POST(request: Request) {
  const { firstname, lastname, email, message, inquiryType, turnstileToken } =
    await request.json();

  //
  // Verify Turnstile token
  //
  try {
    const turnstileResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: turnstileToken,
        }),
      }
    );

    const turnstileResult = await turnstileResponse.json();
    if (!turnstileResult.success) {
      throw new Error("Invalid Turnstile token");
    }
  } catch (error) {
        // Send email notification
        await adminNoticeEmail(
          "noreply@higherendeavors.com",
          `Suspicious contact form submission`,
          `
          <p>Turnstile verification failed for email: ${email}</p>
        `
        );
    
    return NextResponse.json(
      { error: `Turnstile verification failed. Error code: ${error}`, status: 400 },
      { status: 400 }
    );
  }

  //
  // Verify email with Verifalia
  //
  try {
    const validation = await verifalia.emailValidations.submit(email);
    if (validation?.entries[0]?.classification !== "Deliverable") {
        await adminNoticeEmail(
          "noreply@higherendeavors.com",
          `Verifalia Undeliverable Email`,
          `
          <p>A contact form submission was made with an undeliverable email: ${email}</p>
        `
        );
    
        return NextResponse.json(
          { error: "Error verifying email", status: 406 },
          { status: 406 }
        );
    
    }
  } catch (error) {
    // Send email notification
    await adminNoticeEmail(
      "noreply@higherendeavors.com",
      `Verifalia error`,
      `
      <p>System received an error:</p>
      <p>${error}</p>
      <p>from Verifalia when trying to verify email: ${email}</p>
    `
    );

    return NextResponse.json(
      { error: "Error verifying email", status: 500 },
      { status: 500 }
    );
  }

  //
  // Send email notification
  //
  await adminNoticeEmail(
    email,
    `Contact from ${email}`,
    `
      <p>Name: ${firstname} ${lastname}</p>
      <p>Email: ${email}</p>
      <p>Inquiry Type: ${inquiryType}</p>
      <p>Message: ${message}</p>
    `
  );

  //
  // Store contact in database
  //
  try {
    const client = new Client();
    await client.connect();

    const query = {
      text: "INSERT INTO email_contacts(first_name, last_name, email_address, contact_message, inquiry_type) VALUES($1, $2, $3, $4, $5)",
      values: [firstname, lastname, email, message, inquiryType],
    };

    await client.query(query);
    await client.end();
  } catch (error) {

    //
    // Send email notification
    //
    await adminNoticeEmail(
      "noreply@higherendeavors.com",
      `Postgresql error: ${error}`,
      `
      <p>System received an error code: ${error}</p>
      <p>when trying to store contact in database</p>
    `
    );

    return NextResponse.json(
      { error: `Error storing contact in database. Error code: ${error}`, status: 500 },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Contact form submitted successfully" },
    { status: 200 }
  );
}
