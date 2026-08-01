const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId }],
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },
    certificate: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' },
    enrolledAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
