"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HelpCircle, Search, Compass, ChevronDown, ChevronUp } from "lucide-react";
import { JsonLd } from "../../components/seo/JsonLd";
import { schemaHelper } from "../../lib/seo";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import Footer from "../../components/layout/Footer";

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is Vedic Astrology (Jyotish)?",
      answer: "Vedic Astrology is an ancient Indian sidereal system that maps planetary alignments against actual physical constellations, accounting for the earth's axis shift. It focuses heavily on personal karma, life cycles (Dashas), and spiritual growth."
    },
    {
      question: "How accurate is the AI Vedic Astrologer?",
      answer: "The AI Astrologer is an educational and guidance tool that combines classical Vedic astrology rules with state-of-the-art AI (Gemini). While it is highly accurate in explaining placements and transit energies, it should be treated as interpretative advisory counsel rather than deterministic fact."
    },
    {
      question: "Why does my birth time need to be exact?",
      answer: "Vedic astrology divides the sky into 12 houses based on the Ascendant (Lagna) sign, which rises on the eastern horizon at birth. The ascendant shifts by one degree every four minutes, so even a small difference in time can modify your entire house layout."
    },
    {
      question: "What is Manglik Dosha?",
      answer: "Manglik Dosha is a planetary condition arising when Mars (Mangal) resides in the 1st, 2nd, 4th, 7th, 8th, or 12th houses of a birth chart. It represents high, intense energy in partnerships. It is not a curse, and can be managed through mindfulness, service, and emotional discipline."
    },
    {
      question: "What is Sade Sati?",
      answer: "Sade Sati is the 7.5-year transit of Saturn (Shani) over your natal moon sign, the sign preceding it, and the sign succeeding it. It is traditionally feared but is actually a constructive period of major self-discipline, purification, and long-term grounding."
    }
  ];

  // Filter FAQs
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Generate FAQ JSON-LD Schema
  const faqSchema = schemaHelper.getFAQSchema(faqs);

  return (
    <div className="flex-1 flex flex-col bg-background relative select-none">
      
      {/* FAQ Schema */}
      <JsonLd data={faqSchema} />

      <main className="flex-1 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <HelpCircle className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white">Frequently Asked Questions</h1>
          <p className="text-sm text-mutedText mt-2">
            Find answers to common questions about Vedic Astrology, calculations, and our AI model.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs (e.g. Sade Sati, birth time)..."
            className="pl-10"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-mutedText" />
        </div>

        {/* FAQ list */}
        <div className="space-y-4 pt-4">
          {filteredFaqs.length === 0 ? (
            <p className="text-mutedText text-center py-8">No matching FAQs found.</p>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className="border border-border/80 bg-card/45 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 font-semibold font-display text-white hover:text-accent transition-colors focus:outline-none"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? <ChevronUp className="h-5 w-5 text-mutedText" /> : <ChevronDown className="h-5 w-5 text-mutedText" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm sm:text-md text-mutedText leading-relaxed border-t border-border/40 font-sans">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom CTA */}
        <div className="text-center p-8 rounded-xl bg-secondary/20 border border-border/60 space-y-4 glass-panel">
          <Compass className="h-8 w-8 text-accent mx-auto animate-spin-slow" />
          <h3 className="text-xl font-bold font-display text-white">Have a more specific question?</h3>
          <p className="text-xs sm:text-sm text-mutedText max-w-sm mx-auto">
            Our AI Astrologer is online 24/7 to provide detailed interpretations of your natal positions and active transits.
          </p>
          <Link href="/chat">
            <Button variant="primary">
              Start Free Reading
            </Button>
          </Link>
        </div>

      </main>
      <Footer />
    </div>
  );
}
