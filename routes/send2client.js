var express = require("express");
var router = express.Router();

router.get('/', function(req, res) {
  res.writeHeader({"Content-Type":"text/plain"});
  res.end('hello world');
});

module.export = router;