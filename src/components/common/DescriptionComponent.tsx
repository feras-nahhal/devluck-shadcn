"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

/* ================= TRUNCATE UTILITY ================= */
const truncateText = (text?: string | null, maxLength: number = 24) => {
  if (!text?.trim()) {
    return <span className="text-muted-foreground">N/A</span>;
  }

  const value =
    text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

  return <span className="text-muted-foreground">{value}</span>;
};

/* ================= COMPONENT ================= */

export function DescriptionComponent({
  opportunity,
}: {
  opportunity: any;
}) {
  return (
    <div className="flex flex-col gap-6">

      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold break-words text-[var(--color-text-primary)]">
          {opportunity.title}
        </h1>
        {/* Pills row */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{opportunity.type}</Badge>•
          <Badge variant="outline">
            {opportunity.location || "Not specified"}
          </Badge>•
          <Badge className="bg-[var(--color-primary)] text-black">
            Job ID: {opportunity.id?.substring(0, 6)}
          </Badge>
        </div>
      </div>

      {/* JOB DESCRIPTION */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Job Description</h2>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          {truncateText(opportunity.details || opportunity.description, 300)}
        </p>
      </section>

      {/* RESPONSIBILITIES */}
      <section className="space-y-2">
        <h3 className="text-lg font-semibold">Key Responsibilities</h3>

        {opportunity.keyResponsibilities?.length ? (
          <ul className="space-y-2">
            {opportunity.keyResponsibilities.map((item: string, i: number) => (
              <li key={i} className="text-sm text-[var(--color-text-secondary)]">
                • {truncateText(item, 120)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No key responsibilities specified
          </p>
        )}
      </section>

      {/* WHY WORK HERE */}
      <section className="space-y-2">
        <h3 className="text-lg font-semibold">
          Why You’ll Love Working Here
        </h3>

        {opportunity.whyYouWillLoveWorkingHere?.length ? (
          <ul className="space-y-2">
            {opportunity.whyYouWillLoveWorkingHere.map(
              (item: string, i: number) => (
                <li key={i} className="text-sm text-[var(--color-text-secondary)]">
                  • {truncateText(item, 120)}
                </li>
              )
            )}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No benefits mentioned
          </p>
        )}
      </section>

      {/* SKILLS */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Skills</h3>

        {opportunity.skills?.length ? (
          <div className="flex flex-wrap gap-2">
            {opportunity.skills.map((item: string, i: number) => (
              <span
                key={i}
                className="px-3 py-1 text-sm rounded-full border border-[var(--color-text-primary)]/20 text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] transition"
              >
                {item.length > 30 ? item.slice(0, 30) + "..." : item}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No skills specified
          </p>
        )}
      </section>

      {/* BENEFITS */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Benefits</h3>

        {opportunity.benefits?.length ? (
          <div className="flex flex-wrap gap-2">
            {opportunity.benefits.map((item: string, i: number) => (
              <span
                key={i}
                className="px-3 py-1 text-sm rounded-full border border-[var(--color-text-primary)]/20 text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] transition"
              >
                {item.length > 30 ? item.slice(0, 30) + "..." : item}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No benefits specified
          </p>
        )}
      </section>
    </div>
  );
}