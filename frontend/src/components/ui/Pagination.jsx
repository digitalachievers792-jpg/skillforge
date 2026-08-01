import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { cn } from '../../utils/format';

const Pagination = ({ page = 1, pages = 1, onChange, className }) => {
  if (pages <= 1) return null;

  const items = [];
  for (let i = 1; i <= pages; i++) {
    if (pages > 7 && i > 2 && i < pages - 1 && Math.abs(i - page) > 1) {
      if (items[items.length - 1] !== '…') items.push('…');
      continue;
    }
    items.push(i);
  }

  return (
    <div className={cn('flex items-center justify-center gap-1.5', className)}>
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition-all hover:border-brand-300 hover:text-brand-600 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <FiChevronLeft className="h-4 w-4" />
      </button>
      {items.map((item, idx) =>
        item === '…' ? (
          <span key={`e-${idx}`} className="px-1 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onChange(item)}
            className={cn(
              'min-w-9 rounded-lg px-3 py-2 text-sm font-semibold transition-all',
              item === page
                ? 'btn-gradient text-white shadow-glow'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-600'
            )}
          >
            {item}
          </button>
        )
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition-all hover:border-brand-300 hover:text-brand-600 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <FiChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Pagination;
