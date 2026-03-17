"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { PageTransition } from "@/components/shared/PageTransition";
import { Modal } from "@/components/ui/Modal";
import { NoteCard } from "@/components/features/notes/NoteCard";
import { NoteForm } from "@/components/features/notes/NoteForm";
import { NoteFilters } from "@/components/features/notes/NoteFilters";

export default function NotesPage() {
  const notes = useStore((s) => s.notes);
  const addNote = useStore((s) => s.addNote);
  const updateNote = useStore((s) => s.updateNote);
  const deleteNote = useStore((s) => s.deleteNote);
  const hasHydrated = useStore((s) => s._hasHydrated);

  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        !search ||
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.content.toLowerCase().includes(search.toLowerCase());
      const matchesColor = !colorFilter || note.color === colorFilter;
      const matchesTag = !tagFilter || note.tags.includes(tagFilter);
      return matchesSearch && matchesColor && matchesTag;
    });
  }, [notes, search, colorFilter, tagFilter]);

  const noteToEdit = editingNote ? notes.find((n) => n.id === editingNote) : null;

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
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Notas</h1>
            <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
              Tus ideas organizadas como sticky notes
            </p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Nueva nota</span>
          </button>
        </div>

        {/* Filters */}
        <NoteFilters
          search={search}
          onSearchChange={setSearch}
          colorFilter={colorFilter}
          onColorFilterChange={setColorFilter}
          tagFilter={tagFilter}
          onTagFilterChange={setTagFilter}
          availableTags={availableTags}
        />

        {/* Notes grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => setEditingNote(note.id)}
                onDelete={() => deleteNote(note.id)}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredNotes.length === 0 && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <p className="text-5xl mb-4">📝</p>
            <p className="text-lg font-semibold text-surface-700 dark:text-surface-300">
              {notes.length === 0 ? "Sin notas aún" : "No se encontraron notas"}
            </p>
            <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
              {notes.length === 0
                ? "Crea tu primera nota para empezar"
                : "Intenta ajustar los filtros de búsqueda"}
            </p>
          </div>
        )}

        {/* New note modal */}
        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Nueva nota">
          <NoteForm
            onSubmit={(title, content, color, tags, projectId) => {
              addNote(title, content, color, tags, projectId);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </Modal>

        {/* Edit note modal */}
        {noteToEdit && (
          <Modal
            isOpen={!!editingNote}
            onClose={() => setEditingNote(null)}
            title="Editar nota"
          >
            <NoteForm
              initialData={{
                title: noteToEdit.title,
                content: noteToEdit.content,
                color: noteToEdit.color,
                tags: noteToEdit.tags,
                projectId: noteToEdit.projectId,
              }}
              onSubmit={(title, content, color, tags, projectId) => {
                updateNote(noteToEdit.id, { title, content, color, tags, projectId });
                setEditingNote(null);
              }}
              onCancel={() => setEditingNote(null)}
            />
          </Modal>
        )}
      </div>
    </PageTransition>
  );
}
