import { useEffect, useState } from 'react';
import { FiSliders } from 'react-icons/fi';
import api from '../../api/client';
import { COURSE_LEVELS, COURSE_SORTS, LEVEL_LABELS } from '../../utils/constants';
import { cn } from '../../utils/format';

const priceOptions = [
  { value: '', label: 'Any price' },
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
];

const ratingOptions = [
  { value: '', label: 'Any rating' },
  { value: '4', label: '4★ & up' },
  { value: '3', label: '3★ & up' },
];

const CourseFilters = ({ filters, onChange }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api
      .get('/courses/categories')
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  const set = (key, value) => onChange({ ...filters, [key]: value, page: 1 });

  return (
    <div className="space-y-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      <div className="flex items-center gap-2 font-bold text-slate-800">
        <FiSliders className="h-4 w-4 text-brand-600" /> Filters
      </div>

      <div>
        <p className="label-base">Category</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => set('category', '')}
            className={cn('chip border', !filters.category ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500 hover:border-brand-300')}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.name}
              onClick={() => set('category', c.name)}
              className={cn(
                'chip border',
                filters.category === c.name
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-slate-200 text-slate-500 hover:border-brand-300'
              )}
            >
              {c.name} <span className="opacity-60">({c.count})</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="label-base">Level</p>
        <div className="flex flex-wrap gap-1.5">
          {['', ...COURSE_LEVELS].map((level) => (
            <button
              key={level || 'all'}
              onClick={() => set('level', level)}
              className={cn(
                'chip border',
                filters.level === level
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-slate-200 text-slate-500 hover:border-teal-300'
              )}
            >
              {level ? LEVEL_LABELS[level] : 'All levels'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="label-base">Price</p>
          <select className="input-base" value={filters.price} onChange={(e) => set('price', e.target.value)}>
            {priceOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <p className="label-base">Rating</p>
          <select className="input-base" value={filters.rating} onChange={(e) => set('rating', e.target.value)}>
            {ratingOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <p className="label-base">Sort by</p>
        <select className="input-base" value={filters.sort} onChange={(e) => onChange({ ...filters, sort: e.target.value })}>
          {COURSE_SORTS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <button
        onClick={() => onChange({ page: 1, category: '', level: '', price: '', rating: '', sort: 'popular' })}
        className="w-full rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-500 transition-colors hover:border-rose-300 hover:text-rose-500"
      >
        Clear all filters
      </button>
    </div>
  );
};

export default CourseFilters;
