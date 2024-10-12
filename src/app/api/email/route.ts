import { type NextRequest, NextResponse } from 'next/server';
const nodemailer = require('nodemailer');

export async function POST(request: NextRequest) {
  const host = process.env.NEXT_PUBLIC_EMAIL_HOST
  const port = process.env.NEXT_PUBLIC_EMAIL_PORT
  const secure = (process.env.NEXT_PUBLIC_EMAIL_SECURE == "true") ? true : false
  const authMethod = process.env.NEXT_PUBLIC_EMAIL_AUTHMETHOD
  const username = process.env.NEXT_PUBLIC_EMAIL_USERNAME
  const password = process.env.NEXT_PUBLIC_EMAIL_PASSWORD
  const fromEmail = process.env.NEXT_PUBLIC_FROM_EMAIL
  const toEmail = process.env.NEXT_PUBLIC_TO_EMAIL

  const { replyTo, subject, body } = await request.json();

   const transporter = nodemailer.createTransport({
        host: host,
        port: port,
        secure: secure,
        authMethod: authMethod,
    
    auth: {
      user: username,
      pass: password,
    },
  });

try {

    const mail = await transporter.sendMail({
        from: fromEmail,
        to: toEmail,
        replyTo: replyTo,
        subject: subject,
        html: body,
    })

    return NextResponse.json({ message: "Success: email was sent" })

} catch (error) {
    console.log(error)
    NextResponse.json({ error: 'COULD NOT SEND MESSAGE' }, { status: 500 })

}

}
