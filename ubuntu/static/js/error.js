/**
 * Ubuntu Core Front-End Framework
 *
 * Core javascript file part of Ubuntu Core Front-End Framework
 * 
 * This file containes the error object used to record javascript errors. 
 * 
 * @project		Ubuntu Core Front-End Framework
 * @author		Web Team at Canonical Ltd
 * @copyright	2012 Canonical Ltd
 *
 */

function ErrorSystem($debug){
	var _this = this;
	var _debug = $debug;
	var displaying = false;
	var messageArray = new Array();
	var notificationTimeout = null;
	
	this.report = function($message, $description){
		messageArray.push(new Error($message, $description));
		if(!displaying){
			this.showNotification();
		}
	}
	
	this.showNotification = function(){
		if(_debug){
			displaying = true;
			YUI().use('node', function (Y) {
				Y.one('body').prepend('<div class="notification"><p class="title">'+messageArray[0].message()+'</p><p class="description">'+messageArray[0].description()+'</p></div>');
				Y.one(".notification").on('mouseover', this.stopTimeout);
				Y.one(".notification").on('mouseout', this.startTimeout);
				Y.one(".notification").setStyle('display','block');
				_this.startTimeout();
			});
		}
	}
	
	this.startTimeout = function(){
		YUI().use('node', function (Y) {
			notificationTimeout = setTimeout(function() {
				Y.one('.notification').setStyle('display','none');
				_this.killTimeout();
			}, 4000);
		});
	}
	
	this.killTimeout = function(){
		YUI().use('node', function (Y) {
			var notification = Y.one('.notification');
			notification.empty();
			notification.detach('mouseover', this.stopTimeout);
			notification.detach('mouseout', this.startTimeout);
		});
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

function Error($message, $description){
	if($message == undefined){ $message = "Error: Blank error"; }
	if($description == undefined){ $description = ""; }
	
	var _message = $message;
	var _description = $description;
	
	this.message = function(){ return _message; }
	this.description = function(){ return _description; }
	
	this.setMessage = function($message){ _message = $message; }
	this.setDescription = function($description){ _description = $description; }
}