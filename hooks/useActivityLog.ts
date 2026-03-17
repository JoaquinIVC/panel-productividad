"use client";

import { useStore, type ActivityType } from "@/store/useStore";

export function useActivityLog() {
  const activityLog = useStore((s) => s.activityLog);
  const logActivity = useStore((s) => s.logActivity);

  const recentActivities = activityLog.slice(0, 10);

  const getActivitiesByType = (type: ActivityType) =>
    activityLog.filter((a) => a.type === type);

  const getActivitiesLast7Days = () => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return activityLog.filter((a) => new Date(a.timestamp) >= sevenDaysAgo);
  };

  const getDailyActivityCounts = () => {
    const now = new Date();
    const days: { day: string; count: number; date: string }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().slice(0, 10);
      const dayName = date.toLocaleDateString("es-CL", { weekday: "short" });
      const count = activityLog.filter(
        (a) => a.timestamp.slice(0, 10) === dateStr
      ).length;
      days.push({ day: dayName, count, date: dateStr });
    }

    return days;
  };

  return {
    activityLog,
    recentActivities,
    logActivity,
    getActivitiesByType,
    getActivitiesLast7Days,
    getDailyActivityCounts,
  };
}
