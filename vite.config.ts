import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const clientUrl = (env.VITE_CLIENT_URL || "https://ossurf.vercel.app").replace(
    /\/+$/,
    ""
  );
  const ogImageUrl =
    env.VITE_OG_IMAGE_URL?.trim() || `${clientUrl}/assets/Hero.png`;

  return {
    plugins: [
      {
        name: "inject-html-meta-urls",
        transformIndexHtml(html) {
          return html
            .replaceAll("%META_CLIENT_URL%", clientUrl)
            .replaceAll("%META_OG_IMAGE_URL%", ogImageUrl);
        },
      },
      react(),
      tailwindcss(),
      VitePWA({
        registerType: "prompt",
        includeAssets: ["logo.svg", "assets/Hero.png"],
        manifest: {
          name: "SourceSurf",
          short_name: "SourceSurf",
          description:
            "Discover, track, and search the best open-source projects on GitHub in seconds.",
          theme_color: "#09090b",
          background_color: "#09090b",
          display: "standalone",
          icons: [
            {
              src: "logo.svg",
              sizes: "any",
              type: "image/svg+xml",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          navigateFallbackDenylist: [/^\/api/],
          mode: mode === "production" ? "production" : "development",
          runtimeCaching: [
            {
              urlPattern: ({ url }) => {
                return (
                  url.origin.includes("sourcesuf-backend.onrender.com") ||
                  url.pathname.startsWith("/api/")
                );
              },
              handler: "NetworkOnly",
              options: {
                cacheName: "api-cache",
              },
            },
            {
              urlPattern: ({ request }) => request.destination === "image",
              handler: "CacheFirst",
              options: {
                cacheName: "images",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 2592000,
                },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (
                id.includes("react") ||
                id.includes("react-dom") ||
                id.includes("react-router-dom") ||
                id.includes("react-router")
              ) {
                return "vendor";
              }
              if (id.includes("recharts")) {
                return "charts";
              }
              if (
                id.includes("@hugeicons") ||
                id.includes("@phosphor-icons") ||
                id.includes("lucide-react")
              ) {
                return "ui";
              }
            }
          },
        },
      },
    },
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
