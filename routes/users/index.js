const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const soundsRouter = require('../sounds');
const { User, Sound } = require('../../models');

router.use('/:user_id/sounds', soundsRouter);

const handlePutListeningHistory = async (req, res, next) => {
  const { soundId: playedSoundId } = req.body;
  const { _id } = req.user;

  try {
    if (
      mongoose.Types.ObjectId.isValid(_id) &&
      mongoose.Types.ObjectId.isValid(playedSoundId)
    ) {
      const sound = await Sound.findById(playedSoundId);
      sound.times_played++;
      sound.save();

      const user = await User.findById(_id);
      var updatedListeningHistory = user.recentlyListened.filter(
        soundId => soundId != playedSoundId
      );

      updatedListeningHistory = [playedSoundId].concat(updatedListeningHistory);
      user.recentlyListened = updatedListeningHistory;

      user.save();

      res.status(200).json(user.recentlyListened);
    }
  } catch (error) {
    console.error(error);
  }
};

const handlePutLikedSounds = async (req, res, next) => {
  const { soundId: likedSoundId } = req.body;
  const { _id } = req.user;

  try {
    if (
      mongoose.Types.ObjectId.isValid(_id) &&
      mongoose.Types.ObjectId.isValid(likedSoundId)
    ) {
      const likedSound = await Sound.findById(likedSoundId);
      likedSound.likedBy.push(_id);
      likedSound.save();
      
      const user = await User.findById(_id);
      user.likedSounds.unshift(likedSoundId);

      user.save();

      res.status(200).json(user.likedSounds);
    } else {
      res.status(500).send('failed validation for user id or sound id');
    }
  } catch (error) {
    console.error(error);
  }
};

const handleGetLikedSounds = async (req, res, next) => {
  const { _id } = req.user;
  // const { user_id: _id } = req.params;
  const { limit } = req.query;
  try {
    if (mongoose.Types.ObjectId.isValid(_id)) {
      const user = await User.findById(_id);

      var likedSounds = await Promise.all(
        user.likedSounds.slice(0, limit).map(async soundId => {
          return await Sound.findById(soundId);
        })
      );

      likedSounds = await Promise.all(
        likedSounds.map(async sound => {
          const user = await User.findById(sound.uploader);
          sound._doc.uploader = user;
          return sound;
        })
      )

      res.status(200).json({ likedSounds });
    }
  } catch (error) {
    console.error(error);
  }
};

const handleGetListeningHistory = async (req, res, next) => {
  const { _id } = req.user;
  // const { user_id: _id } = req.params;
  const { limit } = req.query;

  try {
    if (mongoose.Types.ObjectId.isValid(_id)) {
      const user = await User.findById(_id);

      var listeningHistory = await Promise.all(
        user.recentlyListened.slice(0, limit).map(async (soundId, index) => {
          return await Sound.findById(soundId);
        })
      );

      listeningHistory = await Promise.all(
        listeningHistory.map(async sound => {
          const user = await User.findById(sound.uploader);
          sound._doc.uploader = user;
          return sound;
        })
      )

      res.status(200).json({ listeningHistory });
    }
  } catch (error) {
    console.error(error);
  }
};

router.get('/:user_id/listening_history', handleGetListeningHistory);
router.get('/:user_id/liked_sounds', handleGetLikedSounds);

router.put('/:user_id/listening_history', handlePutListeningHistory);
router.put('/:user_id/liked_sounds', handlePutLikedSounds);

module.exports = router;
