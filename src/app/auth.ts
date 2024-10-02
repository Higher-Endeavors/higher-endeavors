import NextAuth from "next-auth"
import Nodemailer from "next-auth/providers/nodemailer"
import PostgresAdapter from "@auth/pg-adapter"
import { pool } from "@/app/lib/dbAdapter"

const host = process.env.NEXT_PUBLIC_EMAIL_HOST
const port = process.env.NEXT_PUBLIC_EMAIL_PORT
const secure = (process.env.NEXT_PUBLIC_EMAIL_SECURE == "true") ? true : false
const authMethod = process.env.NEXT_PUBLIC_EMAIL_AUTHMETHOD
const username = process.env.NEXT_PUBLIC_EMAIL_USERNAME
const password = process.env.NEXT_PUBLIC_EMAIL_PASSWORD
const fromEmail = process.env.NEXT_PUBLIC_FROM_EMAIL

export const { handlers, signIn, signOut, auth } = NextAuth({
  theme: { logo: "https://authjs.dev/img/logo-sm.png" },
  providers: [
    Nodemailer({
      server: {
        host: host,
        port: port,
        secure: secure,
        authMethod: authMethod,
    
    auth: {
      user: username,
      pass: password,
    },
   },
   from: fromEmail,
  }),

  ],
  adapter: PostgresAdapter(pool),
  session: {
    strategy: "database"
  },
  debug: true,
})
