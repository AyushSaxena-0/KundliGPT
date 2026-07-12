"use client";

import React, { memo } from "react";
import { AstrologyDashboardData } from "../../types/astrology";

export const YogaPanel = memo(function YogaPanel({ data }: { data: AstrologyDashboardData }) {
  return (
    <section className="astro-panel" aria-label="Yoga detection">
      <h3 className="astro-panel-title">Yogas</h3>
      <div className="grid gap-2">
        {data.yogas.map((yoga) => (
          <div key={yoga.name} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">{yoga.name}</p>
              <span className={yoga.detected ? "text-emerald-300" : "text-mutedText"}>{yoga.detected ? "Detected" : "Not detected"}</span>
            </div>
            <p className="mt-1 text-xs text-mutedText">{yoga.explanation}</p>
            <div className="mt-2 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-accent" style={{ width: `${yoga.confidence}%` }} /></div>
          </div>
        ))}
      </div>
    </section>
  );
});
