
var express = require('express');
var router = express.Router();
 
/* add page. */
router.get('/', function(request, response, next) {
    response.writeHeader(200, {"Content-Type": "text/html"});
    response.end("POSTリクエスト");
});

module.exports = router;
 