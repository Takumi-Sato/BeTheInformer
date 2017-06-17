var http = require("http");
var hostaddr = "localhost";
var port = process.env.PORT || 5000;

var server = http.createServer();
server.on("request", onRequest);
server.listen(port, startServerAlert);

function onRequest(req, res) {
  res.writeHead(200, {"Content-Type": "text/plain"});
  res.end("Hello, World!\n");
}

function startServerAlert() {
  console.log('Server running at http: //${hostaddr}:${port}/');
}