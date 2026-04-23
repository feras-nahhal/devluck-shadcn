"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

import {
  MoreVertical,
  MapPin,
  Phone,
  Eye,
  Pencil,
  Trash2,
  GraduationCap,
  Fingerprint,
} from "lucide-react";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { University } from "@/hooks/companyapihandler/useUniversityHandler";
import { Badge } from "@/components/ui/badge";
import { InfoItem } from "./info-item";

type UniversityCardProps = {
  university: University;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  showMenu?: boolean;
};

export function UniversityCard({
  university,
  onEdit,
  onDelete,
  onClick,
  showMenu = true
}: UniversityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="w-full h-full" // Ensure motion div fills grid cell
    >
      <Card className="relative h-full flex flex-col overflow-hidden rounded-xl p-2 shadow-sm hover:shadow-md transition-all">
        {/* TOP ACTION BAR */}
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-1 bg-black/40 text-white px-2 py-0.5 rounded-md text-[10px] backdrop-blur">
            <Fingerprint className="h-3 w-3" />
            {(university.id || "").slice(0, 6).toUpperCase()}
          </div>

          {showMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full  backdrop-blur flex items-center justify-center transition"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">

                <DropdownMenuItem onClick={onClick} className="cursor-pointer">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </DropdownMenuItem>

                <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="text-red-500 cursor-pointer "
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* IMAGE / AVATAR - Using a Pro square style */}
        <div className="flex flex-col items-center justify-center">
          <div className="h-60 w-60 rounded-full overflow-hidden border shadow-md">
            <img
              src={university.image || "https://avatar.vercel.sh/university"}
              alt={university.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* HEADER */}
        <CardHeader className="text-center">
          <CardTitle className="text-lg font-bold line-clamp-1 px-1">
            {university.name}
          </CardTitle>
        </CardHeader>

        {/* CONTENT - flex-1 pushes the footer down */}
        <CardContent className="p-0 flex-1 flex flex-col">
          <CardDescription className="text-sm leading-relaxed line-clamp-4 text-center px-2 min-h-[60px] mb-4">
            {university.description || "No description available"}
          </CardDescription>

          <div className="space-y-2 ">
            <InfoItem
              label="Applied"
              value={university.address || "No address"}
              icon={<MapPin className="h-4 w-4" />}
            />
            <InfoItem
              label="Phone"
              value={university.phoneNumber || "No phone"}
              icon={<Phone className="h-4 w-4" />}
            />
          </div>
        </CardContent>

        {/* FOOTER */}
        <CardFooter className="p-0  ">
          <Button
            onClick={onClick}
            className="w-full justify-between"
          >
            View University
            <Eye className="h-4 w-4 transition-transform group-hover:scale-110" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}