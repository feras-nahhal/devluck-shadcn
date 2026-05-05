"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TimeValue = {
  hour: string;
  minute: string;
  period: "AM" | "PM";
};

interface TimePickerProps {
  value?: string; // "HH:MM AM"
  onChange: (value: string) => void;

  // ✅ optional (for your new validation system)
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

const hours = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0")
);

const minutes = ["00", "15", "30", "45"];
const periods: TimeValue["period"][] = ["AM", "PM"];

export function TimePicker({
  value,
  onChange,
  label,
  required = false,
  error,
  disabled = false,
}: TimePickerProps) {
  const parse = (): TimeValue => {
    if (!value) return { hour: "12", minute: "00", period: "AM" };

    const [time, period] = value.split(" ");
    const [hour = "12", minute = "00"] = time?.split(":") || [];

    return {
      hour,
      minute,
      period: (period as TimeValue["period"]) || "AM",
    };
  };

  const [time, setTime] = useState<TimeValue>(parse());

  useEffect(() => {
    setTime(parse());
  }, [value]);

  const update = (next: Partial<TimeValue>) => {
    const updated = { ...time, ...next };
    setTime(updated);
    onChange(`${updated.hour}:${updated.minute} ${updated.period}`);
  };

  return (
    <div className="flex flex-col gap-2 w-full">

      {/* LABEL */}
      {label && (
        <label className="text-sm font-medium text-muted-foreground">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* PICKER */}
      <div className={`flex gap-2 ${disabled ? "opacity-60 pointer-events-none" : ""}`}>

        {/* Hour */}
        <Select
          value={time.hour}
          onValueChange={(v) => update({ hour: v })}
        >
          <SelectTrigger className="w-[90px]">
            <SelectValue placeholder="Hour" />
          </SelectTrigger>
          <SelectContent>
            {hours.map((h) => (
              <SelectItem key={h} value={h}>
                {h}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Minute */}
        <Select
          value={time.minute}
          onValueChange={(v) => update({ minute: v })}
        >
          <SelectTrigger className="w-[90px]">
            <SelectValue placeholder="Min" />
          </SelectTrigger>
          <SelectContent>
            {minutes.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* AM/PM */}
        <Select
          value={time.period}
          onValueChange={(v) => update({ period: v as "AM" | "PM" })}
        >
          <SelectTrigger className="w-[90px]">
            <SelectValue placeholder="AM/PM" />
          </SelectTrigger>
          <SelectContent>
            {periods.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ERROR */}
      {error && (
        <span className="text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}