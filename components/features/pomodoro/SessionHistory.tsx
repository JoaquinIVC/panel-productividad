"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { formatDateShort } from "@/lib/date";
import type { PomodoroSession } from "@/store/useStore";

interface SessionHistoryProps {
  sessions: PomodoroSession[];
}

export function SessionHistory({ sessions }: SessionHistoryProps) {
  const recentSessions = sessions.slice(-10).reverse();

  if (recentSessions.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-4">
          Historial de sesiones
        </h3>
        <p className="text-sm text-surface-500 dark:text-surface-400 text-center py-6">
          No hay sesiones completadas aún
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-4">
        Historial de sesiones
      </h3>
      <div className="space-y-2">
        {recentSessions.map((session, i) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-800/50"
          >
            <div className="rounded-lg bg-brand-500/10 p-1.5">
              <Clock className="h-3.5 w-3.5 text-brand-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-surface-700 dark:text-surface-300">
                {session.duration} min
                {session.projectName && (
                  <span className="text-surface-400 dark:text-surface-500">
                    {" · "}{session.projectName}
                  </span>
                )}
              </p>
              <p className="text-xs text-surface-400 dark:text-surface-500">
                {formatDateShort(session.completedAt)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
