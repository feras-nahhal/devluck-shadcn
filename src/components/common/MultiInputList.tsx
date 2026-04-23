"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

type MultiInputListProps = {
  label: string;
  items: string[];
  setItems: (items: string[]) => void;
};

export const MultiInputList: React.FC<MultiInputListProps> = ({
  label,
  items,
  setItems,
}) => {
  const [currentValue, setCurrentValue] = useState("");

  const addItem = () => {
    const trimmed = currentValue.trim();
    if (!trimmed) return;

    if (items.includes(trimmed)) {
      setCurrentValue("");
      return;
    }

    setItems([...items, trimmed]);
    setCurrentValue("");
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Label */}
      <div className="text-sm font-medium text-muted-foreground">
        {label}
      </div>

      {/* Input + Button */}
      <div className="flex gap-2">
        <Input
          value={currentValue}
          placeholder={`Add ${label.toLowerCase()}`}
          onChange={(e) => setCurrentValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <Button
          type="button"
          onClick={addItem}
          disabled={!currentValue.trim()}
        >
          Add
        </Button>
      </div>

      {/* Items */}
      <div className="flex flex-wrap gap-2">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground italic">
            No {label.toLowerCase()} added yet
          </p>
        )}

        {items.map((item, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-2"
          >
            {item}

            <button
              type="button"
              onClick={() => removeItem(index)}
              className="ml-1 hover:text-red-500 transition-colors"
            >
              <X size={14} />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};