/*
 *  Welcome System
 *  author: Anthony DIllon
 */

function WelcomeSystem($parent){
	var _parent = $parent;
	var _this = this;
	var _isOpen = false;
	
	this.init = function(){
		this.center();
		this.open();
		$('#welcome #welcome-screen ul a').bind('click',function(e){
			_this.startTour($(this).attr('class'));
		});
		
		$('#welcome #welcome-screen .explore-mode').bind('click',function(e){
			_this.startTour('explore-mode');
		});
		
		$('#welcome #welcome-screen .tour-mode').bind('click',function(e){
			_this.startTour('tour-mode');
		});
		
		$('#welcome #welcome-screen .close').bind('click',function(e){
			_this.startTour('explore-mode');
		});
		$('#welcome  #welcome-screen').show();
		var hash = window.location.hash; 
		if (hash != undefined) {
			_this.startTour(hash.substring(1));
		}
	}
	
	this.startTour = function(tourId) {
		switch(tourId){
			case 'browse-files':
				$('#welcome').hide();
				_isOpen = false;
				_parent.guidedTourSystem.setCurrentIndex(0);
				_parent.systemMenu.handleMenuClick('home');
			break;
			case 'surf-the-web':
				$('#welcome').hide();
				_isOpen = false;
				_parent.guidedTourSystem.setCurrentIndex(1);
			    _parent.systemMenu.handleMenuClick('firefox');
			break;
			case 'check-email':
				$('#welcome').hide();
				_isOpen = false;
				_parent.guidedTourSystem.setCurrentIndex(2);
				_parent.systemMenu.handleMenuClick('email');
			break;
			case 'view-photos':
				$('#welcome').hide();
				_isOpen = false;
				_parent.guidedTourSystem.setCurrentIndex(3);
				_parent.systemMenu.handleMenuClick('shotwell');
			break;
			case 'find-apps':
				$('#welcome').hide();
				_isOpen = false;
				_parent.guidedTourSystem.setCurrentIndex(4);
				_parent.systemMenu.handleMenuClick('software');
			break;
			case 'create-documents':
				$('#welcome').hide();
				_isOpen = false;
				_parent.guidedTourSystem.setCurrentIndex(5);
				_parent.systemMenu.handleMenuClick('writer');
			break;
			case 'create-presentations':
				$('#welcome').hide();
				_isOpen = false;
				_parent.guidedTourSystem.setCurrentIndex(6);
				_parent.systemMenu.handleMenuClick('impress');
			break;
			case 'create-spreadsheets':
				$('#welcome').hide();
				_isOpen = false;
				_parent.guidedTourSystem.setCurrentIndex(7);
			    _parent.systemMenu.handleMenuClick('calc');
			break;
			case 'watch-video':
				$('#welcome').hide();
				_isOpen = false;
				_parent.guidedTourSystem.setCurrentIndex(8);
				_parent.systemMenu.handleMenuClick('movieplayer');
				_parent.moviePlayerSystem.addVideo();
			break;
			case 'explore-mode':
				$('#welcome').hide();
				_isOpen = false;
			break;
			case 'tour-mode':
				$('#welcome').hide();
				_isOpen = false;
				_parent.guidedTourSystem.setCurrentIndex(0);
				_parent.systemMenu.handleMenuClick('home');
			break;
			default:
				return false;
			break;
		}
		$('#tour-guide .explore-to-welcome').bind('click',function(){
			_this.open();
		});
		$('#tour-guide .explore-to-welcome').bind('mouseover',function(){
			$('#tour-guide .explore-tooltip-welcome').show();
		});
		$('#tour-guide .explore-to-welcome').bind('mouseout',function(){
			$('#tour-guide .explore-tooltip-welcome').hide();
		});
		$('#tour-guide .explore-to-download').bind('mouseover',function(){
			$('#tour-guide .explore-tooltip-download').show();
		});
		$('#tour-guide .explore-to-download').bind('mouseout',function(){
			$('#tour-guide .explore-tooltip-download').hide();
		});
		$('#tour-guide .explore-to-download').bind('click',function(){
			_parent.errorMessage.open();
		});
		/*if($('#tour-guide').is(':visible')){
			$('.explore-to-welcome').css('bottom',210);
			$('.explore-to-download').css('bottom',150);
		}else{
			$('.explore-to-welcome').css('bottom',80);
			$('.explore-to-download').css('bottom',20);
		}*/
	}
	
	this.open = function(){
		_isOpen = true;
		$('#welcome').show();
		
	}
	
	this.center = function(){
	    var windowHeight = 575;//$('#welcome #welcome-screen').outerWidth(true);
    	var left = ($(document).width() / 2) - (windowHeight / 2);
		var top = Math.max(24,($(document).height() / 2) - (windowHeight / 2));
		$('#welcome #welcome-screen').css('left',left);
		$('#welcome #welcome-screen').css('top',top); 
	}
	    
	this.resize = function(){
		this.center();
	}
	
	this.isOpen = function(){
		return _isOpen;
	}
	
}
