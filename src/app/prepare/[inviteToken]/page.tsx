"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/api/questions";
import { tokenStorage } from "@/lib/auth/token";
import { api as apiClient } from "@/lib/api";

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
            if (sessionRes.data.status === "error" || tries >= 60) {
              if (pollTimer) clearInterval(pollTimer);
              setError("Assessment preparation is taking too long. Please retry.");
              setState("error");
            }
          } catch {
            if (tries >= 60) {
              if (pollTimer) clearInterval(pollTimer);
              setError("Could not prepare assessment right now. Please retry.");
              setState("error");
            }
          }
        }, 3000);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to start assessment from invite");
        setState("error");
      }
    };

    start();
    return () => {
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [inviteToken, router]);

  if (state === "error") {
    return (
      <div className="invite-page">
        <div className="invite-card invite-error-card">
          <div className="invite-error-icon">!</div>
          <h2>Could Not Prepare Assessment</h2>
          <p>{error}</p>
          <button className="btn-enter-fullscreen" onClick={() => router.push(`/invite/${inviteToken}`)}>
            Back to Invite
          </button>
        </div>
      </div>
    );
  }

  if (state === "ready" && sessionId) {
    return (
      <div className="invite-page">
        <div className="invite-card">
          <h2>Your assessment is ready</h2>
          <p>You can start now.</p>
          <button
            className="btn-enter-fullscreen"
            onClick={() => router.replace(`/Student/applied-Opportunity/invite/assessment?sessionId=${sessionId}&source=invite`)}
          >
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="invite-page">
      <div className="invite-card">
        <h2>Preparing your private assessment</h2>
        <p>Please wait 2-3 minutes while we generate your questions.</p>
        <p>{elapsedSecs}s elapsed</p>
      </div>
    </div>
  );
}
