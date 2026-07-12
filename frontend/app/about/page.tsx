"use client";

import React from "react";
import Link from "next/link";
import { Compass, BookOpen, Star, HelpCircle, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import Footer from "../../components/layout/Footer";

export default function AboutPage() {
  const sections = [
    {
      title: "What is Vedic Astrology?",
      icon: BookOpen,
      content: "Vedic Astrology, also known as Jyotish (the science of light), is a sophisticated astronomical and spiritual system originating in ancient India over 5,000 years ago. Unlike Western astrology which uses the tropical zodiac, Vedic astrology relies on the sidereal zodiac, reflecting the actual current astronomical alignment of stars and constellations. It focuses heavily on karma, destiny, and the developmental evolution of the human soul."
    },
    {
      title: "How does this AI work?",
      icon: Star,
      content: "AI Vedic Astrologer integrates advanced generative AI technology (Google Gemini API) with strict prompt constraints crafted by experienced Vedic scholars. When you enter your birth parameters, they are combined with Vedic chart-building concepts to frame contextual predictions, offering highly personalized guidance without storing your personal records on database servers."
    },
    {
      title: "Our Ethical Limitations",
      icon: ShieldAlert,
      content: "We believe in cosmic tendencies, not rigid fate. Our models are explicitly trained to avoid fear-based predictions (like negative curses or absolute death dates) and suggest remedies like meditation, discipline, and charity to harmonize planetary blockages. In accordance with professional boundaries, we never offer definitive medical diagnosis, legal outcomes, or specific financial stock investments."
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-background relative select-none">
      
      {/* Glow effects */}
      <div className="absolute top-20 right-1/4 h-72 w-72 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <main className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <Compass className="h-12 w-12 text-primary mx-auto mb-4 animate-spin-slow" />
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white">About AI Vedic Astrologer</h1>
          <p className="text-sm sm:text-md text-mutedText mt-2 max-w-xl mx-auto">
            Discover the synthesis of ancient spiritual heritage and state-of-the-art artificial intelligence.
          </p>
        </div>

        {/* Content segments */}
        <div className="space-y-8 mb-12">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <Card key={sec.title} className="glass-panel border-border/80">
                <CardHeader className="flex flex-row items-center gap-3 p-6 pb-2">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl font-display text-white">{sec.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 text-mutedText text-sm sm:text-md leading-relaxed font-sans">
                  {sec.content}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center p-8 rounded-xl bg-secondary/20 border border-border/60">
          <h3 className="text-lg font-bold font-display text-white mb-2">Ready to explore your planetary chart?</h3>
          <p className="text-xs sm:text-sm text-mutedText mb-6 max-w-md mx-auto">
            Consult the AI Vedic Astrologer today for career advice, relationship guidance, or spiritual remedies.
          </p>
          <Link href="/chat">
            <Button variant="primary" size="md">
              Start Free Reading
            </Button>
          </Link>
        </div>

      </main>

      {/* Footer */}
      <Footer />
      
    </div>
  );
}
