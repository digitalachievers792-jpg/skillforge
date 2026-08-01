import { motion } from 'framer-motion';

const EmptyState = ({ icon: Icon, title, description, action, compact = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8' : 'py-16'}`}
  >
    {Icon && (
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-teal-50 text-brand-500">
        <Icon className="h-8 w-8" />
      </div>
    )}
    <h3 className="text-lg font-bold text-slate-700">{title}</h3>
    {description && <p className="mt-1.5 max-w-md text-sm text-slate-500">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </motion.div>
);

export default EmptyState;
