import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';

const bullets = [
  { icon: '🎓', text: 'Expert-led courses with progress tracking' },
  { icon: '🤖', text: 'AI career mentor available 24/7' },
  { icon: '💼', text: 'Job board matched to your skills' },
  { icon: '🏆', text: 'Verified certificates for your resume' },
];

const AuthLayout = ({ title, subtitle, children, backTo = '/' }) => (
  <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 via-violet-600 to-teal-600 lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-teal-300/20 blur-3xl" />
      <div className="pointer-events-none absolute left-1/3 top-1/2 h-40 w-40 rounded-full bg-violet-300/20 blur-2xl" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-xl backdrop-blur">⚒️</span>
          <span className="font-display text-2xl font-extrabold text-white">
            Skill<span className="text-amber-300">Forge</span>
          </span>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
      >
        <h2 className="font-display max-w-md text-3xl font-extrabold leading-tight text-white">
          Build skills that employers actually want.
        </h2>
        <div className="mt-8 space-y-4">
          {bullets.map((b, i) => (
            <motion.div
              key={b.text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.12 }}
              className="flex items-center gap-3 text-white/90"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-lg backdrop-blur">
                {b.icon}
              </span>
              <span className="text-sm font-medium">{b.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <p className="text-xs text-white/60">© {new Date().getFullYear()} SkillForge · Final Year Project</p>
    </div>

    <div className="flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link to={backTo} className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-brand-600">
          <FiArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </motion.div>
    </div>
  </div>
);

export default AuthLayout;
