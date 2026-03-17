"use client";

import { motion } from "framer-motion";
import { useActivityLog } from "@/hooks/useActivityLog";
import { FolderKanban, CheckSquare, Timer, StickyNote } from "lucide-react";
import { formatRelativeDate } from "@/lib/date";
import type { ActivityType } from "@/store/useStore";

const activityIcons: Record<ActivityType, React.ElementType> = {
  project: FolderKanban,
  task: CheckSquare,
  pomodoro: Timer,
  note: StickyNote,
};

const activityColors: Record<ActivityType, string> = {
  project: "bg-brand-500/10 text-brand-500",
  task: "bg-emerald-500/10 text-emerald-500",
  pomodoro: "bg-amber-500/10 text-amber-500",
  note: "bg-purple-500/10 text-purple-500",
};

export function ActivityFeed() {
  const { recentActivities } = useActivityLog();

  if (recentActivities.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-4">
          Actividad reciente
        </h3>
        <p className="text-sm text-surface-500 dark:text-surface-400 text-center py-8">
          No hay actividad aún. ¡Comienza creando un proyecto!
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-4">
        Actividad reciente
      </h3>
      <div className="space-y-3">
        {recentActivities.map((entry, i) => {
          const Icon = activityIcons[entry.type];
          const colorClass = activityColors[entry.type];
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3"
            >
              <div className={`rounded-lg p-1.5 ${colorClass}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-surface-700 dark:text-surface-300 truncate">
                  {entry.action}
                </p>
                <p className="text-xs text-surface-400 dark:text-surface-500">
                  {formatRelativeDate(entry.timestamp)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
