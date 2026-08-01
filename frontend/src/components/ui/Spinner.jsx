import { cn } from '../../utils/format';

const Spinner = ({ className, size = 'md' }) => (
  <span
    className={cn(
      'inline-block animate-spin rounded-full border-brand-500 border-t-transparent',
      size === 'sm' && 'h-4 w-4 border-2',
      size === 'md' && 'h-8 w-8 border-[3px]',
      size === 'lg' && 'h-12 w-12 border-4',
      className
    )}
  />
);

export const PageLoader = ({ label = 'Loading…' }) => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
    <Spinner size="lg" />
    <p className="text-sm text-slate-500">{label}</p>
  </div>
);

export default Spinner;
