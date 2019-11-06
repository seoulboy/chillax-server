const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  content: { type: String, required: true },
  user_id: { type: mongoose.Types.ObjectId },
  date: { type: Date, required: true, default: Date.now.toString() },
});

const Comment = mongoose.model('comment', CommentSchema);

module.exports = Comment;
