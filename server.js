var express = require("express");
// FileStream.  fs.readFile(filePath, encode, callback) でファイルの読み込み.
var port = process.env.PORT || 5000;

//var router = express.Router();

var app = express();


var pg = require('pg');
pg.defaults.ssl = true;

app.set("port", port);

app.get('/', function(req, res) {
  /*
    pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err) throw err;
        console.log('Connected to postgres! Getting schemas...');

        var jsonSend = { "attack": [], "zonbi": [] };
        client
            .query('SELECT * FROM PlayerTest;')
            .on('row', function(row) {
                console.log(JSON.stringify(row));
                jsonSend.attack.push({ ID: row.id });
                jsonSend.zonbi.push({ x: row.x, y: row.y });
                console.log(JSON.stringify(jsonSend));
                res.end(JSON.stringify(jsonSend));
            });
    });
  */
    res.sendfile("index.html");
});

app.post("/receiveJson", function (req, res) {
  onRequestPost(req, res);
})


//POSTメソッドのハンドラ
function onRequestPost(req, res) {
    if (req.method !== "POST") return;
    var data = "";
    //読み込み中
    req.on("readable", function() { // 三コメ: まだ readableStream に readabl なものがあれば
        var d = req.read();
        if (d != null) data += d; // 三コメ: data に連結する
    });
    //読み込み完了
    req.on("end", function() { // 三コメ: end というイベントがあるのは仕様
        processFunction(req, res, data);
        console.log(data);
    });
    //なんかエラー
    req.on("error", function() { // 三コメ: error というイベントがあるのも仕様
        console.log("Error" + data);
    });
}


function processFunction(req, res, data) {
    switch (req.url) {
        case "/sendJson":
            processSendJson(req, res, data);
            break;
        case "/receiveJson":
            processReceiveJson(req, res, data); // 三コメ: ここ書き換えました
            break;
    }
}

function processReceiveJson(req, res, data) {
  pg.connect(process.env.DATABASE_URL, function(err, client) {
    if(err) throw err;
    var json = {"My_name" : "myName", "attack":[], "zonbi":[]};
    client
      .query("SELECT * FROM PlayerTest;")
      .on("row", function(row) {
        //console.log(JSON.stringify(row));
        json.attack.push({ ID : row.id });
        json.zonbi.push({ x : row.x, y : row.y });
        //console.log(JSON.stringify(json));
      })
      .on("end", function() {
        console.log(JSON.stringify(json));
        res.end(JSON.stringify(json));
      });
  });
}


app.listen(app.get("port"), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});

//module.export = router;
