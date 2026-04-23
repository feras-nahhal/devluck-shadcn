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
import { Trash2, Loader2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmWithdrawDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  title?: string;
  description?: string;
  isWithdraw?: boolean;
}

export function ConfirmWithdrawDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  title = "Delete chat",
  description = "This will permanently delete this chat conversation. View Settings delete any memories saved during this chat.",
  isWithdraw = false,
}: ConfirmWithdrawDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[400px] gap-0 overflow-hidden rounded-[28px] border-border bg-card p-0 shadow-2xl">
        <AlertDialogHeader className="flex flex-col items-center justify-center px-8 pb-8 pt-10">
          
          {/* ICON CONTAINER: Using OKLCH Destructive with Opacity */}
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 mx-auto">
            <LogOut className="h-7 w-7 text-amber-500" strokeWidth={1.5} />
          </div>

          <div className="space-y-3 text-center">
            <AlertDialogTitle className="text-[20px] font-bold tracking-tight text-foreground">
              {title}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[14px] font-medium leading-relaxed text-muted-foreground">
              {description.split("Settings").map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="text-foreground underline cursor-pointer font-bold hover:text-primary transition-colors">
                      Settings
                    </span>
                  )}
                </React.Fragment>
              ))}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        {/* ACTION AREA: Using muted backgrounds from your theme */}
        <div className="flex flex-row items-center gap-3 border-t border-border bg-muted/30 px-6 py-6">
          <AlertDialogCancel
            disabled={isWithdraw}
            className="m-0 h-11 flex-1 rounded-xl border border-border bg-card text-sm font-bold text-foreground transition-all hover:bg-muted focus:ring-0 cursor-pointer"
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isWithdraw}
            className={cn(
              "m-0 h-11 flex-1 rounded-xl border-none text-sm font-bold transition-all shadow-none focus:ring-0 cursor-pointer",
              "bg-destructive/10 text-destructive hover:bg-destructive"
            )}
          >
            {isWithdraw ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Withdraw"
            )}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}