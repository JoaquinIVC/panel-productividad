'use client';

import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { progressPercent, STATUS_LABELS, daysUntilDeadline, exportToJSON } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import type { ProjectStatus, Task } from '@/types/database';

const STATUS_COLORS: Record<ProjectStatus, string> = {
  planificado: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  en_progreso: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  completado: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  pausado: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#06b6d4',
];

export default function ProjectsPage() {
  const { projects, loading, createProject, updateProject, deleteProject, addTask, toggleTask, deleteTask } = useProjects();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('planificado');
  const [color, setColor] = useState('#6366f1');
  const [newTaskName, setNewTaskName] = useState<Record<string, string>>({});

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.length < 3) return;
    await createProject({ name, description, deadline: deadline || undefined, status, color });
    setName('');
    setDescription('');
    setDeadline('');
    setStatus('planificado');
    setColor('#6366f1');
    setShowForm(false);
  };

  const handleAddTask = async (projectId: string) => {
    const taskName = newTaskName[projectId]?.trim();
    if (!taskName) return;
    await addTask(projectId, taskName);
    setNewTaskName((prev) => ({ ...prev, [projectId]: '' }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Proyectos</h1>
          <p className="text-gray-400 text-sm mt-1">{projects.length} proyecto{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportToJSON(projects, 'proyectos')}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800 transition-all"
          >
            Exportar JSON
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25"
          >
            + Nuevo Proyecto
          </button>
        </div>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreate}
            className="bg-gray-900/80 backdrop-blur border border-gray-800/50 rounded-2xl p-6 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre (mín. 3 chars)</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Mi proyecto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Deadline</label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                placeholder="Descripción opcional..."
              />
            </div>
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Estado</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  className="px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="planificado">Planificado</option>
                  <option value="en_progreso">En Progreso</option>
                  <option value="completado">Completado</option>
                  <option value="pausado">Pausado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Color</label>
                <div className="flex gap-2">
                  {PROJECT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        color === c ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white transition-all">
                Cancelar
              </button>
              <button type="submit" className="px-6 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-all">
                Crear Proyecto
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Projects grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando proyectos...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay proyectos aún. ¡Crea tu primero!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project, i) => {
            const completed = project.completed_task_count ?? 0;
            const total = project.task_count ?? 0;
            const percent = progressPercent(completed, total);
            const days = daysUntilDeadline(project.deadline);

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-gray-900/80 backdrop-blur border border-gray-800/50 rounded-2xl p-5 flex flex-col"
              >
                {/* Color bar */}
                <div className="w-full h-1 rounded-full mb-4" style={{ backgroundColor: project.color }} />

                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[project.status]}`}>
                    {STATUS_LABELS[project.status]}
                  </span>
                </div>

                {project.description && (
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">{project.description}</p>
                )}

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progreso</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    />
                  </div>
                </div>

                {/* Deadline */}
                {days !== null && (
                  <p className={`text-xs mb-3 ${days < 0 ? 'text-red-400' : days <= 3 ? 'text-amber-400' : 'text-gray-400'}`}>
                    {days < 0 ? `⚠️ Vencido hace ${Math.abs(days)} día(s)` : `📅 ${days} día(s) restantes`}
                  </p>
                )}

                {/* Tasks */}
                <div className="flex-1 space-y-1.5 mb-3">
                  {(project.tasks || []).slice(0, 5).map((task: Task) => (
                    <div key={task.id} className="flex items-center gap-2 group">
                      <button
                        onClick={() => toggleTask(task)}
                        className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                          task.is_completed
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-gray-600 hover:border-indigo-500'
                        }`}
                      >
                        {task.is_completed && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <span className={`text-sm flex-1 ${task.is_completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                        {task.name}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {(project.tasks || []).length > 5 && (
                    <p className="text-xs text-gray-500">+{(project.tasks || []).length - 5} más</p>
                  )}
                </div>

                {/* Add task */}
                <div className="flex gap-2">
                  <input
                    value={newTaskName[project.id] || ''}
                    onChange={(e) => setNewTaskName((prev) => ({ ...prev, [project.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask(project.id)}
                    placeholder="Nueva tarea..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50 text-sm text-white placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <button
                    onClick={() => handleAddTask(project.id)}
                    className="px-3 py-1.5 rounded-lg text-sm text-indigo-400 hover:text-white hover:bg-indigo-600/20 transition-all"
                  >
                    +
                  </button>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-800/50">
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
