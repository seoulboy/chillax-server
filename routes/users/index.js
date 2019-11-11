const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const soundsRouter = require('../sounds');
const { User } = require('../../models');

router.use('/:user_id/sounds', soundsRouter);

const handlePutListeningHistory = async (req, res, next) => {
  const { soundId: playedSoundId } = req.body;
  const { user_id } = req.params;

  try {
    if (
      mongoose.Types.ObjectId.isValid(user_id) &&
      mongoose.Types.ObjectId.isValid(playedSoundId)
    ) {
      const user = await User.findById(user_id);
      var updatedListeningHistory = user.recentlyListened.filter(
        soundId => soundId != playedSoundId
      );

      console.log('filtered listening history: ', updatedListeningHistory);
      updatedListeningHistory = [playedSoundId].concat(updatedListeningHistory);
      user.recentlyListened = updatedListeningHistory;
      console.log('updated recently listened: ', user.recentlyListened);

      user.save();

      res.status(200).json(user.recentlyListened);
    }
  } catch (error) {
    console.error(error);
  }
};

const handlePutLiked = async (req, res, next) => {
  const { soundId: likedSoundId } = req.body;
  const { user_id } = req.params;

  try {
    if (
      mongoose.Types.ObjectId.isValid(user_id) &&
      mongoose.Types.ObjectId.isValid(likedSoundId)
    ) {
      const user = await User.findById(user_id);
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

router.put('/:user_id/listening_history', handlePutListeningHistory);
router.put('/:user_id/liked', handlePutLiked);

module.exports = router;
