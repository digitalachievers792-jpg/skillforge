import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiCheckCircle, FiChevronDown, FiPlayCircle, FiAward, FiMenu,
} from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import api, { extractError } from '../api/client';
import { PageLoader } from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import { formatDuration, formatDate, cn } from '../utils/format';
import { SAMPLE_VIDEOS } from '../utils/constants';

const LessonPlayer = () => {
  const { courseId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [marking, setMarking] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const lessonParam = params.get('lesson');

  useEffect(() => {
    (async () => {
      try {
        const [c, e] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get('/enrollments/my'),
        ]);
        const enroll = e.enrollments?.find((en) => String(en.course._id) === courseId);
        setCourse(c.course);
        setEnrollment(enroll || c.enrollment || null);
        if (!enroll && !c.enrollment) {
          toast.error('You need to enroll first to access lessons.');
          navigate(`/courses/${courseId}`);
        }
      } catch (err) {
        toast.error(extractError(err));
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  const allLessons = useMemo(() => (course?.curriculum || []).flatMap((s) => s.lessons), [course]);
  const completedIds = useMemo(
    () => new Set((enrollment?.completedLessons || []).map((l) => String(l))),
    [enrollment]
  );

  const current = useMemo(
    () => allLessons.find((l) => String(l._id) === lessonParam) || allLessons[0],
    [allLessons, lessonParam]
  );

  useEffect(() => {
    if (!current) return;
    if (current.videoUrl) setVideoUrl(current.videoUrl);
    else setVideoUrl(SAMPLE_VIDEOS[Math.abs(String(current._id).charCodeAt(0)) % SAMPLE_VIDEOS.length]);
    setSidebarOpen(false);
  }, [current]);

  if (loading) return <PageLoader label="Loading your lesson…" />;
  if (!course || !current) return null;

  const currentIndex = allLessons.findIndex((l) => l._id === current._id);
  const isCompleted = completedIds.has(String(current._id));
  const next = allLessons[currentIndex + 1];
  const prev = allLessons[currentIndex - 1];

  const markComplete = async (lessonId) => {
    setMarking(true);
    try {
      const d = await api.put(`/enrollments/${courseId}/progress`, { lessonId });
      setEnrollment(d.enrollment);
      if (d.certificateCode) {
        toast.success('🎉 Course complete! You earned a certificate!');
        setTimeout(() => navigate(`/certificates/${d.certificateCode}`), 1200);
      } else {
        toast.success('Lesson marked complete.');
      }
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-slate-100">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="sm" className="!p-2" onClick={() => navigate(`/courses/${courseId}`)} aria-label="Back to course">
            <FiArrowLeft className="h-5 w-5" />
          </Button>
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-brand-600 lg:hidden"
            aria-label="Toggle curriculum"
          >
            <FiMenu className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-800">{current.title}</p>
            <p className="hidden truncate text-xs text-slate-400 sm:block">{course.title}</p>
          </div>
        </div>
        <div className="hidden w-56 sm:block">
          <ProgressBar value={enrollment?.progressPercent || 0} showLabel />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="w-72 shrink-0 overflow-y-auto border-r border-slate-200 bg-white"
            >
              <div className="border-b border-slate-100 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Course content</p>
                <p className="mt-1 text-sm font-bold text-slate-700">{course.title}</p>
              </div>
              {course.curriculum.map((section, si) => (
                <div key={si} className="border-b border-slate-50 py-2">
                  <p className="px-4 py-1.5 text-xs font-bold text-slate-500">{section.title}</p>
                  {section.lessons.map((lesson) => {
                    const done = completedIds.has(String(lesson._id));
                    const active = String(lesson._id) === String(current._id);
                    return (
                      <button
                        key={lesson._id}
                        onClick={() => navigate(`/learn/${courseId}?lesson=${lesson._id}`)}
                        className={cn(
                          'flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors',
                          active ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                        )}
                      >
                        {done ? (
                          <FiCheckCircle className="h-4 w-4 shrink-0 text-teal-500" />
                        ) : (
                          <FiPlayCircle className="h-4 w-4 shrink-0 text-slate-300" />
                        )}
                        <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
                        <span className="text-[10px] text-slate-400">{formatDuration(lesson.duration)}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </motion.aside>
          )}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="mx-auto max-w-4xl">
              <div className="relative overflow-hidden rounded-2xl bg-slate-900 shadow-glow">
                <video
                  key={videoUrl}
                  src={videoUrl}
                  poster=""
                  controls
                  playsInline
                  className="aspect-video w-full"
                />
                <div className="absolute bottom-3 right-3 rounded-lg bg-slate-900/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                  Demo video · replace with your own via course settings
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-800">{current.title}</h1>
                  {current.description && <p className="mt-1 text-sm text-slate-500">{current.description}</p>}
                  <p className="mt-1 text-xs text-slate-400">
                    Lesson {currentIndex + 1} of {allLessons.length} · {formatDuration(current.duration)}
                  </p>
                </div>
                <Button
                  onClick={() => markComplete(current._id)}
                  loading={marking}
                  disabled={isCompleted}
                  variant={isCompleted ? 'secondary' : 'primary'}
                  className="shrink-0"
                >
                  {isCompleted ? (
                    <>
                      <FiCheckCircle className="h-4 w-4 text-teal-500" /> Completed
                    </>
                  ) : (
                    'Mark as complete'
                  )}
                </Button>
              </div>

              <div className="mt-8 flex items-center justify-between gap-3">
                {prev ? (
                  <Button variant="secondary" size="md" onClick={() => navigate(`/learn/${courseId}?lesson=${prev._id}`)}>
                    ← Previous
                  </Button>
                ) : <span />}
                {next ? (
                  <Button size="md" onClick={() => navigate(`/learn/${courseId}?lesson=${next._id}`)}>
                    Next lesson →
                  </Button>
                ) : enrollment?.status === 'completed' ? (
                  <Button size="md" onClick={() => navigate(`/certificates/${enrollment.certificate?.code || ''}`)}>
                    <FiAward className="h-4 w-4" /> View certificate
                  </Button>
                ) : (
                  <Button size="md" onClick={() => markComplete(current._id)} loading={marking}>
                    Complete course 🎓
                  </Button>
                )}
              </div>

              {enrollment?.status === 'completed' && (
                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
                  <FiAward className="h-6 w-6 text-amber-500" />
                  <div>
                    <p className="text-sm font-bold text-amber-700">Course completed! 🎉</p>
                    <p className="text-xs text-amber-600">
                      Certificate issued {enrollment.certificate?.issuedAt ? `on ${formatDate(enrollment.certificate.issuedAt)}` : ''}.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPlayer;
