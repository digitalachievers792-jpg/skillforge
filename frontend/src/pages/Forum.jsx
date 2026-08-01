import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiMessageSquare, FiPlus, FiHash } from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '../api/client';
import PostCard from '../components/forum/PostCard';
import Pagination from '../components/ui/Pagination';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { FORUM_SORTS, SUGGESTED_TAGS } from '../utils/constants';
import { cn, timeAgo } from '../utils/format';
import { useDebounce } from '../hooks/useDebounce';

const Forum = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ page: 1, sort: 'latest', tag: '' });
  const [query, setQuery] = useState('');
  const [data, setData] = useState({ posts: [], total: 0, pages: 1 });
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = { ...filters, q: debouncedQuery || undefined };
    Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);
    api
      .get('/forum/posts', params)
      .then((d) => !cancelled && setData(d))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [filters, debouncedQuery]);

  useEffect(() => {
    api.get('/forum/tags').then((d) => setTags(d.tags || [])).catch(() => {});
  }, []);

  const set = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  const tagList = [...new Set([...tags.map((t) => t.name), ...SUGGESTED_TAGS])].slice(0, 16);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
            Community <span className="text-gradient">forum</span>
          </h1>
          <p className="mt-2 text-slate-500">Ask questions, share knowledge, and grow together.</p>
        </div>
        <Button to={user ? '/forum/new' : '/login'} state={user ? undefined : { from: '/forum/new' }}>
          <FiPlus className="h-4 w-4" /> Ask a question
        </Button>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setFilters((f) => ({ ...f, page: 1 }));
            }}
            placeholder="Search discussions…"
            className="input-base"
          />

          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-400">
              <FiHash className="h-3.5 w-3.5" /> Tags
            </span>
            {tagList.map((t) => (
              <button
                key={t}
                onClick={() => set('tag', filters.tag === t ? '' : t)}
                className={cn(
                  'chip border',
                  filters.tag === t
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-slate-200 text-slate-500 hover:border-brand-300'
                )}
              >
                #{t}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 rounded-2xl border border-slate-100 bg-white p-2 shadow-card">
            {FORUM_SORTS.map((s) => (
              <button
                key={s.value}
                onClick={() => set('sort', s.value)}
                className={cn(
                  'rounded-xl px-4 py-2 text-sm font-semibold transition-all',
                  filters.sort === s.value ? 'btn-gradient' : 'text-slate-500 hover:bg-slate-50'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-card lg:block">
          <p className="text-sm font-bold text-slate-800">Community guidelines 📜</p>
          <ul className="mt-3 space-y-2 text-xs text-slate-500">
            <li>• Be respectful — everyone is learning</li>
            <li>• Search before you post</li>
            <li>• Use tags to reach the right people</li>
            <li>• Mark helpful replies as answers</li>
          </ul>
          <div className="mt-4 rounded-xl bg-gradient-to-br from-brand-50 to-teal-50 p-4">
            <p className="text-xs font-bold text-brand-700">🔥 Trending</p>
            <p className="mt-1 text-[11px] text-slate-500">
              {tags.slice(0, 4).map((t) => (
                <span key={t.name} className="mr-2">
                  #{t.name} · {t.count}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>

      <p className="mb-4 text-sm font-semibold text-slate-500">
        {loading ? 'Loading…' : `${data.total} discussion${data.total === 1 ? '' : 's'}`}
      </p>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : data.posts.length === 0 ? (
        <EmptyState
          icon={FiMessageSquare}
          title="No discussions found"
          description="Be the first to start a conversation!"
          action={
            <Button to="/forum/new" variant="secondary">
              <FiPlus className="h-4 w-4" /> Ask a question
            </Button>
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {data.posts.map((post, i) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: (i % 5) * 0.06 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </div>
          <Pagination page={data.page} pages={data.pages} onChange={(p) => setFilters((f) => ({ ...f, page: p }))} className="mt-10" />
        </>
      )}
    </div>
  );
};

export default Forum;
