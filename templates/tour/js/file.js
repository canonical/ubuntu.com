/* 
 *  File Object
 *  author: Anthony Dillon
 */

function File($id, $url, $type, $name, $size, $date ,$location){
	if($name == undefined){ var tempName = _url.split('/'); $name = tempName[tempName.length-1].split('.')[0]; }
	if($size == undefined){ $size = '11.5MB'; }
	if($date == undefined){ $date = new Date().toString(); }
	if ($location==undefined) { $location='/Home';}
	if($type == undefined){$type = 'photo'; }
	
	var _id = $id;
	var _url = $url;
	var _type = $type;
	var _name = $name;
	var _size = $size;
	var _date = $date;
	var _location = $location;
	
	this.url = function(){ return _url; }
	this.name = function(){ return _name; }
	this.size = function(){ return _size; }
	this.date = function(){ return _date; }
	this.location = function(){ return _location; }
	this.id = function(){ return _id; }
	this.type = function(){ return _type; }
	
	this.setURL = function($url){ _url = $url; }
	this.setName = function($name){ _name = $name; }
	this.setSize = function($size){ _size = $size; }
	this.setDate = function($date){ _date = $date; }
	this.setLocation = function($location){ _location = $location; }
	this.setType = function($type){ _type = $type; }
	
	this.drawIcon = function($id, $type){
		switch(_type){
			case 'photo':
				if($type == 'display-icon'){
					return  '<div class="file '+$type+'" data-type="photo"  data-id='+$id+'><p class="border"><img src="'+_url+'"  width="53px"  /></p><span>'+_name+'</span></div>';
				}else{
					return  '<div class="file '+$type+'" data-type="photo"  data-id='+$id+'><p></p><span>'+_name+'</span></div>';
				}
			break;
			case 'video':
				var tempName = _url.split('/');
				tempName = tempName[tempName.length-1].split('.')[0];
				if($type == 'display-icon'){
					return  '<div class="file '+$type+'"  data-type="video"  data-id='+$id+'><p class="border"><img src="../img/videos/'+tempName+'.jpg"  width="53px"  /></p><span>'+_name+'</span></div>';
				}else{
					return  '<div class="file '+$type+'"  data-type="video"  data-id='+$id+'><p></p><span>'+_name+'</span></div>';
				}
			break;
			case 'audio':
				if($type == 'display-icon'){
					return  '<div class="file '+$type+'" data-type="audio"  data-id='+$id+'><p><img src="../img/folder/audio.png" /></p><span>'+_name+'</span></div>';
				}else{
					return  '<div class="file '+$type+'" data-type="audio"  data-id='+$id+'><p></p><span>'+_name+'</span></div>';
				}
			break;
			default:
				if($type == 'display-icon'){
					return  '<div class="file '+$type+'" data-type="unknown"  data-id='+$id+'><p><img src="../img/folder/unknown.png" /></p><span>'+_name+'</span></div>';
				}else{
					return  '<div class="file '+$type+'" data-type="unknown"  data-id='+$id+'><p></p><span>'+_name+'</span></div>';
				}
			break;
		}
		
	}
}
