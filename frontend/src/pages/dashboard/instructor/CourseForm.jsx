import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiSave, FiUpload, FiArrowLeft } from 'react-icons/fi';
import api, { extractError } from '../../../api/client';
import { PageLoader } from '../../../components/ui/Spinner';
import Button from '../../../components/ui/Button';
import { Input, Textarea, Select } from '../../../components/ui/Field';
import { COURSE_LEVELS, LEVEL_LABELS, COURSE_CATEGORIES, SUGGESTED_TAGS } from '../../../utils/constants';
import { cn } from '../../../utils/format';

const emptyLesson = { title: '', description: '', duration: 0, videoUrl: '', isFree: false };

const CourseForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', shortDescription: '', description: '', category: COURSE_CATEGORIES[0],
    level: 'all-levels', price: '', thumbnail: '', tags: [],
    curriculum: [{ title: 'Introduction', lessons: [{ ...emptyLesson }] }],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('draft');

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/instructor/courses/${id}`)
      .then((d) => {
        const c = d.course;
        setForm({
          title: c.title || '',
          shortDescription: c.shortDescription || '',
          description: c.description || '',
          category: c.category || COURSE_CATEGORIES[0],
          level: c.level || 'all-levels',
          price: c.price ?? '',
          thumbnail: c.thumbnail || '',
          tags: c.tags || [],
          curriculum: c.curriculum?.length
            ? c.curriculum
            : [{ title: 'Introduction', lessons: [{ ...emptyLesson }] }],
        });
        setStatus(c.status);
      })
      .catch((err) => {
        toast.error(extractError(err, 'Course not found.'));
        navigate('/dashboard/instructor');
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const setSection = (si, patch) =>
    set('curriculum', form.curriculum.map((s, i) => (i === si ? { ...s, ...patch } : s)));

  const setLesson = (si, li, patch) =>
    setSection(si, {
      lessons: form.curriculum[si].lessons.map((l, i) => (i === li ? { ...l, ...patch } : l)),
    });

  const toggleTag = (t) =>
    set('tags', form.tags.includes(t) ? form.tags.filter((x) => x !== t) : [...form.tags, t].slice(0, 10));

  const validate = () => {
    const e = {};
    if (form.title.trim().length < 5) e.title = 'Title must be at least 5 characters';
    if (form.shortDescription.trim().length < 10) e.shortDescription = 'Short description must be at least 10 characters';
    if (form.description.trim().length < 20) e.description = 'Description must be at least 20 characters';
    if (!form.category) e.category = 'Category is required';
    const emptyLessons = form.curriculum.some((s) => s.lessons.some((l) => !l.title.trim()));
    if (emptyLessons) e.curriculum = 'All lessons need a title';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (publish) => {
    if (!validate()) {
      toast.error('Please fix the highlighted fields.');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price) || 0,
      curriculum: form.curriculum.map((s) => ({
        title: s.title.trim(),
        lessons: s.lessons.map((l) => ({
          title: l.title.trim(),
          description: l.description.trim(),
          duration: Number(l.duration) || 0,
          videoUrl: l.videoUrl.trim(),
          isFree: Boolean(l.isFree),
        })),
      })),
    };
    try {
      if (isEdit) {
        await api.put(`/courses/${id}`, payload);
        if (publish) {
          const r = await api.put(`/courses/${id}/publish`);
          setStatus(r.course.status);
          toast.success(`Course ${r.course.status}.`);
        } else {
          toast.success('Course updated.');
        }
      } else {
        const d = await api.post('/courses', payload);
        toast.success('Course created as draft!');
        navigate(`/dashboard/instructor/courses/${d.course._id}/edit`, { replace: true });
      }
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this course permanently? Students and reviews will be removed too.')) return;
    try {
      await api.del(`/courses/${id}`);
      toast.success('Course deleted.');
      navigate('/dashboard/instructor');
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  if (loading) return <PageLoader label="Loading course…" />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate('/dashboard/instructor')}
        className="mb-5 flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-brand-600"
      >
        <FiArrowLeft className="h-4 w-4" /> Back to dashboard
      </button>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-800">
            {isEdit ? 'Edit' : 'Create'} <span className="text-gradient">course</span>
          </h1>
          <p className="mt-1.5 text-slate-500">Craft a curriculum your students will love.</p>
        </div>
        {isEdit && (
          <span className={cn('chip capitalize', status === 'published' ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600')}>
            {status === 'published' ? '● Published' : '● Draft'}
          </span>
        )}
      </div>

      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">
          <h2 className="mb-4 text-lg font-extrabold text-slate-800">Basics</h2>
          <div className="grid gap-5">
            <Input
              label="Course title *"
              placeholder="e.g. Build REST APIs with Node.js"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              error={errors.title}
              maxLength={150}
            />
            <Input
              label="Short description *"
              placeholder="One line that sells the course (shown in cards)"
              value={form.shortDescription}
              onChange={(e) => set('shortDescription', e.target.value)}
              error={errors.shortDescription}
              maxLength={180}
            />
            <Textarea
              label="Full description *"
              placeholder="What will students learn? Use simple HTML like <b> or <ul> for formatting."
              className="min-h-[160px]"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              error={errors.description}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Select
                label="Category *"
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                error={errors.category}
              >
                {COURSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
              <Select
                label="Level"
                value={form.level}
                onChange={(e) => set('level', e.target.value)}
              >
                {COURSE_LEVELS.map((l) => (
                  <option key={l} value={l}>{LEVEL_LABELS[l]}</option>
                ))}
              </Select>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Price (PKR, 0 = free)"
                type="number"
                min="0"
                placeholder="e.g. 1500"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
              />
              <Input
                label="Thumbnail URL"
                placeholder="https://… (optional)"
                value={form.thumbnail}
                onChange={(e) => set('thumbnail', e.target.value)}
              />
            </div>
            {form.thumbnail && (
              <div className="h-40 w-full overflow-hidden rounded-2xl">
                <img src={form.thumbnail} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-800">Curriculum</h2>
            <Button variant="ghost" size="sm" onClick={() => set('curriculum', [...form.curriculum, { title: 'New section', lessons: [{ ...emptyLesson }] }])}>
              <FiPlus className="h-4 w-4" /> Add section
            </Button>
          </div>
          <p className="mb-4 text-xs text-slate-400">Up to 30 sections, 60 lessons each. Add your own <b>https://</b> video links or use the sample videos.</p>
          {errors.curriculum && <p className="mb-3 text-xs font-semibold text-rose-500">{errors.curriculum}</p>}

          <div className="space-y-5">
            {form.curriculum.map((section, si) => (
              <div key={si} className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <span className="label-base">Section {si + 1}</span>
                    <input
                      value={section.title}
                      onChange={(e) => setSection(si, { title: e.target.value })}
                      className="input-base mt-1"
                      placeholder="Section title"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSection(si, { lessons: [...section.lessons, { ...emptyLesson }] })}
                      className="flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-bold text-brand-600 shadow-sm transition-all hover:bg-brand-50"
                    >
                      <FiPlus className="h-3.5 w-3.5" /> Lesson
                    </button>
                    <button
                      onClick={() => {
                        if (form.curriculum.length === 1) return toast.error('Need at least one section.');
                        set('curriculum', form.curriculum.filter((_, i) => i !== si));
                      }}
                      className="rounded-lg bg-white p-2 text-slate-400 shadow-sm transition-colors hover:text-rose-500"
                      aria-label="Remove section"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {section.lessons.map((lesson, li) => (
                    <div key={li} className="rounded-xl border border-slate-100 bg-white p-4">
                      <div className="grid gap-3 sm:grid-cols-[1fr_90px_auto]">
                        <input
                          value={lesson.title}
                          onChange={(e) => setLesson(si, li, { title: e.target.value })}
                          className="input-base"
                          placeholder={`Lesson ${li + 1} title`}
                        />
                        <input
                          type="number"
                          min="0"
                          value={lesson.duration}
                          onChange={(e) => setLesson(si, li, { duration: e.target.value })}
                          className="input-base"
                          placeholder="min"
                          title="Duration in minutes"
                        />
                        <button
                          onClick={() => setLesson(si, li, { isFree: !lesson.isFree })}
                          className={cn(
                            'rounded-lg px-3 py-2 text-xs font-bold transition-all',
                            lesson.isFree ? 'bg-teal-50 text-teal-600 ring-1 ring-teal-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                          )}
                          title="Preview lesson (free without enrollment)"
                        >
                          Preview
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <input
                          value={lesson.videoUrl}
                          onChange={(e) => setLesson(si, li, { videoUrl: e.target.value })}
                          className="input-base flex-1"
                          placeholder="Video URL (https://…)"
                        />
                        <button
                          onClick={() => {
                            if (section.lessons.length === 1) return toast.error('Need at least one lesson.');
                            setSection(si, { lessons: section.lessons.filter((_, i) => i !== li) });
                          }}
                          className="rounded-lg bg-slate-50 p-2.5 text-slate-400 transition-colors hover:text-rose-500"
                          aria-label="Remove lesson"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">
          <h2 className="mb-4 text-lg font-extrabold text-slate-800">Tags</h2>
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
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {isEdit && (
            <Button variant="danger" onClick={handleDelete} className="sm:mr-auto">
              <FiTrash2 className="h-4 w-4" /> Delete course
            </Button>
          )}
          <Button variant="secondary" loading={saving} onClick={() => handleSave(false)}>
            <FiSave className="h-4 w-4" /> Save draft
          </Button>
          <Button loading={saving} onClick={() => handleSave(true)}>
            <FiUpload className="h-4 w-4" /> {isEdit ? (status === 'published' ? 'Unpublish' : 'Publish') : 'Save & publish'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseForm;
