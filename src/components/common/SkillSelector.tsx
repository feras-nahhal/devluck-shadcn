"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SkillPill {
  key: string;
  label: string;
}

interface SkillSelectorProps {
  label: string;
  options: SkillPill[];
  selected: string[];
  onChange: (selected: string[]) => void;
  allowCustom?: boolean;

  // ✅ NEW
  error?: string;
  required?: boolean;
}

export const SkillSelector: React.FC<SkillSelectorProps> = ({
  label,
  options,
  selected = [],
  onChange,
  allowCustom = false,
  error,
  required = false,
}) => {
  const [customSkill, setCustomSkill] = React.useState("");

  const allOptions = React.useMemo(() => {
    const normalized = new Map<string, SkillPill>();
    [...options, ...selected.map((skill) => ({ key: skill, label: skill }))]
      .forEach((skill) => normalized.set(skill.key.toLowerCase(), skill));

    return Array.from(normalized.values());
  }, [options, selected]);

  const toggle = (key: string) => {
    if (selected.includes(key)) {
      onChange(selected.filter((k) => k !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  const addCustomSkill = () => {
    const value = customSkill.trim();
    if (!value) return;

    if (!selected.includes(value)) {
      onChange([...selected, value]);
    }

    setCustomSkill("");
  };

  const inputClass = error
    ? "border-red-500 focus-visible:ring-red-500"
    : "";

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Label */}
      <label className="text-sm font-medium text-muted-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Pills */}
      <div className="flex flex-wrap gap-2">
        {allOptions.map((skill) => {
          const active = selected.includes(skill.key);

          return (
            <Button
              key={skill.key}
              type="button"
              variant={active ? "default" : "outline"}
              onClick={() => toggle(skill.key)}
              className="h-9 px-3 text-sm rounded-full"
            >
              {skill.label}
            </Button>
          );
        })}
      </div>

      {/* Custom input */}
      {allowCustom && (
        <div className="flex gap-2">
          <Input
            placeholder="Add custom skill"
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomSkill();
              }
            }}
            className={inputClass}
          />

          <Button type="button" variant="outline" onClick={addCustomSkill}>
            Add
          </Button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 ml-1">{error}</p>
      )}
    </div>
  );
};