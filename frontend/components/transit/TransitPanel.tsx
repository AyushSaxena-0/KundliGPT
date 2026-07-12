"use client";

import React, { memo } from "react";
import { AstrologyDashboardData } from "../../types/astrology";

export const TransitPanel = memo(function TransitPanel({ data }: { data: AstrologyDashboardData }) {
  return (
    <section className="astro-panel" aria-label="Transit panel">
      <h3 className="astro-panel-title">Transits</h3>
      <div className="space-y-2">
        {[...data.transits.today, ...data.transits.upcoming].slice(0, 7).map((transit) => (
          <div key={`${transit.planet}-${transit.exact_date}`} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">{transit.planet} in {transit.sign}</p>
              <span className="rounded bg-primary/20 px-2 py-1 text-2xs text-accent">{transit.importance}</span>
            </div>
            <p className="mt-1 text-xs text-mutedText">{transit.interpretation}</p>
          </div>
        ))}
      </div>
    </section>
  );
});
