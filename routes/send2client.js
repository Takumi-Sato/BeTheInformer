var express = require("express");
var router = express.Router();

router.post('/', function(req, res) {
  res.writeHeader({"Content-Type":"text/plain"});
  res.end('hello world');
});

module.export = router;