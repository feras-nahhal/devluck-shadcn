// src/app/Student/notification/page.tsx
"use client";
import DashboardLayout from "@/components/Student/DashboardLayout";
import NotificationsGrid from "@/components/Student/NotificationsGrid";
import DecryptedText from "@/components/ui/DecryptedText";
import { motion } from "framer-motion";

export default function NotificationPage() {
    return (
        <DashboardLayout>
            <div className="px-4 sm:px-6 lg:px-8 py-6">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">

                {/* TITLE SECTION */}
                <div>
                    <motion.h1
                    className="text-3xl font-bold tracking-tight text-foreground"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    >
                    <DecryptedText
                        text="Notification"
                        speed={40}
                        maxIterations={20}
                        className="revealed"
                        parentClassName="inline-block"
                    />
                    </motion.h1>

                    <p className="text-muted-foreground mt-1">
                    Stay updated with your latest system activity and alerts.
                    </p>
                </div>

                </header>

                <NotificationsGrid />
                
            </div>
        </DashboardLayout>
    );
}   