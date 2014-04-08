/*
 *  Movie Player System
 *  author: Anthony Dillon
 */

function MoviePlayerSystem($parent){
	
	var _parent = $parent;
	var _this = this;
	var _isOpen = false;
	var maximised = false;
	var minified = false;
	var movieURL = 'videos/iStock.flv';
	
	this.init = function(){
		this.setupControl();
	}
	
	this.setupControl = function(){
		$('#movieplayer  .control .close').click(function(){
			_this.close();
		});
		$('#movieplayer  .control .min').click(function(){
			_this.min();
		});
		
		$('#movieplayer  .control .max').click(function(){
			if(maximised){
				maximised = false;
				$('#movieplayer').css('width','700px');
				$('#movieplayer').css('height','497px');
				$('#movieplayer').removeClass('fullsize');
				_parent.systemSettings.decreaseFullscreen();
			}else{
				maximised = true;
				$('#movieplayer').css('width',$(document).width() - 70 + 'px');
				$('#movieplayer').css('height',$(document).height() - 50 + 'px');
				$('#movieplayer').addClass('fullsize');
				_parent.systemSettings.increaseFullscreen();
			}
			_this.resize();
		});
		$('#movieplayer .container .tools .controlbuttons .left .play').click(function(){
			playClicked();
		});
	}
	
	this.addVideo = function(){
		var videoObject = '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0"  width="'+$('#movieplayer .container .video').width()+'" height="'+$('#movieplayer .container .video').height()+'"  id="videoPlayer"><param name="movie"  value="../videoplayer.swf" />		<param name="wmode" value="transparent" />  <param name="quality" value="high" />		<param name="bgcolor" value="#000000" />		<embed wmode="transparent" src="../videoplayer.swf" quality="high" bgcolor="#000000" width="'+$('#movieplayer .container .video').width()+'" height="'+$('#movieplayer .container .video').height()+'"  name="videoPlayer" align="" type="application/x-shockwave-flash"  pluginspage="http://www.macromedia.com/go/getflashplayer"> </embed></object>'; 
		$('#movieplayer .container .video').html(videoObject);
	}
	
	this.removeVideo = function(){
		$('#movieplayer .container .video').html('');
	}
	
	this.open = function($playvideo){
		if(!_isOpen){
			this.resize();
			this.center();
			$('#movieplayer').show();
		}
		$('#movieplayer').mousedown();
		_parent.systemMenu.openWindow('movieplayer');
		_isOpen = true;
		if($('css3-container').length > 0){
        	$('#movieplayer').prev().css('top', $('#movieplayer').css('top'));
        	$('#movieplayer').prev().css('left', $('#movieplayer').css('left'));
        }
	}
	
	this.close = function(){
		_parent.openWindows['movieplayer'] = false;
		if(maximised){ _parent.systemSettings.decreaseFullscreen(); }
		$('#movieplayer ').hide();
		_parent.systemMenu.closeWindow('movieplayer');
		$('#movieplayer ').removeClass('fullsize');
		_this.resize();
		minified = _isOpen = false;
		this.removeVideo();
		_this.center();
	}
	
	this.min = function(){
		if(maximised){ _parent.systemSettings.decreaseFullscreen(); }
		$('#movieplayer ').hide();
		_parent.systemMenu.wiggle('movieplayer');
		minified = true;
		_isOpen = false;
	}
	
	this.isMaximised = function(){
		return maximised;
	}
	
	this.resize = function(){
		var videoWidth = $('#movieplayer').width();
		var videoHeight = $('#movieplayer').height();
		$('#videoPlayer embed').attr('width',videoWidth);
		$('#videoPlayer').attr('width',videoWidth);
		$('#videoPlayer').attr('height',videoHeight);
		$('#videoPlayer embed').attr('height',videoHeight - 27);
	}
	
	this.center = function(){
    	var left = ($(document).width() / 2) - ($('#movieplayer').width() / 2);
		var top = Math.max(24,($(document).height() / 2) - ($('#movieplayer').height() / 2));
		$('#movieplayer').css('left',left);
		$('#movieplayer').css('top',top);
    }
}

function getFlashMovieObject(movieName){
	if (window.document[movieName]){
		return window.document[movieName];
	}
	if (navigator.appName.indexOf("Microsoft Internet")==-1){
		if (document.embeds && document.embeds[movieName])
			return document.embeds[movieName];
	}
	else{
		return document.getElementById(movieName);
	}
}

function playClicked(){
	var flashMovie=getFlashMovieObject("videoPlayer");
	flashMovie.playClicked('fg');
}
