import { motion } from 'framer-motion';
import { FiArrowRight, FiPlay, FiZap } from 'react-icons/fi';
import Hero3D from '../components/home/Hero3D';
import FeaturesSection from '../components/home/FeaturesSection';
import StatsSection from '../components/home/StatsSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import FeaturedCourses from '../components/home/FeaturedCourses';
import CTASection from '../components/home/CTASection';
import Button from '../components/ui/Button';

const heroContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
};

const heroItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const Landing = () => (
  <div className="overflow-hidden">
    <section className="bg-grid relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -left-32 top-10 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="animate-blob absolute -right-24 top-40 h-80 w-80 rounded-full bg-teal-200/40 blur-3xl [animation-delay:3s]" />
        <div className="animate-blob absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl [animation-delay:6s]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:pt-24">
        <motion.div variants={heroContainer} initial="hidden" animate="visible">
          <motion.div variants={heroItem} className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-4 py-1.5 text-xs font-semibold text-brand-700 shadow-sm backdrop-blur">
            <FiZap className="h-3.5 w-3.5 text-amber-500" />
            AI-Powered Learning &amp; Career Platform
          </motion.div>

          <motion.h1
            variants={heroItem}
            className="font-display mt-6 text-4xl font-extrabold leading-[1.12] tracking-tight text-slate-800 sm:text-5xl xl:text-6xl"
          >
            Forge the skills.
            <br />
            Shape the <span className="text-gradient">future of your career.</span>
          </motion.h1>

          <motion.p variants={heroItem} className="mt-6 max-w-xl text-lg leading-relaxed text-slate-500">
            Master in-demand skills with expert-led courses, get personalized mentoring from an AI
            career coach, and connect with opportunities that match your growing skill set.
          </motion.p>

          <motion.div variants={heroItem} className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Button to="/signup" size="lg">
              Start learning free <FiArrowRight className="h-4 w-4" />
            </Button>
            <Button to="/courses" variant="secondary" size="lg">
              <FiPlay className="h-4 w-4" /> Explore courses
            </Button>
          </motion.div>

          <motion.div variants={heroItem} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <span className="flex -space-x-2">
                {['#f43f5e', '#14b8a6', '#6366f1', '#f59e0b'].map((c, i) => (
                  <span key={c} className="h-8 w-8 rounded-full border-2 border-white" style={{ background: `linear-gradient(135deg, ${c}, ${['#fb7185', '#2dd4bf', '#818cf8', '#fbbf24'][i]})` }} />
                ))}
              </span>
              <b className="text-slate-700">12,000+</b> learners
            </span>
            <span className="flex items-center gap-2">
              <span className="text-amber-400">★★★★★</span>
              <b className="text-slate-700">4.8/5</b> avg. rating
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden h-[480px] lg:block xl:h-[540px]"
        >
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-brand-200/60 to-teal-200/50 blur-3xl" />
          <Hero3D className="absolute inset-0" />
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 5 }}
            className="glass absolute left-0 top-10 z-10 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-card"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white">🏆</span>
            <div>
              <p className="text-xs font-bold text-slate-700">Certificate earned!</p>
              <p className="text-[10px] text-slate-400">React Mastery · just now</p>
            </div>
          </motion.div>
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 6, delay: 1 }}
            className="glass absolute bottom-14 right-0 z-10 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-card"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 text-white">🤖</span>
            <div>
              <p className="text-xs font-bold text-slate-700">AI Mentor: Forge</p>
              <p className="text-[10px] text-slate-400">“I recommend the Data Science path…”</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>

    <FeaturesSection />
    <StatsSection />
    <FeaturedCourses />
    <TestimonialsSection />
    <CTASection />
  </div>
);

export default Landing;
