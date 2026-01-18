import { fileURLToPath } from "node:url";
import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = () => ({
  distDir: "dist",
  reactStrictMode: true,
  output: "export",

  // Webpack configuration
  webpack: (config) => {
    // Alias configuration
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "tailwind-config": fileURLToPath(
        new URL("./tailwind.config.js", import.meta.url)
      ),
    };

    // SVG handling dengan SVGR
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg")
    );

    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }

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

    return config;
  },

  // Images configuration
  images: {
    disableStaticImages: true, // Required for custom SVG loader
  },

  // Experimental features
  experimental: {
    esmExternals: "loose",
  },

  // outputFileTracingRoot to fix lockfile warning
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),
});

export default nextConfig;
