/*
* System Menu
*  author: Anthony Dillon
*/
var scrollingTimer = null;
function SystemMenu($parent){
	var _parent = $parent;
	var _this = this;
	var menuOut = false;
	var menuTimeout = null;
	var goingIn = false;
	var locked = false;
	var menuScrollAmount = 0;
	var scrolling = false;
	var selectedMenu;
	
	this.init = function(){
	     
	     $('#menu ul li').mouseover(function() {
				$('#tooltip-text').text($(this).text());
				$('#tooltip').css("top",$(this).position().top + $('#menu ul').position().top + 45);
				$('#tooltip').show();
	     });
	     
	     $('#menu ul li').click(function() {
	     	var theClass = $(this).attr("class").replace(' bottom','');
	     	theClass = theClass.replace(' temp', '').replace(' glow', '');
	     	_this.handleMenuClick(theClass);
	     });
	     
	     $('#menu ul li').mouseout(function() {
				$('#tooltip').hide();
	     });
	     this.resize();
	}
	
	this.resize = function(){
		var menuHeight = $(window).height() - 74;
		$("#menu").css('height',menuHeight);
		this.scrollCheck();		
	}
	
	this.scrollCheck = function(){
		var iconMaxHeight = 0;
		$.each($('#menu ul li'), function(){
			if ( $(this).is(':visible')){
				iconMaxHeight += $(this).height() + 8;
			}
		});
		if($('#menu ul').height() < iconMaxHeight){
			if(!scrolling){
				this.addScrolling();
				$('#menu .rubbish').removeClass('bottom');
			}
		}else{
			if(scrolling){
				this.removeScrolling();
				$('#menu .rubbish').addClass('bottom');
			}
		}
	}
	
	this.addScrolling = function(){
		scrolling = true;
		$('#menu').append('<div class="scroll-up"></div><div class="scroll-down"></div>');
		$('#menu .scroll-up').bind('mouseover', function(){ scrollingUp = true; scrollUp(); });
		$('#menu .scroll-down').bind('mouseover', function(){ scrollingDown = true; scrollDown(); });
		$('#menu .scroll-up').bind('mouseout', function(){  _this.stopScrolling() });
		$('#menu .scroll-down').bind('mouseout', function(){ _this.stopScrolling() });
		$('#menu').bind('mouseleave', function(){ _this.resetScroll(); });
	}
	
	this.stopScrolling = function(){
		 clearTimeout(scrollingTimer); 
		 scrollingTimer = null;
	}
	
	this.removeScrolling = function(){
		scrolling = false;
		$('#menu').unbind('mousemove');
		$('#menu').unbind('mouseout');
		$('#menu .scroll-up').remove();
		$('#menu .scroll-down').remove();
		$('#menu .scroll-up').unbind('mouseover');
		$('#menu .scroll-down').unbind('mouseover');
		$('#menu .scroll-up').unbind('mouseoout');
		$('#menu .scroll-down').unbind('mouseoout');
	}
	
	this.resetScroll = function(){
		$('#menu ul').css('top','0px');
	}
	
	this.handleMenuClick = function($menu){
		if($menu != 'dash'){
			selectedMenu = $menu;
		}
		switch($menu){
			case 'dash':
				$('#menu .selected-window-arrow').hide();
				$('#menu .dash .selected-window-arrow').show();
				_parent.systemOverlay.open();
			break;
			case 'home':
				var div = $('.folder');
				 if(!div.is(':visible')){
					if(fileSystem.isMinified()){
						if(fileSystem.isMaximised()){ systemSettings.increaseFullscreen();}
						fileSystem.reset(false);
					}else{
						fileSystem.reset(true);
					}
				}
				fileSystem.open();
				$('.folder ').trigger('mousedown');
			break;
			case 'firefox':
				var div = $('.firefox-window');
				 if(!div.is(':visible')){
				 	_parent.firefoxSystem.open();
					if(_parent.firefoxSystem.isMaximised()){ _parent.systemSettings.increaseFullscreen();}
				 }
				 $('.firefox-window ').trigger('mousedown');
			break;
			case 'shotwell':
				var div = $('#shotwell');
				 if(!div.is(':visible')){
					_parent.shotwellSystem.open();
					if(_parent.shotwellSystem.isMaximised()){ _parent.systemSettings.increaseFullscreen();}
				 }
				 div.trigger('mousedown');
			break;
			case 'writer':
				var div = $('#libreoffice-writer-window');
				 if(!div.is(':visible')){
					_parent.libreSystem.open('writer');
				 }
				 div.trigger('mousedown');
			break;
			case 'impress':
				var div = $('#libreoffice-impress-window');
				 if(!div.is(':visible')){
					_parent.libreSystem.open('impress');
				 }
				 div.trigger('mousedown');
			break;
			case 'calc':
				var div = $('#libreoffice-calc-window');
				 if(!div.is(':visible')){
					_parent.libreSystem.open('calc');
				 }
				 div.trigger('mousedown');
			break;
			case 'uone':
				var div = $('#ubuntuone-window');
				 if(!div.is(':visible')){
				 	_parent.ubuntuOneSystem.open();
				 }
				 $('#ubuntuone-window ').trigger('mousedown');
			break;
			case 'software':
				var div = $('#software-centre');
				 if(!div.is(':visible')){
					_parent.softwareSystem.open();
				 }
				 div.trigger('mousedown');
			break;
			case 'email':
				var div = $('.email-window ');
				 if(!div.is(':visible')){
				 	emailSystem.open();
					if(_parent.emailSystem.isMaximised()){ _parent.systemSettings.increaseFullscreen();}
				 }
				 if(_parent.emailSystem.isWriteMinified()){ 
				 	$('#email-write').show(); 
				 	 $('#email-write ').trigger('mousedown');
				 }else{
				 	 $('.email-window ').trigger('mousedown');
				 }
			break;
			case 'movieplayer':
				var div = $('#movieplayer');
				 if(!div.is(':visible')){
				 	moviePlayerSystem.center();
					div.show();
					if(_parent.moviePlayerSystem.isMaximised()){ _parent.systemSettings.increaseFullscreen();}
				 }
				 $('#movieplayer ').trigger('mousedown');
			break;
			case 'rubbish':
				var div = $('.folder');
				 if(!div.is(':visible')){
					if(_parent.fileSystem == null){
						_parent.fileSystem = new FileSystem(this,'/'+_rubbish_bin_folder_);
						_parent.fileSystem.init();
					}else{
						//_parent.fileSystem.reset(!_parent.fileSystem.isMinified());
						_parent.fileSystem.updateDir('/'+_rubbish_bin_folder_);
					}
					$('.folder').show();
					$("#menu ul li.home img").show();
				}else{
					_parent.fileSystem.updateDir('/'+_rubbish_bin_folder_);
				}
				_parent.fileSystem.open();
				$('.folder ').trigger('mousedown');
				
			break;
			case 'workspace':
			if(_parent.workspaces.isOpen()){
				_parent.workspaces.close();
			}else{
				_parent.workspaces.open();
			}
			break;
			default:
				_parent.errorMessage.open();
			break;
		}
		$("#menu ul li."+$menu+" img.open-arrow").show();
		var $currentBackground = $("#menu ul li."+$menu).css('background-image');
		if($menu != 'dash' && $menu != 'rubbish' && $currentBackground.indexOf('-active') == -1){
			$indexLastSlash = $currentBackground.lastIndexOf('.');
			$newBackgroundLink = $currentBackground.substr(0,$indexLastSlash) + '-active.png';
			$("#menu ul li."+$menu).css('background-image',$newBackgroundLink);
		}
	}
	
	this.getSelectedMenu = function() {
		return selectedMenu;
	}
	
	this.increaseFullscreen = function(){
		//_parent.systemSettings.increaseFullscreen();
	}
	
	this.decreaseFullscreen = function(){
		//_parent.systemSettings.decreaseFullscreen();
	}
	
	this.wiggle = function($icon){
		$('#menu').css('overflow','visible');
		_parent.noWIndowSelected();
		//$("#menu ul li."+$icon).stop(true,false).animate({"marginLeft": "30px"}, "1000") .animate({"marginLeft": "0px"}, "1000", function(){ $('#menu').css('overflow','hidden'); });
		$("#menu ul li."+$icon).addClass('glow').delay(600).queue(function(next){
		    $(this).removeClass("glow");
		    next();
		});

	}
	
	this.closeWindow = function($icon){
		$("#menu ul li."+$icon+" img").hide();
		var $currentBackground = $("#menu ul li."+$icon).css('background-image');
		$("#menu ul li."+$icon).css('background-image',$currentBackground.replace('-active',''));
		if($("#menu ul li."+$icon).hasClass('temp')){
			$("#menu ul li."+$icon).hide();
		}
		$('#top #top-left #title').text('');
		
		_parent.guidedTourSystem.setCurrentIndex(-1);
		this.scrollCheck();
	}
	
	this.openWindow = function($icon){
		if($("#menu ul li."+$icon).hasClass('temp')){
			$("#menu ul li."+$icon).show();
		}
		$("#menu ul li."+$icon+" img").show();
		this.scrollCheck();
	}
	
}

function scrollUp(){
		var pos = Math.min(0,$('#menu ul').position().top +5);
		$('#menu ul').css('top',pos+'px');
		scrollingTimer = setTimeout("scrollUp()",50);
}
	
function scrollDown(){
	var maxscroll =  ($(window).height() - 74) - ($('#menu ul .rubbish').position().top + $('#menu ul .rubbish').height() + 30);
	var pos = Math.max(maxscroll ,Math.min(0,$('#menu ul').position().top - 5));
	$('#menu ul').css('top',pos+'px');
	scrollingTimer = setTimeout("scrollDown()",50);
}