/*
* Email object
*  author: Anthony Dillon
*/

function Email($id, $folder, $subject, $body, $from, $to, $date, $cc){ 
	if ($subject==undefined) { $subject='Untitled Message';}
	if ($from==undefined) { $from='Welcome <welcome@ubuntu.com>';}
	if ($to==undefined) { $to='Me <me@canonical.com>';}
	if ($cc==undefined) { $cc=false;}
	if($body==undefined){ $body = 'There is no body for message '+$subject; }
	if ($date==undefined) { 
		var currentTime = new Date();
		var minutes = currentTime.getMinutes();
		var date = currentTime.getDate();
		var month = currentTime.getMonth() + 1;
		var year = ''+currentTime.getFullYear();
		year = year.substr(2,2);
		if (minutes < 10){ minutes = "0" + minutes; }
		if (date < 10){ date = "0" + date; }
		if (month < 10){ month = "0" + month; }
		if (minutes < 10){ minutes = "0" + minutes; }
		$date= date+'/'+month+'/'+year+' '+currentTime.getHours() + ":" + minutes + " ";
	}
	var _id = $id;
	var _date = $date;
	var _subject = $subject;
	var _from = $from;
	var _to = $to;
	var _cc = $cc;
	var _replied = false;
	var _forwarded= false;
	var _attachment = false;
	var _starred = false;
	var _read = false;
	var _fire = false;
	var _folder = $folder;
	var _body = $body;
	var _deleted = false;
	
	if(_folder == 'sent'){ _read = true; }

	this.subject = function (){ return _subject; }
	this.date = function (){ return _date; }
	this.from = function (){ return _from; }
	this.to = function (){ return _to; }
	this.cc = function (){ return _cc; }
	this.replied = function (){ return _replied; }
	this.attachment = function (){ return _attachment; }
	this.starred = function (){ return _starred; }
	this.read = function (){ return _read; }
	this.folder = function (){ return _folder; }
	this.fire = function (){ return _fire; }
	this.body = function (){ return _body; }
	this.deleted = function (){ return _deleted; }
	this.forwarded = function(){ return _forwarded; }
	
	this.setReplied = function($replied){ _replied = $replied; }
	this.setAttachment= function($attachment){ _attachment = $attachment; }
	this.setStarred = function($starred){ _starred = $starred; }
	this.setRead = function($read){ _read = $read; }
	this.setFolder = function($folder){ _folder = $folder; }
	this.setFire = function($fire){ _fire = $fire; }
	this.setDeleted = function($deleted){ _deleted = $deleted; }
	this.setForwarded = function($forwarded){ _forwarded = $forwarded; }
	
	this.draw = function(){
		var classes = 'class="message ';
		if(!_read){ classes += 'unread '; }
		if(_attachment){ classes += 'attachment '; }
		if(_starred){ classes += 'starred '; }
		if(_fire){ classes += 'fire '; }
		if(_replied && _forwarded){
			classes += 'repliedforwarded ';
		}else{
			if(_replied){ classes += 'replied '; }
			if(_forwarded){ classes += 'forwarded '; }
		}
		classes += '"';
		if(_folder == 'sent'){
			return '<div id="email-'+_id+'" '+classes+'><ul><li class="message-t"></li><li class="message-star"></li><li class="message-clip"></il><li class="message-subject">'+_subject+'</li><li class="message-glasses"></li><li class="message-from">'+_to+'</li><li class="message-fire"></li><li class="message-date">'+_date+'</li></div>';
		}else{
			return '<div id="email-'+_id+'" '+classes+'><ul><li class="message-t"></li><li class="message-star"></li><li class="message-clip"></il><li class="message-subject">'+_subject+'</li><li class="message-glasses"></li><li class="message-from">'+_from+'</li><li class="message-fire"></li><li class="message-date">'+_date+'</li></div>';
		}
		
	}
	
	this.toString = function(){
		return 'ID = '+ _id + ' | Subject = '+ _subject;
	}
}

