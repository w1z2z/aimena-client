import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Multiple lockfiles exist (repo root + front/). Pin Turbopack to this app
  // so CSS imports like `../styles/*.css` from `src/app` resolve correctly.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
