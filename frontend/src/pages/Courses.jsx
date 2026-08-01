import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiBookOpen, FiFilter } from 'react-icons/fi';
import api from '../api/client';
import CourseCard from '../components/courses/CourseCard';
import CourseFilters from '../components/courses/CourseFilters';
import Pagination from '../components/ui/Pagination';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { useDebounce } from '../hooks/useDebounce';

const Courses = () => {
  const [params] = useSearchParams();
  const initialQuery = params.get('q') || '';

  const [filters, setFilters] = useState({
    page: 1,
    category: '',
    level: '',
    price: '',
    rating: '',
    sort: 'popular',
  });
  const [query, setQuery] = useState(initialQuery);
  const [data, setData] = useState({ courses: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const clean = { ...filters, q: debouncedQuery };
    Object.keys(clean).forEach((k) => {
      if (!clean[k] && k !== 'page') delete clean[k];
    });
    api
      .get('/courses', clean)
      .then((d) => !cancelled && setData(d))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [filters, debouncedQuery]);

  useEffect(() => {
    setQuery(initialQuery);
    setFilters((f) => ({ ...f, page: 1 }));
  }, [initialQuery]);

  const resultMeta = useMemo(() => {
    const parts = [];
    if (filters.category) parts.push(filters.category);
    if (filters.level) parts.push(filters.level);
    if (filters.price) parts.push(filters.price);
    if (filters.rating) parts.push(`${filters.rating}★+`);
    return parts;
  }, [filters]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
          Explore <span className="text-gradient">courses</span>
        </h1>
        <p className="mt-2 text-slate-500">Find the perfect course to forge your next skill.</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-72 lg:shrink-0">
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 lg:hidden"
          >
            <FiFilter className="h-4 w-4" /> {showFilters ? 'Hide filters' : 'Show filters'}
          </button>
          <div className={showFilters ? 'block' : 'hidden lg:block'}>
            <CourseFilters filters={filters} onChange={setFilters} />
          </div>
        </aside>

        <div className="flex-1">
          <div className="relative mb-6">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setFilters((f) => ({ ...f, page: 1 }));
              }}
              placeholder="Search courses by title, tag, or category…"
              className="input-base py-3.5 pl-12"
            />
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-500">
              {loading ? 'Searching…' : `${data.total} course${data.total === 1 ? '' : 's'}`}
            </span>
            {resultMeta.map((r) => (
              <span key={r} className="chip bg-brand-50 text-brand-600">
                {r}
              </span>
            ))}
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-96" />
              ))}
            </div>
          ) : data.courses.length === 0 ? (
            <EmptyState
              icon={FiBookOpen}
              title="No courses found"
              description="Try adjusting your search or clearing the filters to see more results."
            />
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {data.courses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
              <Pagination page={data.page} pages={data.pages} onChange={(p) => setFilters((f) => ({ ...f, page: p }))} className="mt-10" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;
