import { createAuthClient } from "better-auth/react";

const apiURL = import.meta.env.VITE_API_URL || "https://sourcesuf-backend.onrender.com";

export const authClient = createAuthClient({
  baseURL: apiURL,
  fetchOptions: {
    credentials: "include",
  },
});
