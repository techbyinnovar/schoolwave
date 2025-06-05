import { DefaultSession, User as DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";
import { Role } from "@prisma/client";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   * Also, the user object passed to the JWT callback on sign-in.
   */
  interface User extends DefaultUser {
    id: string;
    role: Role;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    id: string;
    role: Role;
  }
}
