var express = require('express');
var router = express.Router();

/* GET lobby page. */
router.get('/', function(req, res, next) {
  res.render('lobby', { title: 'Lobby - Tunneler Online' });
});

module.exports = router;
