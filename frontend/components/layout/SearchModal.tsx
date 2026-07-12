"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Compass, BookOpen, Star, HelpCircle, ArrowRight } from "lucide-react";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";
import { searchSite, SearchResult } from "../../lib/search";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      const searchResults = searchSite(query);
      setResults(searchResults);
    }, 150); // slight debounce for smooth typing
    return () => clearTimeout(timer);
  }, [query]);

  const handleItemClick = (url: string) => {
    onClose();
    setQuery("");
    router.push(url);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "blog": return <BookOpen className="h-4 w-4 text-emerald-400" />;
      case "zodiac": return <Star className="h-4 w-4 text-accent" />;
      case "tool": return <Compass className="h-4 w-4 text-primary" />;
      default: return <HelpCircle className="h-4 w-4 text-mutedText" />;
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Search Site Content">
      <div className="space-y-4">
        <div className="relative">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type search terms (e.g. Aries, Kundli, Nakshatra)..."
            className="pl-10"
            autoFocus
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-mutedText" />
        </div>

        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
          {query.trim().length > 0 && results.length === 0 ? (
            <p className="text-sm text-mutedText text-center py-6">No matching articles, tools, or signs found.</p>
          ) : query.trim().length === 0 ? (
            <div className="py-6 text-center text-xs text-mutedText space-y-1">
              <p>Type keywords to search across:</p>
              <p>• Zodiac signs (Aries, Taurus...)</p>
              <p>• Free astrology tools (Kundli, Career...)</p>
              <p>• Blog educational articles</p>
            </div>
          ) : (
            results.map((res) => (
              <button
                key={res.url}
                onClick={() => handleItemClick(res.url)}
                className="w-full text-left p-3 rounded-lg border border-border bg-card/30 hover:bg-secondary/50 hover:border-primary/40 transition-all flex items-center justify-between gap-3 focus:outline-none"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-1.5 rounded bg-secondary shrink-0">
                    {getIcon(res.type)}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-sm font-semibold text-white truncate">{res.title}</h4>
                    <p className="text-xs text-mutedText truncate max-w-[280px] md:max-w-[340px] mt-0.5">
                      {res.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-mutedText shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>
    </Dialog>
  );
}

export default SearchModal;
