"use client";

import { Play, Pause, RotateCcw, ChevronDown } from "lucide-react";
import type { Project } from "@/store/useStore";

type PomodoroStatus = "idle" | "running" | "paused" | "break";

interface PomodoroControlsProps {
  status: PomodoroStatus;
  isBreak: boolean;
  projects: Project[];
  selectedProjectId: string;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSelectProject: (id: string) => void;
}

export function PomodoroControls({
  status,
  isBreak,
  projects,
  selectedProjectId,
  onStart,
  onPause,
  onResume,
  onReset,
  onSelectProject,
}: PomodoroControlsProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Main Controls */}
      <div className="flex items-center gap-4">
        {status === "idle" || status === "paused" ? (
          <button
            onClick={status === "paused" ? onResume : onStart}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105 transition-all duration-200"
          >
            <Play className="h-6 w-6 ml-0.5" />
          </button>
        ) : (
          <button
            onClick={onPause}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 transition-all duration-200"
          >
            <Pause className="h-6 w-6" />
          </button>
        )}
        <button
          onClick={onReset}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 transition-all duration-200"
        >
          <RotateCcw className="h-5 w-5 text-surface-600 dark:text-surface-300" />
        </button>
      </div>

      {/* Project selector */}
      <div className="w-full max-w-xs">
        <label className="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5 text-center">
          Proyecto asociado
        </label>
        <div className="relative">
          <select
            value={selectedProjectId}
            onChange={(e) => onSelectProject(e.target.value)}
            className="input-base appearance-none pr-9 text-center text-sm"
          >
            <option value="">Sin proyecto</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
