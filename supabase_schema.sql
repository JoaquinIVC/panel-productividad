-- ============================================================
-- Command Center de Productividad — Supabase Schema
-- ============================================================
-- Ejecutar este script completo en el SQL Editor de Supabase.
-- Incluye: tipos ENUM, tablas, RLS, políticas, trigger e índices.
-- ============================================================

-- =====================
-- 1. TIPOS ENUM
-- =====================

CREATE TYPE project_status AS ENUM (
  'planificado',
  'en_progreso',
  'completado',
  'pausado'
);

CREATE TYPE pomodoro_type AS ENUM (
  'work',
  'short_break',
  'long_break'
);

-- =====================
-- 2. TABLAS
-- =====================

-- Perfiles de usuario (1:1 con auth.users)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url   TEXT,
  dark_mode    BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Proyectos
CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL CHECK (char_length(name) >= 3),
  description TEXT,
  deadline    TIMESTAMPTZ,
  status      project_status DEFAULT 'planificado',
  color       TEXT DEFAULT '#6366f1',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Tareas (pertenecen a un proyecto)
CREATE TABLE tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Sesiones Pomodoro
CREATE TABLE pomodoro_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id       UUID REFERENCES projects(id) ON DELETE SET NULL,
  type             pomodoro_type NOT NULL DEFAULT 'work',
  duration_minutes INTEGER NOT NULL DEFAULT 25,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- Notas
CREATE TABLE notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id  UUID REFERENCES projects(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  content     TEXT,
  color       TEXT DEFAULT '#fbbf24',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Etiquetas (tags) — únicas por usuario
CREATE TABLE tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, name)
);

-- Relación Many-to-Many: notas ↔ tags
CREATE TABLE note_tags (
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id  UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

-- Registro de actividad
CREATE TABLE activity_log (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_description TEXT NOT NULL,
  entity_type        TEXT,
  created_at         TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 3. ROW LEVEL SECURITY
-- =====================

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects          ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags              ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags         ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log      ENABLE ROW LEVEL SECURITY;

-- =====================
-- 4. POLÍTICAS DE SEGURIDAD
-- =====================

-- profiles: los usuarios solo pueden ver/editar su propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- projects: CRUD restringido al dueño
CREATE POLICY "Users can manage own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- tasks: acceso mediante ownership del proyecto padre
CREATE POLICY "Users can manage tasks of own projects"
  ON tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
        AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- pomodoro_sessions
CREATE POLICY "Users can manage own pomodoro sessions"
  ON pomodoro_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- notes
CREATE POLICY "Users can manage own notes"
  ON notes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- tags
CREATE POLICY "Users can manage own tags"
  ON tags FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- note_tags: acceso si el usuario es dueño de la nota
CREATE POLICY "Users can manage tags on own notes"
  ON note_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = note_tags.note_id
        AND notes.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = note_tags.note_id
        AND notes.user_id = auth.uid()
    )
  );

-- activity_log
CREATE POLICY "Users can view own activity"
  ON activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity"
  ON activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================
-- 5. TRIGGER: auto-crear perfil al registrarse
-- =====================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================
-- 6. ÍNDICES DE RENDIMIENTO
-- =====================

CREATE INDEX idx_projects_user_id        ON projects(user_id);
CREATE INDEX idx_projects_status         ON projects(status);
CREATE INDEX idx_projects_deadline       ON projects(deadline);
CREATE INDEX idx_tasks_project_id        ON tasks(project_id);
CREATE INDEX idx_tasks_is_completed      ON tasks(is_completed);
CREATE INDEX idx_pomodoro_user_id        ON pomodoro_sessions(user_id);
CREATE INDEX idx_pomodoro_created_at     ON pomodoro_sessions(created_at);
CREATE INDEX idx_notes_user_id           ON notes(user_id);
CREATE INDEX idx_notes_project_id        ON notes(project_id);
CREATE INDEX idx_tags_user_id            ON tags(user_id);
CREATE INDEX idx_activity_log_user_id    ON activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);

-- =====================
-- 7. FUNCIÓN AUXILIAR: actualizar updated_at
-- =====================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
