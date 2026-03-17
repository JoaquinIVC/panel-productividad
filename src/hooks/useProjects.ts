'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Project, Task, ProjectStatus } from '@/types/database';

interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (data: {
    name: string;
    description?: string;
    deadline?: string;
    status?: ProjectStatus;
    color?: string;
  }) => Promise<Project | null>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addTask: (projectId: string, name: string) => Promise<Task | null>;
  toggleTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('projects')
      .select('*, tasks(*)')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      const enriched = (data || []).map((p) => ({
        ...p,
        task_count: p.tasks?.length ?? 0,
        completed_task_count: p.tasks?.filter((t: Task) => t.is_completed).length ?? 0,
      }));
      setProjects(enriched);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      Promise.resolve().then(() => fetchProjects());
    }
    return () => { isMounted = false; };
  }, [fetchProjects]);

  const createProject = async (data: {
    name: string;
    description?: string;
    deadline?: string;
    status?: ProjectStatus;
    color?: string;
  }): Promise<Project | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: newProject, error: err } = await supabase
      .from('projects')
      .insert({ ...data, user_id: user.id })
      .select()
      .single();

    if (err) {
      setError(err.message);
      return null;
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: user.id,
      action_description: `Creó el proyecto "${data.name}"`,
      entity_type: 'project',
    });

    await fetchProjects();
    return newProject;
  };

  const updateProject = async (id: string, data: Partial<Project>) => {
    const { error: err } = await supabase
      .from('projects')
      .update(data)
      .eq('id', id);

    if (err) setError(err.message);
    else await fetchProjects();
  };

  const deleteProject = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error: err } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (err) {
      setError(err.message);
    } else {
      if (user) {
        await supabase.from('activity_log').insert({
          user_id: user.id,
          action_description: 'Eliminó un proyecto',
          entity_type: 'project',
        });
      }
      await fetchProjects();
    }
  };

  const addTask = async (projectId: string, name: string): Promise<Task | null> => {
    const { data, error: err } = await supabase
      .from('tasks')
      .insert({ project_id: projectId, name, is_completed: false, completed_at: null })
      .select()
      .single();

    if (err) {
      setError(err.message);
      return null;
    }
    await fetchProjects();
    return data;
  };

  const toggleTask = async (task: Task) => {
    const newCompleted = !task.is_completed;
    const { error: err } = await supabase
      .from('tasks')
      .update({
        is_completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null,
      })
      .eq('id', task.id);

    if (err) setError(err.message);
    else await fetchProjects();
  };

  const deleteTask = async (taskId: string) => {
    const { error: err } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (err) setError(err.message);
    else await fetchProjects();
  };

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    addTask,
    toggleTask,
    deleteTask,
  };
}
