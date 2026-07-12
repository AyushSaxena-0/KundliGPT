import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, Compass, ShieldAlert } from "lucide-react";
import { zodiacSigns } from "../../../content/zodiacs";
import { JsonLd } from "../../../components/seo/JsonLd";
import { RecordPageViewTracker } from "../../../components/seo/RecordPageViewTracker";
import { AdPlaceholder } from "../../../components/ui/AdPlaceholder";
import { schemaHelper } from "../../../lib/seo";
import { Button } from "../../../components/ui/button";
import Footer from "../../../components/layout/Footer";

interface PageProps {
  params: Promise<{ sign: string }>;
}

/**
 * Next.js 15 Server Component for rendering Zodiac Sign Profiles.
 * Injects detailed characteristics and FAQ Schema JSON-LD.
 */
export default async function ZodiacSignPage({ params }: { params: Promise<{ sign: string }> }) {
  const { sign } = await params;
  const data = zodiacSigns[sign.toLowerCase()];

  if (!data) {
    notFound();
  }

  // Create FAQ schema for this zodiac sign
  const faqSchema = schemaHelper.getFAQSchema(data.faqs);

  return (
    <div className="flex-1 flex flex-col bg-background relative select-none">
      
      {/* Schema.org FAQ Structured Data */}
      <JsonLd data={faqSchema} />

      <RecordPageViewTracker id={sign.toLowerCase()} title={`${data.name} Profile`} type="zodiac" url={`/zodiac/${sign.toLowerCase()}`} />

      {/* Decorative background glows */}
      <div className="absolute top-24 right-10 h-72 w-72 rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

      <main className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full space-y-8">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-mutedText hover:text-white transition-colors group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Home</span>
        </Link>

        {/* Profile Title Banner */}
        <div className="text-center p-8 rounded-xl bg-card border border-border/80 glass-panel">
          <div className="h-12 w-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mx-auto mb-4">
            <Star className="h-6 w-6" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white">
            {data.name} Astrological Profile
          </h1>
          <p className="text-sm text-accent font-semibold tracking-widest uppercase mt-2 font-display">
            Sanskrit: {data.sanskritName} • Ruler: {data.ruler} • Element: {data.element}
          </p>
        </div>

        <AdPlaceholder slot="hero-bottom" />

        {/* Overview & Personality */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 space-y-6">
            <div className="bg-card/20 border border-border/40 rounded-xl p-6">
              <h2 className="text-xl font-bold font-display text-white mb-3">Overview</h2>
              <p className="text-sm sm:text-md text-mutedText leading-relaxed">{data.overview}</p>
            </div>

            <div className="bg-card/20 border border-border/40 rounded-xl p-6">
              <h2 className="text-xl font-bold font-display text-white mb-3">Personality & Character</h2>
              <p className="text-sm sm:text-md text-mutedText leading-relaxed">{data.personality}</p>
            </div>
          </div>

          {/* Strengths & Challenges Sidebar */}
          <div className="md:col-span-4 space-y-6">
            <div className="border border-emerald-500/20 bg-emerald-950/10 rounded-xl p-5">
              <h3 className="text-md font-bold font-display text-emerald-400 mb-3">Core Strengths</h3>
              <ul className="space-y-1.5 text-sm text-mutedText">
                {data.strengths.map((str) => (
                  <li key={str}>• {str}</li>
                ))}
              </ul>
            </div>

            <div className="border border-rose-500/20 bg-rose-950/10 rounded-xl p-5">
              <h3 className="text-md font-bold font-display text-rose-400 mb-3">Key Challenges</h3>
              <ul className="space-y-1.5 text-sm text-mutedText">
                {data.challenges.map((chal) => (
                  <li key={chal}>• {chal}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Life Domains Details */}
        <div className="space-y-6">
          <div className="bg-card/20 border border-border/40 rounded-xl p-6">
            <h2 className="text-xl font-bold font-display text-white mb-3">Relationships & Love</h2>
            <p className="text-sm sm:text-md text-mutedText leading-relaxed">{data.relationships}</p>
          </div>

          <div className="bg-card/20 border border-border/40 rounded-xl p-6">
            <h2 className="text-xl font-bold font-display text-white mb-3">Career, Vocation & Education</h2>
            <p className="text-sm sm:text-md text-mutedText leading-relaxed">
              {data.career} {data.education}
            </p>
          </div>

          <div className="bg-card/20 border border-border/40 rounded-xl p-6 border-l-2 border-l-primary">
            <div className="flex items-center gap-2 mb-2 text-white">
              <ShieldAlert className="h-5 w-5 text-primary shrink-0" />
              <h2 className="text-xl font-bold font-display">Health Considerations</h2>
            </div>
            <p className="text-sm sm:text-md text-mutedText leading-relaxed">{data.health}</p>
          </div>
        </div>

        <AdPlaceholder slot="content-middle" />

        {/* Frequently Asked Questions (FAQPage schema matches this) */}
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

        {/* Bottom CTA */}
        <div className="text-center p-8 rounded-xl bg-secondary/20 border border-border/60 space-y-4 glass-panel">
          <Compass className="h-8 w-8 text-primary mx-auto animate-spin-slow" />
          <h3 className="text-xl font-bold font-display text-white">Curious about your complete astrological chart?</h3>
          <p className="text-xs sm:text-sm text-mutedText max-w-md mx-auto">
            Vedic astrology charts examine the exact planetary degrees, house alignments, and active dashas.
            Chat with the AI Vedic Astrologer for deeper insights.
          </p>
          <Link href="/chat">
            <Button variant="primary">
              Consult the Astrologer
            </Button>
          </Link>
        </div>

      </main>
      <Footer />
    </div>
  );
}
