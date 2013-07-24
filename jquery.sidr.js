;(function($){

  var sidrMoving = false;
  var sidrOpened = false;
  var screenWidth = 767;

  responsiveClass = {
    menu_left: 'sidr-menu-left',
    menu_right: 'sidr-menu-right',
    header_left: 'sidr-header-left',
    header_right: 'sidr-header-right',
    body_left: 'sidr-body-left',
    body_right: 'sidr-body-right',
    content: 'sidr-content',

    menu_left_portrait: 'sidr-menu-left-portrait',
    menu_right_portrait: 'sidr-menu-right-portrait',
    body_left_portrait: 'sidr-body-left-portrait',
    body_right_portrait: 'sidr-body-right-portrait',
    header_left_portrait: 'sidr-header-left-portrait',
    header_right_portrait: 'sidr-header-right-portrait',


    menu_class: function(side) {
      return (side == 'left') ? responsiveClass.menu_left : responsiveClass.menu_right;
    },

    header_class: function(side) {
      return (side === 'left') ? responsiveClass.header_left : responsiveClass.header_right;
    },
    body_class: function(side) {
      return (side === 'left') ? responsiveClass.body_left : responsiveClass.body_right;
    },
    body_portrait_class: function(side) {
      return (side === 'left') ? responsiveClass.body_left_portrait : responsiveClass.body_right_portrait;
    },
    header_portrait_class: function(side) {
      return (side === 'left') ? responsiveClass.header_left_portrait : responsiveClass.header_right_portrait;
    },
    menu_portrait_class: function(side) {
      return (side === 'left') ? responsiveClass.menu_left_portrait : responsiveClass.menu_right_portrait;
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
      var $header = $($menu.data('header'));
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

      // fix when window resize
      $(window).resize(function() {
      });

      if(action === 'init') {
        $header.addClass(responsiveClass.header_class(side));
        $body.addClass(responsiveClass.body_class(side));
        $menu.addClass(responsiveClass.menu_class(side));
        return;
      }

      // open the menu
      if('open' === action || ('toggle' === action && !$menu.is(':visible'))) {

        // Check if we can open it
        if($menu.is(':visible') || sidrMoving) { return; }

        if(bodyWidth > screenWidth) { // open in landscape
          $header.addClass(responsiveClass.header_class(side));
          $body.addClass(responsiveClass.body_class(side));
          $menu.addClass(responsiveClass.menu_class(side));
        } else { // open in portrait
          $header.addClass(responsiveClass.header_portrait_class(side));
          $body.addClass(responsiveClass.body_portrait_class(side)).css({
            width: bodyWidth + 'px'
          });

          // fix for resizing from portrait to landscape
          window.sidr_resize = true;
          $(window).resize(function(e) {
            if(window.sidr_resize) {
              $body.css('width', 'auto');
            }
          });

          $menu.addClass(responsiveClass.menu_portrait_class(side));
        }
        return;
      }

      // close the menu
      if(!$menu.is(':visible') || sidrMoving) { return; }

      $header
        .removeClass(responsiveClass.header_left)
        .removeClass(responsiveClass.header_right)
        .removeClass(responsiveClass.header_left_portrait)
        .removeClass(responsiveClass.header_right_portrait);

      $body
        .removeClass(responsiveClass.body_left)
        .removeClass(responsiveClass.body_right)
        .removeClass(responsiveClass.body_left_portrait)
        .removeClass(responsiveClass.body_right_portrait);

      $menu
        .removeClass(responsiveClass.menu_left)
        .removeClass(responsiveClass.menu_right)
        .removeClass(responsiveClass.menu_left_portrait)
        .removeClass(responsiveClass.menu_right_portrait);

      return;
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
    toggle: function(name, callback) {
      privateMethods.execute('toggle', name, callback);
    }
  };

  $.sidr = function(method) {
    if (methods[method]) {
      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if (typeof method === 'function' ||  typeof method === 'string'  || ! method) {
      return methods.toggle.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.sidr' );
    }
  };

  $.fn.sidr = function( options ) {

    var settings = $.extend( {
      name          : 'sidr', // Name for the 'sidr'
      side          : 'left', // Accepts 'left' or 'right'
      source        : null,   // Override the source of the content.
      renaming      : true,   // The ids and classes will be prepended with a prefix when loading existent content
      body          : 'body',  // Page container selector,
      header        : 'header' // fixed header selector
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
      .addClass('sidr-' + settings.side)
      .data({
        side           : settings.side,
        header         : settings.header,
        body           : settings.body
      });

    $(settings.header).addClass('sidr-header');
    $(settings.body).addClass('sidr-body');

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

    return this.each(function() {

      var $this = $(this);
      var data = $this.data('sidr');

      if(!data) {
        $this.data('sidr', name);

        if($.mobile) {
          $this.on('tap', function(e) {
            e.preventDefault();
            methods.toggle(name);
          });
        } else {
          $this.on('click', function(e) {
            e.preventDefault();
            methods.toggle(name);
          });
        }
      }
    });
  };

})(jQuery);