import { useState, useRef, useEffect } from 'react';
import { useUnreadNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications';
import { useSocket } from '../context/SocketContext';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { data: unreadData } = useUnreadNotifications();
  const { notifications: socketNotifications } = useSocket();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const unreadCount = (unreadData?.count || 0) + socketNotifications.length;
  const notifications = [
    ...socketNotifications,
    ...(unreadData?.notifications || []),
  ].slice(0, 10);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMarkAllRead = () => {
    markAllAsRead.mutate();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-surface-300 hover:text-surface-100 hover:bg-surface-700/60 transition-all"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-rose-500 rounded-full animate-bounce-subtle">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 glass-card shadow-2xl border border-surface-600/50 z-50 animate-slide-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700/50">
            <h3 className="font-semibold text-surface-100">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-primary-400 hover:text-primary-300">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-surface-400">No new notifications</p>
            ) : (
              notifications.map((n, i) => (
                <div
                  key={n.id || i}
                  onClick={() => n.id && markAsRead.mutate(n.id)}
                  className="px-4 py-3 border-b border-surface-700/30 hover:bg-surface-700/30 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                      n.type === 'SUCCESS' ? 'bg-emerald-400' :
                      n.type === 'WARNING' ? 'bg-amber-400' :
                      n.type === 'ERROR' ? 'bg-rose-400' : 'bg-primary-400'
                    }`} />
                    <div>
                      <p className="text-sm text-surface-200">{n.message}</p>
                      {n.createdAt && (
                        <p className="text-xs text-surface-500 mt-1">
                          {new Date(n.createdAt).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
