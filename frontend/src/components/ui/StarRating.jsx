import { motion } from 'framer-motion';
import { cn } from '../../utils/format';

export const StarRating = ({ value = 0, size = 'md', className, onChange, disabled }) => {
  const sizes = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' };
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className={cn('inline-flex items-center gap-0.5', sizes[size], className)}>
      {stars.map((star) => {
        const filled = star <= Math.round(value);
        const half = !filled && value >= star - 0.5 && value < star;
        const Icon = half ? StarHalf : StarFull;
        return (
          <button
            key={star}
            type="button"
            disabled={disabled || !onChange}
            onClick={() => onChange?.(star)}
            className={cn(
              'transition-transform duration-150',
              onChange && 'hover:scale-125 cursor-pointer',
              filled || half ? 'text-amber-400' : 'text-slate-300'
            )}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
};

const StarFull = () => <span aria-hidden>★</span>;
const StarHalf = () => <span aria-hidden>⯨</span>;
