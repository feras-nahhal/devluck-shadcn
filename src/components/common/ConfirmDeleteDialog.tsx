"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  title?: string;
  description?: string;
  isDeleting?: boolean;
}

export function ConfirmDeleteDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  title = "Delete chat",
  description = "This will permanently delete this chat conversation. View Settings delete any memories saved during this chat.",
  isDeleting = false,
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[calc(100%-32px)] max-w-[420px] overflow-hidden rounded-3xl border-border bg-card p-6 shadow-2xl">
        {/* HEADER */}
        <AlertDialogHeader className="flex flex-col items-center">

          {/* ICON */}
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
            <Trash2 className="h-8 w-8 text-destructive" strokeWidth={1.5} />
          </div>

          <AlertDialogTitle className="text-center text-[20px] font-bold tracking-tight text-foreground">
            {title}?
          </AlertDialogTitle>

          <AlertDialogDescription className="mt-2 text-center text-[14px] leading-relaxed text-muted-foreground">
            {description.split("Settings").map((part, i, arr) => (
              <React.Fragment key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className="font-semibold text-foreground underline cursor-pointer hover:text-primary transition-colors">
                    Settings
                  </span>
                )}
              </React.Fragment>
            ))}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* FOOTER */}
        <div className="flex gap-3 bg-muted/20 ">

          <AlertDialogCancel
            disabled={isDeleting}
            className="h-11 flex-1 rounded-xl border border-border bg-background text-sm font-semibold text-foreground transition hover:bg-muted focus:ring-0"
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className={cn(
              "h-11 flex-1 rounded-xl text-sm font-semibold transition focus:ring-0",
              "bg-destructive/90 hover:bg-destructive/80",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Delete"
            )}
          </AlertDialogAction>

        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}