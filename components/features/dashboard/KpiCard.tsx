"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  trend?: number; // percentage, positive = up
  icon: LucideIcon;
  color: string;
  delay?: number;
}

export function KpiCard({ title, value, trend, icon: Icon, color, delay = 0 }: KpiCardProps) {
  const trendIcon =
    trend === undefined || trend === 0 ? Minus : trend > 0 ? TrendingUp : TrendingDown;
  const trendColor =
    trend === undefined || trend === 0
      ? "text-surface-400"
      : trend > 0
      ? "text-emerald-500"
      : "text-red-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4 }}
      className="glass-card rounded-2xl p-5"
    >
      <div className="flex items-start justify-between">
        <div className={cn("rounded-xl p-2.5", color)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {trend !== undefined && (
          <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
            {React.createElement(trendIcon, { className: "h-3.5 w-3.5" })}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-surface-900 dark:text-white">{value}</p>
        <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">{title}</p>
      </div>
    </motion.div>
  );
}
