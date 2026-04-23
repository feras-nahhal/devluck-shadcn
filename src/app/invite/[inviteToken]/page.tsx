"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { tokenStorage } from "@/lib/auth/token";
import { api as apiClient } from "@/lib/api";

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
        } else {
          setInvite(found);
          setError(null);
        }
      } catch (err: any) {
        if (!mounted) return;
        setError(err.response?.data?.message || "Invalid or expired invite link");
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
      <div className="invite-page">
        <div className="invite-card">
          <h2>Checking your invite</h2>
          <p>Please wait a moment...</p>
        </div>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="invite-page">
        <div className="invite-card invite-error-card">
          <div className="invite-error-icon">!</div>
          <h2>Invite Not Valid</h2>
          <p>{error || "This invite link is invalid or expired."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="invite-page">
      <div className="invite-card">
        <div className="invite-welcome">
          <h2>Welcome{invite.candidateName ? `, ${invite.candidateName}` : ""}</h2>
          <p className="invite-desc">You have been invited to start a private assessment.</p>
        </div>

        <div className="invite-details">
          <div className="invite-detail-row">
            <span className="invite-label">Role</span>
            <span className="invite-value">{invite.opportunity?.title}</span>
          </div>
          <div className="invite-detail-row">
            <span className="invite-label">Company</span>
            <span className="invite-value">{invite.company?.name}</span>
          </div>
          <div className="invite-detail-row">
            <span className="invite-label">Style</span>
            <span className="invite-value invite-style-badge">{invite.opportunity?.companyStyle || "standard"}</span>
          </div>
        </div>

        <button className="btn-enter-fullscreen" onClick={() => router.push(`/prepare/${inviteToken}`)}>
          Continue
        </button>
      </div>
    </div>
  );
}
