"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoadingState } from "@/components/common/LoadingState";
import AuthSystem from "@/components/auth/AuthSystem";

export default function AuthPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current || loading) return;

    if (isAuthenticated && user) {
      const targetPath = user.role === "COMPANY" ? "/Company/dashboard" : "/Student/dashboard";
      if (pathname !== targetPath) {
        hasRedirected.current = true;
        router.push(targetPath);
      }
    }
  }, [user, loading, isAuthenticated, router, pathname]);

  
  if (loading) {
    return <LoadingState label="Loading..." className="min-h-screen" />;
  }

  if (isAuthenticated && user) {
    return null;
  }

  return <AuthSystem initialMode="login" />;
}
