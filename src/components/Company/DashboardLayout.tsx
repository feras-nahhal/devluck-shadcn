"use client"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>  {/* ✅ Single provider here */}
        <AppSidebar />
        <SidebarInset>  {/* ✅ Wraps content - fixes skewing */}
          <main className="p-2">
              <SidebarTrigger/>
              {/* Add your page title/breadcrumbs here */}
              {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
  )
}