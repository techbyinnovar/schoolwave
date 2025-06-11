import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma/client";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";


const authConfig = {
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" as const },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials || typeof credentials.email !== "string" || typeof credentials.password !== "string") {
          return null;
        }
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: import("next-auth/jwt").JWT; user?: import("next-auth").User }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: import("next-auth").Session; token: import("next-auth/jwt").JWT }) {
      if (session.user && token.role) {
        session.user.role = token.role;
      }
      if (session.user && typeof token.id === "string") {
        session.user.id = token.id;
      }
      return session;
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) session.user.id = token.id as string;
        if (token.role) session.user.role = token.role as string;
      }
      return session;
    },
  },
  routes: {
    signIn: "/login",
  },
};

export default authConfig;
