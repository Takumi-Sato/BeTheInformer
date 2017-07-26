var express = require("express");
// FileStream.  fs.readFile(filePath, encode, callback) でファイルの読み込み.
var port = process.env.PORT || 5000;

//var router = express.Router();

var app = express();

var game_state = "wait"; // ゲーム状態, wait/play/finish のいずれか
var game_start_time = "";
var game_play_time = 1;
var game_end_time = "";

var dt_default = new Date(0);
var start_dt = dt_default;
var end_dt = dt_default;

var nearDistance = 150; // 「近い」と判断する距離
var players = []; // 参加プレイヤーのリスト

var game_end_check_timer;

function isGameEnd() {
    if (game_state === "play" && !(end_dt === dt_default)) {
        console.log("nowPlaying. check isGameEnd()");
        var now = new Date();
        if (end_dt.getTime() - now.getTime() < 0) {
            console.log("Game Over");
            game_state = "finish";
            timerEnd_GameEndChecker();
        }
    }
}

function timerStart_GameEndChecker() {
    game_end_check_timer = setInterval(isGameEnd, 1000);
}

function timerEnd_GameEndChecker() {
    clearInterval(game_end_check_timer);
}

function Player(name, secret_number) {
    console.log("Player()");
    this.name = name;
    this.secret_number = secret_number;
    this.lat = 0;
    this.lng = 0;
    this.status = "alive";
    this.number_of_inform = 0;
    this.zombie_points = 0;
    this.ranking_points = 0;

    this.statusAndPoints = function() {
        var res = { "status": this.status, "number_of_inform": this.number_of_inform, "zombie_points": this.zombie_points };
        console.log("statusAndPoints return: " + JSON.stringify(res));
        return res;
    };
    this.updateRankingPoints = function() {
        this.ranking_points = this.number_of_inform * 1000 + this.zombie_points;
    }
}

// ユニークなsecret_numberを生成します.
function createUniqueSecretNumber() {
    console.log("createUniqueSecretNumber()");
    var n = Math.floor(Math.random() * 900) + 100;
    var flg = true;
    while (flg) {
        console.log("while loop in uniqueSecNum");
        flg = false;
        n = Math.floor(Math.random() * 900) + 100;
        for (var i = 0; i < players.length; ++i) {
            if (players[i].secret_number == n) {
                flg = true;
            }
        }
    }
    console.log("UNIQUE secret number is " + n);
    return n;
}

// name を this.name にもつプレイヤーを取得します.
function getThePlayer(name) {
    console.log("getThePlayer(name), name=" + name);
    console.log(JSON.stringify(players));
    for (var i = 0; i < players.length; ++i) {
        if (players[i].name == name) {
            return players[i];
        }
    }
    return null;
}

// nameをもつプレイヤーの近くにいるプレイヤーたちのsecret_numberを取得します.
function getNearSecretNumbers(player) {
    console.log("getNearSecretNumbers()");
    var secret_numbers = [];
    for (var i = 0; i < players.length; ++i) {
        if (players[i].name == player.name) {
            continue;
        }
        if (areNearPosition(player, players[i]) && players[i].status==="alive") {
            secret_numbers.push(players[i].secret_number);
        }
    }
    return secret_numbers;
}

function areNearPosition(basePlayer, player) {
    console.log("areNearPosition()");
    //var d = Math.sqrt(Math.pow(basePlayer.lat - player.lat, 2) + Math.pow(basePlayer.lng - player.lng, 2));
    var d = getDistance(basePlayer.lat, basePlayer.lng, player.lat, player.lng);
    console.log("distance: " + d + " [m]");
    return nearDistance > d;
}

// getDistance 用の変数.
var a = 6378137.0;
var b = 6356752.314245;
var e_pow2 = 0.00669437999019758;
var M_upper = a * (1 - e_pow2);

function getDistance(a_lat, a_lng, b_lat, b_lng) {
    var t = Math.PI / 180;
    a_lat = a_lat * t;
    a_lng = a_lng * t;
    b_lat = b_lat * t;
    b_lng = b_lng * t;
    var mu_lat = (a_lat + b_lat) / 2;
    var W = Math.sqrt(1 - e_pow2 * Math.pow(Math.sin(mu_lat), 2))
    var N = a / W;
    var M = M_upper / Math.pow(W, 3);
    var d_lng = a_lng - b_lng;
    var d_lat = a_lat - b_lat;

    return Math.sqrt(Math.pow(d_lat * M, 2) + Math.pow(d_lng * N * Math.cos(mu_lat), 2));
}

// 自分以外のゲーム参加者全員を返す.
// 関数名は survivors だが気にしない.
function getSurvivors(user_name) {
    console.log("getSurvivors()");
    var survivors = [];
    for (var i = 0; i < players.length; ++i) {
        if (players[i].name !== user_name) {
            survivors.push(players[i].name);
        }
    }
    return survivors;
}

function getZombies() {
    console.log("getZombies()");
    var zombies = [];
    for (var i = 0; i < players.length; ++i) {
        if (players[i].status === "dead") {
            console.log("getZombies(), Hit Zombie");
            zombies.push({ "lat": players[i].lat, "lng": players[i].lng });
        }
    }
    return zombies;
}

function getZombiePointsIncremental() {
    console.log("getZombiePointsIncremental()");
    var zombies = getZombies();
    return zombies.length;
}

function updatePlayerPosition(player, lat, lng) {
    console.log("updatePlayerPosition");
    player.lat = lat;
    player.lng = lng;
}





app.set("port", port);

app.get('/', function(req, res) {
    res.sendfile("BeTheInformer.html");
});

app.get('/regi_game2.html', function(req, res) {
    res.sendfile("regi_game2.html");
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

app.get('/ranking.html', function(req, res) {
    res.sendfile("ranking.html");
});

app.get('/wait_guest.html', function(req, res) {
    res.sendfile("wait_guest.html");
});

app.get('/player_icon.png', function(req, res) {
    res.sendfile("player_icon.png");
});

app.get('/zonbi_icon.png', function(req, res) {
    res.sendfile("zonbi_icon.png");
})

app.get('/icon/title_02.png', function(req, res) {
    res.sendfile("./icon/title_02.png");
})

app.get('/icon/top_background.png', function(req, res) {
    res.sendfile("./icon/top_background.png");
})

app.get('/icon/back_normal.png', function(req, res) {
    res.sendfile("./icon/back_normal.png");
})

app.get('/icon/back_zonbi.png', function(req, res) {
    res.sendfile("./icon/back_zonbi.png");
})

app.get('/icon/attribute_icon_informer.png', function(req, res) {
    res.sendfile("./icon/attribute_icon_informer.png");
})

app.get('/icon/attribute_icon_zonbi.png', function(req, res) {
    res.sendfile("./icon/attribute_icon_zonbi.png");
})

app.get('/style.css', function(req, res) {
    res.sendfile("style.css");
});

app.get('/top.css', function(req, res) {
    res.sendfile("top.css");
});

app.get('/regi.css', function(req, res) {
    res.sendfile("regi.css");
});

app.get('/join.css', function(req, res) {
    res.sendfile("join.css");
});

app.get('/wait.css', function(req, res) {
    res.sendfile("wait.css");
});

app.get('/noty/lib/noty.css', function(req, res) {
    res.sendfile("noty/lib/noty.css");
});

app.get('/noty/lib/noty.js', function(req, res) {
    res.sendfile("noty/lib/noty.js");
});

app.get('/icon/zonbi_character_turn.png', function(req, res) {
    res.sendfile("icon/zonbi_character_turn.png");
});

app.get('/icon/informer_character.png', function(req, res) {
    res.sendfile("icon/informer_character.png");
});


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
});
app.post("/regNewGroup", function(req, res) {
    onRequestPost(req, res);
});
app.post("/getGroupList", function(req, res) {
    onRequestPost(req, res);
});
app.post("/regUser", function(req, res) {
    onRequestPost(req, res);
});
app.post("/getMemberList", function(req, res) {
    onRequestPost(req, res);
});
app.post("/gameStart", function(req, res) {
    onRequestPost(req, res);
});
app.post("/inform", function(req, res) {
    onRequestPost(req, res);
});
app.post("/getGameState", function(req, res) {
    onRequestPost(req, res);
});
app.post("/deletePlayer", function(req, res) {
    onRequestPost(req, res);
});
app.post("/ranking", function(req, res) {
    onRequestPost(req, res);
});
app.post("/getEndTime", function(req, res) {
    onRequestPost(req, res);
});
app.post("/regHostPlayerAndStartGame", function(req, res) {
    onRequestPost(req, res);
});
app.post("/resetGame", function(req, res) {
    onRequestPost(req, res);
});

app.post("/checkResetGame", function(req, res) {
    onRequestPost(req, res);
});


//POSTメソッドのハンドラ
function onRequestPost(req, res) {
    if (req.method !== "POST") return;
    var data = "";
    //読み込み中
    req.on("readable", function() {
        var d = req.read();
        if (d != null) data += d;
    });
    //読み込み完了
    req.on("end", function() {
        processFunction(req, res, data);
        console.log(data);
    });
    //エラー
    req.on("error", function() {
        console.log("Error" + data);
    });
}

// URLでPOSTリクエストへのレスポンスを返すメソッドの振り分け
function processFunction(req, res, data) {
    switch (req.url) {
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
        case "/ranking":
            ranking(req, res, data);
            break;
        case "/getEndTime":
            getEndTime(req, res, data);
            break;
        case "/regHostPlayerAndStartGame":
            regHostPlayerAndStartGame(req, res, data);
            break;
        case "/resetGame":
            resetGame(req, res, data);
            break;
        case "/checkResetGame":
            checkResetGame(req, res, data);
            break;
        default:
            break;
    }
}

// ユーザー登録. ゲストユーザーバージョン
function regUser(req, res, data) {
    console.log("regUser(req, res, data)");
    var json = JSON.parse(data);
    console.log("regGuestPlayer input : " + JSON.stringify(json));
    var jsonRes = { "player_regi_success": true };

    // 同名プレイヤーがいたら、または待機状態でなければ、falseを返す
    if (game_state !== "wait" || getThePlayer(json.user_name) !== null) {
        console.log("regGuest FAILED.");
        jsonRes.player_regi_success = false;
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(jsonRes));
    } else {
        console.log("regGuest Success");
        var sec_num = createUniqueSecretNumber();
        var player = new Player(json.user_name, sec_num);
        console.log(player);
        console.log(JSON.stringify(player));
        players.push(player);
        console.log("after reg Guest players = " + JSON.stringify(players));

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(jsonRes));
    }
}

// メンバー一覧を返します.
function getMemberList(req, res, data) {
    console.log("getMemberList(req, res, data)");
    var jsonRes = { "members": [] };

    for (var i = 0; i < players.length; ++i) {
        jsonRes.members.push(players[i].name);
    }

    console.log("getMemberList return: " + JSON.stringify(jsonRes));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(jsonRes));
}

function regHostPlayerAndStartGame(req, res, data) {
    console.log("regHostPlayerAndStartGame(req, res, data)");

    var json = JSON.parse(data);
    console.log("regHost input : " + JSON.stringify(json));
    var jsonRes = { "player_regi_success": true };

    // 同名プレイヤーがいたら、またはゲームが待機状態でなければfalseを返す
    if (game_state !== "wait" || getThePlayer(json.user_name) !== null) {
        console.log("regHost FAILED.");
        jsonRes.player_regi_success = false;
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(jsonRes));
    } else {
        console.log("regHost Success");
        var sec_num = createUniqueSecretNumber();
        var player = new Player(json.user_name, sec_num);
        console.log(player);
        console.log(JSON.stringify(player));
        players.push(player);
        console.log("after reg Host  players = " + JSON.stringify(players));


        game_state = "play";

        var date = new Date();
        /*
                //game_start_time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                game_start_time = date.toTimeString()
                console.log("game_start_time was set : " + game_start_time);

                date.setMinutes(date.getMinutes() + game_play_time);
                //game_end_time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                game_end_time = date.toTimeString()
                console.log("game_end_time was set : " + game_end_time);
        */


        start_dt = new Date(date.getTime());
        end_dt = new Date(date.getTime());
        end_dt.setMinutes(end_dt.getMinutes() + game_play_time);
        console.log("start_dt : " + start_dt.toTimeString());
        console.log("end_dt : " + end_dt.toTimeString());

        timerStart_GameEndChecker();

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(jsonRes));
    }
}

/*
function gameStart(req, res, data) {
    console.log("gameStart(req, res, data)");
    game_state = "play";

    var date = Date.now();

    game_start_time = date.toTimeString();
    console.log("game_start_time was set : " + game_start_time);

    date.setMinutes(date.getMinutes() + game_interval_time);
    game_end_time = date.toTimeString();
    console.log("game_end_time was set : " + game_end_time);


    start_dt = Object.assign({}, date);
    end_dt = Object.assign({}, date);
    end_dt.setMinutes(end_dt.getMinutes() + game_play_time);
    console.log("end_dt : " + end_dt.toTimeString());

    res.writeHead(200);
}
*/

function getGameState(req, res, data) {
    console.log("getGameState(req, res, data)");
    var jsonRes = { "game_state": game_state };
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(jsonRes));
}

function getEndTime(req, res, data) {
    var dtTemp = new Date(end_dt.getTime());

    var end_time_json = end_dt.toJSON();
    var jsonRes = { "end_date": end_time_json };
    console.log(" get End Time return : " + JSON.stringify(jsonRes));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(jsonRes));
}

function updateUserInfo(req, res, data) {
    console.log("updateUserInfo(req, res, data)");
    var json = JSON.parse(data);
    var jsonRes = { "secret_numbers": [], "zombies": [], "survivors": [], "status": "", "number_of_inform": "", "zombie_points": "", "game_state": "" };

    console.log("updateUserInfo input : " + JSON.stringify(json));
    var player = getThePlayer(json.user_name);
    console.log("updateUserInfo: user_name=" + json.user_name + ",  players=" + JSON.stringify(players));
    console.log("the player is : " + player);
    var info = player.statusAndPoints();

    updatePlayerPosition(player, json.lat, json.lng);

    jsonRes.secret_numbers = getNearSecretNumbers(player);
    jsonRes.survivors = getSurvivors(json.user_name);
    jsonRes.zombies = getZombies();
    jsonRes.status = info.status;
    jsonRes.zombie_points = info.zombie_points;
    jsonRes.number_of_inform = info.number_of_inform;
    jsonRes.game_state = game_state;

    console.log("updateUserInfo return : " + JSON.stringify(jsonRes));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(jsonRes));
}

function inform(req, res, data) {
    var json = JSON.parse(data);
    var jsonRes = { "success": false };
    console.log("inform(req, res, data);    input:" + JSON.stringify(json));

    var my_user_name = json.my_user_name;
    var target_secret_number = json.mikkoku_id;
    var target_user_name = json.mikkoku_name;

    var player = getThePlayer(my_user_name);
    var target = getThePlayer(target_user_name);

    if (target.secret_number == target_secret_number) {
        // 密告成功
        jsonRes.success = true;
        // ポイント計算
        if (player.status === "alive") {
            //密告者が密告
            ++player.number_of_inform;
        } else {
            //ゾンビが密告
            player.zombie_points += getZombiePointsIncremental();
        }
        // 密告された側はゾンビ化
        target.status = "dead";
        target.number_of_inform = -1;

        player.updateRankingPoints();
        target.updateRankingPoints();
    } else {
        //密告失敗 -> 密告者はゾンビ化, ゾンビポイントもリセット.
        player.status = "dead";
        player.number_of_inform = -1;
        player.zombie_points = 0;
        player.updateRankingPoints();
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(jsonRes));
}

function ranking(req, res, data) {
    console.log("ranking(req, res, data)");
    var ranking = [];
    var jsonRes = { "ranking": [] };
    /*
        for(var i=0; i<players.length; ++i) {
            ranking.push({"name": players[i].name, "ranking_points":players[i].ranking_points});
        }
    */

    sortObjectArray(players, "ranking_points", "desc", function(data) {
        console.log("sort result : " + JSON.stringify(data));
        for (var i = 0; i < data.length; ++i) {
            ranking.push({ "name": data[i].name, "number_of_inform": data[i].number_of_inform, "zombie_points": data[i].zombie_points });
        }
        jsonRes.ranking = ranking;
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(jsonRes));
    });
}

function sortObjectArray(array, key, order, callback) {
    console.log("sortObjectArray, key=" + key);
    for (var i = 0; i < array.length; ++i) {
        console.log("array[" + i + "] = " + Object.toString(array[i]));
    }
    var whenAisLarger = -1;
    var whenAisSmaller = 1;

    if (order === "asc") {
        whenAisLarger = 1;
        whenAisSmaller = -1;
    }

    array = array.sort(function(a, b) {
        var x = a[key];
        var y = b[key];
        if (x > y) return whenAisLarger;
        if (x < y) return whenAisSmaller;
        return 0;
    });

    callback(array);
}


function resetGame(req, res, data) {
    game_state = "wait";
    players = [];
    console.log("check dt_default: " + JSON.stringify(dt_default));
    start_dt = dt_default;
    end_dt = dt_default;

    res.writeHead(200);
    res.end();
}


function checkResetGame(req, res, data) {
    var jsonRes = { "game_is_reset": false };
    console.log("checkResetGame(req), game_state=" + game_state);
    if (game_state === "wait") {
        jsonRes.game_is_reset = true;
    }

    console.log(JSON.stringify(jsonRes));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(jsonRes));
}

app.listen(app.get("port"), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});