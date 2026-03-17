"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TaskItem } from "@/components/features/projects/TaskItem";
import type { Project } from "@/store/useStore";

interface ProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  progress: number;
  onAddTask: (title: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onReorderTasks: (tasks: Project["tasks"]) => void;
}

export function ProjectModal({
  project,
  isOpen,
  onClose,
  progress,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onReorderTasks,
}: ProjectModalProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle.trim());
    setNewTaskTitle("");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = project.tasks.findIndex((t) => t.id === active.id);
    const newIndex = project.tasks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(project.tasks, oldIndex, newIndex).map((t, i) => ({
      ...t,
      order: i,
    }));
    onReorderTasks(reordered);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={project.name} size="lg">
      <div className="space-y-5">
        {/* Project info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            <p className="text-sm text-surface-500 dark:text-surface-400">
              {project.description || "Sin descripción"}
            </p>
          </div>
          <ProgressBar value={progress} />
        </div>

        {/* Add task form */}
        <form onSubmit={handleAddTask} className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Nueva tarea..."
            className="input-base flex-1"
          />
          <button
            type="submit"
            className="btn-primary flex items-center gap-1.5"
            disabled={!newTaskTitle.trim()}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Agregar</span>
          </button>
        </form>

        {/* Tasks list with DnD */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={project.tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              <AnimatePresence>
                {project.tasks.length === 0 ? (
                  <p className="text-sm text-surface-400 dark:text-surface-500 text-center py-6">
                    No hay tareas. ¡Agrega la primera!
                  </p>
                ) : (
                  project.tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={() => onToggleTask(task.id)}
                      onDelete={() => onDeleteTask(task.id)}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </Modal>
  );
}
