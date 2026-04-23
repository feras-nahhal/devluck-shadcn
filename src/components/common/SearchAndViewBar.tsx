"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LayoutGrid, List, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";

interface SearchAndViewBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  placeholder?: string;
}

export function SearchAndViewBar({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  placeholder = "Search opportunities...",
}: SearchAndViewBarProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full">
      
{/* SEARCH SECTION */}
      <div className="relative group w-full max-w-lg">
        {/* The Studio Glow: This mimics the soft shadow from your reference image */}
        <div className={cn(
          "absolute -inset-[1px] rounded-[13px] transition-all duration-300 blur-[2px] -z-10",
          isFocused 
            ? "bg-foreground/10 opacity-100" 
            : "bg-transparent opacity-0"
        )} />
        
        <div className="relative flex items-center">
          {/* Search Icon */}
          <motion.div
            animate={isFocused ? { color: "oklch(var(--foreground))" } : { color: "oklch(var(--muted-foreground) / 0.4)" }}
            className="absolute left-4 z-20 pointer-events-none"
          >
              <Search className={cn(
                "w-4 h-4 transition-colors duration-300 ",
                isFocused || searchQuery ? "text-primary" : "text-muted-foreground/50"
              )} />
          </motion.div>
          
          <Input
            value={searchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "h-11 pl-11 pr-10 rounded-xl transition-all duration-200  bg-background ",
              "border-border/60 hover:border-border",
              "placeholder:text-muted-foreground/40 text-sm"
            )}
          />

          {/* Clear Button */}
          <AnimatePresence>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-2 z-20"
              >
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-all duration-200"
                >
                  <X className="w-3.5 h-3.5 text-primary" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* VIEW TOGGLE SECTION */}
<div className="flex w-full md:w-auto h-12 items-center justify-between md:justify-center rounded-xl bg-muted/60 p-1 border-border/30 text-muted-foreground">
  <button
    onClick={() => setViewMode("grid")}
className={cn(
  "relative flex-1 md:flex-initial flex items-center justify-center gap-2.5 px-4 md:px-6 h-full text-sm font-semibold transition-all duration-300 z-10",
  viewMode === "grid" ? "text-primary" : "hover:text-foreground/70"
)}
  >
    <LayoutGrid className={cn("w-4 h-4 transition-colors", viewMode === "grid" ? "text-primary" : "text-muted-foreground/60")} />
    <span>Cards</span>
    
    {viewMode === "grid" && (
      <motion.div
        layoutId="activeView"
        className="absolute inset-0 bg-background rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.08),0_0_1px_rgba(0,0,0,0.1)] border border-border/40 -z-10"
        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
      />
    )}
  </button>

  <button
    onClick={() => setViewMode("list")}
className={cn(
  "relative flex-1 md:flex-initial flex items-center justify-center gap-2.5 px-4 md:px-6 h-full text-sm font-semibold transition-all duration-300 z-10",
  viewMode === "grid" ? "text-primary" : "hover:text-foreground/70"
)}
  >
    <List className={cn("w-4 h-4 transition-colors", viewMode === "list" ? "text-primary" : "text-muted-foreground/60")} />
    <span>List</span>
    
    {viewMode === "list" && (
      <motion.div
        layoutId="activeView"
        className="absolute inset-0 bg-background rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.08),0_0_1px_rgba(0,0,0,0.1)] border border-border/40 -z-10"
        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
      />
    )}
  </button>
</div>
    </div>
  );
}