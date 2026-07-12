"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Heart, 
  Sparkles, 
  RefreshCw, 
  Star, 
  Printer, 
  FileDown, 
  Share2, 
  AlertCircle, 
  CheckCircle, 
  CalendarDays, 
  ChevronRight, 
  MapPin, 
  ArrowLeft,
  ChevronDown,
  Info
} from "lucide-react";
import { Sidebar } from "../../components/layout/Sidebar";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { api } from "../../lib/api";
import { NorthIndianKundli } from "../../components/kundli/NorthIndianKundli";
import { SouthIndianChart } from "../../components/charts/SouthIndianChart";
import { WesternCircularChart } from "../../components/charts/WesternCircularChart";

// Circular Progress Component
function CircularProgress({ percent, label }: { percent: number; label: string }) {
  const size = 70;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-3.5 bg-secondary/10 rounded-xl border border-white/5">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="absolute transform -rotate-90 w-full h-full">
          <circle
            stroke="rgba(255,255,255,0.05)"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            stroke="#a855f7" // Purple accent
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            style={{ strokeDashoffset, strokeLinecap: "round" }}
            r={radius}
            cx={size / 2}
            cy={size / 2}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="text-xs font-semibold text-white">{percent}%</span>
      </div>
      <span className="mt-2 text-2xs uppercase tracking-wider text-mutedText text-center font-semibold">{label}</span>
    </div>
  );
}

// Dosha Badge Component
function DoshaBadge({ title, details }: { title: string; details: { status: string; description: string; detected: boolean } }) {
  const getColors = () => {
    switch (details.status) {
      case "Good":
        return "border-emerald-500/20 bg-emerald-500/5 text-emerald-300";
      case "Warning":
        return "border-amber-500/20 bg-amber-500/5 text-amber-300";
      case "Needs Attention":
      default:
        return "border-rose-500/20 bg-rose-500/5 text-rose-300";
    }
  };

  const getIcon = () => {
    if (details.status === "Good") return <CheckCircle className="h-3.5 w-3.5 mr-1 shrink-0 text-emerald-400" />;
    return <AlertCircle className="h-3.5 w-3.5 mr-1 shrink-0" />;
  };

  return (
    <div className={`p-3 rounded-lg border flex flex-col gap-1.5 ${getColors()}`}>
      <div className="flex items-center text-xs font-bold uppercase tracking-wider">
        {getIcon()}
        {title} · <span className="ml-1 text-2xs opacity-80">{details.status}</span>
      </div>
      <p className="text-2xs leading-relaxed opacity-90">{details.description}</p>
    </div>
  );
}

export default function MarriageMatchingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Form inputs
  const [partnerA, setPartnerA] = useState({
    name: "",
    gender: "Male",
    date_of_birth: "",
    time_of_birth: "",
    place_of_birth: "",
    timezone: "Asia/Kolkata"
  });

  const [partnerB, setPartnerB] = useState({
    name: "",
    gender: "Female",
    date_of_birth: "",
    time_of_birth: "",
    place_of_birth: "",
    timezone: "Asia/Kolkata"
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [chartStyle, setChartStyle] = useState<"North" | "South" | "Western">("North");
  const [activeChartTab, setActiveChartTab] = useState<"partner_a" | "partner_b">("partner_a");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePartnerAChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPartnerA(prev => ({ ...prev, [name]: value }));
  };

  const handlePartnerBChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPartnerB(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!partnerA.name.trim()) errors.a_name = "Name is required";
    if (!partnerA.date_of_birth) errors.a_dob = "Date of birth is required";
    if (!partnerA.time_of_birth) errors.a_tob = "Time of birth is required";
    if (!partnerA.place_of_birth.trim()) errors.a_pob = "Place of birth is required";

    if (!partnerB.name.trim()) errors.b_name = "Name is required";
    if (!partnerB.date_of_birth) errors.b_dob = "Date of birth is required";
    if (!partnerB.time_of_birth) errors.b_tob = "Time of birth is required";
    if (!partnerB.place_of_birth.trim()) errors.b_pob = "Place of birth is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await api.performMarriageMatching({
        partner_a: partnerA,
        partner_b: partnerB
      });
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to calculate marriage matching details.");
    } finally {
      setLoading(false);
    }
  };

  const exportMarkdown = () => {
    if (!result) return;
    let md = `# Marriage Kundli Milan Report: ${result.partner_a.name} & ${result.partner_b.name}\n\n`;
    md += `**Overall Verdict**: ${result.dashboard.verdict} (${result.dashboard.overall_score} / 36 Gunas)\n\n`;
    md += `## Birth Profiles\n`;
    md += `- **Partner A**: ${result.partner_a.name} (${result.partner_a.gender}) · Nakshatra: ${result.partner_a.nakshatra} Pada ${result.partner_a.pada} · Moon Sign: ${result.partner_a.moon_sign}\n`;
    md += `- **Partner B**: ${result.partner_b.name} (${result.partner_b.gender}) · Nakshatra: ${result.partner_b.nakshatra} Pada ${result.partner_b.pada} · Moon Sign: ${result.partner_b.moon_sign}\n\n`;
    
    md += `## Ashtakoota Milan Table\n`;
    md += `| Koota | Points Obtained | Max Points | Explanation |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    Object.entries(result.ashtakoota).forEach(([k, val]: any) => {
      if (k !== "total_score" && k !== "max_score") {
        md += `| ${k.toUpperCase()} | ${val.score} | ${val.max} | ${val.explanation} |\n`;
      }
    });
    md += `| **TOTAL** | **${result.ashtakoota.total_score}** | **${result.ashtakoota.max_score}** | |\n\n`;

    md += `## Vedic Dosha Check\n`;
    Object.entries(result.doshas).forEach(([d, val]: any) => {
      md += `- **${d.toUpperCase()}**: Status: ${val.status} · ${val.description}\n`;
    });
    md += `\n## AI Analysis & Interpretations\n\n`;
    md += result.ai_analysis;
    
    md += `\n\n---\n*${result.disclaimer || "Disclaimer: Based on traditional Vedic astrology. Use for personal guidance."}*`;

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Kundli_Matching_${result.partner_a.name}_${result.partner_b.name}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Kundli_Matching_${result.partner_a.name}_${result.partner_b.name}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Predefined suggestion chips
  const suggestionChips = result ? [
    `How does the ${result.ashtakoota.nadi.score === 0 ? "Nadi Dosha" : "Gana Maitri"} influence our daily home life?`,
    `What traditional remedies are suggested for our ${result.doshas.manglik.detected ? "Manglik placements" : "astrological alignment"}?`,
    `Explain the dynamic between ${result.partner_a.name}'s ${result.partner_a.moon_sign} Moon and ${result.partner_b.name}'s ${result.partner_b.moon_sign} Moon.`
  ] : [];

  if (!isMounted) {
    return (
      <div className="flex-1 flex h-[calc(100vh-64px)] overflow-hidden bg-background">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <main className="flex-1 flex justify-center items-center bg-[#09090F]" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-[calc(100vh-64px)] overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#09090F] relative">
        <div className="absolute top-10 left-10 h-96 w-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-6 z-10 relative">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-2 text-accent">
                <Heart className="h-5 w-5 fill-accent shrink-0" />
                <span className="text-xs font-semibold uppercase tracking-widest font-display">Vedic Astrology Milan</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-display text-white tracking-tight mt-1">
                ❤️ Marriage Kundli Matching
              </h1>
              <p className="text-xs md:text-sm text-mutedText mt-1">
                Assess marital compatibility, calculate Guna score out of 36, and identify planetary Doshas.
              </p>
            </div>
            
            {result && (
              <div className="flex items-center gap-2 no-print">
                <Button variant="secondary" size="sm" onClick={exportMarkdown} className="gap-1.5 text-xs">
                  <FileDown size={14} /> MD
                </Button>
                <Button variant="secondary" size="sm" onClick={exportJson} className="gap-1.5 text-xs">
                  <FileDown size={14} /> JSON
                </Button>
                <Button variant="secondary" size="sm" onClick={() => window.print()} className="gap-1.5 text-xs">
                  <Printer size={14} /> Print Report
                </Button>
                <Button variant="primary" size="sm" onClick={() => setResult(null)} className="gap-1.5 text-xs">
                  <RefreshCw size={14} /> New Match
                </Button>
              </div>
            )}
          </div>

          {!result ? (
            /* Input Form Screen */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Partner A Details */}
                <Card className="glass-panel border-border/80 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                  <CardHeader className="pb-3 pl-6">
                    <CardTitle className="text-lg text-white font-display flex items-center gap-2">
                      <span className="flex items-center justify-center rounded-full bg-primary/20 text-accent h-6 w-6 text-xs font-semibold">1</span>
                      Partner A Details
                    </CardTitle>
                    <CardDescription className="text-xs">Provide birth information for the first individual.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pl-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-2xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">Name</label>
                        <Input name="name" value={partnerA.name} onChange={handlePartnerAChange} placeholder="First Name" />
                        {formErrors.a_name && <p className="text-rose-400 text-2xs mt-1">{formErrors.a_name}</p>}
                      </div>
                      <div>
                        <label className="block text-2xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">Gender</label>
                        <select name="gender" value={partnerA.gender} onChange={handlePartnerAChange} className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all">
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-2xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">Date of Birth</label>
                        <Input name="date_of_birth" type="date" value={partnerA.date_of_birth} onChange={handlePartnerAChange} />
                        {formErrors.a_dob && <p className="text-rose-400 text-2xs mt-1">{formErrors.a_dob}</p>}
                      </div>
                      <div>
                        <label className="block text-2xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">Time of Birth (24h)</label>
                        <Input name="time_of_birth" type="time" value={partnerA.time_of_birth} onChange={handlePartnerAChange} />
                        {formErrors.a_tob && <p className="text-rose-400 text-2xs mt-1">{formErrors.a_tob}</p>}
                      </div>
                      <div>
                        <label className="block text-2xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">Place of Birth</label>
                        <Input name="place_of_birth" value={partnerA.place_of_birth} onChange={handlePartnerAChange} placeholder="e.g. Mumbai, India" />
                        {formErrors.a_pob && <p className="text-rose-400 text-2xs mt-1">{formErrors.a_pob}</p>}
                      </div>
                      <div>
                        <label className="block text-2xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">Timezone</label>
                        <Input name="timezone" value={partnerA.timezone} onChange={handlePartnerAChange} placeholder="Asia/Kolkata" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Partner B Details */}
                <Card className="glass-panel border-border/80 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-accent" />
                  <CardHeader className="pb-3 pl-6">
                    <CardTitle className="text-lg text-white font-display flex items-center gap-2">
                      <span className="flex items-center justify-center rounded-full bg-accent/20 text-accent h-6 w-6 text-xs font-semibold">2</span>
                      Partner B Details
                    </CardTitle>
                    <CardDescription className="text-xs">Provide birth information for the second individual.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pl-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-2xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">Name</label>
                        <Input name="name" value={partnerB.name} onChange={handlePartnerBChange} placeholder="First Name" />
                        {formErrors.b_name && <p className="text-rose-400 text-2xs mt-1">{formErrors.b_name}</p>}
                      </div>
                      <div>
                        <label className="block text-2xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">Gender</label>
                        <select name="gender" value={partnerB.gender} onChange={handlePartnerBChange} className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all">
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-2xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">Date of Birth</label>
                        <Input name="date_of_birth" type="date" value={partnerB.date_of_birth} onChange={handlePartnerBChange} />
                        {formErrors.b_dob && <p className="text-rose-400 text-2xs mt-1">{formErrors.b_dob}</p>}
                      </div>
                      <div>
                        <label className="block text-2xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">Time of Birth (24h)</label>
                        <Input name="time_of_birth" type="time" value={partnerB.time_of_birth} onChange={handlePartnerBChange} />
                        {formErrors.b_tob && <p className="text-rose-400 text-2xs mt-1">{formErrors.b_tob}</p>}
                      </div>
                      <div>
                        <label className="block text-2xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">Place of Birth</label>
                        <Input name="place_of_birth" value={partnerB.place_of_birth} onChange={handlePartnerBChange} placeholder="e.g. Delhi, India" />
                        {formErrors.b_pob && <p className="text-rose-400 text-2xs mt-1">{formErrors.b_pob}</p>}
                      </div>
                      <div>
                        <label className="block text-2xs font-semibold uppercase tracking-wider mb-1.5 text-mutedText">Timezone</label>
                        <Input name="timezone" value={partnerB.timezone} onChange={handlePartnerBChange} placeholder="Asia/Kolkata" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {error && (
                <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 text-xs text-rose-300 flex items-start gap-2 max-w-2xl mx-auto">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <div>
                    <span className="font-bold">Error Processing Matching: </span>
                    {error}
                  </div>
                </div>
              )}

              <div className="flex justify-center pt-2">
                <Button type="submit" variant="primary" size="lg" className="w-full max-w-sm font-semibold text-sm gap-2" disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-white" />
                      Calculating compatibility...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 fill-white shrink-0 text-white" />
                      Calculate Compatibility (Milan)
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            /* Results Screen */
            <div className="space-y-6 animate-fadeIn">
              
              {/* Premium Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Compatibility Core Card */}
                <Card className="glass-panel border-border/80 lg:col-span-1 flex flex-col justify-between">
                  <CardHeader className="pb-3 text-center">
                    <CardTitle className="text-md text-mutedText uppercase tracking-wider font-semibold">Guna Milan Score</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center p-6 pt-0 space-y-4">
                    
                    {/* Giant Circular Score display */}
                    <div className="relative h-32 w-32 flex items-center justify-center rounded-full border-4 border-primary/20 bg-secondary/10">
                      <div className="absolute inset-2 rounded-full border-2 border-dashed border-accent/30 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-white">{result.ashtakoota.total_score}</span>
                        <span className="text-2xs text-mutedText uppercase tracking-widest font-bold">out of 36</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <h3 className="text-lg font-bold text-white tracking-tight">{result.dashboard.verdict}</h3>
                      
                      {/* Star Rating display */}
                      <div className="flex justify-center gap-1 mt-1.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4.5 w-4.5 ${i < Math.round(result.dashboard.rating) ? "fill-accent text-accent" : "text-white/10"}`} 
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-2xs text-center text-mutedText leading-relaxed">
                      Traditional Vedic match: score $\ge$ 18 Gunas is auspicious, while above 25 is excellent.
                    </p>
                  </CardContent>
                </Card>

                {/* Compatibility Categories progress gauges */}
                <Card className="glass-panel border-border/80 lg:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-md text-white font-display">Dimensional Harmony</CardTitle>
                    <CardDescription className="text-xs">Calculated weights across core compatibility dimensions.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <CircularProgress percent={result.dashboard.emotional} label="Emotional Sync" />
                    <CircularProgress percent={result.dashboard.communication} label="Communication" />
                    <CircularProgress percent={result.dashboard.stability} label="Stability" />
                    <CircularProgress percent={result.dashboard.harmony} label="Family Life" />
                    <CircularProgress percent={result.dashboard.financial} label="Wealth Harmony" />
                    <CircularProgress percent={result.dashboard.physical} label="Physical Yoni" />
                    <CircularProgress percent={result.dashboard.spiritual} label="Spiritual Varna" />
                  </CardContent>
                </Card>
              </div>

              {/* Vedic Doshas badging */}
              <Card className="glass-panel border-border/80">
                <CardHeader className="pb-3">
                  <CardTitle className="text-md text-white font-display flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-accent shrink-0" />
                    Vedic Dosha Health Checks
                  </CardTitle>
                  <CardDescription className="text-xs">Checks for critical alignment obstructions that may require remedies.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  <DoshaBadge title="Manglik Dosha" details={result.doshas.manglik} />
                  <DoshaBadge title="Nadi Dosha" details={result.doshas.nadi} />
                  <DoshaBadge title="Bhakoot Dosha" details={result.doshas.bhakoot} />
                  <DoshaBadge title="Gana Dosha" details={result.doshas.gana} />
                  <DoshaBadge title="Rajju Dosha" details={result.doshas.rajju} />
                  <DoshaBadge title="Vedha Dosha" details={result.doshas.vedha} />
                </CardContent>
              </Card>

              {/* Side-by-Side Kundli Charts & Table */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Kundli rendering card */}
                <Card className="glass-panel border-border/80 lg:col-span-2">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between gap-4 border-b border-white/5 mb-4">
                    <div>
                      <CardTitle className="text-md text-white font-display">Side-by-Side Chart Analysis</CardTitle>
                      <CardDescription className="text-xs">View individual birth charts and planet alignments.</CardDescription>
                    </div>
                    
                    <div className="flex gap-1 shrink-0">
                      <Button 
                        variant={activeChartTab === "partner_a" ? "primary" : "secondary"} 
                        size="sm" 
                        onClick={() => setActiveChartTab("partner_a")}
                      >
                        {result.partner_a.name}
                      </Button>
                      <Button 
                        variant={activeChartTab === "partner_b" ? "primary" : "secondary"} 
                        size="sm" 
                        onClick={() => setActiveChartTab("partner_b")}
                      >
                        {result.partner_b.name}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    
                    {/* Selection style buttons */}
                    <div className="flex gap-1 mb-4">
                      {["North", "South", "Western"].map((style: any) => (
                        <button
                          key={style}
                          onClick={() => setChartStyle(style)}
                          className={`px-3 py-1 text-2xs font-semibold rounded-md border border-white/10 ${chartStyle === style ? "bg-accent/20 text-accent font-bold" : "text-mutedText hover:text-white"}`}
                        >
                          {style} Indian
                        </button>
                      ))}
                    </div>

                    <div className="w-full max-w-[420px] aspect-square flex items-center justify-center p-2 rounded-lg bg-[#0F0F1A] border border-white/5">
                      {chartStyle === "North" && (
                        <NorthIndianKundli 
                          data={activeChartTab === "partner_a" ? result.partner_a.chart : result.partner_b.chart} 
                        />
                      )}
                      {chartStyle === "South" && (
                        <SouthIndianChart 
                          data={activeChartTab === "partner_a" ? result.partner_a.chart : result.partner_b.chart} 
                        />
                      )}
                      {chartStyle === "Western" && (
                        <WesternCircularChart 
                          data={activeChartTab === "partner_a" ? result.partner_a.chart : result.partner_b.chart} 
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Planet Positions Comparison Table */}
                <Card className="glass-panel border-border/80 lg:col-span-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-md text-white font-display">Planet Comparison</CardTitle>
                    <CardDescription className="text-xs">Compare longitudes and houses side-by-side.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 bg-secondary/10 text-mutedText text-2xs font-bold uppercase tracking-wider">
                            <th className="p-3 pl-4">Planet</th>
                            <th className="p-3">{result.partner_a.name}</th>
                            <th className="p-3 pr-4">{result.partner_b.name}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {result.planet_comparison.map((row: any) => (
                            <tr key={row.planet} className="hover:bg-white/2 text-white/90">
                              <td className="p-3 pl-4 font-semibold text-accent">{row.planet}</td>
                              <td className="p-3 text-2xs">{row.partner_a}</td>
                              <td className="p-3 text-2xs pr-4">{row.partner_b}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Ashtakoota Milan Table */}
              <Card className="glass-panel border-border/80">
                <CardHeader className="pb-3">
                  <CardTitle className="text-md text-white font-display">Traditional Ashtakoota breakdown</CardTitle>
                  <CardDescription className="text-xs">The 8 Kootas representing different facets of married life compatibility.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-secondary/15 text-mutedText text-2xs font-bold uppercase tracking-wider">
                          <th className="p-3.5 pl-6">Koota</th>
                          <th className="p-3.5">Weight (Max)</th>
                          <th className="p-3.5">Points Scored</th>
                          <th className="p-3.5 pr-6">Astrological Analysis & Interpretation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-white/95">
                        {Object.entries(result.ashtakoota).map(([key, val]: any) => {
                          if (key === "total_score" || key === "max_score") return null;
                          return (
                            <tr key={key} className="hover:bg-white/2">
                              <td className="p-3.5 pl-6 font-semibold uppercase tracking-wider text-2xs">{key.replace("_", " ")}</td>
                              <td className="p-3.5 text-mutedText">{val.max}</td>
                              <td className={`p-3.5 font-bold ${val.score === 0 ? "text-rose-400" : val.score === val.max ? "text-emerald-400" : "text-white"}`}>
                                {val.score} / {val.max}
                              </td>
                              <td className="p-3.5 text-2xs leading-normal pr-6 opacity-85">{val.explanation}</td>
                            </tr>
                          );
                        })}
                        <tr className="bg-secondary/10 font-bold border-t border-white/20">
                          <td className="p-4 pl-6 uppercase text-accent font-semibold tracking-wider text-2xs">Total Milan Score</td>
                          <td className="p-4 text-mutedText">36</td>
                          <td className="p-4 text-accent text-sm font-bold">
                            {result.ashtakoota.total_score} / 36
                          </td>
                          <td className="p-4 text-2xs pr-6 italic text-mutedText">
                            {result.dashboard.verdict}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* AI Deep Analysis Section */}
              <Card className="glass-panel border-border/80">
                <CardHeader className="pb-3 border-b border-white/5 mb-4">
                  <CardTitle className="text-md text-white font-display flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-accent shrink-0" />
                    AI Astrological Matching Synthesis
                  </CardTitle>
                  <CardDescription className="text-xs">Dynamic interpretations calculated from planetary interactions.</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none text-xs md:text-sm leading-relaxed text-white/90 space-y-4 px-6 pb-6">
                  {/* Clean Render of AI Analysis Blocks */}
                  {result.ai_analysis.split("\n\n").map((para: string, idx: number) => {
                    if (para.startsWith("##")) {
                      return <h2 key={idx} className="text-md font-bold font-display text-accent uppercase tracking-wider border-b border-white/5 pb-1 mt-6 mb-2">{para.replace("##", "").trim()}</h2>;
                    }
                    if (para.startsWith("-")) {
                      return (
                        <ul key={idx} className="list-disc pl-5 space-y-1 my-2">
                          {para.split("\n").map((item, idy) => (
                            <li key={idy}>{item.replace("-", "").trim()}</li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={idx} className="opacity-90">{para}</p>;
                  })}
                </CardContent>
              </Card>

              {/* Astrological Timeline */}
              <Card className="glass-panel border-border/80">
                <CardHeader className="pb-3">
                  <CardTitle className="text-md text-white font-display">Astrological Relationship Timeline</CardTitle>
                  <CardDescription className="text-xs">Projections of planetary transits and shared cycles across time.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="relative border-l border-white/10 pl-6 ml-3 space-y-6">
                    {result.relationship_timeline.map((item: any, idx: number) => (
                      <div key={idx} className="relative">
                        {/* Dot marker */}
                        <div className="absolute -left-[30px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-accent bg-[#09090F]" />
                        
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            {item.period} 
                            <span className="text-3xs lowercase font-normal text-mutedText">
                              (Year {item.year_offset === 0 ? "Initial" : `+${item.year_offset}`})
                            </span>
                          </h4>
                          <p className="text-2xs text-mutedText leading-relaxed">{item.interpretation}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Timeline Disclaimer */}
                  <div className="mt-5 p-3 rounded-lg bg-secondary/15 border border-white/5 text-3xs text-mutedText leading-relaxed">
                    <span className="font-semibold text-white/80 uppercase block mb-1">Timeline Disclaimer</span>
                    This timeline is a symbolic representation of astrological transits and planetary cycles. Astrology does not dictate outcomes; free will, shared values, and mutual effort are the primary forces in any marriage.
                  </div>
                </CardContent>
              </Card>

              {/* Follow-up question suggestion chips */}
              <div className="space-y-2.5 no-print">
                <h4 className="text-2xs font-semibold uppercase tracking-wider text-mutedText flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-accent shrink-0" />
                  Suggested follow-up questions for AI chat:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {suggestionChips.map((chip, idx) => (
                    <Link key={idx} href={`/chat?prompt=${encodeURIComponent(chip)}`}>
                      <button className="px-3.5 py-2 text-2xs text-left bg-secondary/20 hover:bg-secondary/40 border border-white/10 text-accent rounded-lg transition-all flex items-center gap-2 max-w-full">
                        <span>{chip}</span>
                        <ChevronRight size={12} className="shrink-0" />
                      </button>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Vedic Astrological Milan Disclaimer */}
              <div className="mt-8 p-4 rounded-lg bg-secondary/5 border border-white/5 text-2xs text-mutedText text-center max-w-3xl mx-auto leading-relaxed italic">
                <p>
                  "This compatibility report is based on traditional Vedic astrology. It is intended for personal reflection and cultural interest. Astrology cannot predict or guarantee relationship outcomes. Mutual respect, communication, shared values, and personal choices remain the most important factors in a successful marriage."
                </p>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
