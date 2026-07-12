import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, User, Compass, Calendar } from "lucide-react";
import { blogPosts } from "../../../content/blog";
import { MarkdownRenderer } from "../../../components/chat/MarkdownRenderer";
import { JsonLd } from "../../../components/seo/JsonLd";
import { schemaHelper } from "../../../lib/seo";
import { Button } from "../../../components/ui/button";
import Footer from "../../../components/layout/Footer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Next.js 15 Server Component for rendering individual blog articles.
 * Combines dynamic routing, Markdown rendering, Schema JSON-LD, and CTAs.
 */
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts[slug];

  if (!post) {
    notFound();
  }

  // Find related posts
  const relatedPosts = post.relatedSlugs
    .map((s) => blogPosts[s])
    .filter((p) => p !== undefined);

  // Generate Schema.org Article JSON-LD
  const articleSchema = schemaHelper.getArticleSchema({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    publishDate: post.publishDate,
    updatedDate: post.updatedDate,
    author: post.author,
    imageUrl: post.imageUrl
  });

  return (
    <div className="flex-1 flex flex-col bg-background relative select-none">
      
      {/* JSON-LD Structured Data */}
      <JsonLd data={articleSchema} />

      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 relative z-10 w-full">
        
        {/* Back Link */}
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-mutedText hover:text-white transition-colors mb-6 group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Blog</span>
        </Link>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Area (8 cols) */}
          <article className="lg:col-span-8 space-y-6">
            
            {/* Header info */}
            <div className="space-y-4">
              <span className="px-2.5 py-1 rounded bg-primary/10 border border-primary/20 text-accent text-xs font-semibold uppercase tracking-wider">
                {post.category}
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-white leading-tight">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-mutedText border-y border-border/40 py-3">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span className="font-medium text-white">{post.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Published: {post.publishDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{post.readingTime}</span>
                </div>
              </div>
            </div>

            {/* Markdown rendered body */}
            <div className="bg-card/25 border border-border/40 rounded-xl p-6 md:p-8">
              <MarkdownRenderer content={post.content} />
            </div>

          </article>

          {/* Right Sidebar Area (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Table of Contents */}
            <div className="border border-border/60 bg-card/30 rounded-xl p-5">
              <h3 className="text-md font-bold font-display text-white mb-3 border-b border-border/60 pb-2">
                Table of Contents
              </h3>
              <nav className="space-y-2 text-sm">
                {post.tableOfContents.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-mutedText hover:text-accent transition-colors font-medium"
                  >
                    • {item.text}
                  </a>
                ))}
              </nav>
            </div>

            {/* AI Call to Action */}
            <div className="border border-primary/30 bg-secondary/20 rounded-xl p-5 text-center space-y-4 glass-panel">
              <Compass className="h-8 w-8 text-accent mx-auto animate-spin-slow" />
              <h4 className="text-md font-bold font-display text-white">Interpret Your Personal Chart</h4>
              <p className="text-xs text-mutedText leading-relaxed">
                Vedic astrology is unique to your exact birth time. Chat with our AI Astrologer to decode your Nakshatra, Dasha timelines, and planetary transits.
              </p>
              <Link href="/chat" className="block">
                <Button className="w-full" size="sm">
                  Consult Now
                </Button>
              </Link>
            </div>

            {/* Related Articles */}
            {relatedPosts.length > 0 && (
              <div className="border border-border/60 bg-card/30 rounded-xl p-5">
                <h3 className="text-md font-bold font-display text-white mb-3 border-b border-border/60 pb-2">
                  Related Reading
                </h3>
                <div className="space-y-3">
                  {relatedPosts.map((rel) => (
                    <Link key={rel.slug} href={`/blog/${rel.slug}`} className="block group">
                      <h4 className="text-sm font-semibold text-mutedText group-hover:text-white transition-colors leading-snug">
                        {rel.title}
                      </h4>
                      <span className="text-2xs text-accent uppercase font-semibold mt-1 block">
                        {rel.category}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </aside>

        </div>

      </main>
      <Footer />
    </div>
  );
}
