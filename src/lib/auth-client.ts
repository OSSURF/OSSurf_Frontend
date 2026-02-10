import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000/api/auth", // Include /api/auth to match backend route
  fetchOptions: {
    credentials: "include", // Important: Include cookies in cross-origin requests
  },
});
