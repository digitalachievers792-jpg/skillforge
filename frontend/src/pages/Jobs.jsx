import { useEffect, useMemo, useState } from 'react';
import { FiBriefcase, FiSearch, FiFilter } from 'react-icons/fi';
import api from '../api/client';
import JobCard from '../components/jobs/JobCard';
import ApplyModal from '../components/jobs/ApplyModal';
import Pagination from '../components/ui/Pagination';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { useDebounce } from '../hooks/useDebounce';
import { useAuth } from '../context/AuthContext';
import { JOB_TYPES, JOB_MODES, JOB_SORTS, JOB_TYPE_LABELS, JOB_MODE_LABELS } from '../utils/constants';
import { cn } from '../utils/format';

const Jobs = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ page: 1, type: '', mode: '', sort: 'newest' });
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('');
  const [location, setLocation] = useState('');
  const [data, setData] = useState({ jobs: [], total: 0, pages: 1 });
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [applying, setApplying] = useState(null);
  const debouncedQuery = useDebounce(query, 350);
  const debouncedLocation = useDebounce(location, 400);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = {
      ...filters,
      q: debouncedQuery || undefined,
      tag: tag || undefined,
      location: debouncedLocation || undefined,
    };
    Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);
    api
      .get('/jobs', params)
      .then((d) => !cancelled && setData(d))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [filters, debouncedQuery, tag, debouncedLocation]);

  useEffect(() => {
    if (!user) {
      setSavedIds(new Set());
      return;
    }
    api
      .get('/jobs/saved')
      .then((d) => setSavedIds(new Set((d.jobs || []).map((j) => String(j._id)))))
      .catch(() => {});
  }, [user]);

  const popularTags = useMemo(() => {
    const counts = {};
    data.jobs.forEach((j) => (j.tags || []).forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name]) => name);
  }, [data.jobs]);

  const set = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
          Find your next <span className="text-gradient">role</span>
        </h1>
        <p className="mt-2 text-slate-500">Hand-picked opportunities from companies that value real skills.</p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setFilters((f) => ({ ...f, page: 1 }));
            }}
            placeholder="Search title, company, skill…"
            className="input-base pl-10"
          />
        </div>
        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setFilters((f) => ({ ...f, page: 1 }));
            }}
            placeholder="City or country"
            className="input-base pl-10"
          />
        </div>
        <select className="input-base" value={filters.type} onChange={(e) => set('type', e.target.value)}>
          <option value="">All job types</option>
          {JOB_TYPES.map((t) => (
            <option key={t} value={t}>{JOB_TYPE_LABELS[t]}</option>
          ))}
        </select>
        <select className="input-base" value={filters.mode} onChange={(e) => set('mode', e.target.value)}>
          <option value="">All work modes</option>
          {JOB_MODES.map((m) => (
            <option key={m} value={m}>{JOB_MODE_LABELS[m]}</option>
          ))}
        </select>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setShowFilters((s) => !s)}
          className="chip border border-slate-200 bg-white text-slate-600 lg:hidden"
        >
          <FiFilter className="h-3.5 w-3.5" /> {showFilters ? 'Hide' : 'More filters'}
        </button>
        <button
          onClick={() => set('tag', '')}
          className={cn('chip border', !tag ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500 hover:border-brand-300')}
        >
          All tags
        </button>
        {popularTags.map((t) => (
          <button
            key={t}
            onClick={() => set('tag', tag === t ? '' : t)}
            className={cn('chip border', tag === t ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500 hover:border-brand-300')}
          >
            #{t}
          </button>
        ))}
        <select className="input-base ml-auto !w-auto" value={filters.sort} onChange={(e) => set('sort', e.target.value)}>
          {JOB_SORTS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <p className="mb-4 text-sm font-semibold text-slate-500">
        {loading ? 'Searching…' : `${data.total} open position${data.total === 1 ? '' : 's'}`}
      </p>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : data.jobs.length === 0 ? (
        <EmptyState
          icon={FiBriefcase}
          title="No jobs match your filters"
          description="Try broadening your search — new roles are posted every week."
        />
      ) : (
        <>
          <div className="space-y-4">
            {data.jobs.map((job) => (
              <JobCard key={job._id} job={job} saved={savedIds.has(String(job._id))} />
            ))}
          </div>
          <Pagination page={data.page} pages={data.pages} onChange={(p) => setFilters((f) => ({ ...f, page: p }))} className="mt-10" />
        </>
      )}

      {applying && <ApplyModal job={applying} open={!!applying} onClose={() => setApplying(null)} />}
    </div>
  );
};

export default Jobs;
