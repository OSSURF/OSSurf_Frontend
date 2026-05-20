import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "/api/auth", // Correct Better Auth base endpoint
  fetchOptions: { credentials: "include" },
});