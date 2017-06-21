var express = require("express");
// FileStream.  fs.readFile(filePath, encode, callback) でファイルの読み込み.
var port = process.env.PORT || 5000;

var app = express.createServer();
app.get('/', function(req, res) {
  res.sendfile("index.html");
});
app.listen(port);