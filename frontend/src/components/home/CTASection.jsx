import { motion } from 'framer-motion';
import { FiArrowRight, FiZap } from 'react-icons/fi';
import Button from '../ui/Button';

const CTASection = () => (
  <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-violet-600 to-teal-600 px-8 py-16 text-center text-white shadow-glow sm:px-16"
    >
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-teal-300/20 blur-3xl" />
      <motion.span
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl backdrop-blur"
      >
        <FiZap className="h-7 w-7" />
      </motion.span>
      <h2 className="font-display mx-auto max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
        Your dream career starts with one skill
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-white/80">
        Join thousands of learners forging their futures with AI-powered courses, career mentoring,
        and a community that has your back.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button to="/signup" variant="secondary" size="lg" className="!bg-white !text-brand-700 border-0 shadow-xl hover:!text-brand-800">
          Start learning free <FiArrowRight className="h-4 w-4" />
        </Button>
        <Button to="/courses" variant="outline" size="lg" className="!border-white/60 !text-white hover:!bg-white/10">
          Browse courses
        </Button>
      </div>
    </motion.div>
  </section>
);

export default CTASection;
