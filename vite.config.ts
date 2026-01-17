import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  // Ambil semua env (termasuk yang diawali VITE_)
  const env = loadEnv(mode, process.cwd(), "");

  // Ambil basename dari env, default '/'
  // Pastikan formatnya '/something/' (leading & trailing slash aman)
  let base = env.VITE_BASENAME || "/";
  if (!base.startsWith("/")) base = "/" + base;
  if (!base.endsWith("/")) base = base + "/";

  return {
    base, // <-- ini penting untuk build di subpath

    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },

    build: {
      outDir: "dist",
      commonjsOptions: {
        include: ["tailwind.config.js", "node_modules/**"],
      },
    },
    optimizeDeps: {
      include: ["tailwind-config"],
    },
    plugins: [
      react(),
      svgr({
        include: "**/*.svg",
        svgrOptions: { icon: true },
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: '75 Tennis Club',
          short_name: '75 Tennis',
          description: 'Tennis club management application',
          theme_color: '#10b981',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\./i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 // 24 hours
                }
              }
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                }
              }
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "tailwind-config": fileURLToPath(
          new URL("./tailwind.config.js", import.meta.url)
        ),
      },
    },
  };
});
