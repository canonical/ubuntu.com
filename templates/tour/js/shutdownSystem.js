/*
 *  Shut Down System
 *  author: Anthony Dillon
 */

function ShutdownSystem(){
	var _this = this;
	
	this.init = function(){
		$('#shutdown-window  .control .close').bind('click', function(){
			_this.close();
		});
		$('#shutdown-window .content .shutdown-buttons div').bind('click', function(){
			var clickedClass = $(this).attr('class').replace(' highlight', '');
			switch(clickedClass){
				case 'shutdown':
					_this.shutdownClicked();
				break;
				case 'cancel':
					_this.cancelClicked();
				break;
			}
		});
		this.center();
	}
	
	this.cancelClicked = function(){
		this.close();
	}
	
	this.shutdownClicked = function(){
		window.location.href = 'http://www.ubuntu.com/ubuntu/take-the-tour';
	}
	
	this.open = function(){
		this.resize();
		$('#shutdown-window').show();
		$('#shutdown-window ').trigger('mousedown');
	}
	
	this.close = function(){
		$('#shutdown-window').hide();
		this.center();
	}
	
	this.resize = function(){
		var left = ($(document).width() / 2) - ($('#shutdown-window').width() / 2);
		var top = ($(document).height() / 2) - ($('#shutdown-window').height() / 2);
		$('#shutdown-window').css('left',left);
		$('#shutdown-window').css('top',top-100);
	}
	
	this.center = function(){
	    	var left = ($(document).width() / 2) - ($('#shutdown-window').width() / 2);
			var top = ($(document).height() / 2) - ($('#shutdown-window').height() / 2);
			$('#shutdown-window').css('left',left);
			$('#shutdown-window').css('top',top-100);
	    }
}
