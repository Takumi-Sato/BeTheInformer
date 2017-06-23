var express = require("express");
var router = express.Router();

app.post('/', function(req, res) {
  res.send('hello world');
});

module.export = router;