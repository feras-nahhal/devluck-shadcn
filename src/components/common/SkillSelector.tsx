"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

interface SkillPill {
  key: string;
  label: string;
}

interface SkillSelectorProps {
  label: string;
  options: SkillPill[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export const SkillSelector: React.FC<SkillSelectorProps> = ({
  label,
  options,
  selected = [],
  onChange,
}) => {
  const toggle = (key: string) => {
    if (selected.includes(key)) {
      onChange(selected.filter((k) => k !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Label */}
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>

      {/* Pills */}
      <div className="flex flex-wrap gap-2">
        {options.map((skill) => {
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
    </div>
  );
};