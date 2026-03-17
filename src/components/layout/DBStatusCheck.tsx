'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DBStatusCheck() {
  const [missingTables, setMissingTables] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkTables = async () => {
      const tables = ['projects', 'notes', 'tasks', 'activity_log'];
      const missing = [];

      for (const table of tables) {
        const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        // PostgREST returns 404 if table doesn't exist
        if (error && (error.code === '42P01' || error.message.includes('not found'))) {
          missing.push(table);
        }
      }

      if (missing.length > 0) {
        setMissingTables(missing);
        setIsVisible(true);
      }
    };

    checkTables();
  }, [supabase]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] max-w-md bg-red-950/90 border border-red-500/50 backdrop-blur-xl rounded-2xl p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-red-200 font-semibold mb-1">¡Faltan tablas en la base de datos!</h3>
          <p className="text-red-300/80 text-sm mb-3">
            Las siguientes tablas no existen en tu proyecto de Supabase: <span className="font-mono text-red-200">{missingTables.join(', ')}</span>.
          </p>
          <div className="bg-black/20 rounded-lg p-3 mb-4">
            <p className="text-xs text-red-100 font-medium mb-1">Solución:</p>
            <p className="text-xs text-red-300">
              Copia el contenido de <code className="bg-red-900/40 px-1 rounded">supabase_schema.sql</code> y ejecútalo en el <b>SQL Editor</b> de tu panel de Supabase.
            </p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
          >
            Entendido, lo haré luego
          </button>
        </div>
      </div>
    </div>
  );
}
