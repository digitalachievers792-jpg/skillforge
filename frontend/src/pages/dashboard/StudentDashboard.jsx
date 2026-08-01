import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiBookOpen, FiBriefcase, FiAward, FiFileText, FiClock, FiArrowRight, FiTrash2, FiCheckCircle,
} from 'react-icons/fi';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../../components/ui/Spinner';
import ProgressBar from '../../components/ui/ProgressBar';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { cn, formatDate } from '../../utils/format';
import { LEVEL_LABELS } from '../../utils/constants';

const StatCard = ({ icon: Icon, label, value, tone }) => (
  <div className="card-hover rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
    <div className={cn('mb-3 inline-flex rounded-xl p-2.5', tone)}>
      <Icon className="h-5 w-5" />
    </div>
    <p className="text-3xl font-extrabold text-slate-800">{value}</p>
    <p className="mt-0.5 text-sm text-slate-500">{label}</p>
  </div>
);

const StudentDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('enrolled');
  const [enrollments, setEnrollments] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/enrollments/my'), api.get('/jobs/saved'), api.get('/applications/my'), api.get('/notifications')])
      .then(([e, j, a, n]) => {
        setEnrollments(e.enrollments || []);
        setSavedJobs(j.savedJobs || j.jobs || []);
        setApplications(a.applications || []);
        setNotifications(n.notifications || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completed = enrollments.filter((en) => en.completed);
  const stats = {
    enrolled: enrollments.length,
    inProgress: enrollments.length - completed.length,
    completed: completed.length,
    saved: savedJobs.length,
    applications: applications.length,
  };

  const totalCert = completed.length;

  if (loading) return <PageLoader label="Loading your dashboard…" />;

  const tabs = [
    { id: 'enrolled', label: 'Enrolled courses', count: enrollments.length, icon: FiBookOpen },
    { id: 'saved', label: 'Saved jobs', count: savedJobs.length, icon: FiBriefcase },
    { id: 'applications', label: 'Applications', count: applications.length, icon: FiFileText },
    { id: 'certificates', label: 'Certificates', count: totalCert, icon: FiAward },
    { id: 'notifications', label: 'Notifications', count: notifications.filter((n) => !n.isRead).length, icon: FiClock },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-600">Student dashboard</p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="mt-1.5 text-slate-500">Track your learning, applications, and achievements.</p>
        </div>
        <Link to="/courses" className="btn-gradient inline-flex items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
          <FiBookOpen className="h-4 w-4" /> Find next course
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={FiBookOpen} label="Enrolled" value={stats.enrolled} tone="bg-brand-50 text-brand-600" />
        <StatCard icon={FiClock} label="In progress" value={stats.inProgress} tone="bg-amber-50 text-amber-600" />
        <StatCard icon={FiCheckCircle} label="Completed" value={stats.completed} tone="bg-teal-50 text-teal-600" />
        <StatCard icon={FiAward} label="Certificates" value={totalCert} tone="bg-violet-50 text-violet-600" />
        <StatCard icon={FiBriefcase} label="Saved jobs" value={stats.saved} tone="bg-sky-50 text-sky-600" />
        <StatCard icon={FiFileText} label="Applications" value={stats.applications} tone="bg-rose-50 text-rose-500" />
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
            <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-extrabold', tab === t.id ? 'bg-white/25' : 'bg-slate-100 text-slate-500')}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mt-6">
        {tab === 'enrolled' && (
          enrollments.length === 0 ? (
            <EmptyBlock icon={FiBookOpen} title="No enrollments yet" desc="Enroll in a course to start learning." link="/courses" cta="Browse courses" />
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {enrollments.map((en) => {
                const course = en.course || {};
                const lvl = LEVEL_LABELS[course.level] || course.level;
                return (
                  <Link key={en._id} to={`/learn/${course._id}`} className="card-hover group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
                    {course.thumbnail && (
                      <div className="h-36 w-full overflow-hidden">
                        <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-bold text-slate-800 transition-colors group-hover:text-brand-700 line-clamp-1">{course.title}</h3>
                        {en.completed && <Badge tone="teal"><FiCheckCircle className="mr-1 h-3 w-3" /> Completed</Badge>}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-slate-400">
                        <Badge tone="indigo" className="!px-2 !py-0.5 !text-[10px]">{lvl || 'All levels'}</Badge>
                        {course.ratingSummary?.count > 0 && (
                          <Badge tone="amber" className="!px-2 !py-0.5 !text-[10px]">★ {course.ratingSummary.average.toFixed(1)}</Badge>
                        )}
                      </div>
                      <div className="mt-4 flex items-center gap-3">
                        <div className="flex-1"><ProgressBar value={en.progress} /></div>
                        <span className="text-xs font-extrabold text-slate-600">{en.progress}%</span>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold">
                        <span className="text-slate-400">{en.completedLessons ?? 0}/{course.lessons?.length ?? 0} lessons done</span>
                        <span className="flex items-center gap-1 text-brand-600 group-hover:gap-2 transition-all">
                          {en.completed ? 'Review course' : 'Continue learning'} <FiArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )
        )}

        {tab === 'saved' && (
          savedJobs.length === 0 ? (
            <EmptyBlock icon={FiBriefcase} title="No saved jobs" desc="Bookmark jobs you like to track them here." link="/jobs" cta="Explore jobs" />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {savedJobs.map((job) => (
                <Link key={job._id} to={`/jobs/${job._id}`} className="card-hover flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 line-clamp-1">{job.title}</h3>
                    <p className="mt-0.5 text-sm text-slate-500 line-clamp-1">{job.company} · {job.location}</p>
                    <p className="mt-2 text-sm font-bold text-teal-600">{job.salary}</p>
                  </div>
                  <FiArrowRight className="mt-1 h-5 w-5 shrink-0 text-slate-300 transition-colors group-hover:text-brand-500" />
                </Link>
              ))}
            </div>
          )
        )}

        {tab === 'applications' && (
          applications.length === 0 ? (
            <EmptyBlock icon={FiFileText} title="No applications yet" desc="Apply to jobs and track their status here." link="/jobs" cta="Find jobs" />
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app._id} className="card-hover flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
                  <div className="min-w-0">
                    <Link to={`/jobs/${app.job?._id}`} className="font-bold text-slate-800 hover:text-brand-700 line-clamp-1">
                      {app.job?.title}
                    </Link>
                    <p className="mt-0.5 text-sm text-slate-500 line-clamp-1">{app.job?.company} · applied {formatDate(app.createdAt)}</p>
                    {app.resume && <p className="mt-1 text-xs text-slate-400">📎 {app.resume}</p>}
                  </div>
                  <Badge tone={app.status === 'accepted' ? 'teal' : app.status === 'rejected' ? 'rose' : app.status === 'reviewed' ? 'amber' : 'indigo'} className="capitalize">
                    {app.status}
                  </Badge>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'certificates' && (
          totalCert === 0 ? (
            <EmptyBlock icon={FiAward} title="No certificates yet" desc="Complete a course to earn your certificate." link="/courses" cta="Browse courses" />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {enrollments.filter((en) => en.completed).map((en) => (
                <div key={en._id} className="card-hover overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-brand-50/40 p-5 shadow-card">
                  <div className="text-4xl">🏆</div>
                  <h3 className="mt-3 font-bold text-slate-800 line-clamp-2">{en.course?.title}</h3>
                  <p className="mt-1 text-xs text-slate-400">Completed {en.completedAt ? formatDate(en.completedAt) : 'recently'}</p>
                  <Link
                    to={`/certificates/${en.certificate?.code || en.course?._id}`}
                    className="btn-gradient mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                  >
                    <FiAward className="h-4 w-4" /> View certificate
                  </Link>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'notifications' && (
          notifications.length === 0 ? (
            <EmptyBlock icon={FiClock} title="No notifications" desc="You'll see updates about courses and jobs here." />
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n._id} className={cn('card-hover flex items-start justify-between gap-4 rounded-2xl border p-4', n.isRead ? 'border-slate-100 bg-white shadow-card' : 'border-brand-200 bg-brand-50/50')}>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-lg">{n.icon || '🔔'}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                      {n.message && <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{n.message}</p>}
                      <p className="mt-1 text-[11px] text-slate-400">{formatDate(n.createdAt)}</p>
                    </div>
                  </div>
                  {n.link && <Link to={n.link} className="mt-1 shrink-0 rounded-lg bg-white p-2 text-slate-400 shadow-sm transition-colors hover:text-brand-600"><FiArrowRight className="h-4 w-4" /></Link>}
                </div>
              ))}
            </div>
          )
        )}
      </motion.div>
    </div>
  );
};

const EmptyBlock = ({ icon: Icon, title, desc, link, cta }) => (
  <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center">
    <div className="mx-auto mb-4 inline-flex rounded-2xl bg-slate-50 p-4 text-slate-300"><Icon className="h-8 w-8" /></div>
    <h3 className="font-bold text-slate-700">{title}</h3>
    <p className="mx-auto mt-1 max-w-sm text-sm text-slate-400">{desc}</p>
    {link && (
      <Link to={link} className="btn-gradient mt-5 inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5">
        {cta} <FiArrowRight className="h-4 w-4" />
      </Link>
    )}
  </div>
);

export default StudentDashboard;
