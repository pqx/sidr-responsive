;(function($){

  var sidrMoving = false;
  var sidrOpened = false;

  var screenWidth = 767;

  var responsiveClass = {
    menu: 'sidr-show',
    body_left: 'body-left-sidr',
    body_right: 'body-right-sidr',
    header_fix: 'sidr-header-fix',
    body_class: function(side) {
      return (side === 'left') ? responsiveClass.body_left : responsiveClass.body_right;
    }
  };

  var $header = $('#header');

  // Private methods
  var privateMethods = {
    // Check for valids urls
    // From : http://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-an-url
    isUrl: function (str) {
      var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
      if(!pattern.test(str)) {
        return false;
      } else {
        return true;
      }
    },
    // Loads the content into the menu bar
    loadContent: function($menu, content) {
      $menu.html(content);
    },
    // Add sidr prefixes
    addPrefix: function($element) {
      var elementId = $element.attr('id');
      var elementClass = $element.attr('class');

      if(typeof elementId === 'string' && '' !== elementId) {
        $element.attr('id', elementId.replace(/([A-Za-z0-9_.\-]+)/g, 'sidr-id-$1'));
      }
      if(typeof elementClass === 'string' && '' !== elementClass && 'sidr-inner' !== elementClass) {
        $element.attr('class', elementClass.replace(/([A-Za-z0-9_.\-]+)/g, 'sidr-class-$1'));
      }
      $element.removeAttr('style');
    },
    execute: function(action, name, callback) {
      // Check arguments
      if(typeof name === 'function') {
        callback = name;
        name = 'sidr';
      } else if(!name) {
        name = 'sidr';
      }

      // Declaring
      var $menu = $('#' + name);
      var $body = $($menu.data('body'));
      var $html = $('html');
      var menuWidth = $menu.outerWidth(true);
      var bodyWidth = $body.outerWidth(true);
      var speed = $menu.data('speed');
      var side = $menu.data('side');
      var bodyAnimation;
      var menuAnimation;
      var headerAnimation;
      var scrollTop;

      if(action === 'init') { // just there
        console.log('init action **adding responsive class no animation');
        $header.toggleClass(responsiveClass.header_fix);

        if(side === 'left') {
          $body.toggleClass(responsiveClass.body_left);
          $menu.toggleClass(responsiveClass.menu);
        } else if(side === 'right') {
          $body.toggleClass(responsiveClass.body_right);
          $menu.toggleClass(responsiveClass.menu);
        }
        return;
      }

      // Open Sidr
      if('open' === action || ('toogle' === action && !$menu.is(':visible'))) {
        // Check if we can open it
        if( $menu.is(':visible') || sidrMoving ) {
          return;
        }

        if(bodyWidth > screenWidth) { // open in landscape mode
          console.log('open in landscape');

          if(side === 'left') {
            // headerAnimation = {'padding-right': menuWidth + 'px'};

            headerAnimation = {
              'width': bodyWidth - menuWidth
            };

            bodyAnimation = {'margin-left': menuWidth + 'px'};
            menuAnimation = {left: '0'};
          } else if(side === 'right') {

            // headerAnimation = {'padding-right': menuWidth + 'px'};
            headerAnimation = {
              'right': menuWidth + 'px', // padding-right not update well on safari (ipad)
              'width': bodyWidth - menuWidth
            };

            bodyAnimation = {'margin-right': menuWidth + 'px'};
            menuAnimation = {right: '0'};
          }

          if(side === 'right') {
            $header.css({'right': 0});
          }

          $header.animate(headerAnimation, speed, function() {
            $header.removeAttr('style').addClass(responsiveClass.header_fix);
          });


          $body.animate(bodyAnimation, speed, function() {
            $body.removeAttr('style').addClass(responsiveClass.body_class(side));
          });
          $menu.css({
            'display': 'block',
            'left': '-' + menuWidth + 'px'
          }).animate(menuAnimation, speed, function() {
            $menu.removeAttr('style').addClass('sidr-show');
          });

          return;
        } else { // open in portrait mode

          console.log('open in portrait mode');

          // clear responsive class
          $body.removeClass(responsiveClass.body_left).removeClass(responsiveClass.body_right);
          $header.css({
            'padding': '0 0 0 0'
          }).removeClass(responsiveClass.header_fix).removeAttr('style');

          if(side === 'left') {
            headerAnimation = {
              'left': menuWidth + 'px'
            };
            bodyAnimation = {left: menuWidth + 'px'};
            menuAnimation = {left: '0px'};
          } else if(side == 'right') {
            headerAnimation = {'padding-right': menuWidth + 'px'};
            headerAnimation = bodyAnimation = {right: menuWidth + 'px'};
            menuAnimation = {right: '0px'};
          }

          // $body.css({
          //   width: $body.width(),
          //   position: 'absolute'
          // }).animate(bodyAnimation, speed);

          $body.animate(bodyAnimation, speed, function() {
            $body.removeAttr('style').addClass('sidr-body-portrait');
          });

          $header.animate(headerAnimation, speed, function() {
            $header.removeAttr('style').addClass('sidr-header-portrait');
          });

          if(side === 'left') {
            $menu.css({
              'display': 'block',
              'left': '-' + menuWidth + 'px'
            });
          } else if(side === 'right') {
            $menu.css({
              'display': 'block',
              'right': '-' + menuWidth + 'px'
            });
          }
          $menu.animate(menuAnimation, speed, function() {
            $menu.removeAttr('style').addClass('sidr-menu-portrait-left');
          });
          return;
        }


        // If another menu opened close first
        if(sidrOpened !== false) {
          methods.close(sidrOpened, function() {
            methods.open(name);
          });

          return;
        }

      } else { // Close Sidr

        // Check if we can close it
        if( !$menu.is(':visible') || sidrMoving ) {
          return;
        }

        if(bodyWidth > screenWidth) { // close in landscape

          console.log('close in landscape');

          headerAnimation = {
            'width': bodyWidth + menuWidth
          };


          if(side === 'left') {
            bodyAnimation = {'margin-left': 0};
            menuAnimation = {left: '-' + menuWidth + 'px'};
          } else if(side === 'right') {
            bodyAnimation = {'margin-right': 0};
            menuAnimation = {right: '-' + menuWidth + 'px'};
          }

          $header.animate(headerAnimation, speed, function() {
            $header.removeAttr('style');
          });

          $body.animate(bodyAnimation, speed, function() {
            $body.removeAttr('style')
              .removeClass(responsiveClass.body_left)
              .removeClass(responsiveClass.body_right);
          });
          $menu.animate(menuAnimation, speed, function() {
            $menu.removeClass(responsiveClass.menu);
          });

          $header.removeClass('sidr-header-portrait').removeClass('sidr-header-fix');
          $body.removeClass('sidr-body-portrait');
          return;
        } else { // close in portrait

          console.log('close in portrait');

          $menu.removeClass('sidr-header-portrait');


          if(side === 'left') {
            headerAnimation = {'left': 0};
            bodyAnimation = {left: 0};
            menuAnimation = {left: '-' + menuWidth + 'px'};

          } else if(side === 'right') {
            headerAnimation = {'right': 0};
            bodyAnimation = {right: 0};
            menuAnimation = {right: '-' + menuWidth + 'px'};
          }

          if(headerAnimation) {
            $header.animate(headerAnimation, speed, function() {
              $header.toggleClass(responsiveClass.header_fix);
            });
          }

          $body.animate(bodyAnimation, speed, function() {
            $body.removeAttr('style')
              .removeClass(responsiveClass.body_left)
              .removeClass(responsiveClass.body_right);
          });
          $menu.animate(menuAnimation, speed, function() {
            $menu.removeClass(responsiveClass.menu);
            $menu.removeAttr('style');
            $body.removeAttr('style');

          });

          $menu.removeClass('sidr-menu-portrait-left').removeClass('sidr-menu-portrait-right');
          $body.removeClass('sidr-body-portrait');
          return;
        }

        // Lock sidr
        sidrMoving = true;

        // Right or left menu?
        if(side === 'left') {
          bodyAnimation = {left: 0};
          menuAnimation = {left: '-' + menuWidth + 'px'};
        }
        else {
          bodyAnimation = {right: 0};
          menuAnimation = {right: '-' + menuWidth + 'px'};
        }

        // Close menu
        scrollTop = $html.scrollTop();
        $html.removeAttr('style').scrollTop(scrollTop);
        $body.animate(bodyAnimation, speed);

        $menu.animate(menuAnimation, speed, function() {
          $menu.removeAttr('style');
          $body.removeAttr('style');
          $('html').removeAttr('style');
          sidrMoving = false;
          sidrOpened = false;
          // Callback
          if(typeof callback === 'function') {
            callback(name);
          }
        });

      }
    }
  };

  // Sidr public methods
  var methods = {
    init: function(name, callback) {
      privateMethods.execute('init', name, callback);
    },
    open: function(name, callback) {
      privateMethods.execute('open', name, callback);
    },
    close: function(name, callback) {
      privateMethods.execute('close', name, callback);
    },
    toogle: function(name, callback) {
      privateMethods.execute('toogle', name, callback);
    }
  };

  $.sidr = function( method ) {

    if ( methods[method] ) {
      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'function' ||  typeof method === 'string'  || ! method ) {
      return methods.toogle.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.sidr' );
    }

  };

  $.fn.sidr = function( options ) {

    var settings = $.extend( {
      name          : 'sidr', // Name for the 'sidr'
      speed         : 200,    // Accepts standard jQuery effects speeds (i.e. fast, normal or milliseconds)
      side          : 'left', // Accepts 'left' or 'right'
      source        : null,   // Override the source of the content.
      renaming      : true,   // The ids and classes will be prepended with a prefix when loading existent content
      body          : 'body'  // Page container selector,
    }, options);

    var name = settings.name,
        $sideMenu = $('#' + name);

    // If the side menu do not exist create it
    if($sideMenu.length === 0) {
      $sideMenu = $('<div />')
        .attr('id', name)
        .appendTo($('body'));
    }

    // Adding styles and options
    $sideMenu
      .addClass('sidr')
      .addClass(settings.side)
      .data({
        speed          : settings.speed,
        side           : settings.side,
        body           : settings.body
      });


    // The menu content
    if(typeof settings.source === 'function') {
      var newContent = settings.source(name);
      privateMethods.loadContent($sideMenu, newContent);
    } else if(typeof settings.source === 'string' && privateMethods.isUrl(settings.source)) {
      $.get(settings.source, function(data) {
        privateMethods.loadContent($sideMenu, data);
      });
    } else if(typeof settings.source === 'string') {
      var htmlContent = '';
      var selectors   = settings.source.split(',');

      $.each(selectors, function(index, element) {
        htmlContent += '<div class="sidr-inner">' + $(element).html() + '</div>';
      });

      // Renaming ids and classes
      if(settings.renaming) {
        var $htmlContent = $('<div />').html(htmlContent);
        $htmlContent.find('*').each(function(index, element) {
          var $element = $(element);
          privateMethods.addPrefix($element);
        });
        htmlContent = $htmlContent.html();
      }
      privateMethods.loadContent($sideMenu, htmlContent);
    } else if(settings.source !== null) {
      $.error('Invalid Sidr Source');
    }

    return this.each(function(){

      var $this = $(this),
          data = $this.data('sidr');

      // If the plugin hasn't been initialized yet
      if (!data) {
        $this.data('sidr', name);
        $this.on('click', function(e) {
          console.log('trigger');
          e.preventDefault();
          methods.toogle(name);
        });
      }
    });
  };

})(jQuery);