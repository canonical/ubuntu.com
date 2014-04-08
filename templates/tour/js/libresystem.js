/*
 *  Error Message 
 *  author: Anthony Dillon
 */

function LibreSystem($parent){
	var _this = this;
	var _parent = $parent;
	
	this.init = function(){
		$('#libreoffice-calc-window   .control .close').bind('click', function(){
			_this.close('calc');
		});
		$('#libreoffice-writer-window   .control .close').bind('click', function(){
			_this.close('writer');
		});
		$('#libreoffice-impress-window   .control .close').bind('click', function(){
			_this.close('impress');
		});
		$('#libreoffice-calc-window .content').bind('click', function(){
			_parent.errorMessage.open();
		});
		$('#libreoffice-writer-window .content').bind('click', function(){
			_parent.errorMessage.open();
		});
		$('#libreoffice-impress-window .content').bind('click', function(){
			_parent.errorMessage.open();
		});
		
		this.center('calc');
		this.center('writer');
	}
	
	this.open = function($type){
		$('#libreoffice-'+$type+'-window').show();
		$('#libreoffice-'+$type+'-window ').trigger('mousedown');
		this.center($type);
		if($('css3-container').length > 0){
        	$('#libreoffice-'+$type+'-window').prev().css('top', $('#libreoffice-'+$type+'-window').css('top'));
        	$('#libreoffice-'+$type+'-window').prev().css('left', $('#libreoffice-'+$type+'-window').css('left'));
        }
	}
	
	this.close = function($type){
		if($('#libreoffice-'+$type+'-window').is(':visible')){
			_parent.openWindows['libreoffice-'+$type+'-window'] = false;
			$('#libreoffice-'+$type+'-window').hide();
			this.center($type);
			_parent.systemMenu.closeWindow($type);
		}
	}
	
	this.center = function($type){
	    	var left = ($(document).width() / 2) - ($('#libreoffice-'+$type+'-window').width() / 2);
			var top =  Math.max(24,($(document).height() / 2) - ($('#libreoffice-'+$type+'-window').height() / 2));
			$('#libreoffice-'+$type+'-window').css('left',left);
			$('#libreoffice-'+$type+'-window').css('top',top);
	    }
}
