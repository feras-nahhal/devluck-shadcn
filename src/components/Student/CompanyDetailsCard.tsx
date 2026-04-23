"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, Phone, MapPin, Image as ImageIcon } from "lucide-react";

/* ================= UTILS ================= */

const truncate = (text?: string | null, max = 80) => {
  if (!text?.trim()) {
    return <span className="text-muted-foreground">Not provided</span>;
  }

  return text.length > max ? text.slice(0, max) + "..." : text;
};

/* ================= COMPONENT ================= */

export function CompanyDetailsCard({ opportunity }: { opportunity: any }) {
  const company = opportunity?.company;

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardContent className="p-6 space-y-6">

        {/* HEADER */}
        <div className="flex items-start gap-4">
          
          {/* LOGO */}
          <div className="w-24 h-24 rounded-xl border bg-muted flex items-center justify-center overflow-hidden">
            {company?.logoUrl || company?.logo ? (
              <img
                src={company.logoUrl || company.logo}
                alt={company?.name || "Company"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center text-muted-foreground">
                <ImageIcon className="w-6 h-6" />
                <span className="text-[10px]">No Logo</span>
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="flex-1 space-y-2">

            {/* NAME */}
            <CardTitle className="flex items-center gap-2 text-lg">
              {company?.name || (
                <span className="text-muted-foreground">
                  Unknown Company
                </span>
              )}
            </CardTitle>

   

            {/* LOCATION */}
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-[var(--color-text-secondary)]">
                {truncate(company?.location, 40)}
              </span>
            </div>

            {/* PHONE */}
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-[var(--color-text-secondary)]">
                {truncate(company?.phoneNumber, 30)}
              </span>
            </div>

          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="space-y-2">
          <CardTitle className="text-base">
            About Company
          </CardTitle>

          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {company?.description?.trim() ? (
              truncate(company.description, 400)
            ) : (
              <span className="text-muted-foreground italic">
                No description available for this company
              </span>
            )}
          </p>
        </div>

      </CardContent>
    </Card>
  );
}