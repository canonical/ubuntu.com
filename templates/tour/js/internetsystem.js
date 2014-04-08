/*
* Firefox system
* 	author: Anthony Dillon
*/

function FirefoxSystem($parent){
	var backHistory = new Array();
	var forwardHistory = new Array();
	var _parent = $parent;
	var _this = this;
	var firefoxHeight = 0;
	var urlWidth = 0;
	var maximised = false;
	var homePage = 'http://start.ubuntu.com';
	var internalClick = true;
	var name = 'Browse the internet';
	var _isOpen = false;
	
	this.init = function(){
		
		$('.firefox-window .control .close').click(function(){
			_this.close();
		});
		$('.firefox-window  .control .min').click(function(){
			if(maximised){ _parent.systemSettings.decreaseFullscreen(); }
			$('.firefox-window ').hide();
			_parent.systemMenu.wiggle('firefox');
		});
		$('.firefox-window .control .max').click(function(){
			if(maximised){
				maximised = false;
				$('.firefox-window').removeClass('fullsize');
				$('.firefox-window').css('height','600px');
				$('.firefox-window').css('width','900px');
				$('.firefox-window .web-overlay-tran').css('width','100%');
				$('.firefox-window .web-overlay-tran').hide();
				_parent.systemSettings.decreaseFullscreen();
			}else{
				maximised = true;
				$('.firefox-window').addClass('fullsize');
				$('.firefox-window').css('height',$(document).height() - 50 + 'px');
				$('.firefox-window').css('width',$(document).width() - 70 + 'px');
				$('.firefox-window .web-overlay-tran').css('width','100px');
				$('.firefox-window .web-overlay-tran').show();
				_parent.systemSettings.increaseFullscreen();
			}
			
			resize();
		});
		
	    $('#submitURL').keypress(function(e){
	    	if(e.keyCode == 13){
	    		var inputURL = $('#submitURL ').val();
	    		if(inputURL.slice(0,4) != 'http'){
	    			if(inputURL.slice(0,3) != 'www'){
	    				inputURL = 'http://www.'+inputURL;
	    			}else{
	    				inputURL = 'http://'+inputURL;
	    			}
	    		}
	    		internalClick = true;
	    		forwardHistory = new Array();
	    		backHistory.push(inputURL);
	    		changeURL(inputURL);
	    	}
	    });
	    
	    $('#submitSearch ').keypress(function(e){
	    	if(e.keyCode == 13){
	    		var inputURL = 'http://www.wikipedia.org/w/index.php?title=Special%3ASearch&search='+$('#submitSearch ').val().replace(' ','+');
	    		forwardHistory = new Array();
	    		backHistory.push(inputURL);
	    		internalClick = true;
	    		changeURL(inputURL);
	    	}
	    });
	    
	    this.close = function(){
	    	if(_isOpen){}
	    	_parent.openWindows['firefox-window'] = false;
	    	$('.firefox-window ').hide();
			if(maximised){ _parent.systemSettings.decreaseFullscreen(); }
			center();
			internalClick = false;
			changeURL(homePage);
			maximised = false;
			$('.firefox-window').removeClass('fullsize');
			_this.resize();
			_this.center();
			_parent.systemMenu.closeWindow('firefox');
	    }
	    
	    this.open = function(){
	    	center();
	    	$('.firefox-window ').show();
	    	_isOpen = true;
	    	if($('css3-container').length > 0){
	        	$('.firefox-window').prev().css('top', $('.firefox-window').css('top'));
	        	$('.firefox-window').prev().css('left', $('.firefox-window').css('left'));
	        }
	    }
	    
	    this.isMaximised = function(){
	    	return maximised;
	    }
	    
	    this.resize = function(){
	    	resize();
	    }
	    
	    this.center = function(){
	    	center();
	    }
	    
	     $('#submitSearch').focus(function() {
				if ($(this).val() == 'Wikipedia') {
					$(this).val('');
					$(this).removeClass('fade-text');
				}
			});
			 $('#submitSearch').blur(function() {
				if ($(this).val() == '') {
					$(this).val('Wikipedia');
					$(this).addClass('fade-text');
				}
			});
			
			$('#submitURL').focus(function() {
				if($(this).val().substr($(this).val().length - 3,3) == '...'){
					$(this).removeClass('fade-text');
					$(this).val($(this).val().substr(0,$(this).val().length - 3));
				}
			});
			$('#firefoxInternet').load(function(){
				iframeChange();
			});
	    resize();
	    center();
	    backHistory.push(homePage);
	    changeURL(homePage);
	}
	
	function changeURL($url){
	    	$('#submitURL ').attr('value', $url);
	    	$('#firefoxInternet').attr('src', $url);
	    	updateButtons();
	    }
	    
	    function updateButtons(){
	    	$('.buttons .firefox-back').unbind('click');
	    	$('.buttons .firefox-forward').unbind('click');
	    	
	    	if(backHistory.length <= 1){
	    		$('.buttons .firefox-back').addClass('inactive');
	    	}else{
	    		$('.buttons .firefox-back').removeClass('inactive');
	    		$('.buttons .firefox-back').bind('click',function(){
	    			backPressed();
	    		});
	    	}
	    	if(forwardHistory.length <= 0){
	    		$('.buttons .firefox-forward').addClass('inactive');
	    	}else{
	    		$('.buttons .firefox-forward').removeClass('inactive');
	    		$('.buttons .firefox-forward').bind('click',function(){
	    			forwardPressed();
	    		});
	    	}
	    }
	    
	    function backPressed(){
	    	forwardHistory.push(backHistory[backHistory.length - 1]);
	    	backHistory.pop();firefoxHeight = $('.firefox-window').height() - ($('.firefox-window .control').height() + $('.firefox-window .buttons').height() + 12);
			$('.firefox-window .firefox-internet').css('height',firefoxHeight);
			urlWidth = $('.firefox-window').width() - 310;
			$('.firefox-window .buttons .firefox-url input').css('width',urlWidth);
			internalClick = true;
	    	changeURL(backHistory[backHistory.length - 1]);
	    }
	    
	    function forwardPressed(){
	    	var forwardURL = forwardHistory[forwardHistory.length - 1];
	    	backHistory.push(forwardURL);
	    	forwardHistory.pop();
	    	internalClick = true;
	    	changeURL(forwardURL);
	    }
	    
	    function resize(){
	    	firefoxHeight = $('.firefox-window').height() - ($('.firefox-window .control').height() + $('.firefox-window .buttons').height() + 12);
	    	if(maximised){ firefoxHeight -= 27; }
			$('.firefox-window .firefox-internet .theIframe').css('height',firefoxHeight);
			$('.firefox-window .web-overlay-tran').css('height',firefoxHeight);
			urlWidth = $('.firefox-window').width() - 310;
			$('.firefox-window .buttons .firefox-url input').css('width',urlWidth);
	    }
	    
	    function center(){
	    	var left = ($(document).width() / 2) - ($('.firefox-window').width() / 2);
			var top = Math.max(24,($(document).height() / 2) - ($('.firefox-window').height() / 2));
			$('.firefox-window').css('left',left);
			$('.firefox-window').css('top',top);
	    }
	    
	     function iframeChange(){
	     	if(!internalClick){
		     	$('#submitURL').addClass('fade-text');
		     	if($('#submitURL').val().substr($('#submitURL').val().length - 3,3) != '...'){
		     		$('#submitURL').val( $('#submitURL').val(  ) + '...' );
		     	}
		     }
		     internalClick = false;
		  }
}
