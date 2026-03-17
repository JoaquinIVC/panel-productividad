'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePomodoroStore } from '@/hooks/usePomodoroStore';
import { progressPercent, daysUntilDeadline, STATUS_LABELS, formatMinutes } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import type { Project, Task } from '@/types/database';

type TimeFilter = 'week' | 'month' | 'all';

export default function DashboardPage() {
  const supabase = createClient();
  const { isRunning, secondsRemaining, currentType } = usePomodoroStore();

  const [filter, setFilter] = useState<TimeFilter>('week');
  const [tasksToday, setTasksToday] = useState(0);
  const [tasksYesterday, setTasksYesterday] = useState(0);
  const [focusHoursToday, setFocusHoursToday] = useState(0);
  const [focusHoursYesterday, setFocusHoursYesterday] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [criticalProjects, setCriticalProjects] = useState<Project[]>([]);
  const [chartData, setChartData] = useState<{ day: string; tareas: number }[]>([]);
  const [recentActivities, setRecentActivities] = useState<{ id: string; action_description: string; created_at: string }[]>([]);

  const fetchDashboardData = useCallback(async () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();

    // Tasks completed today
    const { count: todayCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('is_completed', true)
      .gte('completed_at', todayStart);
    setTasksToday(todayCount ?? 0);

    // Tasks completed yesterday
    const { count: yesterdayCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('is_completed', true)
      .gte('completed_at', yesterdayStart)
      .lt('completed_at', todayStart);
    setTasksYesterday(yesterdayCount ?? 0);

    // Pomodoro focus hours today
    const { data: pomosToday } = await supabase
      .from('pomodoro_sessions')
      .select('duration_minutes')
      .eq('type', 'work')
      .gte('created_at', todayStart);
    const totalMinToday = (pomosToday || []).reduce((sum, p) => sum + p.duration_minutes, 0);
    setFocusHoursToday(totalMinToday);

    // Pomodoro focus hours yesterday
    const { data: pomosYesterday } = await supabase
      .from('pomodoro_sessions')
      .select('duration_minutes')
      .eq('type', 'work')
      .gte('created_at', yesterdayStart)
      .lt('created_at', todayStart);
    const totalMinYesterday = (pomosYesterday || []).reduce((sum, p) => sum + p.duration_minutes, 0);
    setFocusHoursYesterday(totalMinYesterday);

    // Active projects
    const { count: activeCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .in('status', ['planificado', 'en_progreso']);
    setActiveProjects(activeCount ?? 0);

    // Critical projects (deadline < 3 days, not completed)
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const { data: critical } = await supabase
      .from('projects')
      .select('*, tasks(*)')
      .neq('status', 'completado')
      .not('deadline', 'is', null)
      .lte('deadline', threeDaysFromNow)
      .order('deadline', { ascending: true });
    setCriticalProjects(critical || []);

    // Chart: last 7 days
    const days: { day: string; tareas: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const nextD = new Date(d.getTime() + 24 * 60 * 60 * 1000);
      const { count } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', true)
        .gte('completed_at', d.toISOString())
        .lt('completed_at', nextD.toISOString());
      days.push({
        day: d.toLocaleDateString('es-AR', { weekday: 'short' }),
        tareas: count ?? 0,
      });
    }
    setChartData(days);

    // Recent activities
    const { data: activities } = await supabase
      .from('activity_log')
      .select('id, action_description, created_at')
      .order('created_at', { ascending: false })
      .limit(8);
    setRecentActivities(activities || []);
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await fetchDashboardData();
    };

    if (isMounted) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [fetchDashboardData]);

  const trendIcon = (current: number, previous: number) => {
    if (previous === 0) return <span className="text-gray-500 text-xs">—</span>;
    const diff = current - previous;
    if (diff > 0) return <span className="text-emerald-400 text-xs">▲ +{diff}</span>;
    if (diff < 0) return <span className="text-red-400 text-xs">▼ {diff}</span>;
    return <span className="text-gray-400 text-xs">= 0</span>;
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  };

  return (
    <div className="space-y-6">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Vista general de tu productividad</p>
        </div>
        {/* Filter */}
        <div className="flex gap-1 p-1 bg-gray-800/50 rounded-xl border border-gray-700/50">
          {(['week', 'month', 'all'] as TimeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {f === 'week' ? 'Semana' : f === 'month' ? 'Mes' : 'Todo'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={0} className="bg-gray-900/80 backdrop-blur border border-gray-800/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Tareas completadas hoy</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{tasksToday}</p>
          <div className="mt-1">{trendIcon(tasksToday, tasksYesterday)} <span className="text-xs text-gray-500">vs ayer</span></div>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={1} className="bg-gray-900/80 backdrop-blur border border-gray-800/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Horas de foco</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{formatMinutes(focusHoursToday)}</p>
          <div className="mt-1">{trendIcon(focusHoursToday, focusHoursYesterday)} <span className="text-xs text-gray-500">vs ayer</span></div>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={2} className="bg-gray-900/80 backdrop-blur border border-gray-800/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Proyectos activos</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{activeProjects}</p>
        </motion.div>
      </div>

      {/* Chart + Critical projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-gray-900/80 backdrop-blur border border-gray-800/50 rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Tareas completadas — Últimos 7 días</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', color: '#fff' }}
                  cursor={{ fill: 'rgba(99,102,241,0.08)' }}
                />
                <Bar dataKey="tareas" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Critical projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900/80 backdrop-blur border border-gray-800/50 rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-gray-300 mb-4">⚠️ Proyectos Críticos</h3>
          {criticalProjects.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay proyectos con deadline cercano</p>
          ) : (
            <div className="space-y-3">
              {criticalProjects.map((p) => {
                const days = daysUntilDeadline(p.deadline);
                const completed = p.tasks?.filter((t: Task) => t.is_completed).length ?? 0;
                const total = p.tasks?.length ?? 0;
                return (
                  <div key={p.id} className="p-3 rounded-xl bg-gray-800/50 border border-gray-700/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white truncate">{p.name}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        days !== null && days < 0
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {days !== null ? (days < 0 ? `Vencido hace ${Math.abs(days)}d` : `${days}d restantes`) : '—'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                        style={{ width: `${progressPercent(completed, total)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{completed}/{total} tareas</p>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-900/80 backdrop-blur border border-gray-800/50 rounded-2xl p-5"
      >
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Actividad Reciente</h3>
        {recentActivities.length === 0 ? (
          <p className="text-gray-500 text-sm">Sin actividad aún</p>
        ) : (
          <div className="space-y-2">
            {recentActivities.map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                <span className="text-sm text-gray-300 flex-1">{a.action_description}</span>
                <span className="text-xs text-gray-500">
                  {new Date(a.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
