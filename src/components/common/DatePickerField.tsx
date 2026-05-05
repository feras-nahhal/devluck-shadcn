"use client";

import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;

  // ✅ NEW
  error?: string;
  required?: boolean;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
}) => {
  const date = value ? new Date(value) : undefined;

  const buttonClass = error
    ? "border-red-500 text-red-500 focus:ring-red-500"
    : "";

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Label */}
      <span className="text-sm font-medium text-muted-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </span>

      {/* Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`justify-start w-full ${buttonClass}`}
          >
            {date ? format(date, "PPP") : "Select date"}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(val) => {
              if (val instanceof Date) {
                const year = val.getFullYear();
                const month = String(val.getMonth() + 1).padStart(2, "0");
                const day = String(val.getDate()).padStart(2, "0");

                onChange(`${year}-${month}-${day}`);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 ml-1">{error}</p>
      )}
    </div>
  );
};

export default DatePickerField;