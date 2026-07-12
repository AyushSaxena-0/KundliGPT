"use client";

import React, { memo, useRef, useState } from "react";
import { Download, FileImage, Printer, ZoomIn, ZoomOut } from "lucide-react";
import { AstrologyDashboardData } from "../../types/astrology";
import { exportSvg, exportSvgAsPng } from "../../lib/chartRenderer";
import { planetGlyphs } from "../../lib/chartCalculations";

interface Props {
  data: AstrologyDashboardData;
}

const houses = [
  { n: 1, p: "450,80 620,250 450,420 280,250", t: [450, 245] },
  { n: 2, p: "280,80 450,80 280,250 110,250", t: [275, 165] },
  { n: 3, p: "110,250 280,250 280,420 110,420", t: [190, 335] },
  { n: 4, p: "110,420 280,420 450,590 280,760", t: [280, 585] },
  { n: 5, p: "280,760 450,590 620,760", t: [450, 690] },
  { n: 6, p: "620,760 450,590 620,420 790,420", t: [625, 585] },
  { n: 7, p: "620,420 450,420 280,590 450,590", t: [450, 500] },
  { n: 8, p: "620,420 790,420 790,250 620,250", t: [710, 335] },
  { n: 9, p: "620,250 790,250 620,80 450,80", t: [625, 165] },
  { n: 10, p: "450,80 620,250 450,420 280,250", t: [450, 330] },
  { n: 11, p: "280,250 450,420 280,590 110,420", t: [280, 420] },
  { n: 12, p: "620,250 790,420 620,590 450,420", t: [620, 420] },
];

export const NorthIndianKundli = memo(function NorthIndianKundli({ data }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [zoom, setZoom] = useState(1);

  return (
    <section className="h-full min-h-[420px]" aria-label="North Indian Kundli chart">
      <div className="mb-3 flex items-center justify-between gap-2 no-print">
        <div>
          <h3 className="text-sm font-semibold text-white">Kundli</h3>
          <p className="text-2xs text-mutedText">North Indian diamond chart</p>
        </div>
        <div className="flex items-center gap-1">
          <button className="astro-icon-btn" onClick={() => setZoom((z) => Math.max(0.75, z - 0.1))} aria-label="Zoom out"><ZoomOut size={15} /></button>
          <button className="astro-icon-btn" onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))} aria-label="Zoom in"><ZoomIn size={15} /></button>
          <button className="astro-icon-btn" onClick={() => exportSvg(svgRef.current, "north-indian-kundli.svg")} aria-label="Export SVG"><Download size={15} /></button>
          <button className="astro-icon-btn" onClick={() => exportSvgAsPng(svgRef.current, "north-indian-kundli.png")} aria-label="Export PNG"><FileImage size={15} /></button>
          <button className="astro-icon-btn" onClick={() => window.print()} aria-label="Print chart"><Printer size={15} /></button>
        </div>
      </div>
      <div className="overflow-auto rounded-lg border border-white/10 bg-[#070713]/70 p-2">
        <svg
          ref={svgRef}
          viewBox="0 0 900 840"
          role="img"
          aria-label={`North Indian Kundli. Lagna ${data.kundli.ascendant}`}
          className="mx-auto aspect-square max-h-[620px] w-full transition-transform duration-300"
          style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
        >
          <defs>
            <linearGradient id="kundliGold" x1="0" x2="1">
              <stop offset="0" stopColor="#c79a35" />
              <stop offset="1" stopColor="#f6d77a" />
            </linearGradient>
          </defs>
          <rect width="900" height="840" fill="#09090f" />
          <g fill="rgba(28,22,54,.72)" stroke="url(#kundliGold)" strokeWidth="2">
            {houses.map((house) => {
              const planets = data.planets.filter((p) => p.house === house.n);
              return (
                <g key={house.n} tabIndex={0} className="outline-none">
                  <polygon points={house.p} className="transition-opacity hover:opacity-80" />
                  <title>{`House ${house.n}: ${planets.map((p) => p.name).join(", ") || "No planets"}`}</title>
                  <text x={house.t[0]} y={house.t[1] - 32} textAnchor="middle" fill="#f6d77a" fontSize="18" fontWeight="700">{house.n}</text>
                  {house.n === 1 && <text x={house.t[0]} y={house.t[1] - 8} textAnchor="middle" fill="#b8a7ff" fontSize="15">Lagna</text>}
                  {planets.map((planet, index) => (
                    <text key={planet.name} x={house.t[0]} y={house.t[1] + 16 + index * 22} textAnchor="middle" fill="#ffffff" fontSize="18">
                      {planetGlyphs[planet.name] || planet.name.slice(0, 2)}
                    </text>
                  ))}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </section>
  );
});
