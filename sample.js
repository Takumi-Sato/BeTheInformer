var http = require("http");
var express = require("express");
// FileStream.  fs.readFile(filePath, encode, callback) でファイルの読み込み.
var fs = require("fs");
var port = process.env.PORT || 5000;

var app = express.createServer();
server.on("request", onRequest);
server.listen(port, startServerAlert);

function onRequest(req, res) {
    fs.readFile("index.html", "UTF-8", function(err, data) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(data);
        res.end();
    });
}

function startServerAlert() {
    console.log('Server running at http: ${port}/');
}
