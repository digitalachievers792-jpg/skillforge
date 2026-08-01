import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiCheck, FiCheckSquare, FiTrash2, FiMessageSquare, FiAward, FiBriefcase, FiBookOpen, FiUserPlus, FiStar, FiZap, FiInfo } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import { timeAgo } from '../../utils/format';
import { cn } from '../../utils/format';

const typeIcons = {
  forum_reply: FiMessageSquare,
  forum_vote: FiZap,
  course_update: FiBookOpen,
  enrollment: FiUserPlus,
  review: FiStar,
  application: FiBriefcase,
  job_match: FiBriefcase,
  certificate: FiAward,
  system: FiInfo,
};

const typeTones = {
  forum_reply: 'bg-indigo-50 text-indigo-600',
  forum_vote: 'bg-amber-50 text-amber-600',
  course_update: 'bg-violet-50 text-violet-600',
  enrollment: 'bg-teal-50 text-teal-600',
  review: 'bg-sky-50 text-sky-600',
  application: 'bg-rose-50 text-rose-600',
  job_match: 'bg-emerald-50 text-emerald-600',
  certificate: 'bg-amber-50 text-amber-600',
  system: 'bg-slate-100 text-slate-500',
};

const NotificationBell = () => {
  const { notifications, unreadCount, markRead, markAllRead, clearRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleClick = (n) => {
    if (!n.isRead) markRead(n._id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition-all hover:border-brand-300 hover:text-brand-600 active:scale-95"
        aria-label="Notifications"
      >
        <FiBell className="h-5 w-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-1 text-[10px] font-bold text-white shadow"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-glow sm:w-96"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h4 className="text-sm font-bold text-slate-800">Notifications</h4>
              <div className="flex gap-1">
                <button
                  onClick={markAllRead}
                  className="rounded-lg p-1.5 text-xs text-brand-600 transition-colors hover:bg-brand-50"
                  title="Mark all read"
                >
                  <FiCheckSquare className="h-4 w-4" />
                </button>
                <button
                  onClick={clearRead}
                  className="rounded-lg p-1.5 text-xs text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  title="Clear read"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="max-h-[24rem] overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-slate-400">No notifications yet.</p>
              ) : (
                notifications.map((n) => {
                  const Icon = typeIcons[n.type] || FiInfo;
                  return (
                    <button
                      key={n._id}
                      onClick={() => handleClick(n)}
                      className={cn(
                        'flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50',
                        !n.isRead && 'bg-brand-50/50'
                      )}
                    >
                      <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl', typeTones[n.type] || typeTones.system)}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className={cn('truncate text-sm font-semibold', n.isRead ? 'text-slate-600' : 'text-slate-800')}>
                            {n.title}
                          </span>
                          {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-xs text-slate-500">{n.message}</span>
                        <span className="mt-1 block text-[10px] font-medium uppercase tracking-wide text-slate-400">
                          {timeAgo(n.createdAt)}
                        </span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={() => {
                  setOpen(false);
                  navigate('/dashboard?tab=notifications');
                }}
                className="w-full py-2.5 text-center text-xs font-bold text-brand-600 transition-colors hover:bg-brand-50"
              >
                View all
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
