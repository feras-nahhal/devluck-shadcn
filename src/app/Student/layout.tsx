"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

import { CircleLoader } from "react-spinners";

import DashboardLayout from "@/components/Student/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider } from "@/lib/sidebarContext";
export default function StudentLayout({ children }: { children: React.ReactNode }) {
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
    
    if (user.role !== "STUDENT") {
      if (!pathname.startsWith("/Company")) {
        hasRedirected.current = true;
        router.push("/Company/dashboard");
      }
      return;
    }

    hasRedirected.current = false;
  }, [user, loading, isAuthenticated, router, pathname]);

  if (loading) {
      return (
        <SidebarProvider>
          <DashboardLayout>
            <div className="flex flex-1 items-center justify-center min-h-[calc(100vh-64px)]">
              <CircleLoader size={50} color="#D4AF37" />
            </div>
          </DashboardLayout>
        </SidebarProvider>
      );
    }

  if (!isAuthenticated || !user || user.role !== "STUDENT") {
    return null;
  }

  // ✅ NORMAL RENDER
  return (
    <SidebarProvider>
      <div className="company-animated-bg min-h-screen w-full">
      {children}
      </div>
    </SidebarProvider>
  );
}
