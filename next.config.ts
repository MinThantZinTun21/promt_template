import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack ignores stray lockfiles in parent folders.
  turbopack: { root: path.resolve(".") },
};

export default nextConfig;
