"use client";

import React, { memo } from "react";
import { AstrologyDashboardData } from "../../types/astrology";

export const NakshatraPanel = memo(function NakshatraPanel({ data }: { data: AstrologyDashboardData }) {
  const n = data.nakshatra;
  return (
    <section className="astro-panel" aria-label="Nakshatra summary">
      <h3 className="astro-panel-title">Nakshatra</h3>
      <p className="text-lg font-semibold text-white">{n.birth_nakshatra} · Pada {n.pada}</p>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-mutedText">
        <span>Lord: <strong className="text-white">{n.lord}</strong></span>
        <span>Nature: <strong className="text-white">{n.nature}</strong></span>
        <span>Compatibility: <strong className="text-white">{n.compatibility}</strong></span>
        <span>Strength: <strong className="text-white">{n.strength}%</strong></span>
      </div>
      <p className="mt-3 text-xs text-mutedText">{n.description}</p>
    </section>
  );
});
