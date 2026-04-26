import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // baseURL must be the server ORIGIN — better-auth appends /api/auth automatically
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  fetchOptions: {
    credentials: "include", // Include cookies for cross-origin requests
  },
});
