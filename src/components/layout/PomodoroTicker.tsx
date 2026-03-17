'use client';

import { useEffect, useRef } from 'react';
import { usePomodoroStore } from '@/hooks/usePomodoroStore';

/**
 * Invisible component that ticks the Pomodoro timer every second.
 * Mounted once in the root layout so it persists across navigation.
 */
export default function PomodoroTicker() {
  const tick = usePomodoroStore((s) => s.tick);
  const isRunning = usePomodoroStore((s) => s.isRunning);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        tick();
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, tick]);

  return null;
}
