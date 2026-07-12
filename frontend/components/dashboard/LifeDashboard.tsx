"use client";

import React, { memo } from "react";
import { AstrologyDashboardData } from "../../types/astrology";

export const LifeDashboard = memo(function LifeDashboard({ data }: { data: AstrologyDashboardData }) {
  return (
    <section className="astro-panel" aria-label="Life dashboard">
      <h3 className="astro-panel-title">Life Dashboard</h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {Object.entries(data.life_scores).map(([area, item]) => (
          <div key={area} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold capitalize text-white">{area}</p>
              <span className="text-accent">{item.score}</span>
            </div>
            <p className="text-2xs text-mutedText">{item.trend}</p>
            <p className="mt-2 text-xs text-mutedText">{item.summary}</p>
          </div>
        ))}
      </div>
    </section>
  );
});
