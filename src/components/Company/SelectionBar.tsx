"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, XCircle, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SelectionBar1Props {
  selectedCount: number;
  isVisible: boolean;
  onClear: () => void;
  onAccept: () => void;
  onReject: () => void;
  onPending: () => void;
  className?: string;
}

export function SelectionBar1({
  selectedCount,
  isVisible,
  onClear,
  onAccept,
  onReject,
  onPending,
  className,
}: SelectionBar1Props) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 30, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 30, opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
          className={cn(
            "fixed bottom-6 left-1/2 z-50 -translate-x-1/2",
            className
          )}
        >
          <div
            className="
              flex items-center justify-between gap-6
              px-5 py-3
              rounded-2xl
              border
              bg-background/80 backdrop-blur-xl
              shadow-lg
              min-w-[360px]
            "
          >
            {/* LEFT SIDE */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                {selectedCount}
              </div>

              <div className="flex flex-col leading-tight">
                <span className="text-xs text-muted-foreground">
                  Selected
                </span>
                <span className="text-sm font-medium">
                  Bulk Actions
                </span>
              </div>
            </div>

            {/* RIGHT SIDE ACTIONS */}
            <div className="flex items-center gap-2">

              <Button
                variant="ghost"
                size="icon"
                onClick={onClear}
              >
                <X className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                className="gap-2"
                onClick={onAccept}
              >
                <Check className="w-4 h-4" />
                Accept
              </Button>

              <Button
                size="sm"
                variant="destructive"
                className="gap-2"
                onClick={onReject}
              >
                <XCircle className="w-4 h-4" />
                Reject
              </Button>

              <Button
                size="sm"
                variant="secondary"
                className="gap-2"
                onClick={onPending}
              >
                <Clock className="w-4 h-4" />
                Pending
              </Button>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}