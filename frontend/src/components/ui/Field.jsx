import { cn } from '../../utils/format';

export const Input = ({ label, error, hint, className, ...props }) => (
  <div className={className}>
    {label && <label className="label-base">{label}</label>}
    <input className={cn('input-base', error && 'border-rose-300 focus:border-rose-400 focus:ring-rose-100')} {...props} />
    {error ? (
      <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>
    ) : hint ? (
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    ) : null}
  </div>
);

export const Textarea = ({ label, error, hint, className, ...props }) => (
  <div className={className}>
    {label && <label className="label-base">{label}</label>}
    <textarea className={cn('input-base min-h-[110px] resize-y', error && 'border-rose-300 focus:border-rose-400 focus:ring-rose-100')} {...props} />
    {error ? (
      <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>
    ) : hint ? (
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    ) : null}
  </div>
);

export const Select = ({ label, error, children, className, ...props }) => (
  <div className={className}>
    {label && <label className="label-base">{label}</label>}
    <select className={cn('input-base appearance-none', error && 'border-rose-300')} {...props}>
      {children}
    </select>
    {error && <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>}
  </div>
);
