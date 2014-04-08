/*
 *  Error Message 
 *  author: Anthony Dillon
 */

function ErrorMessage($parent){
	var _this = this;
	var _parent = $parent;
	
	this.init = function(){
		$('.error-window  .control .close').bind('click', function(){
			_this.close();
		});
		$('.error-window .content .error-buttons div').bind('click', function(){
			var clickedClass = $(this).attr('class').replace(' highlight', '');
			switch(clickedClass){
				case 'continue':
					_this.continueClicked();
				break;
				case 'download':
					_this.downloadClicked();
				break;
			}
		});
		this.center();
	}
	
	this.continueClicked = function(){
		this.close();
	}
	
	this.downloadClicked = function(){
		window.open('http://www.ubuntu.com/download/ubuntu/download');
	}
	
	this.open = function(){
		this.resize();
		$('.error-window').show();
		$('.error-window ').trigger('mousedown');
		$('body').append('<div class="fullscreenErrorTransOverlay"></div>');
		$('.fullscreenErrorTransOverlay').bind('click',function(){
			_this.close();
		});
		if($('css3-container').length > 0){
        	$('.error-window').prev().css('top', $('.error-window').css('top'));
        	$('.error-window').prev().css('left', $('.error-window').css('left'));
        }
		//_parent.notificationSystem.displayNotification('img/error/warning.png', 'Thanks for exploring Ubuntu.','Remember, this is just a demo. You’ll have to download it to enjoy the real thing!')
	}
	
	this.close = function(){
		if($('.error-window').is(':visible')){
			$('.fullscreenErrorTransOverlay').unbind('click');
			$('.fullscreenErrorTransOverlay').remove();
			$('.error-window').hide();
			this.center();
		}
	}
	
	this.resize = function(){
		var left = ($(document).width() / 2) - ($('.error-window').width() / 2);
		var top = ($(document).height() / 2) - ($('.error-window').height() / 2);
		$('.error-window').css('left',left);
		$('.error-window').css('top',top);
	}
	
	this.center = function(){
	    	var left = ($(document).width() / 2) - ($('.error-window').width() / 2);
			var top = ($(document).height() / 2) - ($('.error-window').height() / 2);
			$('.error-window').css('left',left);
			$('.error-window').css('top',top);
   	}
}
