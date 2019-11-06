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

const uploadSound = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'project-jinjung',
    acl: 'public-read',
    key: async (req, file, cb) => {
      // todo: add sound;
      // directory:
      if (file.fieldname === 'sound') {
        cb(
          null,
          `sound/${randomStringGenerator()}.${file.mimetype.replace(
            'audio/',
            ''
          )}`
        );
      } else if (file.fieldname === 'image') {
        cb(
          null,
          `thumbnails/${randomStringGenerator()}.${file.mimetype.replace(
            'image/',
            ''
          )}`
        );
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }),
});

module.exports = uploadSound;
