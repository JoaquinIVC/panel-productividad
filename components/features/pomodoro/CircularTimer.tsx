"use client";

import { motion } from "framer-motion";
import { formatTime } from "@/lib/date";

interface CircularTimerProps {
  secondsLeft: number;
  totalSeconds: number;
  progress: number;
  isBreak: boolean;
}

export function CircularTimer({
  secondsLeft,
  totalSeconds,
  progress,
  isBreak,
}: CircularTimerProps) {
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const strokeColor = isBreak ? "#10b981" : "#5c7cfa";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="280" height="280" className="-rotate-90">
        {/* Background circle */}
        <circle
          cx="140"
          cy="140"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-surface-200 dark:text-surface-700"
        />
        {/* Animated progress circle */}
        <motion.circle
          cx="140"
          cy="140"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        {/* Glow effect */}
        <motion.circle
          cx="140"
          cy="140"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          opacity={0.3}
          filter="blur(8px)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-surface-900 dark:text-white tabular-nums">
          {formatTime(secondsLeft)}
        </span>
        <span className="mt-2 text-sm font-medium text-surface-500 dark:text-surface-400">
          {isBreak ? "☕ Descanso" : "🎯 Enfocado"}
        </span>
      </div>
    </div>
  );
}
