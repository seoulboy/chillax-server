const express = require('express');
const router = express.Router({ mergeParams: true });
const mongoose = require('mongoose');
const { User, Sound } = require('../../models');
const uploadSound = require('../../services/uploadSound');
const uploadThumbnail = require('../../services/uploadThumbnail');

// TODO: get sound: ADD LOGIC DEPENDING ON TYPE WHEN using mongoose.find() because
// sounds can be either white noise (one sound) or soundscapes (multiple sounds)
const handleGetSound = async (req, res, next) => {
  const { user_id } = req.params;
  const {
    type,
    liked,
    recommendation,
    history,
    trending,
    recently_uploaded,
  } = req.query;

  console.log(`USER_ID: ${user_id}`);
  console.log(
    `TYPE: ${type}, LIKED: ${liked}, RECOMMENDATION: ${recommendation}, HISTORY: ${history}`
  );

  const result = {};
  if (user_id) {
    // data depending on user : liked sounds, listening history, recommendation
    if (mongoose.Types.ObjectId.isValid(user_id));
    const user = await User.findById(user_id);

    if (liked) {
      result.liked = await Promise.all(
        user.likedSounds.map(async sound => {
          return await Sound.findById(sound._id);
        })
      );
    } else {
      result.liked = null;
    }

    if (history) {
      result.history = await Promise.all(
        user.recentlyListened.map(async sound => {
          return await Sound.findById(sound._id);
        })
      );
    } else {
      result.history = null;
    }

    if (recommendation) {
      // recommendation logic needed: based on the users likes & sound tags.
      result.recommendation = 'no recommendation';
    } else {
      result.recommendation = null;
    }
  }

  if (trending) {
    const trendingSounds = await Sound.find({});
    // This can be either all sounds, white noises or soundscapes
    // based on how many have listened over last week.
  } else {
    result.trending = null;
  }
  if (recently_uploaded) {
    // based on upload date
  } else {
    result.recently_uploaded = null;
  }
  res.json({ ...result });
};

const handlePostSound = async (req, res, next) => {
  console.log('handlePostSound req files', req.files);
  console.log('handlePostSound req body', req.body);

  const { title, type, description } = req.body;
  const { sound, image } = req.files;
  const { user_id } = req.params;
  try {
    if (mongoose.Types.ObjectId.isValid(user_id)) {
      if (title && type && sound && image) {
        const url = [
          { soundUrl: sound[0].location, thumbnailUrl: image[0].location },
        ];
        console.log(url);
        const newSound = await new Sound({
          title,
          type,
          url,
          description,
          uploader: user_id,
        }).save();

        console.log(newSound);

        res.status(200).json(newSound);
      } else {
        throw Error('title or type or url not found');
      }
    } else {
      res.status(400).send({ error: 'invalid user id' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'server error: handlePostSound' });
  }
};

router.get('/', handleGetSound);

// REMEMBER: x-www-form-urlencoded body only gets passed through. NOT form-data.
// TODO: need to add two s3, one that uploads thumbnail photo if it exists, and
// another that uploads audio to s3.
// ALSO i havent been able to test this endpoint with postman: the url part on soundSchema.
router.post(
  '/:user_id',
  uploadSound.fields([{ name: 'sound' }, { name: 'image' }]),
  handlePostSound
);

module.exports = router;
