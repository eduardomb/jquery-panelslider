/**
 * jQuery Panel Slider plugin v0.3.4
 * https://github.com/eduardomb/jquery-panelslider
 */
(function(root) {
    'use strict';

    var $ = root.jQuery || root.Zepto
    ,   Modernizr = root.Modernizr
    ,   transEndEventName // the prefixed transition end event
    ;

    // These clases are added to the panel and body elements
    // to help customize the UI during and after animations:
    var psOpenClass = 'ps-open'   // added after the panel is open
    ,   psOpeningClass = 'ps-in'  // added while the panel is opening
    ,   psClosingClass = 'ps-out' // added while the panel is closing

    ,   psActivePanelClass = 'ps-active-panel'
    ,   dotActivePanelClass = '.' + psActivePanelClass

    ,   defaults = {
            side: 'left',                 // panel side: left or right
            duration: 200,                // Transition duration in miliseconds
            clickClose: true,             // If true closes panel when clicking outside it
            openClass: null,              // if present, this class is added to the open menu panel
            openBodyClass: null,          // a class to be added to body when the menu is open; defaults to .openClass
            animatedClass: 'ps-animated', // when this class is present, it is considered to be animated by css
            animate: true,                // if false, no animations are used
            animated: false,              // bool, same effect as if .animatedClass is present
            pushContainer: null,          // what to push? defaulst to body
            onOpen: null,                 // When supplied, function is called after the panel opens
            easingOpen: null, // Easing method for opening, requires jQuery Easing Plugin 1.3
            easingClose: null // Easing method for opening, requires jQuery Easing Plugin 1.3
        }
    ;

    var $body = $('body')
    ,   _sliding = false
    ;

    function isOpen(panel, options) {
        return panel.length && ( panel.hasClass(psActivePanelClass) );
    }

    function _slideIn(panel, callback) {
        var panelWidth = panel.outerWidth(true),
            bodyAnimation = {},
            panelAnimation = {},
            options = panel.data(),
            animate = options.animate && options.duration,
            animated = options.animated && transEndEventName, // rely on transition.js from bootstrap
            $push = options.pushContainer || $body,
            $touchedElements = panel.add($push).add($body),
            pushIsStatic = $push.css('position') == 'static'
            ;

        if(isOpen(panel) || _sliding) {
            return;
        }

        panel.trigger('psBeforeOpen', [options]);

        _sliding = true;
        panel.addClass(psActivePanelClass).css({
          position: 'fixed',
          top: 0,
          height: '100%',
          'z-index': 999999
        });

        switch (options.side) {
          case 'left':
            panel.css({
              left: '-' + panelWidth + 'px',
              right: 'auto'
            });
            if ( pushIsStatic ) {
                bodyAnimation['margin-left'] = '+=' + panelWidth;
            }
            else {
                if ( $push.css('left') == 'auto' ) {
                    bodyAnimation['right'] = '-=' + panelWidth;
                }
                else {
                    bodyAnimation['left'] = '+=' + panelWidth;
                }
            }
            panelAnimation.left = '+=' + panelWidth;
            break;

          case 'right':
            panel.css({
              left: 'auto',
              right: '-' + panelWidth + 'px'
            });
            if ( pushIsStatic ) {
                bodyAnimation['margin-left'] = '-=' + panelWidth;
            }
            else {
                if ( $push.css('right') == 'auto' ) {
                    bodyAnimation['left'] = '-=' + panelWidth;
                }
                else {
                    bodyAnimation['right'] = '+=' + panelWidth;
                }
            }
            panelAnimation.right = '+=' + panelWidth;
            break;
        }

        var next = function(evt) {
                _sliding = false;
                $touchedElements.removeClass(psOpeningClass).addClass(psOpenClass);

                panel.trigger('psOpen', [options]);
                if(typeof options.onOpen == 'function') {
                    options.onOpen();
                }
                if ( typeof callback == 'function' ) {
                    callback.call(panel, options);
                }
            }
        ;

        panel.show();
        $touchedElements.removeClass(psClosingClass+' '+psOpenClass).addClass(psOpeningClass);

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
            $push.animate(bodyAnimation, options.duration, options.easingOpen);
            panel.animate(panelAnimation, options.duration, options.easingOpen, next);
        }
        else {
            $push.css(bodyAnimation);
            panel.css(panelAnimation);
            if ( animated ) {
                panel.one(transEndEventName, next);
            }
            else {
                setTimeout(next,16);
            }
        }
    }

    function _slideOut(callback) {
        var panel = $(dotActivePanelClass),
            panelWidth = panel.outerWidth(true),
            bodyAnimation = {},
            panelAnimation = {},
            options = panel.data(),
            duration = options.duration,
            easingClose = options.easingClose,
            openClass = options.openClass,
            openBodyClass = options.openBodyClass || openClass,
            animate = options.animate && duration,
            animated = options.animated && transEndEventName, // rely on transition.js from bootstrap
            $push = options.pushContainer || $body,
            $touchedElements = panel.add($push).add($body),
            pushIsStatic = $push.css('position') == 'static'
            ;

        if(!panel.length || !isOpen(panel) || _sliding) {
          return;
        }

        panel.trigger('psBeforeClose', [options]);

        if ( animated ) {
            panel[0].offsetWidth;  // reflow for transition
        }
        if ( openClass ) {
            panel.removeClass(openClass);
        }

        _sliding = true;

        switch(panel.data('side')) {
          case 'left':
            if ( pushIsStatic ) {
                bodyAnimation['margin-left'] = '-=' + panelWidth;
            }
            else {
                if ( $push.css('left') == 'auto' ) {
                    bodyAnimation['right'] = '+=' + panelWidth;
                }
                else {
                    bodyAnimation['left'] = '-=' + panelWidth;
                }
            }
            panelAnimation.left = '-=' + panelWidth;
            break;

          case 'right':
            if ( pushIsStatic ) {
                bodyAnimation['margin-left'] = '+=' + panelWidth;
            }
            else {
                if ( $push.css('right') == 'auto' ) {
                    bodyAnimation['left'] = '+=' + panelWidth;
                }
                else {
                    bodyAnimation['right'] = '-=' + panelWidth;
                }
            }
            panelAnimation.right = '-=' + panelWidth;
            break;
        }

        var next = function(evt) {
                panel.hide();
                panel.removeClass(psActivePanelClass);
                _sliding = false;

                if ( openBodyClass ) {
                    $body.removeClass(openBodyClass);
                }

                $touchedElements.removeClass(psClosingClass);

                panel.trigger('psClose', [options]);
                if ( typeof options.onClose == 'function' ) {
                    options.onClose();
                }
                if ( typeof callback == 'function' ) {
                    callback.call(panel, options);
                }
            }
        ;

        $touchedElements
            .removeClass(psOpeningClass+' '+psOpenClass)
            .addClass(psClosingClass)
        ;

        if ( animate ) {
            panel.animate(panelAnimation, duration, easingClose);
            $push.animate(bodyAnimation, duration, easingClose, next);
        }
        else {
            panel.css(panelAnimation);
            $push.css(bodyAnimation);

            if ( animated ) {
                panel.one(transEndEventName, next);
            }
            else {
                setTimeout(next,16);
            }
        }
    }

    function _psInit(element, options) {
        var _options = element.data();
        if ( !_options.psInited ) {
            _options = $.extend({}, $.panelslider.defaults, options, _options);

            var $push = _options.pushContainer ? $(_options.pushContainer) : $body;

            if ( _options.pushContainer ) {
                _options.pushContainer = $push;
            }

            // Is it animated by CSS?
            var hasAnimatedClass = _options.animatedClass && element.hasClass(_options.animatedClass);
            if ( hasAnimatedClass ) {
                _options.animated = true;
            }

            // If it is animated by CSS, don't animate it with JS again
            if ( _options.animated ) {
                _options.animate = false;
                if ( !hasAnimatedClass && _options.animatedClass ) {
                    element.add($push).addClass(_options.animatedClass)
                }
            }

            _options.psInited = true;
            element.data(_options);
        }

        return _options;
    }

  $.panelslider = function (element, options) {
    var activePanel = $(dotActivePanelClass);
    var _options = _psInit(element, options);

    // If another panel is opened, close it before opening the new one
    var activePanelIsOpen = isOpen(activePanel, _options);
    if(activePanelIsOpen && activePanel[0] != element[0]) {
      _slideOut(function() {
        _slideIn(element);
      });
    } else if(!activePanel.length || !activePanelIsOpen) {
      _slideIn(element);
    }
  };

  $.panelslider.close = _slideOut;

  $.panelslider.defaults = defaults;

  $(document)
    // Bind click outside panel and ESC key to close panel if clickClose is true
    .on('click keyup', function(evt) {
        var panel = $(dotActivePanelClass);

        if ( evt.type == 'keyup' && evt.keyCode != 27 ) {
            return;
        }

        if ( isOpen(panel) && panel.data('clickClose') ) {
          _slideOut();
        }
    })

    .on('dblclick', function (evt) {
        var panel = $(dotActivePanelClass);
        if ( isOpen(panel) ) {
          _slideOut();
        }
    })

    // Prevent click on panel to close it
    .on('click dblclick', dotActivePanelClass, function(evt) {
        evt.stopPropagation();
    })
  ;

  $.fn.panelslider = function(options) {
    var panel = $(options.context || this.attr('href'));
    _psInit(panel, options);

    this
        .off('click.panelslider')
        .on('click.panelslider', function(evt) {
            evt.preventDefault();
            // evt.stopPropagation();

            var activePanel = $(dotActivePanelClass)
            ,   panel = $(options.context || $(this).attr('href'))
            ;
            // Close panel if it is already opened otherwise open it
            if (isOpen(activePanel) && panel[0] == activePanel[0]) {
                _slideOut();
            }
            else {
                $.panelslider(panel, options);
            }
        })
    ;

    return this;
  };

  // Rely on Modernizr or any other library to set $.support.transition.end to the right
  // transitionend event name:
  if ( Modernizr && Modernizr.csstransitions ) {
    if ( !('transition' in $.support) ) $.support.transition = {};
    // Eg. Twitter Bootstrap (transition.js) could have been set $.support.transition.end to the right value
    if ( !$.support.transition.end ) {
        $.support.transition.end = {
            'WebkitTransition' : 'webkitTransitionEnd'
          , 'OTransition'      : 'oTransitionEnd'
          , 'msTransition'     : 'MSTransitionEnd'
          // , 'MozTransition'    : 'transitionend'
          // , 'transition'       : 'transitionend'
        }[ Modernizr.prefixed( 'transition' ) ] || 'transitionend';
    }
  }

  // Use the prefixed transitionend event name
  (transEndEventName = $.support.transition) && (transEndEventName = transEndEventName.end);

}
(this));
