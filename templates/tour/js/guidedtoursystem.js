/*
 *  Guided Tour System
 *  author: Anthony Dillon
 */

function GuidedTourSystem($parent){
	var _parent = $parent;
	var _this = this;
	
	var browserfilesGuide;
	var surfthewebGuide;
	var checkemailGuide;
	var viewphotosGuide;
	var findappsGuide;
	var createdocumentsGuide;
	var createpresentation;
	var createspreadsheets;
	var watchVideosGuide;
	var arrowClicked = false;
	
	var welcomeGuide;
	
	var guides;
	var currentIndex = -1;
	var guideCount = 0;
	
	this.init = function(){
		homeGuide = {system:'welcome',icon:null, title:null, desc:'We hope you\'ve enjoyed the Ubuntu online tour. <a href="http://www.ubuntu.com/download/ubuntu/download#tour" target="_blank">Ready to download?</a> or <a href="/ubuntu/take-the-tour" >Back to the site</a>', hash: '#'};
		
		browserfilesGuide = {system:'home',icon:'img/tourguide/file-small.png', title:'Browse files', desc:'It’s quick and easy to access your folders and files from Ubuntu’s home folder.', hash: 'browser-files'};
		surfthewebGuide = {system:'firefox',icon:'img/tourguide/firefox-small.png', title:'Surf the web', desc:'Browsing the web is fast and secure with Ubuntu and Firefox.', hash: 'surf-the-web'};
		checkemailGuide = {system:'email',icon:'img/tourguide/mail-small.png', title:'Check email', desc:'Read, write and send emails with Thunderbird. It’s easy and fast.', hash: 'check-email'};
		viewphotosGuide = {system:'shotwell',icon:'img/tourguide/shotwell-small.png', title:'View photos', desc:'You can upload, organise, edit and share your photos with Shotwell.', hash: 'view-photos'};
		findappsGuide = {system:'software',icon:'img/tourguide/apps-small.png', title:'Find apps', desc:'Search and download apps fast from the Ubuntu Software Centre.', hash: 'find-apps'};
		createdocumentsGuide = {system:'writer',icon:'img/tourguide/document-small.png', title:'Create documents', desc:'LibreOffice Writer makes it easy to draft professional documents.', hash: 'create-documents'};
		createspreadsheets  = {system:'calc',icon:'img/tourguide/calc-small.png', title:'Create spreadsheets', desc:'LibreOffice Calc has everything you need to create clear and accurate spreadsheets.', hash: 'create-spreadsheets'};
		createpresentation = {system:'impress',icon:'img/tourguide/impress-small.png', title:'Create presentations', desc:'Make a good impression with the intuitive LibreOffice Impress presentation tool.', hash: 'create-presentations'};
		watchVideosGuide = {system:'movieplayer',icon:'img/tourguide/impress-small.png', title:'Watch videos', desc:'You can watch all your favourite films and videos, DVDs, downloads or movies youve created yourself.', hash: 'watch-video'};
		
		guides = new Array(browserfilesGuide, surfthewebGuide, checkemailGuide, viewphotosGuide, findappsGuide, createdocumentsGuide, createspreadsheets, createpresentation, watchVideosGuide);
		guideCount = guides.length;
		$('#tour-guide .next-button').bind('click',function(){
			if(!$(this).hasClass('disabled')){
				_this.next();
			}
		});
		
		$('#tour-guide .prev-button').bind('click',function(){
			if(!$(this).hasClass('disabled')){
				_this.prev();
			}
		});
		
		$('#tour-guide .back-to-download').bind('click', function(){
			_parent.errorMessage.open();
		});
		
		this.update();
	}
	
	this.close = function(){
		_parent.closeAllWindows(closeAllWindows);
	}
	
	this.setSystem = function($system){
		if($system == 'email-write'){ $system = 'email'; }
		if(!arrowClicked){
			var found = false;
			for(i = 0; i < guides.length; i++){
				if(guides[i].system == $system){
					this.setCurrentIndex(i);
					found = true;
					break;
				}
			}
			if(!found){ this.setCurrentIndex(-1); }
		}
		
	}
	
	this.setIndex = function($index){
		currentIndex = $index;
	}
	
	this.setCurrentIndex = function($currentIndex, $update){
		currentIndex = $currentIndex;
		this.update();
	}
	
	this.next = function(){
		arrowClicked = true;
		_parent.closeAllWindows(currentIndex);
		if (currentIndex == guideCount -1) {
			currentIndex = 0;
		} else {
			currentIndex++;
		}
		this.update();
		this.updateHash();
		_parent.systemMenu.handleMenuClick(guides[currentIndex].system);
		arrowClicked = false;
	}
	
	this.prev = function(){
		arrowClicked = true;
		_parent.closeAllWindows(currentIndex);
		if (currentIndex == 0) {
			currentIndex = guideCount -1;
		} else {
			currentIndex--;
		}
		this.update();
		this.updateHash();
		_parent.systemMenu.handleMenuClick(guides[currentIndex].system);
		arrowClicked = false;
	}
	
	this.update = function(){
		$('#tour-guide .guide-container').hide();
		
		if(currentIndex == -1){
			$('#tour-guide .prev-button').hide();
			$('#tour-guide .next-button').hide();
			$('#tour-guide .welcome').show();
		}else{
			$('#tour-guide .'+guides[currentIndex].system).show();
			$('#tour-guide .prev-button').show();
			$('#tour-guide .next-button').show();
		}
	}

	this.updateHash = function() {
		window.location.hash = guides[currentIndex].hash;
	}
}
