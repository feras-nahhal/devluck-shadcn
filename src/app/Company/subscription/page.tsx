"use client"

import { useEffect, useMemo, useState } from "react"
import DashboardLayout from "@/components/Company/DashboardLayout"
import { useCompanyBillingHandler } from "@/hooks/companyapihandler/useCompanyBillingHandler"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import DecryptedText from "@/components/ui/DecryptedText"
import { Activity, AlertTriangle, Check, Crown, Sparkles } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function CompanySubscriptionPage() {
  const {
    loading,
    error,
    getSubscriptionStatus,
    getApplicantQuotaStatus,
    createCheckoutSession,
    cancelSubscription,
    clearError
  } = useCompanyBillingHandler()
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)
  const [subscriptionCurrentPeriodEnd, setSubscriptionCurrentPeriodEnd] = useState<string | null>(null)
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false)
  const [basicQuestionCountOptions, setBasicQuestionCountOptions] = useState<number[]>([5, 10])
  const [proQuestionCountOptions, setProQuestionCountOptions] = useState<number[]>([5, 10, 15, 20])
  const [applicantsUsed, setApplicantsUsed] = useState(0)
  const [applicantLimit, setApplicantLimit] = useState(0)
  const [applicantRemaining, setApplicantRemaining] = useState(0)
  const [applicantPeriodEnd, setApplicantPeriodEnd] = useState<string | null>(null)
  const [upgrading, setUpgrading] = useState(false)
  const [cancelingEndPeriod, setCancelingEndPeriod] = useState(false)
  const [cancelingNow, setCancelingNow] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const refreshSubscriptionStatus = async () => {
    await Promise.all([
      getSubscriptionStatus()
        .then((data) => {
          setSubscriptionStatus(data.subscriptionStatus)
          setSubscriptionCurrentPeriodEnd(data.subscriptionCurrentPeriodEnd)
          setCancelAtPeriodEnd(Boolean(data.cancelAtPeriodEnd))
          setBasicQuestionCountOptions(
            Array.isArray(data.basicQuestionCountOptions) && data.basicQuestionCountOptions.length > 0
              ? data.basicQuestionCountOptions
              : [5, 10]
          )
          setProQuestionCountOptions(
            Array.isArray(data.proQuestionCountOptions) && data.proQuestionCountOptions.length > 0
              ? data.proQuestionCountOptions
              : [5, 10, 15, 20]
          )
        }),
      getApplicantQuotaStatus()
        .then((data) => {
          setApplicantsUsed(data.used)
          setApplicantLimit(data.limit)
          setApplicantRemaining(data.remaining)
          setApplicantPeriodEnd(data.periodEnd)
        })
    ]).catch(() => undefined)
  }

  useEffect(() => {
    refreshSubscriptionStatus().finally(() => setInitialLoading(false))
  }, [getSubscriptionStatus])

  const isPro = useMemo(() => {
    return subscriptionStatus === "active" || subscriptionStatus === "trialing"
  }, [subscriptionStatus])

  const currentPlanLabel = isPro ? "Pro" : "Basic"
  const statusLabel = useMemo(() => {
    if (!subscriptionStatus) return "No active subscription"
    if (subscriptionStatus === "canceled") return "Canceled"
    if (cancelAtPeriodEnd) return "Active (cancels at period end)"
    return subscriptionStatus
  }, [subscriptionStatus, cancelAtPeriodEnd])

  const handleUpgradeToPro = async () => {
    setUpgrading(true)
    clearError()
    try {
      const data = await createCheckoutSession()
      if (!data.checkoutUrl) {
        throw new Error("Missing Stripe checkout URL")
      }
      window.location.href = data.checkoutUrl
    } catch (err: any) {
      toast.error(err.message || "Failed to start upgrade flow")
    } finally {
      setUpgrading(false)
    }
  }

  const handleCancelAtPeriodEnd = async () => {
    const confirmed = window.confirm("Cancel Pro at period end? You will keep Pro access until the end of the current billing period.")
    if (!confirmed) return

    setCancelingEndPeriod(true)
    clearError()
    try {
      await cancelSubscription(false)
      await refreshSubscriptionStatus()
      toast.success("Subscription cancellation scheduled")
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel subscription")
    } finally {
      setCancelingEndPeriod(false)
    }
  }

  const handleCancelNow = async () => {
    const confirmed = window.confirm("Cancel Pro immediately? Access to Pro features will end right away.")
    if (!confirmed) return

    setCancelingNow(true)
    clearError()
    try {
      await cancelSubscription(true)
      await refreshSubscriptionStatus()
      toast.success("Subscription canceled immediately")
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel subscription now")
    } finally {
      setCancelingNow(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">

          {/* LEFT SIDE */}
          <div>
            <motion.h1
              className="text-3xl font-bold tracking-tight"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <DecryptedText
                text="Subscription"
                speed={40}
                maxIterations={20}
                className="revealed"
                parentClassName="inline-block"
              />
            </motion.h1>

            <p className="text-muted-foreground mt-1 text-sm">
              {initialLoading
                ? "Loading your subscription..."
                : `Manage your plan and billing details`}
            </p>
          </div>

          {/* RIGHT SIDE (PLAN BADGE) */}
          {!initialLoading && (
            <Badge variant={isPro ? "default" : "secondary"} className="text-sm px-3 py-1">
              {currentPlanLabel}
            </Badge>
          )}

        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-muted/60 shadow-sm hover:shadow-md transition-all">

            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  Basic
                </CardTitle>

                <span className="text-xs bg-muted px-2 py-1 rounded-md font-medium">
                  Free
                </span>
              </div>

              <CardDescription>
                For standard usage
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col flex-1 space-y-4">

              {/* Features */}
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Assessment options: {basicQuestionCountOptions.join(", ")}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Max questions: {basicQuestionCountOptions[basicQuestionCountOptions.length - 1]}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  No billing required
                </li>
              </ul>

              {/* CTA / Status pinned to bottom */}
              <div className="mt-auto pt-4">
                <Button variant="secondary" className="w-full" disabled>
                  Current Plan
                </Button>
              </div>

            </CardContent>
          </Card>

          <Card className="border-primary/40 shadow-md hover:shadow-lg transition-all relative">

            {/* 🔥 Recommended Badge */}
            <div className="absolute -top-3 right-4">
              <span className="text-xs bg-primary text-white px-3 py-1 rounded-full font-medium shadow">
                Most Popular
              </span>
            </div>

            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  Pro
                </CardTitle>

                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-medium">
                  Paid
                </span>
              </div>

              <CardDescription>
                For advanced assessment usage
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">

              {/* Features */}
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Assessment options: {proQuestionCountOptions.join(", ")}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Max questions: {proQuestionCountOptions[proQuestionCountOptions.length - 1]}
                </li>
              </ul>

              {/* STATE */}
              {initialLoading ? (
                <p className="text-sm text-muted-foreground">
                  Fetching subscription details...
                </p>
              ) : isPro ? (
                <div className="space-y-3 text-sm">

                  {/* Status */}
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Status:</span>
                    <span className="font-medium text-foreground">{statusLabel}</span>
                  </div>

                  {subscriptionCurrentPeriodEnd && (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Renews:</span>
                      <span className="text-xs">
                        {new Date(subscriptionCurrentPeriodEnd).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-3 flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleCancelAtPeriodEnd}
                      disabled={initialLoading || loading || cancelingEndPeriod || cancelAtPeriodEnd}
                    >
                      {cancelingEndPeriod
                        ? "Scheduling..."
                        : cancelAtPeriodEnd
                          ? "Scheduled"
                          : "Cancel at Period End"}
                    </Button>

                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleCancelNow}
                      disabled={initialLoading || loading || cancelingNow}
                    >
                      {cancelingNow ? "Canceling..." : "Cancel Now"}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleUpgradeToPro}
                  className="w-full"
                  disabled={initialLoading || loading || upgrading}
                >
                  {upgrading ? "Redirecting..." : "Upgrade to Pro"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm hover:shadow-md transition-all">

          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Monthly Applicant Quota
            </CardTitle>

            <CardDescription>
              Applicants counted across all jobs in the current calendar month
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-sm">

            {initialLoading ? (
              <p className="text-muted-foreground">
                Loading quota details...
              </p>
            ) : (
              <>
                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Usage</span>
                    <span>{applicantsUsed} / {applicantLimit}</span>
                  </div>

                    <Progress
                      value={
                        applicantLimit > 0
                          ? Math.min((applicantsUsed / applicantLimit) * 100, 100)
                          : 0
                      }
                    />
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="rounded-md border p-2">
                    <p className="text-xs text-muted-foreground">Used</p>
                    <p className="font-semibold">{applicantsUsed}</p>
                  </div>

                  <div className="rounded-md border p-2">
                    <p className="text-xs text-muted-foreground">Limit</p>
                    <p className="font-semibold">{applicantLimit}</p>
                  </div>

                  <div className="rounded-md border p-2">
                    <p className="text-xs text-muted-foreground">Left</p>
                    <p className="font-semibold">{applicantRemaining}</p>
                  </div>
                </div>

                {/* Reset info */}
                {applicantPeriodEnd && (
                  <p className="text-xs text-muted-foreground pt-2">
                    Resets on {new Date(applicantPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50/40 dark:bg-red-950/10">
            <CardContent className="pt-6 flex items-start gap-3">

              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />

              <div className="space-y-1">
                <p className="text-sm font-medium text-red-600">
                  Something went wrong
                </p>

                <p className="text-sm text-red-500">
                  {error}
                </p>
              </div>

            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
