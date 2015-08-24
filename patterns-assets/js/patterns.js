patterns = {};

$(document).ready(function() {
   patterns.init();
});

// Addes click events to the "Get the Code" links
patterns.init = function() {
	$('body').prepend('<div id="code-display"><a href="#" onclick="return false;">[close]</a><p>Code example:</p><textarea></textarea></div>');
	//$('.inner-wrapper').find('a').bind('click',function(){ return false; }) 
	var cD = $('#code-display');
	
	cD.find('textarea').width($(document).width()-20).bind('click',function(){
		$(this).select();
	});
	
	cD.find('a').bind('click',function(){
		cD.slideUp('fast');
	});
	
	$('.row').children().bind('click',function(e){
		cD.find('textarea').text($(this).parent().html().trim());
		cD.slideDown('fast',function(){
			$(this).find('textarea').focus();
		});
		e.preventDefault();
	});
}
