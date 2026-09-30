import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Sparkles, X, Clock } from 'lucide-react';
import { notificationClient, InAppNotification } from '../services/notificationService';
import { realtimeService } from '../services/realtimeService';
import { useTheme } from '../context/ThemeContext';

interface NotificationBellProps {
  userEmail?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ userEmail = 'demo123@gmail.com' }) => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const list = await notificationClient.getNotifications(userEmail);
      if (Array.isArray(list)) {
        setNotifications(list);
      }
    } catch (err) {
      console.warn('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Subscribe to live Supabase Realtime updates
    const unsubscribe = realtimeService.subscribe((event) => {
      fetchNotifications();
    });

    const interval = setInterval(fetchNotifications, 8000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [userEmail]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => n.status === 'unread').length;

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'read', read_at: new Date().toISOString() } : n))
    );
    try {
      await notificationClient.markAsRead(id);
    } catch (e) {}
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, status: 'read', read_at: new Date().toISOString() }))
    );
    try {
      await notificationClient.markAllAsRead(userEmail);
    } catch (e) {}
  };

  const formatTimeAgo = (iso: string) => {
    try {
      const diffMs = Date.now() - new Date(iso).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        title="Live Notifications"
        className={`relative p-2 rounded-lg border transition-all cursor-pointer ${
          isDark
            ? 'bg-[#0f141f] border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
            : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs'
        }`}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#00c985] text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Window */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border shadow-2xl z-50 overflow-hidden transition-all ${
            isDark ? 'bg-[#0c1017] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Header */}
          <div
            className={`p-4 border-b flex items-center justify-between ${
              isDark ? 'border-slate-800 bg-[#07090e]' : 'border-slate-100 bg-slate-50/70'
            }`}
          >
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold tracking-tight">Live Notifications</h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#00c985]/15 text-[#00c985] font-bold text-[10px]">
                  {unreadCount} New
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-semibold text-[#00c985] hover:underline cursor-pointer flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No notifications at this moment.
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = notif.status === 'unread';

                return (
                  <div
                    key={notif.id}
                    onClick={() => isUnread && handleMarkAsRead(notif.id)}
                    className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                      isUnread
                        ? isDark
                          ? 'bg-[#0f1523]/80 hover:bg-[#131b2e]'
                          : 'bg-emerald-50/50 hover:bg-emerald-50'
                        : isDark
                        ? 'hover:bg-slate-800/30'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="mt-1 shrink-0">
                      {isUnread ? (
                        <span className="w-2 h-2 rounded-full bg-[#00c985] block shadow-xs" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-400/40 block" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span
                          className={`text-xs font-bold truncate ${
                            isUnread
                              ? isDark
                                ? 'text-white'
                                : 'text-slate-900'
                              : isDark
                              ? 'text-slate-300'
                              : 'text-slate-700'
                          }`}
                        >
                          {notif.title || 'Queue Update'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                          {formatTimeAgo(notif.created_at)}
                        </span>
                      </div>

                      <p
                        className={`text-[11px] leading-relaxed ${
                          isUnread
                            ? isDark
                              ? 'text-slate-200 font-medium'
                              : 'text-slate-800 font-medium'
                            : isDark
                            ? 'text-slate-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {notif.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
