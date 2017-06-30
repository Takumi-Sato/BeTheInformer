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

        res.contentType("application/json");

        var jsonSend = {"attack":[], "zonbi":[]};
        client
            .query('SELECT * FROM PlayerTest;')
            .on('row', function(row) {
                console.log(JSON.stringify(row));
                jsonSend.attack.push({ ID : row.id });
                jsonSend.zonbi.push({ x : row.x , y : row.y });
                console.log(JSON.stringify(jsonSend));
            })
            .on('end', function() {
                res.send(JSON.stringify(jsonSend));
            });
    });

    //res.sendfile("index.html");
});
app.listen(app.post("port"), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});


app.on("request", onRequestPost);

//POSTメソッドのハンドラ
function onRequestPost(req, res) {
    if (req.method !== "POST") return;
    var data = "";
    //読み込み中
    req.on("readable", function() {  // 三コメ: まだ readableStream に readabl なものがあれば
        var d = req.read();
        if (d != null) data += d;  // 三コメ: data に連結する
    });
    //読み込み完了
    req.on("end", function() {  // 三コメ: end というイベントがあるのは仕様
        processFunction(req, res, data);
        console.log(data);
    });
    //なんかエラー
    req.on("error", function() {  // 三コメ: error というイベントがあるのも仕様
        console.log("Error" + data);
    });
}



//module.export = router;
