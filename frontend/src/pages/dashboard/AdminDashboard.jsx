import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiUsers, FiBookOpen, FiBriefcase, FiMessageSquare, FiStar, FiAward, FiTrendingUp,
  FiTrash2, FiSearch, FiShield,
} from 'react-icons/fi';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api, { extractError } from '../../api/client';
import { PageLoader } from '../../components/ui/Spinner';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import { cn, formatMoney, timeAgo } from '../../utils/format';
import { ROLE_LABELS } from '../../utils/constants';
import { useDebounce } from '../../hooks/useDebounce';

const chartTooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  boxShadow: '0 8px 24px rgba(15,23,42,.08)',
  fontSize: 12,
  fontWeight: 600,
};

const RATING_COLORS = ['#f43f5e', '#fb923c', '#facc15', '#a3e635', '#14b8a6'];
const PIE_COLORS = ['#6366f1', '#14b8a6', '#f59e0b'];

const roleTone = {
  admin: 'rose',
  instructor: 'teal',
  student: 'indigo',
};

const AdminDashboard = () => {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState({ list: [], total: 0, pages: 1 });
  const [courses, setCourses] = useState({ list: [], total: 0, pages: 1 });
  const [jobs, setJobs] = useState({ list: [], total: 0, pages: 1 });
  const [posts, setPosts] = useState({ list: [], total: 0, pages: 1 });
  const [reviews, setReviews] = useState({ list: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const debouncedQuery = useDebounce(query, 350);

  const loadStats = () => {
    api.get('/admin/stats').then((d) => setStats(d.stats)).catch(() => {});
    api.get('/admin/analytics').then((d) => setAnalytics(d.analytics)).catch(() => {});
  };

  const loadTab = (t = tab, p = page, q = debouncedQuery) => {
    const params = { page: p };
    if (q) params.q = q;
    const routes = {
      users: () => api.get('/admin/users', params).then((d) => setUsers({ list: d.users, total: d.total, pages: d.pages })),
      courses: () => api.get('/admin/courses', params).then((d) => setCourses({ list: d.courses, total: d.total, pages: d.pages })),
      jobs: () => api.get('/admin/jobs', params).then((d) => setJobs({ list: d.jobs, total: d.total, pages: d.pages })),
      posts: () => api.get('/admin/forum/posts', params).then((d) => setPosts({ list: d.posts, total: d.total, pages: d.pages })),
      reviews: () => api.get('/admin/reviews', params).then((d) => setReviews({ list: d.reviews, total: d.total, pages: d.pages })),
    };
    routes[t]?.().catch(() => {});
  };

  useEffect(() => {
    loadStats();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tab !== 'overview') loadTab(tab, page, debouncedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page, debouncedQuery]);

  const handleDelete = async (type, id, label) => {
    if (!window.confirm(`Delete this ${label}? This cannot be undone.`)) return;
    try {
      await api.del(`/admin/${type}/${id}`);
      toast.success(`${label[0].toUpperCase() + label.slice(1)} deleted.`);
      loadTab();
      loadStats();
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  const handleUserToggle = async (user) => {
    try {
      await api.patch(`/admin/users/${user._id}`, { isActive: !user.isActive });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}.`);
      loadTab('users');
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  const handleRoleChange = async (user, role) => {
    try {
      await api.patch(`/admin/users/${user._id}`, { role });
      toast.success(`Role changed to ${ROLE_LABELS[role] || role}.`);
      loadTab('users');
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  const handleCourseToggle = async (course, patch) => {
    try {
      await api.patch(`/admin/courses/${course._id}`, patch);
      toast.success('Course updated.');
      loadTab('courses');
      loadStats();
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  const enrollmentsSeries = useMemo(() => analytics?.enrollmentsOverTime || [], [analytics]);
  const revenueSeries = useMemo(() => analytics?.revenueOverTime || [], [analytics]);
  const ratingDist = useMemo(() => analytics?.ratingDistribution || [], [analytics]);
  const popularCourses = useMemo(() => analytics?.popularCourses || [], [analytics]);

  if (loading) return <PageLoader label="Loading admin panel…" />;

  const overviewCards = [
    { icon: FiUsers, label: 'Users', value: stats?.users?.total ?? 0, sub: `${stats?.users?.students ?? 0} students · ${stats?.users?.instructors ?? 0} instructors`, tone: 'bg-brand-50 text-brand-600' },
    { icon: FiBookOpen, label: 'Courses', value: stats?.courses?.total ?? 0, sub: `${stats?.courses?.published ?? 0} published · ${stats?.courses?.draft ?? 0} drafts`, tone: 'bg-teal-50 text-teal-600' },
    { icon: FiTrendingUp, label: 'Enrollments', value: stats?.enrollments ?? 0, sub: `${stats?.certificates ?? 0} certificates issued`, tone: 'bg-amber-50 text-amber-600' },
    { icon: FiBriefcase, label: 'Jobs & apps', value: stats?.jobs ?? 0, sub: `${stats?.applications ?? 0} applications`, tone: 'bg-sky-50 text-sky-600' },
    { icon: FiMessageSquare, label: 'Forum posts', value: stats?.posts ?? 0, sub: 'community discussions', tone: 'bg-violet-50 text-violet-600' },
    { icon: FiStar, label: 'Reviews', value: stats?.reviews ?? 0, sub: 'course feedback', tone: 'bg-rose-50 text-rose-500' },
    { icon: FiAward, label: 'Revenue', value: formatMoney(stats?.revenue ?? 0), sub: 'total platform revenue', tone: 'bg-indigo-50 text-indigo-600' },
    { icon: FiShield, label: 'Admins', value: stats?.users?.admins ?? 0, sub: 'moderators', tone: 'bg-slate-50 text-slate-600' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiTrendingUp },
    { id: 'users', label: 'Users', count: stats?.users?.total, icon: FiUsers },
    { id: 'courses', label: 'Courses', count: stats?.courses?.total, icon: FiBookOpen },
    { id: 'jobs', label: 'Jobs', count: stats?.jobs, icon: FiBriefcase },
    { id: 'posts', label: 'Forum posts', count: stats?.posts, icon: FiMessageSquare },
    { id: 'reviews', label: 'Reviews', count: stats?.reviews, icon: FiStar },
  ];

  const dataForTab = { users, courses, jobs, posts, reviews };
  const { list = [], total = 0, pages = 1 } = dataForTab[tab] || {};

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-rose-500">Admin control center</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
          Platform <span className="text-gradient">oversight</span>
        </h1>
        <p className="mt-1.5 text-slate-500">Monitor growth, moderate content, and keep SkillForge healthy.</p>
      </div>

      <div className="flex flex-wrap gap-1.5 rounded-2xl border border-slate-100 bg-white p-2 shadow-card">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setPage(1); setQuery(''); }}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all',
              tab === t.id ? 'btn-gradient' : 'text-slate-500 hover:bg-slate-50'
            )}
          >
            <t.icon className="h-4 w-4" /> {t.label}
            {t.count !== undefined && (
              <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-extrabold', tab === t.id ? 'bg-white/25' : 'bg-slate-100 text-slate-500')}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mt-6">
        {tab === 'overview' ? (
          <div className="grid gap-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {overviewCards.map((s) => (
                <div key={s.label} className="card-hover rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
                  <div className={cn('mb-3 inline-flex rounded-xl p-2.5', s.tone)}><s.icon className="h-5 w-5" /></div>
                  <p className="text-2xl font-extrabold text-slate-800 sm:text-3xl">{s.value}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{s.label}</p>
                  <p className="text-[11px] font-semibold text-slate-400">{s.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
                <h3 className="mb-4 font-bold text-slate-800">Platform enrollments</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={enrollmentsSeries.length ? enrollmentsSeries : [{ month: 'No data', count: 0 }]}>
                      <defs>
                        <linearGradient id="gAdminEnr" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Area type="monotone" dataKey="count" name="Enrollments" stroke="#6366f1" strokeWidth={2.5} fill="url(#gAdminEnr)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
                <h3 className="mb-4 font-bold text-slate-800">Platform revenue</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueSeries.length ? revenueSeries : [{ month: 'No data', revenue: 0 }]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => formatMoney(v)} />
                      <Bar dataKey="revenue" name="Revenue" radius={[8, 8, 0, 0]} fill="#14b8a6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
                <h3 className="mb-4 font-bold text-slate-800">Top courses</h3>
                {popularCourses.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">No published courses yet.</p>
                ) : (
                  <div className="space-y-3">
                    {popularCourses.map((c, i) => (
                      <div key={c._id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-extrabold text-brand-600 shadow-sm">{i + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-700">{c.title}</p>
                          <p className="text-[11px] text-slate-400">{c.enrolledCount} students · ★ {(c.ratingSummary?.average ?? 0).toFixed(1)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
                <h3 className="mb-4 font-bold text-slate-800">Rating distribution</h3>
                {ratingDist.length === 0 || ratingDist.every((r) => r.count === 0) ? (
                  <p className="py-8 text-center text-sm text-slate-400">No reviews yet.</p>
                ) : (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={ratingDist} dataKey="count" nameKey="rating" innerRadius={50} outerRadius={80} paddingAngle={3}>
                          {ratingDist.map((r) => <Cell key={r.rating} fill={RATING_COLORS[r.rating - 1]} />)}
                        </Pie>
                        <Tooltip contentStyle={chartTooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-slate-500">{total} record{total === 1 ? '' : 's'}</p>
              {tab !== 'overview' && (
                <div className="relative sm:w-72">
                  <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                  <input
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                    placeholder={`Search ${tab}…`}
                    className="input-base !pl-10"
                  />
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
              {tab === 'users' && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="px-6 py-3.5">User</th>
                        <th className="px-4 py-3.5">Role</th>
                        <th className="px-4 py-3.5">Joined</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {list.map((u) => (
                        <tr key={u._id} className="transition-colors hover:bg-slate-50/60">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar name={u.name} src={u.avatar} size="sm" />
                              <div>
                                <p className="font-bold text-slate-800">{u.name}</p>
                                <p className="text-xs text-slate-400">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u, e.target.value)}
                              className={cn('rounded-lg border-0 px-2.5 py-1.5 text-xs font-bold shadow-sm outline-none focus:ring-2 focus:ring-brand-300', u.role === 'admin' ? 'bg-rose-50 text-rose-600' : u.role === 'instructor' ? 'bg-teal-50 text-teal-600' : 'bg-brand-50 text-brand-600')}
                            >
                              {Object.entries(ROLE_LABELS).map(([v, l]) => (
                                <option key={v} value={v}>{l}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-4 text-xs text-slate-500">{timeAgo(u.createdAt)}</td>
                          <td className="px-4 py-4">
                            <Badge tone={u.isActive ? 'teal' : 'rose'}>{u.isActive ? 'Active' : 'Disabled'}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <Button variant="secondary" size="sm" onClick={() => handleUserToggle(u)}>
                                {u.isActive ? 'Disable' : 'Enable'}
                              </Button>
                              <Button variant="danger" size="sm" onClick={() => handleDelete('users', u._id, 'user')}>
                                <FiTrash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {tab === 'courses' && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="px-6 py-3.5">Course</th>
                        <th className="px-4 py-3.5">Instructor</th>
                        <th className="px-4 py-3.5">Students</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5">Featured</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {list.map((c) => (
                        <tr key={c._id} className="transition-colors hover:bg-slate-50/60">
                          <td className="px-6 py-4">
                            <p className="max-w-[240px] truncate font-bold text-slate-800">{c.title}</p>
                            <p className="text-xs text-slate-400">{c.category} · {formatMoney(c.price)}</p>
                          </td>
                          <td className="px-4 py-4 text-xs text-slate-500">{c.instructor?.name || '—'}</td>
                          <td className="px-4 py-4 text-xs font-bold text-slate-600">{c.enrolledCount}</td>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => handleCourseToggle(c, { status: c.status === 'published' ? 'draft' : 'published' })}
                              className={cn('chip capitalize', c.status === 'published' ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600')}
                            >
                              {c.status}
                            </button>
                          </td>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => handleCourseToggle(c, { featured: !c.featured })}
                              className={cn('chip', c.featured ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-400')}
                            >
                              {c.featured ? '★ Featured' : '☆ Not'}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end">
                              <Button variant="danger" size="sm" onClick={() => handleDelete('courses', c._id, 'course')}>
                                <FiTrash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {tab === 'jobs' && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="px-6 py-3.5">Job</th>
                        <th className="px-4 py-3.5">Type</th>
                        <th className="px-4 py-3.5">Applicants</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5">Posted</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {list.map((j) => (
                        <tr key={j._id} className="transition-colors hover:bg-slate-50/60">
                          <td className="px-6 py-4">
                            <p className="max-w-[240px] truncate font-bold text-slate-800">{j.title}</p>
                            <p className="text-xs text-slate-400">{j.company} · {j.locationCity}</p>
                          </td>
                          <td className="px-4 py-4 text-xs text-slate-500 capitalize">{j.type} · {j.mode}</td>
                          <td className="px-4 py-4 text-xs font-bold text-slate-600">{j.applicantsCount}</td>
                          <td className="px-4 py-4"><Badge tone={j.status === 'open' ? 'teal' : 'rose'} className="capitalize">{j.status}</Badge></td>
                          <td className="px-4 py-4 text-xs text-slate-500">{timeAgo(j.createdAt)}</td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end">
                              <Button variant="danger" size="sm" onClick={() => handleDelete('jobs', j._id, 'job')}>
                                <FiTrash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {tab === 'posts' && (
                <div className="divide-y divide-slate-50">
                  {list.map((p) => (
                    <div key={p._id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition-colors hover:bg-slate-50/60">
                      <div className="min-w-0 flex-1">
                        <p className="max-w-xl truncate font-bold text-slate-800">{p.title}</p>
                        <p className="text-xs text-slate-400">
                          {p.author?.name || 'Deleted user'} · {p.score} votes · {p.commentCount} replies · {p.views} views · {timeAgo(p.createdAt)}
                        </p>
                      </div>
                      <Button variant="danger" size="sm" onClick={() => handleDelete('forum/posts', p._id, 'post')}>
                        <FiTrash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'reviews' && (
                <div className="divide-y divide-slate-50">
                  {list.map((r) => (
                    <div key={r._id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition-colors hover:bg-slate-50/60">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                          {r.title && <p className="text-sm font-bold text-slate-800">{r.title}</p>}
                        </div>
                        <p className="mt-0.5 max-w-xl truncate text-xs text-slate-500">{r.body}</p>
                        <p className="mt-1 text-xs text-slate-400">{r.user?.name || 'Deleted user'} · {r.course?.title || 'Deleted course'} · {timeAgo(r.createdAt)}</p>
                      </div>
                      <Button variant="danger" size="sm" onClick={() => handleDelete('reviews', r._id, 'review')}>
                        <FiTrash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {list.length === 0 && (
                <p className="px-6 py-12 text-center text-sm text-slate-400">No {tab} found.</p>
              )}
            </div>

            {pages > 1 && (
              <Pagination page={page} pages={pages} onChange={setPage} className="mt-6" />
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
