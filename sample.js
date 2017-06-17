var http = require("http");
var PORT = 8124;

var server = http.createServer();
server.on("request", onRequest);
server.listen(port, hostaddr, startServerAlert);

function onRequest(req, res) {
  res.writeHead(200, {"Content-Type": "text/plain"});
  res.end("Hello, World!\n");
}