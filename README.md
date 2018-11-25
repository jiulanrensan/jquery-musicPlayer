# jquery-musicPlayer
用jquery实现一个简单的音乐播放器
## 实现功能：
### 点击下方歌手和歌曲的方框，弹出详情页
### 控制音量
* 绑定mousemove和mousedown事件，通过鼠标点击和拖动实现控制音量，并保存在localStorage中供下次打开页面调用

### 控制播放进度条
* 播放时进度条自动移动
```
//其实就是就是将进度条当成一个长方形，长度随时间变化，再绑定一个定时器定时赋值
var playedBar = function(){
  //音频当前时间除以总长度,都以秒为单位
  var length = myAudio.currentTime/myAudio.duration*100;
  //给这个长方形的宽赋值
  $(".playedBar").width(length+'%');
  //显示实时秒数
  $(".currentTime").html(turnDuration(myAudio.currentTime));
  if (myAudio.currentTime == myAudio.duration) {
    $(".playedBar").width(0);
  }
}
setInterval(playedBar,500);
```
* 点击拖动进度条控制播放进度
```
$(".progress").bind("mousedown",function(event){
  var x = event.clientX;
  var progLeft = $(this).offset().left;
  /*
  progLeft为进度条距页面左侧的距离,
  x为进度条中鼠标位置距页面左侧距离,
  相减就是音频播放长度
  */
  var playedLength = (x - progLeft) / $(this).width();

  $(this).bind("mousemove",function(event){
    x = event.clientX;
    playedLength = (x - progLeft)/$(this).width();
    $(".playedBar").width(playedLength*100+'%');
  });

  $(this).bind("mouseup",function(){
    myAudio.currentTime = myAudio.duration*playedLength;
    $(".progress").unbind("mousemove").unbind("mouseup");
  })
});
```
### 多种播放模式
* 随机播放
* 顺序播放（播放到列表最后一首停止）
* 循环播放
* 单曲播放
* 点击图标切换播放模式

### 歌词随进度滚动
```
//定时器绑定函数
var showLyric = function(){
		var liH = $(".lyrics li").eq(0).outerHeight();
		//console.log(liH);
		for (var i = 0; i < lyricsArr2.length; i++) {
			//歌词列表当前行和下一行
			var current = $(".lyrics li").eq(i).attr("lyric-time");
			var next = $(".lyrics li").eq(i+1).attr("lyric-time");
      //判断歌曲当前播放时间和歌词列表时间
			if (myAudio.currentTime > current && myAudio.currentTime < next) {
        //给当前展示的歌词行添加样式
				$(".lyrics li").removeClass("lyricLi-show");
				$(".lyrics li").eq(i).addClass("lyricLi-show");
				//开始时top负负得正
				$(".showLyrics .lyrics").css("top",-liH*(i-4));
			}
		}
	}
```
### jsonp方式跨域获取酷狗api
```
//对歌曲名字进行编译
var codeName = encodeURI(song);
//api获取歌词的hash和album_id
var urlTemp = "https://songsearch.kugou.com/song_search_v2?keyword="+codeName+"&page=1&pagesize=1&userid=-1&clientver=&platform=WebFilter&tag=em&filter=2&iscorrection=1&privilege_filter=0";
$.ajax({
  url: urlTemp,
  type: "get",
  dataType: "jsonp",
  jsonp: "callback",
  success: function(data){
    //获取hash和AlbumID,用于下面获取play_url
    $(".song").attr("hash",data.data.lists[0].FileHash);
    $(".song").attr("album-id",data.data.lists[0].AlbumID);
    //发起第二次ajax请求
    getMusicUrl();
  }

var getMusicUrl = function(){
		var hashAttr = $(".song").attr("hash");
		var album_idAttr = $(".song").attr("album-id");
		urlTemp = "http://www.kugou.com/yy/index.php?r=play/getdata&hash="+hashAttr+"&album_id="+album_idAttr;
		console.log(urlTemp);
		$.ajax({
			url: urlTemp,
			type: "get",
			dataType: "jsonp",
			jsonp: "callback",
			jsonpCallback: 'callback',
			success: function(data){
				...
			}
		});
	}
```
播放器界面
![](https://github.com/jiulanrensan/jquery-musicPlayer/blob/master/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20181125142639.png)
![](https://github.com/jiulanrensan/jquery-musicPlayer/blob/master/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20181125142657.png)
