"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useProjects } from "@/hooks/useProjects";
import { useStore } from "@/store/useStore";
import { PageTransition } from "@/components/shared/PageTransition";
import { Modal } from "@/components/ui/Modal";
import { ProjectCard } from "@/components/features/projects/ProjectCard";
import { ProjectForm } from "@/components/features/projects/ProjectForm";
import { ProjectModal } from "@/components/features/projects/ProjectModal";
import type { Project } from "@/store/useStore";

export default function ProjectsPage() {
  const {
    projects,
    getProjectProgress,
    addProject,
    deleteProject,
    addTask,
    toggleTask,
    deleteTask,
    reorderTasks,
  } = useProjects();
  const hasHydrated = useStore((s) => s._hasHydrated);

  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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
        {/* Header */}
        <div className="flex items-center justify-between pt-2 lg:pt-0">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
              Proyectos
            </h1>
            <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
              Gestiona tus proyectos y tareas
            </p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Nuevo proyecto</span>
          </button>
        </div>

        {/* Projects grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                progress={getProjectProgress(project)}
                onClick={() => setSelectedProject(project)}
                onDelete={() => deleteProject(project.id)}
              />
            ))}
          </AnimatePresence>
        </div>

        {projects.length === 0 && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <p className="text-5xl mb-4">📁</p>
            <p className="text-lg font-semibold text-surface-700 dark:text-surface-300">
              Sin proyectos aún
            </p>
            <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
              Crea tu primer proyecto para comenzar a organizar tus tareas
            </p>
          </div>
        )}

        {/* New project modal */}
        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Nuevo proyecto">
          <ProjectForm
            onSubmit={(name, description, color) => {
              addProject(name, description, color);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </Modal>

        {/* Project detail modal */}
        {selectedProject && (
          <ProjectModal
            project={projects.find((p) => p.id === selectedProject.id) || selectedProject}
            isOpen={!!selectedProject}
            onClose={() => setSelectedProject(null)}
            progress={getProjectProgress(
              projects.find((p) => p.id === selectedProject.id) || selectedProject
            )}
            onAddTask={(title) => addTask(selectedProject.id, title)}
            onToggleTask={(taskId) => toggleTask(selectedProject.id, taskId)}
            onDeleteTask={(taskId) => deleteTask(selectedProject.id, taskId)}
            onReorderTasks={(tasks) => reorderTasks(selectedProject.id, tasks)}
          />
        )}
      </div>
    </PageTransition>
  );
}
