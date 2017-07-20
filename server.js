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

app.get('/player_icon.png', function(req, res) {
    res.sendfile("player_icon.png");
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
app.post("/getGameState", function(req, res) {
    onRequestPost(req, res);
})
app.post("/deletePlayer", function(req, res) {
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
            inform(req, res, data);
            break;
        case "/getGameState":
            getGameState(req, res, data);
            break;
        case "/deletePlayer":
            deletePlayer(req, res, data);
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
        var q = "INSERT INTO groups (name, number_of_members, game_state, game_interval_time) VALUES('" + json.group_name + "', " + json.number_of_members + ", 'wait', CAST('" + json.game_time + " minutes' AS INTERVAL));";
        var q_getGroupName = "SELECT groups.name FROM groups WHERE groups.name='" + json.group_name + "';";

        var sec_num = createUniqueSecretNumber();
        console.log("Start RegNewGroup");
        client
            .query(q)
            .on("error", function() {
                console.log("Registration of new group FAILED.");
                console.log("reg new group SQL : " + q);
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
                        jsonRes.group_name = row.name;
                    })
                    .on("end", function() {
                        console.log("get group");
                        console.log(jsonRes);
                        res.end(JSON.stringify(jsonRes));
                    });
                client.on('drain', function() {
                    console.log('caught!');
                    client.end(function() {
                        console.log('end');
                    });
                });
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
            .on("error", function() { console.log("Select group names FAILED.") })
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
    /*
        if (canRegNewPlayer(group_name)) {
            regNewPlayer(user_name, group_name, sec_num);
        } else {
            console.log("Add Player FAILED because of member limit.");
        }
        */
    regNewPlayer(user_name, group_name, sec_num);
}

function canRegNewPlayer(group_name) {
    var res = false;
    var group_members = 0;
    pg.connect(process.env.DATABASE_URL, function(err, client) {

        flg = false;
        sec_num = Math.floor(Math.random() * 900) + 100;
        client
            // このグループに属する人数と、そのグループの人数制限を比較
            .query("SELECT * FROM groups WHERE group_name='" + group_name + "');")
            .on("row", function(row) {
                group_members = row.number_of_members;
            })
            .on("end", function() {
                client
                    .query("SELECT COUNT(*) FROM players GROUP BY group_name WHERE group_name='" + group_name + "';")
                    .on("error", function() {
                        console.log("counting group members FAILED");
                    })
                    .on("row", function(row) {
                        console.log("row = " + row);
                        if (row > group_members) {
                            res = true;
                        }
                    })
                    .on("end", function() {
                        return res;
                    });
            });
    });
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

        var qRegUser = "INSERT INTO players (name, group_name, secret_number, lng, lat, status, number_of_inform, zombie_points) VALUES('" + user_name + "', '" + group_name + "', " + sec_num + ", 0, 0, 'alive', 0, 0);";

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
    console.log("getMemberListInput: " + data);
    var json = JSON.parse(data);
    pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err) throw err;
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
    var json = JSON.parse(data);
    var jsonRes = { "game_start": false };
    pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err) throw err;
        var q = "UPDATE groups SET game_state='play', game_start_time='" + getNow() + "' WHERE name='" + json.group_name + "';";

        client
            .query(q)
            .on("error", function() { console.log("gameStartSQL FAILED"); })
            .on("end", function() {
                console.log("Game Start!!!!");
                jsonRes.game_start = true;
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(jsonRes));
            });
    });
}

// 現在時刻をtimestamp形式で取得します.
function getNow() {
    var D = new Date();
    return D.getHours() + ":" + D.getMinutes() + ":" + D.getSeconds();
}

// ゲーム状態を取得します
// input: group_name
// return: state
function getGameState(req, res, data) {
    var jsonRes = { state: "default" };
    console.log("input : " + data);
    var json = JSON.parse(data);

    pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err) throw err;
        var q = "SELECT game_state FROM groups WHERE name='" + json.group_name + "';";
        client
            .query(q)
            .on("error", function() { console.log("Getting game state FAILED."); })
            .on("row", function(row) {
                console.log("get game state ROW : " + row.game_state);
                jsonRes.state = row.game_state;
            })
            .on("end", function() {
                console.log("getGameState end: " + JSON.stringify(jsonRes));
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(jsonRes));
            });
    });
}

// 登録されたプレイヤーを削除します
// input: user_name
function deletePlayer(req, res, data) {
    var json = JSON.parse(data);

    pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err) throw err;
        var q = "DELETE FROM players WHERE name='" + json.user_name + "';";
        client
            .query(q)
            .on("error", function() { console.log("Delete Player FAILED.") })
            .on("end", function() {
                console.log("delete player complete");
            });
    });
}


// ゲーム中のユーザー位置情報更新
// input: user_name, group_name, lat, lng
// return: secret_numbers, zombies, status, number_of_inform, zombie_points, survivors 
function updateUserInfo(req, res, data) {
    console.log("start updateUserInfo(req, res, data)");
    pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err) throw err;
        var json = JSON.parse(data);
        console.log("input: " + json.lat + ", " + json.user_name);
        var jsonRes = { secret_numbers: [], zombies: [], survivors: [], status: "", number_of_inform: "", zombie_points: "" };
        var q = "UPDATE players SET lat=" + json.lat + ", lng=" + json.lng + " WHERE name='" + json.user_name + "';";
        console.log("Start UpdatePlayerInfo QUERY");

        client
            .query(q)
            .on("error", function(err) {
                console.log("PostgreSQL: update player's position ERROR");
                console.log(err);
            })
            .on("end", function() {
                console.log("QUERY: UPDATE finish.");
                var qPlayerInfo = "SELECT status, number_of_inform, zombie_points FROM players WHERE name='" + json.user_name + "';";
                client
                    .query(qPlayerInfo)
                    .on("error", function(err) {
                        console.log("PostgreSQL: select status, points of player ERROR");
                        console.log(err);
                    })
                    .on("row", function(row) {
                        console.log("playerInfo row: " + JSON.stringify(row));
                        jsonRes.status = row.status;
                        jsonRes.zombie_points = row.zombie_points;
                        jsonRes.number_of_inform = row.number_of_inform;
                    })
                    .on("end", function() {
                        console.log("QUERY: get PlayerInfo finish.");
                        var nearCondition = "sqrt((lat-" + json.lat + ")^2+(lng-" + json.lng + ")^2) > 30";
                        var qSecretNumbers = "SELECT secret_number FROM players WHERE group_name='" + json.group_name + "' AND " + nearCondition + ";";
                        client
                            .query(qSecretNumbers)
                            .on("error", function(err) {
                                console.log("PostgreSQL: select near secret_numbers ERROR");
                                console.log(err);
                            })
                            .on("row", function(row) {
                                console.log("secret_numbers row: " + JSON.stringify(row));
                                jsonRes.secret_numbers.push(row.secret_number);
                            })
                            .on("end", function() {
                                console.log("QUERY: get SecretNumbers finish.");
                                var qsurvivors = "SELECT name FROM players WHERE status='alive' AND group_name='" + json.group_name + "';";
                                client
                                    .query(qsurvivors)
                                    .on("error", function(err) {
                                        console.log("PostgreSQL: select survivors ERROR");
                                        console.log(err);
                                    })
                                    .on("row", function(row) {
                                        console.log("survivors row: " + JSON.stringify(row));
                                        jsonRes.survivors.push(row.name);
                                    })
                                    .on("end", function() {
                                        console.log("QUERY: get survivors finish.");
                                        var qLatLng = "SELECT lat, lng FROM players WHERE status='dead';";
                                        client
                                            .query(qLatLng)
                                            .on("error", function(err) {
                                                console.log("PostgreSQL: select zombies position ERROR");
                                                console.log(err);
                                            })
                                            .on("row", function(row) {
                                                console.log("zombies row: " + JSON.stringify(row));
                                                jsonRes.zombies.push({ lat: row.lat, lng: row.lng });
                                            })
                                            .on("end", function() {
                                                console.log("QUERY: get LatLng finish.");
                                                console.log("UpdatePlayerInfo jsonRes: " + JSON.stringify(jsonRes));
                                                res.writeHead(200, { "Content-Type": "text/json" });
                                                res.end(JSON.stringify(jsonRes));
                                            });

                                        client.on('drain', function() {
                                            console.log('updatePlayerInfo drain caught!');
                                            client.end(function() {
                                                console.log('end');
                                            });
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
        var q = "SELECT * FROM players WHERE name='" + json.target_user_name + "' AND secret_number=" + json.target_secret_number + ";";

        client
            .query(q)
            .on("row", function(row) {
                jsonRes.is_correct = true;
            })
            .on("end", function() {
                if (jsonRes.is_correct) {
                    var qSuccess = "UPDATE players SET state='dead' WHERE name='" + json.target_user_name + "';";
                    client
                        .query(qSuccess)
                        .on("end", function() {
                            res.writeHead(200, { "Content-Type": "application/json" });
                            res.end(JSON.stringify(jsonRes));
                        });
                } else {
                    var qFail = "UPDATE players SET state='dead', zombie_points=0 WHERE name='" + json.my_user_name + "';";
                    client
                        .query(qFail)
                        .on("end", function() {
                            res.writeHead(200, { "Content-Type": "application/json" });
                            res.end(JSON.stringify(jsonRes));
                        });
                }
            });
    });
}

// 結果を取得
// return : ランキング
function ranking(req, res, data) {
    pg.connect(process.env.DATABASE_URL, function(err, client) {
        if (err) throw err;
        var jsonRes = { "ranking": [] };
        var q = "SELECT * FROM players ORDER BY number_of_inform, zombie_points;";

        client
            .on("error", function() { console.log("Ranking SQL FAILED"); })
            .on("row", function(row) {
                jsonRes.ranking.push(row.name);
            })
            .on("end", function() {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(jsonRes));
            })
    });
}

app.listen(app.get("port"), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});

//module.export = router;