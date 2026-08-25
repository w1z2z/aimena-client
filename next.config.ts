import path from "node:path";
import type { NextConfig } from "next";

/** LAN host from front/.env — must stay in sync when WiFi IP changes. */
function resolveLanDevOrigins(): string[] {
  const origins = new Set<string>(["192.168.*", "10.*"]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    try {
      const hostname = new URL(appUrl).hostname;
      if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
        origins.add(hostname);
      }
    } catch {
      // ignore invalid URL
    }
  }

  return [...origins];
}

const nextConfig: NextConfig = {
  output: "standalone",
  // Phone on the same WiFi opens http://<LAN-IP>:3000 — allow HMR / dev assets.
  allowedDevOrigins: resolveLanDevOrigins(),
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
