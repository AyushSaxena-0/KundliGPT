"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Compass, 
  Info, 
  Shield, 
  FileText, 
  Sparkles,
  CalendarDays,
  Settings,
  Heart
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { useChat } from "../../hooks/useChat";
import { Dialog } from "../ui/dialog";
import { BirthDetailsForm } from "../chat/BirthDetailsForm";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { resetConversation, birthDetails } = useChat();
  const [isBirthDetailsOpen, setIsBirthDetailsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatBirthDetailsSummary = () => {
    if (!isMounted || !birthDetails.name) return "Enter Birth Details";
    return `${birthDetails.name} (${birthDetails.date_of_birth || "Chart Info"})`;
  };

  const navLinks = [
    { name: "Astrologer Chat", href: "/chat", icon: Compass },
    { name: "Marriage Matching", href: "/marriage-matching", icon: Heart },
    { name: "About Jyotish", href: "/about", icon: Info },
    { name: "Privacy Policy", href: "/privacy", icon: Shield },
    { name: "Terms of Service", href: "/terms", icon: FileText },
  ];

  return (
    <>
      <motion.aside
        animate={{ width: isOpen ? 260 : 70 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "hidden md:flex flex-col h-[calc(100vh-64px)] border-r border-border/80 bg-background/90 backdrop-blur-md select-none relative shrink-0",
          { "px-4": isOpen, "px-2": !isOpen }
        )}
      >
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-3 top-5 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-mutedText hover:text-white transition-all shadow-md focus:outline-none"
          title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        {/* Action: New Session */}
        <div className="mt-5 mb-4">
          {isOpen ? (
            <Button
              onClick={resetConversation}
              className="w-full flex items-center justify-center gap-2"
              variant="primary"
            >
              <Plus className="h-4 w-4" />
              <span>New Reading</span>
            </Button>
          ) : (
            <button
              onClick={resetConversation}
              className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-white transition-all focus:outline-none"
              title="Start New Reading"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Profile/Birth Details trigger */}
        <div className="mb-4">
          {isOpen ? (
            <button
              onClick={() => setIsBirthDetailsOpen(true)}
              className="w-full text-left p-3 rounded-lg border border-border bg-card/40 hover:bg-card transition-all flex items-center gap-3 focus:outline-none"
            >
              <CalendarDays className="h-5 w-5 text-accent shrink-0" />
              <div className="overflow-hidden">
                <p className="text-xs font-semibold uppercase tracking-wider text-mutedText">My Profile</p>
                <p className="text-sm font-medium text-white truncate max-w-[170px]">
                  {formatBirthDetailsSummary()}
                </p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setIsBirthDetailsOpen(true)}
              className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card/40 hover:bg-card text-accent transition-all focus:outline-none"
              title="Edit Birth Chart Details"
            >
              <CalendarDays className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border/80 my-2" />

        {/* Sidebar Nav Links */}
        <nav className="flex-1 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return isOpen ? (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive 
                    ? "bg-secondary text-accent" 
                    : "text-mutedText hover:text-white hover:bg-card"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{link.name}</span>
              </Link>
            ) : (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "mx-auto flex h-10 w-10 items-center justify-center rounded-lg transition-all",
                  isActive 
                    ? "bg-secondary text-accent border border-accent/20" 
                    : "text-mutedText hover:text-white hover:bg-card"
                )}
                title={link.name}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          })}
        </nav>

        {/* Future features reminder / footer */}
        {isOpen && (
          <div className="p-3 mb-4 rounded-lg bg-secondary/30 border border-border/40 text-xs text-mutedText">
            <div className="flex items-center gap-1.5 font-semibold text-white mb-1">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span>Future Updates</span>
            </div>
            <p className="leading-normal">
              Kundli chart rendering, Dasha transit tables, and daily horoscope modules.
            </p>
          </div>
        )}
      </motion.aside>

      {/* Birth Details Dialog wrapper */}
      <Dialog
        isOpen={isBirthDetailsOpen}
        onClose={() => setIsBirthDetailsOpen(false)}
        title="Update Birth Chart Profile"
      >
        <BirthDetailsForm onSuccess={() => setIsBirthDetailsOpen(false)} />
      </Dialog>
    </>
  );
}

export default Sidebar;
