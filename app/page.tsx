"use client";

import React, { useMemo } from "react";
import { FolderKanban, CheckSquare, Timer, StickyNote } from "lucide-react";
import { useStore } from "@/store/useStore";
import { getGreeting } from "@/lib/date";
import { PageTransition } from "@/components/shared/PageTransition";
import { KpiCard } from "@/components/features/dashboard/KpiCard";
import { ActivityFeed } from "@/components/features/dashboard/ActivityFeed";
import { ActivityChart } from "@/components/features/dashboard/ActivityChart";
import { MiniPomodoro } from "@/components/features/dashboard/MiniPomodoro";

export default function DashboardPage() {
  const projects = useStore((s) => s.projects);
  const notes = useStore((s) => s.notes);
  const pomodoroSessions = useStore((s) => s.pomodoroSessions);
  const hasHydrated = useStore((s) => s._hasHydrated);

  const kpis = useMemo(() => {
    const totalProjects = projects.length;
    const totalTasks = projects.reduce((a, p) => a + p.tasks.length, 0);
    const completedTasks = projects.reduce(
      (a, p) => a + p.tasks.filter((t) => t.completed).length,
      0
    );

    // Focus hours this week
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeekSessions = pomodoroSessions.filter(
      (s) => new Date(s.completedAt) >= weekAgo
    );
    const lastWeekSessions = pomodoroSessions.filter(
      (s) => new Date(s.completedAt) >= twoWeeksAgo && new Date(s.completedAt) < weekAgo
    );

    const focusHoursThisWeek = Math.round(
      (thisWeekSessions.reduce((a, s) => a + s.duration, 0) / 60) * 10
    ) / 10;
    const focusHoursLastWeek =
      lastWeekSessions.reduce((a, s) => a + s.duration, 0) / 60;

    const focusTrend =
      focusHoursLastWeek > 0
        ? Math.round(
            ((focusHoursThisWeek - focusHoursLastWeek) / focusHoursLastWeek) * 100
          )
        : focusHoursThisWeek > 0
        ? 100
        : 0;

    return {
      totalProjects,
      completedTasks,
      totalTasks,
      focusHoursThisWeek,
      focusTrend,
      totalNotes: notes.length,
    };
  }, [projects, notes, pomodoroSessions]);

  if (!hasHydrated) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="pt-2 lg:pt-0">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            {getGreeting()} 👋
          </h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            Aquí tienes un resumen de tu productividad
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Proyectos activos"
            value={kpis.totalProjects}
            icon={FolderKanban}
            color="bg-gradient-to-br from-brand-500 to-brand-700"
            delay={0}
          />
          <KpiCard
            title="Tareas completadas"
            value={`${kpis.completedTasks}/${kpis.totalTasks}`}
            icon={CheckSquare}
            color="bg-gradient-to-br from-emerald-500 to-emerald-700"
            trend={kpis.totalTasks > 0 ? Math.round((kpis.completedTasks / kpis.totalTasks) * 100) : 0}
            delay={1}
          />
          <KpiCard
            title="Horas de foco (semana)"
            value={`${kpis.focusHoursThisWeek}h`}
            icon={Timer}
            color="bg-gradient-to-br from-amber-500 to-amber-700"
            trend={kpis.focusTrend}
            delay={2}
          />
          <KpiCard
            title="Notas totales"
            value={kpis.totalNotes}
            icon={StickyNote}
            color="bg-gradient-to-br from-purple-500 to-purple-700"
            delay={3}
          />
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ActivityChart />
          </div>
          <div>
            <MiniPomodoro />
          </div>
        </div>

        {/* Activity Feed */}
        <ActivityFeed />
      </div>
    </PageTransition>
  );
}
