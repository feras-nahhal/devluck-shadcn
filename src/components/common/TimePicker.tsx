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
}

const hours = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0")
);

const minutes = ["00", "15", "30", "45"];
const periods: TimeValue["period"][] = ["AM", "PM"];

export function TimePicker({ value, onChange }: TimePickerProps) {
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
    <div className="flex gap-2">
      {/* Hour */}
      <Select value={time.hour} onValueChange={(v) => update({ hour: v })}>
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
      <Select value={time.minute} onValueChange={(v) => update({ minute: v })}>
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
      <Select value={time.period} onValueChange={(v) => update({ period: v as any })}>
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
  );
}