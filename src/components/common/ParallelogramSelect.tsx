"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type ParallelogramSelectProps = {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;

  // ✅ NEW
  error?: string;
  required?: boolean;
};

export const ParallelogramSelect = ({
  label,
  placeholder,
  value,
  options,
  onChange,
  error,
  required = false,
}: ParallelogramSelectProps) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Label */}
      <label className="text-sm font-medium text-muted-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Select */}
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger
          className={`w-full ${
            error ? "border-red-500 focus:ring-red-500" : ""
          }`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 ml-1">{error}</p>
      )}
    </div>
  );
};