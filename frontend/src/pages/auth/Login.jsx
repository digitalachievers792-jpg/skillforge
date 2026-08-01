import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';
import AuthLayout from '../../components/auth/AuthLayout';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { useAuth } from '../../context/AuthContext';
import { extractError } from '../../api/client';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || '/dashboard';
  const sessionExpired = new URLSearchParams(location.search).get('session') === 'expired';

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(form.email.trim(), form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      const dest =
        user.role === 'admin' ? '/dashboard/admin' : user.role === 'instructor' ? '/dashboard/instructor' : from;
      navigate(dest, { replace: true });
    } catch (err) {
      const msg = extractError(err);
      if (msg.includes('verify')) {
        toast.error(msg);
        navigate(`/verify-email?resend=${encodeURIComponent(form.email)}`);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back 👋" subtitle="Sign in to continue forging your career.">
      {sessionExpired && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Your session expired. Please sign in again.
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="relative">
          <FiMail className="pointer-events-none absolute left-3.5 top-[42px] h-4 w-4 text-slate-400" />
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            className="pl-10"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
            autoComplete="email"
          />
        </div>
        <div className="relative">
          <FiLock className="pointer-events-none absolute left-3.5 top-[42px] h-4 w-4 text-slate-400" />
          <Input
            label="Password"
            type={showPw ? 'text' : 'password'}
            placeholder="••••••••"
            className="pl-10 pr-12"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="absolute right-3.5 top-[42px] text-slate-400 transition-colors hover:text-slate-600"
            aria-label="Toggle password visibility"
          >
            {showPw ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-500">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" defaultChecked />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-semibold text-brand-600 hover:text-brand-700">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Sign in
        </Button>

        <p className="text-center text-sm text-slate-500">
          New to SkillForge?{' '}
          <Link to="/signup" className="font-bold text-brand-600 hover:text-brand-700">
            Create a free account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
