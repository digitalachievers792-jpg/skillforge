import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiMail, FiXCircle } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import api, { extractError } from '../../api/client';

const VerifyEmail = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const email = params.get('email') || '';
  const devToken = params.get('devToken') || '';
  const [status, setStatus] = useState(token ? 'verifying' : 'idle');
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);
  const [resentEmail, setResentEmail] = useState(email);
  const [devTokenLink, setDevTokenLink] = useState(devToken || '');

  useEffect(() => {
    if (!token) return;
    api
      .get(`/auth/verify-email/${token}`)
      .then((d) => {
        setStatus('success');
        setMessage(d.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(extractError(err, 'Verification link is invalid or has expired.'));
      });
  }, [token]);

  const handleResend = async () => {
    if (!resentEmail.trim()) return;
    setResending(true);
    try {
      const data = await api.post('/auth/resend-verification', { email: resentEmail.trim() });
      setMessage(`A fresh verification link was sent to ${resentEmail}.`);
      setStatus('resent');
      if (data.devVerifyToken) {
        setMessage(`Demo mode — click to verify instantly: /verify-email?token=${data.devVerifyToken}`);
        setDevTokenLink(data.devVerifyToken);
      }
    } catch (err) {
      setMessage(extractError(err));
      setStatus('error');
    } finally {
      setResending(false);
    }
  };

  const Icon =
    status === 'success' || status === 'resent' ? FiCheckCircle : status === 'error' ? FiXCircle : FiMail;
  const tone =
    status === 'success' || status === 'resent'
      ? 'text-teal-500 bg-teal-50'
      : status === 'error'
        ? 'text-rose-500 bg-rose-50'
        : 'text-brand-500 bg-brand-50';

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-soft px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-card sm:p-10"
      >
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${tone}`}>
          <Icon className="h-8 w-8" />
        </div>

        {status === 'verifying' && <p className="mt-6 text-slate-500">Verifying your email…</p>}

        {status === 'success' && (
          <>
            <h1 className="font-display mt-5 text-2xl font-extrabold text-slate-800">Email verified! 🎉</h1>
            <p className="mt-2 text-sm text-slate-500">{message}</p>
            <div className="mt-7 flex flex-col gap-3">
              <Button to="/login" size="lg" className="w-full">
                Continue to sign in
              </Button>
            </div>
          </>
        )}

        {(status === 'error' || status === 'idle' || status === 'resent') && (
          <>
            <h1 className="font-display mt-5 text-2xl font-extrabold text-slate-800">
              {status === 'error' ? 'Verification issue' : 'Verify your email'}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {message || `We sent a verification link to ${email || 'your email'} — click it to activate your account.`}
            </p>

            {devTokenLink && (
              <Link
                to={`/verify-email?token=${devTokenLink}`}
                className="mt-4 block truncate rounded-xl bg-brand-50 px-4 py-3 font-mono text-xs font-semibold text-brand-700"
              >
                Demo link: /verify-email?token={devTokenLink.slice(0, 20)}…
              </Link>
            )}

            <div className="mt-7 space-y-4">
              <input
                value={resentEmail}
                onChange={(e) => setResentEmail(e.target.value)}
                placeholder="Enter your email to resend"
                className="input-base text-center"
              />
              <Button variant="secondary" className="w-full" onClick={handleResend} loading={resending}>
                Resend verification email
              </Button>
              <Link to="/login" className="block text-sm font-semibold text-brand-600 hover:text-brand-700">
                Back to sign in
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
