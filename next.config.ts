import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Allow opening the local Next.js app from a phone on the LAN (IP hostname).
  allowedDevOrigins: ["192.168.0.15"],
  // Multiple lockfiles exist (repo root + front/). Pin Turbopack to this app
  // so CSS imports like `../styles/*.css` from `src/app` resolve correctly.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
