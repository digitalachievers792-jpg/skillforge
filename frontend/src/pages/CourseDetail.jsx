import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import toast from 'react-hot-toast';
import {
  FiCheckCircle, FiClock, FiPlayCircle, FiStar, FiUsers, FiBookOpen,
  FiChevronDown, FiBarChart2, FiAward, FiCalendar,
} from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import api, { extractError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { PageLoader } from '../components/ui/Spinner';
import { StarRating } from '../components/ui/StarRating';
import { Textarea, Input } from '../components/ui/Field';
import { formatMoney, timeAgo, formatDuration, totalDuration, totalLessons, pluralize, cn } from '../utils/format';
import { LEVEL_LABELS } from '../utils/constants';

const ReviewItem = ({ review }) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
    <div className="flex items-center gap-3">
      <Avatar name={review.user?.name} src={review.user?.avatar} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-800">{review.user?.name || 'Deleted user'}</p>
        <p className="text-xs text-slate-400">{timeAgo(review.createdAt)}</p>
      </div>
      <StarRating value={review.rating} size="sm" disabled />
    </div>
    {review.title && <p className="mt-3 text-sm font-bold text-slate-700">{review.title}</p>}
    {review.body && (
      <div
        className="rich-content mt-1.5 !space-y-1 text-sm"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(review.body) }}
      />
    )}
    {review.isEdited && <p className="mt-2 text-[10px] uppercase tracking-wide text-slate-400">Edited</p>}
  </div>
);

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [openSections, setOpenSections] = useState({});
  const [reviews, setReviews] = useState({ reviews: [], distribution: {}, average: 0, total: 0, pages: 1 });
  const [myReview, setMyReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 0, title: '', body: '' });
  const [reviewPage, setReviewPage] = useState(1);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/courses/${id}`)
      .then((d) => {
        setCourse(d.course);
        setEnrollment(d.enrollment);
      })
      .catch((err) => {
        toast.error(extractError(err, 'Course not found.'));
        navigate('/courses');
      })
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    api
      .get(`/reviews/courses/${id}/reviews`, { page: reviewPage, limit: 6 })
      .then((d) => setReviews(d))
      .catch(() => {});
    if (user) {
      api.get(`/reviews/courses/${id}/reviews/mine`).then((d) => {
        if (d.review) {
          setMyReview(d.review);
          setReviewForm({ rating: d.review.rating, title: d.review.title || '', body: d.review.body || '' });
        }
      }).catch(() => {});
    }
  }, [id, user, reviewPage]);

  const allLessons = useMemo(
    () => (course?.curriculum || []).flatMap((s) => s.lessons),
    [course]
  );
  const completedIds = useMemo(
    () => new Set((enrollment?.completedLessons || []).map((l) => String(l))),
    [enrollment]
  );

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/courses/${id}` } });
      return;
    }
    setEnrolling(true);
    try {
      await api.post(`/enrollments/${id}`);
      toast.success('Enrolled successfully! 🎓');
      const d = await api.get(`/courses/${id}`);
      setEnrollment(d.enrollment);
      navigate(`/learn/${id}`);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setEnrolling(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (reviewForm.rating === 0) {
      toast.error('Please select a star rating.');
      return;
    }
    setSubmittingReview(true);
    try {
      if (myReview) {
        await api.put(`/reviews/${myReview._id}`, reviewForm);
        toast.success('Review updated!');
      } else {
        await api.post(`/reviews/courses/${id}/reviews`, reviewForm);
        toast.success('Review submitted. Thank you!');
      }
      const d = await api.get(`/reviews/courses/${id}/reviews`, { page: reviewPage, limit: 6 });
      setReviews(d);
      const mine = await api.get(`/reviews/courses/${id}/reviews/mine`);
      setMyReview(mine.review);
      const c = await api.get(`/courses/${id}`);
      setCourse(c.course);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <PageLoader label="Loading course…" />;
  if (!course) return null;

  const distMax = Math.max(1, ...Object.values(reviews.distribution || {}));
  const isEnrolled = !!enrollment;
  const isInstructorOwner = user && (user.role === 'admin' || (user.role === 'instructor' && course.instructor?._id === user._id));

  return (
    <div>
      <div className="bg-gradient-to-br from-brand-700 via-violet-700 to-teal-700 pb-16 pt-10 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
            <span>{course.category}</span>
            <span>·</span>
            <span>{LEVEL_LABELS[course.level]}</span>
            <span>·</span>
            <span>{pluralize(course.enrolledCount || 0, 'student')} enrolled</span>
          </div>
          <h1 className="font-display mt-3 max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl">
            {course.title}
          </h1>
          <p className="mt-3 max-w-2xl text-white/80">{course.shortDescription}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="flex items-center gap-1.5 font-semibold text-amber-300">
              <FiStar className="h-4 w-4" /> {course.ratingSummary?.average > 0 ? course.ratingSummary.average.toFixed(1) : 'New'} ({course.ratingSummary?.count || 0} reviews)
            </span>
            <span className="flex items-center gap-1.5">
              <FiClock className="h-4 w-4" /> {formatDuration(totalDuration(course.curriculum))} total
            </span>
            <span className="flex items-center gap-1.5">
              <FiPlayCircle className="h-4 w-4" /> {pluralize(totalLessons(course.curriculum), 'lesson')}
            </span>
            <span className="flex items-center gap-1.5">
              <FiBarChart2 className="h-4 w-4" /> {LEVEL_LABELS[course.level]}
            </span>
            <span className="flex items-center gap-1.5">
              <FiCalendar className="h-4 w-4" /> Published {timeAgo(course.publishedAt)}
            </span>
          </div>
          {course.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {course.tags.map((t) => (
                <span key={t} className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-10 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0 space-y-10">
            <section>
              <h2 className="font-display text-xl font-extrabold text-slate-800">About this course</h2>
              <div
                className="rich-content mt-4"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(course.description) }}
              />
            </section>

            <section>
              <h2 className="font-display text-xl font-extrabold text-slate-800">
                Curriculum ({totalLessons(course.curriculum)} lessons)
              </h2>
              <div className="mt-4 space-y-3">
                {course.curriculum.map((section, si) => {
                  const open = openSections[si] ?? si === 0;
                  const done = section.lessons.filter((l) => completedIds.has(String(l._id))).length;
                  return (
                    <div key={si} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
                      <button
                        onClick={() => setOpenSections((o) => ({ ...o, [si]: !open }))}
                        className="flex w-full items-center gap-3 px-5 py-4 text-left"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-600">
                          {si + 1}
                        </span>
                        <span className="flex-1 font-bold text-slate-700">{section.title}</span>
                        <span className="text-xs text-slate-400">
                          {done}/{section.lessons.length} done
                        </span>
                        <FiChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', open && 'rotate-180')} />
                      </button>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                          >
                            <ul className="divide-y divide-slate-50 border-t border-slate-50">
                              {section.lessons.map((lesson, li) => {
                                const isDone = completedIds.has(String(lesson._id));
                                return (
                                  <li key={lesson._id}>
                                    <button
                                      onClick={() => isEnrolled && navigate(`/learn/${course._id}?lesson=${lesson._id}`)}
                                      disabled={!isEnrolled}
                                      className={cn(
                                        'flex w-full items-center gap-3 px-5 py-3 text-left transition-colors',
                                        isEnrolled ? 'hover:bg-brand-50/50 cursor-pointer' : 'cursor-default'
                                      )}
                                    >
                                      {isDone ? (
                                        <FiCheckCircle className="h-4 w-4 shrink-0 text-teal-500" />
                                      ) : (
                                        <FiPlayCircle className="h-4 w-4 shrink-0 text-slate-300" />
                                      )}
                                      <span className={cn('flex-1 text-sm', isDone ? 'text-slate-400 line-through' : 'text-slate-600')}>
                                        {lesson.title}
                                      </span>
                                      {lesson.isFree && (
                                        <Badge tone="teal" className="!px-2 !py-0.5 text-[10px]">FREE</Badge>
                                      )}
                                      <span className="text-xs text-slate-400">
                                        {formatDuration(lesson.duration)}
                                      </span>
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="font-display text-xl font-extrabold text-slate-800">Your instructor</h2>
              <div className="mt-4 flex flex-col gap-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-card sm:flex-row sm:items-start">
                <Avatar name={course.instructor?.name} src={course.instructor?.avatar} size="xl" ring />
                <div className="min-w-0">
                  <p className="text-lg font-bold text-slate-800">{course.instructor?.name || 'SkillForge Team'}</p>
                  {course.instructor?.headline && <p className="text-sm text-brand-600">{course.instructor.headline}</p>}
                  {course.instructor?.bio && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">{course.instructor.bio}</p>
                  )}
                  {course.instructor?._id && (
                    <Button to={`/users/${course.instructor._id}`} variant="secondary" size="sm" className="mt-4">
                      View full profile
                    </Button>
                  )}
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-extrabold text-slate-800">
                  Student reviews ({reviews.total})
                </h2>
              </div>

              <div className="mt-4 grid gap-6 lg:grid-cols-[220px_1fr]">
                <div className="rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-card">
                  <p className="font-display text-5xl font-extrabold text-slate-800">
                    {(reviews.average || 0).toFixed(1)}
                  </p>
                  <StarRating value={reviews.average || 0} className="mt-2 justify-center" />
                  <p className="mt-2 text-xs text-slate-400">{reviews.total} reviews</p>
                  <div className="mt-4 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="w-3 text-slate-500">{star}</span>
                        <FiStar className="h-3 w-3 text-amber-400" />
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                            style={{ width: `${((reviews.distribution?.[star] || 0) / distMax) * 100}%` }}
                          />
                        </div>
                        <span className="w-4 text-right text-slate-400">{reviews.distribution?.[star] || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="min-w-0">
                  {reviews.reviews?.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-12 text-center">
                      <FiBookOpen className="mb-3 h-8 w-8 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-500">No reviews yet</p>
                      <p className="text-xs text-slate-400">Be the first to share your experience!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.reviews.map((r) => (
                        <ReviewItem key={r._id} review={r} />
                      ))}
                      {reviews.pages > 1 && (
                        <div className="flex gap-2">
                          {Array.from({ length: reviews.pages }, (_, i) => i + 1).map((p) => (
                            <button
                              key={p}
                              onClick={() => setReviewPage(p)}
                              className={cn(
                                'rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
                                p === reviews.page ? 'btn-gradient' : 'border border-slate-200 text-slate-500 hover:border-brand-300'
                              )}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {isEnrolled && (
                <form onSubmit={handleReview} className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
                  <h3 className="font-bold text-slate-800">
                    {myReview ? 'Update your review' : 'Share your experience'}
                  </h3>
                  <div className="mt-3 flex items-center gap-3">
                    <StarRating value={reviewForm.rating} size="lg" onChange={(r) => setReviewForm({ ...reviewForm, rating: r })} />
                    <span className="text-sm text-slate-500">
                      {reviewForm.rating ? `${reviewForm.rating}/5` : 'Select a rating'}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-4">
                    <Input
                      placeholder="Review title (optional)"
                      value={reviewForm.title}
                      onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                      maxLength={120}
                    />
                    <Textarea
                      placeholder="What did you think of the course? (optional)"
                      value={reviewForm.body}
                      onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })}
                      maxLength={2000}
                    />
                  </div>
                  <Button type="submit" loading={submittingReview} className="mt-4">
                    {myReview ? 'Update review' : 'Submit review'}
                  </Button>
                </form>
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-glow">
              <div className="aspect-video bg-gradient-to-br from-brand-500 via-violet-500 to-teal-500">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FiPlayCircle className="h-14 w-14 text-white/80" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <p className="font-display text-3xl font-extrabold text-slate-800">
                  {formatMoney(course.price)}
                </p>
                <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                  <li className="flex items-center gap-2.5">
                    <FiPlayCircle className="h-4 w-4 text-brand-500" /> {pluralize(totalLessons(course.curriculum), 'on-demand lesson')}
                  </li>
                  <li className="flex items-center gap-2.5">
                    <FiClock className="h-4 w-4 text-brand-500" /> {formatDuration(totalDuration(course.curriculum))} of content
                  </li>
                  <li className="flex items-center gap-2.5">
                    <FiAward className="h-4 w-4 text-brand-500" /> Certificate of completion
                  </li>
                  <li className="flex items-center gap-2.5">
                    <FiUsers className="h-4 w-4 text-brand-500" /> {pluralize(course.enrolledCount || 0, 'student')}
                  </li>
                </ul>

                {isEnrolled ? (
                  <Button size="lg" className="mt-6 w-full" onClick={() => navigate(`/learn/${course._id}`)}>
                    Continue learning
                  </Button>
                ) : (
                  <Button size="lg" className="mt-6 w-full" loading={enrolling} onClick={handleEnroll}>
                    {course.price > 0 ? `Enroll for ${formatMoney(course.price)}` : 'Enroll for free'}
                  </Button>
                )}

                {isInstructorOwner && (
                  <Button
                    variant="secondary"
                    size="md"
                    className="mt-3 w-full"
                    onClick={() => navigate('/dashboard/instructor?tab=manage')}
                  >
                    Manage course
                  </Button>
                )}

                <p className="mt-4 text-center text-xs text-slate-400">
                  30-day money-back guarantee · Lifetime access
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
