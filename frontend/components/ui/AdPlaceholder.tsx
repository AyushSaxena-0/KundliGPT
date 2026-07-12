"use client";

import React from "react";
import { featureFlags } from "../../lib/featureFlags";

interface AdPlaceholderProps {
  slot: string; // e.g. "hero-bottom", "content-middle", "sidebar", "chat-bottom", "footer"
  className?: string;
}

export function AdPlaceholder({ slot, className }: AdPlaceholderProps) {
  const isEnabled = featureFlags.isEnabled("ads");

  if (!isEnabled) return null;

  let slotStyles = "w-full min-h-[90px]"; // default horizontal banner (Leaderboard)
  if (slot === "sidebar") {
    slotStyles = "w-full min-h-[300px] max-w-[300px]"; // vertical skyscraper
  } else if (slot === "content-middle") {
    slotStyles = "w-full min-h-[160px] my-6"; // large rectangle
  } else if (slot === "chat-bottom") {
    slotStyles = "w-full min-h-[90px] mt-4"; // horizontal banner
  }

  return (
    <div
      className={`glass-panel rounded-xl flex flex-col justify-between border border-border/80 bg-[#12131A] p-4 select-none overflow-hidden relative group transition-all duration-300 ${slotStyles} ${className || ""}`}
    >
      {/* Sponsored Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-2 w-full">
        <span className="text-[10px] tracking-widest font-mono uppercase text-accent font-semibold">★ Sponsored</span>
        <span className="text-[10px] font-sans text-mutedText/80 font-medium">Astrology Learning Partner</span>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col justify-center items-start text-left z-10 space-y-1 py-1">
        <h4 className="text-xs font-semibold text-white tracking-wide font-display group-hover:text-accent transition-colors">
          Unlock the Secrets of the Cosmos
        </h4>
        <p className="text-[11px] text-mutedText leading-relaxed max-w-xl">
          Master classical Parashara principles and birth chart alignments with online certification programs.
        </p>
      </div>

      {/* Footer/CTA */}
      <div className="flex items-center justify-between border-t border-border/40 pt-2 mt-2 w-full">
        <span className="text-[9px] font-mono text-mutedText/40">Slot: {slot}</span>
        <button className="text-[10px] font-semibold text-accent group-hover:text-white transition-colors hover:underline">
          Explore Program →
        </button>
      </div>

      {/* Subtle hover background animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-700" />
    </div>
  );
}

export default AdPlaceholder;
