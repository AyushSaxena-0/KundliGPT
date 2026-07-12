"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, Database, FileJson, Printer, RefreshCw, Sparkles } from "lucide-react";
import { BirthDetails } from "../../types";
import { useAstrologyDashboard } from "../../hooks/useAstrologyDashboard";
import { downloadTextFile } from "../../lib/chartRenderer";
import { NorthIndianKundli } from "../kundli/NorthIndianKundli";
import { SouthIndianChart } from "../charts/SouthIndianChart";
import { WesternCircularChart } from "../charts/WesternCircularChart";
import { PlanetTable } from "../planet/PlanetTable";
import { HouseTable } from "../planet/HouseTable";
import { AspectMatrix } from "../charts/AspectMatrix";
import { DashaPanel } from "../dasha/DashaPanel";
import { TransitPanel } from "../transit/TransitPanel";
import { LifeTimeline } from "../timeline/LifeTimeline";
import { YogaPanel } from "../yoga/YogaPanel";
import { DoshaPanel } from "../dosha/DoshaPanel";
import { StrengthPanel } from "./StrengthPanel";
import { NakshatraPanel } from "./NakshatraPanel";
import { LifeDashboard } from "./LifeDashboard";

const tabs = ["Kundli", "South", "Western", "Tables", "Aspects", "Dasha", "Yogas", "Life"] as const;
type DashboardTab = (typeof tabs)[number];

export function AstrologyDashboard({ birthDetails }: { birthDetails: BirthDetails }) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("Kundli");
  const [collapsed, setCollapsed] = useState(false);
  const { data, isLoading, error, isReady } = useAstrologyDashboard(birthDetails);

  const subtitle = useMemo(() => {
    if (!birthDetails?.name) return "Awaiting birth details";
    return `${birthDetails.name} · ${birthDetails.date_of_birth || ""} · ${birthDetails.place_of_birth || ""}`;
  }, [birthDetails]);

  const exportJson = () => {
    if (!data) return;
    downloadTextFile(`astrology_dashboard_${birthDetails.name || "chart"}.json`, JSON.stringify(data, null, 2), "application/json;charset=utf-8");
  };

  return (
    <aside className="astro-dashboard no-print" aria-label="Professional astrology dashboard">
      <div className="flex h-full flex-col">
        <header className="border-b border-white/10 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <h2 className="truncate text-sm font-semibold text-white">Astrology Workspace</h2>
              </div>
              <p className="mt-1 truncate text-2xs text-mutedText">{subtitle}</p>
            </div>
            <button className="astro-icon-btn lg:hidden" onClick={() => setCollapsed((value) => !value)} aria-label="Collapse dashboard">
              <ChevronDown className={`h-4 w-4 transition-transform ${collapsed ? "-rotate-90" : ""}`} />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-1">
            <button className="astro-action-btn" onClick={exportJson} disabled={!data} aria-label="Export JSON"><FileJson size={14} /> JSON</button>
            <button className="astro-action-btn" onClick={() => window.print()} disabled={!data} aria-label="Print or save PDF"><Printer size={14} /> PDF</button>
            {isLoading && <RefreshCw className="ml-auto h-4 w-4 animate-spin text-accent" />}
          </div>
        </header>

        <div className={`${collapsed ? "hidden lg:flex" : "flex"} min-h-0 flex-1 flex-col`}>
          <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-white/10 px-2 py-2" aria-label="Dashboard tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-md px-3 py-2 text-xs transition-colors ${activeTab === tab ? "bg-primary text-white" : "text-mutedText hover:bg-white/10 hover:text-white"}`}
                aria-current={activeTab === tab ? "page" : undefined}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {!isReady && (
              <div className="astro-empty">
                <Database className="h-8 w-8 text-accent" />
                <p className="text-sm font-semibold text-white">Birth details required</p>
                <p className="text-xs text-mutedText">Save name, date, time and place to generate the live dashboard.</p>
              </div>
            )}
            {error && <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 p-3 text-xs text-rose-200">{error}</div>}
            {isLoading && !data && <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 rounded-lg shimmer" />)}</div>}
            {data && (
              <div className="space-y-3">
                {activeTab === "Kundli" && <NorthIndianKundli data={data} />}
                {activeTab === "South" && <SouthIndianChart data={data} />}
                {activeTab === "Western" && <WesternCircularChart data={data} />}
                {activeTab === "Tables" && (
                  <>
                    <PlanetTable data={data} />
                    <HouseTable data={data} />
                    <StrengthPanel data={data} />
                    <NakshatraPanel data={data} />
                  </>
                )}
                {activeTab === "Aspects" && <AspectMatrix data={data} />}
                {activeTab === "Dasha" && (
                  <>
                    <DashaPanel data={data} />
                    <TransitPanel data={data} />
                  </>
                )}
                {activeTab === "Yogas" && (
                  <>
                    <YogaPanel data={data} />
                    <DoshaPanel data={data} />
                  </>
                )}
                {activeTab === "Life" && (
                  <>
                    <LifeDashboard data={data} />
                    <LifeTimeline data={data} />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
