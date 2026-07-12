import { Metadata } from "next";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://ai-vedic-astrologer.pages.dev";

/**
 * Utility to generate Next.js metadata dynamically for SEO configuration.
 */
export function generateSEOMetadata({
  title,
  description,
  path,
  image = "/og-image.jpg",
  type = "website",
}: SEOProps): Metadata {
  const canonicalUrl = `${APP_URL}${path}`;

  return {
    title: `${title} | AI Vedic Astrologer`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "AI Vedic Astrologer",
      images: [
        {
          url: image.startsWith("http") ? image : `${APP_URL}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.startsWith("http") ? image : `${APP_URL}${image}`],
    },
  };
}

/**
 * Schema.org Generator helper functions to return structured data objects
 */
export const schemaHelper = {
  getOrganizationSchema: () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${APP_URL}/#organization`,
    "name": "AI Vedic Astrologer",
    "url": APP_URL,
    "logo": `${APP_URL}/logo.png`,
    "sameAs": [
      "https://github.com",
    ]
  }),

  getWebSiteSchema: () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${APP_URL}/#website`,
    "name": "AI Vedic Astrologer",
    "url": APP_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${APP_URL}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }),

  getBreadcrumbSchema: (items: { name: string; url: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${APP_URL}${item.url}`
    }))
  }),

  getFAQSchema: (faqs: { question?: string; answer?: string; q?: string; a?: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q || faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a || faq.answer
      }
    }))
  }),

  getArticleSchema: (article: {
    title: string;
    description: string;
    path: string;
    publishDate: string;
    updatedDate: string;
    author: string;
    imageUrl: string;
  }) => ({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "image": [article.imageUrl.startsWith("http") ? article.imageUrl : `${APP_URL}${article.imageUrl}`],
    "datePublished": article.publishDate,
    "dateModified": article.updatedDate,
    "author": [{
      "@type": "Person",
      "name": article.author,
      "url": `${APP_URL}/about`
    }],
    "publisher": {
      "@type": "Organization",
      "name": "AI Vedic Astrologer",
      "logo": {
        "@type": "ImageObject",
        "url": `${APP_URL}/logo.png`
      }
    },
    "description": article.description,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${APP_URL}${article.path}`
    }
  })
};
