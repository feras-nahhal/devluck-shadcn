"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

const labelMap: Record<string, string> = {
  company: "Company",
  student: "Student",
  dashboard: "Dashboard",
  profile: "Profile",
  opportunities: "Opportunities",
  jobs: "Jobs",
  auth: "Auth",
};

export default function TitleUpdater() {
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    if (!pathname) return;

    const parts = pathname.split("/").filter(Boolean);

    const formatted =
      parts.length > 0
        ? parts
            .map((p) => labelMap[p.toLowerCase()] || capitalize(p))
            .join(" / ")
        : "Home";

    const userPart = user?.email?.split("@")[0]; // or user.name if you have it

    document.title = userPart
      ? `${userPart} · ${formatted}`
      : `DevLuck · ${formatted}`;
  }, [pathname, user]);

  return null;
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}