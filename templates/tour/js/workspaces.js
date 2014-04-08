/*
 *  Workspaces Object
 *  author: Anthony Dillon
 */

function Workspaces($parent){
	var _parent = $parent;
	var _this = this;
	var _isOpen = false;
	
	this.init = function(){
		$('#workspaces').hide();
	}
	
	this.open = function($id){
		_isOpen = true;
		$('#workspaces').fadeTo(100, 1, function() { _this.resize(); });
		//$('#workspaces').animate({ opacity: 0.25 }, 500, function() {   _this.resize();  });
		 //$('#workspaces').show(500);
		 $('#workspace-container .fadedOverlay').bind('click', function(){
			$('#workspace-container .fadedOverlay').removeClass('selected');
			$(this).addClass('selected');
		});
		$('#workspace-container .fadedOverlay').bind('dblclick', function(){
			_this.close();
		});
		 _this.resize();
	}
	
	this.close = function(){
		_isOpen = false;
		$('#workspaces').fadeTo(100, 0, function() { });
		$('#workspace-container .fadedOverlay').unbind('click');
		$('#workspace-container .fadedOverlay').unbind('dblclick');
	}
	
	this.isOpen = function(){
		return _isOpen;
	}
	
	this.resize = function(){
		var voidHeight = $('#void').height();
		$('#workspaces').css('background-position','0px '+voidHeight+'px');
	}
}
