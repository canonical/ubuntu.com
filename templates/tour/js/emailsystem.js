/*
* Email system
*  author: Anthony Dillon
*/

function EmailSystem($parent){
	var emails = new Array();
	var _parent = $parent;
	var _this = this;
	var minified = false;
	var writeMinified = false;
	var maximised = false;
	var writeMaximised = false;
	var currentFolder = 'inbox';
	var emailCount = 0;
	var selectedID = -1;
	var unreadCount = 0;
	var _isOpen = false;
	var randomReplies = new Array();
	var randomEmails = new Array();
	var randomEmail = null;
	var theWriteEmail = null;
	var writeType = '';
	
	this.init = function(){
		emails.push(new Email(0,'inbox', $.trim(_email_1_title_), $.trim(_email_1_body_), 'Inayaili de Leon', $.trim(_you_)));
		emails.push(new Email(1,'inbox',$.trim(_email_2_title_),$.trim(_email_2_body_),'John Oxton', $.trim(_you_)));
		emails.push(new Email(2,'inbox',$.trim(_email_3_title_),$.trim(_email_3_body_),'Ellen Arnold', $.trim(_you_)));
		emails.push(new Email(3,'inbox',$.trim(_email_4_title_),$.trim(_email_4_body_),'Steve Edwards', $.trim(_you_)));
		emails.push(new Email(4,'inbox',$.trim(_email_5_title_),$.trim(_email_5_body_),'Anthony Dillon', $.trim(_you_)));
		
		randomReplies.push(_random_reply_);
		
		randomEmails.push(new Email(emails.length,'inbox','Hiya there again','Just checking how you are? Been along time...\n\nRegards,\nJoe','Joe Bloggs <joe@bloggs.com>'));
		randomEmails.push(new Email(emails.length,'inbox','Hiya there again','Great ... Sounds good! Lets meet for lunch tomorrow to talk it over! What you think?\n\nThanks,\nSue','Sue  White <suewhite@googlemail.com>'));
		randomEmails.push(new Email(emails.length,'inbox','Hiya there again','Did you catch the game last night! What a goal... fancy coming over next time?','Jack Smith <j_swan@gmail.com>'));
		randomEmails.push(new Email(emails.length,'inbox','Hiya there again','Ok, ill do my best but no promises. It will take some time so let you know when its done./\n/\nThanks,/\nPaul','Paul Swan <paul@hotmail.com>'));
		
		this.setupControl();
	}
	
	this.setupControl = function(){
		this.resetMessage();
		
		$('#email-write #write-send').bind('click',function(){
			_this.sendEmail();
		}); 

		$('#email-write #write-subject input[name=subject]').keyup(function(){
			var subjectText = $(this).val();
			if(subjectText != ''){
				$('#email-write  .window-title').text(_write_+': '+subjectText);
			}else{
				$('#email-write  .window-title').text(_write_+': ('+_no_subject_+')');
			}
		});
		
		$('#email-write input').focus(function(){
			$(this).css('border-color','#dd4814');
		});
		
		$('#email-write input').blur(function(){
			$(this).css('border-color','#ADA9A5');
		});
		
		$('#email-write .control .close').click(function(){
			_this.closeWrite();
		});
		
		$('#email-write .control .min').click(function(){
			$('#email-write').hide();
			if(writeMaximised){ _parent.systemSettings.decreaseFullscreen(); }
			_parent.systemMenu.wiggle('email');
			writeMinified = true;
		});
		
		$('#email-write .control .max').click(function(){
			if(writeMaximised){
				writeMaximised = false;
				$('#email-write').css('width','900px');
				$('#email-write').css('height','610px');
				$('#email-write').removeClass('fullsize');
				_parent.systemSettings.decreaseFullscreen();
			}else{
				writeMaximised = true;
				$('#email-write').css('width',$(document).width() - 70 + 'px');
				$('#email-write').css('height',$(document).height() - 50 + 'px');
				$('#email-write').addClass('fullsize');
				_parent.systemSettings.increaseFullscreen();
			}
			_this.resizeMessage();
		});
		
		$('.email-window .control .close').click(function(){
			_this.close();
		});
		
		$('.email-window .control .min').click(function(){
			$('.email-window').hide();
			if(maximised){ _parent.systemSettings.decreaseFullscreen(); }
			_parent.systemMenu.wiggle('email');
			minified = true;
		});
		
		$('.email-window .control .max').click(function(){
			if(maximised){
				maximised = false;
				$('.email-window').css('width','900px');
				$('.email-window').css('height','600px');
				$('.email-window').removeClass('fullsize');
				_parent.systemSettings.decreaseFullscreen();
			}else{
				maximised = true;
				$('.email-window').css('width',$(document).width() - 70 + 'px');
				$('.email-window').css('height',$(document).height() - 50 + 'px');
				$('.email-window').addClass('fullsize');
				_parent.systemSettings.increaseFullscreen();
			}
			_this.resize();
		});
		
		$('.email-content .folder-list .list div').click(function(){
			$('.email-window .folder-list .list div').removeClass('selected');
			$(this).addClass('selected');
			_this.setFolder($(this).attr('id').split('-')[1]);
		});
		
		$('.email-window .buttons .email-write').bind('click',function(event){
			_this.showWrite();
		});
		
		$('.email-window .buttons .email-get-mail').bind('click',function(event){
			_this.updateDisplay();
		});
		
		$('.message-header .email-buttons span.message-delete').bind('click',function(event){
			if(selectedID != -1){
				if(emails[selectedID].folder() != 'trash'){
					emails[selectedID].setFolder('trash');
				}else{
					emails[selectedID].setDeleted(true);
				}
				selectedID = -1;
				_this.updateDisplay();
				_this.updateMessage();
			}
		});
		
		$('.message-header .email-buttons span.message-archive').bind('click',function(event){
			if(selectedID != -1){
					emails[selectedID].setFolder('archive');
					selectedID = -1;
					_this.updateDisplay();
					_this.updateMessage();
			}
		});
		
		$('.message-header .email-buttons span.message-junk').bind('click',function(event){
			if(selectedID != -1){
				if(emails[selectedID].fire()){
					emails[selectedID].setFire(false);
				}else{
					emails[selectedID].setFire(true);
				}
				_this.updateDisplay();
				_this.updateMessage();
			}
		});
		
		$('.message-header .email-buttons span.message-forward').bind('click',function(event){
			_this.showWrite('forward');
		});
		
		$('.message-header .email-buttons span.message-reply').bind('click',function(event){
			if(currentFolder == 'sent'){
				_this.showWrite('sentreply');
			}else{
				_this.showWrite('reply');
			}
		});
		
		$('.not-junk').bind('click',function(event){
			if(selectedID != -1){
				emails[selectedID].setFire(false);
				_this.updateDisplay();
				_this.updateMessage();
			}
		});
		
		this.updateDisplay();
		this.updateMessage();
		
	}
	
	this.setupRandomEmail = function(){
		var randomIndex = Math.floor(Math.random() * randomEmails.length);
		randomEmail = randomEmails[randomIndex];
		var randomTime = (Math.random()*10000) + 2000;
		setTimeout ( "recieveMessage()", randomTime );
	}
	
	this.showWrite = function($type){
		if(selectedID != -1){
			 theWriteEmail = emails[selectedID];
			 writeType = $type;
			 var messageSubject = $.trim(theWriteEmail.subject());
			if(messageSubject.substr(0, 3) != 'Re:'){ messageSubject = 'Re: '+$.trim(messageSubject); }
			if(writeType == 'reply'){
				$('#email-write  .window-title').text(_write_+': '+messageSubject);
				$('#email-write  #write-from  input[name=from]').val($.trim(_you_));
				$('#email-write  #write-subject  input[name=subject]').val(messageSubject);
				$('#email-write  #write-to  input[name=to]').val(theWriteEmail.from());
				$('#email-write #write-body textarea[name=body]').val('\n\n'+$.trim(_on_)+' '+$.trim(theWriteEmail.date())+', '+$.trim(theWriteEmail.from())+' '+$.trim(_wrote_)+': \n\n'+$.trim(theWriteEmail.body()));
			}else if(writeType == 'forward'){
				$('#email-write  .window-title').text($.trim(_write_)+': Fwd: '+$.trim(theWriteEmail.subject()));
				$('#email-write  #write-subject  input[name=subject]').val($.trim(_fwd_)+': '+$.trim(theWriteEmail.subject()));
				$('#email-write  #write-to  input[name=to]').val('');
				$('#email-write #write-body textarea[name=body]').val('\n\n-------- '+$.trim(_original_message_)+' --------\n\n'+$.trim(theWriteEmail.body()));
			}else if(writeType == 'sentreply'){
				$('#email-write  .window-title').text($.trim(_write_)+': '+$.trim(messageSubject));
				$('#email-write  #write-from  input[name=from]').val($.trim(_you_));
				$('#email-write  #write-subject  input[name=subject]').val($.trim(messageSubject));
				$('#email-write  #write-to  input[name=to]').val($.trim(theWriteEmail.to()));
				$('#email-write #write-body textarea[name=body]').val('\n\n'+$.trim(_on_)+' '+$.trim(theWriteEmail.date())+', '+$.trim(theWriteEmail.from())+' '+$.trim(_wrote_)+': \n\n'+$.trim(theWriteEmail.body()));
			}
		}
		$('#email-write').show();
		$('#email-write').css('z-index',3);
		$('#email-write').trigger('mousedown');
		if($('css3-container').length > 0){
        	$('#email-write').prev().css('top', $('#email-write').css('top'));
        	$('#email-write').prev().css('left', $('#email-write').css('left'));
        }
	}
	
	this.closeWrite = function(){
		_parent.openWindows['email-write'] = false;
		this.resetMessage();
		$('#email-write').hide();
	}
	
	 this.isMaximised = function(){
	    	return maximised;
	 }
	
	this.isWriteMaximised = function(){
		return writeMaximised;
	} 
	this.isWriteMinified = function(){
		return writeMinified;
	}   
	
	this.open = function(){
		_isOpen = true;
		this.center();
		$('.email-window').show();
	}
	
	this.close = function(){
		if(_isOpen){
			_isOpen = false;
			_parent.openWindows['email-window'] = false;
			$('.email-window').hide();
			$('#email-write').hide();
			if(maximised){ _parent.systemSettings.decreaseFullscreen(); }
			_parent.systemMenu.closeWindow('email');
			$('.email-window').removeClass('fullsize');
			writeMaximised = writeMinified = maximised = maximised = false;
			$('#folder-inbox').trigger('click');
			this.resize();
			this.center();
		}
	}
	
	this.updateDisplay = function( ){
		emailCount = unreadCount = 0;
		emailLIstContents = '';
		var folderContents = '';
		var i = emails.length;
		while(i--){
			if(!emails[i].read()){ _parent.systemSettings.gotMail(true); }
			if(emails[i].folder() == currentFolder && !emails[i].deleted()){
				folderContents +=  emails[i].draw(i);
				emailCount++;
				if(!emails[i].read()){ unreadCount++; }
			}
		}
		this.checkMessageNotification();
		$('.email-window .email-list').html(folderContents);
		$(".email-window .email-list .message:even").addClass("grey");
		if(selectedID != -1){
			$('.email-window .email-list #email-'+selectedID).addClass('selected');
		}
		
		$('.email-list div').bind('click',function(){
			selectedID = $(this).attr('id').split('-')[1];
			emails[selectedID].setRead(true);
			$('.email-list div').removeClass('selected');
			$(this).addClass('selected');
			if($(this).hasClass('unread')){ unreadCount--; _this.checkMessageNotification() };
			$(this).removeClass('unread');
			_this.updateMessage();
			_this.updateDetails();
		});
		
		$('.email-list div li.message-star').bind('click',function(event){
			event.stopPropagation();
			selectedID = $(this).parent().parent().attr('id').split('-')[1];
			if(emails[selectedID].starred()){
				emails[selectedID].setStarred(false);
				$(this).parent().parent().removeClass('starred');
			}else{
				emails[selectedID].setStarred(true);
				$(this).parent().parent().addClass('starred');
			}
		});
		
		$('.email-list div li.message-fire').bind('click',function(event){
			event.stopPropagation();
			var tempID = $(this).parent().parent().attr('id').split('-')[1];
			if(emails[tempID].fire()){
				emails[tempID].setFire(false);
				$(this).parent().parent().removeClass('fire');
			}else{
				emails[tempID].setFire(true);
				$(this).parent().parent().addClass('fire');
			}
			_this.updateMessage();
		});
		
		$('.email-list div li.message-glasses').bind('click',function(event){
			event.stopPropagation();
			selectedID = $(this).parent().parent().attr('id').split('-')[1];
			if(emails[selectedID].read()){
				emails[selectedID].setRead(false);
				$(this).parent().parent().addClass('unread');
				unreadCount++;
			}else{
				emails[selectedID].setRead(true);
				$(this).parent().parent().removeClass('unread');
				unreadCount--;
			}
			_this.updateDetails();
		});
		
		
	}
	
	this.checkMessageNotification = function(){
		if(unreadCount > 0){
			_parent.systemSettings.gotMail(true);
		}else{
			_parent.systemSettings.gotMail(false);
		}
	}
	
	this.updateMessage = function(){
		if(selectedID != -1){
			var $body = emails[selectedID].body();
			$body = $body.replace(/\n/g,'<br/>');
			$('.email-window .email-contents .message-body').html($body);
			$('.email-window .email-contents .email-body .message-header .from dd').html(emails[selectedID].from());
			$('.email-window .email-contents .email-body .message-header .subject dd').html(emails[selectedID].subject());
			$('.email-window .email-contents .email-body .message-header .to dd').html(emails[selectedID].to());
			$('.email-window .email-contents .email-body .message-header .date').html(emails[selectedID].date());
			if(emails[selectedID].cc()){
				$('.email-window .email-contents .email-body .message-header .cc dd').html(emails[selectedID].cc());
			}else{
				$('.email-window .email-contents .email-body .message-header .cc').hide();
			}
			$('.email-window .email-contents .email-body div').show();
			var contentHeight = $('.email-window .email-contents .email-body').height() - ($('.email-window .email-contents .email-body .message-header').height() + 21);
			if(emails[selectedID].fire()){
				contentHeight -= 39;
				$('.message-header .email-buttons span.message-junk').hide();
				$('.email-window .email-contents .junk-mail-banner ').show();
			}else{
				$('.message-header .email-buttons span.message-junk').show();
				$('.email-window .email-contents .junk-mail-banner ').hide();
			}
			contentHeight +=  'px';
			$('.email-window .email-contents .message-body').css('height', contentHeight);
		}else{
			$('.email-window .email-contents .email-body div').hide();
		}
		this.updateDetails();
	}
	
	this.setFolder = function($folder){
		currentFolder = $folder;
		selectedID = -1;
		if(currentFolder == 'sent'){
			$('.email-window .email-content .email-contents .email-categories .from').text(_recipient_);
		}else{
			$('.email-window .email-content .email-contents .email-categories .from').text(_from_);
		}
		this.updateDisplay();
		this.updateMessage();
	}
	
	this.resize = function(){
		var emailContentWidth = $('.email-window').width() - 188;
		var folderListHeight =  ($('.email-window').height()) - 130;
		$('.email-window .email-content .email-contents').css('width',emailContentWidth);
		$('.email-window .email-content .folder-list .list').css('height',folderListHeight);
		$('.email-window .email-content .email-contents .email-list').css('height',(folderListHeight / 2)-3);
		$('.email-window .email-content .email-contents .email-body').css('height',(folderListHeight / 2)-3);
		this.updateMessage();
	}
	
	this.resizeMessage = function(){
		var bodyWidth = $('#email-write').width() - 6;
		var bodyHeight =  ($('#email-write').height() - 250);
		$('#email-write #write-body textarea').css('width',bodyWidth);
		$('#email-write #write-body textarea').css('height',bodyHeight);
	}
	
	this.updateDetails = function(){
		$('.email-window .email-content .emails-info #details-unread').text(unreadCount);
		$('.email-window .email-content .emails-info #details-total').text(emailCount);
	}
	
	this.resetMessage = function(){
		$('#email-write').hide();
		$('#email-write  .window-title').text(_write_+': ('+_no_subject_+')');
		$('#email-write  #write-subject  input[name=subject]').val('');
		$('#email-write  #write-to  input[name=to]').val('');
		$('#email-write #write-body textarea[name=body]').val('');
		$('#email-write .loading-bar .progress').css('width','0');
	}
	
	this.sendEmail = function(){
		var subject = $('#email-write #write-subject input[name=subject]').val();
		var body = $('#email-write #write-body textarea[name=body]').val();
		var from = _you_;
		var to = $('#email-write #write-to input[name=to]').val();
		var currentTime = new Date();
		var minutes = currentTime.getMinutes();
		var date = currentTime.getDate();
		var month = currentTime.getMonth();
		var year = ''+currentTime.getFullYear();
		year = year.substr(2,2);
		if (minutes < 10){ minutes = "0" + minutes; }
		if (date < 10){ date = "0" + date; }
		if (month < 10){ month = "0" + month; }
		if (minutes < 10){ minutes = "0" + minutes; }
		currentTime = date+'/'+month+'/'+year+' '+currentTime.getHours() + ":" + minutes + " ";
		var newEmail = new Email(emails.length,'sent',subject,body,from,to,currentTime);
		emails.push(newEmail);
		
		if(writeType == 'reply'){
			theWriteEmail.setReplied(true);
		}else if(writeType == 'forward'){
			theWriteEmail.setForwarded(true);
		}
		
		$('#email-write .loading-bar .progress').animate({
		    	width: 96
		  }, 500, function() {
		    	_this.resetMessage();
		    	_this.updateDisplay();
		    	_this.setupRandomReply(newEmail);
		  });
	}
	
	this.setupRandomReply = function($email){
		var randomIndex = Math.floor(Math.random() * randomReplies.length);
		var body = randomReplies[randomIndex]+'\n\n'+$.trim(_on_)+' '+$.trim($email.date())+', '+$.trim($email.from())+' '+$.trim(_fwd_)+' '+$.trim(_wrote_)+': \n\n'+$email.body();
		var messageSubject = $email.subject();
		if(messageSubject.substr(0, 3) != 'Re:'){ messageSubject = 'Re: '+messageSubject; }
		emails.push(new Email(emails.length, 'inbox', messageSubject, body,$email.to(), _you_));
		var randomTime = (Math.random()*2000) + 2000;
		setTimeout ( "recieveMessage()", randomTime );
	}
	
	 this.center = function(){
    	var left = ($(document).width() / 2) - ($('.email-window').width() / 2);
		var top = Math.max(24,($(document).height() / 2) - ($('.email-window').height() / 2));
		$('.email-window').css('left',left);
		$('.email-window').css('top',top+'px');
		if($('css3-container').length > 0){
        	$('.email-window').prev().css('top', $('.email-window').css('top'));
        	$('.email-window').prev().css('left', $('.email-window').css('left'));
        }
    }
}

function recieveMessage(){
	emailSystem.updateDisplay();
}
