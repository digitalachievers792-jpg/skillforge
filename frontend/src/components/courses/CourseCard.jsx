import { Link } from 'react-router-dom';
import { FiClock, FiPlayCircle, FiStar, FiUsers } from 'react-icons/fi';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { formatMoney, formatDuration, totalDuration, totalLessons } from '../../utils/format';
import { LEVEL_LABELS } from '../../utils/constants';

const CourseCard = ({ course }) => {
  const gradient =
    'linear-gradient(135deg, rgba(99,102,241,0.92), rgba(139,92,246,0.88)), radial-gradient(circle at 80% 20%, rgba(20,184,166,0.55), transparent 60%)';

  return (
    <Link
      to={`/courses/${course._id}`}
      className="card-hover group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ background: gradient }}>
            <FiPlayCircle className="h-10 w-10 text-white/80 transition-transform duration-500 group-hover:scale-110" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge tone="indigo" className="!bg-white/90 backdrop-blur">{course.category}</Badge>
          {course.level !== 'all-levels' && (
            <Badge tone="teal" className="!bg-white/90 backdrop-blur">{LEVEL_LABELS[course.level]}</Badge>
          )}
        </div>
        <span className="absolute bottom-3 right-3 rounded-lg bg-slate-900/70 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
          {formatMoney(course.price)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-bold leading-snug text-slate-800 transition-colors group-hover:text-brand-700">
          {course.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">{course.shortDescription}</p>

        <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1 font-semibold text-amber-500">
            <FiStar className="h-3.5 w-3.5" />
            {course.ratingSummary?.average > 0 ? course.ratingSummary.average.toFixed(1) : 'New'}
          </span>
          <span className="flex items-center gap-1">
            <FiClock className="h-3.5 w-3.5" />
            {formatDuration(totalDuration(course.curriculum))}
          </span>
          <span className="flex items-center gap-1">
            <FiPlayCircle className="h-3.5 w-3.5" />
            {totalLessons(course.curriculum)} lessons
          </span>
          <span className="ml-auto flex items-center gap-1">
            <FiUsers className="h-3.5 w-3.5" />
            {course.enrolledCount || 0}
          </span>
        </div>

        {course.instructor && (
          <div className="mt-4 flex items-center gap-2.5 border-t border-slate-50 pt-3.5">
            <Avatar name={course.instructor.name} src={course.instructor.avatar} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-700">{course.instructor.name}</p>
              {course.instructor.headline && (
                <p className="truncate text-[11px] text-slate-400">{course.instructor.headline}</p>
              )}
            </div>
            <span className="ml-auto text-[11px] font-bold text-brand-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Enroll →
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default CourseCard;
