import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // If deploying to Cloudflare Pages, we want static exports or standard build outputs
  // Since we are deploying to Cloudflare Pages which supports standard SSR via Cloudflare Workers
  // or Static HTML export, we can configure it if needed. Let's keep it standard.
};

export default nextConfig;
