/*
* UbuntuOne system
*  author: Anthony Dillon
*/

function UbuntuOneSystem($parent){
	var _isOpen = false;
	var _parent = $parent;
	var _this = this;
	
	this.init = function(){
		$('#ubuntuone-window').hide();
		$('#ubuntuone-window .control .close').bind('click', function(){
			_this.close();
		});
		$('#ubuntuone-window .content .body .ubuntuone-buttons .join-now').bind('click', function(){
			//_this.close();
			//_parent.errorMessage.open();
			_this.openUbuntu1Page();
		});
		
		$('#ubuntuone-window .content .body .ubuntuone-buttons .learn-more').bind('click', function(){
			_this.openUbuntu1Page();
		});
		
		$('#ubuntuone-window .content .body .ubuntuone-buttons .have-account').bind('click', function(){
			_this.openUbuntu1Page();
		});
	}
	
	this.open = function(){
		
		this.center();
		$('#ubuntuone-window ').show();
		_isOpen = true;
		
		if($('css3-container').length > 0){
        	$('#ubuntuone-window').prev().css('top', $('#ubuntuone-window').css('top'));
        	$('#ubuntuone-window').prev().css('left', $('#ubuntuone-window').css('left'));
        }
		
	}
	
	this.openUbuntu1Page = function(){
		window.open('http://one.ubuntu.com');
	}
		
	this.close = function(){
		if(_isOpen){
			_parent.openWindows['ubuntuone-window'] = false;
			$('#ubuntuone-window .control .close').unbind('click');
			$('#ubuntuone-window').hide();
			_parent.systemMenu.closeWindow('uone');
			_isOpen = false;
		}
	}
	
	this.isOpen = function(){
		return _isOpen;
	}
	
	this.resize = function(){
		this.center();
	}
	
	this.center = function(){
    	var left = ($(document).width() / 2) - ($('#ubuntuone-window ').width() / 2);
		var top = Math.max(24,($(document).height() / 2) - ($('#ubuntuone-window ').height() / 2));
		$('#ubuntuone-window ').css('left',left);
		$('#ubuntuone-window ').css('top',top);
    }
}