"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ContractDescriptionProps = {
  contract: any;
};

export function ContractDescriptionComponent({
  contract,
}: ContractDescriptionProps) {
  const renderText = (value?: string | number, max = 30) => {
    if (!value)
      return <span className="text-sm text-muted-foreground">Not provided</span>;

    if (typeof value === "string") {
      const text =
        value.length > max ? value.slice(0, max) + "..." : value;

      return <span className="text-muted-foreground">{text}</span>;
    }

    return <span className="text-muted-foreground" >{value}</span>;
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ================= CONTRACT INFO ================= */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Contract Information</CardTitle>
          <CardDescription>
            Overview of the contract details and terms
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-[var(--color-text-primary)]">

          <div className="grid gap-3 text-sm">

            <div className="flex justify-between">
              <span className="font-medium">Contract Title</span>
              {renderText(contract.contractTitle, 50)}
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Contract Number</span>
              {renderText(contract.inContractNumber, 50)}
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Duration</span>
              {renderText(contract.duration, 25)}
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Salary</span>
              {contract.salary ? (
                <span className="text-muted-foreground">
                  {contract.currency || "USD"}{" "}
                  {contract.salary.toLocaleString()}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Not provided
                </span>
              )}
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Work Location</span>
              {renderText(contract.workLocation, 50)}
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Status</span>
              <Badge variant="secondary">{contract.status || "N/A"}</Badge>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Created</span>
              {contract.createdDate ? (
                <span className="text-muted-foreground">
                  {new Date(contract.createdDate).toLocaleDateString()}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Not provided
                </span>
              )}
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Note</span>
              {renderText(contract.note, 300)}
            </div>

          </div>
        </CardContent>
      </Card>

      {/* ================= COMPANY INFO ================= */}
      {contract.company && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Company Information</CardTitle>
            <CardDescription>
              Details about the hiring company
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-[var(--color-text-primary)]">

            <div className="grid gap-3 text-sm">

              <div className="flex justify-between">
                <span className="font-medium">Company Name</span>
                {renderText(contract.company.name, 30)}
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Location</span>
                {renderText(contract.company.location, 50)}
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Website</span>
                {renderText(contract.company.website, 30)}
              </div>

            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}