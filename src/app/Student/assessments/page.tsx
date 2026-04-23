"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/Student/DashboardLayout";
import { useStudentAssessmentHandler } from "@/hooks/studentapihandler/useStudentAssessmentHandler";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/common/LoadingState";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import DecryptedText from "@/components/ui/DecryptedText";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TabMode = "all" | "public" | "private";

export default function StudentAssessmentsPage() {
  const router = useRouter();
  const { listAssessments, startAssessment, startAssessmentFromInvite } = useStudentAssessmentHandler();
  const [tab, setTab] = useState<TabMode>("all");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingKey, setStartingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reportEligibleStatuses = new Set(["evaluating", "completed"]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listAssessments(tab);
        if (!mounted) return;
        setItems(data);
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || "Failed to fetch assessments");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [tab, listAssessments]);

  const grouped = useMemo(() => {
    const done = items.filter((x) => {
      const status = String(x.sessionStatus || x.assessmentStatus || "").toLowerCase();
      return x.hasReport || reportEligibleStatuses.has(status);
    });
    const pending = items.filter((x) => !done.includes(x));
    return { pending, done };
  }, [items]);

  const handleViewReport = (item: any) => {
    if (!item.sessionId) {
      setError("Report is not ready yet. Please try again shortly.");
      return;
    }
    router.push(`/Student/applied-Opportunity/assessment/${item.sessionId}`);
  };

  const handleStart = async (item: any) => {
    const key = item.inviteToken || item.applicationId || item.sessionId || item.opportunity?.id;
    if (!key) return;
    setStartingKey(key);
    try {
      let sessionId = item.sessionId;
      if (!sessionId) {
        if (item.source === "private" && item.inviteToken) {
          const res = await startAssessmentFromInvite(item.inviteToken);
          sessionId = res.sessionId;
        } else if (item.source === "public" && item.applicationId) {
          const res = await startAssessment(item.applicationId);
          sessionId = res.sessionId;
        }
      }
      if (sessionId) {
        const sourceParam = item.source === "private" ? "&source=invite" : "";
        router.push(`/Student/applied-Opportunity/${item.opportunity?.id || "assessment"}/assessment?sessionId=${sessionId}${sourceParam}`);
      }
    } finally {
      setStartingKey(null);
    }
  };

  const renderCard = (item: any) => {
    const key = item.inviteToken || item.applicationId || item.sessionId || item.opportunity?.id;
    const isStarting = startingKey === key;
    const normalizedStatus = String(item.sessionStatus || item.assessmentStatus || "").toLowerCase();
    const canViewReport = item.hasReport || reportEligibleStatuses.has(normalizedStatus);
    const canStart = !canViewReport;
      return (
        <Card key={key} className="group transition hover:shadow-md">
          
          {/* HEADER */}
          <CardHeader className="space-y-1">
            <CardTitle className="text-base font-semibold leading-tight">
              {item.opportunity?.title || "Assessment"}
            </CardTitle>

            <CardDescription className="flex flex-wrap items-center gap-2 text-xs">
              <span>
                {item.source === "private" ? "Private Invite" : "Public Assessment"}
              </span>

              <span className="text-muted-foreground">•</span>

              <span>
                Status:{" "}
                <Badge variant="secondary" className="ml-1 capitalize">
                  {item.assessmentStatus || "not_started"}
                </Badge>
              </span>
            </CardDescription>
          </CardHeader>

          {/* CONTENT */}
          <CardContent className="flex items-center justify-between gap-4">
            
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                {canViewReport ? (
                  <Badge variant="default">Report Available</Badge>
                ) : (
                  <Badge variant="outline">Pending</Badge>
                )}

                {item.sessionStatus && (
                  <span className="text-xs text-muted-foreground">
                    • Session:{" "}
                    <span className="font-medium capitalize">
                      {item.sessionStatus}
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* ACTIONS */}
            {canStart ? (
              <Button
                onClick={() => handleStart(item)}
                disabled={isStarting}
                className="min-w-[110px]"
              >
                {isStarting
                  ? "Starting..."
                  : item.sessionId
                  ? "Resume"
                  : "Start"}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => handleViewReport(item)}
                className="min-w-[110px]"
              >
                View Report
              </Button>
            )}
          </CardContent>
        </Card>
      );
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-6 py-6 space-y-8">

        {/* HEADER (modern SaaS style) */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div>
            <motion.h1
              className="text-3xl font-bold tracking-tight text-foreground"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <DecryptedText
                text="Assessments"
                speed={40}
                maxIterations={20}
                className="revealed"
                parentClassName="inline-block"
              />
            </motion.h1>

            <p className="text-muted-foreground mt-1">
              Track and manage public and private assessments with real-time status updates.
            </p>
          </div>
        </header>

        {/* TABS */}
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as TabMode)}
            className="w-full"
          >
            <TabsList className="grid w-fit grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="public">Public</TabsTrigger>
              <TabsTrigger value="private">Private</TabsTrigger>
            </TabsList>
          </Tabs>

        {/* CONTENT */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingState label="Loading assessments..." />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-8 text-sm text-red-500">
              {error}
            </CardContent>
          </Card>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No assessments found.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-10">

            {/* PENDING */}
            <section>
              <h2 className="text-lg font-semibold mb-3">
                Pending
              </h2>

              {grouped.pending.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-sm text-muted-foreground">
                    No pending assessments.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {grouped.pending.map(renderCard)}
                </div>
              )}
            </section>

            {/* COMPLETED */}
            <section>
              <h2 className="text-lg font-semibold mb-3">
                Completed
              </h2>

              {grouped.done.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-sm text-muted-foreground">
                    No completed assessments.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {grouped.done.map(renderCard)}
                </div>
              )}
            </section>

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
