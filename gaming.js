
//localStorage.username = "kai";
var data_n =  localStorage.user_name;
var player_status = "alive";
var dom = $("<p>密告者: " + data_n + " さん</p>");
$(".my_name").append(dom);
var marker_player;

if ("geolocation" in navigator){
  function getPosition(){
    navigator.geolocation.getCurrentPosition(success, errorCallback);
    setTimeout(getPosition, 5000);
  }
  getPosition();
  function success(position) {
    var lati = position.coords.latitude;
    var long = position.coords.longitude;
    console.log(lati);
    console.log(long);
    var name = data_n;

    var player_position = new google.maps.LatLng(lati, long);
    if (marker_player == undefined){
     marker_player = new google.maps.Marker({
      name: name,
      position: player_position,
      map: map,
      title: 'player',
      icon: 'player_icon.png'
      });
    }
    marker_player.setPosition(player_position);
    if (player_status == "alive" && $('body').hasClass('zonbi')){
      marker_player.setMap(null);
      marker_player = new google.maps.Marker({
        name: name,
        position: player_position,
        map: map,
        title: 'player',
        icon: 'zonbi_icon.png'
      });
      player_status = "zonbi";
    }

    SendPosition(lati,long,name);
  }

  function errorCallback(error){
    console.log("位置情報の取得に失敗しました。");
  }
}
else{

}

function SendPosition
(lati, long, name){
  var data = {"user_name":name, "lng": lati, "lat":long ,"group_name": localStorage.group_name}

  console.log(data);



  $.ajax({
    // url: "/",
    url: "https://be-the-informer.herokuapp.com/updateUserInfo",
    type: "post",
    //dataType: "json",
    // data: pos,
    data: JSON.stringify(data),
    dataType: "text",
    success: function(res){
      console.log("sendPosData: Success");
      if (res.is_dead == false){
        markPos(res);
      }
      Display(res);
    },
    error: function(res){
      console.log("sendPosData: Error");
      console.log(res);
    }

  });

}

var zonbi = new Array();
var nowmap = new Array();
var map;
function initMap() {

  // 緯度・経度を変数に格納
  var mapLatLng = new google.maps.LatLng(36.110248, 140.100419);
  // マップオプションを変数に格納
  var mapOptions = {
      zoom : 18,
      center : mapLatLng,  // 中心は現在地の緯度・経度
      styles: [
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "hue": "#165c64"
            },
            {
                "saturation": 34
            },
            {
                "lightness": -69
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [
            {
                "hue": "#b7caaa"
            },
            {
                "saturation": -14
            },
            {
                "lightness": -18
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "all",
        "stylers": [
            {
                "hue": "#cbdac1"
            },
            {
                "saturation": -6
            },
            {
                "lightness": -9
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "hue": "#8d9b83"
            },
            {
                "saturation": -89
            },
            {
                "lightness": -12
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            {
                "hue": "#d4dad0"
            },
            {
                "saturation": -88
            },
            {
                "lightness": 54
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            {
                "hue": "#bdc5b6"
            },
            {
                "saturation": -89
            },
            {
                "lightness": -3
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
            {
                "hue": "#bdc5b6"
            },
            {
                "saturation": -89
            },
            {
                "lightness": -26
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "hue": "#c17118"
            },
            {
                "saturation": 61
            },
            {
                "lightness": -45
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "all",
        "stylers": [
            {
                "hue": "#8ba975"
            },
            {
                "saturation": -46
            },
            {
                "lightness": -28
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "geometry",
        "stylers": [
            {
                "hue": "#a43218"
            },
            {
                "saturation": 74
            },
            {
                "lightness": -51
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "administrative.province",
        "elementType": "all",
        "stylers": [
            {
                "hue": "#ffffff"
            },
            {
                "saturation": 0
            },
            {
                "lightness": 100
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "administrative.neighborhood",
        "elementType": "all",
        "stylers": [
            {
                "hue": "#ffffff"
            },
            {
                "saturation": 0
            },
            {
                "lightness": 100
            },
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative.locality",
        "elementType": "labels",
        "stylers": [
            {
                "hue": "#ffffff"
            },
            {
                "saturation": 0
            },
            {
                "lightness": 100
            },
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "elementType": "all",
        "stylers": [
            {
                "hue": "#ffffff"
            },
            {
                "saturation": 0
            },
            {
                "lightness": 100
            },
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "all",
        "stylers": [
            {
                "hue": "#3a3935"
            },
            {
                "saturation": 5
            },
            {
                "lightness": -57
            },
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.medical",
        "elementType": "geometry",
        "stylers": [
            {
                "hue": "#cba923"
            },
            {
                "saturation": 50
            },
            {
                "lightness": -46
            },
            {
                "visibility": "on"
            }
        ]
    }
]

  };
  // マップオブジェクト作成
  map = new google.maps.Map(
      document.getElementById("map"), // マップを表示する要素
      mapOptions         // マップオプション
  );

}

function markPos(pos_data){
    for(var arrCount = 0; arrCount < pos_data.zonbies.length; arrCount++){
        var pos = new google.maps.LatLng(pos_data.zonbies[arrCount].x, pos_data.zonbies[arrCount].y);
        //var name = pos_data.students[arrCount].name;
      //   var icon = new google.maps.MarkerImage('zonbi_icon.png',
      //    new google.maps.Size(45,51),
      //    new google.maps.Point(0,0),
      //    new google.maps.Point(19,51)
      //   );
         var marker = new google.maps.Marker({
             position: pos,
             map: map,
             title: 'zonbies',
             icon: 'zonbi_icon.png'
         });
         zonbi.push(marker);
         marker.setMap(map);


    }

    displaymap(nowmap,zonbi);

}

/*

$.ajax({
  url: "http://192.168.17.122:8887/test_use_json.json",
  //url: "https://be-the-informer.herokuapp.com/test_use_json.json",
  //type: "post",
  dataType: "json",
  success: function(res){
    //ffconsole.log("wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww");
    //Attack_List(res);
    //Zonbi_List(res);
    if(res.is_dead == false){
      markPos(res);
    }
    Display(res);
  },
  error: function(res){
    console.log("ERROR");
  }
});
*/
//ゲームの終了時間を受け取る
$.ajax({
  url: "http://192.168.17.122:8887/time.json",
  //url: "https://be-the-informer.herokuapp.com/test_use_json.json",
  //type: "post",
  dataType: "json",
  success: function(res){
    //timereceive(res.time_finish);
    var time_finish  = res.time_finish;
    $(function (){
    setInterval(function(){
      var now = new Date();
      var h = now.getHours();
      h = ("0" + h).slice(-2);
      var mi = now.getMinutes();
      mi = ("0" + mi).slice(-2);
      var s = now.getSeconds();
      s = ("0" + s).slice(-2);
      var time_now = h+":"+mi+":"+s;
      var time_remaining = timeMath.sub(time_finish,time_now);

      $(".time_remaining").text("残り時間: "+time_remaining);

      },1000);
    });

  },
  error: function(res){
    console.log("ERROR");
  }
});

//時間の計算をする関数
var timeMath = {
  // 減算
   sub : function() {
       var result, times, second, i,
           len = arguments.length;

       if (len === 0) return;

       for (i = 0; i < len; i++) {
           if (!arguments[i] || !arguments[i].match(/^[0-9]+:[0-9]{2}:[0-9]{2}$/)) continue;

           times = arguments[i].split(':');

           second = this.toSecond(times[0], times[1], times[2]);

           if (!second) continue;

           if (i === 0) {
               result = second;
           } else {
               result -= second;
           }
       }

       return this.toTimeFormat(result);
   },

   // 時間を秒に変換
    toSecond : function(hour, minute, second) {
        if ((!hour && hour !== 0) || (!minute && minute !== 0) || (!second && second !== 0) ||
            hour === null || minute === null || second === null ||
            typeof hour === 'boolean' ||
            typeof minute === 'boolean' ||
            typeof second === 'boolean' ||
            typeof Number(hour) === 'NaN' ||
            typeof Number(minute) === 'NaN' ||
            typeof Number(second) === 'NaN') return;

        return (Number(hour) * 60 * 60) + (Number(minute) * 60) + Number(second);
    },

    // 秒を時間（hh:mm:ss）のフォーマットに変換
    toTimeFormat : function(fullSecond) {
        var hour, minute, second;

        if ((!fullSecond && fullSecond !== 0) || !String(fullSecond).match(/^[\-0-9][0-9]*?$/)) return;

        var paddingZero = function(n) {
            return (n < 10)  ? '0' + n : n;
        };

        hour   = Math.floor(Math.abs(fullSecond) / 3600);
        minute = Math.floor(Math.abs(fullSecond) % 3600 / 60);
        second = Math.floor(Math.abs(fullSecond) % 60);

        minute = paddingZero(minute);
        second = paddingZero(second);

        return ((fullSecond < 0) ? '-' : '') + hour + ':' + minute + ':' + second;
    }
};

/*function timereceive(time_finish){
  $(function (){
    var now = new Date();
    var h = now.getHours();
    h = ("0" + h).slice(-2);
    var mi = now.getMinutes();
    mi = ("0" + mi).slice(-2);
    var s = now.getSeconds();
    s = ("0" + s).slice(-2);
    var time_now = h+":"+mi+":"+s;
    console.log(time_now);
    var time_remaining = timeMath.sub(time_finish,time_now);

    $(".time_remaining").text("残り時間: "+time_remaining);

  },1000);
}*/

//Audio Web API の実装
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

// Audio 用の buffer を読み込む
var getAudioBuffer = function(url, fn) {
  var req = new XMLHttpRequest();
  // array buffer を指定
  req.responseType = 'arraybuffer';

  req.onreadystatechange = function() {
    if (req.readyState === 4) {
      if (req.status === 0 || req.status === 200) {
        // array buffer を audio buffer に変換
        context.decodeAudioData(req.response, function(buffer) {
          // コールバックを実行
          fn(buffer);
        });
      }
    }
  };

  req.open('GET', url, true);
  req.send('');
};

// サウンドを再生
var playSound = function(buffer) {
  // source を作成
  var source = context.createBufferSource();
  // buffer をセット
  source.buffer = buffer;
  // context に connect
  source.connect(context.destination);
  // 再生
  source.start(0);
};


function Zonbi_List(res) {
  //console.log(res.attack);
  var data = res.zonbies;

  for (var i=0; i<data.length;i++){
    var x = data[i].x;
    var y = data[i].y;
    var dom = $("<li>ゾンビの位置"+ i +":(<span class='x' value="+ x +">" + x + ", </span><span class='y' value="+ y +">" + y + "</span>)</li>");

    //dom.find(".name").text(name).next(".comment").text();
    //dom.find(".number").text(number);
    $(".zonbi_pos").append(dom);
  }
}

function displaymap(now,res) {
  console.log(now, now.length);
  if (now.length != 0){
    console.log("check", now);
    $.each(now, function(i, marker) {
      console.log(marker);
      marker.setMap(null);
    });
  }
  $.each(res, function(i, marker) {
    console.log(marker);
    now.push(marker);
    var addmarker = new google.maps.Marker(marker);
  });

}

function Display(res) {
  var data_a = res.secret_numbers;
  var data_s = res.survivors
  if (res.is_dead == true && $('.zonbi').length == 0){
    var isVibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
    if(isVibrate){
      //alert("対応している!");
      window.navigator.vibrate(200);
    }

    getAudioBuffer('blackout6.mp3',function(buffer) {
      playSound(buffer);
    });

    //$.sound.play("blackout6.mp3");
    $("body").addClass("zonbi");
    $(".my_name").empty();
    var dom = $("<p>ゾンビ: " + data_n + " さん</p>");
    $(".my_name").append(dom);



  }
  //var data_z = res.zonbi;

  //var dom = $("<p>密告者: " + data_n + " さん</p>");
  //$(".my_name").append(dom);
  /*密告リストの表示*/
  if(data_a.length == 0){
    var dom = $("<option class='number'>近くに密告者はいません</option>");
    $(".attack_list").append(dom);
  }else{
    for (var i=0; i<data_a.length;i++){
      var number = data_a[i];
      var dom = $("<option class='number' value=" + number + ">" + number + "</option>");
      $(".attack_list").append(dom);
      var dom2 = $("<li>" + number + "</li>");
      $(".targets").append(dom2);
    }

  }

  if(data_s.length == 0){
    var dom = $("<li>生存者はいません</li>");
    $(".mikkoku_name").append(dom);
  }else{
    for (var i=0; i<data_s.length;i++){
      var survivor = data_s[i];
      var dom = $("<option class='target_user_name' value=" + survivor + ">" + survivor + "</option>");
      $(".mikkoku_name").append(dom);
    }

  }
  var dom3 = $("<p>密告成功数:" + res.number_of_inform + "</p>");
  $(".hitpoints").append(dom3);
  var dom4 = $("<p>ゾンビポイント:" + res.zonbi_points + "</p>");
  $(".zonbipoints").append(dom4);
}

$(".submit").on("click", doSubmit);
function doSubmit () {
  var data = $('form').serializeArray();
  console.log(parseJson(data));
  /*data = parseJson(data);
$.ajax({
  type:          'post',
  dataType:      'json',
  contentType:   'application/json',
  scriptCharset: 'utf-8',
  data:          JSON.stringify(data)
})*/
}
var parseJson = function(data) {
  var returnJson = {};
  for (idx = 0; idx < data.length; idx++) {
    returnJson[data[idx].name] = data[idx].value
  }
  //console.log(idx);
  returnJson["my_user_name"] = data_n;
  return returnJson;
}
