const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Job title is required'], trim: true, maxlength: 120 },
    company: { type: String, required: [true, 'Company name is required'], trim: true, maxlength: 100 },
    companyLogo: { type: String, default: '' },
    locationCity: { type: String, trim: true, default: 'Remote' },
    locationCountry: { type: String, trim: true, default: 'Worldwide' },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
      default: 'full-time',
      index: true,
    },
    mode: { type: String, enum: ['remote', 'onsite', 'hybrid'], default: 'remote', index: true },
    salaryMin: { type: Number, default: 0 },
    salaryMax: { type: Number, default: 0 },
    currency: { type: String, default: '$' },
    tags: { type: [String], default: [], index: true },
    description: { type: String, required: true },
    requirements: { type: [String], default: [] },
    status: { type: String, enum: ['open', 'closed'], default: 'open', index: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applicantsCount: { type: Number, default: 0 },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

jobSchema.index({ title: 1, company: 1, status: 1 });

module.exports = mongoose.model('Job', jobSchema);
