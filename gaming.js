
//localStorage.username = "kai";
var data_n =  localStorage.user_name;
var dom = $("<p>密告者: " + data_n + " さん</p>");
$(".my_name").append(dom);


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
    SendPosition(lati,long,name);
  }

  function errorCallback(error){
    console.log("位置情報の取得に失敗しました。");
  }


}else{

}
function SendPosition(lati, long, name){
  var data = {"user_name":name, "lng": lati, "lat":long }

  console.log(data);

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
      center : mapLatLng  // 中心は現在地の緯度・経度
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



$.ajax({
  //url: "http://192.168.17.122:8887/test_use_json.json"
  url: "https://be-the-informer.herokuapp.com/test_use_json.json",
  //type: "post",
  dataType: "json",
  success: function(res){
    //ffconsole.log("wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww");
    //Attack_List(res);
    //Zonbi_List(res);
    markPos(res);
    Display(res);
  },
  error: function(res){
    console.log("ERROR");
  }
});



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
  $(".hitpoints").append(dom4);
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
