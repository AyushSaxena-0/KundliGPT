import { MetadataRoute } from "next";
import { blogPosts } from "../content/blog";
import { zodiacSigns } from "../content/zodiacs";
import { freeTools } from "../content/tools";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://ai-vedic-astrologer.pages.dev";

/**
 * Dynamic Next.js Sitemap generator for search indexing.
 * Combines static files, blog posts, tools, and zodiac signs.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // 1. Static Pages
  const staticPaths = ["", "/about", "/privacy", "/terms", "/faq", "/contact", "/chat"];
  staticPaths.forEach((path) => {
    sitemapEntries.push({
      url: `${APP_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: path === "" || path === "/chat" ? "daily" : "monthly",
      priority: path === "" ? 1.0 : path === "/chat" ? 0.9 : 0.5,
    });
  });

  // 2. Blog Posts
  Object.keys(blogPosts).forEach((slug) => {
    sitemapEntries.push({
      url: `${APP_URL}/blog/${slug}`,
      lastModified: new Date(blogPosts[slug].updatedDate),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  });

  // 3. Zodiac Signs
  Object.keys(zodiacSigns).forEach((slug) => {
    sitemapEntries.push({
      url: `${APP_URL}/zodiac/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  });

  // 4. Free Tools
  Object.keys(freeTools).forEach((slug) => {
    sitemapEntries.push({
      url: `${APP_URL}/tools/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  });

  return sitemapEntries;
}
