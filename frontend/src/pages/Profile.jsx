import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiUpload, FiTrash2, FiSave, FiFileText, FiLock, FiUser } from 'react-icons/fi';
import api, { extractError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { Input, Textarea } from '../components/ui/Field';
import { ROLE_LABELS } from '../utils/constants';
import { cn, formatDate } from '../utils/format';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', headline: '', bio: '', location: '', skills: '', website: '', github: '', linkedin: '', twitter: '' });
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const avatarRef = useRef(null);

  useEffect(() => {
    api
      .get('/users/me')
      .then((d) => {
        const u = d.user;
        setForm({
          name: u.name || '',
          headline: u.headline || '',
          bio: u.bio || '',
          location: u.location || '',
          skills: (u.skills || []).join(', '),
          website: u.socials?.website || '',
          github: u.socials?.github || '',
          linkedin: u.socials?.linkedin || '',
          twitter: u.socials?.twitter || '',
        });
      })
      .catch((err) => toast.error(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    const urlKeys = ['website', 'github', 'linkedin', 'twitter'];
    urlKeys.forEach((k) => {
      if (form[k] && !/^https?:\/\//.test(form[k])) e[k] = 'Must start with https://';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveProfile = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        headline: form.headline.trim(),
        bio: form.bio.trim(),
        location: form.location.trim(),
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 20),
        socials: { website: form.website, github: form.github, linkedin: form.linkedin, twitter: form.twitter },
      };
      const d = await api.put('/users/me', payload);
      refreshUser(d.user);
      toast.success('Profile saved! ✨');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatar = async (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.type)) return toast.error('Please choose a PNG, JPG, WEBP or GIF image.');
    if (file.size > 2 * 1024 * 1024) return toast.error('Image must be under 2 MB.');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const d = await api.upload('/users/me/avatar', fd);
      refreshUser(d.user);
      toast.success('Avatar updated!');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setUploading(false);
    }
  };

  const handleResume = async (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    const ok = /\.(pdf|docx?)$/i.test(file.name) && (file.type === 'application/pdf' || file.type.includes('word') || file.type.includes('officedocument'));
    if (!ok) return toast.error('Please choose a PDF or DOCX file.');
    if (file.size > 3 * 1024 * 1024) return toast.error('File must be under 3 MB.');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const d = await api.upload('/users/me/resume', fd);
      refreshUser(d.user);
      toast.success('Resume uploaded!');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveResume = async () => {
    if (!window.confirm('Remove your resume?')) return;
    try {
      const d = await api.del('/users/me/resume');
      refreshUser(d.user);
      toast.success('Resume removed.');
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  const handleChangePassword = async (ev) => {
    ev.preventDefault();
    if (passwords.next.length < 8) return toast.error('New password must be at least 8 characters.');
    if (passwords.next !== passwords.confirm) return toast.error('New passwords do not match.');
    setSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword: passwords.current, newPassword: passwords.next });
      setPasswords({ current: '', next: '', confirm: '' });
      toast.success('Password changed!');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader label="Loading profile…" />;

  const urlField = (label, key, placeholder) => (
    <Input
      label={label}
      placeholder={placeholder}
      value={form[key]}
      onChange={(e) => set(key, e.target.value)}
      error={errors[key]}
    />
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
          Your <span className="text-gradient">profile</span>
        </h1>
        <p className="mt-1.5 text-slate-500">This is how others see you on SkillForge.</p>
      </div>

      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="relative">
              <Avatar name={user?.name} src={user?.avatar} size="xl" className="ring-4 ring-slate-100" />
              <button
                onClick={() => avatarRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 rounded-full bg-brand-600 p-2 text-white shadow-lg transition-all hover:bg-brand-700 disabled:opacity-50"
                title="Change avatar"
              >
                <FiUpload className="h-3.5 w-3.5" />
              </button>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-2xl font-extrabold text-slate-800">{user?.name}</h2>
                <Badge tone={user?.role === 'admin' ? 'rose' : user?.role === 'instructor' ? 'teal' : 'indigo'}>
                  {ROLE_LABELS[user?.role] || user?.role}
                </Badge>
              </div>
              <p className="mt-0.5 text-slate-500">{user?.email}</p>
              {user?.headline && <p className="mt-1 text-sm font-semibold text-brand-600">{user.headline}</p>}
              {user?.createdAt && <p className="mt-1 text-xs text-slate-400">Member since {formatDate(user.createdAt)}</p>}
            </div>
            {user?.resume?.path && (
              <a
                href={user.resume.path}
                target="_blank"
                rel="noreferrer"
                className="btn-soft flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold"
              >
                <FiFileText className="h-4 w-4" /> Current resume
              </a>
            )}
          </div>

          {user?.resume?.path && (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <div className="flex min-w-0 items-center gap-2 text-sm">
                <FiFileText className="h-4 w-4 shrink-0 text-teal-600" />
                <span className="truncate font-semibold text-slate-600">{user.resume.name || 'resume.pdf'}</span>
                <span className="hidden shrink-0 text-xs text-slate-400 sm:inline">uploaded {formatDate(user.resume.uploadedAt)}</span>
              </div>
              <button onClick={handleRemoveResume} className="flex shrink-0 items-center gap-1 text-xs font-bold text-rose-500 transition-colors hover:text-rose-600">
                <FiTrash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="mt-8 grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Full name *" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
              <Input label="Headline" placeholder="e.g. Full-stack developer & educator" value={form.headline} onChange={(e) => set('headline', e.target.value)} maxLength={120} />
            </div>
            <Textarea
              label="Bio"
              placeholder="Tell students about your experience…"
              className="min-h-[120px]"
              value={form.bio}
              onChange={(e) => set('bio', e.target.value)}
              maxLength={1000}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Location" placeholder="e.g. Lahore, Pakistan" value={form.location} onChange={(e) => set('location', e.target.value)} />
              <Input label="Skills" placeholder="Comma separated: React, Node.js, MongoDB" value={form.skills} onChange={(e) => set('skills', e.target.value)} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {urlField('Website', 'website', 'https://…')}
              {urlField('GitHub', 'github', 'https://github.com/…')}
              {urlField('LinkedIn', 'linkedin', 'https://linkedin.com/in/…')}
              {urlField('Twitter / X', 'twitter', 'https://x.com/…')}
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={saving}>
                <FiSave className="h-4 w-4" /> Save profile
              </Button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
            <label className={cn('btn-soft inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold', uploading && 'pointer-events-none opacity-50')}>
              <FiUpload className="h-4 w-4" /> {uploading ? 'Uploading…' : 'Upload resume'}
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResume} />
            </label>
            <p className="text-xs text-slate-400">PDF or DOCX, up to 3 MB — used when applying to jobs.</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-800">
            <FiLock className="h-5 w-5 text-brand-600" /> Change password
          </h2>
          <form onSubmit={handleChangePassword} className="mt-5 grid gap-5 sm:grid-cols-3">
            <Input type="password" label="Current password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
            <Input type="password" label="New password" value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} />
            <Input type="password" label="Confirm new" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
            <div className="sm:col-span-3 flex justify-end">
              <Button type="submit" variant="secondary" loading={saving}>
                <FiLock className="h-4 w-4" /> Update password
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Profile;
