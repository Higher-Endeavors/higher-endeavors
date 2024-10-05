import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Cognito from "next-auth/providers/cognito"
import PostgresAdapter from "@auth/pg-adapter";
import { pool } from "@/app/lib/dbAdapter";

const providers: Provider[] = [
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
