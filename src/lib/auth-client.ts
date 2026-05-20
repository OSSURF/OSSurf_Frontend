import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Use the current origin so Vercel's /api rewrite proxy and Vite's dev proxy both work
  baseURL: window.location.origin,
  fetchOptions: {
    credentials: "include",
  },
});
