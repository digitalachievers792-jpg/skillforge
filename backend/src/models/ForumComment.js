const mongoose = require('mongoose');

const forumCommentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumPost', required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    body: { type: String, required: true, trim: true, maxlength: 4000 },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId }],
    score: { type: Number, default: 0 },
    isAnswer: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ForumComment', forumCommentSchema);
