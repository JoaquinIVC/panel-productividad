"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { generateId } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  order: number;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface PomodoroSession {
  id: string;
  projectId?: string;
  projectName?: string;
  duration: number; // in minutes
  completedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  tags: string[];
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export type ActivityType = "project" | "task" | "pomodoro" | "note";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  action: string;
  timestamp: string;
}

export interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
}

// ─── Store State ─────────────────────────────────────────────────────

interface AppState {
  // Data
  projects: Project[];
  pomodoroSessions: PomodoroSession[];
  notes: Note[];
  activityLog: ActivityEntry[];
  pomodoroSettings: PomodoroSettings;
  _hasHydrated: boolean;

  // Hydration
  setHasHydrated: (state: boolean) => void;

  // Projects
  addProject: (name: string, description: string, color: string) => void;
  updateProject: (id: string, data: Partial<Pick<Project, "name" | "description" | "color">>) => void;
  deleteProject: (id: string) => void;

  // Tasks
  addTask: (projectId: string, title: string) => void;
  toggleTask: (projectId: string, taskId: string) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  reorderTasks: (projectId: string, tasks: Task[]) => void;

  // Notes
  addNote: (title: string, content: string, color: string, tags: string[], projectId?: string) => void;
  updateNote: (id: string, data: Partial<Pick<Note, "title" | "content" | "color" | "tags" | "projectId">>) => void;
  deleteNote: (id: string) => void;

  // Pomodoro
  addPomodoroSession: (duration: number, projectId?: string, projectName?: string) => void;
  updatePomodoroSettings: (settings: Partial<PomodoroSettings>) => void;

  // Activity
  logActivity: (type: ActivityType, action: string) => void;

  // Export
  getExportData: () => object;
}

// ─── Store ───────────────────────────────────────────────────────────

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      projects: [],
      pomodoroSessions: [],
      notes: [],
      activityLog: [],
      pomodoroSettings: {
        workMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
      },
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      // ─── Projects ───────────────────────────────────────────

      addProject: (name, description, color) => {
        const newProject: Project = {
          id: generateId(),
          name,
          description,
          color,
          tasks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          projects: [...state.projects, newProject],
        }));
        get().logActivity("project", `Proyecto "${name}" creado`);
      },

      updateProject: (id, data) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
          ),
        }));
        get().logActivity("project", `Proyecto actualizado`);
      },

      deleteProject: (id) => {
        const project = get().projects.find((p) => p.id === id);
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        }));
        if (project) {
          get().logActivity("project", `Proyecto "${project.name}" eliminado`);
        }
      },

      // ─── Tasks ──────────────────────────────────────────────

      addTask: (projectId, title) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const newTask: Task = {
              id: generateId(),
              title,
              completed: false,
              order: p.tasks.length,
              createdAt: new Date().toISOString(),
            };
            return {
              ...p,
              tasks: [...p.tasks, newTask],
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
        get().logActivity("task", `Tarea "${title}" agregada`);
      },

      toggleTask: (projectId, taskId) => {
        let taskTitle = "";
        let completed = false;
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return {
              ...p,
              tasks: p.tasks.map((t) => {
                if (t.id !== taskId) return t;
                taskTitle = t.title;
                completed = !t.completed;
                return { ...t, completed };
              }),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
        get().logActivity("task", `Tarea "${taskTitle}" ${completed ? "completada ✓" : "reabierta"}`);
      },

      deleteTask: (projectId, taskId) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return {
              ...p,
              tasks: p.tasks.filter((t) => t.id !== taskId),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
        get().logActivity("task", `Tarea eliminada`);
      },

      reorderTasks: (projectId, tasks) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, tasks, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      // ─── Notes ──────────────────────────────────────────────

      addNote: (title, content, color, tags, projectId) => {
        const newNote: Note = {
          id: generateId(),
          title,
          content,
          color,
          tags,
          projectId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ notes: [...state.notes, newNote] }));
        get().logActivity("note", `Nota "${title}" creada`);
      },

      updateNote: (id, data) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n
          ),
        }));
        get().logActivity("note", `Nota actualizada`);
      },

      deleteNote: (id) => {
        const note = get().notes.find((n) => n.id === id);
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
        }));
        if (note) {
          get().logActivity("note", `Nota "${note.title}" eliminada`);
        }
      },

      // ─── Pomodoro ───────────────────────────────────────────

      addPomodoroSession: (duration, projectId, projectName) => {
        const session: PomodoroSession = {
          id: generateId(),
          projectId,
          projectName,
          duration,
          completedAt: new Date().toISOString(),
        };
        set((state) => ({
          pomodoroSessions: [...state.pomodoroSessions, session],
        }));
        get().logActivity(
          "pomodoro",
          `Pomodoro de ${duration}min completado${projectName ? ` (${projectName})` : ""}`
        );
      },

      updatePomodoroSettings: (settings) => {
        set((state) => ({
          pomodoroSettings: { ...state.pomodoroSettings, ...settings },
        }));
      },

      // ─── Activity ───────────────────────────────────────────

      logActivity: (type, action) => {
        const entry: ActivityEntry = {
          id: generateId(),
          type,
          action,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          activityLog: [entry, ...state.activityLog].slice(0, 50),
        }));
      },

      // ─── Export ─────────────────────────────────────────────

      getExportData: () => {
        const state = get();
        return {
          projects: state.projects,
          pomodoroSessions: state.pomodoroSessions,
          notes: state.notes,
          activityLog: state.activityLog,
          pomodoroSettings: state.pomodoroSettings,
          exportedAt: new Date().toISOString(),
        };
      },
    }),
    {
      name: "command-center-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projects: state.projects,
        pomodoroSessions: state.pomodoroSessions,
        notes: state.notes,
        activityLog: state.activityLog,
        pomodoroSettings: state.pomodoroSettings,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
