"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import {
  ArrowRight,
  Mail,
  BarChart3,
  User,
  Fingerprint,
  Eye,
  Trophy,
  HomeIcon,
  MapIcon,
  MapPin,
  DollarSign,
} from "lucide-react";
import { InfoItem } from "../common/info-item";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";


export interface TopApplicant {
  id: string;
  name: string;
  image?: string | null;
  profileRanking?: number | null;
  profileComplete?: number | null;
  email?: string | null;
  availability?: string | null;
  salaryExpectation?: number | null;
}

type Props = {
  applicant: TopApplicant;
  onClick?: (applicant: TopApplicant) => void;
};

export function TopApplicantCard({ applicant, onClick }: Props) {
  return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="w-full max-w-sm mx-auto"
      >
        <Card className="relative p-2 overflow-hidden rounded-xl border  shadow-sm hover:shadow-md transition-all">
          <div className="relative  flex flex-col items-center justify-center">

            {/* LEFT TOP (ID + STATUS) */}
            <div className="absolute left-1 top-1 z-10 flex flex-col gap-1">
              <div className="flex items-center gap-1 bg-black/40 text-white px-2 py-0.5 rounded-md text-[12px] backdrop-blur">
                <Fingerprint className="h-3 w-3" />
                {(applicant.id|| "").slice(0, 6)}
              </div>
            </div>
            {/* RIGHT TOP (RANK) */}
            <div className="absolute right-1 top-1 z-10 flex items-center gap-1 bg-primary/20 text-primary px-2 py-0.5 rounded-md text-[12px] backdrop-blur">
              <Trophy className="h-3 w-3" />
              {applicant.profileRanking || "N/A"}
            </div>

          {/* AVATAR */}
          <Avatar className="h-50 w-50 ring-2 ring-background shadow-sm mt-6">
            <AvatarImage
              src={applicant.image || undefined}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
              {applicant.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          </div>

        <CardHeader className="space-y-2">

          <div className=" text-center space-y-1">
            {/* NAME */}
            <CardTitle className="text-xl font-semibold tracking-tight leading-tight">
              {applicant.name}
            </CardTitle>
            {/* EMAIL (secondary) */}
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate max-w-[180px]">{applicant.email}</span>
            </div>
          </div>
          {/* META ROW */}
            <div className="flex items-center justify-between pt-2">
              <InfoItem
                label="Availability"
                value={applicant.availability ?? "N/A"}
                icon={<MapPin className="h-3.5 w-3.5" />}
              />
              <InfoItem
                label="Expected Salary"
                value={applicant.salaryExpectation ? `$${applicant.salaryExpectation}` : "N/A"}
                icon={<DollarSign className="h-3.5 w-3.5" />}
                highlight
              />
            </div>
        </CardHeader>

          {/* FOOTER */}
          <CardFooter className="p-0 pt-0">
              <Button
              onClick={() => onClick?.(applicant)}
               className="w-full justify-between">
                View Full Profile
                <Eye className="h-4 w-4" />
              </Button>
          </CardFooter>
        </Card>
      </motion.div>
  );
}