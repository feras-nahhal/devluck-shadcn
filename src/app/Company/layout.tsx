"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoadingState } from "@/components/common/LoadingState";
import DashboardLayout from "@/components/Company/DashboardLayout";
import { SidebarProvider } from "@/lib/sidebarContext";


export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current || loading) return;

    if (!isAuthenticated || !user) {
      if (pathname !== "/auth") {
        hasRedirected.current = true;
        router.push("/auth");
      }
      return;
    }
    
    if (user.role !== "COMPANY") {
      if (!pathname.startsWith("/Student")) {
        hasRedirected.current = true;
        router.push("/Student/dashboard");
      }
      return;
    }

    hasRedirected.current = false;
  }, [user, loading, isAuthenticated, router, pathname]);

   // ✅ LOADING — SidebarProvider MUST exist
  if (loading) {
    return (
      <SidebarProvider>
        <DashboardLayout>
          <div className="flex flex-1 items-center justify-center min-h-[calc(100vh-64px)]">
            <LoadingState  />
          </div>
        </DashboardLayout>
      </SidebarProvider>
    );
  }

  if (!isAuthenticated || !user || user.role !== "COMPANY") {
    return null;
  }

  // ✅ NORMAL RENDER
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full">
      {children}
      </div>
    </SidebarProvider>
  );
}
