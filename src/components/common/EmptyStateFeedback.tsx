"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, SearchX } from "lucide-react";
import { useRouter } from "next/navigation";


interface EmptyStateFeedbackProps {
  type?: "error" | "notfound";
  title?: string;
  description?: string;
  id?: string;
}

export default function EmptyStateFeedback({
  type = "notfound",
  title,
  description,
  id,
}: EmptyStateFeedbackProps) {
  const router = useRouter();
  const isError = type === "error";

  return (
    <div className="flex items-center justify-center min-h-[70vh] w-full px-4">
      <Card className="w-full max-w-md text-center shadow-xl border border-border animate-in fade-in zoom-in-95 duration-300">
        <CardContent className="flex flex-col items-center gap-5 py-10">

          {/* ICON */}
          <div className="flex justify-center">
            {isError ? (
              <AlertCircle className="w-14 h-14 text-destructive" />
            ) : (
              <SearchX className="w-14 h-14 text-muted-foreground" />
            )}
          </div>

          {/* TITLE (FuzzyText) */}
          <div className="flex justify-center">
        

              {title || (isError ? "Something went wrong" : "Applicant Not Found")}
       
          </div>

          {/* DESCRIPTION */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              {description ||
                (isError
                  ? "Something went wrong. Please try again."
                  : "No applicant found with this ID.")}
            </p>

            {!isError && id && (
              <p className="font-medium text-foreground">
                ID: <span className="text-muted-foreground">{id}</span>
              </p>
            )}

            <p className="text-xs">
              Please check the ID or return to the dashboard.
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              Go Back
            </Button>

            {isError && (
              <Button
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}