'use client';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import PomodoroTicker from '@/components/layout/PomodoroTicker';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <PomodoroTicker />
      <Sidebar />
      {/* Main area offset by sidebar width */}
      <div className="ml-64 transition-all duration-300">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
