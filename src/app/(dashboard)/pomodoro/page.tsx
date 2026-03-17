'use client';

import { useEffect, useState } from 'react';
import { usePomodoroStore } from '@/hooks/usePomodoroStore';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import type { PomodoroType, PomodoroSession } from '@/types/database';

const TYPE_CFG: Record<PomodoroType, { label: string; color: string; bg: string }> = {
  work: { label: 'Trabajo', color: 'text-red-400', bg: 'from-red-500/20 to-orange-500/10' },
  short_break: { label: 'Descanso Corto', color: 'text-green-400', bg: 'from-green-500/20 to-emerald-500/10' },
  long_break: { label: 'Descanso Largo', color: 'text-blue-400', bg: 'from-blue-500/20 to-cyan-500/10' },
};

export default function PomodoroPage() {
  const store = usePomodoroStore();
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from('projects').select('id, name').in('status', ['planificado', 'en_progreso']).order('name');
      setProjects(p || []);
      const { data: s } = await supabase.from('pomodoro_sessions').select('*').order('created_at', { ascending: false }).limit(20);
      setSessions(s || []);
    })();
  }, [supabase]);

  const mins = Math.floor(store.secondsRemaining / 60);
  const secs = store.secondsRemaining % 60;
  const cfg = TYPE_CFG[store.currentType];
  const total = usePomodoroStore.getState().durations[store.currentType];
  const progress = 1 - store.secondsRemaining / total;
  const circ = 2 * Math.PI * 120;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Pomodoro Timer</h1>
      <p className="text-gray-400 text-sm">Ciclo #{store.cycleCount + 1}</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`lg:col-span-2 bg-gradient-to-br ${cfg.bg} bg-gray-900/80 backdrop-blur border border-gray-800/50 rounded-2xl p-8 flex flex-col items-center`}>
          <div className="flex gap-1 p-1 bg-gray-800/50 rounded-xl mb-8">
            {(Object.keys(TYPE_CFG) as PomodoroType[]).map(t => (
              <button key={t} onClick={() => store.setType(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${store.currentType === t ? `${TYPE_CFG[t].color} bg-gray-800/80` : 'text-gray-400 hover:text-white'}`}>{TYPE_CFG[t].label}</button>
            ))}
          </div>

          <div className="relative w-64 h-64 mb-8">
            <svg className="w-64 h-64 -rotate-90" viewBox="0 0 256 256">
              <circle cx="128" cy="128" r="120" stroke="#1f2937" strokeWidth="8" fill="none" />
              <motion.circle cx="128" cy="128" r="120" stroke={store.currentType === 'work' ? '#ef4444' : store.currentType === 'short_break' ? '#22c55e' : '#3b82f6'} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-6xl font-bold font-mono ${cfg.color}`}>{String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}</span>
              <span className="text-sm text-gray-400 mt-2">{cfg.label}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={store.reset} className="w-12 h-12 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white flex items-center justify-center transition-all">↺</button>
            <button onClick={store.isRunning ? store.pause : store.start} className={`w-16 h-16 rounded-2xl text-white flex items-center justify-center shadow-lg transition-all ${store.isRunning ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/25'}`}>
              {store.isRunning ? '⏸' : '▶'}
            </button>
          </div>

          <div className="mt-6 w-full max-w-xs">
            <select value={store.selectedProjectId || ''} onChange={e => store.setSelectedProject(e.target.value || null)} className="w-full px-3 py-2 rounded-xl bg-gray-800/50 border border-gray-700 text-sm text-white">
              <option value="">Sin proyecto</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </motion.div>

        <div className="bg-gray-900/80 backdrop-blur border border-gray-800/50 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Historial</h3>
          {sessions.length === 0 ? <p className="text-gray-500 text-sm">Sin sesiones</p> : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sessions.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-800/30">
                  <div className={`w-2 h-2 rounded-full ${s.type === 'work' ? 'bg-red-400' : s.type === 'short_break' ? 'bg-green-400' : 'bg-blue-400'}`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">{TYPE_CFG[s.type].label}</p>
                    <p className="text-xs text-gray-500">{s.duration_minutes}min</p>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(s.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
