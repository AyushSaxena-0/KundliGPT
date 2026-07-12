"use client";

import React, { memo } from "react";
import { AstrologyDashboardData } from "../../types/astrology";

export const LifeTimeline = memo(function LifeTimeline({ data }: { data: AstrologyDashboardData }) {
  return (
    <section className="astro-panel" aria-label="Life timeline">
      <h3 className="astro-panel-title">Life Timeline</h3>
      <div className="relative space-y-3 before:absolute before:left-3 before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-white/10">
        {data.timeline.map((event) => (
          <div key={`${event.year}-${event.title}`} className="relative grid grid-cols-[32px_1fr] gap-3">
            <span className="z-10 mt-1 h-6 w-6 rounded-full border border-amber-300/50 bg-[#171329]" />
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <p className="text-2xs uppercase text-accent">{event.year} · {event.category}</p>
              <p className="text-sm font-semibold text-white">{event.title}</p>
              <p className="text-xs text-mutedText">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});
