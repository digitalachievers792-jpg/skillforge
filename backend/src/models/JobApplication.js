const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, maxlength: 30, default: '' },
    coverLetter: { type: String, trim: true, maxlength: 3000, default: '' },
    resumePath: { type: String, default: '' },
    resumeName: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'rejected', 'hired'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('JobApplication', applicationSchema);
