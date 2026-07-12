"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Heart, 
  Coins, 
  GraduationCap, 
  Users, 
  Compass,
  ArrowRight,
  ShieldCheck,
  MessageSquareShare,
  CalendarCheck,
  Search,
  Star,
  Sparkles,
  Share2,
  Moon,
  Plane,
  Baby,
  TrendingUp,
  LineChart,
  UserCheck
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import Footer from "../components/layout/Footer";
import AdPlaceholder from "../components/ui/AdPlaceholder";
import NewsletterSignup from "../components/ui/NewsletterSignup";
import SearchModal from "../components/layout/SearchModal";
import { BirthDetailsForm } from "../components/chat/BirthDetailsForm";
import { useChat } from "../hooks/useChat";
import { analytics } from "../lib/analytics";

export default function Home() {
  const { birthDetails } = useChat();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<"chat" | "chart" | "dasha">("chat");

  useEffect(() => {
    analytics.initialize();
    analytics.trackPageView("/");
  }, []);

  const handleShare = () => {
    analytics.trackEvent("button_click", { name: "share_platform" });
    if (navigator.share) {
      navigator.share({
        title: "AI Vedic Astrologer",
        text: "Generate accurate Vedic charts and consult the AI Vedic Astrologer.",
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Platform link copied to clipboard!");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  // Mock dashboard scores requested by the user
  const dashboardScores = [
    { name: "Career", score: 82, color: "from-purple-600 to-indigo-500", icon: Briefcase },
    { name: "Marriage", score: 70, color: "from-pink-600 to-rose-500", icon: Heart },
    { name: "Health", score: 90, color: "from-emerald-600 to-teal-500", icon: Sparkles },
    { name: "Finance", score: 65, color: "from-amber-600 to-yellow-500", icon: Coins },
    { name: "Education", score: 95, color: "from-blue-600 to-sky-500", icon: GraduationCap },
  ];

  // 9 premium feature cards
  const featureCards = [
    { title: "Career", desc: "Align with planetary transits for promotions, new ventures, and professional milestones.", icon: Briefcase, alignment: 82, color: "text-purple-400" },
    { title: "Marriage", desc: "Discover connection dynamics, Guna Milan compatibility scores, and Manglik Dosha impacts.", icon: Heart, alignment: 70, color: "text-pink-400" },
    { title: "Health", desc: "Gain energy cycle warnings, physical wellness updates, and customized Vedic remediation steps.", icon: Sparkles, alignment: 90, color: "text-emerald-400" },
    { title: "Finance", desc: "Identify wealth-generation cycles (Dhana Yogas) and optimal asset-building windows.", icon: Coins, alignment: 65, color: "text-amber-400" },
    { title: "Education", desc: "Supercharge your academic focus, exam preparations, and higher learning opportunities.", icon: GraduationCap, alignment: 95, color: "text-blue-400" },
    { title: "Travel", desc: "Pinpoint foreign travel horizons, relocations, and spiritual pilgrimage transits.", icon: Plane, alignment: 78, color: "text-indigo-400" },
    { title: "Family", desc: "Navigate ancestral patterns, domestic harmony indices, and relational connections.", icon: Users, alignment: 85, color: "text-cyan-400" },
    { title: "Children", desc: "Audit progeny timings, educational alignments, and legacy transits securely.", icon: Baby, alignment: 72, color: "text-teal-400" },
    { title: "Business", desc: "Gauge business cycles, partnership synastry, and wealth expansion dashas.", icon: TrendingUp, alignment: 88, color: "text-rose-400" }
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#09090B] text-[#F8FAFC] relative overflow-hidden select-none">
      
      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Decorative cosmic background glows */}
      <div className="absolute top-20 left-1/4 h-80 w-80 rounded-full bg-[#7C3AED]/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-[#FBBF24]/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 h-80 w-80 rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none" />

      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="space-y-6"
        >
          {/* Tagline Badge */}
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#FBBF24] font-display shadow-[0_0_15px_rgba(124,58,237,0.1)]">
            ✨ Ancient Cosmic Wisdom Meets Advanced AI
          </span>

          {/* Premium Headline */}
          <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight text-white font-display leading-[1.1] max-w-4xl mx-auto">
            🔮 Discover Your Destiny Through <span className="bg-gradient-to-r from-[#7C3AED] via-[#FFD369] to-[#7C3AED] bg-clip-text text-transparent">Vedic Astrology</span>
          </h1>

          {/* Subhead */}
          <p className="text-md sm:text-lg text-[#A1A1AA] max-w-2xl mx-auto font-sans leading-relaxed">
            Personalized Kundli • Career • Marriage • Finance • Health
          </p>

          {/* Search Trigger */}
          <div className="max-w-md mx-auto relative pt-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full h-12 px-4 text-left text-sm rounded-xl border border-border/80 bg-[#12131A]/60 backdrop-blur-md hover:border-[#7C3AED]/40 text-[#A1A1AA] flex items-center justify-between transition-all focus:outline-none focus:ring-1 focus:ring-[#7C3AED] shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-[#A1A1AA]" />
                <span>Search Articles, FAQ, Tools or Zodiac signs...</span>
              </div>
              <span className="text-2xs font-mono bg-[#1E1B4B] px-2 py-1 rounded border border-border/40 text-[#A1A1AA]/80">Search</span>
            </button>
          </div>

          {/* Action CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button 
              size="lg" 
              onClick={() => document.getElementById("interactive-workspace")?.scrollIntoView({ behavior: "smooth" })}
              className="w-full sm:w-auto bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] transition-all font-display rounded-xl py-6 px-8"
            >
              <span>Generate Free Kundli</span>
              <ArrowRight className="h-5 w-5 animate-pulse" />
            </Button>
            
            <Link href="/chat" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full border-border/80 bg-transparent text-[#F8FAFC] hover:bg-white/5 font-display rounded-xl py-6 px-8"
              >
                <Compass className="h-5 w-5 text-[#FBBF24] mr-2" />
                <span>Chat With AI Astrologer</span>
              </Button>
            </Link>
          </div>

          {/* Reviews Banner */}
          <div className="pt-6 flex items-center justify-center gap-2 text-sm text-[#A1A1AA]">
            <div className="flex text-[#FBBF24]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <span className="font-semibold text-white">5.0 / 5.0</span>
            <span>• Trusted by thousands of users worldwide</span>
          </div>
        </motion.div>
      </section>

      {/* Sponsored Partner Banner */}
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-2 mb-8">
        <AdPlaceholder slot="hero-bottom" />
      </div>

      {/* Interactive Workspace (Details Form Card + Astrology Dashboard Preview) */}
      <section id="interactive-workspace" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 relative z-10 border-t border-border/20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Quick Birth Details Form Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="text-left mb-4">
              <span className="text-xs uppercase tracking-widest text-[#7C3AED] font-mono font-bold">Vedic Calculator</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-1">Generate Your Free Kundli</h2>
              <p className="text-xs text-[#A1A1AA] mt-1">Enter your exact parameters to align your planetary coordinates.</p>
            </div>
            
            <div id="birth-form-card" className="rounded-2xl border border-border/80 bg-[#12131A] p-1 shadow-2xl">
              <BirthDetailsForm />
            </div>
          </div>

          {/* Right Column: Interactive preview of the Astrology Dashboard */}
          <div className="lg:col-span-7 space-y-4 h-full flex flex-col">
            <div className="text-left mb-4">
              <span className="text-xs uppercase tracking-widest text-[#FBBF24] font-mono font-bold">Dashboard Preview</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-1">Your Celestial Alignment</h2>
              <p className="text-xs text-[#A1A1AA] mt-1">Mock profile predictions. Complete your registration to unlock live calculations.</p>
            </div>

            <div className="flex-1 rounded-2xl border border-border/80 bg-[#12131A] p-6 shadow-2xl space-y-6 flex flex-col justify-between">
              
              {/* Header Info */}
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div>
                  <h3 className="font-bold text-lg text-white font-display flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#FBBF24]" />
                    Mock Cosmic Dashboard
                  </h3>
                  <p className="text-2xs text-[#A1A1AA] font-sans mt-0.5">Showing baseline celestial aspects for test profile</p>
                </div>
                <span className="text-2xs font-mono bg-[#1E1B4B] text-[#FBBF24] px-2.5 py-1 rounded border border-[#7C3AED]/20 uppercase font-bold tracking-wider">
                  PREVIEW
                </span>
              </div>

              {/* Progress Bars for user requested metrics */}
              <div className="space-y-4 flex-1 py-4 justify-center flex flex-col">
                {dashboardScores.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2 text-[#F8FAFC]">
                          <div className="h-6 w-6 rounded bg-secondary/80 flex items-center justify-center text-accent">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-semibold">{item.name}</span>
                        </div>
                        <span className="font-mono text-[#FBBF24] font-bold text-xs">{item.score}%</span>
                      </div>
                      
                      {/* Styled Progress Bar */}
                      <div className="w-full h-3 bg-secondary rounded-full overflow-hidden border border-border/40 p-[1px]">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.score}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className={`h-full rounded-full bg-gradient-to-r ${item.color} shadow-[0_0_8px_rgba(124,58,237,0.3)]`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CTA Overlay block */}
              <div className="border-t border-border/40 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-2xs text-[#A1A1AA]">
                  * Details are kept strictly private under local storage locks.
                </span>
                <Link href="/chat" className="w-full sm:w-auto">
                  <Button size="sm" className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] font-display rounded-lg py-2.5">
                    Unlock Live Calculations →
                  </Button>
                </Link>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Three-Column App Layout Preview Showcase */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 relative z-10 border-t border-border/20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-[#7C3AED] font-mono font-bold">Interactive Tour</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white mt-1">Premium Workspace Interface</h2>
          <p className="text-sm text-[#A1A1AA] mt-2">
            A look at our fully integrated 3-column consultation workspace (Sidebar | Chat | Live Kundli).
          </p>
        </div>

        <div className="rounded-2xl border border-border/85 bg-[#12131A] overflow-hidden shadow-2xl flex flex-col md:grid md:grid-cols-12 min-h-[500px]">
          
          {/* Mini Sidebar (Mock column 1) */}
          <div className="md:col-span-3 border-b md:border-b-0 md:border-r border-border/80 p-4 bg-[#09090B]/60 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                <Compass className="h-5 w-5 text-[#7C3AED]" />
                <span className="text-xs font-bold text-white tracking-wider uppercase font-display">Vedic App Console</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-mutedText font-mono font-semibold block px-2">History Log</span>
                <div className="p-2 rounded-lg bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-xs text-[#FBBF24] font-semibold flex items-center justify-between">
                  <span>Current Reading</span>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <div className="p-2 rounded-lg text-xs text-[#A1A1AA] hover:bg-white/5 cursor-pointer">Career Alignment</div>
                <div className="p-2 rounded-lg text-xs text-[#A1A1AA] hover:bg-white/5 cursor-pointer">Marriage Compatibility</div>
              </div>
            </div>
            <div className="p-3 bg-secondary/40 border border-border/40 rounded-xl space-y-1.5">
              <span className="text-[9px] uppercase font-mono block text-[#A1A1AA]">Consultant Profile</span>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/30 flex items-center justify-center text-xs text-white">
                  <UserCheck size={14} />
                </div>
                <div className="truncate">
                  <p className="text-2xs font-semibold text-white truncate">Amit Patel</p>
                  <p className="text-[9px] text-mutedText truncate">Patel_Amit1995</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mini Chat (Mock column 2) */}
          <div className="md:col-span-5 p-4 flex flex-col justify-between min-h-[350px] md:min-h-0 bg-[#12131A]/20">
            <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-[#FBBF24]" />
                <span className="text-xs font-bold text-white font-display">Astrological Chat</span>
              </div>
              <span className="text-[9px] text-[#A1A1AA] font-mono">15s Timeout Shield</span>
            </div>

            {/* Chat viewport preview */}
            <div className="flex-1 space-y-3 py-2 text-xs overflow-y-auto">
              <div className="p-3 rounded-xl bg-secondary/30 border border-border/40 text-[#A1A1AA] max-w-[90%] leading-relaxed font-sans">
                Greetings Amit Patel. I have successfully aligned your chart coordinates. Your Lagna resides in Leo. Ask your first career query.
              </div>
              <div className="p-3 rounded-xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-white max-w-[90%] ml-auto text-right leading-relaxed font-sans">
                How does Jupiter influence my career prospects?
              </div>
              <div className="p-3 rounded-xl bg-secondary/50 border border-[#7C3AED]/30 text-[#F8FAFC] max-w-[95%] leading-relaxed font-sans space-y-1">
                <span className="text-[#FBBF24] font-semibold text-[10px] block">✦ Astrologer Guidance</span>
                <p>Jupiter resides in your 10th house (Taurus), suggesting solid expansion in your status. However, Saturn aspects indicate discipline is required.</p>
              </div>
            </div>

            <div className="pt-3 border-t border-border/40 flex items-center gap-2">
              <div className="flex-1 bg-secondary/45 border border-border/80 rounded-lg h-9 px-3 text-2xs text-[#A1A1AA] flex items-center justify-between">
                <span>Ask your career question...</span>
                <MessageSquareShare size={14} className="text-[#A1A1AA]/60" />
              </div>
              <Button size="sm" className="h-9 px-3 bg-[#7C3AED]">Send</Button>
            </div>
          </div>

          {/* Mini Live Kundli / Dashboard Tabs (Mock column 3) */}
          <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-border/80 p-4 bg-[#09090B]/60 flex flex-col justify-between">
            <div className="space-y-4 w-full">
              {/* Tab Toggles */}
              <div className="flex items-center gap-1 bg-[#12131A] p-1 border border-border/40 rounded-lg">
                {(["chat", "chart", "dasha"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActivePreviewTab(tab)}
                    className={`flex-1 text-[9px] font-semibold uppercase tracking-wider py-1.5 rounded transition-all ${activePreviewTab === tab ? "bg-[#7C3AED] text-white" : "text-[#A1A1AA] hover:text-white"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="flex items-center justify-center min-h-[220px]">
                {activePreviewTab === "chat" && (
                  <div className="w-full p-3 rounded-xl border border-border bg-[#12131A]/90 space-y-2 text-2xs">
                    <div className="flex justify-between items-center text-[#FBBF24] font-semibold">
                      <span>✓ Yogas Detected</span>
                      <span>Confidence</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between p-1.5 rounded bg-secondary/50">
                        <span>Gaja Kesari Yoga</span>
                        <span className="font-mono text-[#FBBF24]">86%</span>
                      </div>
                      <div className="flex justify-between p-1.5 rounded bg-secondary/50">
                        <span>Budhaditya Yoga</span>
                        <span className="font-mono text-[#FBBF24]">92%</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-mutedText leading-relaxed mt-2 italic border-t border-border/40 pt-2">
                      "Moon and Jupiter angle mutually, promoting intellect, prosperity and community respect."
                    </p>
                  </div>
                )}

                {activePreviewTab === "chart" && (
                  <div className="w-full flex flex-col items-center gap-2">
                    {/* SVG Chart Preview Mock */}
                    <svg className="w-36 h-36 max-w-full text-accent" viewBox="0 0 100 100">
                      <rect x="2" y="2" width="96" height="96" fill="none" stroke="#7C3AED" strokeWidth="2.5" />
                      <line x1="2" y1="2" x2="98" y2="98" stroke="#7C3AED" strokeWidth="1.5" />
                      <line x1="98" y1="2" x2="2" y2="98" stroke="#7C3AED" strokeWidth="1.5" />
                      <line x1="2" y1="50" x2="50" y2="2" stroke="#7C3AED" strokeWidth="1.5" />
                      <line x1="50" y1="2" x2="98" y2="50" stroke="#7C3AED" strokeWidth="1.5" />
                      <line x1="98" y1="50" x2="50" y2="98" stroke="#7C3AED" strokeWidth="1.5" />
                      <line x1="50" y1="98" x2="2" y2="50" stroke="#7C3AED" strokeWidth="1.5" />
                      <text x="50" y="20" textAnchor="middle" fill="#FFD369" fontSize="8" fontWeight="bold">Lagna</text>
                      <text x="50" y="87" textAnchor="middle" fill="#FFFFFF" fontSize="6">Moon</text>
                      <text x="18" y="52" textAnchor="middle" fill="#FFFFFF" fontSize="6">Sun</text>
                      <text x="82" y="52" textAnchor="middle" fill="#FFFFFF" fontSize="6">Jupiter</text>
                    </svg>
                    <span className="text-[10px] font-mono text-[#FBBF24] font-semibold">North Indian Kundli Chart</span>
                  </div>
                )}

                {activePreviewTab === "dasha" && (
                  <div className="w-full space-y-2 text-2xs">
                    <span className="text-[9px] uppercase font-mono text-[#A1A1AA] block px-1">Vimshottari Mahadasha</span>
                    <div className="border-l border-border/80 ml-2 pl-3 space-y-3 py-1">
                      <div className="relative">
                        <div className="absolute -left-[16.5px] top-1 h-2 w-2 rounded-full bg-[#FBBF24] shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                        <p className="font-semibold text-white">Jupiter Dasha (Current)</p>
                        <p className="text-[10px] text-mutedText">2024-05-10 — 2040-05-10</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-[16.5px] top-1 h-2 w-2 rounded-full bg-[#7C3AED]" />
                        <p className="font-semibold text-[#A1A1AA]">Saturn Dasha (Upcoming)</p>
                        <p className="text-[10px] text-mutedText">2040-05-10 — 2059-05-10</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-border/40 pt-3 flex items-center justify-between text-2xs text-[#A1A1AA]">
              <span>Vedic calculation system online</span>
              <span className="font-mono text-[#FBBF24] font-semibold">Lahiri Ayanamsha</span>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Cards Grid (9-card Grid) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 relative z-10 border-t border-border/20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-[#FBBF24] font-mono font-bold">Comprehensive Analysis</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white mt-1">Explore Life Dimensions</h2>
          <p className="text-sm text-[#A1A1AA] mt-2">Personalized guidance tailored for every domain of your earthly journey.</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {featureCards.map((feat) => {
            const Icon = feat.icon;
            return (
              <motion.div key={feat.title} variants={itemVariants}>
                <Card className="rounded-2xl border border-border/80 bg-[#12131A] hover:bg-[#151620] transition-all hover:border-[#7C3AED]/40 hover:-translate-y-1 duration-300">
                  <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-secondary/80 border border-border/60 flex items-center justify-center text-[#7C3AED] shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold font-display text-white">{feat.title}</h3>
                        <span className="text-[10px] text-mutedText font-sans">Cosmic Alignment</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-[#A1A1AA] leading-relaxed flex-1">{feat.desc}</p>
                    
                    {/* Progress indicator */}
                    <div className="space-y-1 pt-2">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-mutedText">Alignment Strength</span>
                        <span className="text-[#FBBF24] font-bold">{feat.alignment}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#09090B] rounded-full overflow-hidden border border-border/30">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#FFD369]"
                          style={{ width: `${feat.alignment}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* AdSense Placement: Content Middle */}
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-2 mb-8">
        <AdPlaceholder slot="content-middle" />
      </div>

      {/* Zodiac Content Discovery Section */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 relative z-10 border-t border-border/20">
        <div className="p-8 rounded-2xl border border-border/80 bg-[#12131A] space-y-6">
          <div className="text-left">
            <span className="text-xs uppercase tracking-widest text-[#FBBF24] font-mono font-bold">Vedic Astrology (Jyotish)</span>
            <h3 className="text-xl sm:text-2xl font-bold font-display text-white mt-1">Vedic Moon Sign Explorer</h3>
            <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
              Select your Vedic sign (Chandra Rashi) to read about your personality, ruling deity, and planetary weaknesses.
            </p>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"].map(z => (
              <Link key={z} href={`/zodiac/${z.toLowerCase()}`}>
                <div className="py-3 px-2 border border-border bg-[#09090B]/60 rounded-xl text-center text-xs text-[#A1A1AA] hover:text-[#F8FAFC] hover:border-[#7C3AED]/40 hover:bg-[#12131A]/40 transition-all cursor-pointer font-semibold font-display shadow-md">
                  {z}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup Module */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <NewsletterSignup />
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-14 border-t border-border/20 relative z-10">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-widest text-[#7C3AED] font-mono font-bold">Frequently Asked Questions</span>
          <h2 className="text-3xl font-extrabold font-display text-white mt-1">Cosmic Q&A Directory</h2>
        </div>

        <div className="space-y-4">
          {[
            { q: "What is Vedic Astrology (Jyotish)?", a: "Vedic Astrology is an ancient Indian science that studies the positions of celestial bodies at the exact moment of birth to understand cosmic influences on human life." },
            { q: "How does the AI Vedic Astrologer work?", a: "By combining ancient Vedic principles, prompt engineering, and the Gemini Large Language Model, we provide contextual interpretations of planetary configurations based on your inputs." },
            { q: "Is this predictive or advisory?", a: "It is advisory. We strictly emphasize that astrology represents planetary energies and celestial tendencies rather than fatalistic pre-determined outcomes. Free will and karma shape your reality." },
            { q: "How are my birth details stored?", a: "Your privacy is paramount. All birth details and conversation logs are stored securely in local browser vaults or database instances depending on authorization preference." }
          ].map((faq) => (
            <Card key={faq.q} className="border-border/60 bg-[#12131A]/45">
              <CardContent className="p-5">
                <h3 className="text-md sm:text-lg font-bold font-display text-[#FBBF24] mb-2">{faq.q}</h3>
                <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
}
