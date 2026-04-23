"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,

  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Briefcase, Eye, Fingerprint, HomeIcon } from "lucide-react";


export default function EmployeeCard({
  applicant,
  showMenu = false, // disabled
  onView,
}: any) {
  const router = useRouter();

return (
  <Card className="group relative overflow-hidden rounded-xl shadow-sm transition hover:shadow-lg">
    
    {/* IMAGE SECTION */}
    <div className="relative aspect-video overflow-hidden">
      <img
        src={applicant.student?.image || "https://avatar.vercel.sh/user"}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/25" />

      {/* LEFT BADGE (ID) */}
      <div className="absolute left-3 top-3">
        <Badge
          variant="secondary"
          className="flex items-center gap-1 bg-black/50 text-white backdrop-blur border-0"
        >
          <Fingerprint className="h-3 w-3" />
          {applicant.applicantId?.slice(0, 8)}
        </Badge>
      </div>

      {/* RIGHT BADGE (AVAILABILITY) */}
      {applicant.availability && (
        <div className="absolute right-3 top-3">
          <Badge
            variant="outline"
            className="flex items-center gap-1 bg-black/50 text-white border-white/20 backdrop-blur"
          >
            <HomeIcon className="h-3 w-3" />
            {applicant.availability}
          </Badge>
        </div>
      )}
    </div>

    {/* BODY */}
    <CardHeader className="space-y-1 pb-2">
      <CardTitle className="text-sm font-semibold leading-tight">
        {applicant.student?.name || "Unknown Candidate"}
      </CardTitle>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Briefcase className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">
          {applicant.contractTitle || "Employee Role"}
        </span>
      </div>
    </CardHeader>

    {/* PROGRESS */}
    <CardContent className="space-y-2">
      <Progress value={applicant.profileComplete || 0} className="h-1.5" />

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Profile completion</span>
        <span className="font-medium text-foreground">
          {applicant.profileComplete || 0}%
        </span>
      </div>
    </CardContent>

    {/* FOOTER */}
    <CardFooter>
      <Button
        size="sm"
        className="w-full justify-between"
        onClick={() =>
          onView
            ? onView()
            : router.push(`/Company/profile/${applicant.student?.id}`)
        }
      >
        View Profile
        <Eye className="h-4 w-4" />
      </Button>
    </CardFooter>
  </Card>
);
}