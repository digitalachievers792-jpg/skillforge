import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiBookOpen, FiUsers, FiDollarSign, FiStar, FiPlus, FiArrowRight, FiTrendingUp, FiMessageSquare,
} from 'react-icons/fi';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../../components/ui/Spinner';
import ProgressBar from '../../components/ui/ProgressBar';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { cn, formatMoney, timeAgo } from '../../utils/format';

const chartTooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  boxShadow: '0 8px 24px rgba(15,23,42,.08)',
  fontSize: 12,
  fontWeight: 600,
};

const RATING_COLORS = ['#f43f5e', '#fb923c', '#facc15', '#a3e635', '#14b8a6'];

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [courses, setCourses] = useState([]);
  const [studentsByCourse, setStudentsByCourse] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/instructor/stats'), api.get('/instructor/analytics'), api.get('/instructor/courses')])
      .then(([s, a, c]) => {
        setStats(s.stats || s);
        setAnalytics(a.analytics || a);
        const list = c.courses || [];
        setCourses(list);
        list.forEach((course) => {
          api
            .get(`/instructor/courses/${course._id}/students`, { limit: 3 })
            .then((d) => setStudentsByCourse((prev) => ({ ...prev, [course._id]: d.students || [] })))
            .catch(() => {});
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const enrollmentsSeries = useMemo(() => analytics?.enrollmentsOverTime || [], [analytics]);
  const revenueSeries = useMemo(() => analytics?.revenueOverTime || [], [analytics]);
  const ratingDist = useMemo(() => analytics?.ratingDistribution || [], [analytics]);
  const popularCourses = useMemo(() => analytics?.popularCourses || [], [analytics]);

  if (loading) return <PageLoader label="Loading instructor analytics…" />;

  const statCards = [
    { icon: FiBookOpen, label: 'Courses', value: stats?.courseCount ?? courses.length, sub: `${stats?.publishedCount ?? 0} published`, tone: 'bg-brand-50 text-brand-600' },
    { icon: FiUsers, label: 'Students', value: stats?.totalStudents ?? 0, sub: 'all-time', tone: 'bg-teal-50 text-teal-600' },
    { icon: FiDollarSign, label: 'Revenue', value: formatMoney(stats?.revenue ?? 0), sub: 'from enrollments', tone: 'bg-violet-50 text-violet-600' },
    { icon: FiStar, label: 'Avg rating', value: (stats?.avgRating ?? 0).toFixed(1), sub: `${stats?.ratingCount ?? 0} ratings`, tone: 'bg-amber-50 text-amber-600' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiTrendingUp },
    { id: 'courses', label: 'My courses', icon: FiBookOpen },
    { id: 'students', label: 'Students', icon: FiUsers },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-600">Instructor dashboard</p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
            Hi {user?.name?.split(' ')[0]}, teach & earn 🚀
          </h1>
          <p className="mt-1.5 text-slate-500">Grow your courses, track students, and maximize earnings.</p>
        </div>
        <Link to="/dashboard/instructor/courses/new" className="btn-gradient inline-flex items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg">
          <FiPlus className="h-4 w-4" /> Create course
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="card-hover rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
            <div className={cn('mb-3 inline-flex rounded-xl p-2.5', s.tone)}><s.icon className="h-5 w-5" /></div>
            <p className="text-2xl font-extrabold text-slate-800 sm:text-3xl">{s.value}</p>
            <p className="mt-0.5 text-sm text-slate-500">{s.label}</p>
            <p className="text-[11px] font-semibold text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-1.5 rounded-2xl border border-slate-100 bg-white p-2 shadow-card">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all',
              tab === t.id ? 'btn-gradient' : 'text-slate-500 hover:bg-slate-50'
            )}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mt-6">
        {tab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Enrollments over time</h3>
                <Badge tone="indigo">Last 6 months</Badge>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={enrollmentsSeries.length ? enrollmentsSeries : [{ month: 'No data', count: 0 }]}>
                    <defs>
                      <linearGradient id="gEnr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Area type="monotone" dataKey="count" name="Enrollments" stroke="#6366f1" strokeWidth={2.5} fill="url(#gEnr)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Revenue per month</h3>
                <Badge tone="teal">Total {formatMoney(stats?.revenue ?? 0)}</Badge>
              </div>
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
              <h3 className="mb-4 font-bold text-slate-800">Rating distribution</h3>
              {ratingDist.length === 0 || ratingDist.every((r) => r.count === 0) ? (
                <p className="py-10 text-center text-sm text-slate-400">No ratings yet — reviews appear once students complete lessons.</p>
              ) : (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ratingDist}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="rating" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="count" name="Reviews" radius={[8, 8, 0, 0]}>
                        {ratingDist.map((r) => <Cell key={r.rating} fill={RATING_COLORS[r.rating - 1]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
              <h3 className="mb-4 font-bold text-slate-800">Most popular courses</h3>
              {popularCourses.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-400">Publish courses to see popularity.</p>
              ) : (
                <div className="space-y-3">
                  {popularCourses.map((c, i) => (
                    <div key={c._id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-extrabold text-brand-600 shadow-sm">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-700">{c.title}</p>
                        <p className="text-[11px] text-slate-400">{c.enrolledCount} students · ★ {c.ratingSummary?.average?.toFixed?.(1) ?? '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {stats?.recentEnrollments?.length > 0 && (
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card lg:col-span-2">
                <h3 className="mb-4 font-bold text-slate-800">Recent enrollments</h3>
                <div className="divide-y divide-slate-50">
                  {stats.recentEnrollments.map((e) => (
                    <div key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={e.student} src={e.avatar} size="sm" />
                        <div>
                          <p className="text-sm font-bold text-slate-700">{e.student}</p>
                          <p className="text-xs text-slate-400">{e.course} · {timeAgo(e.date)}</p>
                        </div>
                      </div>
                      <div className="flex w-32 items-center gap-2">
                        <ProgressBar value={e.progress} />
                        <span className="text-xs font-extrabold text-slate-600">{e.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'courses' && (
          courses.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center">
              <div className="mx-auto mb-4 inline-flex rounded-2xl bg-slate-50 p-4 text-slate-300"><FiBookOpen className="h-8 w-8" /></div>
              <h3 className="font-bold text-slate-700">No courses yet</h3>
              <p className="mt-1 text-sm text-slate-400">Create your first course to start teaching.</p>
              <Link to="/dashboard/instructor/courses/new" className="btn-gradient mt-5 inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold text-white">
                <FiPlus className="h-4 w-4" /> Create course
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {courses.map((course) => (
                <div key={course._id} className="card-hover overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
                  {course.thumbnail && (
                    <div className="h-32 w-full overflow-hidden">
                      <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-slate-800 line-clamp-1">{course.title}</h3>
                      <Badge tone={course.status === 'published' ? 'teal' : 'amber'} className="capitalize">{course.status}</Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1"><FiUsers className="h-3.5 w-3.5" /> {course.enrolledCount ?? 0} students</span>
                      <span className="flex items-center gap-1"><FiStar className="h-3.5 w-3.5" /> {course.ratingSummary?.average?.toFixed?.(1) ?? '—'} ({course.ratingSummary?.count ?? 0})</span>
                      <span className="flex items-center gap-1"><FiDollarSign className="h-3.5 w-3.5" /> {course.price === 0 ? 'Free' : formatMoney(course.price)}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <div className="flex -space-x-2">
                        {studentsByCourse[course._id]?.map((s) => (
                          <Avatar key={s.id} name={s.user?.name} src={s.user?.avatar} size="sm" className="ring-2 ring-white" />
                        ))}
                        {!studentsByCourse[course._id]?.length && <span className="text-xs text-slate-400">No students yet</span>}
                      </div>
                      <Link
                        to={`/dashboard/instructor/courses/${course._id}/edit`}
                        className="flex items-center gap-1.5 text-sm font-bold text-brand-600 transition-all hover:gap-2.5"
                      >
                        Manage <FiArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'students' && (
          courses.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center">
              <div className="mx-auto mb-4 inline-flex rounded-2xl bg-slate-50 p-4 text-slate-300"><FiUsers className="h-8 w-8" /></div>
              <h3 className="font-bold text-slate-700">No students yet</h3>
              <p className="mt-1 text-sm text-slate-400">Students will appear here once they enroll in your courses.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => {
                const list = studentsByCourse[course._id] || [];
                return (
                  <div key={course._id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FiMessageSquare className="h-4 w-4 text-brand-500" />
                        <h3 className="font-bold text-slate-800">{course.title}</h3>
                      </div>
                      <Link to={`/dashboard/instructor/courses/${course._id}/edit`} className="text-xs font-bold text-brand-600 hover:text-brand-700">
                        Manage course →
                      </Link>
                    </div>
                    {list.length === 0 ? (
                      <p className="px-6 py-8 text-center text-sm text-slate-400">No students yet.</p>
                    ) : (
                      <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
                        {list.map((s) => (
                          <div key={s.id} className="rounded-xl bg-slate-50 p-3.5">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={s.user?.name} src={s.user?.avatar} size="sm" />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-700">{s.user?.name || 'Unknown'}</p>
                                <p className="truncate text-[11px] text-slate-400">{s.user?.email}</p>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                              <ProgressBar value={s.progressPercent} />
                              <span className="text-xs font-extrabold text-slate-600">{s.progressPercent}%</span>
                            </div>
                            <p className="mt-1.5 text-[11px] text-slate-400">{s.lessonsDone}/{s.totalLessons} lessons · joined {timeAgo(s.enrolledAt)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </motion.div>
    </div>
  );
};

export default InstructorDashboard;
