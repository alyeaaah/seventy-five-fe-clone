import { fileURLToPath } from "node:url";

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
});

export default nextConfig;
