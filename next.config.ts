import type { NextConfig } from "next";

/**
 * GitHub Pages serves a project site at https://<user>.github.io/<repo>/.
 * Set PAGES_BASE_PATH="" when the site moves to a custom domain at the root.
 */
const basePath = (process.env.PAGES_BASE_PATH ?? "/Dreamers-Construction").replace(
  /\/$/,
  "",
);

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
