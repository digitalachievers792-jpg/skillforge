import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';
import Avatar from '../ui/Avatar';
import { cn } from '../../utils/format';

const testimonials = [
  {
    name: 'Ayesha Khan',
    role: 'Frontend Developer @ TechNest',
    text: 'SkillForge completely changed my career trajectory. The AI mentor helped me pick the perfect learning path, and within 6 months I landed my first remote developer job. The certificates gave my resume real credibility.',
    rating: 5,
  },
  {
    name: 'Daniyal Ahmed',
    role: 'Data Science Student',
    text: 'The data science track is incredibly well-structured. Progress tracking kept me motivated, and the community forum saved me countless times when I got stuck. Best FYP-level platform I have ever used.',
    rating: 5,
  },
  {
    name: 'Sarah Malik',
    role: 'UI/UX Designer',
    text: 'I love how the job board matches opportunities to your skills. Applied to 3 jobs using my saved resume and heard back from 2 within a week. The mock video lessons make learning feel effortless.',
    rating: 4.5,
  },
  {
    name: 'Hamza Raza',
    role: 'Career Switcher',
    text: 'From accounting to cloud engineering — SkillForge gave me a clear roadmap, hands-on projects, and an AI mentor that never judged my questions. The review system helped me choose courses that were actually worth my time.',
    rating: 5,
  },
];

const TestimonialsSection = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(timer);
  }, [paused]);

  const t = testimonials[index];

  return (
    <section className="bg-gradient-soft py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <span className="chip bg-teal-50 text-teal-600">Success Stories</span>
          <h2 className="font-display mt-4 text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
            Loved by <span className="text-gradient">learners worldwide</span>
          </h2>
        </motion.div>

        <div
          className="relative mx-auto max-w-3xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative min-h-[280px] overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 shadow-card sm:p-12">
            <span className="pointer-events-none absolute -left-4 -top-6 font-display text-9xl font-extrabold text-brand-100">
              “
            </span>
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mb-5 flex gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FiStar key={s} className={cn('h-4 w-4', s > Math.round(t.rating) && 'text-slate-200')} />
                  ))}
                </div>
                <p className="text-lg leading-relaxed text-slate-600">{t.text}</p>
                <div className="mt-7 flex items-center gap-4">
                  <Avatar name={t.name} size="lg" />
                  <div>
                    <p className="font-bold text-slate-800">{t.name}</p>
                    <p className="text-sm text-slate-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => setIndex((index - 1 + testimonials.length) % testimonials.length)}
              className="btn-soft rounded-xl p-2.5"
              aria-label="Previous testimonial"
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={cn(
                    'h-2.5 rounded-full transition-all duration-300',
                    i === index ? 'w-8 bg-gradient-to-r from-brand-500 to-violet-500' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                  )}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => setIndex((index + 1) % testimonials.length)}
              className="btn-soft rounded-xl p-2.5"
              aria-label="Next testimonial"
            >
              <FiChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
