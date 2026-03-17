'use client';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import PomodoroTicker from '@/components/layout/PomodoroTicker';
import DBStatusCheck from '@/components/layout/DBStatusCheck';
import { useUIStore } from '@/hooks/useUIStore';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-gray-950 text-white flex overflow-x-hidden">
      <PomodoroTicker />
      <DBStatusCheck />
      <Sidebar />
      
      {/* Main content wrapper shifted by sidebar width */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 min-w-0 ${
          sidebarCollapsed ? 'pl-[72px]' : 'pl-64'
        }`}
      >
        <Header />
        <main className="flex-1 p-6">
          <div className="w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
