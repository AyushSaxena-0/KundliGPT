"use client";

import React, { memo, useState } from "react";
import { AstrologyDashboardData, AspectItem } from "../../types/astrology";
import { getAspectMatrix } from "../../lib/chartCalculations";

export const AspectMatrix = memo(function AspectMatrix({ data }: { data: AstrologyDashboardData }) {
  const [selected, setSelected] = useState<AspectItem | null>(null);
  const aspects = getAspectMatrix(data);
  const planets = data.planets.map((p) => p.name);
  const lookup = new Map(aspects.map((a) => [`${a.from}-${a.to}`, a]));

  return (
    <section className="astro-panel" aria-label="Aspect matrix">
      <h3 className="astro-panel-title">Aspect Chart</h3>
      <div className="overflow-auto">
        <table className="w-full min-w-[620px] text-center text-2xs">
          <thead>
            <tr>
              <th className="p-2 text-left text-mutedText">Planet</th>
              {planets.map((planet) => <th key={planet} className="p-2 text-mutedText">{planet.slice(0, 3)}</th>)}
            </tr>
          </thead>
          <tbody>
            {planets.map((from) => (
              <tr key={from} className="border-t border-white/5">
                <td className="p-2 text-left font-semibold text-white">{from}</td>
                {planets.map((to) => {
                  const aspect = lookup.get(`${from}-${to}`) || lookup.get(`${to}-${from}`);
                  const cls = aspect?.type === "Positive" ? "bg-emerald-400/20 text-emerald-200" : aspect?.type === "Challenging" ? "bg-rose-400/20 text-rose-200" : aspect ? "bg-white/10 text-mutedText" : "bg-transparent";
                  return (
                    <td key={to} className="p-1">
                      <button disabled={!aspect} onClick={() => aspect && setSelected(aspect)} className={`h-8 w-10 rounded ${cls}`} aria-label={aspect ? `${from} ${aspect.type} aspect ${to}` : "No aspect"}>
                        {from === to ? "-" : aspect ? aspect.angle : ""}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && (
        <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-xs text-mutedText">
          <strong className="text-white">{selected.from} to {selected.to}</strong> · {selected.type} · {selected.interpretation}
        </div>
      )}
    </section>
  );
});
