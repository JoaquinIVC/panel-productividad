"use client";

import { motion } from "framer-motion";
import { MoreVertical, Trash2 } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Project } from "@/store/useStore";

interface ProjectCardProps {
  project: Project;
  progress: number;
  onClick: () => void;
  onDelete: () => void;
}

export function ProjectCard({ project, progress, onClick, onDelete }: ProjectCardProps) {
  const completedCount = project.tasks.filter((t) => t.completed).length;
  const totalCount = project.tasks.length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="glass-card group cursor-pointer rounded-2xl p-5 transition-shadow hover:shadow-xl"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: project.color }}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="rounded-lg p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </button>
      </div>
      <h3 className="mt-3 text-base font-semibold text-surface-900 dark:text-white truncate">
        {project.name}
      </h3>
      <p className="mt-1 text-sm text-surface-500 dark:text-surface-400 line-clamp-2">
        {project.description || "Sin descripción"}
      </p>
      <div className="mt-4">
        <ProgressBar value={progress} size="sm" />
      </div>
      <p className="mt-2 text-xs text-surface-400 dark:text-surface-500">
        {completedCount}/{totalCount} tareas
      </p>
    </motion.div>
  );
}
