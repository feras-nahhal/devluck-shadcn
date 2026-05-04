// ===============================================
// app/Student/assessments/page.tsx
// ===============================================
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/Student/DashboardLayout";
import { useStudentAssessmentHandler } from "@/hooks/studentapihandler/useStudentAssessmentHandler";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import DecryptedText from "@/components/ui/DecryptedText";
import { AssessmentCard } from "@/components/Student/AssessmentCard";
import { SearchAndFilterAndViewBar } from "@/components/common/SearchAndFilterAndViewBar";
import { Pagination } from "@/components/common/Pagination";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import { StatsCard } from "@/components/common/stats-card";
import { CheckCircle2, Clock3, FileCheck,Lock } from "lucide-react";
import { StatsCardSkeleton } from "@/components/common/Skeleton/StatsCardSkeleton";
import React from "react";
import { AssessmentCardSkeleton } from "@/components/Student/Skeleton/AssessmentCardSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { AssessmentItem, AssessmentStatus } from "@/types/assessment";
import { toast } from "sonner";
import SyncLoader from "react-spinners/SyncLoader";


type TabMode = "all" | "public" | "private";
type FilterStatus = AssessmentStatus | "all";
const FILTER_STATUSES: FilterStatus[] = [  // ✅ Explicitly type as FilterStatus[]
  "all",
  "not_started",
  "in_progress",
  "evaluating",
  "completed",
  "expired"
];

export default function StudentAssessmentsPage() {
  const router = useRouter();

  const {
    listAssessments,
    startAssessment,
    startAssessmentFromInvite,
  } = useStudentAssessmentHandler();

  const [tab, setTab] = useState<TabMode>("all");
  const [items, setItems] = useState<AssessmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingKey, setStartingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<FilterStatus[]>(["all"]);


  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 6;

  const reportEligibleStatuses = new Set([
    "evaluating",
    "completed",
  ]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setSelectedStatuses(["all"]);
      setSearchQuery("");
      setCurrentPage(1);
      
      setLoading(true);
      setError(null);

      try {
        const data = await listAssessments(tab);

        if (!mounted) return;

        setItems(data || []);

        toast.success("Assessments loaded");
      } catch (err: unknown) {
        if (!mounted) return;

        const message =
          err instanceof Error
            ? err.message
            : "Failed to fetch assessments";

        setError(message);
        toast.error(message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [tab, listAssessments]);

  const normalizedItems = useMemo(() => {
    return items.map((item) => {
      // Use the actual assessment status instead of simplified cardStatus
      const status = String(
        item.sessionStatus || item.assessmentStatus || "not_started"
      ).toLowerCase() as AssessmentStatus;

      return {
        ...item,
        // Keep original status for filtering, add cardStatus only for display if needed
        assessmentStatus: status,
        cardStatus: reportEligibleStatuses.has(status) ? "completed" : "pending", // Keep for cards
      };
    });
  }, [items]);

  const filteredItems = useMemo(() => {
    return normalizedItems.filter((item: any) => { // ✅ Add 'any' type for safety
      const title = item.opportunity?.title || "Assessment";

      const matchesSearch = title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // ✅ Safe status check with fallback
      const itemStatus = (item.assessmentStatus ?? "not_started") as AssessmentStatus;
      const matchesStatus =
        selectedStatuses.includes("all") ||
        selectedStatuses.includes(itemStatus);

      return matchesSearch && matchesStatus;
    });
  }, [normalizedItems, searchQuery, selectedStatuses]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
  );

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredItems.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [filteredItems, currentPage]);

  const visiblePages = Array.from(
    { length: totalPages },
    (_, i) => i + 1
  );

const toggleStatus = (status: FilterStatus) => {  // ✅ Change parameter type
  setCurrentPage(1);

  if (status === "all") {
    setSelectedStatuses(["all"]);
    return;
  }

  if (selectedStatuses.includes("all")) {
    setSelectedStatuses([status]);  // ✅ Remove 'as AssessmentStatus'
  } else {
    let updated = selectedStatuses.includes(status)
      ? selectedStatuses.filter((x) => x !== status)
      : [...selectedStatuses, status];

    if (updated.length === 0) {
      setSelectedStatuses(["all"]);
    } else {
      setSelectedStatuses(updated);  // ✅ Remove 'as AssessmentStatus[]'
    }
  }
};

  const goToPage = (page: number) =>
    setCurrentPage(page);

  const goToPrevious = () =>
    setCurrentPage((prev) =>
      Math.max(prev - 1, 1)
    );

  const goToNext = () =>
    setCurrentPage((prev) =>
      Math.min(prev + 1, totalPages)
    );

  const handleStart = async (item: AssessmentItem) => {
    const key =
      item.inviteToken ||
      item.applicationId ||
      item.sessionId ||
      item.opportunity?.id;

    if (!key) return;

    setStartingKey(key);

    const toastId = toast.loading("Starting assessment...");

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

      if (!sessionId) {
        toast.error("Failed to start assessment", { id: toastId });
        return;
      }

      toast.success("Assessment started", { id: toastId });

      const sourceParam =
        item.source === "private" ? "&source=invite" : "";

      router.push(
        `/Student/applied-Opportunity/${
          item.opportunity?.id || "assessment"
        }/assessment?sessionId=${sessionId}${sourceParam}`
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong";

      toast.error(message, { id: toastId });
    } finally {
      setStartingKey(null);
    }
  };

  const grouped = React.useMemo(() => {
  const done = items.filter((x) => {
    const status = String(
      x.sessionStatus || x.assessmentStatus || ""
    ).toLowerCase();

    return (
      x.hasReport ||
      status === "completed" ||
      status === "evaluating"
    );
  });

  const pending = items.filter((x) => !done.includes(x));

  return { pending, done };
}, [items]);

  const formatValue = (val: number) => {
    if (loading) {
      return <SyncLoader size={8} color="#D4AF37" />;
    }

    return (
      <span className={val === 0 ? "text-muted-foreground" : ""}>
        {val}
      </span>
    );
  };

  const statusClasses: Record<AssessmentStatus, string> = {
  not_started: "bg-muted text-muted-foreground ",
  in_progress: "bg-yellow-500/10 text-yellow-600 ",
  evaluating: "bg-blue-500/10 text-blue-600 ",
  completed: "bg-green-500/10 text-green-600 ",
  expired: "bg-red-500/10 text-red-600 ",
  };
  const statusLabels: Record<AssessmentStatus, string> = {
    not_started: "Not Started",
    in_progress: "In Progress",
    evaluating: "Evaluating",
    completed: "Completed",
    expired: "Expired",
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-6 py-6 space-y-8">
        {/* HEADER */}
          <header className="space-y-6">
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

           {/* STATS */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <StatsCardSkeleton key={i} />
                  ))
                : [
                    {
                      title: "Total",
                      value: formatValue(items.length),
                      subtitle: "All assessments",
                      icon: <FileCheck className="h-5 w-5" />,
                      color: "#3B82F6",
                    },
                    {
                      title: "In Progress",
                      value: formatValue(
                        items.filter((x) => {
                          const status = String(
                            x.sessionStatus || x.assessmentStatus || ""
                          ).toLowerCase();
                          return status === "in_progress";
                        }).length
                      ),
                      subtitle: "Currently active",
                      icon: <Clock3 className="h-5 w-5" />,
                      color: "#F59E0B",
                    },
                    {
                      title: "Completed",
                      value: formatValue(
                        items.filter((x) => {
                          const status = String(
                            x.sessionStatus || x.assessmentStatus || ""
                          ).toLowerCase();
                          return status === "completed";
                        }).length
                      ),
                      subtitle: "Finished tests",
                      icon: <CheckCircle2 className="h-5 w-5" />,
                      color: "#10B981",
                    },
                    {
                      title: "Expired",
                      value: formatValue(
                        items.filter((x) => {
                          const status = String(
                            x.sessionStatus || x.assessmentStatus || ""
                          ).toLowerCase();
                          return status === "expired";
                        }).length
                      ),
                      subtitle: "Time expired",
                      icon: <Lock className="h-5 w-5" />,
                      color: "#EF4444",
                    },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <StatsCard
                        title={stat.title}
                        value={stat.value}
                        subtitle={stat.subtitle}
                        icon={stat.icon}
                        iconColor={stat.color}
                      />
                    </motion.div>
                  ))}
            </section>
          </header>

        {/* TABS */}
        <Tabs
          value={tab}
          onValueChange={(value) => {
            setTab(value as TabMode);
            setCurrentPage(1);
          }}
          className="w-full"
        >
          <TabsList className="grid w-fit grid-cols-3">
            <TabsTrigger value="all">
              All
            </TabsTrigger>
            <TabsTrigger value="public">
              Public
            </TabsTrigger>
            <TabsTrigger value="private">
              Private
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* SEARCH / FILTER - ✅ Fixed: Remove statusLabels prop */}
        <SearchAndFilterAndViewBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={showGrid ? "grid" : "list"}
          setViewMode={(mode) => setShowGrid(mode === "grid")}
          selectedStatuses={selectedStatuses}
          toggleStatus={toggleStatus}
          availableStatuses={FILTER_STATUSES}
          placeholder="Assessments..."
          filterLabel="Assessment Status"
        />

        {/* CONTENT */}
        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <AssessmentCardSkeleton key={i} />
              ))}
            </div>
        ) : error ? (
          <ErrorState
            title="Failed to load assessments"
            description={error}
            onRetry={() => window.location.reload()}
          />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No assessments found"
            description="There are no assessments available for the selected filter."
            icon={<FileCheck className="h-6 w-6" />}
          />
        ) : (
          <>
            {/* GRID VIEW */}
            {showGrid ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {paginatedItems.map((item: any) => {
                  const key =
                    item.inviteToken ||
                    item.applicationId ||
                    item.sessionId ||
                    item.opportunity?.id;

                  return (
                    <AssessmentCard
                      key={key}
                      item={item}
                      isStarting={startingKey === key}
                      onStart={() => handleStart(item)}
                    />
                  );
                })}
              </div>
            ) : (
              /* TABLE VIEW */
              <DataTable
                data={paginatedItems}
                getId={(row: any) =>
                  row.inviteToken ||
                  row.applicationId ||
                  row.sessionId ||
                  row.opportunity?.id
                }
                columns={[
                  {
                    header: "Title",
                    cell: (row: any) => (
                      <div className="font-medium">
                        {row.opportunity?.title || "Assessment"}
                      </div>
                    ),
                  },
                  {
                    header: "Type",
                    cell: (row: any) => (
                      <Badge
                        variant="outline"
                        className={
                          row.source === "private"
                            ? "bg-muted text-muted-foreground border-border"
                            : "bg-primary/10 text-primary border-primary/20"
                        }
                      >
                        {row.source === "private" ? "Private" : "Public"}
                      </Badge>
                    ),
                  },
                  {
                    header: "Status",
                    cell: (row: any) => {
                      const status = (row.assessmentStatus ?? "not_started") as AssessmentStatus;

                      return (
                        <Badge className={statusClasses[status]}>
                          {statusLabels[status]}
                        </Badge>
                      );
                    },
                  },
                  {
                    header: "Report",
                    cell: (row: any) => {
                      const status = String(
                        row.sessionStatus ||
                          row.assessmentStatus ||
                          ""
                      ).toLowerCase();

                      const canView =
                        row.hasReport ||
                        reportEligibleStatuses.has(status);

                      return canView ? (
                        <Badge>Available</Badge>
                      ) : (
                        <Badge variant="outline">
                          Pending
                        </Badge>
                      );
                    },
                  },
                ]}
              />
            )}

            {/* PAGINATION */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              visiblePages={visiblePages}
              loading={loading}
              error={error}
              onPageChange={goToPage}
              onPrevious={goToPrevious}
              onNext={goToNext}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 