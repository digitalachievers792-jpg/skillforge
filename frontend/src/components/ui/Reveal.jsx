import { motion } from 'framer-motion';

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const Reveal = ({ children, variant = fadeUp, delay = 0, className, once = true, amount = 0.2 }) => (
  <motion.div
    className={className}
    variants={variant}
    initial="hidden"
    whileInView="visible"
    viewport={{ once, amount }}
    transition={delay ? { delay } : undefined}
  >
    {children}
  </motion.div>
);

export const RevealStagger = ({ children, className, amount = 0.15 }) => (
  <motion.div className={className} variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount }}>
    {children}
  </motion.div>
);

export const RevealItem = ({ children, className }) => (
  <motion.div className={className} variants={staggerItem}>
    {children}
  </motion.div>
);

export default Reveal;
