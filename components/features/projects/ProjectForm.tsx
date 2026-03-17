"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const PROJECT_COLORS = [
  "#5c7cfa", "#845ef7", "#e64980", "#ff6b6b",
  "#f59f00", "#51cf66", "#20c997", "#22b8cf",
];

interface ProjectFormProps {
  onSubmit: (name: string, description: string, color: string) => void;
  onCancel: () => void;
  initialData?: { name: string; description: string; color: string };
}

export function ProjectForm({ onSubmit, onCancel, initialData }: ProjectFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [color, setColor] = useState(initialData?.color || PROJECT_COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim(), description.trim(), color);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
          Nombre del proyecto
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Rediseño de landing page"
          className="input-base"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
          Descripción
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción breve del proyecto..."
          rows={3}
          className="input-base resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
          Color
        </label>
        <div className="flex gap-2 flex-wrap">
          {PROJECT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="relative h-8 w-8 rounded-full transition-transform hover:scale-110"
              style={{ backgroundColor: c }}
            >
              {color === c && (
                <motion.div
                  layoutId="color-ring"
                  className="absolute -inset-1 rounded-full border-2"
                  style={{ borderColor: c }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button type="submit" className="btn-primary flex-1" disabled={!name.trim()}>
          {initialData ? "Guardar cambios" : "Crear proyecto"}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost flex-1">
          Cancelar
        </button>
      </div>
    </form>
  );
}
