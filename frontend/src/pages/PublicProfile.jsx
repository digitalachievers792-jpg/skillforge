import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiBookOpen, FiUsers, FiMapPin, FiGlobe, FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';
import api, { extractError } from '../api/client';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Spinner';
import CourseCard from '../components/courses/CourseCard';
import { formatDate } from '../utils/format';

const socials = [
  { key: 'website', icon: FiGlobe, label: 'Website' },
  { key: 'github', icon: FiGithub, label: 'GitHub' },
  { key: 'linkedin', icon: FiLinkedin, label: 'LinkedIn' },
  { key: 'twitter', icon: FiTwitter, label: 'X / Twitter' },
];

const PublicProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/users/${id}/profile`)
      .then((d) => {
        setProfile(d.profile);
        setCourses(d.courses || []);
      })
      .catch((err) => setError(extractError(err, 'User not found.')))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader label="Loading profile…" />;

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="text-6xl">👤</div>
        <h1 className="font-display mt-5 text-2xl font-extrabold text-slate-800">Profile not found</h1>
        <p className="mt-2 text-sm text-slate-500">{error}</p>
        <Link to="/" className="btn-gradient mt-6 inline-flex items-center gap-1.5 rounded-xl px-6 py-3 text-sm font-bold text-white">
          Back to home
        </Link>
      </div>
    );
  }

  const links = socials.filter((s) => profile.socials?.[s.key]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card">
        <div className="h-32 bg-gradient-to-r from-brand-500 via-indigo-500 to-teal-400" />
        <div className="px-6 pb-8 sm:px-10">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <Avatar name={profile.name} src={profile.avatar} size="xxl" className="ring-4 ring-white" />
            <div className="flex flex-wrap gap-2 pb-2">
              <Badge tone={profile.role === 'instructor' ? 'teal' : 'indigo'} className="capitalize">
                {profile.role === 'instructor' ? 'Instructor' : 'Student'}
              </Badge>
              {profile.location && (
                <Badge tone="gray"><FiMapPin className="mr-1 h-3 w-3" /> {profile.location}</Badge>
              )}
            </div>
          </div>

          <div className="mt-5">
            <h1 className="font-display text-3xl font-extrabold text-slate-800">{profile.name}</h1>
            {profile.headline && <p className="mt-1 font-semibold text-brand-600">{profile.headline}</p>}
            <p className="mt-1 text-xs text-slate-400">Member since {formatDate(profile.createdAt)}</p>
          </div>

          {profile.bio && (
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600">{profile.bio}</p>
          )}

          {profile.skills?.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <span key={s} className="chip border border-slate-200 text-slate-600">{s}</span>
              ))}
            </div>
          )}

          {links.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {links.map((l) => (
                <a
                  key={l.key}
                  href={profile.socials[l.key]}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-soft flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold"
                >
                  <l.icon className="h-4 w-4" /> {l.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {profile.role === 'instructor' && (
        <div className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold text-slate-800">
            <FiBookOpen className="h-5 w-5 text-brand-600" /> Courses by {profile.name.split(' ')[0]}
          </h2>
          {courses.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c) => <CourseCard key={c._id} course={c} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-10 text-center text-sm text-slate-400">
              No published courses yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicProfile;
