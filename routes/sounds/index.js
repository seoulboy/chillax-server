const express = require('express');
const router = express.Router({ mergeParams: true });
const mongoose = require('mongoose');
const moment = require('moment');
const { User, Sound } = require('../../models');
const uploadSound = require('../../services/uploadSound');

const shuffle = array => {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

// TODO: get sound: ADD LOGIC DEPENDING ON TYPE WHEN using mongoose.find() because
// sounds can be either white noise (one sound) or soundscapes (multiple sounds) ()
const handleGetSound = async (req, res, next) => {
  const { user_id } = req.params;
  const {
    type,
    most_popular,
    recent_upload,
    most_listened,
    discover_sounds,
    load_item,
    current_index,
  } = req.query;

  const limit = '7';

  console.log(
    `USER_ID: ${user_id}, 
    TYPE: ${type}, 
    MOST_LISTENED: ${most_listened}, 
    DISCOVER_SOUNDS: ${discover_sounds},  
    RECENT_UPLOAD: ${recent_upload}, 
    MOST_POPULAR: ${most_popular},
    CURRENT_INDEX: ${current_index},
    `
  );

  const result = {};

  if (load_item && current_index) {
    const currentIndex = Number(current_index);

    if (load_item === 'most_popular') {
      var popularSounds = await Sound.find({});
      popularSounds.sort((a, b) => {
        return b.likedBy.length - a.likedBy.length;
      });
      popularSounds = popularSounds.slice(
        currentIndex,
        currentIndex + Number(limit)
      );

      popularSounds = await Promise.all(
        popularSounds.map(async sound => {
          const user = await User.findById(sound.uploader);
          sound._doc.uploader = user;
          return sound;
        })
      );

      result.most_popular = popularSounds;
    }

    if (load_item === 'recent_uploads') {
      var recentlyUploadedSounds = await Sound.find({});
      recentlyUploadedSounds.sort((a, b) => {
        return (
          Number(moment(b.uploadDate).format('x')) -
          Number(moment(a.uploadDate).format('x'))
        );
      });

      recentlyUploadedSounds = recentlyUploadedSounds.slice(
        currentIndex,
        currentIndex + Number(limit)
      );

      const recentlyUploadedSoundsNew = await Promise.all(
        recentlyUploadedSounds.map(async sound => {
          const user = await User.findById(sound.uploader);
          sound._doc.uploader = user;
          return sound;
        })
      );

      result.recent_upload = recentlyUploadedSoundsNew;
    }

    if (load_item === 'most_listened') {
      var mostListenedSounds = await Sound.find({});
      mostListenedSounds.sort((a, b) => {
        return Number(b.times_played) - Number(a.times_played);
      });

      mostListenedSounds = mostListenedSounds.slice(
        currentIndex,
        currentIndex + Number(limit)
      );

      mostListenedSounds = await Promise.all(
        mostListenedSounds.map(async sound => {
          const user = await User.findById(sound.uploader);
          sound._doc.uploader = user;
          return sound;
        })
      );

      result.most_listened = mostListenedSounds;
    }
  } else {
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

    if (most_listened === 'true') {
      var mostListenedSounds = await Sound.find({});
      mostListenedSounds.sort((a, b) => {
        return Number(b.times_played) - Number(a.times_played);
      });

      mostListenedSounds = mostListenedSounds.slice(0, limit);

      mostListenedSounds = await Promise.all(
        mostListenedSounds.map(async sound => {
          const user = await User.findById(sound.uploader);
          sound._doc.uploader = user;
          return sound;
        })
      );

      result.most_listened = mostListenedSounds;
    } else {
      result.most_listened = null;
    }

    if (discover_sounds === 'true') {
      var discoverSounds = await Sound.find({});
      discoverSounds = shuffle(discoverSounds);
      discoverSounds = await Promise.all(
        discoverSounds.map(async sound => {
          const user = await User.findById(sound.uploader);
          sound._doc.uploader = user;
          return sound;
        })
      );

      result.discover_sounds = discoverSounds;
    } else {
      result.discover_sounds = null;
    }
  }
  res.json({ ...result });
};

const handlePostSound = async (req, res, next) => {
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
        const newSound = await new Sound({
          title,
          type,
          url,
          description,
          uploader: user_id,
        }).save();

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
