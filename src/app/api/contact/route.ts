import { NextResponse } from 'next/server';
import { VerifaliaRestClient } from 'verifalia';
const nodemailer = require('nodemailer');
const Client = require("pg").Client;

const username = process.env.VERIFALIA_USERNAME;
const password = process.env.VERIFALIA_PASSWORD;


const verifalia = new VerifaliaRestClient({
    username: username!,
    password: password!,
  });

export async function POST(request: Request) {
  const { firstname, lastname, email, message, turnstileToken } = await request.json();

  // Verify Turnstile token
  const turnstileResponse = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
      }),
    }
  );

  const turnstileResult = await turnstileResponse.json();
  if (!turnstileResult.success) {
    return NextResponse.json({ error: 'Invalid Turnstile token' }, { status: 400 });
  }

  // Verify email with Verifalia
  try {
    const validation = await verifalia.emailValidations.submit(email);
    if (validation?.entries[0]?.classification !== 'Deliverable') {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
  } catch (error) {
    console.error('Verifalia error:', error);
    return NextResponse.json({ error: 'Error verifying email' }, { status: 500 });
  }

  // Send email notification
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.NEXT_PUBLIC_EMAIL_HOST,
      port: parseInt(process.env.NEXT_PUBLIC_EMAIL_PORT || '587'),
      secure: process.env.NEXT_PUBLIC_EMAIL_SECURE === 'true',
      auth: {
        user: process.env.NEXT_PUBLIC_EMAIL_USERNAME,
        pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.NEXT_PUBLIC_FROM_EMAIL,
      to: process.env.NEXT_PUBLIC_TO_EMAIL,
      replyTo: email,
      subject: `Contact from ${email}`,
      html: `
        <p>Name: ${firstname} ${lastname}</p>
        <p>Email: ${email}</p>
        <p>Message: ${message}</p>
      `,
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ error: 'Error sending email notification' }, { status: 500 });
  }

  // Store contact in database
  try {
    const client = new Client();
    await client.connect();

    const query = {
      text: 'INSERT INTO email_contacts(first_name, last_name, email_address, contact_message) VALUES($1, $2, $3, $4)',
      values: [firstname, lastname, email, message],
    };

    await client.query(query);
    await client.end();
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Error storing contact in database' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Contact form submitted successfully' });
}
