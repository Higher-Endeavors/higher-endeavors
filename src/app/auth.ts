//import NextAuth from "next-auth";
import NextAuth, { type DefaultSession } from "next-auth"
import type { Provider } from "next-auth/providers";
import Cognito from "next-auth/providers/cognito";
import Strava from "next-auth/providers/strava";
import PostgresAdapter from "@auth/pg-adapter";
import { pool, SingleQuery } from "@/app/lib/dbAdapter";

const providers: Provider[] = [
  Cognito({
    clientId: process.env.COGNITO_CLIENT_ID!,
    clientSecret: process.env.COGNITO_CLIENT_SECRET!,
    issuer: process.env.COGNITO_ISSUER!,
    // checks: ["state"],  })
    checks: ["nonce", "state", "pkce"],
  }),
  Strava({
    clientId: process.env.STRAVA_CLIENT_ID!,
    clientSecret: process.env.STRAVA_CLIENT_SECRET!,
    authorization: {
      params: {
        scope: "read,read_all,profile:read_all,activity:read_all,activity:write",
      },
    },
  }),
];

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
    strava?: {
      access_token: string
      refresh_token: string
      expires_at: number
      athlete_id: number
    }
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
    linkAccount: async (message) => {
      const { account, user } = message;
      
      // Handle Strava account linking
      if (account?.provider === "strava" && account.access_token) {
        try {
          // Store Strava connection in our custom table
          await pool.query(`
            INSERT INTO strava_connections (
              user_id, 
              strava_athlete_id, 
              access_token, 
              refresh_token, 
              token_expires_at, 
              scope
            ) VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (strava_athlete_id) 
            DO UPDATE SET 
              access_token = EXCLUDED.access_token,
              refresh_token = EXCLUDED.refresh_token,
              token_expires_at = EXCLUDED.token_expires_at,
              scope = EXCLUDED.scope,
              updated_at = CURRENT_TIMESTAMP
          `, [
            user.id,
            account.providerAccountId,
            account.access_token,
            account.refresh_token,
            new Date(account.expires_at! * 1000),
            account.scope || ""
          ]);
        } catch (error) {
          console.error("Error linking Strava account:", error);
        }
      }
    },
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // Initialize token if it doesn't exist
      if (!token) {
        token = {};
      }
      
      // Persist Strava tokens on first login
      if (account?.provider === "strava") {
        token.strava_access_token = account.access_token;
        token.strava_refresh_token = account.refresh_token;
        token.strava_expires_at = account.expires_at;
        token.strava_athlete_id = account.providerAccountId;
      }
      
      // Handle token refresh for Strava
      if (token.strava_refresh_token && token.strava_expires_at) {
        const now = Math.floor(Date.now() / 1000);
        if (now >= (token.strava_expires_at as number)) {
          try {
            const response = await fetch("https://www.strava.com/api/v3/oauth/token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                client_id: process.env.STRAVA_CLIENT_ID,
                client_secret: process.env.STRAVA_CLIENT_SECRET,
                grant_type: "refresh_token",
                refresh_token: token.strava_refresh_token,
              }),
            });
            
            const refreshedTokens = await response.json();
            if (response.ok) {
              token.strava_access_token = refreshedTokens.access_token;
              token.strava_refresh_token = refreshedTokens.refresh_token;
              token.strava_expires_at = refreshedTokens.expires_at;
              
              // Update database with new tokens
              if (token.sub) {
                await pool.query(`
                  UPDATE strava_connections 
                  SET access_token = $1, refresh_token = $2, token_expires_at = $3, updated_at = CURRENT_TIMESTAMP
                  WHERE user_id = $4
                `, [
                  refreshedTokens.access_token,
                  refreshedTokens.refresh_token,
                  new Date(refreshedTokens.expires_at * 1000),
                  token.sub
                ]);
              }
            }
          } catch (error) {
            console.error("Error refreshing Strava token:", error);
          }
        }
      }
      
      return token;
    },
    async session({ session, token, user }) {
      // Add Strava data to session if available
      if (token && token.strava_access_token) {
        session.strava = {
          access_token: token.strava_access_token as string,
          refresh_token: token.strava_refresh_token as string,
          expires_at: token.strava_expires_at as number,
          athlete_id: token.strava_athlete_id as number,
        };
      }
      
      return session;
    }
  },
  adapter,
  session: {
    strategy: "database",
  },
  debug: false,
});
