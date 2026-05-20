import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "/api", // Proxies through Vercel
  fetchOptions: { credentials: "include" },
});