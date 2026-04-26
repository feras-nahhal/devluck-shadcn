"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { tokenStorage } from "@/lib/auth/token";
import { api as apiClient } from "@/lib/api";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type InviteData = {
  candidateName?: string;
  opportunity: {
    title: string;
    companyStyle?: string;
  };
  company: {
    name: string;
  };
};

export default function InvitePage() {
  const { inviteToken } = useParams<{ inviteToken: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState<InviteData | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadInvite = async () => {
      if (!inviteToken) return;
      if (!tokenStorage.get()) {
        router.replace(`/auth?next=${encodeURIComponent(`/invite/${inviteToken}`)}`);
        return;
      }
      try {
        const res = await apiClient.get("/api/student/assessment/invites");
        const list = res.data?.data || [];
        const found = list.find((item: any) => item.inviteToken === inviteToken);
        if (!mounted) return;
        if (!found) {
          setError("Invite not found for your account");
          toast.error("Invite not found for your account");
        } else {
          setInvite(found);
          setError(null);
        }
      } catch (err: any) {
        if (!mounted) return;
        setError(err.response?.data?.message || "Invalid or expired invite link");
        toast.error("Invalid or expired invite link");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadInvite();
    return () => {
      mounted = false;
    };
  }, [inviteToken, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
          <LoadingState label="Checking your invite..." />
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md ">
          <ErrorState
            title="Invite Not Valid"
            description={error || "This invite link is invalid or expired."}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-xl shadow-sm border">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Welcome
            {invite.candidateName ? `, ${invite.candidateName}` : ""}
          </CardTitle>

          <CardDescription>
            You have been invited to start a private assessment.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* DETAILS */}
          <div className="rounded-xl border divide-y">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">Role</span>
              <span className="font-medium">
                {invite.opportunity?.title || "Not specified"}
              </span>
            </div>

            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">Company</span>
              <span className="font-medium">
                {invite.company?.name || "Not specified"}
              </span>
            </div>

            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">Style</span>

              <Badge variant="secondary" className="capitalize">
                {invite.opportunity?.companyStyle || "standard"}
              </Badge>
            </div>
          </div>

          {/* ACTION */}
          <Button
            className="w-full h-11 rounded-xl text-base font-semibold"
            onClick={() => router.push(`/prepare/${inviteToken}`)}
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
