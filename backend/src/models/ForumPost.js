const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Post title is required'], trim: true, maxlength: 150 },
    body: { type: String, required: [true, 'Post content is required'] },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tags: { type: [String], default: [], index: true },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId }],
    score: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

forumPostSchema.index({ tags: 1, createdAt: -1 });

module.exports = mongoose.model('ForumPost', forumPostSchema);
