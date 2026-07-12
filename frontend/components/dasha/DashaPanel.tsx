"use client";

import React, { memo } from "react";
import { AstrologyDashboardData } from "../../types/astrology";

export const DashaPanel = memo(function DashaPanel({ data }: { data: AstrologyDashboardData }) {
  return (
    <section className="astro-panel" aria-label="Dasha panel">
      <h3 className="astro-panel-title">Dasha Timeline</h3>
      {data.dasha.current && (
        <div className="mb-3 rounded-lg border border-amber-300/20 bg-amber-300/10 p-3">
          <p className="text-xs text-amber-100">Current</p>
          <p className="text-sm font-semibold text-white">{data.dasha.current.mahadasha} / {data.dasha.current.antardasha}</p>
          <p className="text-2xs text-mutedText">Remaining: {data.dasha.current.remaining || "Calculated from timeline"}</p>
        </div>
      )}
      <div className="space-y-2">
        {data.dasha.timeline.slice(0, 8).map((period) => (
          <div key={`${period.mahadasha}-${period.antardasha}-${period.start_date}`} className="grid grid-cols-[86px_1fr] items-center gap-3 text-xs">
            <span className="text-mutedText">{period.start_date}</span>
            <div className={`rounded-lg border p-2 ${period.current ? "border-primary/60 bg-primary/15" : "border-white/10 bg-white/[0.03]"}`}>
              <span className="font-semibold text-white">{period.mahadasha}</span>
              <span className="text-mutedText"> / {period.antardasha} until {period.end_date}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});
