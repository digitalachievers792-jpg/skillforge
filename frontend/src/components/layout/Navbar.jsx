import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiMenu, FiX, FiLogOut, FiUser, FiGrid, FiSettings, FiHome, FiBookOpen,
  FiBriefcase, FiMessageSquare, FiChevronDown,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import SearchBar from '../navbar/SearchBar';
import NotificationBell from '../navbar/NotificationBell';
import Avatar from '../ui/Avatar';
import { cn } from '../../utils/format';
import { ROLE_LABELS } from '../../utils/constants';

const navLinks = [
  { to: '/', label: 'Home', icon: FiHome },
  { to: '/courses', label: 'Courses', icon: FiBookOpen },
  { to: '/jobs', label: 'Jobs', icon: FiBriefcase },
  { to: '/forum', label: 'Community', icon: FiMessageSquare },
];

const logo = (
  <Link to="/" className="flex items-center gap-2.5">
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 via-violet-600 to-teal-500 text-lg shadow-glow">
      ⚒️
    </span>
    <span className="font-display text-xl font-extrabold tracking-tight text-slate-800">
      Skill<span className="text-gradient">Forge</span>
    </span>
  </Link>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dashboardPath =
    user?.role === 'admin' ? '/dashboard/admin' : user?.role === 'instructor' ? '/dashboard/instructor' : '/dashboard';

  const handleLogout = async () => {
    setMenuOpen(false);
    setMobileOpen(false);
    await logout();
    navigate('/');
  };

  const navItemClass = ({ isActive }) =>
    cn(
      'relative rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors duration-200',
      isActive ? 'text-brand-700' : 'text-slate-600 hover:text-brand-600'
    );

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled ? 'glass shadow-soft' : 'bg-transparent'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {logo}

        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} className={navItemClass} end={l.to === '/'}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden w-72 xl:block">
          <SearchBar />
        </div>

        <div className="flex items-center gap-2.5">
          {user ? (
            <>
              <NotificationBell />
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1 pl-1 pr-2.5 shadow-sm transition-all hover:border-brand-300 active:scale-95"
                >
                  <Avatar name={user.name} src={user.avatar} size="sm" />
                  <span className="hidden max-w-28 truncate text-sm font-semibold text-slate-700 sm:block">
                    {user.name.split(' ')[0]}
                  </span>
                  <FiChevronDown className={cn('h-3.5 w-3.5 text-slate-400 transition-transform', menuOpen && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-glow"
                    >
                      <div className="border-b border-slate-100 px-3 py-2.5">
                        <p className="truncate text-sm font-bold text-slate-800">{user.name}</p>
                        <p className="text-xs font-medium text-brand-600">{ROLE_LABELS[user.role]}</p>
                      </div>
                      <MenuItem to="/profile" icon={FiUser} onClick={() => setMenuOpen(false)}>My Profile</MenuItem>
                      <MenuItem to={dashboardPath} icon={FiGrid} onClick={() => setMenuOpen(false)}>Dashboard</MenuItem>
                      <MenuItem to="/profile?tab=settings" icon={FiSettings} onClick={() => setMenuOpen(false)}>Settings</MenuItem>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                      >
                        <FiLogOut className="h-4 w-4" /> Log out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-brand-600 sm:block"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="btn-gradient rounded-xl px-4 py-2 text-sm font-semibold"
              >
                Get started free
              </Link>
            </>
          )}

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition-all active:scale-95 lg:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass overflow-hidden border-t border-slate-100 lg:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              <SearchBar className="mb-3" />
              {navLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                      isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
                    )
                  }
                >
                  <l.icon className="h-4 w-4" /> {l.label}
                </NavLink>
              ))}
              {user ? (
                <>
                  <NavLink to={dashboardPath} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                    <FiGrid className="h-4 w-4" /> Dashboard
                  </NavLink>
                  <NavLink to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                    <FiUser className="h-4 w-4" /> Profile
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    <FiLogOut className="h-4 w-4" /> Log out
                  </button>
                </>
              ) : (
                <div className="flex gap-3 pt-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-soft flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-semibold">
                    Sign in
                  </Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-gradient flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-semibold">
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const MenuItem = ({ to, icon: Icon, children, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
  >
    <Icon className="h-4 w-4" /> {children}
  </Link>
);

export default Navbar;
