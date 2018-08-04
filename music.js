(function($){
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
		date = new Date(),
		//当前音乐,若不是随机模式则默认为当前音乐索引为0
		currentTrack = shuffle === 'true' ? date.getTime() % playlist.length : 0,
		iconCount = 0,
		//continous = true,
		autoplay = true,
		playlist = [
			{
				song: '猫的报恩片尾曲',
				singer: '日本动漫',
				src: 'song/猫的报恩片尾曲.mp3'
			},
			{
				song: '言叶之庭',
				singer: '秦基博',
				src: 'song/言叶之庭.mp3'
			},
			{
				song: 'One More Time, One More Chance',
				singer: '山崎将义',
				src: 'song/One More Time, One More Chance.mp3'
			},
			{
				song: '你被写在我的歌里',
				singer: '苏打绿、Ella',
				src: 'song/你被写在我的歌里.mp3'
			},
			{
				song: '素颜',
				singer: '许嵩、何曼婷',
				src: 'song/素颜.mp3'
			}
		];

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
			shuffle();
		}
		else{
			currentTrack--;
			turnTrack(currentTrack);
		}
	})
	//下一首
	$(".btn-next").click(function(){
		if (shuffle === 'true') {
			shuffle();
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
		loadMusic(temp);
		play();
	}

	//余数一定会小于除数（1~除数-1），用来获取随机模式下列表的歌曲
	//随机播放模式
	var shuffle = function(){
		var time = new Date(),
			currentTrack = time.getTime() % playlist.length;
		turnTrack(currentTrack);
	}

	//播放结束时
	var end =function(){
		pause();	//停止时让图标改变
		//shuffle==='true'时表示随机播放
		if (shuffle === 'true') {
			shuffle();
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
		if (autoplay == true) play();
		getDuration();
	}

	//加载音乐
	var loadMusic = function(i){
		$("audio").attr("src",playlist[i].src);
		//console.log(playlist[i].src);
		$(".song").html(playlist[i].song);
		$(".singer").html(playlist[i].singer);
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
	

})(jQuery);

