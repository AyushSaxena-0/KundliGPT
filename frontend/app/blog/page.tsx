"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, Search, Clock, User, ArrowRight } from "lucide-react";
import { generateSEOMetadata } from "../../lib/seo";
import { blogPosts } from "../../content/blog";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import Footer from "../../components/layout/Footer";

export default function BlogIndex() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extract all unique categories
  const categories = Array.from(new Set(Object.values(blogPosts).map((post) => post.category)));

  // Filter posts
  const filteredPosts = Object.values(blogPosts).filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = !selectedCategory || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 flex flex-col bg-background relative select-none">
      
      {/* Decorative glows */}
      <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full">
        
        {/* Header */}
        <div className="text-center mb-10">
          <BookOpen className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white">Vedic Astrology Blog</h1>
          <p className="text-sm sm:text-md text-mutedText mt-2 max-w-lg mx-auto">
            Deepen your understanding of sidereal chart systems, planetary transits, and ancient Jyotish remedies.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between border-b border-border/60 pb-6">
          
          {/* Categories selectors */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
                !selectedCategory
                  ? "bg-primary text-white border-primary"
                  : "bg-card text-mutedText border-border hover:text-white"
              }`}
            >
              All Articles
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
                  selectedCategory === cat
                    ? "bg-primary text-white border-primary"
                    : "bg-card text-mutedText border-border hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full md:max-w-xs">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="pl-9 h-9 text-sm"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-mutedText" />
          </div>

        </div>

        {/* Blog Posts Grid */}
        {filteredPosts.length === 0 ? (
          <p className="text-mutedText text-center py-16">No blog articles match your filters.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {filteredPosts.map((post) => (
              <Card key={post.slug} className="glass-card flex flex-col h-full">
                <CardContent className="p-6 flex flex-col h-full justify-between">
                  <div>
                    {/* Tag info */}
                    <div className="flex items-center justify-between mb-3 text-2xs text-mutedText">
                      <span className="px-2 py-0.5 rounded bg-secondary text-accent font-semibold uppercase tracking-wider">
                        {post.category}
                      </span>
                      <span>{post.publishDate}</span>
                    </div>

                    <Link href={`/blog/${post.slug}`} className="group">
                      <h3 className="text-xl font-bold font-display text-white group-hover:text-accent transition-colors mb-2">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-mutedText leading-relaxed mb-4">{post.description}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-2">
                    <div className="flex items-center gap-4 text-2xs text-mutedText">
                      <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{post.readingTime}</span>
                      </div>
                    </div>

                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="link" size="sm" className="flex items-center gap-1 font-semibold group p-0">
                        <span>Read More</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Bottom CTA to Chat */}
        <div className="text-center p-8 rounded-xl bg-secondary/20 border border-border/60">
          <h3 className="text-lg sm:text-xl font-bold font-display text-white mb-2">Have a specific question about your chart?</h3>
          <p className="text-xs sm:text-sm text-mutedText mb-6 max-w-md mx-auto">
            Our AI Astrologer can analyze your unique birth chart placements dynamically.
          </p>
          <Link href="/chat">
            <Button variant="primary" size="md">
              Start Free Consultation
            </Button>
          </Link>
        </div>

      </main>
      <Footer />
    </div>
  );
}
