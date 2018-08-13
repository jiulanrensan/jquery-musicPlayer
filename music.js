$().ready(function(){
	setHeight();
	window.onresize = function(){
		setHeight();
	}
	function setHeight(){
		//根据不同尺寸设定高度
		var winH = $(window).height();
		var	winW = $(window).width();
		if (winW < 768) {
			$(".main").height(winH);
		}
		else{
			$(".main").height(0.8*winH).css("margin-top",0.1*winH);
		}
	}
	//弹出歌词页面
	var control = document.getElementsByClassName('control')[0];
	control.addEventListener("click",function(){
		$(".playingPage").fadeIn("slow");
	},false);
	//返回原界面
	$(".btn-back").click(function(){
		$(".playingPage").fadeOut("slow");
	});

	var myAudio = $("audio")[0],
		repeat = localStorage.repeat || 0,
		shuffle = localStorage.shuffle || 'false',
		playlist = [
			{
				song: '幻化成风',
				singer: '日本动漫'
			},
			{
				song: '言叶之庭',
				singer: '秦基博'
			},
			{
				song: 'One More Time, One More Chance',
				singer: '山崎将义'
			},
			{
				song: '你被写在我的歌里',
				singer: '苏打绿、Ella'
			},
			{
				song: '素颜',
				singer: '许嵩、何曼婷'
			},
			{
				song: '有何不可',
				singer: '许嵩'
			},
			{
				song: '清明雨上',
				singer: '许嵩'
			},
			{
				song: '千百度',
				singer: '许嵩'
			},
			{
				song: '认真的雪',
				singer: '薛之谦'
			},
			{
				song: '富士山下',
				singer: '陈奕迅'
			},
			{
				song: '最佳损友',
				singer: '陈奕迅'
			},
			{
				song: '青花瓷',
				singer: '周杰伦'
			},
			{
				song: '漂移',
				singer: '周杰伦'
			}
		],
		date = new Date(),
		//当前音乐,若不是随机模式则默认为当前音乐索引为0
		currentTrack = shuffle === 'true' ? date.getTime() % playlist.length : 0,
		iconCount = localStorage.iconCount || 0,
		//continous = true,
		autoplay = true,
		lyricsArr1 = [],
		lyricsArr2 = [];

	//console.log(shuffle);
	//把音乐列表加进页面中
	for (var i = 0; i < playlist.length; i++) {
		$(".localMusic>ul").append("<li>"+playlist[i].song+" - "+playlist[i].singer+"</li>");
	}

	//点击歌单播放
	$(".localMusic li").each(function(i){
		$(this).click(function(){
			$(this).siblings().css("color","rgba(0,0,0,0.5)");
			$(this).css("color","black");
			currentTrack = i;
			turnTrack(currentTrack);
		})
	});

	//播放按钮
	$(".btn1").click(function(event){
		if (myAudio.paused) {
			play();
		} else {
			pause();
		}
		event.stopPropagation();
	});

	//上一首
	$(".btn-prev").click(function(){
		if (shuffle === 'true') {
			shufflePlay();
		}
		else{
			currentTrack--;
			turnTrack(currentTrack);
		}
	})
	//下一首
	$(".btn-next").click(function(){
		if (shuffle === 'true') {
			shufflePlay();
		}
		else{
			currentTrack++;
			turnTrack(currentTrack);
		}
	})

	function play(){
		myAudio.play();
		$(".btn1").removeClass("icon-play").addClass("icon-pausecircleo");
	}
	function pause(){
		myAudio.pause();
		$(".btn1").removeClass("icon-pausecircleo").addClass("icon-play");
	}
	//切换歌曲
	var turnTrack = function(i){
		var temp;
		if (i < 0) {
			//默认是顺序播放，所以小于零则指向最后一首
			temp = playlist.length-1;
		}
		else if (i > playlist.length) {
			temp = 0;
		}
		else{
			temp = i;
		}
		console.log(currentTrack);
		loadMusic(temp);
		//play();
	}

	//余数一定会小于除数（1~除数-1），用来获取随机模式下列表的歌曲
	//随机播放模式
	var shufflePlay = function(){
		var time = new Date();
		var currentTrack = time.getTime() % playlist.length;
		turnTrack(currentTrack);
	}

	//播放结束时
	var end =function(){
		pause();	//停止时让图标改变
		//shuffle==='true'时表示随机播放
		if (shuffle === 'true') {
			shufflePlay();
			console.log("shuffle");
		}
		else{
			//等于0表示只对列表播放一次,顺序播放
			if (repeat == 0) {
				//只有在小于列表长度情况下才进行
				if (currentTrack < playlist.length) {
					currentTrack++;
					turnTrack(currentTrack);
					console.log(repeat);
				}
			}
			//等于1表示单曲循环
			if (repeat == 1) {
				play();
				console.log(repeat);
			}
			//等于2表示列表循环
			if (repeat == 2) {
				currentTrack++;
				turnTrack(currentTrack);
				console.log(repeat);
			}
		}
	}

	//页面加载后自动播放
	var autoPlay =function(){
		if (autoplay == true){
			play();
			getDuration();
		}
	}

	//利用api跨域获取音乐数据
	var getMusic =function(song){
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
				//获取AlbumID
				//localStorage.album = data.data.lists[0].AlbumID;
				//获取hash,用于下面获取url
				//localStorage.fileHash = data.data.lists[0].FileHash;
				$(".song").attr("hash",data.data.lists[0].FileHash);
				$(".song").attr("album-id",data.data.lists[0].AlbumID);
				getMusicUrl();
			}
		});
	}
	var getMusicUrl = function(){
		var hashAttr = $(".song").attr("hash");
		var album_idAttr = $(".song").attr("album-id");
		urlTemp = "//www.kugou.com/yy/index.php?r=play/getdata&hash="+hashAttr+"&album_id="+album_idAttr;
		$.ajax({
			url: urlTemp,
			type: "get",
			dataType: "jsonp",
			jsonp: "callback",
			jsonpCallback: 'callback',
			success: function(data){
				console.log(data.data.lyrics);
				$("audio").attr("src",data.data.play_url);
				//$(".showLyrics").css("background-image","url()");
				$(".showLyrics").css("background-image","url("+data.data.img+")");
				//清空之前的歌词
				$(".showLyrics .lyrics").empty();
				//\n换行符为界限分为数组
				lyricsArr1 = data.data.lyrics.split("\n");
				var tempLyr = [];
				//用正则获取时间
				//格式为 [00:00.06]陈奕迅 - 富士山下
				var timeReg = /\[\d{2}:\d{2}.\d{2}\]/g;
				for (i in lyricsArr1) {
					//把每个时间提取出来
					var time = lyricsArr1[i].match(timeReg);
					//把数组里的时间替换掉,得到歌词
					var value = lyricsArr1[i].replace(timeReg,"");
					//把每组时间以冒号分隔开
					for(j in time){
						var t = time[j].slice(1,-1).split(":");
						var tempTime = parseInt(t[0],10)*60 + parseFloat(t[1]);
						//console.log(t);
						tempLyr.push([tempTime,value]);
					}	
				}
				lyricsArr2 = tempLyr;
				appendLyric();
				play();
			}
		});
	}

	//把歌词填充到<ul class="lyrics"></ul>
	var appendLyric = function(){
		var lyricLi;
		for (var i = 0; i < lyricsArr2.length; i++) {
			//把时间作为属性添加，歌词作为内容添加
			lyricLi = "<li lyric-time='"+lyricsArr2[i][0]+"' class='lyricLi'>"+lyricsArr2[i][1]+"</li>";
			$(".showLyrics .lyrics").append(lyricLi);
		}
		setInterval(showLyric,100);
	}
	var showLyric = function(){
		var liH = $(".lyrics li").eq(0).outerHeight();
		//console.log(liH);
		for (var i = 0; i < lyricsArr2.length; i++) {
			//为什么直接获取数组报错？
			var current = $(".lyrics li").eq(i).attr("lyric-time");
			var next = $(".lyrics li").eq(i+1).attr("lyric-time");
			if (myAudio.currentTime > current && myAudio.currentTime < next) {
				$(".lyrics li").removeClass("lyricLi-show");
				$(".lyrics li").eq(i).addClass("lyricLi-show");
				//开始时top负负得正
				$(".showLyrics .lyrics").css("top",-liH*(i-4));
			}
		}
	}

	//加载音乐
	var loadMusic = function(i){
		getMusic(playlist[i].song);
		//$("audio").attr("src",playlist[i].src);
		$(".song").html(playlist[i].song);
		$(".singer").html(playlist[i].singer);
		$(".localMusic li").siblings().css("color","rgba(0,0,0,0.5)");
		$(".localMusic li").eq(i).css("color","black");
		//加载后获取歌曲时长
		myAudio.addEventListener('durationchange', getDuration, false);
		//myAudio.addEventListener('progress', getDuration, false);
		myAudio.addEventListener('canplay', autoPlay, false);
		myAudio.addEventListener('ended', end, false);//冒泡时监听
	}

	//执行加载音乐
	loadMusic(currentTrack);

	//时长转为分秒格式
	var turnDuration = function(time){
		var str = parseInt(time/60);
		str+= ":";
		//str+= parseInt(time%60);
		if (parseInt(time%60) < 10) {
			str += 0;
		}
		str += parseInt(time%60);
		return str;
	}

	//获取歌曲时长
	var getDuration = function(){
		var duration_temp = myAudio.seekable.length ? myAudio.seekable.end(0):0;
		$(".allTime").html(turnDuration(duration_temp));
		//console.log(duration_temp);
	}

	//播放模式的更改
	var iconArr = ["icon-repeatoff","icon-repeatone","icon-repeat","icon-shuffle"];
	var turnIcon = function(){
		if (iconCount > 3) { iconCount = 0; }
		//设置repeat和shuffle
		if (iconCount < 3) {
			repeat = localStorage.repeat = iconCount;
			shuffle = localStorage.shuffle = 'false';
		}
		else{
			shuffle = localStorage.shuffle = 'true';
		}
		$(".play-style").html("<span class='iconfont btn-play-style "+iconArr[iconCount]+"'></span>");
		localStorage.iconCount = iconCount;
		iconCount++;
	}
	turnIcon();
	$(".play-style").click(function(){
			turnIcon();
			//console.log(iconCount);
		});
	
	//设置当前播放时间和总时长


	//进度条自动
	var playedBar = function(){
		//音频当前时间除以总长度,都以秒为单位
		var length = myAudio.currentTime/myAudio.duration*100;
		$(".playedBar").width(length+'%');
		$(".currentTime").html(turnDuration(myAudio.currentTime));
		if (myAudio.currentTime == myAudio.duration) {
			$(".playedBar").width(0);
		}
	}
	setInterval(playedBar,500);
	//鼠标控制进度条
	$(".progress").bind("mousedown",function(event){
		var x = event.clientX;
		var progLeft = $(this).offset().left;
		//progLeft为进度条距页面左侧的距离,x为进度条中鼠标位置距页面左侧距离
		//相减就是音频播放长度
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

	//音量控制
	var newVolume = localStorage.volume || 0.5;
	var setVolume = function(v){
		$(".currentV").width(v*100+'%');
		myAudio.volume = v;
		if (v != 0) {
			newVolume = localStorage.volume = v;
		}
	}
	setVolume(newVolume);

	//点击图标控制有无声音
	$(".volume>span").click(function(){
		if ($(this).hasClass("icon-volumeup")) {
			$(this).removeClass("icon-volumeup").addClass("icon-volumeoff1");
			setVolume(0);
		}
		else{
			$(this).removeClass("icon-volumeoff1").addClass("icon-volumeup");
			setVolume(newVolume);
		}
	})

	//点击进度条控制声音
	$(".volume-control").bind("mousedown",function(event){
		var x = event.clientX;
		var progLeft = $(this).offset().left;
		var playedLength = (x - progLeft) / $(this).width();
		setVolume(playedLength);

		$(this).bind("mousemove",function(event){
			x = event.clientX;
			playedLength = (x - progLeft)/$(this).width();
			setVolume(playedLength);
		});

		$(this).bind("mouseup",function(){
			console.log(playedLength);
			$(".volume-control").unbind("mousemove").unbind("mouseup");
		});
	})
	

});

