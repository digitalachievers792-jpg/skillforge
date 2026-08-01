import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiSend, FiX } from 'react-icons/fi';
import api, { extractError } from '../api/client';
import Button from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Field';
import { SUGGESTED_TAGS } from '../utils/constants';
import { cn } from '../utils/format';

const NewPost = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', body: '', tags: [] });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag) =>
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag].slice(0, 5),
    }));

  const validate = () => {
    const e = {};
    if (form.title.trim().length < 5) e.title = 'Title must be at least 5 characters';
    if (form.body.trim().length < 10) e.body = 'Content must be at least 10 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const d = await api.post('/forum/posts', { ...form, body: form.body.trim() });
      toast.success('Question published! 🎉');
      navigate(`/forum/post/${d.post._id}`);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <button onClick={() => navigate('/forum')} className="mb-5 flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-brand-600">
        <FiX className="h-4 w-4 rotate-45" /> Back to forum
      </button>

      <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-800">
        Ask the <span className="text-gradient">community</span>
      </h1>
      <p className="mt-2 text-slate-500">Clear questions get the best answers. Add tags so the right people see it.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-8" noValidate>
        <Input
          label="Title"
          placeholder="e.g. How do I approach my first React project?"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          error={errors.title}
          maxLength={150}
        />

        <Textarea
          label="Details"
          placeholder="Describe your question… what have you tried? What are you stuck on?"
          className="min-h-[220px]"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          error={errors.body}
          maxLength={20000}
        />

        <div>
          <p className="label-base">Tags (max 5)</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_TAGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleTag(t)}
                className={cn(
                  'chip border',
                  form.tags.includes(t)
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-slate-200 text-slate-500 hover:border-brand-300'
                )}
              >
                #{t}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          <FiSend className="h-4 w-4" /> Publish question
        </Button>
      </form>
    </div>
  );
};

export default NewPost;
