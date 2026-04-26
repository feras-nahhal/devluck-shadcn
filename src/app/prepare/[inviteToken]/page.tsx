"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/api/questions";
import { tokenStorage } from "@/lib/auth/token";
import { api as apiClient } from "@/lib/api";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { toast } from "sonner";


type PrepState = "starting" | "generating" | "ready" | "error";

export default function PreparationPage() {
  const { inviteToken } = useParams<{ inviteToken: string }>();
  const router = useRouter();
  const [state, setState] = useState<PrepState>("starting");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (state !== "generating") return;
    const timer = setInterval(() => setElapsedSecs((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [state]);

  useEffect(() => {
    if (!inviteToken || startedRef.current) return;
    startedRef.current = true;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let slowToastShown = false;
    
    const start = async () => {
      if (!tokenStorage.get()) {
        router.replace(`/auth?next=${encodeURIComponent(`/prepare/${inviteToken}`)}`);
        return;
      }
      setState("generating");
      try {
        const res = await apiClient.post(`/api/student/assessment/invites/${inviteToken}/start`);
        const sid = res.data?.data?.sessionId;
        setSessionId(sid);

        if (res.data?.data?.questionsGenerated > 0 || (res.data?.data?.alreadyStarted && res.data?.data?.aiStatus !== "generating")) {
          setState("ready");
          return;
        }

        let tries = 0;
        pollTimer = setInterval(async () => {
          tries += 1;
          try {
            const sessionRes = await api.getSession(sid);
            const questions = sessionRes.data.questions || [];
            if (questions.length > 0) {
              if (pollTimer) clearInterval(pollTimer);
              setState("ready");
              return;
            }

            // show toast sooner (after ~15 sec)
            if (tries >= 5 && !slowToastShown) {
              slowToastShown = true;

              toast.info(
                "Still preparing your assessment. This can take a little longer than usual."
              );
            }
          
            if (sessionRes.data.status === "error" || tries >= 60) {
              if (pollTimer) clearInterval(pollTimer);
              setError("Assessment preparation is taking too long. Please retry.");
              setState("error");
              toast.error("Assessment preparation is taking too long. Please retry.")
            }
          } catch {
            if (tries >= 60) {
              if (pollTimer) clearInterval(pollTimer);
              setError("Could not prepare assessment right now. Please retry.");
              setState("error");
              toast.error("Could not prepare assessment right now. Please retry.")
            }
          }
        }, 3000);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to start assessment from invite");
        setState("error");
        toast.error("Failed to start assessment from invite")
      }
    };

    start();
    return () => {
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [inviteToken, router]);

  if (state === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <ErrorState
              title="Could Not Prepare Assessment"
              description={error || "Something went wrong."}
            />

            <Button
              className="mt-6 w-full"
              onClick={() => router.push(`/invite/${inviteToken}`)}
            >
              Back to Invite
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === "ready" && sessionId) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Your assessment is ready</CardTitle>
            <CardDescription>You can start now.</CardDescription>
          </CardHeader>

          <CardContent>
            <Button
              className="w-full"
              onClick={() =>
                router.replace(
                  `/Student/applied-Opportunity/invite/assessment?sessionId=${sessionId}&source=invite`
                )
              }
            >
              Start Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <LoadingState label="Preparing your private assessment..." />

          <div className="mt-4 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Please wait 2–3 minutes while we generate your questions.
            </p>

            <Badge variant="secondary">{elapsedSecs}s elapsed</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
