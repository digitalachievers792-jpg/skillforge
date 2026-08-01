import { cn } from '../../utils/format';

const tones = {
  gray: 'bg-slate-100 text-slate-600',
  indigo: 'bg-indigo-50 text-indigo-700',
  teal: 'bg-teal-50 text-teal-700',
  violet: 'bg-violet-50 text-violet-700',
  amber: 'bg-amber-50 text-amber-700',
  rose: 'bg-rose-50 text-rose-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  sky: 'bg-sky-50 text-sky-700',
};

const Badge = ({ children, tone = 'gray', className, dot = false, ...props }) => (
  <span
    className={cn('chip', tones[tone], className)}
    {...props}
  >
    {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
    {children}
  </span>
);

export default Badge;
