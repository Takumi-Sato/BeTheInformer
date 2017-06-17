var http = require("http");
var port = process.env.PORT || 5000;

var server = http.createServer();
server.on("request", onRequest);
server.listen(port, startServerAlert);

function onRequest(req, res) {
  res.writeHead(200, {"Content-Type": "text/plain"});
  res.write("Hello, World!\n");
  res.end();
}

function startServerAlert() {
  console.log('Server running at http: ${port}/');
}