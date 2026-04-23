"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";



export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !user) {
      router.push("/auth");
      return;
    }
 
    if (user.role === "COMPANY") {
      router.push("/Company/dashboard");
    } else if (user.role === "STUDENT") {
      router.push("/Student/dashboard");
    } else {
      router.push("/auth");
    }
  }, [user, isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="text-[#1E1E1E]">Redirecting...</div>
    </div>
  );
}
