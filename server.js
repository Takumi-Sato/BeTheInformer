var express = require("express");
// FileStream.  fs.readFile(filePath, encode, callback) でファイルの読み込み.
var port = process.env.PORT || 5000;

//var router = express.Router();

var app = express();


var pg = require('pg');
pg.defaults.ssl = true;

app.set("port", port);

app.get('/', function(req, res) {
    res.sendfile("index.html");
});

app.post("/receiveJson", function(req, res) {
    onRequestPost(req, res);
});

app.post("/sendJson", function(req, res) {
    onRequestPost(req, res);
});

app.post("/regNewGroup", function(req, res) {
    onRequestPost(req, res);
});


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
        case "/regNewGroup":
            regNewGroup(req, res, data);
            break;
    }
}

function processReceiveJson(req, res, data) {
    pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err) throw err;
        var json = { "My_name": "myName", "attack": [], "zonbi": [] };
        client
            .query("SELECT * FROM PlayerTest;")
            .on("row", function(row) {
                //console.log(JSON.stringify(row));
                json.attack.push(row.id);
                json.zonbi.push({ x: row.x, y: row.y });
                //console.log(JSON.stringify(json));
            })
            .on("end", function() {
                console.log(JSON.stringify(json));
                res.end(JSON.stringify(json));
            });
    });
}

function processSendJson(req, res, data) {
    // data := stringify された json
    pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err) throw err;
        var json = JSON.parse(data);
        var informedId = json.mikkoku_id;
        var informedName = json.mikkoku_name;
        var jsonRes = { "res": [] };
        var q = "SELECT * FROM playertest WHERE id=" + informedId + " and name='" + informedName + "';";
        client
            .query(q)
            .on("row", function(row) {
                jsonRes.res.push(row);
            })
            .on("end", function() {
                res.writeHead(200, { "Content-Type": "application/json" });
                if (JSON.stringify(jsonRes) === '{"res":[]}') {
                    //#TODO: 密告失敗時の処理
                    console.log("Inform failed.");
                    console.log(JSON.stringify(jsonRes));
                    res.end(JSON.stringify(jsonRes));
                } else {
                    //#TODO: 密告成功時の処理
                    console.log("inform success.");
                    console.log(JSON.stringify(jsonRes));
                    res.end(JSON.stringify(jsonRes));
                }
            });
    });
}

// 新しいグループをDBに登録して, そのグループ名を返す
// res: 追加したグループのグループ名
function regNewGroup(req, res, data) {
    pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err) throw err;
        var json = JSON.parse(data);
        var jsonRes = { "group_name": "" };
        var q = "INSERT INTO groups (name, number_of_members, game_interval_time, game_state) VALUES(" + json.group_name + "," + json.number_of_members + ", " + json.game_time + ", 'wait');";
        var q_getGroupName = "SELECT name FROM groups WHERE name=" + json.group_name + ");";

        client
            .query(q)
            .on("end", function() {
                res.writeHead(200, { "Content-Type": "application/json" });
                client.query(q_getGroupName).on("row", function(row) {
                    jsonRes.group_name.replace(row.name);
                });
                console.log("get group");
                res.end(JSON.stringify(jsonRes));
            });
    });
}

// グループ一覧を返す
// res: グループ一覧
function getGroupList(req, res, data) {
    pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err) throw err;
        var q = "SELECT name FROM groups;";
        var jsonRes = { "groups": [] };

        client
            .query(q)
            .on("row", function(row) {
                jsonRes.groups.push(row.name);
            })
            .on("end", function() {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(jsonRes));
            })
    });
}

// ユーザー登録
// data: group_name, user_name
function regUser(req, res, data) {
    pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err) throw err;
        var json = JSON.parse(data);
        var jsonRes = { "groups": [] };

        var sec_num = Math.floor(Math.random() * 900) + 100;
        var flg = true;
        while (flg) {
            flg = false;
            sec_num = Math.floor(Math.random() * 900) + 100;
            client
                .query("SELECT secret_number FROM players WHERE secret_number=" + sec_num + ";")
                .on("row", function(row) {
                    flg = true;
                }).on("end", function() {});
        }

        var qRegUser = "INSERT INTO players (name, group_name, secret_number) VALUES(" + json.user_name + ", " + json.group_name + ", " + sec_num + ");";

        client
            .query(qRegUser)
            .on("row", function(row) {})
            .on("end", function() {});
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(jsonRes));
    });
}

// ユーザーが属するグループのメンバー一覧を取得
// input: ユーザーが属するグループ名
// return: メンバー一覧
function getMemberList(req, res, data) {
    pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err) throw err;
        var json = JSON.parse(data);
        var group_name = json.group_name;
        var q = "SELECT name FROM players WHERE group_name=" + group_name + ";";
        var jsonRes = { "group_members": [] };

        client
            .query(q)
            .on("row", function(row) {
                jsonRes.group_members.push(row.name);
            })
            .on("end", function() {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(jsonRes));
            })
    });
}

/// ゲーム開始
// input: グループ名
function gameStart(req, res, data) {
      pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err) throw err;
        var q = "UPDATE groups SET game_state='play' game_start_time='"+ getNow() +"';";

        client
            .query(q)
            .on("row", function(row) {
                jsonRes.groups.push(row.name);
            })
            .on("end", function() {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(jsonRes));
            })
    });
}

function getNow() {
  var D = new Date();
  return D.getYear() + "-" + D.getMonth() + "-" + D.getDay() + " " + D.getHour() + ":" +  D.getMinute() + ":" +  D.getSecond();
}

app.listen(app.get("port"), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});

//module.export = router;
