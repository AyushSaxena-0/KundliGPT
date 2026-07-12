import React from "react";
import Link from "next/link";
import { Compass } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/80 bg-background py-8 select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          
          {/* Brand/Logo */}
          <div className="flex items-center gap-2 text-white">
            <Compass className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm tracking-wide font-display">
              AI Vedic Astrologer
            </span>
            <span className="text-xs text-mutedText ml-1">v1.0.0</span>
          </div>

          {/* Policy & Page Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-mutedText">
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>

          {/* Copyright/Made with */}
          <div className="text-center text-xs text-mutedText md:text-right">
            <p>© {currentYear} AI Vedic Astrologer. All rights reserved.</p>
            <p className="mt-1">
              Made with ❤️ for spiritual & mindful guidance.
            </p>
          </div>
          
        </div>
      </div>
    </footer>
  );
}

export default Footer;
