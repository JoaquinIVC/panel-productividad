"use client";

import { useStore, type Project } from "@/store/useStore";
import { useMemo } from "react";

export function useProjects() {
  const projects = useStore((s) => s.projects);
  const addProject = useStore((s) => s.addProject);
  const updateProject = useStore((s) => s.updateProject);
  const deleteProject = useStore((s) => s.deleteProject);
  const addTask = useStore((s) => s.addTask);
  const toggleTask = useStore((s) => s.toggleTask);
  const deleteTask = useStore((s) => s.deleteTask);
  const reorderTasks = useStore((s) => s.reorderTasks);

  const stats = useMemo(() => {
    const totalTasks = projects.reduce((acc, p) => acc + p.tasks.length, 0);
    const completedTasks = projects.reduce(
      (acc, p) => acc + p.tasks.filter((t) => t.completed).length,
      0
    );
    return { totalProjects: projects.length, totalTasks, completedTasks };
  }, [projects]);

  const getProjectProgress = (project: Project) => {
    if (project.tasks.length === 0) return 0;
    return Math.round(
      (project.tasks.filter((t) => t.completed).length / project.tasks.length) * 100
    );
  };

  return {
    projects,
    stats,
    getProjectProgress,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    toggleTask,
    deleteTask,
    reorderTasks,
  };
}
