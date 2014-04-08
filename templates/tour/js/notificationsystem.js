/*
 *  Notification System
 *  author: Anthony Dillon
 */

function NotificationSystem(){
	var _this;
	var displaying;
	var messageArray;
	var notificationTimeout;
	
	this.init = function(){
		_this = this;
		displaying = false;
		messageArray = new Array();
		notificationTimeout = null;
	}
	
	this.displayNotification = function($img, $title, $desc){
		messageArray.push({img:$img, title:$title, desc:$desc});
		if(!displaying){
			this.showNotification();
		}
	}
	
	this.showNotification = function(){
		displaying = true;
		$('body').append('<div class="notification"><img src="'+messageArray[0].img+'"/><p class="title">'+messageArray[0].title+'</p><p class="description">'+messageArray[0].desc+'</p></div>');
		$('.notification').bind('mouseover', function(){
			_this.stopTimeout();
		});
		$('.notification').bind('mouseout', function(){
			_this.startTimeout();
		});
		$('.notification').fadeTo(1000, 1, _this.startTimeout);
	}
	
	this.startTimeout = function(){
		notificationTimeout = setTimeout(function() {
			$('.notification').fadeTo(1000, 0, _this.killTimeout);
		}, 3000);
	}
	
	this.killTimeout = function(){
		$('.notification').remove();
		$('.notification').unbind('mouseover');
		$('.notification').unbind('mouseout');
		clearInterval(notificationTimeout);
		notificationTimeout = null;
		displaying = false;
		_this.runNext();
	}
	
	this.runNext = function(){
		messageArray.splice(0,1);
		if(messageArray.length > 0){
			this.showNotification();
		}
	}
	
	this.stopTimeout = function(){
		clearInterval(notificationTimeout);
		notificationTimeout = null;
	}
}
