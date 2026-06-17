import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* PWA & App Config */
  reactStrictMode: true,

  headers: async () => [
    {
      source: "/sw.js",
      headers: [
        {
          key: "Content-Type",
          value: "application/javascript; charset=utf-8",
        },
        {
          key: "Cache-Control",
          value: "no-cache, no-store, must-revalidate",
        },
        {
          key: "Service-Worker-Allowed",
          value: "/",
        },
      ],
    },
    {
      source: "/manifest.json",
      headers: [
        {
          key: "Content-Type",
          value: "application/manifest+json; charset=utf-8",
        },
        {
          key: "Access-Control-Allow-Origin",
          value: "*",
        },
      ],
    },
  ],
};

export default nextConfig;
