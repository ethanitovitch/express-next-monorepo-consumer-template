import { createAuthClient } from "better-auth/react";
import { stripeClient } from "@better-auth/stripe/client"
import { adminClient } from "better-auth/client/plugins"
import { env } from "./config";

export const authClient = createAuthClient({
  plugins: [
    stripeClient({
      subscription: true,
    }),
    adminClient()
  ],
  baseURL: env.API_URL.toString() + "/auth",
  fetchOptions: {
    credentials: "include",
  }
});

export const { 
  signIn, 
  signUp, 
  signOut, 
  useSession,
  sendVerificationEmail,
  subscription,
  admin,
} = authClient;
