import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Compass, Info, CheckCircle2 } from "lucide-react";
import { freeTools } from "../../../content/tools";
import { JsonLd } from "../../../components/seo/JsonLd";
import { RecordPageViewTracker } from "../../../components/seo/RecordPageViewTracker";
import { AdPlaceholder } from "../../../components/ui/AdPlaceholder";
import { schemaHelper } from "../../../lib/seo";
import { Button } from "../../../components/ui/button";
import Footer from "../../../components/layout/Footer";

interface PageProps {
  params: Promise<{ tool: string }>;
}

/**
 * Next.js 15 Server Component for rendering Free Astrology Tool detail pages.
 * Supports FAQ JSON-LD schemas and maps clear CTAs back to the chatbot workspace.
 */
export default async function FreeToolLandingPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params;
  const data = freeTools[tool.toLowerCase()];

  if (!data) {
    notFound();
  }

  // Create FAQ schema for this tool page
  const faqSchema = schemaHelper.getFAQSchema(data.faqs);

  return (
    <div className="flex-1 flex flex-col bg-background relative select-none">
      
      {/* Schema.org FAQ Structured Data */}
      <JsonLd data={faqSchema} />

      <RecordPageViewTracker id={tool.toLowerCase()} title={data.title} type="tool" url={`/tools/${tool.toLowerCase()}`} />

      {/* Decorative glows */}
      <div className="absolute top-20 left-1/4 h-80 w-80 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <main className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full space-y-8">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-mutedText hover:text-white transition-colors group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Home</span>
        </Link>

        {/* Title Banner */}
        <div className="p-8 rounded-xl bg-card border border-border/80 glass-panel flex flex-col md:flex-row items-center gap-6">
          <div className="h-16 w-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Compass className="h-8 w-8 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-white leading-tight">
              {data.title}
            </h1>
            <p className="text-sm sm:text-md text-accent mt-1.5 font-medium font-display">
              {data.subtitle}
            </p>
          </div>
        </div>

        <AdPlaceholder slot="hero-bottom" />

        {/* Introduction & Detailed Explanation */}
        <div className="space-y-6">
          <div className="bg-card/25 border border-border/40 rounded-xl p-6">
            <h2 className="text-xl font-bold font-display text-white mb-3">Introduction</h2>
            <p className="text-sm sm:text-md text-mutedText leading-relaxed">{data.introduction}</p>
          </div>

          <div className="bg-card/25 border border-border/40 rounded-xl p-6">
            <h2 className="text-xl font-bold font-display text-white mb-3">Detailed Astrological Explanation</h2>
            <p className="text-sm sm:text-md text-mutedText leading-relaxed">{data.explanation}</p>
          </div>
        </div>

        {/* How It Works (Step-by-Step) */}
        <div className="bg-card/20 border border-border/40 rounded-xl p-6">
          <h2 className="text-xl font-bold font-display text-white mb-4">How It Works</h2>
          <div className="grid grid-cols-1 gap-4">
            {data.howItWorks.map((step, index) => (
              <div key={index} className="flex gap-3 items-start">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm sm:text-md text-mutedText leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <AdPlaceholder slot="content-middle" />

        {/* Frequently Asked Questions */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-display text-white border-b border-border/40 pb-2 mb-4">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {data.faqs.map((faq) => (
              <div key={faq.question} className="border border-border/60 bg-card/30 rounded-xl p-5">
                <h4 className="text-md font-semibold font-display text-accent mb-2">{faq.question}</h4>
                <p className="text-sm text-mutedText leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Custom CTA to Transition User to /chat */}
        <div className="text-center p-8 rounded-xl bg-secondary/30 border border-primary/30 space-y-4 glass-panel">
          <Info className="h-8 w-8 text-accent mx-auto animate-pulse" />
          <h3 className="text-xl font-bold font-display text-white">Unlock Deep Guidance Now</h3>
          <p className="text-xs sm:text-sm text-mutedText max-w-md mx-auto">
            {data.ctaText}
          </p>
          <Link href="/chat">
            <Button variant="primary">
              Launch Astrologer Chat
            </Button>
          </Link>
        </div>

      </main>
      <Footer />
    </div>
  );
}
