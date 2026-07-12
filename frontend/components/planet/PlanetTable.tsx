"use client";

import React, { memo } from "react";
import { AstrologyDashboardData } from "../../types/astrology";
import { formatDegree, strengthTone } from "../../lib/chartCalculations";

export const PlanetTable = memo(function PlanetTable({ data }: { data: AstrologyDashboardData }) {
  return (
    <section className="astro-panel" aria-label="Planet table">
      <h3 className="astro-panel-title">Planet Table</h3>
      <div className="max-h-[360px] overflow-auto">
        <table className="w-full min-w-[860px] text-left text-xs">
          <thead className="sticky top-0 bg-[#111121] text-mutedText">
            <tr>
              {["Planet", "Longitude", "Latitude", "Degree", "Sign", "House", "Nakshatra", "Pada", "Motion", "Retrograde", "Combust", "Exalted", "Debilitated"].map((head) => (
                <th key={head} className="px-3 py-2 font-semibold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.planets.map((planet) => (
              <tr key={planet.name} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="px-3 py-2 font-semibold text-white">{planet.name}</td>
                <td className="px-3 py-2">{formatDegree(planet.longitude)}</td>
                <td className="px-3 py-2">{planet.latitude?.toFixed(2) ?? "0.00"}</td>
                <td className="px-3 py-2">{formatDegree(planet.degree)}</td>
                <td className="px-3 py-2">{planet.sign}</td>
                <td className="px-3 py-2">{planet.house}</td>
                <td className="px-3 py-2">{planet.nakshatra}</td>
                <td className="px-3 py-2">{planet.pada}</td>
                <td className="px-3 py-2">{planet.motion}</td>
                <td className="px-3 py-2">{planet.retrograde ? "Yes" : "No"}</td>
                <td className="px-3 py-2">{planet.combust ? "Yes" : "No"}</td>
                <td className="px-3 py-2">{planet.exalted ? "Yes" : "No"}</td>
                <td className="px-3 py-2">
                  <span className={`rounded border px-2 py-1 ${strengthTone(planet.strength)}`}>{planet.debilitated ? "Yes" : "No"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
});
