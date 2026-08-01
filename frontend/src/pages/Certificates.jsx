import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiAward, FiCheckCircle, FiCalendar } from 'react-icons/fi';
import api, { extractError } from '../api/client';
import { PageLoader } from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import { formatDate } from '../utils/format';

const Certificates = () => {
  const { code } = useParams();
  const [cert, setCert] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/enrollments/certificates/${code}`)
      .then((d) => setCert(d.certificate))
      .catch((err) => setError(extractError(err, 'Certificate not found.')))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) return <PageLoader label="Verifying certificate…" />;

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="text-6xl">🔍</div>
        <h1 className="font-display mt-5 text-2xl font-extrabold text-slate-800">Certificate not found</h1>
        <p className="mt-2 text-sm text-slate-500">{error}</p>
        <Link to="/" className="btn-gradient mt-6 inline-flex items-center gap-1.5 rounded-xl px-6 py-3 text-sm font-bold text-white">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-slate-100 bg-white p-3 shadow-2xl shadow-indigo-100">
        <div className="relative overflow-hidden rounded-3xl border-4 border-double border-brand-200 bg-gradient-to-br from-white via-brand-50/40 to-teal-50/40 px-6 py-12 text-center sm:px-14">
          <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-brand-100/50 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-teal-100/50 blur-3xl" />

          <div className="relative">
            <div className="mx-auto mb-3 inline-flex rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 p-3 text-white shadow-lg">
              <FiAward className="h-8 w-8" />
            </div>
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-brand-600">SkillForge</p>
            <h1 className="font-display mt-3 text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
              Certificate of Completion
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm text-slate-500">
              This certifies that
            </p>
            <p className="font-display mt-2 text-3xl font-extrabold text-gradient sm:text-4xl">
              {cert.user?.name}
            </p>
            <p className="mx-auto mt-4 max-w-md text-sm text-slate-500">
              has successfully completed the course
            </p>
            <p className="font-display mt-2 text-xl font-extrabold text-slate-800 sm:text-2xl">
              {cert.course?.title}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Badge tone="indigo"><FiCheckCircle className="mr-1 h-3 w-3" /> Verified</Badge>
              <Badge tone="gray"><FiCalendar className="mr-1 h-3 w-3" /> {formatDate(cert.issuedAt)}</Badge>
            </div>

            <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="text-center sm:text-left">
                <p className="font-script text-2xl text-slate-600">SkillForge</p>
                <div className="mx-auto mt-1 h-px w-40 bg-slate-300 sm:mx-0" />
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Issued by SkillForge</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-5 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verification code</p>
                <p className="font-mono text-lg font-extrabold tracking-widest text-brand-700">{cert.code}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-center">
        <p className="text-xs text-slate-400">
          Share this page to verify the certificate. It can also be viewed from your dashboard.
        </p>
        <Link to="/dashboard" className="btn-soft rounded-xl px-4 py-2 text-xs font-bold">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
};

export default Certificates;
