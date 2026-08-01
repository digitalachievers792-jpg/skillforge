import { cn, initials } from '../../utils/format';
import { apiUrl } from '../../utils/apiUrl';

const colors = [
  'bg-indigo-100 text-indigo-700',
  'bg-teal-100 text-teal-700',
  'bg-violet-100 text-violet-700',
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
  'bg-sky-100 text-sky-700',
];

const hashColor = (name = '') => {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) | 0;
  return colors[Math.abs(h) % colors.length];
};

const Avatar = ({ name = '', src = '', size = 'md', className, ring = false }) => {
  const sizes = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg',
    xl: 'h-24 w-24 text-2xl',
    xxl: 'h-32 w-32 text-3xl',
  };
  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold',
        sizes[size],
        !src && hashColor(name),
        ring && 'ring-2 ring-brand-200',
        className
      )}
    >
      {src ? (
        <img src={apiUrl(src)} alt={name} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  );
};

export default Avatar;
