/*
 *  Main Script System
 *  author: Anthony Dillon
 */

var _this = this;
var movingFolder = null;
var folderXOffset = 0;
var folderYOffset = 0;
var fileSystem = null;
var systemOverlay = null;
var systemMenu = null;
var firefoxSystem = null;
var emailSystem = null;
var ubuntuOneSystem = null;
var systemSettings = null;
var errorMessage = null;
var shutdownSystem = null;
var libreSystem = null;
var currentSystemSelected = null;
var currentSelectedFullscreen = false;
//var workspaces = null;
var shotwellSystem = null;
var welcomeSystem = null;
var moviePlayerSystem = null;
var guidedTourSystem = null;
var notificationSystem = null;
var softwareSystem = null;
var fileLibrary = new Array();
var openWindows = new Array();

$(document).ready(function(){
	if($.browser.msie){
		if($.browser.version != '8.0' && $.browser.version != '9.0'){
			window.location.href = '/ubuntu/take-the-tour-gallery';
		}else{
			setup();
		}
	}else{
		setup();
	}
});

function setup(){
	var imageObj = new Image();
	$(imageObj).attr("src","../img/welcome/background-welcome.jpg").load(function(){
	  	$('#loader').hide();
	});
	setupSystemSettings();
	setupGuidedTourSystem();
	setupShotwellSystem();
	setupSystemMenu();
	setupSystemOverlay();
	setupFirefoxSystem();
	setupEmailSystem();
	setupErrorMessage();
	setupUbuntuOneSystem();
	setupFileSystem();
	setupShutdownSystem();
	setupMoviePlayerSystem();
	setupLibreSystem();
	setupNotificationSystem();
	setupSoftwareSystem();
	setupWelcomeSystem();
	init();
}

function init(){
	$(window).resize(function() {
		systemOverlay.resize();
		if(ubuntuOneSystem.isOpen()){
			ubuntuOneSystem.resize();
		}
		if(welcomeSystem.isOpen()){
			welcomeSystem.resize();
		}
		systemMenu.resize();
	});
	
	$(document).mousemove(function(e){
      		if(movingFolder != null){
      			movingFolder.css('left', e.pageX - folderXOffset);
      			movingFolder.css('top',Math.max(24, e.pageY - folderYOffset));
      		}
     }); 
     
     $('.control').mousedown(function(e) {
			movingFolder = $(this).parent();
			folderXOffset = e.pageX - movingFolder.position().left;
			folderYOffset = e.pageY - movingFolder.position().top;
	 });
	 $(document).mouseup(function() {
			movingFolder = null;
	 });
	 
	 $('.window').mousedown(function(){
		if($(this).attr('class').indexOf("firefox-window") != -1){
			if($(this).attr('class').indexOf("fullsize") == -1){
				$('.firefox-window .web-overlay-tran').css('width','100%');
				$('.firefox-window .web-overlay-tran').hide();
			}else{
				$('.firefox-window .web-ubuntuOneSystemoverlay-tran').css('width','100px');
				$('.firefox-window .web-overlay-tran').show();	
			}
		}else{
			$('.firefox-window .web-overlay-tran').css('width','100%');
			$('.firefox-window .web-overlay-tran').show();
		}
		$('.window').css('z-index',2);
		$('.window').removeClass('selected-window');
		$('#top #top-left #title').text($('.window-title', this).text());
		$('.'+currentSystemSelected).css('z-index',3);
		$(this).css('z-index',4);
		
		if($('css3-container').length > 0){
	     	$('css3-container').css('z-index',2);
	     	$('.'+currentSystemSelected).prev().css('z-index',3);
	        $(this).prev().css('z-index',4);
		}
		
		$(this).addClass('selected-window');
		openWindows[$(this).attr('id')] = true;
		
		if(currentSystemSelected != $(this).attr('class').replace(' window', '').replace(' fullsize', '').replace(' selected-window','').replace(' window', '')){
			currentSystemSelected = $(this).attr('class').replace(' fullsize', '');
			currentSystemSelected = currentSystemSelected.replace(' selected-window','');
			currentSystemSelected = currentSystemSelected.replace(' window', '');
			$('#menu ul li .selected-window-arrow').hide();
			var set = currentSystemSelected;
			if(set == 'folder'){ set = 'home'; }
			if(set == 'firefox-window'){ set = 'firefox'; }
			if(set == 'email-window'){ set = 'email'; }
			
			$('#menu ul li.'+set+' .selected-window-arrow').show();
			
			guidedTourSystem.setSystem(set);
		}
	 });
     setupTopMenu();
}

function noWIndowSelected(){
	currentSystemSelected = null;
	$('#menu ul li .selected-window-arrow').hide();
}

function setupTopMenu(){
	$('#top #top-right div').bind('click', function(){
		var hasSelected = $(this).hasClass('selected');
		closeTopRightDropDowns();
		if(!hasSelected){
			$(this).addClass('selected');
			$('.drop-down',this).show();
			addTransOverlay();
			$('#top #top-right div').bind('mouseover',function(){
				if(!$(this).hasClass('selected')){
					$('#top #top-right div').removeClass('selected');
					$('#top #top-right .drop-down').hide();
					$(this).addClass('selected');
					$('.drop-down',this).show();
				}
			});
		}else{
			$('#top #top-right div').unbind('mouseover');
			//systemMenu.setLocked(false);
		}
	});
	
	$('#top #top-right div ul li').bind('click',function(){
		switch($.trim($(this).text())){
			case _turn_off_bluetooth_:
				systemSettings.setBluetooth(false);
				$(this).text(_turn_on_bluetooth_);
			break;
			case _turn_on_bluetooth_:
				systemSettings.setBluetooth(true);
				$(this).text(_turn_off_bluetooth_);
			break;
			case _visible_:
				if(systemSettings.bluetoothVisible()){
					systemSettings.setBluetoothVisible(false);
					$(this).removeClass('ticked');
				}else{
					systemSettings.setBluetoothVisible(true);
					$(this).addClass('ticked');
				}
			break;
			case _mute_:
				systemSettings.setMute(true);
				sliderUpdate(0, 1);
				$(this).text(_unmute_);
			break;
			case _unmute_:
				systemSettings.setMute(false);
				sliderUpdate(systemSettings.volume(), 0);
				$(this).text(_mute_);
			break;
			case _shut_down_:
				shutdownSystem.open();
			break;
			default:
				errorMessage.open();
			break;
		}
	});
	
	$('#top #top-right #speakers .slider').slider({
			min: 0,
			max: 100,
			step: 1,
			value: 30,
			slide: function(event, ui) {
				currentPercent = $(this).slider('option', 'value');
				_this.sliderUpdate(currentPercent);
			},
			stop: function(event, ui) {
				currentPercent = $(this).slider('option', 'value');
				_this.sliderUpdate(currentPercent);
				_this.systemSettings.setVolume(currentPercent);
			}
		});
		
	
	$('#top #top-left #control-buttons div').bind('click', function(){
		var buttonClicked = $(this).attr('id');
		$('.'+currentSystemSelected+ ' .control .'+buttonClicked).trigger('click');
	});
	
	$('#top #top-right #speakers .banshee').mouseover(function(){
		$('#top #top-right #speakers .banshee .banshee-play').css('background-image','url(../img/top/banshee-play-highlight.png)');
	});
	
	$('#top #top-right #speakers .banshee').mouseout(function(){
		$('#top #top-right #speakers .banshee .banshee-play').css('background-image','url(../img/top/banshee-play.png)');
	});
	
}

function sliderUpdate($percent, $muted){
	var active = parseInt((195 * $percent) / 100);
	if(active < 10){ active = 0; }
	$('#top #top-right #speakers .drop-down .slider-active').css('width',active);
	var imageIndex = 0;
	if(systemSettings.mute()){
		imageIndex = 0;
	}else	if($percent <= 1){
		imageIndex = 1;
	}else	if($percent <= 35){
		imageIndex = 2;
	}else if($percent <= 75){
		imageIndex = 3;
	}else if($percent >= 75){
		imageIndex = 4;
	}
	if($muted != undefined){
		if($muted){
			$('#top #top-right #speakers .slider').slider({value: 0});
		}else{
			$('#top #top-right #speakers .slider').slider({value: systemSettings.volume()});
		}
	}
	$('#top #top-right #speakers img.speakers-logo').attr('src', '../img/top/speakers'+imageIndex+'.png');
}

function closeTopRightDropDowns(){
	$('#top #top-right div').removeClass('selected');
	$('#top #top-right .drop-down').hide();
	$('.fullscreenTransOverlay').unbind('click');
	$('.fullscreenTransOverlay').remove();
	$('#top #top-right div').unbind('mouseover');
}

function addTransOverlay(){
	$('body').append('<div class="fullscreenTransOverlay"></div>');
	//systemMenu.setLocked(true);
	$('.fullscreenTransOverlay').bind('click',function(){
		closeTopRightDropDowns();
	});
}

/*function setupWorkspaces(){
	workspaces = new Workspaces(this);
	workspaces.init();
}*/

function setupSystemSettings(){
	systemSettings = new SystemSettings(this);
	systemSettings.init();
}

function setupErrorMessage(){
	errorMessage = new ErrorMessage(this);
	errorMessage.init();
}

function setupSystemOverlay(){
	systemOverlay = new SystemOverlay(this);
	systemOverlay.init();
}

function setupSystemMenu(){
	systemMenu = new SystemMenu(this);
	systemMenu.init();
}

function setupLibreSystem(){
	libreSystem = new LibreSystem(this);
	libreSystem.init();
}

function setupSoftwareSystem(){
	softwareSystem = new SoftwareSystem(this);
	softwareSystem.init();
}

function setupNotificationSystem(){
	notificationSystem = new NotificationSystem();
	notificationSystem.init();
}

function setupShutdownSystem(){
	shutdownSystem = new ShutdownSystem();
	shutdownSystem.init();
}

function setupFirefoxSystem(){
	firefoxSystem = new FirefoxSystem(this);
	firefoxSystem.init();
}

function setupMoviePlayerSystem(){
	moviePlayerSystem = new MoviePlayerSystem(this);
	moviePlayerSystem.init();
}

function setupEmailSystem(){
	emailSystem = new EmailSystem(this);
	emailSystem.init();
}

function setupUbuntuOneSystem(){
	ubuntuOneSystem = new UbuntuOneSystem(this);
	ubuntuOneSystem.init();
}

function setupFileSystem(){
	fileSystem = new FileSystem(this);
	fileSystem.init();
}

function setupWelcomeSystem(){
	welcomeSystem = new WelcomeSystem(this);
	welcomeSystem.init();
}

function setupGuidedTourSystem(){
	guidedTourSystem = new GuidedTourSystem(this);
	guidedTourSystem.init();
}

function closeAllWindows($tourIndex){
	var _tourIndex = $tourIndex;
	$('#systemOverlay').hide();
	errorMessage.close();
	firefoxSystem.close();
	emailSystem.close();
	ubuntuOneSystem.close();
	fileSystem.close();
	shotwellSystem.close();
	libreSystem.close('writer');
	libreSystem.close('calc');
	libreSystem.close('impress');
	softwareSystem.close();
	guidedTourSystem.setIndex(_tourIndex);
}

function setupShotwellSystem(){
	fileLibrary.push(new File(fileLibrary.length,'../img/shotwell/library/Buckoff.jpg','photo', _buck_off_title_, _photo_size_,_photo_date_, '/'+_home_folder_+'/'+_pictures_folder_));
	fileLibrary.push(new File(fileLibrary.length,'../img/shotwell/library/DarkeningClockwork.jpg','photo', _darkening_clockwork_title_, _photo_size_,_photo_date_, '/'+_home_folder_+'/'+_pictures_folder_));
	fileLibrary.push(new File(fileLibrary.length,'../img/shotwell/library/DybblsbroStation.jpg','photo', _dybbølsbro_station_title_, _photo_size_,_photo_date_, '/'+_home_folder_+'/'+_pictures_folder_));
	fileLibrary.push(new File(fileLibrary.length,'../img/shotwell/library/FedericaMiglio.jpg','photo', _federica_miglio_title_, _photo_size_, _photo_date_, '/'+_home_folder_+'/'+_pictures_folder_));
	fileLibrary.push(new File(fileLibrary.length,'../img/shotwell/library/JardinPolar.jpg','photo', _jardin_polar_title_, _photo_size_, _photo_date_, '/'+_home_folder_+'/'+_pictures_folder_));
	fileLibrary.push(new File(fileLibrary.length,'../img/shotwell/library/LangelinieAlle.jpg','photo', _langelinie_alle_title_, _photo_size_,_photo_date_, '/'+_home_folder_+'/'+_pictures_folder_));
	fileLibrary.push(new File(fileLibrary.length,'../img/shotwell/library/MomijiDream.jpg','photo', _momiji_dream_title_, _photo_size_,_photo_date_, '/'+_home_folder_+'/'+_pictures_folder_));
	fileLibrary.push(new File(fileLibrary.length,'../img/shotwell/library/MountSnowdon.jpg','photo', _mount_snowdon_title_, _photo_size_,_photo_date_, '/'+_home_folder_+'/'+_pictures_folder_));
	fileLibrary.push(new File(fileLibrary.length,'../img/shotwell/library/NotAlone.jpg','photo', _not_alone_title_, _photo_size_, _photo_date_, '/'+_home_folder_+'/'+_pictures_folder_));
	fileLibrary.push(new File(fileLibrary.length,'../img/shotwell/library/PowerOfWords.jpg','photo', _power_of_words_title_, _photo_size_, _photo_date_, '/'+_home_folder_+'/'+_pictures_folder_));
	fileLibrary.push(new File(fileLibrary.length,'../img/shotwell/library/PurpleDancers.jpg','photo', _purple_dancers_title_, _photo_size_,_photo_date_, '/'+_home_folder_+'/'+_pictures_folder_));
	fileLibrary.push(new File(fileLibrary.length,'../img/shotwell/library/SandMaze.jpg','photo', _sand_maze_title_, _photo_size_,_photo_date_, '/'+_home_folder_+'/'+_pictures_folder_));
	fileLibrary.push(new File(fileLibrary.length,'../img/shotwell/library/SmallFlowers.jpg','photo', _small_flowers_title_, _photo_size_,_photo_date_, '/'+_home_folder_+'/'+_pictures_folder_));
	fileLibrary.push(new File(fileLibrary.length,'../img/shotwell/library/StalkingOcelot.jpg','photo', _stalking_ocelot_title_, _photo_size_, _photo_date_, '/'+_home_folder_+'/'+_pictures_folder_));
	fileLibrary.push(new File(fileLibrary.length,'../img/shotwell/library/TheGrassAintGreener.jpg','photo', _the_grass_aint_greener_title_, _photo_size_, _photo_date_, '/'+_home_folder_+'/'+_pictures_folder_));
	fileLibrary.push(new File(fileLibrary.length,'../img/shotwell/library/WildWheat.jpg','photo', _wildWheat_title_, _photo_size_,_photo_date_, '/'+_home_folder_+'/'+_pictures_folder_));
	
	fileLibrary.push(new File(fileLibrary.length,'../videos/IAmWeAre.flv','video', _introduction_ubuntu_title_, _video_size_, _video_date_, '/'+_home_folder_+'/'+_videos_folder_));
	
	fileLibrary.push(new File(fileLibrary.length,'../audio/preview.mp3','audio', _happyness_title_, _music_size_, _music_date_, '/'+_home_folder_+'/'+_music_folder_));
	
	shotwellSystem = new ShotwellSystem(this);
	shotwellSystem.init();
}

function topShadow($display){
	if($display){
		$('#top').addClass('dropShadow');
		$('#control-buttons').hide();
		$('#top').unbind('mouseover');
		$('#top').unbind('mouseout');
	}else{
		$('#top').removeClass('dropShadow');
		$('#top').bind('mouseover',function(){
			currentSystemSelected = currentSystemSelected.replace(' pie_hover','');
			var currentWindowFullScreen = $('.'+currentSystemSelected).hasClass('fullsize');
			if(!$('#systemOverlay').is(':visible') && currentWindowFullScreen){
				$('#control-buttons').show();
			}
		});
		$('#top').bind('mouseout',function(){
			$('#control-buttons').hide();
		});
	}
}

function blurWindows(){
		var $currentBackground = '';
		var $indexLastSlash = 0;
		var $newBackgroundLink = '';
		for(i in openWindows){
			if(openWindows[i] == true){
				$('#'+i).addClass('blurred');
				$.each($('#'+i+' *'), function(){
					if($(this).is('img')){
						$currentBackground = $(this).attr('src');
						$indexLastSlash = $currentBackground.lastIndexOf('/');
						$newBackgroundLink = $currentBackground.substr(0,$indexLastSlash) + '/blur' + $currentBackground.substr($indexLastSlash);
						$(this).attr('src',$newBackgroundLink);
					}else{
						$currentBackground = $(this).css('background-image');
						if($currentBackground != 'none'){
							 $indexLastSlash = $currentBackground.lastIndexOf('/');
							 $newBackgroundLink = $currentBackground.substr(0,$indexLastSlash) + '/blur' + $currentBackground.substr($indexLastSlash);
							$(this).css('background-image',$newBackgroundLink);
						}
					}
				});
			}
		}
		
		/*$.each($('#menu *'), function(){
			if($(this).is('img')){
				$currentBackground = $(this).attr('src');
				$indexLastSlash = $currentBackground.lastIndexOf('/');
				$newBackgroundLink = $currentBackground.substr(0,$indexLastSlash) + '/blur' + $currentBackground.substr($indexLastSlash);
				$(this).attr('src',$newBackgroundLink);
			}else{
				$currentBackground = $(this).css('background-image');
				if($currentBackground != 'none'){
					 $indexLastSlash = $currentBackground.lastIndexOf('/');
					 $newBackgroundLink = $currentBackground.substr(0,$indexLastSlash) + '/blur' + $currentBackground.substr($indexLastSlash);
					$(this).css('background-image',$newBackgroundLink);
				}
			}
		});*/
		$.each($('#top-right *'), function(){
			if($(this).is('img')){
				$currentBackground = $(this).attr('src');
				$indexLastSlash = $currentBackground.lastIndexOf('/');
				$newBackgroundLink = $currentBackground.substr(0,$indexLastSlash) + '/blur' + $currentBackground.substr($indexLastSlash);
				$(this).attr('src',$newBackgroundLink);
			}else{
				$currentBackground = $(this).css('background-image');
				if($currentBackground != 'none'){
					 $indexLastSlash = $currentBackground.lastIndexOf('/');
					 $newBackgroundLink = $currentBackground.substr(0,$indexLastSlash) + '/blur' + $currentBackground.substr($indexLastSlash);
					$(this).css('background-image',$newBackgroundLink);
				}
			}
		});
		
}

function unblurWindows(){
		var $currentBackground = '';
		var $newBackgroundLink = '';
		for(i in openWindows){
			if(openWindows[i] == true){
				$('#'+i).removeClass('blurred');
				$.each($('#'+i+' *'), function(){
					if($(this).is('img')){
						$currentBackground = $(this).attr('src');
						$newBackgroundLink = $currentBackground.replace('/blur','');
						$(this).attr('src',$newBackgroundLink);
					}else{
						$currentBackground = $(this).css('background-image');
						if($currentBackground != 'none'){
							$newBackgroundLink = $currentBackground.replace('/blur','');
							$(this).css('background-image',$newBackgroundLink)
						}
					}
				});
			}
		}
		
		$.each($('#menu *'), function(){
			if($(this).is('img')){
				$currentBackground = $(this).attr('src');
				$newBackgroundLink = $currentBackground.replace('/blur','');
				$(this).attr('src',$newBackgroundLink);
			}else{
				$currentBackground = $(this).css('background-image');
				if($currentBackground != 'none'){
					$newBackgroundLink = $currentBackground.replace('/blur','');
					$(this).css('background-image',$newBackgroundLink)
				}
			}
		});
		$.each($('#top-right *'), function(){
			if($(this).is('img')){
				$currentBackground = $(this).attr('src');
				$newBackgroundLink = $currentBackground.replace('/blur','');
				$(this).attr('src',$newBackgroundLink);
			}else{
				$currentBackground = $(this).css('background-image');
				if($currentBackground != 'none'){
					$newBackgroundLink = $currentBackground.replace('/blur','');
					$(this).css('background-image',$newBackgroundLink)
				}
			}
		});
}

