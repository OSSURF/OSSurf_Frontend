import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: window.location.origin + "/api/auth", // Ensure absolute URL for Better Auth client
  fetchOptions: { credentials: "include" },
});

