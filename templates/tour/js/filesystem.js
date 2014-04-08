/*
* File system
* author: Anthony Dillon
*/

function FileSystem($parent, $startingDir){
	
	var _parent = $parent;
	var home = '/'+_home_folder_;
	if($startingDir == undefined){ $startingDir = home; }
	var current_dir = $startingDir;
	var list_of_files = new Array();
	var dir_history = new Array();
	var history_index = -1;
	var folderContents = '';
	var _this = this;
	var itemCount = 0;
	var folder_index = -1;
	var minified = false;
	var maximised = false;
	var dragging = false;
	var name = _home_folder_;
	var _isOpen = false;
	var list_type = 'display-icon';
	var openedID = -1;
	
	var folderContentsHeight = 0;
	var folderContentsWidth = 0;
	
	this.init = function(){
		
		list_of_files.push(new Folder(_documents_folder_, '/'+_home_folder_));
		list_of_files.push(new Folder(_downloads_folder_, '/'+_home_folder_));
		list_of_files.push(new Folder(_music_folder_, '/'+_home_folder_));
		list_of_files.push(new Folder(_videos_folder_, '/'+_home_folder_));
		list_of_files.push(new Folder(_pictures_folder_, '/'+_home_folder_));
		list_of_files.push(new Folder(_desktop_folder_, '/'+_home_folder_));
		
		
		list_of_files.push(new Folder(_canonical_folder_, '/'+_home_folder_+'/'+_documents_folder_));
		list_of_files.push(new Folder(_backup_folder_, '/'+_home_folder_+'/'+_documents_folder_));
		list_of_files.push(new Folder(_local_folder_, '/'+_home_folder_+'/'+_documents_folder_));
		
		list_of_files.push(new Folder(_work_folder_, '/'+_home_folder_+'/'+_documents_folder_+'/'+_canonical_folder_));
		list_of_files.push(new Folder(_branches_folder_, '/'+_home_folder_+'/'+_documents_folder_+'/'+_canonical_folder_));
		
		list_of_files = list_of_files.concat(_parent.fileLibrary);
		
		this.setupControl();
	}
	
	this.setupControl = function(){
		$('.folder .control .close').click(function(){
			_this.close();
		});
		$('.folder .control .min').click(function(){
			if(maximised){ _parent.systemSettings.decreaseFullscreen(); }
			$('.folder').hide();
			_parent.systemMenu.wiggle('home');
			minified = true;
		});
		
		$('.folder .control .max').click(function(){
			if(maximised){
				maximised = false;
				$('.folder').css('height','500px');
				$('.folder').css('width','730px');
				$('.folder').removeClass('fullsize');
				_parent.systemSettings.decreaseFullscreen();
			}else{
				maximised = true;
				$('.folder').css('height',$(document).height() - 50 + 'px');
				$('.folder').css('width',$(document).width() - 70 + 'px');
				$('.folder').addClass('fullsize');
				_parent.systemSettings.increaseFullscreen();
			}
			_this.resize();
			_this.center();
		});
		
		$('#folder-window .folder-list .list ul li').click(function(){
			$('#folder-window .folder-list .list ul li').removeClass('selected');
			$(this).addClass('selected');
			var fresh = true;
			 var index = $(this).attr('data-folder');
			 var newDir = '';
			 if(index == 'home'){
			 	newDir = '/'+_home_folder_;
			 }else if(index == 'bin'){
			 	newDir = '/'+_rubbish_bin_folder_;
			 	fresh = false;
			 }else{
		  		newDir = list_of_files[index].location()+'/'+list_of_files[index].name();
		  	}
	  		_this.clickedNewFolder(newDir);
		 	_this.updateDir(newDir,fresh);
		});
		
		this.updateDir(current_dir);
		this.center();
	}
	
	this.reset = function($full){
		if($full){
			current_dir = '/'+_home_folder_;
			dir_history = new Array();
			history_index = -1;
			folderContents = '';
			itemCount = 0;
			folder_index = -1;
			minified = false;
		}
		this.updateDir(current_dir);
	}
	
	this.open = function(){
		$('.folder').show();
		_isOpen = true;
		if($('css3-container').length > 0){
        	$('.folder').prev().css('top', $('.folder').css('top'));
        	$('.folder').prev().css('left', $('.folder').css('left'));
        }
	}
	
	this.isMinified = function(){ return minified; }
	this.isMaximised = function(){ return maximised; }
	this.in_bin = function (){ return _in_bin; };
	
	this.close = function(){
		if(_isOpen){
			_parent.openWindows['folder-window'] = false;
			if(maximised){ _parent.systemSettings.decreaseFullscreen(); }
			$('.folder').hide();
			_parent.systemMenu.closeWindow('home');
			$('.folder').removeClass('fullsize');
			_this.resize();
			_this.center();
			_isOpen = false;
			minified = false;
			maximised = false;
		}
	}
	
	this.isOpen = function(){
		return _isOpen;
	}
	
	this.setupFolderControl = function(){
		$('.folder-contents .contents div').mouseover(function() {
		  	$(this).addClass("over");
		});
		
		/*$('.folder-contents .contents div').draggable({ 
			revert: true, 
			opacity: 0.35, 
			zIndex: 2700, 
			start: function(event, ui) { 
				//_parent.lockOpenMenu();
		 	},
		 	end: function(event, ui) { 
				//_parent.lockCloseMenu();
		 	}
		 });*/
		
		$('.folder-contents .contents div').mouseout(function() {
			$(this).removeClass("over");
		});
		
		$('.folder-contents .contents').mousedown(function(){
			$('.folder-contents .contents div').removeClass("selected");
			$('.selected-details').hide();
		 });
			 
		$('.folder-contents .contents div').mousedown(function(event) {
			event.stopPropagation();
			$('.folder-contents .contents div').removeClass("selected");
		  	$(this).addClass("selected");
		  	_this.showSelectedDetails(parseInt($(this).attr('data-id')));
		});
		
		$('.folder-contents .contents div').dblclick(function() {
			  openedID = $(this).attr('data-id');
			  switch($(this).attr('data-type')){
			  	case 'folder':
			  		var newDir = current_dir+'/'+list_of_files[openedID].name();
			  		_this.clickedNewFolder(newDir);
				 	_this.updateDir(newDir);
			  	break;
			  	case 'photo':
			  		_parent.shotwellSystem.selectImage(list_of_files[$(this).attr('data-id')].id());
			  		_parent.shotwellSystem.open();
			  	break;
			  	case 'video':
			  		//_parent.shotwellSystem.selectImage(list_of_files[$(this).attr('data-id')].id());
			  		_parent.moviePlayerSystem.open();
			  		_parent.moviePlayerSystem.addVideo();
			  	break;
			  	case 'audio':
			  		_parent.errorMessage.open();
			  	break;
			  	default:
					_parent.errorMessage.open();
			  	break;
			  }
		 
	 	 });
	}
	
	this.showSelectedDetails = function($index){
		var detailsName = list_of_files[$index].name();
		var detailsCount = 0;
		if(list_of_files[$index].type() == 'folder'){
			var i = list_of_files.length;
			while(i--){
				if(list_of_files[i].location() == list_of_files[$index].location()+'/'+detailsName){
					detailsCount++;
				}
			}
			$('.selected-details').text('"'+detailsName+'" selected (containing '+detailsCount+' items)');
		}else{
			$('.selected-details').text('"'+detailsName+'" selected ('+list_of_files[$index].size()+')');
		}
		
		$('.selected-details').show();
	}
	
	this.setupBreadcrumbControl = function(){
		$('.folder-contents .bottom-buttons div').bind('click',function() {
		  	$(this).addClass("selected");
		  	var index = $(this).attr('data-id');
		  	_this.history_index = index;
			_this.updateDir(dir_history[index]);
		});
	}
	
	this.clickedNewFolder = function(){
		var dirExists = $.inArray(current_dir, dir_history);
		if(dirExists > -1){
			var i = (dir_history.length - 1) - dirExists;
			while(i--){ dir_history.pop()  }
		}
		$('.selected-details').hide();
	}
	
	this.refresh = function (){
		itemCount = 0;
		$('.folder-contents .contents').html('');
		folderContents = '';
		var i = list_of_files.length;
		while(i--){
			if(list_of_files[i].location() == current_dir){
				folderContents +=  list_of_files[i].drawIcon(i,list_type);
				itemCount++;
			}
		}
		
		$('.folder-contents .contents').html(folderContents);
		$('.folder-contents .bottom-buttons div').unbind('click');
		var breadcrumb = '';
		for(i = 0; i < dir_history.length; i++ ){
			var dir_name = dir_history[i].split('/');
			dir_name = dir_name[dir_name.length-1];
			if(i == 0){dir_name = '<img src="../img/folder/home-icon.png"/>' + dir_name}
			if($.trim(dir_name) == 'Desktop'){dir_name = '<img src="../img/folder/desktop-icon.png"/>' + dir_name}
			if(i == history_index){
				breadcrumb += '<div data-id="'+i+'" class="selected">'+dir_name+'</div>';
			}else{
				breadcrumb += '<div data-id="'+i+'">'+dir_name+'</div>';
			}
		}
		dir_name = dir_history[history_index].split('/');
		dir_name = dir_name[dir_name.length-1];
		$('.folder-contents .bottom-buttons').html(breadcrumb);
		$('.folder .window-title').text(dir_name);
		this.setupBreadcrumbControl();
		this.setupFolderControl();
	}
	
	this.getFiles = function(){
		return list_of_files;
	}
	
	this.backDir = function(){
		history_index--;
		this.updateDir(dir_history[history_index]);
	}
	
	this.forwardDir = function(){
		history_index++;
		this.updateDir(dir_history[history_index]);
	}
	
	this.updateDir = function($newDIr, $sidebar){
		var tempArray = $newDIr.split('/');
		var sidebarName = tempArray[tempArray.length - 1].toLowerCase();
		if(sidebarName == 'rubbish bin'){ sidebarName = 'rubbish' };
		if($sidebar == undefined){
			$('#folder-window .folder-list .list ul li').removeClass('selected');
			$('#folder-window .folder-list .list ul li[data-folder="'+openedID+'"]').addClass('selected');
		}
		
		
		current_dir = $newDIr;
		if($sidebar == undefined){ $sidebar = false; }
		var dirExists = $.inArray($newDIr, dir_history);
		
		if(dirExists > -1){
			history_index = dirExists;
		} else{
			if($sidebar){
				history_index = 1;
				dir_history = new Array('/'+_home_folder_, $newDIr);
			}else{
				if(current_dir.split('/').length > 2){
					history_index++;
					dir_history.push($newDIr);
				}else{
					history_index = 0;
					dir_history = new Array();
					dir_history.push($newDIr);
				}
			}
		}
		if(history_index > 0){
			this.backButton(true);
		}else{
			this.backButton(false);
		}
		if(history_index < dir_history.length -1){
			this.forwardButton(true);
		}else{
			this.forwardButton(false);
		}
		this.refresh();
	}
		
	this.backButton = function($enable){
		if($enable){
			if($('.buttons .folder-back').hasClass('disabled')){
				$('.buttons .folder-back').bind('click',function() { _this.backDir(); });
				$('.buttons .folder-back').removeClass('disabled');
			}
		}else{
			if(!$('.buttons .folder-back').hasClass('disabled')){
				$('.buttons .folder-back').unbind('click');
				$('.buttons .folder-back').addClass('disabled');
			}
		}
	}
	this.forwardButton = function($enable){
		if($enable){
			if($('.buttons .folder-forward').hasClass('disabled')){
				$('.buttons .folder-forward').bind('click',function() { _this.forwardDir(); });
				$('.buttons .folder-forward').removeClass('disabled');
			}
		}else{
			if(!$('.buttons .folder-forward').hasClass('disabled')){
				$('.buttons .folder-forward').unbind('click');
				$('.buttons .folder-forward').addClass('disabled');
			}
		}
	}
	
	this.center = function(){
	    	var left = ($(document).width() / 2) - ($('.folder').width() / 2);
			var top = Math.max(24,($(document).height() / 2) - ($('.folder').height() / 2));
			$('.folder').css('left',left);
			$('.folder').css('top',top);
	    }
	
	this.resize = function(){
		folderContentsWidth = $('.folder').width() - 146;
		folderListHeight = $('.folder').height() - 51;
		$('.folder .folder-list .list').css('height',folderListHeight);
		$('.folder .folder-contents .contents').css('height',folderListHeight - 15);
		$('.folder .folder-contents .contents').css('width',folderContentsWidth);
	}
}

