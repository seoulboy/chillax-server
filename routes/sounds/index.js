const express = require('express');
const router = express.Router({ mergeParams: true });
const mongoose = require('mongoose');
const moment = require('moment');
const { User, Sound } = require('../../models');
const uploadSound = require('../../services/uploadSound');
const uploadThumbnail = require('../../services/uploadThumbnail');

// TODO: get sound: ADD LOGIC DEPENDING ON TYPE WHEN using mongoose.find() because
// sounds can be either white noise (one sound) or soundscapes (multiple sounds) ()
const handleGetSound = async (req, res, next) => {
  const { user_id } = req.params;
  const {
    type,
    liked,
    recommendation,
    history,
    most_popular,
    recent_upload,
  } = req.query;

  const limit = '7';

  console.log(
    `USER_ID: ${user_id}, TYPE: ${type}, LIKED: ${liked}, RECOMMENDATION: ${recommendation}, HISTORY: ${history}, RECENT_UPLOAD: ${recent_upload}, MOST_POPULAR: ${most_popular}`
  );

  const result = {};
  if (user_id) {
    // data depending on user : liked sounds, listening history, recommendation
    if (mongoose.Types.ObjectId.isValid(user_id));
    const user = await User.findById(user_id);

    if (liked === true) {
      result.liked = await Promise.all(
        user.likedSounds.map(async sound => {
          return await Sound.findById(sound._id);
        })
      );
    } else {
      result.liked = null;
    }

    if (history === true) {
      result.history = await Promise.all(
        user.recentlyListened.map(async sound => {
          return await Sound.findById(sound._id);
        })
      );
    } else {
      result.history = null;
    }

    if (recommendation === 'true') {
      // recommendation logic needed: based on the users likes & sound tags.
      result.recommendation = 'no recommendation';
    } else {
      result.recommendation = null;
    }
  }

  // most_popular logic needed: based on number of likes..
  // NEED TO KNOW IF SOUND SCAPE OR WHITE NOISE OR BOTH.
  if (most_popular === 'true') {
    var popularSounds = await Sound.find({});
    // TODO: NEED TO SORT AND LIMIT THE NUMBERS
    popularSounds.sort((a, b) => {
      return b.likedBy.length - a.likedBy.length;
    });
    popularSounds = popularSounds.slice(0, limit);

    popularSounds = await Promise.all(
      popularSounds.map(async sound => {
        const user = await User.findById(sound.uploader);
        sound._doc.uploader = user;
        return sound;
      })
    );

    result.most_popular = popularSounds;
  } else {
    result.most_popular = null;
  }

  if (recent_upload === 'true') {
    var recentlyUploadedSounds = await Sound.find({});
    recentlyUploadedSounds.sort((a, b) => {
      return (
        Number(moment(b.uploadDate).format('x')) -
        Number(moment(a.uploadDate).format('x'))
      );
    });

    recentlyUploadedSounds = recentlyUploadedSounds.slice(0, limit);

    const recentlyUploadedSoundsNew = await Promise.all(
      recentlyUploadedSounds.map(async sound => {
        const user = await User.findById(sound.uploader);
        sound._doc.uploader = user;
        return sound;
      })
    );
    result.recent_upload = recentlyUploadedSoundsNew;
  } else {
    result.recent_upload = null;
  }
  res.json({ ...result });
};

const handlePostSound = async (req, res, next) => {
  console.log('handlePostSound req files', req.files);
  console.log('handlePostSound req body', req.body);

  const { title, type, description, defaultImage } = req.body;
  const { sound, image } = req.files;
  const { user_id } = req.params;
  try {
    if (mongoose.Types.ObjectId.isValid(user_id)) {
      if (title && type && sound && image) {
        const url = [
          { soundUrl: sound[0].location, thumbnailUrl: image[0].location },
        ];
        const newSound = await new Sound({
          title,
          type,
          url,
          description,
          uploader: user_id,
        }).save();

        res.status(200).json(newSound);
      } else if ((title, type, sound, defaultImage)) {
        const url = [
          { soundUrl: sound[0].location, thumbnailUrl: defaultImage },
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
        throw Error('validation failed: check inputs');
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
