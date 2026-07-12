"use client";

import React, { memo, useState } from "react";
import { AstrologyDashboardData } from "../../types/astrology";
import { planetGlyphs } from "../../lib/chartCalculations";

const order = [12, 1, 2, 3, 11, 0, 0, 4, 10, 0, 0, 5, 9, 8, 7, 6];

export const SouthIndianChart = memo(function SouthIndianChart({ data }: { data: AstrologyDashboardData }) {
  const [activeHouse, setActiveHouse] = useState<number | null>(null);
  return (
    <section aria-label="South Indian chart" className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-white">South Indian Chart</h3>
        <p className="text-2xs text-mutedText">Click a house to highlight placements.</p>
      </div>
      <svg viewBox="0 0 640 640" role="img" aria-label="South Indian chart" className="aspect-square w-full rounded-lg border border-white/10 bg-[#070713]">
        {order.map((house, index) => {
          const x = (index % 4) * 160;
          const y = Math.floor(index / 4) * 160;
          const planets = house ? data.planets.filter((p) => p.house === house) : [];
          const isActive = activeHouse === house;
          return (
            <g key={`${house}-${index}`} onClick={() => house && setActiveHouse(house)} tabIndex={house ? 0 : -1} aria-label={house ? `House ${house}` : "Chart center"}>
              <rect x={x} y={y} width="160" height="160" fill={house ? (isActive ? "#2b2157" : "#121225") : "#09090f"} stroke="#c79a35" strokeWidth="2" />
              {house ? (
                <>
                  <text x={x + 12} y={y + 24} fill="#f6d77a" fontSize="17" fontWeight="700">{house}</text>
                  <text x={x + 80} y={y + 72} textAnchor="middle" fill="#b8a7ff" fontSize="13">{data.houses.find((h) => h.house === house)?.sign}</text>
                  {planets.map((planet, pIndex) => (
                    <text key={planet.name} x={x + 80} y={y + 96 + pIndex * 18} textAnchor="middle" fill="#fff" fontSize="16">
                      {planetGlyphs[planet.name] || planet.name.slice(0, 2)}
                    </text>
                  ))}
                </>
              ) : (
                <text x={x + 80} y={y + 84} textAnchor="middle" fill="#706a8f" fontSize="12">Kendra</text>
              )}
            </g>
          );
        })}
      </svg>
    </section>
  );
});
