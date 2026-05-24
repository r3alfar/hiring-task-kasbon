import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins/username";
import { organization } from "better-auth/plugins/organization";
import { db } from "@/db";
import * as schema from "@/db/schema/auth";

export const auth = betterAuth({
  appName: "Nexus",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      organization: schema.organization,
      member: schema.member,
      invitation: schema.invitation,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  plugins: [
    username(),
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 5,
      membershipLimit: 100,
    }),
  ],
  user: {
    deleteUser: { enabled: true },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,     // refresh if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes client cache
    },
  },
});

export type Auth = typeof auth;
