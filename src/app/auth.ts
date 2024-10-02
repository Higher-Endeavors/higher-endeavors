import NextAuth from "next-auth"
import Cognito from "next-auth/providers/cognito"
import PostgresAdapter from "@auth/pg-adapter"
import { pool } from "@/app/lib/dbAdapter"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  theme: { logo: "https://authjs.dev/img/logo-sm.png" },
  providers: [Cognito],
  adapter: PostgresAdapter(pool),
  debug: true,
})
