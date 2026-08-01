import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import api from '../../api/client';
import CourseCard from '../courses/CourseCard';
import Skeleton from '../ui/Skeleton';
import Button from '../ui/Button';

const FeaturedCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    api
      .get('/courses/featured')
      .then((d) => setCourses(d.courses || []))
      .catch((e) => {
        setLoadError(`${e.message}${e.response?.status ? ` (HTTP ${e.response.status})` : ''}${e.config?.url ? ` — ${e.config.baseURL || ''}${e.config.url}` : ''}`);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
      >
        <div>
          <span className="chip bg-brand-50 text-brand-600">Top Picks</span>
          <h2 className="font-display mt-4 text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
            Featured <span className="text-gradient">courses</span>
          </h2>
          <p className="mt-3 text-slate-500">Hand-picked by our instructors and rated by students like you.</p>
        </div>
        <Button to="/courses" variant="secondary" size="md">
          View all courses <FiArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>

      {loadError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          Load error: {loadError}
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
          No featured courses yet — check back soon!
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courses.slice(0, 4).map((course, i) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.1 }}
            >
              <CourseCard course={course} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

export default FeaturedCourses;
