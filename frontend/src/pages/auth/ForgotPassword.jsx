import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiMail } from 'react-icons/fi';
import AuthLayout from '../../components/auth/AuthLayout';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import api, { extractError } from '../../api/client';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Enter a valid email');
      return;
    }
    setLoading(true);
    try {
      const data = await api.post('/auth/forgot-password', { email: email.trim() });
      setSent(true);
      setDevToken(data.devResetToken || '');
      toast.success('Reset link sent!');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password 🔑"
      subtitle="Enter your email and we'll send you a secure reset link."
    >
      {sent ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5 text-sm text-teal-700">
            <p className="font-semibold">Check your inbox 📬</p>
            <p className="mt-1">
              If an account exists for <b>{email}</b>, a password reset link has been sent. The link
              expires in 1 hour.
            </p>
          </div>
          {devToken && (
            <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 text-sm">
              <p className="font-bold text-brand-700">Demo mode — no email server configured</p>
              <p className="mt-1 text-slate-600">
                Use this link to reset now (dev-only):
              </p>
              <Link
                to={`/reset-password?token=${devToken}`}
                className="mt-3 inline-block w-full truncate rounded-xl bg-white px-4 py-3 text-center font-mono text-xs font-semibold text-brand-700 shadow-sm transition-colors hover:text-brand-800"
              >
                /reset-password?token={devToken}
              </Link>
            </div>
          )}
          <Button variant="secondary" className="w-full" onClick={() => setSent(false)}>
            Use a different email
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="relative">
            <FiMail className="pointer-events-none absolute left-3.5 top-[42px] h-4 w-4 text-slate-400" />
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              autoComplete="email"
            />
          </div>
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Send reset link
          </Button>
          <p className="text-center text-sm text-slate-500">
            Remembered it?{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
