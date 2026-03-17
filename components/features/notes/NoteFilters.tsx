"use client";

import { Search, Palette } from "lucide-react";

const FILTER_COLORS = [
  { id: "", name: "Todos", class: "bg-surface-400" },
  { id: "yellow", name: "Amarillo", class: "bg-amber-400" },
  { id: "green", name: "Verde", class: "bg-emerald-400" },
  { id: "blue", name: "Azul", class: "bg-blue-400" },
  { id: "pink", name: "Rosa", class: "bg-pink-400" },
  { id: "purple", name: "Morado", class: "bg-purple-400" },
  { id: "orange", name: "Naranja", class: "bg-orange-400" },
];

interface NoteFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  colorFilter: string;
  onColorFilterChange: (color: string) => void;
  tagFilter: string;
  onTagFilterChange: (tag: string) => void;
  availableTags: string[];
}

export function NoteFilters({
  search,
  onSearchChange,
  colorFilter,
  onColorFilterChange,
  tagFilter,
  onTagFilterChange,
  availableTags,
}: NoteFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar notas..."
          className="input-base pl-10"
        />
      </div>

      {/* Color filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Palette className="h-4 w-4 text-surface-400 flex-shrink-0" />
        {FILTER_COLORS.map((c) => (
          <button
            key={c.id}
            onClick={() => onColorFilterChange(c.id)}
            className={`h-6 w-6 rounded-full ${c.class} transition-all ${
              colorFilter === c.id
                ? "ring-2 ring-offset-2 ring-surface-900 dark:ring-white dark:ring-offset-surface-900 scale-110"
                : "opacity-60 hover:opacity-100"
            }`}
            title={c.name}
          />
        ))}
      </div>

      {/* Tag filter */}
      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onTagFilterChange("")}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              tagFilter === ""
                ? "bg-brand-500 text-white"
                : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700"
            }`}
          >
            Todas
          </button>
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagFilterChange(tag)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                tagFilter === tag
                  ? "bg-brand-500 text-white"
                  : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
