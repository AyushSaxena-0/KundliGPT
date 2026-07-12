"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Menu, X, Github, Search } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { SearchModal } from "./SearchModal";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Chat", href: "/chat" },
    { name: "Marriage Matching", href: "/marriage-matching" },
    { name: "About", href: "/about" },
    { name: "Privacy", href: "/privacy" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/70 backdrop-blur-md transition-all select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo & Name */}
          <Link href="/" className="flex items-center gap-2 text-white hover:text-accent transition-all group">
            <Compass className="h-6 w-6 text-primary group-hover:rotate-45 transition-transform duration-300" />
            <span className="font-semibold text-lg tracking-wide font-display">
              AI Vedic Astrologer
            </span>
          </Link>

          {/* Desktop Navigation links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "text-sm font-medium hover:text-white transition-all",
                  pathname === link.href ? "text-accent border-b border-accent pb-1" : "text-mutedText"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Action buttons (Search, Github & Chat CTA) */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-mutedText hover:text-white p-1.5 rounded-lg hover:bg-card transition-all focus:outline-none"
              title="Search Site Content"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-mutedText hover:text-white p-1.5 rounded-lg hover:bg-card transition-all"
              aria-label="GitHub Repository"
            >
              <Github className="h-5 w-5" />
            </a>
            
            <Link href="/chat">
              <Button size="sm">Start Consultation</Button>
            </Link>
          </div>

          {/* Mobile Menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-mutedText hover:text-white hover:bg-card focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3 shadow-xl">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "px-3 py-2 rounded-lg text-md font-medium transition-all",
                  pathname === link.href ? "bg-secondary text-accent" : "text-mutedText hover:text-white hover:bg-card"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center gap-4 pt-3 border-t border-border justify-between">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-mutedText hover:text-white p-2 rounded-lg flex items-center gap-2"
            >
              <Github className="h-5 w-5" />
              <span className="text-sm">GitHub</span>
            </a>
            <Link href="/chat" onClick={() => setMobileMenuOpen(false)}>
              <Button size="sm">Start Chat</Button>
            </Link>
          </div>
        </div>
      )}
      
      {/* Search Modal overlay */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}

export default Header;
