var express = require("express");
// FileStream.  fs.readFile(filePath, encode, callback) でファイルの読み込み.
var port = process.env.PORT || 5000;

//var router = express.Router();

var app = express();


var pg = require('pg');
pg.defaults.ssl = true;

app.set("port", port);

app.get('/', function(req, res) {
    res.sendfile("BeTheInformer.html");
});

app.get('/regi_game.html', function(req, res) {
    res.sendfile("regi_game.html");
});

app.get('/join_group.html', function(req, res) {
    res.sendfile("join_group.html");
});

app.get('/wait_host.html', function(req, res) {
    res.sendfile("wait_host.html");
});

app.get('/playing.html', function(req, res) {
    res.sendfile("playing.html");
});

app.get("/BeTheInformer.html", function(req, res) {
    res.sendfile("BeTheInformer.html");
});

app.get('/gaming.js', function(req, res) {
    res.sendfile("gaming.js");
});

app.get('/wait_guest.html', function(req, res) {
    res.sendfile("wait_guest.html");
})

/*
app.post("/receiveJson", function(req, res) {
    onRequestPost(req, res);
});

app.post("/sendJson", function(req, res) {
    onRequestPost(req, res);
});
*/

app.post("/updateUserInfo", function(req, res) {
    onRequestPost(req, res);
})

app.post("/regNewGroup", function(req, res) {
    onRequestPost(req, res);
});

app.post("/getGroupList", function(req, res) {
    onRequestPost(req, res);
})

app.post("/regUser", function(req, res) {
    onRequestPost(req, res);
})

app.post("/getMemberList", function(req, res) {
    onRequestPost(req, res);
})

app.post("/gameStart", function(req, res) {
    onRequestPost(req, res);
})

app.post("/inform", function(req, res) {
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
        case "/regNewGroup":
            regNewGroup(req, res, data);
            break;
        case "/updateUserInfo":
            updateUserInfo(req, res, data);
            break;
        case "/getGroupList":
            getGroupList(req, res, data);
            break;
        case "/regUser":
            regUser(req, res, data);
            break;
        case "/getMemberList":
            getMemberList(req, res, data);
            break;
        case "/gameStart":
            gameStart(req, res, data);
            break;
        case "/inform":
            imform(req, res, data);
            break;
        default:
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
        var q = "INSERT INTO groups (name, number_of_members, game_state) VALUES('" + json.group_name + "', " + json.number_of_members + ", 'wait');";
        var q_getGroupName = "SELECT groups.name FROM groups WHERE groups.name='" + json.group_name + "';";

        var sec_num = createUniqueSecretNumber();

        client
            .query(q)
            .on("error", function() {
                console.log("Registration of new group FAILED.");
            })
            .on("end", function() {
                // まずユーザー登録
                regNewPlayer(json.user_name, json.group_name, sec_num);

                res.writeHead(200, { "Content-Type": "application/json" });
                client.query(q_getGroupName)
                    .on("error", function() {
                        console.log("Select new group name FAILED.");
                    })
                    .on("row", function(row) {
                        jsonRes.group_name.replace(row.name);
                    })
                    .on("end", function() {
                        console.log("get group");
                        console.log(jsonRes);
                        res.end(JSON.stringify(jsonRes));
                    })
            });
    });
}

// グループ一覧を返す
// res: グループ一覧
function getGroupList(req, res, data) {
    pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err) throw err;
        var q = "SELECT name FROM groups;";
        var jsonRes = { "group_names": [] };

        client
            .query(q)
            .on("error", function(){console.log("Select group names FAILED.")})
            .on("row", function(row) {
                jsonRes.group_names.push(row.name);
            })
            .on("end", function() {
                console.log(jsonRes);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(jsonRes));
            })
    });
}

// ユーザー登録
// data: group_name, user_name
function regUser(req, res, data) {
    var json = JSON.parse(data);
    var user_name = json.user_name;
    var group_name = json.group_name;
    var sec_num = createUniqueSecretNumber();

    regNewPlayer(user_name, group_name, sec_num);
}

// 他のユーザーと重複しないsecret_numberを生成します.
function createUniqueSecretNumber() {
    var sec_num = Math.floor(Math.random() * 900) + 100;
    pg.connect(process.env.DATABASE_URL, function(err, client) {
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
    });
    return sec_num;
}

function regNewPlayer(user_name, group_name, sec_num) {
    pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err) throw err;

        var qRegUser = "INSERT INTO players (name, group_name, secret_number) VALUES('" + user_name + "', '" + group_name + "', " + sec_num + ");";

        client
            .query(qRegUser)
            .on("err", function(err) { console.log(err); })
            .on("end", function() {});
    });
}

// ユーザーが属するグループのメンバー一覧を取得
// input: ユーザーが属するグループ名
// return: メンバー一覧
function getMemberList(req, res, data) {
    pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err) throw err;
        var json = JSON.parse(data);
        var q = "SELECT name FROM players WHERE group_name='" + json.group_name + "';";
        var jsonRes = { "group_members": [] };

        client
            .query(q)
            .on("row", function(row) {
                jsonRes.group_members.push(row.name);
            })
            .on("end", function() {
                console.log("getMemberList");
                console.log("input: " + JSON.stringify(json));
                console.log("return: " + JSON.stringify(jsonRes));
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
        var json = JSON.parse(data);
        var q = "UPDATE groups SET game_state='play' game_start_time='" + getNow() + "' WHERE name=" + json.group_name + ";";

        client
            .query(q)
            .on("end", function() {})
    });
}

// 現在時刻をtimestamp形式で取得します.
function getNow() {
    var D = new Date();
    return D.getYear() + "-" + D.getMonth() + "-" + D.getDay() + " " + D.getHour() + ":" + D.getMinute() + ":" + D.getSecond();
}

// ゲーム中のユーザー位置情報更新
// input: user_name, lat, lng
// return: secret_numbers, zombies, status, number_of_imform, zombie_points, suvivors 
function updateUserInfo(req, res, data) {
    console.log("start updateUserInfo(req, res, data)");
    pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err) throw err;
        var json = JSON.parse(data);
        console.log("input: " + json.lat + ", " + json.user_name);
        var jsonRes = { secret_numbers: [], zombies: [], suvivors: [], status: "", number_of_imforms: "", zombie_points: "" };
        var q = "UPDATE players SET lat='" + json.lat + "' lng='" + json.lng + "' WHERE name='" + json.user_name + "';";
        console.log("Start QUERY");

        client
            .query(q)
            .on("error", function(err) {
                console.log("QUERY: ERROR");
                console.log(err);
            })
            .on("end", function() {
                console.log("QUERY: UPDATE finish.");
                var qPlayerInfo = "SELECT status number_of_imforms, zombie_points FROM players WHERE name=" + json.user_name + ";";
                client
                    .query(qPlayerInfo)
                    .on("row", function(row) {
                        jsonRes.status.replace(row.status);
                        jsonRes.zombie_points.replace(row.zombie_points);
                        jsonRes.number_of_imforms.replace(row.number_of_imforms);
                    })
                    .on("end", function() {
                        console.log("QUERY: get PlayerInfo finish.");
                        var nearCondition = "sqrt((lat-" + json.lat + ")^2+(lng-" + json.lng + ")^2) > 30";
                        var qSecretNumbers = "SELECT secret_number FROM players WHERE " + nearCondition + ";";
                        client
                            .query(qSecretNumbers)
                            .on("row", function() {
                                jsonRes.secret_numbers.push(row.secret_number);
                            })
                            .on("end", function() {
                                console.log("QUERY: get SecretNumbers finish.");
                                var qSuvivors = "SELECT name FROM players WHERE state='alive';";
                                client
                                    .query(qSuvivors)
                                    .on("row", function() {
                                        jsonRes.suvivors.push(row.name);
                                    })
                                    .on("end", function() {
                                        console.log("QUERY: get Suvivors finish.");
                                        var qLatLng = "SELECT lat, lng FROM players WHERE state='dead';";
                                        client
                                            .query(qLatLng)
                                            .on("row", function() {
                                                jsonRes.zombies.push({ lat: row.lat, lng: row.lng });
                                            })
                                            .on("end", function() {
                                                console.log("QUERY: get LatLng finish.");
                                                res.writeHead(200, { "Content-Type": "text/json" });
                                                res.end(JSON.stringify(jsonRes));
                                            });
                                    });
                            });
                    });
            });
    });
}

// 密告
// input : my_user_name, target_user_name, target_secret_number
// return : Success or Fail
function inform(req, res, data) {
    pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err) throw err;
        var json = JSON.parse(data);
        var jsonRes = { "is_correct": false };
        var q = "SELECT * FROM players WHERE name=" + target_user_name + " AND secret_number=" + target_secret_number + ";";

        client
            .query(q)
            .on("row", function(row) {
                jsonRes.is_correct.replace(true);
            })
            .on("end", function() {
                if (jsonRes.is_correct) {
                    var qSuccess = "UPDATE players SET state='dead' WHERE name=" + target_user_name + ";";
                    client
                        .query(qSuccess)
                        .on("end", function() {
                            res.WriteHead(200, { "Content-Type": "application/json" });
                            res.end(JSON.stringify(jsonRes));
                        });
                } else {

                }

            });
    });
}

// 結果を取得
// return : ランキング
function ranking(req, res, data) {

}

app.listen(app.get("port"), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});

//module.export = router;
