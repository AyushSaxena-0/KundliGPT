"use client";

import React, { memo } from "react";
import { AstrologyDashboardData } from "../../types/astrology";

export const StrengthPanel = memo(function StrengthPanel({ data }: { data: AstrologyDashboardData }) {
  return (
    <section className="astro-panel" aria-label="Shadbala strengths">
      <h3 className="astro-panel-title">Shadbala</h3>
      <div className="space-y-2">
        {data.strengths.map((item) => (
          <div key={item.planet} className="grid grid-cols-[70px_1fr_42px] items-center gap-2 text-xs">
            <span className="font-semibold text-white">{item.planet}</span>
            <div className="h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${item.percentage}%` }} /></div>
            <span className="text-right text-mutedText">#{item.ranking}</span>
          </div>
        ))}
      </div>
    </section>
  );
});
