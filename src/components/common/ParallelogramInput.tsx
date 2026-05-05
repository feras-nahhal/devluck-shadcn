"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  label: string;
  placeholder: string;
  value: string|number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: "text" | "email" | "password" | "number" | "textarea";

  // ✅ NEW
  error?: string;
  required?: boolean;
};

export const ParallelogramInput = ({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  type = "text",
  error,
  required = false,
}: Props) => {
  const inputClass = error
    ? "border-red-500 focus-visible:ring-red-500"
    : "";

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Label */}
      <label className="text-sm font-medium text-muted-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Input */}
      {type === "textarea" ? (
        <Textarea
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`resize-none ${inputClass}`}
        />
      ) : (
        <Input
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={inputClass}
        />
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-500 ml-1">{error}</p>
      )}
    </div>
  );
};