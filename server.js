var express = require("express");
// FileStream.  fs.readFile(filePath, encode, callback) でファイルの読み込み.
var port = process.env.PORT || 5000;

var app = express();

app.set("port", port);
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendfile("index.html");
});
app.listen(app.get("port"), function () { 
  console.log("Node app is running at localhost:" + app.get('port'));
});