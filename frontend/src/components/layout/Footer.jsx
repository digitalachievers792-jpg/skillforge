import { Link } from 'react-router-dom';
import { FiGithub, FiLinkedin, FiTwitter, FiFacebook, FiHeart } from 'react-icons/fi';

const columns = [
  {
    title: 'Platform',
    links: [
      { label: 'Browse Courses', to: '/courses' },
      { label: 'Find Jobs', to: '/jobs' },
      { label: 'Community Forum', to: '/forum' },
      { label: 'Instructors', to: '/courses' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/' },
      { label: 'Careers', to: '/jobs' },
      { label: 'Contact', to: '/' },
      { label: 'Blog', to: '/' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Help Center', to: '/' },
      { label: 'Privacy Policy', to: '/' },
      { label: 'Terms of Service', to: '/' },
      { label: 'AI Mentor', to: '/courses' },
    ],
  },
];

const Footer = () => (
  <footer className="relative mt-20 border-t border-slate-100 bg-white">
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 via-violet-600 to-teal-500 text-lg">
              ⚒️
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight text-slate-800">
              Skill<span className="text-gradient">Forge</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
            The AI-powered learning &amp; career platform. Master in-demand skills, get AI mentoring,
            connect with the community, and land your dream job.
          </p>
          <div className="mt-5 flex gap-2.5">
            {[FiGithub, FiLinkedin, FiTwitter, FiFacebook].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">{col.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-slate-500 transition-colors hover:text-brand-600">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row">
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} SkillForge. Built for the Final Year Project.
        </p>
        <p className="flex items-center gap-1.5 text-xs text-slate-400">
          Made with <FiHeart className="text-rose-500" /> for learners everywhere
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
