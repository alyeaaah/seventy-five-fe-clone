import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

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

    build: {
      outDir: "dist",
      // Increase memory limit for large builds
      target: 'es2015',
      commonjsOptions: {
        include: ["tailwind.config.js", "node_modules/**"],
      },
      // Try to exclude problematic packages from bundling
      rollupOptions: {
        external: ['@faker-js/faker'],
        output: {
          manualChunks: {
            // Vendor chunks untuk library besar
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'redux-vendor': ['@reduxjs/toolkit', 'react-redux', 'jotai'],
            'ui-vendor': ['antd', '@headlessui/react'],
            'chart-vendor': ['chart.js'],
            'editor-vendor': ['@ckeditor/ckeditor5-build-classic', 'react-quill'],
            'calendar-vendor': ['@fullcalendar/react', '@fullcalendar/core', '@fullcalendar/daygrid', '@fullcalendar/timegrid', '@fullcalendar/interaction', '@fullcalendar/list'],
            'map-vendor': ['leaflet', 'react-leaflet', 'leaflet.markercluster'],
            'form-vendor': ['react-hook-form', '@hookform/resolvers', 'yup', 'zod'],
            'query-vendor': ['@tanstack/react-query', '@zodios/core', '@zodios/react'],
          },
        },
      },
      // Minification - use terser to avoid esbuild memory issues
      minify: 'terser',
      // Source maps untuk production (opsional, bisa di-disable untuk size lebih kecil)
      sourcemap: false,
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
