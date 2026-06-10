import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  dbCreateOAuthUser,
  dbCreateUser,
  dbGetUserByEmail,
  dbGetUserByReferralCode,
} from "@/lib/db/local-db";

const credsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  mode: z.enum(["signin", "signup"]).optional(),
  referralCode: z.string().optional(),
});

const googleConfigured =
  Boolean(process.env.GOOGLE_CLIENT_ID?.trim()) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET?.trim());

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    ...(googleConfigured
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Email + Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        mode: { label: "Mode", type: "text" },
        referralCode: { label: "Referral Code", type: "text" },
      },
      async authorize(raw) {
        const parsed = credsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password, mode, referralCode } = parsed.data;
        const existing = await dbGetUserByEmail(email);

        if (mode === "signup") {
          if (existing) return null;
          let referredByUserId: string | null = null;
          if (referralCode?.trim()) {
            const referrer = await dbGetUserByReferralCode(referralCode);
            if (referrer) referredByUserId = referrer.id;
          }
          const passwordHash = await bcrypt.hash(password, 10);
          const user = await dbCreateUser({ email, passwordHash, referredByUserId });
          return { id: user.id, email: user.email };
        }

        if (!existing) return null;
        const ok = await bcrypt.compare(password, existing.passwordHash);
        if (!ok) return null;
        return { id: existing.id, email: existing.email };
      },
    }),
    // Phone OTP scaffold (optional later):
    // - add endpoints to send/verify OTP and a custom provider
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existing = await dbGetUserByEmail(user.email);
        if (!existing) {
          await dbCreateOAuthUser({
            email: user.email,
            displayName: user.name ?? null,
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      const email = user?.email ?? (typeof token.email === "string" ? token.email : null);
      if (email) {
        const dbUser = await dbGetUserByEmail(email);
        if (dbUser) token.sub = dbUser.id;
      } else if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
};

