export const cn = (...classes) => classes.filter(Boolean).join(' ');

export const formatMoney = (price, currency = '$') => {
  if (!price || price <= 0) return 'Free';
  return `${currency}${Number(price).toLocaleString()}`;
};

export const formatSalary = (min, max, currency = '$') => {
  const fmt = (v) => `${currency}${Number(v).toLocaleString()}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  if (max) return `Up to ${fmt(max)}`;
  return 'Salary on application';
};

export const formatDate = (iso, opts = {}) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', ...opts });
};

export const timeAgo = (iso) => {
  if (!iso) return '';
  const seconds = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};

export const formatDuration = (seconds) => {
  const s = Number(seconds) || 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
};

export const totalDuration = (curriculum = []) =>
  curriculum.reduce(
    (sum, section) => sum + (section.lessons || []).reduce((s, l) => s + (Number(l.duration) || 0), 0),
    0
  );

export const totalLessons = (curriculum = []) =>
  curriculum.reduce((sum, section) => sum + (section.lessons || []).length, 0);

export const pluralize = (count, singular, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

export const truncate = (text = '', len = 120) =>
  text.length > len ? `${text.slice(0, len).trimEnd()}…` : text;
