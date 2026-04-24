import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useTheme } from '../contexts/ThemeContext';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <div style={{ minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content — offset by sidebar width on desktop */}
      <div style={{ marginLeft: '0' }} className="lg:pl-64 min-h-screen flex flex-col">

        {/* Mobile topbar */}
        <header className="lg:hidden sticky top-0 z-30 backdrop-blur border-b border-ink-800/40 px-4 py-3 flex items-center gap-3"
          style={{ backgroundColor: 'var(--rf-sidebar-bg)' }}>
          <button
            onClick={() => setMobileOpen(true)}
            className="text-ink-400 hover:text-ink-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <img
              src={theme === 'warm' ? '/Resume_Forge_Warm.png' : '/Resume_Forge_Dark.png'}
              alt="ResumeForge"
              className="w-7 h-7 rounded-md object-contain"
            />
            <span className="font-display font-bold" style={{ color: 'var(--page-title)' }}>ResumeForge</span>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 w-full"
          style={{ backgroundColor: 'var(--rf-bg)', maxWidth: '100%' }}>
          <div style={{ maxWidth: '1152px', margin: '0 auto', width: '100%' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}