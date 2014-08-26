YUI().use('node', 'cookie', function(Y) {

	core.resourceHubBoxes = function() {
		Y.all(".resource").on('click',function(e) {
		    e.preventDefault();
    		e.stopPropagation();
			if(e.currentTarget.one('a') !== null) {
				window.location = e.currentTarget.one('a').get("href");
			}
		});
	}


	core.setupFeatureDisplay = function() {
		if(Y.one('.list-features-content') != null) {
			Y.all('.list-features-content li').setStyle('display','none');
			Y.one('#list-feature-saas').setStyle('display','block');
			Y.all('.nav-list-features li').each(function (node) {
				node.delegate('click', function(e){
					e.preventDefault();
		        	var clicked = this.get('text');
		        	Y.all('.nav-list-features li a').removeClass('active');
		      		this.addClass('active');
		        	var toShow = '';
		        	switch(clicked) {
		        		case 'SAAS':
		        			toShow = '#list-feature-saas';
		        		break;
		         		case 'Service orchestration':
		        			toShow = '#list-feature-orchestration';
		        		break;
		         		case 'PAAS':
		        			toShow = '#list-feature-paas';
		        		break;
		         		case 'Guest OS':
		        			toShow = '#list-feature-guest';
		        		break;
		         		case 'Public cloud':
		        			toShow = '#list-feature-public';
		        		break;
		         		case 'Private cloud':
		        			toShow = '#list-feature-private';
		        		break;
		         		case 'Virtualisation':
		        			toShow = '#list-feature-virtualisation';
		        		break;
		       		}
		       		Y.all('.list-features-content li').setStyle('display','none');
		        	Y.one(toShow).setStyle('display','block');
		        }, 'a');
		    });
	   }
	}


	core.setupAnimations = function(){
		var yOffset = 150;
		if(Y.one('body').hasClass('phone-features')){

			var edgeMagic = Y.all('.edge-magic');
			var searchScreen = {ypos: Y.one('.search-screen').getXY()[1] - yOffset, run: false};
			Y.on('scroll', function(e) {
				 edgeMagic.each(function (node) {
					if(window.scrollY > node.getXY()[1] - yOffset && window.scrollY < node.getXY()[1] && !node.run){
						node.run = true;
						node.one('.slider-animation').addClass('run');
						if(node.one('.slider-animation').getAttribute('class') == 'slider-animation full-swipe run'){
							setTimeout(function(){ node.one('.launcher').addClass('return') }, 2000);
						}
					}
				});
			});
			if(window.scrollY > searchScreen.ypos && window.scrollY < searchScreen.ypos + yOffset && !searchScreen.run){
				searchScreen.run = true;
				core.runAnimation('search-screen');
			}else{
				Y.on('scroll', function(e) {
					 if(window.scrollY > searchScreen.ypos && window.scrollY < searchScreen.ypos + yOffset && !searchScreen.run){
					 	searchScreen.run = true;
					 	core.runAnimation('search-screen');
					 }
				});
			}

			Y.all('.replay').on('click', function(e){
				core.rerunAnimation(e.target.get('parentNode').one('.slider-animation').getAttribute('class').replace('slider-animation ','').replace(' run',''));
			});

			Y.one('.content-controls .gallery-screen').setStyle('display','block');
			var infoIndex = 0;
			setInterval(function(){
				Y.all('.infographic .main-image').addClass('hide');
				Y.one('.infographic .info-pic-'+infoIndex).removeClass('hide');
				if(++infoIndex > 4){ infoIndex = 0; }
			}, 4000);
		}

		if(Y.one('body').hasClass('tablet-design')){
			var edgeMagic = Y.all('.slider-animation');
			var videoPanel = Y.all('.the-video');
			Y.on('scroll', function(e) {
				 edgeMagic.each(function (node) {
					if(window.scrollY > node.getXY()[1] - yOffset && window.scrollY < node.getXY()[1] && !node.run){
						node.run = true;
						node.addClass('run');
					}
				});
			});

			Y.all('.screen').on('click', function(e){
				core.rerunAnimation(e.target.get('parentNode').get('parentNode').get('parentNode').one('.slider-animation').getAttribute('class').replace('slider-animation ','').replace(' run',''));
			});

			Y.all('.replay').on('click', function(e){
				core.rerunAnimation(e.target.get('parentNode').one('.slider-animation').getAttribute('class').replace('slider-animation ','').replace(' run',''));
			});

			Y.one('.show-video').on('click',function(e) {
				e.preventDefault();
				videoPanel.addClass('show');
				Y.one('.row-hero').setStyle('height','590px');
				Y.one('.the-video div').set('innerHTML','<iframe width="984" height="554" src="http://www.youtube.com/embed/h384z7Ph0gU?showinfo=0&vq=hd1080&rel=0&modestbranding=0&autoplay=1" frameborder="0" allowfullscreen></iframe>');
			});
			Y.one('.close-video').on('click',function(e) {
				e.preventDefault();
				videoPanel.removeClass('show');
				Y.one('.row-hero').setStyle('height','420px');
				Y.one('.the-video div').set('innerHTML','');
			});
		}
	}

	core.runAnimation = function($anim) {
		switch($anim) {
			case 'search-screen':
				Y.one('.search-screen').addClass('run');
				setTimeout(function(){ Y.one('.search-screen').removeClass('run'); }, 2000);
			break;
			case 'go-back':
				Y.one('.go-back').addClass('run');
			break;
		}
	};

	core.updateSlider = function( $index ) {
	if($index >= 4){ $index = 0; }
	if($index <= -1){ $index = 3; }
	YUI().use('node', function(Y) {
		Y.one('.slide-container').setStyle('left','-'+(700 * $index)+'px');
		Y.all('.slider-dots li').removeClass('active');
		Y.all('.slider-dots li.pip-'+$index).addClass('active');
		Y.all('.slider-animation').removeClass('run');
		Y.one('.full-swipe .launcher').removeClass('return');
		switch($index+''){
			case '0':
				setTimeout(function(){ Y.one('.edge-magic').addClass('run'); }, 1200);
			break;
			case '1':
				setTimeout(function(){ Y.one('.full-swipe').addClass('run');}, 1200);
				setTimeout(function(){ Y.one('.full-swipe .launcher').addClass('return') }, 2000);
			break;
			case '2':
				setTimeout(function(){ Y.one('.go-back').addClass('run'); }, 1200);
			break;
			case '3':
				setTimeout(function(){ Y.one('.content-controls').addClass('run'); }, 1200);
			break;
		}
	});
	return $index;
	}

	core.rerunAnimation = function($type){
		Y.one('.'+$type).removeClass('run');
		if($type == 'full-swipe'){
			Y.one('.full-swipe .launcher').removeClass('return');
			setTimeout(function(){ Y.one('.full-swipe').addClass('run'); }, 400);
			setTimeout(function(){ Y.one('.full-swipe .launcher').addClass('return') }, 1400);
		}else if($type == 'notification-slider' || $type == 'search-screen'){
		  Y.one('.'+$type).removeClass('run');
      setTimeout(function(){ Y.one('.'+$type).addClass('run'); }, 1000);
		}else{
			Y.one('.'+$type).removeClass('run');
			setTimeout(function(){ Y.one('.'+$type).addClass('run'); }, 400);
		}
	}

	core.flipVideo = function(){
		if(Y.one('body').hasClass('phone-home')) {
			Y.one('.show-video').on('click',function(e) {
				e.preventDefault();
				Y.one('#panel').addClass('flipped');
				setTimeout(function(){ Y.one('.the-video').set('innerHTML','<iframe width="569" height="320" src="http://www.youtube.com/embed/cpWHJDLsqTU?showinfo=0&hd=1&rel=0&modestbranding=0&autoplay=1" frameborder="0" allowfullscreen></iframe>');Y.one('#panel .back').setStyle('z-index', '50');}, 1000);
			});
			Y.one('.close-video').on('click',function(e) {
				e.preventDefault();
				Y.one('#panel .back').setStyle('z-index', '0');
				Y.one('.the-video').set('innerHTML','');
				Y.one('#panel').removeClass('flipped');
			});
		}
	}

	core.externalLinks = function() {
		Y.all('a.external-link').each(function() {
			this.on('click',function(e) {
				e.preventDefault();
				window.open(this.getAttribute('href'), '_blank');
			});
		})
	}

	core.chineseDownload = function() {
		if(Y.one('body').hasClass('download-desktop-zh-CN')){
			var ltsform = Y.one('form.lts');
			var latestform = Y.one('form.latest');
			Y.one('form.lts button').on('click',function(e){
				e.preventDefault();
				this.set('text','开始...');
				ltsform.submit();
			});

			Y.one('form.latest button').on('click',function(e){
				e.preventDefault();
				this.set('text','开始...');
				latestform.submit();
			});

			Y.one('.lts .input-bits').on('change', function() {
				var bits = Y.one('form.lts .text-bits');
				var form_cta = ltsform.one('.link-cta-ubuntu');
				var val = this.get('value');
				var iso = val == '32' ? 'http://china-images.ubuntu.com/releases/12.04/ubuntu-12.04-desktop-i386.iso' : 'http://china-images.ubuntu.com/releases/12.04/ubuntu-12.04-desktop-amd64.iso';
				ltsform.setAttribute('action', iso);
				bits.set('text',val);
			});
			Y.one('.latest .input-bits').on('change', function() {
				var bits = Y.one('form.latest .text-bits');
				var form_cta = latestform.one('.link-cta-ubuntu');
				var val = this.get('value');
				var iso = val == '32' ? 'http://cdimage.ubuntu.com/ubuntukylin/releases/13.10/release/ubuntukylin-13.10-desktop-i386.iso' : 'http://cdimage.ubuntu.com/ubuntukylin/releases/13.10/release/ubuntukylin-13.10-desktop-amd64.iso';
				latestform.setAttribute('action', iso);
				bits.set('text',val);
			});
		}
	}

/*
core.cookiePolicy = function() {

	YUI().use('cookie', function (Y) {
		if(Y.Cookie.get("_cookies_accepted") != 'true'){
			open();
		}
	});

	function open() {
		YUI().use('node', function(Y) {
			Y.one('body').prepend('<div class="cookie-policy"><div class="wrapper"><a href="?cp=close" class="link-cta">Close</a><p>We use cookies to improve your experience of ubuntu.com. By continuing to explore without changing your settings, you are agreeing to accept them. To learn how to change these settings, please see our <a href="/privacy-policy#cookies">privacy policy</a>.</p></div></div>');
			Y.one('.cookie-policy .link-cta').on('click',function(e){
				e.preventDefault();
				close();
			});
		});
	}
	function close() {
		YUI().use('node', function(Y) {
			animate();
			setCookie();
		});
	}
	function animate() {
		YUI().use('anim', function(Y) {
			var myAnim = new Y.Anim({
			    node: '.cookie-policy',
			    to: { marginTop: -115 }
			});
			myAnim.run();
			myAnim.on('end', function() {
		        var node = this.get('node');
		        node.get('parentNode').removeChild(node);
		    });
		});
	}
	function setCookie() {
		YUI().use('cookie', function (Y) {
			Y.Cookie.set("_cookies_accepted", "true");
		});
	}
}
*/

	core.cookiePolicy = function() {
		if(Y.Cookie.get("_cookies_accepted") != 'true'){
			open();
		}

		function open() {
			YUI().use('node', function(Y) {
				Y.one('body').prepend('<div class="cookie-policy"><div class="wrapper"><a href="?cp=close" class="link-cta">Close</a><p>We use cookies to improve your experience. By your continued use of this site you accept such use. To change your settings please <a href="/privacy-policy#cookies">see our policy</a>.</p></div></div>');
				Y.one('.cookie-policy .link-cta').on('click',function(e){
					e.preventDefault();
					close();
				});
			});
		}
		function close() {
			YUI().use('node', function(Y) {
				Y.one('.cookie-policy').setStyle('display','none');
				setCookie();
			});
		}
		function setCookie() {
			YUI().use('cookie', function (Y) {
				Y.Cookie.set("_cookies_accepted", "true", { expires: new Date("January 12, 2025") });
			});
		}
	}

	core.supportsTransitions = function() {
		var b = document.body || document.documentElement;
		var s = b.style;
		var p = 'transition';
		if(typeof s[p] == 'string') {return true; }
		// Tests for vendor specific prop
		v = ['Moz', 'webkit', 'Webkit', 'Khtml', 'O', 'ms'],
		p = p.charAt(0).toUpperCase() + p.substr(1);
		for(var i=0; i<v.length; i++) {
			if(typeof s[v[i] + p] == 'string') { return true; }
		}
		return false;
	}

	core.setHTMLClasses = function(){
		if(Y.one('body').hasClass('homepage')){
			if (!core.supportsTransitions()) {
				document.getElementsByTagName("html")[0].className += " no-transitions";
			}
			document.getElementsByTagName("html")[0].className += " run";

		}
	}

	core.removeNoJS = function(){
		Y.all('html').removeClass('no-js');
	}

	core.removeNoJS();
	core.resourceHubBoxes();
	core.setupFeatureDisplay();
	core.setupAnimations();
	core.flipVideo();
	core.externalLinks();
	core.cookiePolicy();
	core.setHTMLClasses();
	// core.chineseDownload();
});
