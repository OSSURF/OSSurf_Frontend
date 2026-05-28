import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Empty baseURL = relative URLs = goes through Vite proxy = same origin for cookies
  // DO NOT set this to the backend URL directly (e.g. localhost:3000) — it breaks cookie auth
  baseURL: "",
  fetchOptions: {
    credentials: "include",
    // Store token after successful auth
    onSuccess: (ctx) => {
      const token = ctx.response.headers.get("set-auth-token");
      if (token) {
        localStorage.setItem("bearer_token", token);
      }
    },
    // Send token on every request
    auth: {
      type: "Bearer",
      token: () => localStorage.getItem("bearer_token") || "",
    },
  },
});
