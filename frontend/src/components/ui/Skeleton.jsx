import { cn } from '../../utils/format';

const Skeleton = ({ className }) => (
  <div className={cn('animate-shimmer rounded-xl', className)} aria-hidden="true" />
);

export default Skeleton;
