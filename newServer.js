var express = require("express");
// FileStream.  fs.readFile(filePath, encode, callback) でファイルの読み込み.
var port = process.env.PORT || 5000;

//var router = express.Router();

var app = express();

var game_state = ""; // ゲーム状態
var game_start_time = "";
var game_play_time = 30;
var game_end_time = "";
var nearDistance = 30; // 「近い」と判断する距離
var players = []; // 参加プレイヤーのリスト

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
        if (areNearPosition(player, players[i])) {
            secret_number.push(players[i].secret_number);
        }
    }
    return secret_numbers;
}

function areNearPosition(basePlayer, player) {
    console.log("areNearPosition()");
    var d = Math.sqrt(Math.pow(basePlayer.lat - player.lat, 2) + Math.pow(basePlayer.lng - player.lng, 2));
    return nearDistance > d;
}

function getSurvivors() {
    console.log("getSurvivors()");
    var survivors = [];
    for (var i = 0; i < players.length; ++i) {
        if (players[i].status === "alive") {
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
            zombies.push({ "lat": players[i].lat, "lng": players[i].lng });
        }
    }
    return zombies;
}

function getZombiePointsIncremental() {
    console.log("getZombiePointsIncremental()");
    var zombies = getZombies();
    return zombies.length() + 1;
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

app.get('/style.css', function(req, res) {
    res.sendfile("style.css");
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
        default:
            break;
    }
}



function regUser(req, res, data) {
    console.log("regUser(req, res, data)");
    var json = JSON.parse(data);
    var jsonRes = { "success": true };

    // 同名プレイヤーがいたらfalseを返す
    if (getThePlayer(json.user_name) === null) {
        jsonRes.success = false;
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(jsonRes));
    }
    var sec_num = createUniqueSecretNumber();
    players.push(new Player(json.user_name, sec_num));

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(jsonRes));
}

function getMemberList(req, res, data) {
    console.log("getMemberList(req, res, data)");
    var jsonRes = { "group_members": [] };

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

    // 同名プレイヤーがいたらfalseを返す
    if (getThePlayer(json.user_name) !== null) {
        console.log("regHost FAILED.");
        jsonRes.success = false;
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

        //game_start_time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        game_start_time = date.toTimeString()
        console.log("game_start_time was set : " + game_start_time);

        date.setMinutes(date.getMinutes() + game_play_time);
        //game_end_time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        game_end_time = date.toTimeString()
        console.log("game_end_time was set : " + game_end_time);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(jsonRes));
    }
}

function gameStart(req, res, data) {
    console.log("gameStart(req, res, data)");
    game_state = "play";

    var date = Date.now();

    game_start_time = date.toTimeString();
    console.log("game_start_time was set : " + game_start_time);

    date.setMinutes(date.getMinutes() + game_interval_time);
    game_end_time = date.toTimeString();
    console.log("game_end_time was set : " + game_end_time);
    res.writeHead(200);
}

function getGameState(req, res, data) {
    console.log("getGameState(req, res, data)");
    var jsonRes = { "game_state": game_state };
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(jsonRes));
}

function getEndTime(req, res, data) {
    var jsonRes = { "game_end_time": game_end_time };
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(jsonRes));
}

function updateUserInfo(req, res, data) {
    console.log("updateUserInfo(req, res, data)");
    var json = JSON.parse(data);
    var jsonRes = { "secret_numbers": [], "zombies": [], "survivors": [], "status": "", "number_of_inform": "", "zombie_points": "", "game_state": "" };

    console.log("updateUserInfo input : " + JSON.stringify(json));
    var player = getThePlayer(json.user_name);
    console.log("the player is : " + player );
    var info = player.statusAndPoints();

    updatePlayerPosition(player, json.lat, json.lng);

    jsonRes.secret_numbers = getNearSecretNumbers(player);
    jsonRes.survivors = getSurvivors();
    jsonRes.zombie_points = getZombies();
    jsonRes.status = info.status;
    jsonRes.zombie_points = info.zombie_points;
    jsonRes.number_of_inform = info.number_of_inform;
    jsonRes.game_state = game_state;

    console.log("updateUserInfo return : " + JSON.stringify(jsonRes));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(jsonRes));
}

function inform(req, res, data) {
    console.log("inform(req, res, data)");
    var json = JSON.parse(data);
    var jsonRes = { "success": false };

    var player = getThePlayer(json.my_user_name);
    var target = getThePlayer(json.target_user_name);

    if (target.secret_number == json.target_secret_number) {
        //密告成功
        target.status = "dead";
        target.number_of_inform = 0;

        if (player.status === "alive") {
            //密告者が密告
            ++player.number_of_inform;
        } else {
            //ゾンビが密告
            player.zombie_points += getZombiePointsIncremental();
        }
        player.updateRankingPoints();
        target.updateRankingPoints();
    } else {
        //密告失敗
        player.status = "dead";
        player.number_of_inform = 0;
        player.zombie_points = 0;
        player.updateRankingPoints();
    }
}

function ranking(req, res, data) {
    console.log("ranking(req, res, data)");
    var jsonRes = { "ranking": [] };

    sortObjectArray(players, "ranking_points", "desc", function(data) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(data));
    });
}

function sortObjectArray(array, key, order, callback) {
    console.log("sortObjectArray");
    var whenAisLarger = -1;
    var whenAisSmaller = 1;

    if (order === "asc") {
        whenAisLarger = 1;
        whenAisSmaller = -1;
    }

    data = data.sort(function(a, b) {
        var x = a[key];
        var y = b[key];
        if (x > y) return whenAisLarger;
        if (x < y) return whenAisSmaller;
        return 0;
    });

    callback(data);
}


app.listen(app.get("port"), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});