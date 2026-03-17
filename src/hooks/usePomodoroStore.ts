'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { PomodoroType } from '@/types/database';

interface PomodoroState {
  // Timer state
  isRunning: boolean;
  secondsRemaining: number;
  currentType: PomodoroType;
  selectedProjectId: string | null;
  cycleCount: number; // work cycles completed in current session

  // Config (in seconds)
  durations: {
    work: number;
    short_break: number;
    long_break: number;
  };
  longBreakInterval: number; // after N work cycles

  // Actions
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  setType: (type: PomodoroType) => void;
  setSelectedProject: (projectId: string | null) => void;
  completeSession: () => Promise<void>;
}

const DEFAULT_DURATIONS = {
  work: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  isRunning: false,
  secondsRemaining: DEFAULT_DURATIONS.work,
  currentType: 'work',
  selectedProjectId: null,
  cycleCount: 0,
  durations: DEFAULT_DURATIONS,
  longBreakInterval: 4,

  start: () => set({ isRunning: true }),

  pause: () => set({ isRunning: false }),

  reset: () => {
    const { currentType, durations } = get();
    set({
      isRunning: false,
      secondsRemaining: durations[currentType],
    });
  },

  tick: () => {
    const { secondsRemaining, isRunning } = get();
    if (!isRunning) return;
    if (secondsRemaining <= 1) {
      set({ secondsRemaining: 0, isRunning: false });
      // Auto-complete the session
      get().completeSession();
    } else {
      set({ secondsRemaining: secondsRemaining - 1 });
    }
  },

  setType: (type: PomodoroType) => {
    const { durations } = get();
    set({
      currentType: type,
      secondsRemaining: durations[type],
      isRunning: false,
    });
  },

  setSelectedProject: (projectId: string | null) => {
    set({ selectedProjectId: projectId });
  },

  completeSession: async () => {
    const { currentType, selectedProjectId, cycleCount, longBreakInterval, durations } = get();
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Save session to Supabase
    const durationMinutes = durations[currentType] / 60;
    await supabase.from('pomodoro_sessions').insert({
      user_id: user.id,
      project_id: selectedProjectId,
      type: currentType,
      duration_minutes: durationMinutes,
    });

    // Log activity
    const typeLabel = currentType === 'work' ? 'Trabajo' : currentType === 'short_break' ? 'Descanso corto' : 'Descanso largo';
    await supabase.from('activity_log').insert({
      user_id: user.id,
      action_description: `Completó sesión de ${typeLabel} (${durationMinutes}min)`,
      entity_type: 'pomodoro',
    });

    // Determine next phase
    if (currentType === 'work') {
      const newCycleCount = cycleCount + 1;
      const nextType: PomodoroType =
        newCycleCount % longBreakInterval === 0 ? 'long_break' : 'short_break';
      set({
        cycleCount: newCycleCount,
        currentType: nextType,
        secondsRemaining: durations[nextType],
      });
    } else {
      // After break → back to work
      set({
        currentType: 'work',
        secondsRemaining: durations.work,
      });
    }
  },
}));
