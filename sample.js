http = require("http");
PORT = 8124;

http.createServer((request, response) => {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.end("Hello World!\n");
  }).listen(PORT);
