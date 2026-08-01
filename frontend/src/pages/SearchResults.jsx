import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiBookOpen, FiBriefcase, FiMessageSquare, FiUsers, FiStar, FiSearch } from 'react-icons/fi';
import api from '../api/client';
import CourseCard from '../components/courses/CourseCard';
import JobCard from '../components/jobs/JobCard';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Spinner';
import { cn, formatMoney } from '../utils/format';
import { useDebounce } from '../hooks/useDebounce';

const TYPE_TABS = [
  { id: 'all', label: 'All' },
  { id: 'courses', label: 'Courses', icon: FiBookOpen },
  { id: 'jobs', label: 'Jobs', icon: FiBriefcase },
  { id: 'forum', label: 'Discussions', icon: FiMessageSquare },
  { id: 'instructors', label: 'Instructors', icon: FiUsers },
];

const SearchResults = () => {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const type = params.get('type') || 'all';
  const [input, setInput] = useState(q);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(q));
  const debounced = useDebounce(input, 400);

  useEffect(() => {
    const next = { q: debounced };
    if (type !== 'all') next.type = type;
    setParams(next, { replace: true });
    if (!debounced) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get('/search', { q: debounced, type, limit: 8 })
      .then((d) => setData(d.results))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, type]);

  const countFor = (t) => {
    if (!data) return 0;
    if (t === 'all') return data.courses.length + data.jobs.length + data.forum.length + data.instructors.length;
    return (data[t] || []).length;
  };

  const results = data || { courses: [], jobs: [], forum: [], instructors: [] };
  const showCourses = type === 'all' || type === 'courses';
  const showJobs = type === 'all' || type === 'jobs';
  const showForum = type === 'all' || type === 'forum';
  const showInstructors = type === 'all' || type === 'instructors';

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-800">
        Search <span className="text-gradient">results</span>
      </h1>
      <p className="mt-1.5 text-slate-500">Find courses, jobs, discussions, and instructors.</p>

      <div className="relative mt-6">
        <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search SkillForge…"
          autoFocus
          className="input-base !pl-12 !py-4 !text-base"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-1.5 rounded-2xl border border-slate-100 bg-white p-2 shadow-card">
        {TYPE_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setParams({ q: debounced, ...(t.id !== 'all' ? { type: t.id } : {}) }, { replace: true })}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all',
              type === t.id ? 'btn-gradient' : 'text-slate-500 hover:bg-slate-50'
            )}
          >
            {t.icon && <t.icon className="h-4 w-4" />} {t.label}
            <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-extrabold', type === t.id ? 'bg-white/25' : 'bg-slate-100 text-slate-500')}>
              {countFor(t.id)}
            </span>
          </button>
        ))}
      </div>

      {!debounced ? (
        <div className="mt-10 rounded-3xl border border-dashed border-slate-200 bg-white/60 px-6 py-20 text-center">
          <div className="mx-auto mb-4 inline-flex rounded-2xl bg-slate-50 p-4 text-slate-300"><FiSearch className="h-8 w-8" /></div>
          <h3 className="font-bold text-slate-700">Type something to search</h3>
          <p className="mt-1 text-sm text-slate-400">Try "React", "Lahore", "jobs", or an instructor name.</p>
        </div>
      ) : loading ? (
        <PageLoader label="Searching…" />
      ) : (
        <div className="mt-8 space-y-10">
          {showCourses && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-slate-800">
                <FiBookOpen className="h-5 w-5 text-brand-600" /> Courses
                <span className="text-sm font-semibold text-slate-400">({results.courses.length})</span>
              </h2>
              {results.courses.length ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {results.courses.map((c) => <CourseCard key={c._id} course={c} />)}
                </div>
              ) : (
                <NoResults />
              )}
            </section>
          )}

          {showJobs && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-slate-800">
                <FiBriefcase className="h-5 w-5 text-teal-600" /> Jobs
                <span className="text-sm font-semibold text-slate-400">({results.jobs.length})</span>
              </h2>
              {results.jobs.length ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {results.jobs.map((j) => <JobCard key={j._id} job={j} />)}
                </div>
              ) : (
                <NoResults />
              )}
            </section>
          )}

          {showForum && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-slate-800">
                <FiMessageSquare className="h-5 w-5 text-violet-600" /> Discussions
                <span className="text-sm font-semibold text-slate-400">({results.forum.length})</span>
              </h2>
              {results.forum.length ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {results.forum.map((p) => (
                    <Link key={p._id} to={`/forum/post/${p._id}`} className="card-hover rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
                      <h3 className="font-bold text-slate-800 line-clamp-1">{p.title}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {(p.tags || []).slice(0, 3).map((t) => (
                          <span key={t} className="chip bg-violet-50 text-violet-600">#{t}</span>
                        ))}
                      </div>
                      <p className="mt-3 text-xs text-slate-400">{p.score} votes · {p.commentCount} replies</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <NoResults />
              )}
            </section>
          )}

          {showInstructors && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-slate-800">
                <FiUsers className="h-5 w-5 text-amber-600" /> Instructors
                <span className="text-sm font-semibold text-slate-400">({results.instructors.length})</span>
              </h2>
              {results.instructors.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.instructors.map((i) => (
                    <Link key={i._id} to={`/users/${i._id}`} className="card-hover flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
                      <Avatar name={i.name} src={i.avatar} size="lg" />
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-800">{i.name}</p>
                        <p className="truncate text-xs text-slate-500">{i.headline || 'Instructor'}</p>
                        <Badge tone="teal" className="mt-1.5 !px-2 !py-0.5 text-[10px]">Instructor</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <NoResults />
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
};

const NoResults = () => (
  <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-8 text-center text-sm text-slate-400">
    No matching results for this category.
  </div>
);

export default SearchResults;
