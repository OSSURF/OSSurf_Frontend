import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.PROD
    ? "https://ossurf.vercel.app"
    : "http://localhost:3000",
  fetchOptions: {
    credentials: "include",
  },
});
