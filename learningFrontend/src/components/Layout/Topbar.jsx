import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import NotificationBell from '../NotificationBell';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

export default function Topbar() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    const styles = {
      ADMIN: 'badge-danger',
      LEARNER: 'badge-info',
    };
    return styles[role] || 'badge-info';
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-surface-900/80 backdrop-blur-xl border-b border-surface-700/50">
      <div className="h-full flex items-center justify-between px-6">
        {/* Left: Page context */}
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-surface-500'}`}
            title={connected ? 'Connected' : 'Disconnected'} />
          <span className="text-xs text-surface-400">
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>

        {/* Right: Notifications + User */}
        <div className="flex items-center gap-4">
          <NotificationBell />

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-800/60 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-surface-100">{user?.name}</p>
                <span className={getRoleBadge(user?.role)}>{user?.role}</span>
              </div>
              <svg className={`w-4 h-4 text-surface-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-14 w-56 glass-card shadow-2xl border border-surface-600/50 py-2 animate-slide-up">
                <div className="px-4 py-3 border-b border-surface-700/50">
                  <p className="text-sm font-medium text-surface-100">{user?.name}</p>
                  <p className="text-xs text-surface-400">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-400 hover:bg-surface-800/60 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
