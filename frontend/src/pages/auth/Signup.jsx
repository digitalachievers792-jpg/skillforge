import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiLock, FiMail, FiUser } from 'react-icons/fi';
import AuthLayout from '../../components/auth/AuthLayout';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { useAuth } from '../../context/AuthContext';
import { extractError } from '../../api/client';

const Signup = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Enter a valid email';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(form.password)) e.password = 'Password must include a letter and a number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      toast.success('Account created! Check your email to verify.');
      navigate(`/verify-email?email=${encodeURIComponent(form.email)}&devToken=${data.devVerifyToken || ''}`);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your free account 🚀"
      subtitle="Join 12,000+ learners building their future on SkillForge."
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="relative">
          <FiUser className="pointer-events-none absolute left-3.5 top-[42px] h-4 w-4 text-slate-400" />
          <Input
            label="Full name"
            placeholder="Ayesha Khan"
            className="pl-10"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
            autoComplete="name"
          />
        </div>

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
            placeholder="8+ characters, letters & numbers"
            className="pl-10 pr-12"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
            hint="At least 8 characters with a letter and a number"
            autoComplete="new-password"
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

        <div>
          <p className="label-base">I want to join as</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'student', label: '🎓 Student' },
              { value: 'instructor', label: '👨‍🏫 Instructor' },
            ].map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm({ ...form, role: r.value })}
                className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  form.role === r.value
                    ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-soft'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-brand-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Create account
        </Button>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </p>
        <p className="text-center text-xs text-slate-400">
          By signing up you agree to our Terms &amp; Privacy Policy. We never share your data.
        </p>
      </form>
    </AuthLayout>
  );
};

export default Signup;
