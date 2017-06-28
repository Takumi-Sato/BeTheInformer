var express = require("express");
// FileStream.  fs.readFile(filePath, encode, callback) でファイルの読み込み.
var port = process.env.PORT || 5000;

//var router = express.Router();

var app = express();


var pg = require('pg');
pg.defaults.ssl = true;

app.set("port", port);

app.get('/', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err) throw err;
        console.log('Connected to postgres! Getting schemas...');

        var jsonSend = {"attack":[], "zonbi":[]};
        client
            .query('SELECT * FROM PlayerTest;')
            .on('row', function(row) {
                console.log(JSON.stringify(row));
                jsonSend.attack.push({ ID : row.id });
                jsonSend.zonbi.push({ x : row.x , y : row.y });
                console.log(JSON.stringify(jsonSend));
            });
    });

    res.sendfile("index.html");
});
app.listen(app.get("port"), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});

//module.export = router;
