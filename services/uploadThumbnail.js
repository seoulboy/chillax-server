const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { randomStringGenerator } = require('../constants');

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_REGION,
});

const s3 = new aws.S3();

const uploadThumbnail = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'project-jinjung',
    acl: 'public-read',
    key: async (req, file, cb) => {
      // todo: add thumbnail
      console.log('multer uploadThumbnail file', file);

      cb(
        null,
        `/thumbnails/${randomStringGenerator()}.${file.mimetype.replace(
          'image/',
          ''
        )}`
      );
    },
  }),
});

module.exports = uploadThumbnail;
