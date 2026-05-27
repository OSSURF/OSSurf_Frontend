import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.PROD ? "" : (import.meta.env.VITE_API_URL || ""),
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
