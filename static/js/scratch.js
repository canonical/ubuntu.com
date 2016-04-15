YUI().use('node','gallery-carousel','gallery-carousel-anim','substitute', 'gallery-effects','cookie','event-resize', 'io', 'dump', 'json-parse', function(Y) {

    var lp_lookup_callback = {
        timeout: 3000,
        on: {
            success : function (id, response) {
                var messages = [];
                try {
                    messages = Y.JSON.parse(response.responseText);
                } catch (e) {
                    Y.log("JSON Parse failed!");
                    return;
                }
                Y.one('#lp_error').setHTML(messages.message);
            },
            failure : function (id, response) {
                Y.log("Async call failed!");
            }
        }
    };

    core.deviceAnimation = function() {
        if(Y.one('body').hasClass('homepage')) {
          //MIGHTY MORPHIN' DEVICE CODE

          //As the Modernizr used doesn't have Prefix
          var whichTransitionEvent = (function (){
              var t;
              var el = document.createElement('fakeelement');
              var transitions = {
                "animation"      : "animationend",
                "OAnimation"     : "oAnimationEnd",
                "MozAnimation"   : "animationend",
                "WebkitAnimation": "webkitAnimationEnd"
              }

              for(t in transitions){
                  if( el.style[t] !== undefined ){
                      return transitions[t];
                  }
              }
          } ());

          var nonCSSMorph = false;
          var currentNonMorphDevice = 0;
          var nonMorphImageList = ["assets/no-tran-phone.png","assets/no-tran-tablet.png","assets/no-tran-laptop.png"];
          var morphPlayComplete = false;


          //From the click
          function replayMorph()
          {
            if( morphPlayComplete )
            {
              var elm = this;
              if( nonCSSMorph )
              {
                nextNonMorph();
              }
              else
              {
                var newone = elm.cloneNode(true);

                elm.parentNode.replaceChild(newone, elm);
                newone.onclick = replayMorph;
                newone.style.cursor = 'inherit';
                addTransEndEvent( newone );
              }

              morphPlayComplete = false;
            }
          }

          function addTransEndEvent( e )
          {
            if(whichTransitionEvent)
            {
              e.addEventListener(whichTransitionEvent,setMorphComplete);
            }
            else
            {
              startNonMorph();
            }
           }
          function setMorphComplete(e) {
            morphPlayComplete = true;
            e.currentTarget.style.cursor = "pointer";
          }

          function startNonMorph()
          {
            nonCSSMorph = true;
            deviceMorphDiv.className="no-morph";
            deviceMorphDiv.onclick = replayMorph;
            setTimeout( nextNonMorph, 2000 );
          }

          function nextNonMorph()
          {
            currentNonMorphDevice++;
            if( currentNonMorphDevice >= nonMorphImageList.length )
            {
              currentNonMorphDevice = 0;
              morphPlayComplete = true;
              deviceMorphDiv.style.cursor = "pointer";
            }
            else
            {

              deviceMorphDiv.style.cursor = 'inherit';
              setTimeout( nextNonMorph, 2000 );
            }
            document.getElementById("device-morph").style.backgroundImage = "url("+nonMorphImageList[currentNonMorphDevice]+")";

          }
          var deviceMorphDiv = document.getElementById("device-morph");
          var devices = document.getElementById("devices");
          devices.className = "playing";
          devices.onclick = replayMorph;
          addTransEndEvent( devices );
        }
    };

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
        if(Y.one('body').hasClass('phone-home')) {
            var yOffset = 250;
        } else {
            var yOffset = 350;
        }
        if(Y.one('body').hasClass('phone-developers') || Y.one('body').hasClass('phone-home') || Y.one('body').hasClass('phone-partners')){
            var edgeMagic = Y.all('.edge-magic');
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

            Y.all('.replay').on('click', function(e){
                e.preventDefault();
                core.rerunAnimation(e.target.get('parentNode').one('.slider-animation').getAttribute('class').replace('slider-animation ','').replace(' run',''));
            });
            if(Y.one('.content-controls .gallery-screen')){
                Y.one('.content-controls .gallery-screen').setStyle('display','block');
                var infoIndex = 0;
                setInterval(function(){
                    Y.all('.infographic .main-image').addClass('hide');
                    Y.one('.infographic .info-pic-'+infoIndex).removeClass('hide');
                    if(++infoIndex > 4){ infoIndex = 0; }
                }, 4000);
            }
        }

        // scope animations
        if(Y.one('body').hasClass('phone-features')){
            var videoPanel = Y.all('.row--video');
            if(Y.one('.show-video')){
                Y.one('.show-video').on('click',function(e) {
                    e.preventDefault();
                    videoPanel.addClass('show');
                        Y.one('.the-video div').set('innerHTML','<div class="video-container active"><iframe width="984" height="554" src="http://www.youtube.com/embed/CsDFMIphtZk?showinfo=0&vq=hd1080&rel=0&modestbranding=0&autoplay=1" frameborder="0" allowfullscreen></iframe></div>');
                });
            }
        } // end if(Y.one('body').hasClass('phone-features'))

        if(Y.one('body').hasClass('tablet-design') || Y.one('body').hasClass('phone-home') ||  Y.one('body').hasClass('desktop-home') || Y.one('body').hasClass('homepage')) {
            if(Y.one('body').hasClass('tablet-design') || Y.one('body').hasClass('desktop-home') || Y.one('body').hasClass('homepage')) {
                var edgeMagic = Y.all('.slider-animation');
            }
            if(Y.one('body').hasClass('desktop-home')) {
                var yOffset = 1000;
            }
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
                e.preventDefault();
                core.rerunAnimation(e.target.get('parentNode').one('.slider-animation').getAttribute('class').replace('slider-animation ','').replace(' run',''));
            });
            if(Y.one('.show-video')){
                Y.one('.show-video').on('click',function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    Y.one('.close-vid-link').setStyle('display','block');
                    videoPanel.addClass('show');
                    if(Y.one('body').hasClass('tablet-design')){
                        Y.one('.row-hero').setStyle('height','590px');
                        Y.one('.the-video div').set('innerHTML','<iframe width="984" height="554" src="http://www.youtube.com/embed/-dpfHYpfEXY?showinfo=0&vq=hd1080&rel=0&modestbranding=0&autoplay=1" frameborder="0" allowfullscreen></iframe>');
                    } else {
                        Y.one('.row-hero').setStyle('height','588px').append('<div id="topbar" class="topbar"></div>'), 2000;
                        Y.one('.row-hero .row-content').removeClass('show-me').addClass('hide-me');
                        Y.one('.video-container').set('innerHTML','<iframe width="984" height="554" src="http://www.youtube.com/embed/-dpfHYpfEXY?showinfo=0&vq=hd1080&rel=0&modestbranding=0&autoplay=1" frameborder="0" allowfullscreen></iframe>');
                    }
                });
            }
            if(Y.one('.close-video')){
                Y.one('.close-video').on('click',function(e) {
                    e.preventDefault();
                    Y.one('.close-vid-link').setStyle('display','none');
                    videoPanel.removeClass('show');
                    if(Y.one('body').hasClass('tablet-design')){
                        Y.one('.row-hero').setStyle('height','460px');
                    } else {
                        Y.one('.row-hero').setStyle('height','678px');
                        Y.one('#topbar').remove()
                        Y.one('.row-hero .row-content').addClass('show-me');
                    };
                    Y.one('.the-video div').set('innerHTML','');
                });
            }
        }
    }

    core.scopesSlideshow = function() {

        // Developer overview slideshow
      var slideCount = $('#slider ul li').length;
      var slideWidth = $('#slider ul li').width();
      var slideHeight = $('#slider ul li').height();
      var sliderUlWidth = slideCount * slideWidth;

      $('#slider').css({
        width: slideWidth,
        height: slideHeight
      });

      $('#slider ul').css({
        width: sliderUlWidth,
        marginLeft: -slideWidth
      });

      $('#slider ul li:last-child').prependTo('#slider ul');

      function moveRight() {
        $('#slider ul').animate({
          left: -slideWidth
        }, 200, function() {
          $('#slider ul li:first-child').appendTo('#slider ul');
          $('#slider ul').css('left', '');
        });
      };

      window.onload = function() {
      setInterval(
            function(){
                moveRight();
            },
            3500);
        };
    };

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
        }else if($type == 'slider-animation') {

        }else{
            Y.one('.'+$type).removeClass('run');
            setTimeout(function(){ Y.one('.'+$type).addClass('run'); }, 400);
        }
    }

    core.flipVideo = function(){
        if(Y.one('body').hasClass('phone-home')) {
            if(Y.one('.show-video')) {
                Y.one('.show-video').on('click',function(e) {
                    e.preventDefault();
                    //Y.one('#panel').addClass('flipped');
                    setTimeout(function(){ Y.one('.the-video').set('innerHTML','<div class="videoWrapper"><iframe style="width:100%" src="http://www.youtube.com/embed/-dpfHYpfEXY?showinfo=0&hd=1&rel=0&modestbranding=0&autoplay=1" frameborder="0" allowfullscreen></iframe></div>');Y.one('#topbar').setStyle('z-index', '50');}, 1000);
                });
            }
            if(Y.one('.close-video')) {
                Y.one('.close-video').on('click',function(e) {
                    e.preventDefault();
                    Y.one('#panel .back').setStyle('z-index', '0');
                    Y.one('.the-video').set('innerHTML','');
                    Y.one('#panel').removeClass('flipped');
                });
            }
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

    core.cookiePolicy = function() {
        if(Y.Cookie.get("_cookies_accepted") != 'true'){
            open();
        }

        function open() {
            YUI().use('node', function(Y) {
                Y.one('body').prepend('<div class="cookie-policy"><div class="wrapper"><a href="?cp=close" class="link-cta">Close</a><p>We use cookies to improve your experience. By your continued use of this site you accept such use. To change your settings please <a href="http://www.ubuntu.com/legal/terms-and-policies/privacy-policy#cookies">see our policy</a>.</p></div></div>');
                Y.one('footer.global .legal').addClass('has-cookie');
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
        Y.all('html').removeClass('no-js').addClass('yes-js');
    }

    core.footerMobileNav = function() {
        Y.all('.footer-a li h2').on('click', function(e) {
            e.target.toggleClass('active open');
        });
        Y.all('.footer-b li h2').on('click', function(e) {
            e.target.toggleClass('active open');
        });
    };

    core.resizeListener = function() {
        Y.on('windowresize', function(e) {
            core.redrawGlobal();
        });
        core.globalInit();
    };

    core.globalInit= function() {
        if (document.documentElement.clientWidth < 768) {
            core.globalPrepend = 'div.nav-global-footer';
            core.setupGlobalNav();
            Y.one('.nav-global-wrapper').insert('<h2>Ubuntu websites</h2>','before');
        } else if (document.documentElement.clientWidth >= 768) {
            core.globalPrepend = 'body';
            core.setupGlobalNav();
            Y.all('#additional-info h2').setStyle('cursor', 'default');
            Y.one('footer.global').addClass('no-global');
        }
    };

    core.redrawGlobal = function() {
        var globalNav = Y.one("#nav-global");
        if (document.documentElement.clientWidth < 768 && core.globalPrepend != 'div.nav-global-footer') {
            core.globalPrepend = 'div.nav-global-footer';
            if (globalNav) {
                globalNav.remove();
                core.setupGlobalNav();
                Y.one('.nav-global-wrapper').insert('<h2>Ubuntu websites</h2>','before');
                Y.one('#nav-global h2').setStyle('cursor', 'pointer').append('<span></span>').on('click',function(e) {
                    this.toggleClass('active');
                    this.next('div').toggleClass('active');
                });
            }
        } else if (document.documentElement.clientWidth >= 768 && core.globalPrepend != 'body') {
            Y.one('footer.global').addClass('no-global');
            core.globalPrepend = 'body';
            if (globalNav) {
                globalNav.remove();
                core.setupGlobalNav();
            }
        }
    };

    core.setupGlobalNavAccordion = function() {
        if(Y.one('#nav-global h2') !== null) {
            Y.one('#nav-global h2').setStyle('cursor', 'pointer').append('<span></span>').on('click',function(e) {
                this.toggleClass('active');
                this.next('div').toggleClass('active');
            });
        }
    };

    core.renderJSON = function (response, id) {
        if (id == undefined) {
            id = '#dynamic-logos';
        }
        if (! Y.one(id)) {
            return;
        }
        var JSON = response;
        var numberPartners = JSON.length;
        var numberToDisplay = numberPartners < 10 ? numberPartners : 10;

        for (var i = 0; i < numberToDisplay; i++) {
            Y.one(id).append(Y.Node.create('<li class="inline-logos__item"><img class="inline-logos__image"  onload="this.style.opacity=\'1\';" src="'+JSON[i].logo+'" alt="'+JSON[i].name+'"></li>'));
        }
    };

    core.deviceAnimation = function() {
        if(Y.one('body').hasClass('homepage')) {
          //MIGHTY MORPHIN' DEVICE CODE

          //As the Modernizr used doesn't have Prefix
          var whichTransitionEvent = (function (){
              var t;
              var el = document.createElement('fakeelement');
              var transitions = {
                "animation"      : "animationend",
                "OAnimation"     : "oAnimationEnd",
                "MozAnimation"   : "animationend",
                "WebkitAnimation": "webkitAnimationEnd"
              }

              for(t in transitions){
                  if( el.style[t] !== undefined ){
                      return transitions[t];
                  }
              }
          } ());

          var nonCSSMorph = false;
          var currentNonMorphDevice = 0;
          var nonMorphImageList = ["assets/no-tran-phone.png","assets/no-tran-tablet.png","assets/no-tran-laptop.png"];
          var morphPlayComplete = false;


          //From the click
          function replayMorph()
          {
            if( morphPlayComplete )
            {
              var elm = this;
              if( nonCSSMorph )
              {
                nextNonMorph();
              }
              else
              {
                var newone = elm.cloneNode(true);

                elm.parentNode.replaceChild(newone, elm);
                newone.onclick = replayMorph;
                newone.style.cursor = 'inherit';
                addTransEndEvent( newone );
              }

              morphPlayComplete = false;
            }
          }

          function addTransEndEvent( e )
          {
            if(whichTransitionEvent)
            {
              e.addEventListener(whichTransitionEvent,setMorphComplete);
            }
            else
            {
              startNonMorph();
            }
           }
          function setMorphComplete(e) {
            morphPlayComplete = true;
            e.currentTarget.style.cursor = "pointer";
          }

          function startNonMorph()
          {
            nonCSSMorph = true;
            deviceMorphDiv.className="no-morph";
            deviceMorphDiv.onclick = replayMorph;
            setTimeout( nextNonMorph, 2000 );
          }

          function nextNonMorph()
          {
            currentNonMorphDevice++;
            if( currentNonMorphDevice >= nonMorphImageList.length )
            {
              currentNonMorphDevice = 0;
              morphPlayComplete = true;
              deviceMorphDiv.style.cursor = "pointer";
            }
            else
            {

              deviceMorphDiv.style.cursor = 'inherit';
              setTimeout( nextNonMorph, 2000 );
            }
            document.getElementById("device-morph").style.backgroundImage = "url("+nonMorphImageList[currentNonMorphDevice]+")";

          }
          var deviceMorphDiv = document.getElementById("device-morph");
          var devices = document.getElementById("devices");
          devices.className = "playing";
          devices.onclick = replayMorph;
          addTransEndEvent( devices );
        }
    };

    core.commandLine = function () {
      Y.all('.command-line').each(function() {
          var _this = this;
          var copyButton = _this.one('.js-copy-to-clipboard');
          var commandInput = _this.one('.command-line__input');
          if (copyButton && commandInput) {
              copyButton.on('click', function(e) {
                  e.preventDefault;
                  commandInput.select();
                  try {
                      var successful = document.execCommand('copy');
                			dataLayer.push({'event' : 'GAEvent', 'eventCategory' : 'Copy to clipboard', 'eventAction' : commandInput.get('value'), 'eventLabel' : document.URL, 'eventValue' : undefined });
                      _this.addClass('is-copied');
                      setTimeout(function(e) {
                          _this.removeClass('is-copied');
                      }, 300);
                  } catch(err) {
                      console.log('Unable to copy');
                  }
              });
          }

          if (commandInput) {
              commandInput.on('click', function(e) {
                  this.select();
              });
          }
      });
    }

    core.removeNoJS();
    core.setupFeatureDisplay();
    core.setupAnimations();
    core.flipVideo();
    core.externalLinks();
    core.cookiePolicy();
    core.setHTMLClasses();
    core.resizeListener();
    core.footerMobileNav();
    core.setupGlobalNavAccordion();
    core.scopesSlideshow();
    core.deviceAnimation();
    core.commandLine();
});
