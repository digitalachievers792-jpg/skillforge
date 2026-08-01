import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiBookmark, FiBriefcase, FiClock, FiMapPin, FiUsers } from 'react-icons/fi';
import api, { extractError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ApplyModal from '../components/jobs/ApplyModal';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Spinner';
import { formatSalary, timeAgo, formatDate, cn } from '../utils/format';
import { JOB_TYPE_LABELS, JOB_MODE_LABELS } from '../utils/constants';

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);

  useEffect(() => {
    api
      .get(`/jobs/${id}`)
      .then((d) => {
        setJob(d.job);
        setIsSaved(d.isSaved);
      })
      .catch((err) => {
        toast.error(extractError(err, 'Job not found.'));
        navigate('/jobs');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleSave = async () => {
    if (!user) {
      toast.error('Please sign in to save jobs.');
      return;
    }
    try {
      if (isSaved) {
        await api.del(`/jobs/${id}/save`);
        setIsSaved(false);
        toast.success('Removed from saved jobs.');
      } else {
        await api.post(`/jobs/${id}/save`);
        setIsSaved(true);
        toast.success('Job saved! 🔖');
      }
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  const handleApply = () => {
    if (!user) {
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }
    setApplyOpen(true);
  };

  if (loading) return <PageLoader label="Loading job…" />;
  if (!job) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" className="mb-6 !px-0" onClick={() => navigate('/jobs')}>
        <FiArrowLeft className="h-4 w-4" /> Back to jobs
      </Button>

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card">
        <div className="bg-gradient-to-r from-brand-50 via-violet-50 to-teal-50 px-6 py-8 sm:px-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-soft">
              {job.companyLogo ? (
                <img src={job.companyLogo} alt={job.company} className="h-14 w-14 rounded-xl object-cover" />
              ) : (
                <FiBriefcase className="h-8 w-8 text-brand-500" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="indigo">{JOB_TYPE_LABELS[job.type]}</Badge>
                <Badge tone="teal">{JOB_MODE_LABELS[job.mode]}</Badge>
                {job.status === 'open' ? <Badge tone="emerald" dot>Open</Badge> : <Badge tone="rose" dot>Closed</Badge>}
              </div>
              <h1 className="font-display mt-2 text-2xl font-extrabold text-slate-800 sm:text-3xl">{job.title}</h1>
              <p className="mt-1 text-slate-500">{job.company}</p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Button
                variant="secondary"
                onClick={toggleSave}
                className={cn(isSaved && '!border-amber-300 !text-amber-600')}
              >
                <FiBookmark className={cn('h-4 w-4', isSaved && 'fill-current')} /> {isSaved ? 'Saved' : 'Save'}
              </Button>
              <Button onClick={handleApply}>Apply now</Button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><FiMapPin className="h-4 w-4 text-brand-500" /> {job.locationCity}, {job.locationCountry}</span>
            <span className="flex items-center gap-1.5"><FiClock className="h-4 w-4 text-brand-500" /> Posted {timeAgo(job.createdAt)}</span>
            <span className="flex items-center gap-1.5"><FiUsers className="h-4 w-4 text-brand-500" /> {job.applicantsCount} applicants</span>
            {job.expiresAt && <span className="flex items-center gap-1.5">Closes {formatDate(job.expiresAt)}</span>}
          </div>
        </div>

        <div className="grid gap-8 px-6 py-8 sm:px-10 lg:grid-cols-[1fr_280px]">
          <div className="min-w-0 space-y-8">
            <section>
              <h2 className="font-display text-lg font-extrabold text-slate-800">About the role</h2>
              <div
                className="rich-content mt-3"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.description) }}
              />
            </section>

            {job.requirements?.length > 0 && (
              <section>
                <h2 className="font-display text-lg font-extrabold text-slate-800">Requirements</h2>
                <ul className="mt-3 space-y-2">
                  {job.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                      {r}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {job.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {job.tags.map((t) => (
                  <span key={t} className="chip bg-slate-100 text-slate-600">#{t}</span>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Salary</p>
              <p className="mt-1 font-display text-xl font-extrabold text-teal-600">
                {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
              </p>
            </div>
            <Button size="lg" className="w-full" onClick={handleApply}>
              Apply for this job
            </Button>
            <p className="text-center text-xs text-slate-400">
              You'll submit your resume &amp; cover letter
            </p>
          </aside>
        </div>
      </div>

      <ApplyModal job={job} open={applyOpen} onClose={() => setApplyOpen(false)} />
    </div>
  );
};

export default JobDetail;
