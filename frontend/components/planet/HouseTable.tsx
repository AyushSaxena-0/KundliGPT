"use client";

import React, { memo } from "react";
import { AstrologyDashboardData } from "../../types/astrology";
import { strengthTone } from "../../lib/chartCalculations";

export const HouseTable = memo(function HouseTable({ data }: { data: AstrologyDashboardData }) {
  return (
    <section className="astro-panel" aria-label="House table">
      <h3 className="astro-panel-title">House Table</h3>
      <div className="max-h-[360px] overflow-auto">
        <table className="w-full min-w-[780px] text-left text-xs">
          <thead className="sticky top-0 bg-[#111121] text-mutedText">
            <tr>
              {["House", "Sign", "Lord", "Occupants", "Strength", "Meaning", "Interpretation"].map((head) => (
                <th key={head} className="px-3 py-2 font-semibold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.houses.map((house) => (
              <tr key={house.house} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="px-3 py-2 font-semibold text-white">{house.house}</td>
                <td className="px-3 py-2">{house.sign}</td>
                <td className="px-3 py-2">{house.lord}</td>
                <td className="px-3 py-2">{house.occupants.length ? house.occupants.join(", ") : "None"}</td>
                <td className="px-3 py-2"><span className={`rounded border px-2 py-1 ${strengthTone(house.strength)}`}>{house.strength}%</span></td>
                <td className="px-3 py-2">{house.meaning}</td>
                <td className="px-3 py-2 text-mutedText">{house.interpretation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
});
