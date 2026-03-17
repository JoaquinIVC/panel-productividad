"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "@/store/useStore";

type PomodoroStatus = "idle" | "running" | "paused" | "break";

export function usePomodoro() {
  const settings = useStore((s) => s.pomodoroSettings);
  const addSession = useStore((s) => s.addPomodoroSession);
  const projects = useStore((s) => s.projects);

  const [status, setStatus] = useState<PomodoroStatus>("idle");
  const [secondsLeft, setSecondsLeft] = useState(settings.workMinutes * 60);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isBreak, setIsBreak] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalSeconds = isBreak
    ? settings.shortBreakMinutes * 60
    : settings.workMinutes * 60;

  const progress = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const playSound = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(
          "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
        );
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch {
      // Audio not supported
    }
  }, []);

  const completeSession = useCallback(() => {
    if (!isBreak) {
      addSession(settings.workMinutes, selectedProjectId || undefined, selectedProject?.name);
      playSound();
    }
    // Switch to break or back to work
    setIsBreak((prev) => !prev);
    setStatus("idle");
  }, [isBreak, settings.workMinutes, selectedProjectId, selectedProject?.name, addSession, playSound]);

  useEffect(() => {
    if (status === "running") {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            completeSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, completeSession]);

  // Reset seconds when switching between work/break or settings change
  useEffect(() => {
    const secs = isBreak ? settings.shortBreakMinutes * 60 : settings.workMinutes * 60;
    setSecondsLeft(secs);
  }, [isBreak, settings.workMinutes, settings.shortBreakMinutes]);

  const start = () => setStatus("running");
  const pause = () => setStatus("paused");
  const resume = () => setStatus("running");

  const reset = () => {
    setStatus("idle");
    setIsBreak(false);
    setSecondsLeft(settings.workMinutes * 60);
  };

  return {
    status,
    secondsLeft,
    progress,
    isBreak,
    selectedProjectId,
    selectedProject,
    totalSeconds,
    start,
    pause,
    resume,
    reset,
    setSelectedProjectId,
  };
}
