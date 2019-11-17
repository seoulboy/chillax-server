const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const findOrCreate = require('mongoose-findorcreate');

const UserSchema = new Schema({
  name: { type: String, required: true },
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  recentlyListened: [{ type: mongoose.Types.ObjectId }],
  likedSounds: [{ type: mongoose.Types.ObjectId }],
  thumbnail: { type: String, required: true },
});

UserSchema.plugin(findOrCreate);

const User = mongoose.model('user', UserSchema);

module.exports = User;
