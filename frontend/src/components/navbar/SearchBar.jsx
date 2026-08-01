import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiBookOpen, FiBriefcase, FiMessageSquare, FiUser } from 'react-icons/fi';
import api from '../../api/client';
import { useDebounce } from '../../hooks/useDebounce';
import { formatMoney } from '../../utils/format';

const SearchBar = ({ className, autoFocus }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounce(query, 300);
  const boxRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults(null);
      setOpen(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api
      .get('/search', { q: debounced, type: 'all', limit: 4 })
      .then((data) => {
        if (!cancelled) {
          setResults(data.results);
          setOpen(true);
        }
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const go = (path) => {
    setOpen(false);
    setQuery('');
    navigate(path);
  };

  const groups = [
    { key: 'courses', label: 'Courses', icon: FiBookOpen, items: results?.courses || [], to: (c) => `/courses/${c._id}` },
    { key: 'jobs', label: 'Jobs', icon: FiBriefcase, items: results?.jobs || [], to: (j) => `/jobs/${j._id}` },
    { key: 'forum', label: 'Forum', icon: FiMessageSquare, items: results?.forum || [], to: (p) => `/forum/post/${p._id}` },
    { key: 'instructors', label: 'Instructors', icon: FiUser, items: results?.instructors || [], to: (i) => `/users/${i._id}` },
  ];

  const total = results ? groups.reduce((s, g) => s + g.items.length, 0) : 0;

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <div className="relative">
        <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => debounced.trim() && setOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && go(`/search?q=${encodeURIComponent(debounced)}`)}
          placeholder="Search courses, jobs, forum…"
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm shadow-sm transition-all focus:border-brand-400 focus:ring-4 focus:ring-brand-100 outline-none"
          autoFocus={autoFocus}
        />
        {loading && (
          <span className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-brand-200 border-t-brand-500" />
        )}
      </div>

      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-glow">
          {total === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-400">
              No results for “{debounced}”
            </p>
          ) : (
            <div className="max-h-96 overflow-y-auto py-1">
              {groups.map(
                (g) =>
                  g.items.length > 0 && (
                    <div key={g.key} className="px-1 py-1">
                      <p className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <g.icon className="h-3 w-3" /> {g.label}
                      </p>
                      {g.items.slice(0, 4).map((item) => (
                        <button
                          key={item._id}
                          onClick={() => go(g.to(item))}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-brand-50"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                            <g.icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-slate-700">
                              {g.key === 'courses' ? item.title : g.key === 'jobs' ? item.title : g.key === 'forum' ? item.title : item.name}
                            </span>
                            <span className="block truncate text-xs text-slate-400">
                              {g.key === 'courses' && `${item.category} · ${formatMoney(item.price)} · ★ ${item.ratingSummary?.average || '—'}`
                                .replace(/· ★ —$/, '')}
                              {g.key === 'jobs' && `${item.company} · ${item.locationCity}`}
                              {g.key === 'forum' && `Score ${item.score} · ${item.commentCount} replies`}
                              {g.key === 'instructors' && (item.headline || 'Instructor')}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
