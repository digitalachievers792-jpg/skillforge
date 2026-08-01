import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const StatCounter = ({ end, suffix = '', prefix = '', duration = 2000, decimals = 0, className }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Number((end * easeOutCubic(progress)).toFixed(decimals)));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, end, duration, decimals]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString(undefined, { maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
};

export default StatCounter;
