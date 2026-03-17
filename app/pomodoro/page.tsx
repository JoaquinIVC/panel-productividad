"use client";

import { usePomodoro } from "@/hooks/usePomodoro";
import { useStore } from "@/store/useStore";
import { PageTransition } from "@/components/shared/PageTransition";
import { CircularTimer } from "@/components/features/pomodoro/CircularTimer";
import { PomodoroControls } from "@/components/features/pomodoro/PomodoroControls";
import { SessionHistory } from "@/components/features/pomodoro/SessionHistory";

export default function PomodoroPage() {
  const hasHydrated = useStore((s) => s._hasHydrated);
  const projects = useStore((s) => s.projects);
  const pomodoroSessions = useStore((s) => s.pomodoroSessions);

  const {
    status,
    secondsLeft,
    progress,
    isBreak,
    totalSeconds,
    selectedProjectId,
    start,
    pause,
    resume,
    reset,
    setSelectedProjectId,
  } = usePomodoro();

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
        <div className="pt-2 lg:pt-0">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Pomodoro Timer
          </h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            Mantén tu enfoque con sesiones cronometradas
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Timer area */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-8">
              <CircularTimer
                secondsLeft={secondsLeft}
                totalSeconds={totalSeconds}
                progress={progress}
                isBreak={isBreak}
              />
              <PomodoroControls
                status={status}
                isBreak={isBreak}
                projects={projects}
                selectedProjectId={selectedProjectId}
                onStart={start}
                onPause={pause}
                onResume={resume}
                onReset={reset}
                onSelectProject={setSelectedProjectId}
              />
            </div>
          </div>

          {/* Session History */}
          <div>
            <SessionHistory sessions={pomodoroSessions} />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
