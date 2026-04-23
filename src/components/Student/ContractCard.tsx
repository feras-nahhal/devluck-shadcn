"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  MoreVertical,
  FileText,
  XCircle,
  Calendar,
  DollarSign,
  MapPin,
  Briefcase,
  Eye,
  Fingerprint,
} from "lucide-react";


import { Button } from "@/components/ui/button";
import { InfoItem } from "../common/info-item";

interface ContractCardProps {
  contract: {
    id: string;
    applicantId: number;
    contractTitle: string;
    company: string;
    jobType: string;
    location: string;
    workProgress: number;
    startDate: string;
    endDate: string;
    status: string;
    salary: string;
    startedAt: string;
  };
  onDetails?: () => void;
  onDispute?: () => void;
}

export function ContractCard({
  contract,
  onDetails,
  onDispute,
}: ContractCardProps) {
  const truncate = (text?: string, max = 24) =>
    text ? (text.length > max ? text.slice(0, max) + "…" : text) : "N/A";

const getStatusStyles = () => {
  switch (contract.status) {
    case "Running":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "Completed":
      return "bg-green-500/10 text-green-600 border-green-500/20";
    case "Disputed":
      return "bg-red-500/10 text-red-600 border-red-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getProgressColor = () => {
  switch (contract.status) {
    case "Running":
      return "[&>div]:bg-blue-500";
    case "Completed":
      return "[&>div]:bg-green-500";
    case "Disputed":
      return "[&>div]:bg-red-500";
    default:
      return "[&>div]:bg-primary";
  }
};

  

  return (
    <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
      
      {/* HEADER */}
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold leading-tight">
            {truncate(contract.contractTitle)}
          </CardTitle>

          <CardDescription>
            {truncate(contract.company, 20)}
          </CardDescription>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger >
            <button className="p-1 rounded-md hover:bg-muted">
              <MoreVertical className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDetails}>
              <FileText className="w-4 h-4 mr-2" />
              Details
            </DropdownMenuItem>

            {contract.status !== "Disputed" && (
              <DropdownMenuItem onClick={onDispute}>
                <XCircle className="w-4 h-4 mr-2 text-destructive" />
                Dispute
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="flex flex-col gap-3 flex-1">
        
        {/* Top meta */}
        <div className="flex items-center justify-between">
            <Badge
            variant="outline"
            className={getStatusStyles()}
            >
            {contract.status}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
            <Fingerprint className="h-3 w-3" />
            {contract.id.slice(0, 8)}
            </Badge>
        </div>

        <Separator />

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <InfoItem
            label="Started"
            value={contract.startedAt}
            icon={<Calendar className="w-4 h-4" />}
          />

          <InfoItem
            label="Salary"
            value={truncate(contract.salary, 12)}
            icon={<DollarSign className="w-4 h-4" />}
            highlight
          />

          <InfoItem
            label="Type"
            value={contract.jobType}
            icon={<Briefcase className="w-4 h-4" />}
          />

          <InfoItem
            label="Location"
            value={truncate(contract.location, 12)}
            icon={<MapPin className="w-4 h-4" />}
          />
        </div>

        <Separator />

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-muted-foreground">Work Progress</span>
            <span>{contract.workProgress || 0}%</span>
          </div>

            <Progress
            value={contract.workProgress || 0}
            className={`h-2 ${getProgressColor()}`}
            />
        </div>
      </CardContent>

      {/* FOOTER */}
        <CardFooter className="pt-3">
            <Button
                onClick={onDetails}
                className="w-full justify-between cursor-pointer"
            >
                View Contract
                <Eye className="h-4 w-4" />
            </Button>
        </CardFooter>
    </Card>
  );
}