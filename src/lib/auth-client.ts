import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || "/api/auth", // Include /api/auth to match backend route
  fetchOptions: {
    credentials: "include", // Important: Include cookies in cross-origin requests
  },
});
