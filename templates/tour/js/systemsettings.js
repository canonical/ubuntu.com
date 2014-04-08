/*
 *  System Settings
 *  author: Anthony Dillon
 */

function SystemSettings($parent){
	var _parent;
	var _this;
	var _date;
	var _volume;
	var _bluetooth;
	var _bluetoothVisible;
	var _fullscreenCount;
	var _onGuidedTour;
	var _systemName;
	var _mute;
	var _gotMessage;
	var _activeIcons;
	var _timeInterval;
	var _firstMinute;
	
	this.init = function(){
		_parent = $parent;
		_this = this;
		_date = new Date();
		_volume = 30;
		_bluetooth = true;
		_bluetoothVisible = false;
		_fullscreenCount = 0;
		_onGuidedTour = false;
		_systemName = 'Ubuntu Play';
		_mute = false;
		_gotMessage = false;
		_activeIcons = 9;
		_timeInterval = setInterval(function(){ _this.updateClock() }, 1000);
		_firstMinute = _date.getMinutes();
		this.setClock();
		this.setSystem();
		
	}
	
	this.setSystem = function(){
		//$('#welcome #welcome-screen h1').text('Welcome to '+_systemName);
	}
	
	this.gotMail = function($mail){
		_gotMessage = $mail;
		if($mail && $('#top #top-right #message .message-logo').attr('src') == '../img/top/nomessage.png'){
			$('#top #top-right #message .message-logo').attr('src', '../img/top/gotmessage.png');
		}else if(!$mail && $('#top #top-right #message .message-logo').attr('src') == '../img/top/gotmessage.png'){
			$('#top #top-right #message .message-logo').attr('src', '../img/top/nomessage.png');
		}
	}
	
	this.setGuidedTour = function($ogt){
		_onGuidedTour = $ogt;
	}
	
	this.setDate= function($time){ 
		_date = $time;
	}
	
	this.setVolume = function($volume){ 
		_volume = $volume;
	}
	
	this.setMute = function($mute){ 
		_mute = $mute;
	}
	
	this.setActiveIcons = function($iconCount){
		_activeIcons = $iconCount;
	}
	
	this.setBluetooth = function($bluetooth){ 
		_bluetooth = $bluetooth;
		if(_bluetooth){
			$('#top #top-right #bluetooth ul li.bluetooth').text('Bluetooth On');
				$('#top #top-right #bluetooth img').removeClass('disabled');
			$('#top #top-right #bluetooth ul li.BtOn').show();
		}else{
			$('#top #top-right #bluetooth ul li.bluetooth').text('Bluetooth Off');
			$('#top #top-right #bluetooth img').addClass('disabled');
			$('#top #top-right #bluetooth ul li.BtOn').hide();
		}
	}
	
	this.increaseFullscreen = function(){
		_fullscreenCount++;
		_parent.topShadow(false);
	}
	
	this.decreaseFullscreen = function(){
		_fullscreenCount--;
		if(_fullscreenCount <= 0){
			_parent.topShadow(true);
			_parent.noWIndowSelected();
		}
	}
	
	this.setBluetoothVisible = function($bluetoothVisible){ 
		_bluetoothVisible = $bluetoothVisible;
	}
	
	this.updateTime = function(){
		_date.setMinutes( _date.getMinutes() + 1);
		this.setClock();
	}
	
	this.setClock = function(){
		var hours = _date.getHours();
		var minutes = _date.getMinutes();
		if (minutes < 10){ minutes = "0" + minutes; }
		if (hours < 10){ hours = "0" + hours; }
		$('#time p').text(hours + ":" + minutes + " ");
	}
	
	this.updateClock = function(){
		if(_firstMinute != new Date().getMinutes()){
			clearInterval(_timeInterval);
			this.updateTime()
			setInterval(function(){ _this.updateTime() }, 60000);
		}
	}
	
	this.onGuidedTour = function(){ return _onGuidedTour; }
	this.date = function(){ return _date;	}
	this.fullscreenCount = function(){ return _fullscreenCount;	}
	this.volume = function(){ return _volume;	}
	this.bluetooth = function(){ return _bluetooth;	}
	this.bluetoothVisible = function(){ return _bluetoothVisible;	}
	this.mute = function(){ return _mute;	}
	this.mail = function(){ return _gotMessage; }
}
