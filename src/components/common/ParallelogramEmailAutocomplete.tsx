"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Suggestion {
  id: string;
  email: string;
  name?: string;
}

type Props = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  suggestions: Suggestion[];
  isLoading: boolean;
  onSuggestionSelect: (email: string, name: string) => void;

  // ✅ NEW
  error?: string;
  required?: boolean;
  disabled?: boolean;
};

export const ParallelogramEmailAutocomplete = ({
  label,
  placeholder,
  value,
  onChange,
  suggestions,
  isLoading,
  onSuggestionSelect,
  error,
  required = false,
  disabled = false,
}: Props) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* ---------------- outside click ---------------- */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------- show/hide ---------------- */
  useEffect(() => {
    if (suggestions.length > 0 && value.length >= 1) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [suggestions, value]);

  /* ---------------- keyboard ---------------- */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;

      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const selected = suggestions[selectedIndex];
          onSuggestionSelect(selected.email, selected.name || "");
          setShowDropdown(false);
          setSelectedIndex(-1);
        }
        break;

      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (s: Suggestion) => {
    onSuggestionSelect(s.email, s.name || "");
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const inputClass = error
    ? "border-red-500 focus-visible:ring-red-500"
    : "";

  return (
    <div className="relative w-full space-y-2">
      {/* Label */}
      <label className="text-xs font-medium text-muted-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Input */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="email"
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={inputClass}
          onFocus={() => {
            if (suggestions.length > 0 && value.length >= 1) {
              setShowDropdown(true);
            }
          }}
        />

        {isLoading && (
          <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 ml-1">{error}</p>
      )}

      {/* Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-md overflow-hidden"
        >
          <ScrollArea className="h-[100px] w-full">
            <div className="p-1">
              {suggestions.map((s, index) => (
                <div
                  key={s.id}
                  onClick={() => handleSuggestionClick(s)}
                  className={`cursor-pointer px-3 py-2 text-sm transition rounded-sm
                    ${
                      index === selectedIndex
                        ? "bg-muted font-medium"
                        : "hover:bg-muted/50"
                    }`}
                >
                  <div className="text-foreground">{s.email}</div>
                  {s.name && (
                    <div className="text-xs text-muted-foreground">
                      {s.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};