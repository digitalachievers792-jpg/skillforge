import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import StatCounter from '../ui/StatCounter';
import api from '../../api/client';

const StatsSection = () => {
  const [live, setLive] = useState(null);

  useEffect(() => {
    api
      .get('/admin/stats')
      .then((d) => setLive(d.stats))
      .catch(() => {});
  }, []);

  const stats = [
    { label: 'Active Learners', end: live ? live.users.students + live.users.instructors : 12000, suffix: '+' },
    { label: 'Expert Courses', end: live ? live.courses.published : 350, suffix: '+' },
    { label: 'Job Matches', end: live ? live.jobs * 40 : 8500, suffix: '+' },
    { label: 'Certificates Earned', end: live ? live.certificates : 4200, suffix: '+' },
  ];

  return (
    <section className="bg-gradient-to-r from-brand-600 via-violet-600 to-teal-600 py-14">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: i * 0.12 }}
            className="text-center text-white"
          >
            <p className="font-display text-3xl font-extrabold sm:text-4xl">
              <StatCounter end={s.end} suffix={s.suffix} duration={2200} />
            </p>
            <p className="mt-1.5 text-sm font-medium text-white/75">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
