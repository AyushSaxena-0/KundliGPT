"use client";

import React from "react";
import { Avatar } from "../ui/avatar";

export function TypingIndicator() {
  return (
    <div className="flex w-full gap-3 p-4 md:p-6 justify-start">
      <Avatar role="model" className="mt-0.5 border-border" />
      
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1.5 text-xs text-mutedText">
          <span className="font-semibold font-display">Vedic Astrologer</span>
          <span>•</span>
          <span className="text-accent animate-pulse">Consulting charts...</span>
        </div>

        {/* Bouncing dots bubble */}
        <div className="rounded-2xl px-4 py-3 bg-card border border-border/80 rounded-tl-none glass-card w-16 flex items-center justify-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary animate-typing-1" />
          <span className="h-2 w-2 rounded-full bg-primary animate-typing-2" />
          <span className="h-2 w-2 rounded-full bg-primary animate-typing-3" />
        </div>
      </div>
    </div>
  );
}

export default TypingIndicator;
