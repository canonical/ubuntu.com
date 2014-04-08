/*
* Folder object
*  author: Anthony Dillon
*/

function Folder($name, $location){ 
	if ($name==undefined) { $name='Untitled Folder';}
	if ($location==undefined) { $location='/Home';}
	var _name = $name;
	var _size = '6.2 GB';
	var _location = $location;
	var _in_bin = false;

	this.name = function (){ return _name; };
	this.size = function (){ return _size; };
	this.location = function (){ return _location; };
	this.in_bin = function (){ return _in_bin; };
	
	this.rename = function($name){
		_name = $name;
	}
	
	this.bin = function($in_bin){
		_in_bin = $in_bin;
	}
	
	this.move = function($location){
		_location = $location;
	}
	
	this.drawIcon = function($id, $type){
		return  "<div class='file-folder "+$type+"' data-type='folder' data-id='"+$id+"'><p></p><span>"+_name+"</span></div>";
	}
	
	this.type = function(){ 
		return 'folder';
	}
}

