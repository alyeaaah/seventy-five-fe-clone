import { fileURLToPath } from "node:url";
import path from "node:path";
import { createRequire } from "node:module";

// const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = () => ({
  // Equivalent to Vite's build.outDir
  distDir: "dist",

  // React strict mode (similar to Vite's React plugin)
  reactStrictMode: true,

  // Enable experimental features
  experimental: {
    // appDir: true, // If using App Router
    // Equivalent to Vite's optimizeDeps.include
    experimental: { esmExternals: "loose" },
    // optimizePackageImports: ["tailwind-config"],
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Alias configuration (equivalent to Vite's resolve.alias)
    // if (!isServer) {
    //   config.entry = {
    //     main: path.resolve(fileURLToPath(import.meta.url), "../src/main.tsx"),
    //     ...config.entry,
    //   };
    // }
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // "tailwind-config": path.resolve(__dirname, "tailwind.config.js"),
    };

    // SVG handling (equivalent to vite-plugin-svgr)
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            icon: true,
            svgoConfig: {
              plugins: [
                {
                  name: "preset-default",
                  params: {
                    overrides: {
                      removeViewBox: false,
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    });
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
  output: "export",

  // Images configuration
  images: {
    disableStaticImages: true, // Required for custom SVG loader
  },
  // Enable experimental features if needed
  experimental: {
    appDir: true, // If using App Router
  },
});

export default nextConfig;
