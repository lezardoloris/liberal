import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/** Generate a short random ID like "citoyen_a3f8b2" */
function generateAnonymousId(): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `citoyen_${rand}`;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 }, // 30 days
  providers: [
    // ── Google OAuth ─────────────────────────────────────────────────
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Ask for profile + email
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    // ── Email / Password ─────────────────────────────────────────────
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await db.query.users.findFirst({
          where: eq(users.email, parsed.data.email),
        });

        if (!user) return null;
        if (user.deletedAt) return null;

        const passwordMatch = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );
        if (!passwordMatch) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.displayName ?? user.anonymousId,
          role: user.role,
          anonymousId: user.anonymousId,
          displayName: user.displayName,
        };
      },
    }),
  ],

  callbacks: {
    // ── Sign-in: auto-create user row for Google OAuth if needed ──────
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        const existing = await db.query.users.findFirst({
          where: eq(users.email, user.email),
        });

        if (!existing) {
          // First Google login → create user row
          const anonymousId = generateAnonymousId();
          const displayName = user.name ?? null;

          await db.insert(users).values({
            email: user.email,
            passwordHash: '', // no password for OAuth users
            anonymousId,
            displayName,
            role: 'user',
          });
        } else if (existing.deletedAt) {
          // Deleted account
          return false;
        }
      }
      return true;
    },

    // ── JWT: attach app-level fields ──────────────────────────────────
    async jwt({ token, user, account, trigger, session }) {
      // On first sign-in (any provider), fetch full user row
      if (user || account) {
        const email = token.email ?? user?.email;
        if (email) {
          const dbUser = await db.query.users.findFirst({
            where: eq(users.email, email),
          });
          if (dbUser) {
            token.sub = dbUser.id;
            token.role = dbUser.role;
            token.anonymousId = dbUser.anonymousId;
            token.displayName = dbUser.displayName;
          }
        }
      }

      // Handle session update (e.g. display name change)
      if (trigger === 'update' && session) {
        token.name = session.name;
        token.displayName = session.displayName;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.sub!;
      session.user.role = token.role as string;
      session.user.anonymousId = token.anonymousId as string;
      session.user.displayName = token.displayName as string | null;
      return session;
    },
  },

  pages: {
    signIn: '/login',
    newUser: '/register',
    error: '/login',
  },
});
