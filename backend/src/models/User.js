const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 80 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student', index: true },
    headline: { type: String, trim: true, maxlength: 120, default: '' },
    bio: { type: String, trim: true, maxlength: 1000, default: '' },
    avatar: { type: String, default: '' },
    location: { type: String, trim: true, maxlength: 100, default: '' },
    skills: { type: [String], default: [] },
    socials: {
      website: { type: String, default: '' },
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
    },
    resume: {
      path: { type: String, default: '' },
      name: { type: String, default: '' },
      uploadedAt: { type: Date },
    },
    emailVerified: { type: Boolean, default: false },
    verifyToken: { type: String, select: false },
    verifyTokenExpires: { type: Date },
    resetToken: { type: String, select: false },
    resetTokenExpires: { type: Date },
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verifyToken;
  delete obj.resetToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
