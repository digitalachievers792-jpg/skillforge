import { motion } from 'framer-motion';
import {
  FiBookOpen, FiBriefcase, FiMessageSquare, FiCpu, FiAward, FiUsers,
} from 'react-icons/fi';
import { RevealItem, RevealStagger } from '../ui/Reveal';

const features = [
  {
    icon: FiCpu,
    title: 'AI Mentor Chatbot',
    description:
      'Get instant answers about courses, careers, and learning paths from Forge — your personal AI mentor, powered by any OpenAI-compatible model.',
    tone: 'from-brand-500 to-violet-500',
  },
  {
    icon: FiBookOpen,
    title: 'Curated Course Catalog',
    description:
      'Explore beginner-to-advanced courses across web dev, data science, AI, cloud, and more — with progress tracking and certificates.',
    tone: 'from-teal-500 to-emerald-500',
  },
  {
    icon: FiBriefcase,
    title: 'Career & Job Board',
    description:
      'Discover remote and on-site opportunities matched to your skills. Save jobs, apply in one click with your resume, and track applications.',
    tone: 'from-violet-500 to-fuchsia-500',
  },
  {
    icon: FiUsers,
    title: 'Thriving Community',
    description:
      'Ask questions, share knowledge, and get answers in the community forum — with upvoting, tags, and accepted-answer badges.',
    tone: 'from-sky-500 to-blue-500',
  },
  {
    icon: FiAward,
    title: 'Verified Certificates',
    description:
      'Complete courses 100% and earn shareable certificates with unique verification codes you can show employers.',
    tone: 'from-amber-500 to-orange-500',
  },
  {
    icon: FiMessageSquare,
    title: 'Insightful Reviews',
    description:
      'Real ratings and reviews from enrolled students help you choose the right course — and instructors get feedback that drives quality.',
    tone: 'from-rose-500 to-pink-500',
  },
];

const FeaturesSection = () => (
  <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="mx-auto mb-14 max-w-2xl text-center"
    >
      <span className="chip bg-brand-50 text-brand-600">Why SkillForge</span>
      <h2 className="font-display mt-4 text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
        Everything you need to <span className="text-gradient">learn, grow &amp; get hired</span>
      </h2>
      <p className="mt-4 text-slate-500">
        One platform that combines AI-powered learning, career guidance, and a hiring-ready community.
      </p>
    </motion.div>

    <RevealStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((f) => (
        <RevealItem key={f.title}>
          <div className="card-hover group relative h-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-7 shadow-card">
            <div
              className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${f.tone} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
            >
              <f.icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.description}</p>
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-brand-100/60 to-teal-100/60 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
          </div>
        </RevealItem>
      ))}
    </RevealStagger>
  </section>
);

export default FeaturesSection;
