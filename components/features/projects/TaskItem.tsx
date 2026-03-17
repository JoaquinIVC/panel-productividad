"use client";

import { motion } from "framer-motion";
import { Check, Trash2, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import type { Task } from "@/store/useStore";

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
        isDragging
          ? "bg-brand-50 dark:bg-brand-500/10 shadow-lg z-50"
          : "hover:bg-surface-50 dark:hover:bg-surface-800/50"
      )}
    >
      <button
        className="cursor-grab touch-none text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <button
        onClick={onToggle}
        className={cn(
          "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200",
          task.completed
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-surface-300 dark:border-surface-600 hover:border-brand-500"
        )}
      >
        {task.completed && <Check className="h-3 w-3" />}
      </button>

      <span
        className={cn(
          "flex-1 text-sm transition-all duration-200",
          task.completed
            ? "text-surface-400 dark:text-surface-500 line-through"
            : "text-surface-800 dark:text-surface-200"
        )}
      >
        {task.title}
      </span>

      <button
        onClick={onDelete}
        className="rounded-lg p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
      >
        <Trash2 className="h-3.5 w-3.5 text-red-500" />
      </button>
    </motion.div>
  );
}
