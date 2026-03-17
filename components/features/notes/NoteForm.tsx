"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus } from "lucide-react";
import { useStore } from "@/store/useStore";

const NOTE_COLORS = [
  { id: "yellow", name: "Amarillo", class: "bg-amber-400" },
  { id: "green", name: "Verde", class: "bg-emerald-400" },
  { id: "blue", name: "Azul", class: "bg-blue-400" },
  { id: "pink", name: "Rosa", class: "bg-pink-400" },
  { id: "purple", name: "Morado", class: "bg-purple-400" },
  { id: "orange", name: "Naranja", class: "bg-orange-400" },
];

interface NoteFormProps {
  onSubmit: (title: string, content: string, color: string, tags: string[], projectId?: string) => void;
  onCancel: () => void;
  initialData?: {
    title: string;
    content: string;
    color: string;
    tags: string[];
    projectId?: string;
  };
}

export function NoteForm({ onSubmit, onCancel, initialData }: NoteFormProps) {
  const projects = useStore((s) => s.projects);
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [color, setColor] = useState(initialData?.color || "yellow");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [projectId, setProjectId] = useState(initialData?.projectId || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit(title.trim(), content.trim(), color, tags, projectId || undefined);
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
          Título
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título de la nota"
          className="input-base"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
          Contenido
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe tu nota aquí..."
          rows={4}
          className="input-base resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
          Color
        </label>
        <div className="flex gap-2">
          {NOTE_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setColor(c.id)}
              className={`relative h-8 w-8 rounded-full ${c.class} transition-transform hover:scale-110`}
            >
              {color === c.id && (
                <motion.div
                  layoutId="note-color-ring"
                  className="absolute -inset-1 rounded-full border-2 border-surface-900 dark:border-white"
                />
              )}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
          Etiquetas
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Agregar etiqueta..."
            className="input-base flex-1"
          />
          <button type="button" onClick={addTag} className="btn-ghost">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full bg-surface-100 dark:bg-surface-800 px-2.5 py-1 text-xs"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
          Proyecto vinculado (opcional)
        </label>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="input-base"
        >
          <option value="">Sin proyecto</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 pt-2">
        <button type="submit" className="btn-primary flex-1" disabled={!title.trim()}>
          {initialData ? "Guardar cambios" : "Crear nota"}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost flex-1">
          Cancelar
        </button>
      </div>
    </form>
  );
}
