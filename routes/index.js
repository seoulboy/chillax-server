var express = require('express');
var router = express.Router();
const soundsRouter = require('./sounds');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/sounds', soundsRouter)

module.exports = router;
