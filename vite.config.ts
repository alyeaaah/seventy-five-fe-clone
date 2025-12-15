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
