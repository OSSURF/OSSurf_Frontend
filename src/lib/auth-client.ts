import { createAuthClient } from "better-auth/react";
import { API_BASE_URL } from "./api";

// VITE_API_URL drives all API calls — set it in .env
// Dev:  VITE_API_URL=http://localhost:3000
// Prod: VITE_API_URL=https://sourcesuf-backend.onrender.com  (set in Vercel dashboard)
export const authClient = createAuthClient({
  baseURL: API_BASE_URL || window.location.origin,
});

