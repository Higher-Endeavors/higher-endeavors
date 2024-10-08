//import NextAuth from "next-auth";
import NextAuth, { type DefaultSession } from "next-auth"
import type { Provider } from "next-auth/providers";
import Cognito from "next-auth/providers/cognito";
import PostgresAdapter from "@auth/pg-adapter";
import { pool, SingleQuery } from "@/app/lib/dbAdapter";

const providers: Provider[] = [Cognito];

const adapter = PostgresAdapter(pool);

export const providerMap = providers.map((provider) => {
  if (typeof provider === "function") {
    const providerData = provider();
    return { id: providerData.id, name: providerData.name };
  } else {
    return { id: provider.id, name: provider.name };
  }
});

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's postal address. */
      first_name: string
      last_name: string
      role: string
      /**
       * By default, TypeScript merges new interface properties and overwrites existing ones.
       * In this case, the default session user properties will be overwritten,
       * with the new ones defined above. To keep the default session user properties,
       * you need to add them back into the newly declared interface.
       */
    } & DefaultSession["user"]
  }
}


export const { handlers, signIn, signOut, auth } = NextAuth({
  theme: { logo: "https://authjs.dev/img/logo-sm.png" },
  providers,
  events: {
    signIn: async (message) => {
      const { account, profile, user, isNewUser } = message;
      const firstName = `${profile?.given_name}`;
      const lastName = `${profile?.family_name}`;
      const name = `${profile?.given_name} ${profile?.family_name}`;
      if (isNewUser) {
      const result = await pool.query(`UPDATE users SET first_name = '${firstName}', last_name = '${lastName}', name = '${name}' WHERE id = ${user.id};`);
      }
    },
  },
  callbacks: {
    session({ session, user }) {
      return session
    }
  },
  adapter,
  session: {
    strategy: "database",
  },
  debug: false,
});
