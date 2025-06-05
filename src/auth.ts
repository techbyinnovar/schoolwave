import NextAuth from "next-auth";
import { authConfig } from "@/utils/authOptions";

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
