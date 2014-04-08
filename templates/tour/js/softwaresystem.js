/*
* Software Centre System
*  author: Anthony Dillon
*/

function SoftwareSystem($parent){
	var _this = this;
	var _parent = $parent;
	var minified = false;
	var maximised = false;
	var _isOpen = false;
	var currentApp = null;
	var installedApps = new Array();
	var thePrice = '';
	var theName = '';
	var theSub = '';
	var theImage = '';
	var theDescription = '';
	var theDesctiptionImage = '';
	
	this.init = function(){
		
		$('#software-centre .loading-bar').hide();
		$('#software-centre .detailed .price .progress').css('width','0');
		
		$('#software-centre .control .close').click(function(){
			_this.close();
		});
		$('#software-centre  .control .min').click(function(){
			_this.min();
		});
		
		$('#software-centre  .control .max').click(function(){
			if(maximised){
				maximised = false;
				$('#software-centre').css('width','800px');
				$('#software-centre').css('height','550px');
				$('#software-centre').removeClass('fullsize');
				_parent.systemSettings.decreaseFullscreen();
			}else{
				maximised = true;
				$('#software-centre').css('width',$(document).width() - 70 + 'px');
				$('#software-centre').css('height',$(document).height() - 50 + 'px');
				$('#software-centre').addClass('fullsize');
				_parent.systemSettings.increaseFullscreen();
			}
			_this.resize();
		});
		
		$('#software-centre .top-panel .back').bind('click',function(){
			if(!$(this).hasClass('disabled')){
				$('#software-centre .home').show();
				$('#software-centre .detailed').hide();
				$(this).addClass('disabled');
				$('#software-centre .top-panel .forward').removeClass('disabled');
			}
		});
		$('#software-centre .top-panel .forward').bind('click',function(){
			if(!$(this).hasClass('disabled')){
				_this.loadApp();
				$(this).addClass('disabled');
			}
		});
		
		$('#software-centre .whats-new .app-container div').click(function(){
			currentApp = $(this).attr('class');
			$('#software-centre .top-panel .forward').addClass('disabled');
			_this.loadApp();
		});
		this.setupInstall();
		this.setupTopButtons();
		this.center();
	}
	
	this.loadApp = function(){
		var error = false;
		$('#software-centre .top-panel .back').removeClass('disabled');
		$('#software-centre .detailed .price .theprice').removeClass('installed');
		$('#software-centre .detailed .price .button').text(_install_);
		if(installedApps[currentApp] == true){  _this.installedApp(); }
		switch(currentApp){
				case 'chromium':
					thePrice = _price_free_;
					theName = _chromium_app_;
					theSub = _chromium_sub_;
					theImage = '../img/software-centre/logo-chromium.png';
					theDescription = _chromium_desc_;
					theDesctiptionImage = '../img/software-centre/screenshot-chromium.jpg';
				break;
				case 'beep':
					thePrice = '$9.99';
					theName = _beep_app_;
					theSub = _beep_sub_;
					theImage = '../img/software-centre/logo-beep.png';
					theDescription = _beep_desc_;
					theDesctiptionImage = '../img/software-centre/screenshot-beep.jpg';
				break;
				case 'inkscape':
					thePrice = _price_free_;
					theName = _inkscape_app_;
					theSub = _inkscape_sub_;
					theImage = '../img/software-centre/logo-inkscape.png';
					theDescription = _inkscape_desc_;
					theDesctiptionImage = '../img/software-centre/screenshot-inkscape.jpg';
				break;
				case 'worldofgoo':
					thePrice = '$19.95';
					theName = _world_of_goo_app_;
					theSub = _world_of_goo_sub_;
					theImage = '../img/software-centre/logo-world-of-goo.png';
					theDescription = _world_of_goo_desc_;
					theDesctiptionImage = '../img/software-centre/screenshot-worldofgoo.jpg';
				break;
				case 'blender':
					thePrice = _price_free_;
					theName = _blender_app_;
					theSub = _blender_sub_;
					theImage = '../img/software-centre/logo-blender.png';
					theDescription = _blender_desc_;
					theDesctiptionImage = '../img/software-centre/screenshot-blender.jpg';
				break;
				case 'braid':
					thePrice = '$9.99';
					theName = _braid_app_;
					theSub = _braid_sub_;
					theImage = '../img/software-centre/logo-braid.png';
					theDescription = _braid_desc_;
					theDesctiptionImage = '../img/software-centre/screenshot-braid.jpg';
				break;
				default:
					_parent.errorMessage.open();
					error = true;
					break;	
				}
			
			$('#software-centre .detailed .title h1').text(theName);
			$('#software-centre .detailed .title p.subheading').text(theSub);
			$('#software-centre .detailed .title img.app-image').attr('src', theImage);
			$('#software-centre .detailed .description').html(theDescription);
			$('#software-centre .detailed .description-image img').attr('src',theDesctiptionImage);
			if($('#software-centre .detailed .price .theprice').hasClass(_installed_)){
				$('#software-centre .detailed .price .theprice').text(_installed_);
			}else{
				$('#software-centre .detailed .price .theprice').text(thePrice);
			}
			if(!error){
				$('#software-centre .home').hide();
				$('#software-centre .detailed').show();
			}
	}
	
	this.setupInstall = function(){
		$('#software-centre .detailed .price .button').bind('click',function(){
			if(installedApps[currentApp] == true){
				_this.removeApp();
			}else{
				$(this).hide();
				$('#software-centre .loading-bar').show();
				$('#software-centre .detailed .price .theprice').text(_installing_+'…');
				$('#software-centre .loading-bar .progress').animate({
				    	width: 150
				  }, 1500, function() {
				    	_this.installedApp();
						$('#software-centre .loading-bar').hide();
						$('#software-centre .detailed .price .button').show();
				  });
				 }
		});
	}
	
	this.removeApp = function(){
		$('#software-centre .detailed .price .theprice').text(thePrice);
		$('#software-centre .detailed .price .theprice').removeClass('installed');
		$('#software-centre .detailed .price .theprice').css('background-image','none');
		$('#software-centre .detailed .price .button').text(_install_);
		_parent.systemOverlay.removeApps(theName);
		installedApps[currentApp] = false;
	}
	
	this.installedApp = function(){
		$('#software-centre .detailed .price .theprice').text(_installed_);
		$('#software-centre .detailed .price .theprice').addClass('installed');
		$('#software-centre .detailed .price .button').text(_remove_);
		$('#software-centre .detailed .price .progress').css('width','0');
		_parent.systemOverlay.totalApps.push({name:theName,image:theImage});
		installedApps[currentApp] = true;
	}
	
	this.setupTopButtons = function(){
		$('#software-centre .all-software').bind('click', function(){
			$('#software-centre .home').show();
			$('#software-centre .detailed').hide();
			$('#software-centre .top-panel .back').addClass('disabled');
		});
	}
	
	this.close = function(){
		if(_isOpen){
			$('#software-centre .home').show();
			$('#software-centre .detailed').hide();
			if(maximised){ _parent.systemSettings.decreaseFullscreen(); }
			$('#software-centre ').hide();
			_parent.systemMenu.closeWindow('software');
			$('#software-centre ').removeClass('fullsize');
			_this.resize();
			minified = _isOpen = false;
			_this.center();
			if($('css3-container').length > 0){
	        	$('#software-centre').prev().css('top', $('#software-centre').css('top'));
	        	$('#software-centre').prev().css('left', $('#software-centre').css('left'));
	        }
       }
	}
	
	this.min = function(){
		if(maximised){ _parent.systemSettings.decreaseFullscreen(); }
		$('#software-centre ').hide();
		_parent.systemMenu.wiggle('software');
		minified = true;
	}
	
	this.resize = function(){
		var containerHeight = $('#software-centre').height() - ($('#software-centre .top-panel').height() + $('#software-centre .control').height() + 6);
		var appBoxWidth = $('#software-centre').width() - ($('#software-centre .navigation').width() + 50);
    	if(maximised){ containerHeight -= 27; }
		$('#software-centre .container').css('height',containerHeight);
		$('#software-centre .container .whats-new').css('width',appBoxWidth);
	}
	
	this.center = function(){
    	var left = ($(document).width() / 2) - ($('#software-centre ').width() / 2);
		var top = Math.max(24,($(document).height() / 2) - ($('#software-centre ').height() / 2));
		$('#software-centre ').css('left',left);
		$('#software-centre ').css('top',top);
    }
    
    this.isMaximised = function(){
		return maximised;
	}
	
	this.open = function($app){
		if($app != undefined){ currentApp = $app; this.loadApp(); }
		this.resize();
		this.center();
		$('#software-centre').show();
		_isOpen = true;
		_parent.systemMenu.openWindow('software');
		if($('css3-container').length > 0){
        	$('#software-centre').prev().css('top', $('#software-centre').css('top'));
        	$('#software-centre').prev().css('left', $('#software-centre').css('left'));
        }
	}
}