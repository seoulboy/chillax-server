const express = require('express');
const router = express.Router();
const soundsRouter = require('../sounds');

/* GET users listing. */
router.use('/:user_id/sounds', soundsRouter);

module.exports = router;
