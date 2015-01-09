/*
 * jQuery Panel Slider plugin v0.3.0
 * https://github.com/eduardomb/jquery-panelslider
*/
(function($) {
    'use strict';

    var defaults = {
        side: 'left',                 // panel side: left or right
        duration: 200,                // Transition duration in miliseconds
        clickClose: true,             // If true closes panel when clicking outside it
        openClass: 'ps-open',         // if present, this class is added to the open menu panel
        openBodyClass: null,          // a class to be added to body when the menu is open; defaults to .openClass
        animatedClass: 'ps-animated', // when this class is present, it is considered to be animated by css
        animate: true,                // if false, no animations are used
        animated: false,              // bool, same effect as if .animatedClass is present
        pushContainer: null,          // what to push? defaulst to body
        onOpen: null                  // When supplied, function is called after the panel opens
    };


  var $body = $('body'),
      _sliding = false;

  function isOpen(panel, options) {
      return panel.length && ( panel.hasClass('ps-active-panel') );
  }

  function _slideIn(panel, options) {
    var panelWidth = panel.outerWidth(true),
        bodyAnimation = {},
        panelAnimation = {},
        animate = options.animate && options.duration,
        animated = options.animated && $.support.transition, // rely on transition.js from bootstrap
        $push = options.pushContainer || $body
        ;

    if(isOpen(panel) || _sliding) {
      return;
    }

    panel.trigger('psBeforeOpen', [options]);

    _sliding = true;
    panel.addClass('ps-active-panel').css({
      position: 'fixed',
      top: 0,
      height: '100%',
      'z-index': 999999
    });
    panel.data(options);

    switch (options.side) {
      case 'left':
        panel.css({
          left: '-' + panelWidth + 'px',
          right: 'auto'
        });
        bodyAnimation['margin-left'] = '+=' + panelWidth;
        panelAnimation.left = '+=' + panelWidth;
        break;

      case 'right':
        panel.css({
          left: 'auto',
          right: '-' + panelWidth + 'px'
        });
        bodyAnimation['margin-right'] = '+=' + panelWidth;
        panelAnimation.right = '+=' + panelWidth;
        break;
    }

    var next = function() {
            _sliding = false;

            panel.trigger('psOpen', [options]);
            if(typeof options.onOpen == 'function') {
                options.onOpen();
            }
        }
    ;

    panel.show();

    if ( animated ) {
        panel[0].offsetWidth;  // reflow for transition
    }

    var openClass = options.openClass;
    if ( openClass ) {
        panel.addClass(openClass);
    }

    var openBodyClass = options.openBodyClass || openClass;
    if ( openBodyClass ) {
        $body.addClass(openBodyClass);
    }

    if ( animate ) {
        $push.animate(bodyAnimation, options.duration);
        panel.animate(panelAnimation, options.duration, next);
    }
    else {
        $push.css(bodyAnimation);
        panel.css(panelAnimation);
        if ( animated ) {
            panel.one(animated.end, next);
        }
        else {
            setTimeout(next,16);
        }
    }
  }

  $.panelslider = function(element, options) {
    var activePanel = $('.ps-active-panel');

    options = $.extend({}, $.panelslider.defaults, element.data(), options);
    
    var $push = options.pushContainer ? $(options.pushContainer) : $body;

    if ( options.pushContainer ) options.pushContainer = $push;
    
    // Is it animated by CSS?
    var hasAnimatedClass = options.animatedClass && element.hasClass(options.animatedClass);
    if ( hasAnimatedClass ) {
        options.animated = true;
    }

    // If it is animated by CSS, don't animate it with JS
    if ( options.animated ) {
        options.animate = false;
        if ( !hasAnimatedClass && options.animatedClass ) {
            element.add($push).addClass(options.animatedClass)
        }
    }

    // If another panel is opened, close it before opening the new one
    var activePanelIsOpen = isOpen(activePanel, options);
    if(activePanelIsOpen && activePanel[0] != element[0]) {
      $.panelslider.close(function() {
        _slideIn(element, options);
      });
    } else if(!activePanel.length || !activePanelIsOpen) {
      _slideIn(element, options);
    }
  };

  $.panelslider.close = function(callback) {
    var panel = $('.ps-active-panel'),
        duration = panel.data('duration'),
        panelWidth = panel.outerWidth(true),
        bodyAnimation = {},
        panelAnimation = {},
        options = panel.data(),
        openClass = options.openClass,
        openBodyClass = options.openBodyClass || openClass,
        animate = options.animate && duration,
        animated = options.animated && $.support.transition, // rely on transition.js from bootstrap
        $push = options.pushContainer || $body
        ;

    if(!panel.length || !isOpen(panel) || _sliding) {
      return;
    }

    panel.trigger('psBeforeClose');

    if ( animated ) {
        panel[0].offsetWidth;  // reflow for transition
    }
    if ( openClass ) {
        panel.removeClass(openClass);
    }
    if ( openBodyClass ) {
        $body.removeClass(openBodyClass);
    }

    _sliding = true;

    switch(panel.data('side')) {
      case 'left':
        bodyAnimation['margin-left'] = '-=' + panelWidth;
        panelAnimation.left = '-=' + panelWidth;
        break;

      case 'right':
        bodyAnimation['margin-right'] = '-=' + panelWidth;
        panelAnimation.right = '-=' + panelWidth;
        break;
    }

    var next = function(evt) {
            panel.hide();
            panel.removeClass('ps-active-panel');
            _sliding = false;

            panel.trigger('psClose');
            if(callback) {
                callback();
            }
        }
    ;

    if ( animate ) {
        panel.animate(panelAnimation, duration);
        $push.animate(bodyAnimation, duration, next);
    }
    else {
        panel.css(panelAnimation);
        $push.css(bodyAnimation);

        if ( animated ) {
            panel.one(animated.end, next);
        }
        else {
            setTimeout(next,16);
        }
    }
  };

  $.panelslider.defaults = defaults;

  $(document)
    // Bind click outside panel and ESC key to close panel if clickClose is true
    .on('click keyup', function(e) {
        var panel = $('.ps-active-panel');

        if(e.type == 'keyup' && e.keyCode != 27) {
          return;
        }

        if(isOpen(panel) && panel.data('clickClose')) {
          $.panelslider.close();
        }
    })

    // Prevent click on panel to close it
    .on('click', '.ps-active-panel', function(e) {
        e.stopPropagation();
    })
  ;

  $.fn.panelslider = function(options) {
    this.on('click', function(e) {
      var activePanel = $('.ps-active-panel'),
          panel = $(options.context || this.getAttribute('href'));

      // Close panel if it is already opened otherwise open it
      if (isOpen(activePanel) && panel[0] == activePanel[0]) {
        $.panelslider.close();
      } else {
        $.panelslider(panel, options);
      }

      e.preventDefault();
      e.stopPropagation();
    });

    return this;
  };
}
(jQuery));
