"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  LayoutGrid, 
  List, 
  X, 
  Filter, 
  Check, 
  ChevronDown 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";

type ViewMode = "grid" | "list";

interface FilterBarProps<T extends string> {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedStatuses: T[];
  toggleStatus: (status: T) => void;
  availableStatuses: T[];
  placeholder?: string;
  filterLabel?: string; // New Prop for dynamic labeling
}

export function SearchAndFilterAndViewBar<T extends string>({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  selectedStatuses,
  toggleStatus,
  availableStatuses,
  placeholder = "Search...",
  filterLabel = "Filter By Status", // Default value
}: FilterBarProps<T>) {
  const [isFocused, setIsFocused] = React.useState(false);

  // Check if "All" is selected to handle visual logic
  const isFiltering =
    selectedStatuses.length > 0 &&
    !selectedStatuses.includes("All" as T);
 const [open, setOpen] = React.useState(false);
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 w-full">
        
        {/* LEFT: SEARCH & FILTER COMBO */}
        <div className="flex items-center gap-3 w-full max-w-2xl">
          <motion.div 
            animate={isFocused ? { scale: 1.01 } : { scale: 1 }}
            className="relative group flex-1"
          >
            <div/>
            
            <div className="relative flex items-center">
              <Search className={cn(
                "absolute left-4 w-4 h-4 transition-colors duration-300 z-10",
                isFocused || searchQuery ? "text-primary" : "text-muted-foreground/50"
              )} />
              
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

              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 p-1 rounded-md hover:bg-muted text-muted-foreground"
                  >
                    <X className="w-3.5 h-3.5 text-primary" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* COMPACT FILTER DROPDOWN */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-11 px-4 flex items-center gap-2 rounded-xl",
                  "border-muted bg-background/50 backdrop-blur-md",
                  "hover:bg-muted/50 transition-all font-bold text-[11px] uppercase tracking-wider shadow-sm",
                  isFiltering && "border-primary/50 bg-primary/5 text-primary"
                )}
              >
                <Filter className="w-4 h-4" />

                <span className="hidden sm:inline">Filter</span>

                {isFiltering && (
                  <Badge className="h-4 min-w-4 px-1 text-[9px] rounded-sm">
                    {selectedStatuses.length}
                  </Badge>
                )}

                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent
              align="end"
              className="w-64 p-0 rounded-xl border-border/50 backdrop-blur-xl bg-background/95"
            >
              <Command>
                {/* 🔍 SEARCH */}
                <CommandInput placeholder="Search status..." />

                <CommandList>
                  <CommandEmpty>No status found.</CommandEmpty>

                  <CommandGroup heading={filterLabel}>
                    {availableStatuses.map((status) => {
                        const isSelected = selectedStatuses.includes(status);

                        return (
                          <CommandItem
                            key={status}
                            onSelect={() => toggleStatus(status)}
                            className="flex items-center justify-between"
                          >
                            <span>{status}</span>

                            <Check
                              className={cn(
                                "w-4 h-4 transition-opacity",
                                isSelected ? "opacity-100 text-primary" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        );
                      })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
             viewMode === "list" ? "text-primary" : "hover:text-foreground/70"
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

      {/* NEW: VISIBLE ACTIVE TAGS FOR EASY UNSUBSCRIBE/CLEAR */}
      <AnimatePresence>
        {isFiltering && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-wrap gap-2 px-1 overflow-hidden"
          >
            {selectedStatuses.map((status) => (
              <Badge 
                key={status}
                variant="secondary"
                className="pl-2 pr-1 py-1 flex items-center gap-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
              >
                {status}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleStatus(status);
          }}
          className="ml-1 flex items-center justify-center rounded-sm hover:bg-muted/50 p-0.5"
        >
          <X className="w-3 h-3 hover:text-destructive transition-colors" />
        </button>
              </Badge>
            ))}
            <button 
              onClick={() => toggleStatus("All" as T)}
              className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors px-2"
            >
              Clear All
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ViewButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-background rounded-lg shadow-sm border border-border/50 -z-10"
          transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
        />
      )}
    </button>
  );
}