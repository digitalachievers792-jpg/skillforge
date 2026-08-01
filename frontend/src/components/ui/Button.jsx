import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/format';

const variants = {
  primary: 'btn-gradient text-white',
  secondary: 'btn-soft',
  outline: 'border-2 border-brand-500 text-brand-600 hover:bg-brand-50 active:scale-[0.97] transition-all duration-300',
  ghost: 'text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition-colors duration-200',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition-all duration-300 active:scale-[0.97]',
  success: 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-all duration-300 active:scale-[0.97]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = forwardRef(
  ({ variant = 'primary', size = 'md', className, loading, disabled, children, as, to, ...props }, ref) => {
    const cls = cn(
      'inline-flex items-center justify-center gap-2 rounded-xl font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none',
      variants[variant],
      sizes[size],
      className
    );

    if (to) {
      return (
        <Link ref={ref} to={to} className={cls} {...props}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} disabled={disabled || loading} className={cls} {...props}>
        {loading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
