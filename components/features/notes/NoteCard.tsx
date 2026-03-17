"use client";

import { motion } from "framer-motion";
import { Trash2, Tag } from "lucide-react";
import type { Note } from "@/store/useStore";

interface NoteCardProps {
  note: Note;
  onClick: () => void;
  onDelete: () => void;
}

const noteColorMap: Record<string, { bg: string; border: string; darkBg: string }> = {
  yellow: { bg: "bg-amber-50", border: "border-amber-200", darkBg: "dark:bg-amber-500/10" },
  green: { bg: "bg-emerald-50", border: "border-emerald-200", darkBg: "dark:bg-emerald-500/10" },
  blue: { bg: "bg-blue-50", border: "border-blue-200", darkBg: "dark:bg-blue-500/10" },
  pink: { bg: "bg-pink-50", border: "border-pink-200", darkBg: "dark:bg-pink-500/10" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", darkBg: "dark:bg-purple-500/10" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", darkBg: "dark:bg-orange-500/10" },
};

export function NoteCard({ note, onClick, onDelete }: NoteCardProps) {
  const colors = noteColorMap[note.color] || noteColorMap.yellow;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4, rotate: -1 }}
      className={`group cursor-pointer rounded-2xl border p-5 transition-shadow hover:shadow-xl ${colors.bg} ${colors.border} ${colors.darkBg} dark:border-opacity-30`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-semibold text-surface-800 dark:text-surface-200 line-clamp-1">
          {note.title}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="rounded-lg p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
        >
          <Trash2 className="h-3.5 w-3.5 text-red-500" />
        </button>
      </div>
      <p className="mt-2 text-sm text-surface-600 dark:text-surface-400 line-clamp-4 whitespace-pre-wrap">
        {note.content}
      </p>
      {note.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-white/60 dark:bg-surface-800/60 px-2 py-0.5 text-xs text-surface-600 dark:text-surface-400"
            >
              <Tag className="h-2.5 w-2.5" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
