"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  iconColor?: string; // 👈 new
  className?: string;
  onClick?: () => void;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  iconColor = "#6B7280", // default soft gray (Apple-like neutral)
  className,
  onClick,
}: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card
        onClick={onClick}
        className={cn(
          "border bg-card backdrop-blur-md",
          "shadow-sm hover:shadow-md transition-all",
          className
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>

          {icon && (
            <div
              className="flex items-center justify-center"
              style={{ color: iconColor }}
            >
              {icon}
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-semibold tracking-tight">
            {value}
          </div>

          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}