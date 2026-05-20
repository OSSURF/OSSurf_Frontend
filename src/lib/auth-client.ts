import { createAuthClient } from "better-auth/react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://sourcesuf-backend.onrender.com";

export const authClient = createAuthClient({
  baseURL: API_URL,
  fetchOptions: { credentials: "include" },
});

