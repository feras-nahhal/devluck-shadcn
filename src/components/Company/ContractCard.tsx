"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  MoreVertical,
  Clock,
  Search,
  CheckCircle2,
  ShieldAlert,
  Fingerprint,
  Calendar,
  Activity,
  Trash2,
  Eye,
  Edit,
  FileText,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";
import { InfoItem } from "../common/info-item";

/* ================= TYPES ================= */
type ContractStage = "running" | "evaluation" | "completed" | "disputed";

type ReportLink = {
  name: string;
  url: string;
};

type ReportFile = {
  name: string;
  url: string;
};

type ContractReport = {
  note: string;
  links: ReportLink[];
  files: ReportFile[];
};

interface ContractCardProps {
  contract: {
    id: string;
    title: string;
    salaryValue: string | number;
    startDate: string;
    endDate: string;
    status: string;
    currency: string;
    currentStage: ContractStage;
  };
    hasReport?: boolean;
    report?: ContractReport;
  onAction?: (action: string, id: string) => void;
}

export function ContractCard({ contract, onAction, hasReport = false, report }: ContractCardProps) {
  const [reportOpen, setReportOpen] = React.useState(false);

  const stages = [
    { id: "running", label: "Running", icon: Clock },
    { id: "evaluation", label: "Review", icon: Search },
    { id: "completed", label: "Done", icon: CheckCircle2 },
    { id: "disputed", label: "Issue", icon: ShieldAlert },
  ] as const;

  const currentIndex = stages.findIndex(
    (s) => s.id === contract.currentStage
  );

  const isDisputed = contract.currentStage === "disputed";
  const isCompleted = contract.currentStage === "completed";

  const formatCurrency = (amount: string | number, currency: string) => {
    const num = Number(String(amount).replace(/[^0-9.-]/g, ""));
    if (isNaN(num)) return "N/A";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-full max-w-[760px] mx-auto"
      >
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col">

          {/* ================= HEADER ================= */}
          <CardHeader className="flex flex-row justify-between">

            <div className="space-y-1 min-w-0">
              <CardTitle className="text-base font-semibold truncate">
                {contract.title}
              </CardTitle>

              <CardDescription className="text-xs flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {contract.startDate} → {contract.endDate}
              </CardDescription>
            </div>

            <div className="flex items-start gap-0.5">

              <div className="flex flex-col items-end gap-1">
                <Badge variant="secondary" className="text-[10px]">
                  <Fingerprint className="h-3 w-3 mr-1" />
                  {contract.id.slice(0, 8)}
                </Badge>

                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px]",
                    isDisputed && "text-red-500",
                    isCompleted && "text-emerald-500"
                  )}
                >
                  {contract.status}
                </Badge>
              </div>

              {/* MENU */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">

                  <DropdownMenuItem onClick={() => setReportOpen(true)}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Report
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => onAction?.("details", contract.id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => onAction?.("edit", contract.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>

                {isDisputed && (
                  <DropdownMenuItem onClick={() => onAction?.("dispute", contract.id)}>
                    <ShieldAlert className="h-4 w-4 mr-2" />
                    Resolve Dispute
                  </DropdownMenuItem>
                )}

                  <DropdownMenuItem
                    className="text-red-500"
                    onClick={() => onAction?.("delete", contract.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>

                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          </CardHeader>

          {/* ================= BODY ================= */}
          <CardContent className="space-y-4 flex-1">

            {/* STEPPER */}
            <div className="flex justify-between relative">
              <div className="absolute top-1/2 w-full h-px bg-muted" />

            {stages.map((stage, i) => {
              const Icon = stage.icon;
              const active = i <= currentIndex;

              return (
                <TooltipProvider key={stage.id}>
                  <Tooltip>
                    <TooltipTrigger >
                      <div
                        className={cn(
                          "relative z-10 h-8 w-8 rounded-full flex items-center justify-center border transition",
                          "duration-200",
                          active
                            ? "bg-primary text-primary-foreground border-primary scale-110 shadow-sm"
                            : "bg-background text-muted-foreground border-border hover:bg-muted"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{stage.label}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>

            {/* INFO */}
            <div className="grid grid-cols-2 gap-4 text-sm">

              <InfoItem
                label="Budget"
                value={formatCurrency(contract.salaryValue, contract.currency)}
              />

              <InfoItem
                label="Stage"
                value={contract.currentStage}
                icon={<Activity className="h-3.5 w-3.5" />}
              />

            </div>

          </CardContent>

          {/* ================= FOOTER ================= */}
          <CardFooter className="mt-auto flex gap-2">

            <Button
              className="flex-1 justify-between"
              onClick={() => onAction?.("details", contract.id)}
            >
              View Profile
              <Eye className="h-4 w-4" />
            </Button>

            {hasReport && (
              <Button
                variant="outline"
                className="flex-1 justify-between"
                onClick={() => setReportOpen(true)}
              >
                View Report
                <FileText className="h-4 w-4" />
              </Button>
            )}

          </CardFooter>
        </Card>
      </motion.div>

      {/* ================= REPORT MODAL ================= */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-lg">

          <DialogHeader>
            <DialogTitle>Contract Report</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">

            {/* NOTE */}
            <div>
              <p className="text-sm font-medium mb-1">Progress</p>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {report?.note}
              </p>
            </div>

            {/* LINKS */}
            <div>
              <p className="text-sm font-medium mb-2">Links</p>

              <div className="space-y-1">
                {report?.links.map((l, i) => (
                  <a
                    key={i}
                    href={l.url}
                    target="_blank"
                    className="text-sm text-primary hover:underline block"
                  >
                    🔗 {l.name}
                  </a>
                ))}
              </div>
            </div>

            {/* FILES */}
            <div>
              <p className="text-sm font-medium mb-2">Files</p>

              <div className="space-y-2">
                {report?.files.map((f, i) => (
                  <div
                    key={i}
                    className="flex justify-between p-2 border rounded-lg"
                  >
                    <span className="text-sm">{f.name}</span>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(f.url, "_blank")}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </DialogContent>
      </Dialog>
    </>
  );
}