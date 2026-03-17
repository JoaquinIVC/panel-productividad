"use client";

import { motion } from "framer-motion";
import { Play, Pause, RotateCcw } from "lucide-react";
import { usePomodoro } from "@/hooks/usePomodoro";
import { formatTime } from "@/lib/date";

export function MiniPomodoro() {
  const { status, secondsLeft, progress, isBreak, start, pause, resume, reset } =
    usePomodoro();

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-4">
        Pomodoro
      </h3>
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <svg width="88" height="88" className="-rotate-90">
            <circle
              cx="44"
              cy="44"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-surface-200 dark:text-surface-700"
            />
            <motion.circle
              cx="44"
              cy="44"
              r={radius}
              fill="none"
              stroke={isBreak ? "#10b981" : "#5c7cfa"}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-surface-900 dark:text-white">
              {formatTime(secondsLeft)}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400">
            {isBreak ? "Descanso" : "Trabajo"}
          </p>
          <div className="flex gap-1.5">
            {status === "idle" || status === "paused" ? (
              <button
                onClick={status === "paused" ? resume : start}
                className="rounded-lg bg-brand-500 p-2 text-white hover:bg-brand-600 transition-colors"
              >
                <Play className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={pause}
                className="rounded-lg bg-amber-500 p-2 text-white hover:bg-amber-600 transition-colors"
              >
                <Pause className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={reset}
              className="rounded-lg bg-surface-200 dark:bg-surface-700 p-2 hover:bg-surface-300 dark:hover:bg-surface-600 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
