'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePomodoroStore } from '@/hooks/usePomodoroStore';
import type { Profile } from '@/types/database';

export default function Header() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const { isRunning, secondsRemaining, currentType } = usePomodoroStore();
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) {
          setProfile(data);
          setDarkMode(data.dark_mode);
        }
      }
    };
    fetchProfile();
  }, [supabase]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (profile) {
      await supabase.from('profiles').update({ dark_mode: newMode }).eq('id', profile.id);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const typeColors: Record<string, string> = {
    work: 'text-red-400',
    short_break: 'text-green-400',
    long_break: 'text-blue-400',
  };

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
      {/* Left: Page greeting */}
      <div>
        <h2 className="text-lg font-semibold text-white">
          {profile?.display_name ? `Hola, ${profile.display_name}` : 'Command Center'}
        </h2>
      </div>

      {/* Right: Timer + Dark Mode */}
      <div className="flex items-center gap-4">
        {/* Mini Pomodoro indicator */}
        {isRunning && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/80 border border-gray-700/50">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentType === 'work' ? 'bg-red-400' : 'bg-green-400'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${currentType === 'work' ? 'bg-red-500' : 'bg-green-500'}`} />
            </span>
            <span className={`text-sm font-mono font-semibold ${typeColors[currentType]}`}>
              {formatTimer(secondsRemaining)}
            </span>
          </div>
        )}

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all"
          title="Alternar modo oscuro"
        >
          {darkMode ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Avatar */}
        {profile && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
            {profile.display_name?.[0]?.toUpperCase() || '?'}
          </div>
        )}
      </div>
    </header>
  );
}
