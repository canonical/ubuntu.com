/*
* System Overlay
*  author: Anthony Dillon
*/

function SystemOverlay($parent){
	 
	var _parent = $parent;
	var _this = this;
	var menu_open = false;
	var contentsWidth = 0;
	var mediaApps;
	var internetApps;
	var moreApps;
	var downloadApps;
	this.totalApps;
	var fileList, lastOpenWindow;
	var searching = false;
	
	this.init = function(){
		downloadApps = new Array({name:_chromium_app_,image:'img/software-centre/logo-chromium.png'},
															  {name:_beep_app_,image:'img/software-centre/logo-beep.png' },
															  {name:_inkscape_app_,image:'img/software-centre/logo-inkscape.png'},
															  {name:_world_of_goo_app_,image:'img/software-centre/logo-world-of-goo.png'},
															  {name:_blender_app_, image:'img/software-centre/logo-blender.png'},
															  {name:_braid_app_,image:'img/software-centre/logo-braid.png'});
															  
		mediaApps = new Array({name:_banshee_app_,image:'banshee.png'},
															  {name:_brasero_app_,image:'brasero.png' },
															  {name:_movie_player_app_,image:'movieplayer.png'},
															  {name:_shotwell_app_,image:'shotwell.png'},
															  {name:_pitivi_app_, image:'pitivi.png'},
															  {name:_sound_recorder_app_,image:'soundrecorder.png'});
															  
		internetApps = new Array({name:_empathy_app_,image:'empathy.png'},
																  {name:_thunderbird_app_,image:'thunderbird.png' },
																  {name:_firefox_app_,image:'firefox.png'},
																  {name:_gwibber_app_, image:'gwibber.png'},
																  {name:_remote_desktop_app_,image:'remotedesktop.png'},
																  {name:_terminal_app_, image:'terminalserver.png'});

		moreApps = new Array({name:_about_me_app_,image:'aboutme.png'},
														    {name:_additional_drivers_app_,image:'additionaldrivers.png' },
														    {name:_aisleroit_app_,image:'solitaire.png'},
														    {name:_appearance_app_, image:'appearance.png'},
														    {name:_bluetooth_app_,image:'bluetooth.png'});	
														    
		this.totalApps = mediaApps.concat(internetApps, moreApps);
		$('#systemOverlay input').val(_search_);
		this.setupTopControl();
	}
	
	this.open = function(){
		_parent.closeTopRightDropDowns();
		if(menu_open){
			_this.closeOverlay();
		}else{
			_this.openOverlay();
		}
		this.resize();
	}
	
	this.setupTopControl = function(){
		$('#systemOverlay .copyDash').bind('click',function(event){
				_this.closeOverlay();
		});
		
		$('#top #top-left #dash-control-buttons .close').bind('click',function(event){
				_this.closeOverlay();
		});
		
		$('#systemOverlay input').keyup(function(){
			_this.appSearch($(this).val());
		});
		
		this.resize();
		
		
		$('#systemOverlay #dash-bottom-bar .bottom-wrapper div').click(function(){
			$('#systemOverlay #dash-bottom-bar .bottom-wrapper div').removeClass('active');
			switch($(this).attr('class').replace(' last','')){
				case 'home-icon':
					_this.showHome();
				break;
				case 'applications-icon':
					_this.displayApps();
				break;
				case 'files-icon':
					_this.displayFindApps();
				break;
				case 'music-icon':
					_this.displayMusic();
				break;
				case 'video-icon':
					_this.displayVideo();
				break;
			}
			$(this).addClass('active');
			
		});
		
		var search_input = $('#systemOverlay input');
	
		search_input.focus(function() {
			if ($(this).val() == _search_) {
				$(this).val('');
				$(this).css('font-style', 'normal');
				$(this).css('color', '#fff');
			}
		});
		search_input.blur(function() {
			if ($(this).val() == '') {
				$(this).val(_search_);
				$(this).css('font-style', 'italic');
				$(this).css('color', '#aaa');
				_this.reset();
			}
		});
	}
	
	this.removeApps = function($name){
		for(var i = 0; i < this.totalApps.length; i++){
			if( this.totalApps[i].name == $name){
				this.totalApps.splice(i,1);
				break;
			}
		}
	}
	
	this.appSearch = function($query){
		if($query != ''){
			var listFilesContents = '';
			fileList = _parent.fileSystem.getFiles();
			var listContents = '';
			var i = this.totalApps.length;
			var tempArray = new Array();
			var patt1 = new RegExp($query,"gi");
			while(i--){
				tempArray = this.totalApps[i].name.match(patt1);
				if(tempArray != null){
					if(this.totalApps[i].image.substr(0,7) == '../img/'){
						listContents += '<div><img src="'+this.totalApps[i].image+'" /><p>'+this.totalApps[i].name+'</p></div>';
					}else{
						listContents += '<div><img src="../img/applications/'+this.totalApps[i].image+'" /><p>'+this.totalApps[i].name+'</p></div>';
					}
				}
			}
			for(var i = 0; i < fileList.length; i++){
				tempArray = fileList[i].name().match(patt1);
				if(tempArray != null){
					listFilesContents += this.getDisplayIcon(fileList[i], i);
				}
			}
			
			this.hideAll();
			$('#systemOverlay #display-search .files .app-list').html(listFilesContents);
			$('#systemOverlay #display-search .applications .app-list').html(listContents);
			
			$('#systemOverlay #display-search').show();
			$('#systemOverlay .app-container .app-list div').bind('mouseover', function(){
				$('img',this).addClass('hover');
			});
			$('#systemOverlay .app-container .app-list div').bind('mouseout', function(){
				$('img',this).removeClass('hover');
			});
			$('#systemOverlay .app-container .applications .app-list div').bind('click', function(){
				var download = false;
				if($(this).attr('data-type') == 'download'){ download = true; }
				_this.appClicked($('img', this).attr('src'), download);
			});
			$('#systemOverlay .app-container .files .app-list div').bind('click', function(){
				_this.fileClicked($(this).attr('data-id'));
			});
		}else{
			this.showHome();
		}
	}
	
	this.getDisplayIcon = function($object, $i){
		switch($object.type()){
			case 'folder':
				return  '<div data-id="'+$i+'"><img src="../img/applications/folder.png" /><p>'+$object.name()+'</p></div>';
			break;
			case 'audio':
				return  '<div data-id="'+$i+'"><img src="../img/applications/audio.png" /><p>'+$object.name()+'</p></div>';
			break;
			case 'video':
				return '<div data-id="'+$i+'"><img src="../img/'+$object.url().replace('flv','jpg').replace('../','')+'" /><p>'+$object.name()+'</p></div>';
			break;
			case 'photo':
				return  '<div data-id="'+$i+'"><img src="'+$object.url()+'" /><p>'+$object.name()+'</p></div>';
			break;
			default:
				return  '<div data-id="'+$i+'"><img src="../img/applications/unknown.png" /><p>'+$object.name()+'</p></div>'; 
			break;
		}
	}
	
	this.hideAll = function(){
		$('#systemOverlay #overlayContents #display-home').hide();
		$('#systemOverlay #overlayContents #display-apps').hide();
		$('#systemOverlay #overlayContents #display-find-files').hide();
		$('#systemOverlay #overlayContents #display-search').hide();
		$('#systemOverlay #overlayContents #display-find-music').hide();
		$('#systemOverlay #overlayContents #display-find-video').hide();
	}
	
	this.showHome = function(){
		$('#systemOverlay #overlayContents #display-apps').hide();
		$('#systemOverlay #overlayContents #display-find-files').hide();
		$('#systemOverlay #overlayContents #display-search').hide();
		$('#systemOverlay #overlayContents #display-find-music').hide();
		$('#systemOverlay #overlayContents #display-find-video').hide();
		$('#systemOverlay #overlayContents #display-home').show();
	}
	
	this.displayHome = function(){
		var mostUsedArray;
		var listContents = '';
		var mostUsedContents = '';
		var downloadedContents = '';
		var appArray = this.totalApps;
		mostUsedArray = appArray.slice();
		mostUsedArray.sort(this.randOrd);
		downloadApps.sort(this.randOrd);
		fileList = _parent.fileSystem.getFiles();
		for(var i = 0; i < appArray.length; i++){
			if(appArray[i].image.substr(0,7) == '../img'){
				listContents += '<div><img src="'+appArray[i].image+'" /><p>'+appArray[i].name+'</p></div>';
			}else{
				listContents += '<div><img src="../img/applications/'+appArray[i].image+'" /><p>'+appArray[i].name+'</p></div>';
			}
		}
		for(var i = 0; i < fileList.length; i++){
			if(fileList[i].type() != 'folder'){
				mostUsedContents += this.getDisplayIcon(fileList[i], i);
			}
		}
		var i = fileList.length;
		while(i--){
			if(fileList[i].type() != 'folder'){
				downloadedContents += this.getDisplayIcon(fileList[i], i);
			}
		}
		$('#systemOverlay #display-home .recent-apps .app-list').html(listContents);
		$('#systemOverlay #display-home .recent-files .app-list').html(mostUsedContents);
		$('#systemOverlay #display-home .downloads .app-list').html(downloadedContents);
		$('#systemOverlay #display-find-files .downloads .app-list').html(downloadedContents);
		
		$('#systemOverlay .app-container .app-list div').bind('mouseover', function(){
			$('img',this).addClass('hover');
		});
		$('#systemOverlay .app-container .app-list div').bind('mouseout', function(){
			$('img',this).removeClass('hover');
		});
		$('#systemOverlay #display-home .recent-apps .app-list div').bind('click', function(){
			_this.appClicked($('img', this).attr('src'), ($(this).attr('data-type') == 'download'));
		});
		$('#systemOverlay #display-home .recent-files .app-list div').bind('click', function(){
			_this.fileClicked($(this).attr('data-id'));
		});
		$('#systemOverlay #display-home .downloads .app-list div').bind('click', function(){
			_this.fileClicked($(this).attr('data-id'));
		});
		
	}
	
	this.displayApps = function($type){
		this.hideAll();
		var appArray;
		var mostUsedArray;
		var listContents = '';
		var mostUsedContents = '';
		var downloadableContents = '';
		if($type == 'media'){
			appArray = mediaApps;
		}else if($type == 'internet'){
			appArray = internetApps;
		}else if($type == 'more'){
			appArray = moreApps;
		}else{
			appArray = this.totalApps;
		}
		mostUsedArray = appArray.slice();
		mostUsedArray.sort(this.randOrd);
		downloadApps.sort(this.randOrd);
		for(var i = 0; i < appArray.length; i++){
			if(appArray[i].image.substr(0,4) == 'img/'){
				listContents += '<div><img src="../'+appArray[i].image+'" /><p>'+appArray[i].name+'</p></div>';
			}else{
				listContents += '<div><img src="../img/applications/'+appArray[i].image+'" /><p>'+appArray[i].name+'</p></div>';
			}
		}
		for(var i = 0; i < mostUsedArray.length; i++){
			if(mostUsedArray[i].image.substr(0,4) == 'img/'){
				mostUsedContents += '<div><img src="../'+mostUsedArray[i].image+'" /><p>'+mostUsedArray[i].name+'</p></div>';
			}else{
				mostUsedContents += '<div><img src="../img/applications/'+mostUsedArray[i].image+'" /><p>'+mostUsedArray[i].name+'</p></div>';
			}
		}
		for(var i = 0; i < downloadApps.length; i++){
			if(downloadApps[i].image.substr(0,4) == 'img/'){
				downloadableContents += '<div data-type="download"><img src="../'+downloadApps[i].image+'" /><p>'+downloadApps[i].name+'</p></div>';
			}else{
				downloadableContents += '<div data-type="download"><img src="../img/applications/'+downloadApps[i].image+'" /><p>'+downloadApps[i].name+'</p></div>';
			}
		}
		$('#systemOverlay #display-home').hide();
		$('#systemOverlay #display-apps .available .app-list').html(downloadableContents);
		$('#systemOverlay #display-apps .installed .app-list').html(listContents);
		$('#systemOverlay #display-apps .frequently .app-list').html(mostUsedContents);
		$('#systemOverlay #display-apps').show();
		$('#systemOverlay .app-container .app-list div').bind('mouseover', function(){
			$('img',this).addClass('hover');
		});
		$('#systemOverlay .app-container .app-list div').bind('mouseout', function(){
			$('img',this).removeClass('hover');
		});
		$('#systemOverlay .app-container .app-list div').bind('click', function(){
			_this.appClicked($('img', this).attr('src'), ($(this).attr('data-type') == 'download'));
		});
	}
	
	this.randOrd = function(){
		return (Math.round(Math.random())-0.5); 
	} 
	
	this.displayMusic = function(){
		this.hideAll();
		var songsContents = '';
		var albumsContents = '';
		fileList = _parent.fileSystem.getFiles();
		for(var i = 0; i < fileList.length; i++){
			if(fileList[i].type() == 'audio'){
				songsContents += this.getDisplayIcon(fileList[i], i);
			}
		}
		$('#systemOverlay #display-find-music .songs .app-list').html(songsContents);
		$('#systemOverlay #display-find-music .albums  .app-list').html(albumsContents);
		$('#systemOverlay #display-home').hide();
		$('#systemOverlay #display-find-music').show();
		$('#systemOverlay .app-container .app-list div').bind('mouseover', function(){
			$('img',this).addClass('hover');
		});
		$('#systemOverlay .app-container .app-list div').bind('mouseout', function(){
			$('img',this).removeClass('hover');
		});
		$('#systemOverlay .app-container .app-list div').bind('click', function(){
			_this.appClicked($('img', this).attr('src'), ($(this).attr('data-type') == 'download'));
		});
	}
	
	this.displayVideo = function(){
		this.hideAll();
		var videosContents = '';
		fileList = _parent.fileSystem.getFiles();
		for(var i = 0; i < fileList.length; i++){
			if(fileList[i].type() == 'video'){
				videosContents += this.getDisplayIcon(fileList[i], i);
			}
		}
		$('#systemOverlay #display-find-video .videos .app-list').html(videosContents);
		$('#systemOverlay #display-home').hide();
		$('#systemOverlay #display-find-video').show();
		$('#systemOverlay .app-container .app-list div').bind('mouseover', function(){
			$('img',this).addClass('hover');
		});
		$('#systemOverlay .app-container .app-list div').bind('mouseout', function(){
			$('img',this).removeClass('hover');
		});
		$('#systemOverlay .app-container .app-list div').bind('click', function(){
			_this.fileClicked($(this).attr('data-id'));
		});
	}
	
	this.displayFindApps = function(){
		this.hideAll();
		var listFilesContents = '';
		var listFolderContents = '';
		fileList = _parent.fileSystem.getFiles();
		for(var i = 0; i < fileList.length; i++){
			if(fileList[i].type() == 'folder'){
				listFolderContents += this.getDisplayIcon(fileList[i], i);
			}else{
				listFilesContents += this.getDisplayIcon(fileList[i], i);
			}
		}
		$('#systemOverlay #display-find-files .folders .app-list').html(listFolderContents);
		$('#systemOverlay #display-find-files .files .app-list').html(listFilesContents);
		$('#systemOverlay #display-home').hide();
		$('#systemOverlay #display-find-files').show();
		$('#systemOverlay .app-container .app-list div').bind('mouseover', function(){
			$('img',this).addClass('hover');
		});
		$('#systemOverlay .app-container .app-list div').bind('mouseout', function(){
			$('img',this).removeClass('hover');
		});
		$('#systemOverlay .app-container .app-list div').bind('click', function(){
			_this.fileClicked($(this).attr('data-id'));
		});
	}
	
	this.fileClicked = function($fileID){
		var fileObject = fileList[$fileID];
		switch(fileObject.type()){
			case 'folder':
				_this.closeOverlay();
				_parent.fileSystem.reset(!_parent.fileSystem.isMinified());
				_parent.fileSystem.updateDir(fileObject.location()+'/'+fileObject.name());
				_parent.fileSystem.open();
			break;
			case 'photo':
				_this.closeOverlay();
				_parent.shotwellSystem.selectImage(fileObject.id());
			  	_parent.shotwellSystem.open();
			break;
			case 'video':
				_this.closeOverlay();
			  	_parent.moviePlayerSystem.open();
			  	_parent.moviePlayerSystem.addVideo();
			break;
			default:
				_this.closeOverlay();
				_parent.errorMessage.open();
			break;
		}
	}
	
	this.appClicked = function($appName, $download){
		_this.closeOverlay();
		var appName = $appName.substring($appName.lastIndexOf('/')+1, $appName.length - 4);
		if($download){
			appName = appName.replace('logo-','');
			if(appName == 'world-of-goo'){ appName = 'worldofgoo'; }
			_parent.softwareSystem.open(appName);
		}else{
			switch(appName){
				case 'shotwell':
					_parent.systemMenu.handleMenuClick('shotwell');
				break;
				case 'thunderbird':
					_parent.systemMenu.handleMenuClick('email');
				break;
				case 'firefox':
					_parent.systemMenu.handleMenuClick('firefox');
				break;
				case 'movieplayer':
					_parent.moviePlayerSystem.open();
				break;
				default:
					_parent.errorMessage.open();
				break;
			}
		}
		
	}
	
	this.reset = function(){
		$('#systemOverlay input').val(_search_);
		$('#systemOverlay input').css('font-style', 'italic');
		$('#systemOverlay input').css('color', '#aaa');
		this.hideAll();
		$('#systemOverlay #display-home').show();
		$('#systemOverlay #dash-bottom-bar .bottom-wrapper div').removeClass('active');
		$('#systemOverlay #dash-bottom-bar .bottom-wrapper .home-icon').addClass('active');
	}
	
	this.hide = function(){
		_parent.unblurWindows();
		$('#systemOverlay').hide();
		_this.reset();
	}
	
	this.openOverlay = function(){
		$('#top').addClass('dashOpen');
		$('#menu').addClass('dashOpen');
		$('#top').removeClass('dropShadow');
		menu_open = true;
		this.reset();
		this.displayHome();
		$('#top #top-button-bg').addClass('open');
		$('#systemOverlay').fadeTo(300, 1, _parent.blurWindows);
		$('#systemOverlay input').focus();
	}
	
	this.closeOverlay = function(){
		$('#top').removeClass('dashOpen');
		$('#menu').removeClass('dashOpen');
		$('#top').addClass('dropShadow');
		menu_open = false;
		$('#top #top-button-bg').removeClass('open');
		$('#systemOverlay').fadeTo(300, 0, function(){
			_this.hide();
		});
		 $('#systemOverlay .app-container .app-list div').unbind('mouseover');
		 $('#systemOverlay .app-container .app-list div').unbind('mouseout');
		 $('#systemOverlay .app-container .app-list div').unbind('click');
		 $('#menu .dash .selected-window-arrow').hide();
		 $('#menu .' + _parent.systemMenu.getSelectedMenu() + ' .selected-window-arrow').show();
	}
	
	this.resize = function(){
		$('#systemOverlay  .bottom-wrapper').css('left',($('#dash-bottom-bar').width() / 2) - ($('#dash-bottom-bar .bottom-wrapper').width() / 2));
		$('#systemOverlay').css('height',$(document).height() - 50);
		$('#systemOverlay input').css('width',$('#dash-bottom-bar').width() - 250);
	}
}
