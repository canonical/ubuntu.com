/*
 *  Shotwell System
 *  author: Anthony Dillon
 */

function ShotwellSystem($parent){
	
	var _parent = $parent;
	var _this = this;
	var _isOpen = false;
	var maximised = false;
	var resizeWidth = 60;
	var imageCount = 0;
	var imageMin = 72;
	var imageMax = 360;
	var columns = 0;
	var currentPercent = 0.3;
	var currentIndex = 0;
	
	this.init = function(){
		columns = Math.floor($('#shotwell .container .images').width() / 158);
		imageCount = _parent.fileLibrary.length - 2;
		this.setupControl();
	}
	
	this.setupControl = function(){
		$('#shotwell  .control .close').click(function(){
			_this.close();
		});
		$('#shotwell  .control .min').click(function(){
			_this.min();
		});
		
		$('#shotwell  .control .max').click(function(){
			if(maximised){
				maximised = false;
				$('#shotwell').css('width','800px');
				$('#shotwell').css('height','550px');
				$('#shotwell ').removeClass('fullsize');
				_parent.systemSettings.decreaseFullscreen();
			}else{
				maximised = true;
				$('#shotwell').css('width',$(document).width() - 70 + 'px');
				$('#shotwell').css('height',$(document).height() - 50 + 'px');
				$('#shotwell ').addClass('fullsize');
				_parent.systemSettings.increaseFullscreen();
			}
			_this.resize();
		});
		
		$('#shotwell .nav ul').click(function(){
			$(this).addClass('selected');
			$('#shotwell .container .images').removeClass('singleImage');
			$('#shotwell .container .tools .jump-image').hide();
			$('#shotwell .container .tools .slider-container').show();
			$('#shotwell .sidebar .details .overall').show();
			$('#shotwell .sidebar .details .single').hide();
			_this.display();
			_this.sliderUpdate(currentPercent);
		});
		
		$('#shotwell .container .tools .jump-image .next').bind('click',function(){
			if(!$(this).hasClass('disabled')){
				currentIndex++;
				_this.updateImageDetails(currentIndex);
				_this.display(currentIndex);
				_this.checkNextPrev();
			}
		});
		
		$('#shotwell .container .tools .jump-image .prev').bind('click',function(){
			if(!$(this).hasClass('disabled')){
				currentIndex--;
				_this.updateImageDetails(currentIndex);
				_this.display(currentIndex);
				_this.checkNextPrev();
			}
		});
		
		$('#shotwell .container .tools .slider-container .slider').slider({
			min: 0,
			max: 100,
			step: 1,
			value: 30,
			slide: function(event, ui) {
				_this.getSliderValueAndUpdate($(this));
			},
			change: function(event, ui) {
				_this.getSliderValueAndUpdate($(this));
			}
		});
		
		$('#shotwell .container .images').click(function(){
			$('#shotwell .nav ul').removeClass('selected');
			$('#shotwell .container .images img').removeClass('selected');
			$('#shotwell .sidebar .details .overall').show();
			$('#shotwell .sidebar .details .single').hide();
		});
		
		$('#shotwell .sidebar .details .single').hide();
		$('#shotwell .container .tools .jump-image').hide();
		this.display();
		this.sliderUpdate(currentPercent,1);
		this.center();
	}
	
	this.getSliderValueAndUpdate = function(slider) {
		var currentPercent = slider.slider('option', 'value') / 100;
		_this.sliderUpdate(currentPercent);
	}
	
	this.checkNextPrev = function(){
		$('#shotwell .container .tools .jump-image div').removeClass('disabled');
		if(currentIndex <= 0){
			$('#shotwell .container .tools .jump-image .prev').addClass('disabled');
		}
		if(currentIndex >= imageCount -1){
			$('#shotwell .container .tools .jump-image .next').addClass('disabled');
		}
	}
	
	this.sliderUpdate = function($percent, $firsttime){
		var containerWidth = $('#shotwell .container .images').width() - 15;
		var active = $('#shotwell .container .tools .slider-container .slider .ui-slider-handle').position();
		if($firsttime != undefined){ active = '60.45px; '}
		$('#shotwell .container .tools .slider-container .slider-active').css('width', active.left);
		
		var imageWidth = Math.floor(((imageMax - imageMin) * $percent) + imageMin) - 5;
		$('#shotwell .container .images img').css('width',imageWidth);
		
		columns = Math.min(imageCount, Math.floor(containerWidth/ imageWidth));
		var imageDivsWidth = Math.floor(containerWidth / columns)
		$('#shotwell .container .images div').css('width',imageDivsWidth+'px');
	}
	
	this.display = function($imageIndex){
		
		var imagesHTML = '';
		if($imageIndex == undefined){
			for(var i = 0; i < imageCount; i++){
				if(_parent.fileLibrary[i].type() == 'photo'){
					imagesHTML += '<div><img src="'+_parent.fileLibrary[i].url()+'" alt="'+_parent.fileLibrary[i].name()+'" id="'+i+'"  /></div>';
				}
			}
		}else{
			imagesHTML += '<div class="large"><img src="'+_parent.fileLibrary[$imageIndex].url()+'" alt="'+_parent.fileLibrary[$imageIndex].name()+'"  id="-1"  /></div>';
		}
		$('#shotwell .container .images').html(imagesHTML);
		
		//$('#shotwell .container .images div').css('height',$('#shotwell .container .images img').height());
		//$('#shotwell .sidebar .details .items').text(imageCount+' Photos');
		$('#shotwell .container .images img').click(function( event ){
			event.stopPropagation();
			$('#shotwell .container .images img').removeClass('selected');
			$(this).addClass('selected');
			$('#shotwell .sidebar .details .overall').hide();
			$('#shotwell .sidebar .details .single').show();
			$('#shotwell .sidebar .details .title').text(_parent.fileLibrary[$(this).attr('id')].name());
			$('#shotwell .sidebar .details .date').text(_parent.fileLibrary[$(this).attr('id')].date());
			$('#shotwell .sidebar .details .size').text(_parent.fileLibrary[$(this).attr('id')].size());
		});
		$('#shotwell .container .images img').dblclick(function(){
			$('#shotwell .container .images').addClass('singleImage');
			$('#shotwell .container .tools .jump-image').show();
			$('#shotwell .container .tools .slider-container').hide();
			currentIndex = $(this).attr('id');
			_this.display(currentIndex);
			_this.checkNextPrev();
		});
		this.resize();
	}
	
	this.showImageDetails = function( $index ){
		this.updateImageDetails($index);
		$('#shotwell .sidebar .details .overall').hide();
		$('#shotwell .sidebar .details .single').show();
	}
	
	this.updateImageDetails = function( $index ){
		$('#shotwell .sidebar .details .title').text(_parent.fileLibrary[$index].name());
		$('#shotwell .sidebar .details .date').text(_parent.fileLibrary[$index].date());
		$('#shotwell .sidebar .details .size').text(_parent.fileLibrary[$index].size());
	}
	
	this.selectImage = function($index){
		$('#shotwell .container .images').addClass('singleImage');
		$('#shotwell .container .tools .jump-image').show();
		$('#shotwell .container .tools .slider-container').hide();
		currentIndex = $index;
		this.showImageDetails(currentIndex);
		_this.display(currentIndex);
		_this.checkNextPrev();
		$('#shotwell').show();
		_isOpen = true;
		this.resize();
		_parent.systemMenu.openWindow('shotwell');
		$('#shotwell').trigger('mousedown');
	}

	this.open = function(){
		this.resize();
		this.center();
		$('#shotwell').show();
		_isOpen = true;
		_parent.systemMenu.openWindow('shotwell');
		//this.sliderUpdate(currentPercent);
		if($('css3-container').length > 0){
        	$('#shotwell').prev().css('top', $('#shotwell').css('top'));
        	$('#shotwell').prev().css('left', $('#shotwell').css('left'));
        }
	}
	
	this.close = function(){
		if(_isOpen){
			_parent.openWindows['shotwell'] = false;
			$('#shotwell .container .images').removeClass('singleImage');
			$('#shotwell .container .tools .jump-image').hide();
			$('#shotwell .container .tools .slider-container').show();
			$('#shotwell .sidebar .details .overall').show();
			$('#shotwell .sidebar .details .single').hide();
			_this.display();
			_this.sliderUpdate(currentPercent);
			
			if(maximised){ _parent.systemSettings.decreaseFullscreen(); }
			$('#shotwell ').hide();
			_parent.systemMenu.closeWindow('shotwell');
			$('#shotwell ').removeClass('fullsize');
			_this.resize();
			minified = _isOpen = false;
			_this.center();
		}
	}
	
	this.min = function(){
		if(maximised){ _parent.systemSettings.decreaseFullscreen(); }
		$('#shotwell ').hide();
		_parent.systemMenu.wiggle('shotwell');
		minified = true;
	}
	
	this.isMaximised = function(){
		return maximised;
	}
	
	/* this.open = function(){
	    	this.center();
	    	$('.shotwell').show();
	  }*/
	
	this.resize = function(){
		/*var topPadding = ($('#shotwell .container .images').height() - $('#shotwell .container .images .large img').height()) /2;
		 $('#shotwell .container .images .large img').css('margin-top',topPadding+'px');*/
		 var imageContainerWIdth = $('#shotwell').width() - 228;
		 $('#shotwell .container').css('width',imageContainerWIdth);
		 var imageContainerHeight = $('#shotwell').height() - 33;
		 $('#shotwell .container').css('height',imageContainerHeight);
		 $('#shotwell .sidebar .nav').css('height',imageContainerHeight - 138);
		 $('#shotwell .container .images').css('height',imageContainerHeight-40);
	}
	
	this.center = function(){
    	var left = ($(document).width() / 2) - ($('#shotwell').width() / 2);
		var top = Math.max(24,($(document).height() / 2) - ($('#shotwell').height() / 2));
		$('#shotwell').css('left',left);
		$('#shotwell').css('top',top);
    }
}