"use client";

import React, { memo } from "react";
import { AstrologyDashboardData } from "../../types/astrology";

export const DoshaPanel = memo(function DoshaPanel({ data }: { data: AstrologyDashboardData }) {
  return (
    <section className="astro-panel" aria-label="Dosha detection">
      <h3 className="astro-panel-title">Doshas</h3>
      <div className="grid gap-2">
        {data.doshas.map((dosha) => (
          <div key={dosha.name} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">{dosha.name}</p>
              <span className={dosha.detected ? "text-rose-300" : "text-emerald-300"}>{dosha.severity}</span>
            </div>
            <p className="mt-1 text-xs text-mutedText">{dosha.explanation}</p>
            <p className="mt-2 text-2xs text-amber-100">Remedies: {dosha.remedies.join(", ")}</p>
          </div>
        ))}
      </div>
    </section>
  );
});
