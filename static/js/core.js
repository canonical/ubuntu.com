/**
 * Ubuntu Core Front-End Framework
 *
 * Core javascript file part of Ubuntu Core Front-End Framework
 *
 * This file containes the classes required by ubuntu.com to interact.
 *
 * @project		Ubuntu Core Front-End Framework
 * @author		Web Team at Canonical Ltd
 * @copyright	2012 Canonical Ltd
 *
 */

/**
 * Table of contents
 *
 * Core
 * - hashBang
 * - getPullQuotes
 *
 */

if(!core){ var core = {}; }
YUI().use('node', 'anim', function(Y) {
	core.hashBang = function() {
		Y.all('#main-content a').each(function (node) {
			var hrefValue = node.get('href');
			if( hrefValue.indexOf("#") != -1 ) {
				var cleanTarget = core.qualifyURL(hrefValue.substr(0,hrefValue.indexOf('#')));
				var hashValue = hrefValue.substr(hrefValue.indexOf('#')+1);
				var cleanURL = window.location.href;
				node.setAttribute('data-hash',hashValue);
				node.set('href',hrefValue.substr(0,hrefValue.indexOf('#')));
				if(cleanURL == cleanTarget){
					node.on("click", function (e) {
						e.preventDefault();
						window.name = null;
						if(!this.hasClass('slideless')) {
							core.slideToAnchor(this.getAttribute('data-hash'));
						}
					});
				}else{
					node.on("click", function (e) {
						window.name = '¬'+node.getAttribute('data-hash');
					});
				}
			}else{
				node.on("click", function (e) {
					window.name = null;
				});
			}
		});
		core.checkForSession();
	}

	core.qualifyURL = function($url) {
	    var img = document.createElement('img');
	    img.src = $url;
	    $url = img.src;
	    //img.src = null;
	    img = null;
	    return $url;
	}

	core.checkForSession = function() {
		var session = window.name;
		if(session){
			if(session.charAt(0) == '¬'){
				core.jumpToAnchor(session.substring(1));
			}
		}
	}

	core.slideToAnchor = function($name) {
		var target;
			var destination = 0;
			if($name != ''){
				destination = Y.one('#'+$name).getXY()[1] - 20;
			}
			var webkitAnim = new Y.Anim({
			    node: Y.one('html'),
			    to: { scroll: [0, destination]},
			    easing: 'easeOut',
			    duration: 1,
			});
			var ffAnim = new Y.Anim({
			    node: Y.one('body'),
			    to: { scroll: [0, destination]},
			    easing: 'easeOut',
			    duration: 1,
			});
			webkitAnim.run(1000);
			ffAnim.run(1000);

	}

	core.jumpToAnchor = function($name) {
		if(document.getElementById($name)){
			document.getElementById($name).scrollIntoView();
		}else{
			window.name = null;
		}
	}

	core.svgFallback = function() {
		if(Modernizr){
			if (!Modernizr.svg || !Modernizr.backgroundsize) {
				Y.all("img[src$='.svg']").each(function(node) {
					node.setAttribute("src", node.getAttribute('src').toString().match(/.*\/(.+?)\./)[0]+'png');
				});
			}
		}
	};

	core.hashBang();
	core.svgFallback();
});