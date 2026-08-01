import { cn } from '../../utils/format';

export const ProgressBar = ({ value = 0, className, tone = 'brand', showLabel = true }) => {
  const pct = Math.min(100, Math.max(0, value));
  const tones = {
    brand: 'bg-gradient-to-r from-brand-500 to-violet-500',
    teal: 'bg-gradient-to-r from-teal-500 to-emerald-500',
    amber: 'bg-gradient-to-r from-amber-400 to-orange-500',
  };
  return (
    <div className={className}>
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-500">Progress</span>
          <span className="font-bold text-slate-700">{Math.round(pct)}%</span>
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn('h-full rounded-full transition-all duration-700', tones[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
