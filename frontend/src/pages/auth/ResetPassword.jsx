import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiLock } from 'react-icons/fi';
import AuthLayout from '../../components/auth/AuthLayout';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import api, { extractError } from '../../api/client';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (password.length < 8) e.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) e.password = 'Include a letter and a number';
    if (confirm !== password) e.confirm = 'Passwords do not match';
    if (!token) e.token = 'Missing reset token';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Password reset! You can now sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Set a new password 🔒" subtitle="Choose a strong password you haven't used before.">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="relative">
          <FiLock className="pointer-events-none absolute left-3.5 top-[42px] h-4 w-4 text-slate-400" />
          <Input
            label="New password"
            type={showPw ? 'text' : 'password'}
            placeholder="8+ characters, letters & numbers"
            className="pl-10 pr-12"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
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
        <Input
          label="Confirm new password"
          type={showPw ? 'text' : 'password'}
          placeholder="Repeat your password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
          autoComplete="new-password"
        />
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Reset password
        </Button>
        <p className="text-center text-sm text-slate-500">
          <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
