"use client";

import React from "react";
import Link from "next/link";
import { Compass, HelpCircle } from "lucide-react";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background px-4 text-center select-none relative overflow-hidden min-h-[calc(100vh-64px)]">
      
      {/* Glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 space-y-6 max-w-md">
        {/* Animated lost logo */}
        <div className="relative h-24 w-24 mx-auto flex items-center justify-center rounded-full bg-card border border-border/80 shadow-lg">
          <Compass className="h-12 w-12 text-primary animate-spin-slow" />
          <HelpCircle className="absolute -top-1 -right-1 h-6 w-6 text-accent animate-bounce" />
        </div>

        <h1 className="text-6xl font-extrabold tracking-tight text-white font-display">404</h1>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-white">Lost in the Cosmos</h2>
        <p className="text-sm text-mutedText max-w-sm mx-auto leading-relaxed">
          The celestial charts do not list this coordinate. You have drifted into uncharted orbital space.
        </p>

        <div className="pt-4">
          <Link href="/">
            <Button variant="primary" size="md">
              Return to Earth
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
