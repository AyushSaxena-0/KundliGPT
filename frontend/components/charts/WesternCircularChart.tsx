"use client";

import React, { memo } from "react";
import { AstrologyDashboardData } from "../../types/astrology";
import { planetGlyphs, zodiacGlyphs } from "../../lib/chartCalculations";

const pointOnCircle = (degree: number, radius: number) => {
  const angle = ((degree - 90) * Math.PI) / 180;
  return { x: 320 + Math.cos(angle) * radius, y: 320 + Math.sin(angle) * radius };
};

export const WesternCircularChart = memo(function WesternCircularChart({ data }: { data: AstrologyDashboardData }) {
  return (
    <section aria-label="Western circular horoscope" className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-white">Western Circular Chart</h3>
        <p className="text-2xs text-mutedText">Zodiac wheel with aspects, Ascendant and angles.</p>
      </div>
      <svg viewBox="0 0 640 640" role="img" className="aspect-square w-full rounded-lg border border-white/10 bg-[#070713]">
        <circle cx="320" cy="320" r="292" fill="#101022" stroke="#c79a35" strokeWidth="2" />
        <circle cx="320" cy="320" r="220" fill="#080814" stroke="#5b4c91" strokeWidth="1" />
        <circle cx="320" cy="320" r="90" fill="none" stroke="#302957" strokeWidth="1" />
        {Array.from({ length: 12 }).map((_, index) => {
          const a = index * 30;
          const outer = pointOnCircle(a, 292);
          const inner = pointOnCircle(a, 90);
          const label = pointOnCircle(a + 15, 258);
          return (
            <g key={a}>
              <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#453a73" />
              <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" fill="#f6d77a" fontSize="14">{zodiacGlyphs[index]}</text>
            </g>
          );
        })}
        {data.western_chart.aspects.slice(0, 18).map((aspect, index) => {
          const from = data.planets.find((p) => p.name === aspect.from);
          const to = data.planets.find((p) => p.name === aspect.to);
          if (!from || !to) return null;
          const a = pointOnCircle(from.longitude, 168);
          const b = pointOnCircle(to.longitude, 168);
          const stroke = aspect.type === "Positive" ? "#56d68a" : aspect.type === "Challenging" ? "#fb7185" : "#8d84c9";
          return <line key={`${aspect.from}-${aspect.to}-${index}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={stroke} strokeOpacity=".55" />;
        })}
        {data.planets.map((planet) => {
          const dot = pointOnCircle(planet.longitude, 194);
          const label = pointOnCircle(planet.longitude, 126);
          return (
            <g key={planet.name}>
              <circle cx={dot.x} cy={dot.y} r="5" fill="#fff" />
              <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="15">
                {planetGlyphs[planet.name] || planet.name.slice(0, 2)}
              </text>
            </g>
          );
        })}
        {[
          ["ASC", data.western_chart.ascendant],
          ["MC", data.western_chart.mc],
          ["DSC", data.western_chart.dsc],
          ["IC", data.western_chart.ic],
        ].map(([label, degree]) => {
          const p = pointOnCircle(Number(degree), 306);
          return <text key={label} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fill="#f6d77a" fontSize="15" fontWeight="700">{label}</text>;
        })}
      </svg>
    </section>
  );
});
