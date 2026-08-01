const mongoose = require('mongoose');
const slugify = require('slugify');

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, default: '', maxlength: 600 },
  duration: { type: Number, default: 0 },
  videoUrl: { type: String, default: '' },
  isFree: { type: Boolean, default: false },
});

const SectionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  lessons: { type: [LessonSchema], default: [] },
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Course title is required'], trim: true, maxlength: 150 },
    slug: { type: String, unique: true, index: true },
    shortDescription: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, required: true },
    category: { type: String, required: true, trim: true, maxlength: 60, index: true },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'all-levels'],
      default: 'all-levels',
    },
    price: { type: Number, default: 0, min: 0 },
    thumbnail: { type: String, default: '' },
    tags: { type: [String], default: [], index: true },
    curriculum: { type: [SectionSchema], default: [] },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    featured: { type: Boolean, default: false },
    ratingSummary: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    enrolledCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

courseSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

courseSchema.index({ title: 1, status: 1 });

module.exports = mongoose.model('Course', courseSchema);
