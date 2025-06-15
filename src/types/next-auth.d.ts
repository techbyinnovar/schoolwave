import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      referralCode?: string;
    } & DefaultSession["user"];
  }
  interface User extends DefaultUser {
    id: string;
    role: Role;
    referralCode?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    referralCode?: string;
  }
}
