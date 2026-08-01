import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiBriefcase, FiUpload, FiFileText, FiCheckCircle } from 'react-icons/fi';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Input, Textarea } from '../ui/Field';
import api, { extractError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const ApplyModal = ({ job, open, onClose, onApplied }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', coverLetter: '' });
  const [file, setFile] = useState(null);
  const [useSavedResume, setUseSavedResume] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open && user) {
      setForm({ name: user.name || '', email: user.email || '', phone: '', coverLetter: '' });
      setFile(null);
      setUseSavedResume(!!user.resume?.path);
      setDone(false);
      setErrors({});
    }
  }, [open, user]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(f.type)) {
      toast.error('Resume must be a PDF or DOCX file.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('Resume must be under 5MB.');
      return;
    }
    setFile(f);
    setUseSavedResume(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = 'Valid email required';
    if (!useSavedResume && !file) errs.resume = 'Upload a resume or use your saved one';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('email', form.email.trim());
      fd.append('phone', form.phone.trim());
      fd.append('coverLetter', form.coverLetter.trim());
      if (file) fd.append('resume', file);
      await api.upload(`/applications/jobs/${job._id}/apply`, fd);
      setDone(true);
      toast.success('Application submitted! 🎉');
      onApplied?.();
      setTimeout(() => onClose(), 2200);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={done ? 'Application sent' : `Apply — ${job?.title}`} size="md">
      {done ? (
        <div className="flex flex-col items-center py-8 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-500">
            <FiCheckCircle className="h-8 w-8" />
          </span>
          <h3 className="mt-4 text-lg font-bold text-slate-800">Application submitted!</h3>
          <p className="mt-1.5 text-sm text-slate-500">
            {job?.company} will review your application. You can track its status in your dashboard.
          </p>
          <Button className="mt-6" onClick={() => navigate('/dashboard?tab=applications')}>
            Track applications
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
            />
          </div>
          <Input
            label="Phone (optional)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <div>
            <p className="label-base">Resume</p>
            {user?.resume?.path && (
              <label className="mb-2 flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={useSavedResume}
                  onChange={(e) => setUseSavedResume(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600"
                />
                <FiFileText className="h-4 w-4 text-brand-500" />
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-slate-700">{user.resume.name}</span>
                  <span className="text-xs text-slate-400">Use my saved resume</span>
                </span>
              </label>
            )}

            {!useSavedResume ? (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/50 px-4 py-8 text-center transition-colors hover:border-brand-400 hover:bg-brand-50">
                <FiUpload className="h-6 w-6 text-brand-500" />
                <span className="text-sm font-semibold text-brand-700">
                  {file ? file.name : 'Click to upload resume'}
                </span>
                <span className="text-xs text-slate-400">PDF or DOCX · max 5MB</span>
                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFile} />
              </label>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 px-4 py-3 text-sm font-semibold text-brand-600 transition-colors hover:border-brand-300">
                <FiUpload className="h-4 w-4" /> Upload a different resume
                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFile} />
              </label>
            )}
            {errors.resume && <p className="mt-1 text-xs font-medium text-rose-500">{errors.resume}</p>}
          </div>

          <Textarea
            label="Cover letter (optional)"
            placeholder="Why are you a great fit for this role?"
            value={form.coverLetter}
            onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
            maxLength={3000}
          />

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            <FiBriefcase className="h-4 w-4" /> Submit application
          </Button>
        </form>
      )}
    </Modal>
  );
};

export default ApplyModal;
