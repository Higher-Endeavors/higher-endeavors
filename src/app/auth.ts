import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Nodemailer from "next-auth/providers/nodemailer";
import Cognito from "next-auth/providers/cognito"
import PostgresAdapter from "@auth/pg-adapter";
import { pool } from "@/app/lib/dbAdapter";

const host = process.env.NEXT_PUBLIC_EMAIL_HOST;
const port = process.env.NEXT_PUBLIC_EMAIL_PORT;
const secure = process.env.NEXT_PUBLIC_EMAIL_SECURE == "true" ? true : false;
const authMethod = process.env.NEXT_PUBLIC_EMAIL_AUTHMETHOD;
const username = process.env.NEXT_PUBLIC_EMAIL_USERNAME;
const password = process.env.NEXT_PUBLIC_EMAIL_PASSWORD;
const fromEmail = process.env.NEXT_PUBLIC_FROM_EMAIL;

const providers: Provider[] = [
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
  Cognito,
];

export const providerMap = providers.map((provider) => {
  if (typeof provider === "function") {
    const providerData = provider();
    return { id: providerData.id, name: providerData.name };
  } else {
    return { id: provider.id, name: provider.name };
  }
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  theme: { logo: "https://authjs.dev/img/logo-sm.png" },
  providers,
  /*   pages: {
    signIn: "/user/signin",
    error: "/user/error",

  }, */
  adapter: PostgresAdapter(pool),
  session: {
    strategy: "database",
  },
  debug: true,
});
