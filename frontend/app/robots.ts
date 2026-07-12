import { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://ai-vedic-astrologer.pages.dev";

/**
 * Dynamic Next.js Robots.txt generator config.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/_next/",
        "/static/",
        "/api/",
        "/admin/",
        "/private/",
      ],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
