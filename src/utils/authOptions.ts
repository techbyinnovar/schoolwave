// src/utils/authOptions.ts

import type { NextAuthConfig, User as NextAuthUser, Session as NextAuthSession } from "next-auth";
import type { JWT as NextAuthJWT } from "next-auth/jwt";

import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Role } from "@prisma/client"; // Import Role
import { prisma } from "../../prisma/client";
import bcrypt from "bcryptjs";

interface AuthorizedUser {
  id: string;
  email: string | null | undefined;
  name: string | null | undefined;
  role: Role; // Use Role type
}

export const authConfig: NextAuthConfig = {
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt" as const,
  },
  providers: [
    CredentialsProvider({
      // ... (rest of your CredentialsProvider config)
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<(Omit<NextAuthUser, 'id' | 'role'> & { id: string; role: Role; }) | null> { // Align with augmented User /* ... as before ... */
        console.log("AUTHORIZE: Attempting authorization for email:", credentials?.email);
        if (!credentials || typeof credentials.email !== 'string' || typeof credentials.password !== 'string') {
          console.warn("AUTHORIZE: Missing or invalid credentials format.");
          return null;
        }
        const { email, password: rawPassword } = credentials;
        try {
          console.log(`AUTHORIZE: Looking up user with email: ${email}`);
          const userFromDb = await prisma.user.findUnique({ where: { email: email } });
          if (!userFromDb) {
            console.warn(`AUTHORIZE: User not found for email: ${email}`);
            return null;
          }
          if (typeof userFromDb.password !== 'string') {
            console.error(`AUTHORIZE: User found for ${email}, but password is not a string. Data integrity issue!`);
            return null;
          }
          console.log(`AUTHORIZE: Comparing password for user: ${email}`);
          const isValidPassword = await bcrypt.compare(rawPassword, userFromDb.password);
          if (!isValidPassword) {
            console.warn(`AUTHORIZE: Invalid password for user: ${email}`);
            return null;
          }
          if (!userFromDb.role) {
            console.warn(`AUTHORIZE: User ${email} does not have a role. Authorization denied.`);
            return null;
          }
          console.log(`AUTHORIZE: Successfully authenticated user: ${email}.`);
          return {
            id: userFromDb.id,
            email: userFromDb.email,
            name: userFromDb.name,
            role: userFromDb.role, // userFromDb.role is now confirmed to be of type Role
          };
        } catch (error) {
          console.error("AUTHORIZE: CRITICAL UNHANDLED ERROR in authorize function:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: NextAuthJWT; user?: NextAuthUser | AuthorizedUser; /* ... */ }) { /* ... as before ... */
      // console.log("JWT_CALLBACK: Processing JWT. User object present on first call:", !!user);
      try {
        if (user) {
          const authorizedUser = user as AuthorizedUser;
          token.id = authorizedUser.id;
          token.role = authorizedUser.role;
          token.email = authorizedUser.email;
          token.name = authorizedUser.name;
          // console.log("JWT_CALLBACK: User object processed, token updated:", { id: token.id, role: token.role, email: token.email });
        }
        return token;
      } catch (error) {
        // console.error("JWT_CALLBACK: Error processing JWT:", error);
        return token;
      }
    },
    async session({ session, token }: { session: NextAuthSession; token: NextAuthJWT; }) {
      // console.log("SESSION_CALLBACK: Processing session. Token received:", { id: token.id, role: token.role, email: token.email });
      try {
        session.user = {
          ...session.user, // Spread existing session.user properties (like name, email, image from DefaultSession)
          id: token.id as string,
          role: token.role as Role,
        }; 
        if (token.email) session.user.email = token.email as string;
        if (token.name) session.user.name = token.name as string | null;

        // console.log("SESSION_CALLBACK: Session user object updated:", session.user);
        return session; // Allow TS to infer the augmented Session type
      } catch (error) {
        // console.error("SESSION_CALLBACK: Error processing session:", error);
        return session; // Return original session on error
      }
    },
  },
  pages: {
    signIn: "/login",
  },
};