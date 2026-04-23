"use client";
import React, { useState, useEffect, useCallback, useMemo, Activity } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  mockApi as api,
  BASE,
  AssessmentReport,
  Question,
} from '@/hooks/companyapihandler/questions-mock-api'

import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  ThumbsUp,
  HelpCircle,
  Download,
  ArrowLeft,
  Loader2,
  Brain,
  Camera,
  ListChecks,
  MousePointer,
  Layers,
  Repeat,
  Monitor,
  Users,
  User,
  AlertCircle,
  Flashlight,
  Notebook,
  Book,
  Cpu,
  SearchX,
  RefreshCcw,
} from "lucide-react"

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import DimensionReport from '@/components/Company/DimensionReport';
import DashboardLayout from '@/components/Student/DashboardLayout';
import EmptyStateFeedback from '@/components/common/EmptyStateFeedback';
import { toast } from 'sonner';
import { LoadingState } from '@/components/common/LoadingState';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';


class ReportErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;

if (hasError) {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[70vh] px-4">

        <Card className="w-full max-w-lg border-destructive/30 shadow-md">

          {/* Header */}
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>

            <CardTitle className="text-red-500 text-xl">
              Oops! Something went wrong
            </CardTitle>
          </CardHeader>

          {/* Content */}
          <CardContent className="text-center space-y-4">

            <p className="text-sm text-muted-foreground">
              The report failed to render due to unexpected data or a processing error.
            </p>

            {/* Error details */}
            {error && (
              <div className="text-left">
                <div className="text-xs font-semibold text-red-500 mb-2">
                  Error Details
                </div>

                <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-[200px] border">
                  {error.message}
                  {"\n\n"}
                  {error.stack}
                </pre>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-center pt-2">
              <Button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                Try Again
              </Button>
            </div>

          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}

    return this.props.children;
  }
}



function ResultsPageInner() {
  const { jobId, applicantId, assessment } = useParams<{
    jobId: string;
    applicantId: string;
    assessment: string;
  }>();
  const sessionId = assessment; // sessionId = [assessment] segment
  const router = useRouter(); // for navigation
  const [report, setReport] = useState<AssessmentReport | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  const fetchReport = useCallback(async () => {
    if (!sessionId) return
    try {
      const [reportRes, sessionRes] = await Promise.all([
        api.getReport(sessionId),
        api.getSession(sessionId),
      ])
      setReport(reportRes.data)
      setQuestions(sessionRes.data.questions)
      setLoading(false)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load report')
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  const handleDownload = () => {
    if (!report) return

    let text = `DevLuck Assessment Report\n`
    text += `${'='.repeat(50)}\n\n`
    text += `Session: ${report.session_id}\n`
    text += `Company Style: ${report.company_style}\n`
    text += `Completed: ${report.completed_at}\n\n`
    text += `Hire Signal: ${report.hire_signal?.signal || 'PENDING'}\n`
    text += `Reason: ${report.hire_signal?.reason || ''}\n\n`
    text += `Overall Score: ${report.overall_score}/10\n`
    text += `Questions: ${report.total_questions} | Answered: ${report.total_answered} | Evaluated: ${report.total_evaluated}\n\n`

    if (report.executive_summary) {
      text += `Executive Summary\n${'-'.repeat(30)}\n${report.executive_summary}\n\n`
    }

    text += `Dimension Scores\n${'-'.repeat(30)}\n`
    for (const [dim, data] of Object.entries(report.dimensions)) {
      const label = dim.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      text += `  ${label}: ${data.score}/10`
      if (data.archetype) text += ` (${data.archetype})`
      text += `\n`
      text += `    Strength: ${data.top_signal}\n`
      text += `    Concern: ${data.concern}\n\n`
    }

    if (report.red_flags.length > 0) {
      text += `\nRed Flags\n${'-'.repeat(30)}\n`
      report.red_flags.forEach(f => { text += `  ⚠ ${f}\n` })
    }

    text += `\nAI Detection\n${'-'.repeat(30)}\n`
    text += `  Likely AI-assisted: ${report.ai_signals.likely_used_ai ? 'Yes' : 'No'}\n`
    text += `  Surface-level answers: ${report.ai_signals.surface_level_answers}\n`
    text += `  Strong answers (8+): ${report.ai_signals.strong_answers}\n`

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `devluck-report-${report.session_id}.txt`
    a.click()
    toast.success("Report downloaded successfully");
    URL.revokeObjectURL(url)
  }

  const downloadPDF = async () => {
    setDownloadingPdf(true)
    try {
      const token = localStorage.getItem('devluck_token')
      const res = await fetch(`${BASE}/api/session/${sessionId}/report/pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('PDF generation failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `devluck-report-${sessionId}.pdf`
      a.click()

      toast.success("Download started", {
        description: "Your PDF report is being downloaded.",
      });
      URL.revokeObjectURL(url)
    } catch {
    toast.error("Download failed", {
      description: "Make sure you are logged in as a company.",
    });
    } finally {
      setDownloadingPdf(false)
    }
  }

  const radarData = useMemo(() => {
    if (!report?.dimensions) return []
    const formatDim = (d: string) => d.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    return Object.entries(report.dimensions).map(([dim, data]) => ({
      subject: formatDim(dim),
      A: data.score,
      fullMark: 10,
    }))
  }, [report?.dimensions])

  const getSignalConfig = (signalType: string) => {
    switch (signalType) {
      case "STRONG_HIRE":
        return {
          icon: CheckCircle,
          className: "border-green-500/50 bg-green-50",
          label: "Strong Hire",
        };
      case "HIRE":
        return {
          icon: ThumbsUp,
          className: "border-blue-500/50 bg-blue-50",
          label: "Hire",
        };
      case "MAYBE":
        return {
          icon: HelpCircle,
          className: "border-yellow-500/50 bg-yellow-50",
          label: "Maybe",
        };
      case "NO_HIRE":
        return {
          icon: XCircle,
          className: "border-red-500/50 bg-red-50",
          label: "No Hire",
        };
      default:
        return null;
    }
  };

  const severityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };


if (loading) {
  return (
    <DashboardLayout>
      <div className="flex h-screen items-center justify-center">
        <LoadingState label="Fetching Data..." />
      </div>
    </DashboardLayout>
  );
}

if (error || !report) {
  const isError = !!error;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-screen w-full">

        <EmptyStateFeedback
          type={isError ? "error" : "notfound"}
          title={
            isError
              ? error || "Something went wrong"
              : "Applicant Not Found"
          }
          description={
            isError
              ? "Something went wrong. Please try again."
              : "No report found for this session."
          }
          id={!isError ? sessionId : undefined}
        />

      </div>
    </DashboardLayout>
  );
}

  const overallPct = Math.round((report.overall_score / 10) * 100)
  const formatDim = (d: string) => d.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const signal = report.hire_signal

  return (
    <DashboardLayout>
    <div className="max-w-[1100px] mx-auto p-6">

      {/* Hire Signal */}
      {signal && (() => {
        const config = getSignalConfig(signal.signal);
        if (!config) return null;

        const Icon = config.icon;

        return (
          <Alert className={`mb-6 ${config.className}`}>
            <Icon className="h-5 w-5" />

            <AlertTitle className="text-sm font-semibold">
              {config.label}
            </AlertTitle>

            <AlertDescription className="text-xs">
              {signal.reason}
            </AlertDescription>
          </Alert>
        );
      })()}

      {/* Assessment Report Card */}
      <Card className="mb-6 shadow-md">
        
        {/* Header */}
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <CardTitle className="text-2xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-700 bg-clip-text text-transparent">
            Assessment Report
          </CardTitle>

          <div className="flex gap-4 text-xs text-muted-foreground mt-1">
            <span>
              Session: <strong>{report.session_id}</strong>
            </span>
            <span>
              Style: <strong>{formatDim(report.company_style)}</strong>
            </span>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-5">
          
          {/* Score Section */}
          <div className="flex items-center gap-6">
            
            {/* Score */}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold">
                {report.overall_score}
              </span>
              <span className="text-sm font-semibold text-muted-foreground">
                /10
              </span>
            </div>

            {/* Progress */}
            <div className="flex-1 space-y-1">
              <Progress
                value={overallPct}
                className="h-3 [&>div]:transition-all"
                style={{
                  // this targets the filled part
                  ["--progress-color" as any]:
                    overallPct >= 70
                      ? "linear-gradient(90deg, #059669, #10B981)"
                      : overallPct >= 40
                      ? "linear-gradient(90deg, #D97706, #F59E0B)"
                      : "linear-gradient(90deg, #DC2626, #F87171)",
                }}
              />
            </div>

            {/* Percentage */}
            <span className="text-sm font-medium min-w-[40px]">
              {overallPct}%
            </span>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>
              <strong>{report.total_questions}</strong> questions
            </span>
            <span>•</span>
            <span>
              <strong>{report.total_answered}</strong> answered
            </span>
            <span>•</span>
            <span>
              <strong>{report.total_evaluated}</strong> evaluated
            </span>
          </div>

        </CardContent>
      </Card>

    {/* Executive Summary & Radar Chart Wrapper */}
    {report.executive_summary && (
      <div className="grid md:grid-cols-2 gap-8 mb-8">

        {/* ================= EXECUTIVE SUMMARY ================= */}
        <Card className="flex flex-col">
          
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[var(--color-primary)]">
              <ListChecks size={20} />
              Executive Summary
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 text-muted-foreground">

            {/* Strengths */}
            <div>
              <h4 className="text-green-500 font-semibold mb-2">
                Strengths
              </h4>
              <ul className="list-disc list-inside ml-2 space-y-1">
                {report.executive_summary.strengths?.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div>
              <h4 className="text-red-500 font-semibold mb-2">
                Development Areas
              </h4>
              <ul className="list-disc list-inside ml-2 space-y-1">
                {report.executive_summary.weaknesses?.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>

            {/* Recommendation */}
            <div>
              <h4 className="text-indigo-500 font-semibold mb-2">
                Recommendation
              </h4>
              <p>{report.executive_summary.recommendation}</p>
            </div>

            {/* Integrity Note */}
            <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded-md text-sm text-muted-foreground">
              <strong>Integrity Note:</strong>{" "}
              {report.executive_summary.integrity_summary}
            </div>

          </CardContent>
        </Card>

        {/* ================= RADAR CHART ================= */}
        <Card className="flex flex-col bg-slate-800">

          <CardHeader>
            <CardTitle className="text-[var(--color-primary)]">
              Dimension Benchmarks
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#334155" />

                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />

                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 10]}
                  tick={{ fill: "#64748b" }}
                  axisLine={false}
                />

                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#38bdf8" }}
                />

                <Radar
                  name="Candidate Score"
                  dataKey="A"
                  stroke="#38bdf8"
                  fill="#38bdf8"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    )}

    {/* Integrity & AI Violation Report */}
    {report.violation_log && report.violation_log.length > 0 ? (

      <Card className="mb-6">

        {/* HEADER ALERT */}
        <CardHeader>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />

            <AlertTitle>
              Integrity & AI Violation Report
            </AlertTitle>

            <AlertDescription>
              Strong evidence of AI assistance or irregular conduct was detected.
              Review telemetry and algorithmic signals below.
            </AlertDescription>
          </Alert>
        </CardHeader>

        {/* VIOLATIONS */}
        <CardContent className="space-y-4">

          {report.violation_log.map((v: any, idx: number) => {
            const qNum =
              questions.findIndex(q => q.id === v.question_id) + 1;

            return (
              <div
                key={v.question_id || idx}
                className="rounded-lg border p-4 space-y-3"
              >

                {/* Question meta */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Question {qNum > 0 ? qNum : "?"}
                  </span>

                  <Badge variant="secondary">
                    {v.dimension?.replace(/_/g, " ")}
                  </Badge>
                </div>

                {/* Behavioral Evidence */}
                {v.behavioral_evidence?.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <MousePointer className="w-4 h-4" />
                      Behavioral Evidence
                    </div>

                    <ul className="list-disc pl-5 text-sm text-muted-foreground">
                      {v.behavioral_evidence.map((ev: string, i: number) => (
                        <li key={i}>{ev}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* AI Linguistic Analysis */}
                {v.ai_analysis && v.ai_analysis.length > 10 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Brain className="w-4 h-4" />
                      Linguistic Analysis
                    </div>

                    <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                      {v.ai_analysis}
                    </div>
                  </div>
                )}

                {/* Multi-tier detection */}
                {v.ai_detection?.composite_score > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Layers className="w-4 h-4 text-primary" />
                      Multi-Tier Detection
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="destructive">
                        Composite:{" "}
                        {Math.round(v.ai_detection.composite_score * 100)}%
                      </Badge>

                      <Badge variant="outline">
                        {v.ai_detection.verdict?.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                )}

              </div>
            );
          })}

        </CardContent>
      </Card>

    ) : report.ai_signals.likely_used_ai ? (

      <Card className="mb-6">
        <CardContent className="p-6">

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />

            <AlertTitle>
              Potential AI Assistance Detected
            </AlertTitle>

            <AlertDescription>
              {report.ai_signals.surface_level_answers} questions had surface-level answers.
              {" "}
              {report.red_flags.length} red flags found.
            </AlertDescription>
          </Alert>

        </CardContent>
      </Card>

    ) : null}


  {/* Violation Breakdown Table */}
  {report.violation_breakdown && (

    <Card className="mb-8">

      {/* HEADER */}
      <CardHeader className="flex flex-row items-center justify-between">

        <CardTitle className="flex items-center gap-2 text-[var(--color-primary)]">
          <Notebook size={18} />
          Rule Violation Breakdown
        </CardTitle>

        <Badge
          variant={
            report.violation_breakdown.integrity_risk === "CRITICAL"
              ? "destructive"
              : report.violation_breakdown.integrity_risk === "HIGH"
              ? "destructive"
              : report.violation_breakdown.integrity_risk === "MEDIUM"
              ? "secondary"
              : "outline"
          }
        >
          {report.violation_breakdown.integrity_risk} RISK —{" "}
          {report.violation_breakdown.total_violations} total
        </Badge>

      </CardHeader>

      {/* TABLE WRAPPER (IMPORTANT FIX) */}
      <CardContent>

        <div className="border rounded-md overflow-hidden">

          <Table>

            {/* HEADER */}
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>Rule</TableHead>
                <TableHead className="text-center">Count</TableHead>
                <TableHead className="text-center">Severity</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>

            {/* BODY */}
            <TableBody>

              {[
                { key: "tab_switches", icon: Repeat, label: "Tab Switches" },
                { key: "fullscreen_exits", icon: Monitor, label: "Fullscreen Exits" },
                { key: "paste_events", icon: Notebook, label: "Paste Events" },
                { key: "camera_no_face", icon: User, label: "No Face Detected" },
                { key: "camera_multiple_faces", icon: Users, label: "Multiple Faces" },
                { key: "screenshot_attempts", icon: Camera, label: "Screenshot Attempts" },
                { key: "focus_losses", icon: Flashlight, label: "Focus Losses" },
              ].map(({ key, icon: Icon, label }) => {

                const v = (report.violation_breakdown as any)[key] || {
                  count: 0,
                  severity: "none",
                  description: "",
                };

                return (
                  <TableRow key={key} className="hover:bg-muted/40">

                    {/* RULE */}
                    <TableCell className="flex items-center gap-2 font-medium">
                      <Icon className="w-4 h-4 text-[var(--color-primary)]" />
                      {label}
                    </TableCell>

                    {/* COUNT */}
                    <TableCell className="text-center">
                      <span className={v.count > 0 ? "text-red-500 font-bold text-lg" : "text-muted-foreground"}>
                        {v.count}
                      </span>
                    </TableCell>

                    {/* SEVERITY (MULTI COLOR FIX 🔥) */}
                    <TableCell className="text-center">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          v.severity === "critical"
                            ? "bg-red-100 text-red-700"
                            : v.severity === "high"
                            ? "bg-orange-100 text-orange-700"
                            : v.severity === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : v.severity === "low"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {v.severity.toUpperCase()}
                      </span>
                    </TableCell>

                    {/* DESCRIPTION */}
                    <TableCell className="text-muted-foreground text-xs">
                      {v.description}
                    </TableCell>

                  </TableRow>
                );
              })}

            </TableBody>

          </Table>

        </div>

      </CardContent>

    </Card>

  )}

  {/* ─── Proctoring Summary & AI Detection Deep ─── */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

    {/* ───── Proctoring Summary ───── */}
    {report.proctoring_summary && (
      <Card className="shadow-md">

        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[var(--color-primary)]">
            <Camera className="w-5 h-5" />
            Webcam Proctoring Summary
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">

          {/* Status Badge */}
          <Badge
            className="w-fit"
            variant={
              report.proctoring_summary.proctoring_status?.includes("FAILED")
                ? "destructive"
                : report.proctoring_summary.proctoring_status?.includes("WARNING")
                ? "secondary"
                : "default"
            }
          >
            {report.proctoring_summary.proctoring_status}
          </Badge>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">

            {/* No Face */}
            <div className="rounded-lg border p-4 text-center bg-muted/30">
              <div
                className={`text-2xl font-bold ${
                  report.proctoring_summary.no_face_incidents > 0
                    ? "text-red-500"
                    : "text-green-600"
                }`}
              >
                {report.proctoring_summary.no_face_incidents}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                No Face Incidents
              </p>
            </div>

            {/* Multiple Faces */}
            <div className="rounded-lg border p-4 text-center bg-muted/30">
              <div
                className={`text-2xl font-bold ${
                  report.proctoring_summary.multiple_face_incidents > 0
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {report.proctoring_summary.multiple_face_incidents}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Multiple Faces
              </p>
            </div>

          </div>

        </CardContent>
      </Card>
    )}

    {/* ───── AI Detection ───── */}
    {report.ai_detection_deep && (
      <Card className="shadow-md">

        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-[var(--color-primary)]">
            <Cpu className="w-5 h-5" />
            Multi-Tier AI Detection
          </CardTitle>

          <Badge
            variant={
              report.ai_detection_deep.verdict === "LIKELY_AI_ASSISTED"
                ? "destructive"
                : report.ai_detection_deep.verdict === "POSSIBLY_AI_ASSISTED"
                ? "secondary"
                : "default"
            }
          >
            {report.ai_detection_deep.verdict?.replace(/_/g, " ")}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-5">

          {/* Composite Score */}
          <div>
            <div className="flex justify-between text-xs mb-1 text-muted-foreground">
              <span>Composite AI Score</span>
              <span className="font-semibold text-foreground">
                {Math.round((report.ai_detection_deep.composite_score || 0) * 100)}%
              </span>
            </div>

            <Progress
              value={Math.round((report.ai_detection_deep.composite_score || 0) * 100)}
              className="h-3"
            />
          </div>

          {/* Tier Breakdown */}
          {[
            { key: "tier1_behavioral", label: "Behavioral", color: "bg-blue-500" },
            { key: "tier2_nlp", label: "NLP", color: "bg-purple-500" },
            { key: "tier3_stylometric", label: "Stylometric", color: "bg-pink-500" },
          ].map(({ key, label, color }) => {
            const tier = (report.ai_detection_deep as any)[key] || { score: 0 };
            const pct = Math.round((tier.score || 0) * 100);

            return (
              <div key={key} className="space-y-1">

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{label}</span>
                  <span className="font-semibold text-foreground">{pct}%</span>
                </div>

                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full ${color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

              </div>
            );
          })}

        </CardContent>
      </Card>
    )}

  </div>

      {/* Dimension Scores Overview */}
      <div className="dimensions-overview">
        <h3 className='text-[var(--color-primary)]'>Dimension Scores</h3>
        <div className="dimensions-bars">
          {Object.entries(report.dimensions).map(([dim, data]) => (
            <DimensionReport
              key={dim}
              dimension={dim}
              data={data}
              questions={questions}
            />
          ))}
        </div>
      </div>
      
    {/* Red Flags */}
    <Card className="mb-6 border border-border shadow-sm">
      
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-[var(--color-primary)]">
          <AlertCircle className="w-5 h-5 text-red-500" />
          Red Flags
        </CardTitle>

        <Badge
          variant={report.red_flags.length > 0 ? "destructive" : "secondary"}
          className="rounded-full"
        >
          {report.red_flags.length} issues
        </Badge>
      </CardHeader>

      <CardContent>
        {report.red_flags.length > 0 ? (
          <div className="space-y-2">
            {report.red_flags.map((flag, i) => (
              <div
                key={i}
                className="
                  flex items-start gap-2
                  p-3 rounded-md
                  border border-red-200
                  bg-red-50
                  dark:bg-red-950/20
                "
              >
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />

                <span className="text-sm text-[var(--color-text-primary)]">
                  {flag}
                </span>

                {/* severity pill example */}
                <Badge
                  variant="destructive"
                  className="ml-auto text-xs rounded-full"
                >
                  flagged
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="
              flex items-center gap-2
              text-sm text-muted-foreground
              p-3 rounded-md
              bg-green-50 dark:bg-green-950/20
              border border-green-200
            "
          >
            <CheckCircle className="w-4 h-4 text-green-500" />
            No red flags detected
          </div>
        )}
      </CardContent>
    </Card>
    {/* Actions */}
    <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-3 mt-6">

      {/* Back */}
      <Button
        variant="outline"
        onClick={() => router.back()}
        className="gap-2 w-full md:w-auto"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      {/* Right actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">

        {/* TXT Download */}
        <Button
          variant="secondary"
          onClick={handleDownload}
          className="gap-2 w-full sm:w-auto"
        >
          <Download className="w-4 h-4" />
          Download Report
        </Button>

        {/* PDF Download */}
        <Button
          onClick={downloadPDF}
          disabled={downloadingPdf}
          className="gap-2 w-full sm:w-auto"
        >
          {downloadingPdf ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download PDF
            </>
          )}
        </Button>

      </div>
    </div>
    </div>
    </DashboardLayout>
  )
}

export default function ResultsPage() {
  return (
    <ReportErrorBoundary>
      <ResultsPageInner />
    </ReportErrorBoundary>
  )
}
