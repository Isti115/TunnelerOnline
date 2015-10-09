var express = require('express');
var router = express.Router();

/* GET game page. */
router.get('/', function(req, res, next) {
  res.render('game', { title: 'Game - Tunneler Online' });
});

module.exports = router;
