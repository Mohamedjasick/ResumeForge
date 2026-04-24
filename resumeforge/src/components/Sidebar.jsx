import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const navItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    label: 'Skills',
    path: '/skills',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    label: 'Projects',
    path: '/projects',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    label: 'Experience',
    path: '/experience',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Summaries',
    path: '/summaries',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h12M4 18h8" />
      </svg>
    ),
  },
  {
    label: 'Generate',
    path: '/generate',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    highlight: true,
  },
  {
    label: 'Versions',
    path: '/versions',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const email = localStorage.getItem('email') || '';
  const initials = email.slice(0, 2).toUpperCase();
  const logoSrc = theme === 'warm' ? '/Resume_Forge_Warm.png' : '/Resume_Forge_Dark.png';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: '1px solid var(--card-border)' }}>
        <img src={logoSrc} alt="ResumeForge" className="w-9 h-9 rounded-lg object-contain" />
        <span
          className="font-display font-bold text-lg tracking-tight"
          style={{ color: 'var(--page-title)' }}
        >
          ResumeForge
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-display font-medium transition-all duration-150 group
              ${isActive
                ? item.highlight
                  ? 'bg-forge-600/90 text-white shadow-lg shadow-forge-600/20'
                  : 'bg-forge-600/15 text-forge-400 border border-forge-500/20'
                : item.highlight
                  ? 'bg-forge-900/30 text-forge-300 hover:bg-forge-600/70 hover:text-white border border-forge-700/30 hover:border-transparent'
                  : 'hover:bg-black/5'
              }`
            }
            style={({ isActive }) => {
              if (isActive) return {};
              if (item.highlight) return {};
              return { color: 'var(--rf-text)' };
            }}
          >
            {item.icon}
            {item.label}
            {item.highlight && (
              <span className="ml-auto text-xs bg-forge-500/20 text-forge-300 px-1.5 py-0.5 rounded-md font-mono">AI</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 space-y-2" style={{ borderTop: '1px solid var(--card-border)' }}>
        {/* User card */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'var(--input-bg)' }}>
          <div className="w-8 h-8 rounded-lg bg-forge-700 flex items-center justify-center text-xs font-display font-bold text-forge-200 shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-display font-medium truncate" style={{ color: 'var(--rf-text)' }}>{email}</p>
          </div>
        </div>

        {/* Settings link */}
        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) =>
            `w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-display font-medium transition-all duration-150
            ${isActive ? 'bg-forge-600/15 text-forge-400 border border-forge-500/20' : ''}`
          }
          style={({ isActive }) => isActive ? {} : { color: 'var(--rf-text)' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </NavLink>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-display font-medium hover:text-red-400 hover:bg-red-900/20 transition-all duration-150"
          style={{ color: 'var(--rf-text)' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 h-screen backdrop-blur-xl fixed left-0 top-0 z-40"
        style={{ background: 'var(--rf-sidebar-bg)', borderRight: '1px solid var(--card-border)' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <aside
            className="relative w-64 h-full animate-slide-in"
            style={{ background: 'var(--rf-sidebar-bg)', borderRight: '1px solid var(--card-border)' }}
          >
            <button onClick={onClose} className="absolute top-4 right-4 transition-colors" style={{ color: 'var(--rf-text)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}