'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { exportToJSON } from '@/lib/utils';
import type { Note, Tag } from '@/types/database';

const NOTE_COLORS = ['#fbbf24', '#f87171', '#34d399', '#60a5fa', '#a78bfa', '#fb923c', '#f472b6'];

export default function NotesPage() {
  const supabase = createClient();
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterColor, setFilterColor] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#fbbf24');
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('notes').select('*').order('created_at', { ascending: false });
    if (search) query = query.ilike('title', `%${search}%`);
    if (filterColor) query = query.eq('color', filterColor);
    const { data } = await query;

    // Fetch tags for each note
    const enriched: Note[] = [];
    for (const note of data || []) {
      const { data: ntData } = await supabase
        .from('note_tags').select('tag_id').eq('note_id', note.id);
      const tagIds = (ntData || []).map(nt => nt.tag_id);
      let noteTags: Tag[] = [];
      if (tagIds.length > 0) {
        const { data: tData } = await supabase.from('tags').select('*').in('id', tagIds);
        noteTags = tData || [];
      }
      enriched.push({ ...note, tags: noteTags });
    }

    if (filterTag) {
      setNotes(enriched.filter(n => n.tags?.some(t => t.id === filterTag)));
    } else {
      setNotes(enriched);
    }
    setLoading(false);
  }, [supabase, search, filterColor, filterTag]);

  const fetchTags = useCallback(async () => {
    const { data } = await supabase.from('tags').select('*').order('name');
    setTags(data || []);
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      Promise.resolve().then(() => {
        fetchNotes();
        fetchTags();
      });
    }
    return () => { isMounted = false; };
  }, [fetchNotes, fetchTags]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !title) return;

    const { data: note } = await supabase.from('notes')
      .insert({ user_id: user.id, title, content, color }).select().single();

    if (note) {
      for (const tagName of selectedTags) {
        let tag = tags.find(t => t.name === tagName);
        if (!tag) {
          const { data: newTag } = await supabase.from('tags')
            .insert({ user_id: user.id, name: tagName }).select().single();
          tag = newTag || undefined;
        }
        if (tag) {
          await supabase.from('note_tags').insert({ note_id: note.id, tag_id: tag.id });
        }
      }
      await supabase.from('activity_log').insert({
        user_id: user.id, action_description: `Creó la nota "${title}"`, entity_type: 'note',
      });
    }

    setTitle(''); setContent(''); setColor('#fbbf24'); setSelectedTags([]); setShowForm(false);
    fetchNotes(); fetchTags();
  };

  const deleteNote = async (id: string) => {
    await supabase.from('notes').delete().eq('id', id);
    fetchNotes();
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !selectedTags.includes(t)) setSelectedTags(prev => [...prev, t]);
    setTagInput('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Notas</h1>
          <p className="text-gray-400 text-sm mt-1">{notes.length} nota{notes.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportToJSON(notes, 'notas')} className="px-4 py-2 rounded-xl text-sm text-gray-300 bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800 transition-all">Exportar</button>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-xl text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 transition-all">+ Nueva Nota</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar notas..." className="px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700 text-sm text-white placeholder-gray-500 w-64 focus:ring-2 focus:ring-indigo-500 transition-all" />
        <div className="flex gap-1.5">
          <button onClick={() => setFilterColor(null)} className={`w-6 h-6 rounded-full border-2 transition-all ${!filterColor ? 'border-white' : 'border-transparent'} bg-gray-600`} title="Todos" />
          {NOTE_COLORS.map(c => (
            <button key={c} onClick={() => setFilterColor(filterColor === c ? null : c)} className={`w-6 h-6 rounded-full border-2 transition-all ${filterColor === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
          ))}
        </div>
        {tags.length > 0 && (
          <select value={filterTag || ''} onChange={e => setFilterTag(e.target.value || null)} className="px-3 py-2 rounded-xl bg-gray-800/50 border border-gray-700 text-sm text-white">
            <option value="">Todas las etiquetas</option>
            {tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        )}
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={handleCreate} className="bg-gray-900/80 backdrop-blur border border-gray-800/50 rounded-2xl p-6 space-y-4">
            <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Título" className="w-full px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 transition-all" />
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={3} placeholder="Contenido..." className="w-full px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 resize-none transition-all" />
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {NOTE_COLORS.map(c => <button key={c} type="button" onClick={() => setColor(c)} className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />)}
              </div>
              <div className="flex gap-2 items-center">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Etiqueta" className="px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700 text-sm text-white w-32" />
                <button type="button" onClick={addTag} className="text-indigo-400 text-sm">+</button>
              </div>
            </div>
            {selectedTags.length > 0 && (
              <div className="flex gap-2 flex-wrap">{selectedTags.map(t => <span key={t} className="px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs flex items-center gap-1">{t}<button type="button" onClick={() => setSelectedTags(s => s.filter(x => x !== t))}>×</button></span>)}</div>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm text-gray-400">Cancelar</button>
              <button type="submit" className="px-6 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-all">Crear Nota</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Notes grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No hay notas</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {notes.map((note, i) => (
            <motion.div key={note.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="rounded-2xl p-5 border border-gray-800/50 group relative" style={{ backgroundColor: `${note.color}15`, borderColor: `${note.color}30` }}>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => deleteNote(note.id)} className="text-gray-400 hover:text-red-400 text-xs">✕</button>
              </div>
              <h3 className="font-semibold text-white mb-2 pr-6">{note.title}</h3>
              {note.content && <p className="text-sm text-gray-300 line-clamp-4 mb-3">{note.content}</p>}
              {note.tags && note.tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">{note.tags.map(t => <span key={t.id} className="px-2 py-0.5 rounded-full text-xs bg-gray-800/50 text-gray-300">{t.name}</span>)}</div>
              )}
              <div className="w-full h-1 rounded-full mt-3" style={{ backgroundColor: note.color }} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
