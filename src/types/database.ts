// ============================================================
// Tipos TypeScript para el esquema de Supabase
// ============================================================

export type ProjectStatus = 'planificado' | 'en_progreso' | 'completado' | 'pausado';
export type PomodoroType = 'work' | 'short_break' | 'long_break';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  dark_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  deadline: string | null;
  status: ProjectStatus;
  color: string;
  created_at: string;
  updated_at: string;
  // Computed / joined
  tasks?: Task[];
  task_count?: number;
  completed_task_count?: number;
}

export interface Task {
  id: string;
  project_id: string;
  name: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface PomodoroSession {
  id: string;
  user_id: string;
  project_id: string | null;
  type: PomodoroType;
  duration_minutes: number;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  content: string | null;
  color: string;
  created_at: string;
  updated_at: string;
  // Joined
  tags?: Tag[];
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface NoteTag {
  note_id: string;
  tag_id: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action_description: string;
  entity_type: string | null;
  created_at: string;
}

// ============================================================
// Database helper type (for Supabase generic client)
// ============================================================
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'tasks' | 'task_count' | 'completed_task_count'>;
        Update: Partial<Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'tasks' | 'task_count' | 'completed_task_count'>>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at'>;
        Update: Partial<Omit<Task, 'id' | 'project_id' | 'created_at'>>;
      };
      pomodoro_sessions: {
        Row: PomodoroSession;
        Insert: Omit<PomodoroSession, 'id' | 'created_at'>;
        Update: Partial<Omit<PomodoroSession, 'id' | 'user_id' | 'created_at'>>;
      };
      notes: {
        Row: Note;
        Insert: Omit<Note, 'id' | 'created_at' | 'updated_at' | 'tags'>;
        Update: Partial<Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'tags'>>;
      };
      tags: {
        Row: Tag;
        Insert: Omit<Tag, 'id' | 'created_at'>;
        Update: Partial<Omit<Tag, 'id' | 'user_id' | 'created_at'>>;
      };
      note_tags: {
        Row: NoteTag;
        Insert: NoteTag;
        Update: never;
      };
      activity_log: {
        Row: ActivityLog;
        Insert: Omit<ActivityLog, 'id' | 'created_at'>;
        Update: never;
      };
    };
    Enums: {
      project_status: ProjectStatus;
      pomodoro_type: PomodoroType;
    };
  };
}
