import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // An unrelated package-lock.json sits in the home directory; without an
  // explicit root Turbopack walks up and picks it as the workspace.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
