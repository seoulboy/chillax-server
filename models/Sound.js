const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const defaultSoundDescription = 'No description';

const SoundSchema = new Schema({
  title: { type: String, required: true },
  description: {
    type: String,
    required: true,
    default: defaultSoundDescription,
  },
  type: { type: String, required: true },
  uploader: { type: mongoose.Types.ObjectId, required: true },
  uploadDate: { type: Date, required: true, default: Date.now().toString() },
  commentedBy: [{ type: mongoose.Types.ObjectId, default: {} }],
  likedBy: [{ type: mongoose.Types.ObjectId }],
  times_played: { type: Number, default: 0 },
  tags: [{ type: String }],
  url: [
    {
      soundUrl: { type: String, required: true },
      thumbnailUrl: { type: String },
    },
  ],
});

const Sound = mongoose.model('sound', SoundSchema);

module.exports = Sound;
