import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBookmark, FiBriefcase, FiClock, FiMapPin, FiArrowRight } from 'react-icons/fi';
import api, { extractError } from '../../api/client';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Badge from '../ui/Badge';
import { formatSalary, timeAgo, cn } from '../../utils/format';
import { JOB_TYPE_LABELS, JOB_MODE_LABELS } from '../../utils/constants';

const JobCard = ({ job, onToggleSave, saved = false }) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(saved);

  const toggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please sign in to save jobs.');
      return;
    }
    setSaving(true);
    try {
      if (isSaved) {
        await api.del(`/jobs/${job._id}/save`);
        setIsSaved(false);
      } else {
        await api.post(`/jobs/${job._id}/save`);
        setIsSaved(true);
      }
      onToggleSave?.(job._id, !isSaved);
      toast.success(isSaved ? 'Removed from saved jobs.' : 'Job saved! 🔖');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const tags = (job.tags || []).slice(0, 3);

  return (
    <Link
      to={`/jobs/${job._id}`}
      className="card-hover group relative block overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-card"
    >
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-teal-50 text-xl">
          {job.companyLogo ? (
            <img src={job.companyLogo} alt={job.company} className="h-10 w-10 rounded-lg object-cover" />
          ) : (
            <FiBriefcase className="h-5 w-5 text-brand-500" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-bold text-slate-800 transition-colors group-hover:text-brand-700">
                {job.title}
              </h3>
              <p className="text-sm text-slate-500">{job.company}</p>
            </div>
            <button
              onClick={toggleSave}
              disabled={saving}
              className={cn(
                'shrink-0 rounded-lg p-2 transition-all active:scale-90',
                isSaved ? 'bg-amber-50 text-amber-500' : 'text-slate-300 hover:bg-slate-50 hover:text-amber-400'
              )}
              aria-label="Save job"
            >
              <FiBookmark className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <FiMapPin className="h-3.5 w-3.5" /> {job.locationCity}
              {job.locationCountry && job.locationCountry !== 'Worldwide' ? `, ${job.locationCountry}` : ''}
            </span>
            <span className="flex items-center gap-1">
              <FiClock className="h-3.5 w-3.5" /> {timeAgo(job.createdAt)}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone="indigo">{JOB_TYPE_LABELS[job.type] || job.type}</Badge>
            <Badge tone="teal">{JOB_MODE_LABELS[job.mode] || job.mode}</Badge>
            {job.salaryMax > 0 && <Badge tone="emerald">{formatSalary(job.salaryMin, job.salaryMax, job.currency)}</Badge>}
            {tags.map((t) => (
              <Badge key={t} tone="gray">#{t}</Badge>
            ))}
          </div>
        </div>
      </div>
      <span className="absolute bottom-4 right-4 flex items-center gap-1 text-xs font-bold text-brand-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        View &amp; apply <FiArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
};

export default JobCard;
