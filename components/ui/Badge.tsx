"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const variants = {
  default: "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300",
  success: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400",
  info: "bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
