var ScrollWizardry = (function () {
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

/* eslint-env browser */

var U = {};

var i = void 0;

/**
   * ------------------------------
   * Type testing
   * ------------------------------
   */

var _type = function _type(v) {
  return Object.prototype.toString.call(v).replace(/^\[object (.+)\]$/, '$1').toLowerCase();
};
_type.String = function (v) {
  return _type(v) === 'string';
};
_type.Function = function (v) {
  return _type(v) === 'function';
};
_type.Array = function (v) {
  return Array.isArray(v);
};
_type.Number = function (v) {
  return !_type.Array(v) && v - parseFloat(v) + 1 >= 0;
};
_type.DomElement = function (o) {
  return (typeof HTMLElement === 'undefined' ? 'undefined' : _typeof(HTMLElement)) === 'object' ? o instanceof HTMLElement : // DOM2
  o && (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === 'object' && o !== null && o.nodeType === 1 && typeof o.nodeName === 'string';
};
U.type = _type;

/**
   * ------------------------------
   * Internal helpers
   * ------------------------------
   */

// parse float and fall back to 0.
var floatval = function floatval(number) {
  return parseFloat(number) || 0;
};

// get current style IE safe (otherwise IE would return calculated values for 'auto')
var _getComputedStyle = function _getComputedStyle(elem) {
  return elem.currentStyle ? elem.currentStyle : window.getComputedStyle(elem);
};

// get element dimension (width or height)
var _dimension = function _dimension(which, elem, outer, includeMargin) {
  elem = elem === document ? window : elem;
  if (elem === window) {
    includeMargin = false;
  } else if (!_type.DomElement(elem)) {
    return 0;
  }
  which = which.charAt(0).toUpperCase() + which.substr(1).toLowerCase();
  var dimension = (outer ? elem['offset' + which] || elem['outer' + which] : elem['client' + which] || elem['inner' + which]) || 0;
  if (outer && includeMargin) {
    var style = _getComputedStyle(elem);
    dimension += which === 'Height' ? floatval(style.marginTop) + floatval(style.marginBottom) : floatval(style.marginLeft) + floatval(style.marginRight);
  }
  return dimension;
};

// converts 'margin-top' into 'marginTop'
var _camelCase = function _camelCase(str) {
  return str.replace(/^[^a-z]+([a-z])/g, '$1').replace(/-([a-z])/g, function (g) {
    return g[1].toUpperCase();
  });
};

/**
   * ------------------------------
   * External helpers
   * ------------------------------
   */

// extend obj – same as jQuery.extend({}, objA, objB)
U.extend = function (obj) {
  obj = obj || {};
  for (i = 1; i < arguments.length; i++) {
    if (!arguments[i]) {
      continue;
    }
    for (var key in arguments[i]) {
      if (arguments[i].hasOwnProperty(key)) {
        obj[key] = arguments[i][key];
      }
    }
  }
  return obj;
};

// check if a css display type results in margin-collapse or not
U.isMarginCollapseType = function (str) {
  return ['block', 'flex', 'list-item', 'table', '-webkit-box'].indexOf(str) > -1;
};

// implementation of requestAnimationFrame
// based on https://gist.github.com/paulirish/1579671

var lastTime = 0;

var vendors = ['ms', 'moz', 'webkit', 'o'];
var _requestAnimationFrame = window.requestAnimationFrame;
var _cancelAnimationFrame = window.cancelAnimationFrame;

// try vendor prefixes if the above doesn't work
for (i = 0; !_requestAnimationFrame && i < vendors.length; ++i) {
  _requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
  _cancelAnimationFrame = window[vendors[i] + 'CancelAnimationFrame'] || window[vendors[i] + 'CancelRequestAnimationFrame'];
}

// fallbacks
if (!_requestAnimationFrame) {
  _requestAnimationFrame = function _requestAnimationFrame(callback) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    var id = window.setTimeout(function () {
      callback(currTime + timeToCall);
    }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };
}

if (!_cancelAnimationFrame) {
  _cancelAnimationFrame = function _cancelAnimationFrame(id) {
    window.clearTimeout(id);
  };
}

U.rAF = _requestAnimationFrame.bind(window);
U.cAF = _cancelAnimationFrame.bind(window);

var loglevels = ['error', 'warn', 'log'];

var console = window.console || {};

console.log = console.log || function () {}; // no console log, well - do nothing then...

// make sure methods for all levels exist.
for (i = 0; i < loglevels.length; i++) {
  var method = loglevels[i];
  if (!console[method]) {
    console[method] = console.log; // prefer .log over nothing
  }
}

U.log = function (loglevel) {
  if (loglevel > loglevels.length || loglevel <= 0) loglevel = loglevels.length;
  var now = new Date();
  var time = ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2) + ':' + ('0' + now.getSeconds()).slice(-2) + ':' + ('00' + now.getMilliseconds()).slice(-3);
  var method = loglevels[loglevel - 1];
  var args = Array.prototype.splice.call(arguments, 1);
  var func = Function.prototype.bind.call(console[method], console);
  args.unshift(time);
  func.apply(console, args);
};

/**
   * ------------------------------
   * DOM Element info
   * ------------------------------
   */
// always returns a list of matching DOM elements, from a selector, a DOM element or an list of elements or even an array of selectors
var _get = {};
_get.elements = function (selector) {
  var arr = [];
  if (_type.String(selector)) {
    try {
      selector = document.querySelectorAll(selector);
    } catch (e) {
      // invalid selector
      return arr;
    }
  }
  if (_type(selector) === 'nodelist' || _type.Array(selector)) {
    for (var _i = 0, ref = arr.length = selector.length; _i < ref; _i++) {
      // list of elements
      var elem = selector[_i];
      arr[_i] = _type.DomElement(elem) ? elem : _get.elements(elem); // if not an element, try to resolve recursively
    }
  } else if (_type.DomElement(selector) || selector === document || selector === window) {
    arr = [selector]; // only the element
  }
  return arr;
};
// get scroll top value
_get.scrollTop = function (elem) {
  return elem && typeof elem.scrollTop === 'number' ? elem.scrollTop : window.pageYOffset || 0;
};
// get scroll left value
_get.scrollLeft = function (elem) {
  return elem && typeof elem.scrollLeft === 'number' ? elem.scrollLeft : window.pageXOffset || 0;
};
// get element height
_get.width = function (elem, outer, includeMargin) {
  return _dimension('width', elem, outer, includeMargin);
};
// get element width
_get.height = function (elem, outer, includeMargin) {
  return _dimension('height', elem, outer, includeMargin);
};

// get element position (optionally relative to viewport)
_get.offset = function (elem, relativeToViewport) {
  var offset = { top: 0, left: 0 };
  if (elem && elem.getBoundingClientRect) {
    // check if available
    var rect = elem.getBoundingClientRect();
    offset.top = rect.top;
    offset.left = rect.left;
    if (!relativeToViewport) {
      // clientRect is by default relative to viewport...
      offset.top += _get.scrollTop();
      offset.left += _get.scrollLeft();
    }
  }
  return offset;
};
U.get = _get;

/**
   * ------------------------------
   * DOM Element manipulation
   * ------------------------------
   */

U.addClass = function (elem, classname) {
  if (classname) {
    if (elem.classList) {
      elem.classList.add(classname);
    } else {
      elem.className += ' ' + classname;
    }
  }
};

U.removeClass = function (elem, classname) {
  if (classname) {
    if (elem.classList) {
      elem.classList.remove(classname);
    } else {
      elem.className = elem.className.replace(new RegExp('(^|\\b)' + classname.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
  }
};

// if options is string -> returns css value
// if options is array -> returns object with css value pairs
// if options is object -> set new css values
U.css = function (elem, options) {
  if (_type.String(options)) {
    return _getComputedStyle(elem)[_camelCase(options)];
  } else if (_type.Array(options)) {
    var obj = {};
    var style = _getComputedStyle(elem);
    options.forEach(function (option, key) {
      obj[option] = style[_camelCase(option)];
    });
    return obj;
  }
  for (var option in options) {
    var val = options[option];
    if (val === parseFloat(val)) {
      // assume pixel for seemingly numerical values
      val += 'px';
    }
    elem.style[_camelCase(option)] = val;
  }
};

var Event$1 = function Event(type, namespace, target, vars) {
  classCallCheck(this, Event);

  vars = vars || {};
  for (var key in vars) {
    this[key] = vars[key];
  }
  this.type = type;
  this.target = target;
  this.currentTarget = target;
  this.namespace = namespace || '';
  this.timeStamp = Date.now();
  this.timestamp = this.timeStamp;
  return this;
};

/* eslint-env browser */

var FONT_SIZE = '0.85em';
var ZINDEX = '9999';

var TPL = {
  start: function start(color) {
    // inner element (for bottom offset -1, while keeping top position 0)
    var inner = document.createElement('div');
    inner.textContent = 'start';
    U.css(inner, {
      position: 'absolute',
      overflow: 'visible',
      'border-width': 0,
      'border-style': 'solid',
      color: color,
      'border-color': color
    });
    var element = document.createElement('div');
    // wrapper
    U.css(element, {
      position: 'absolute',
      overflow: 'visible',
      width: 0,
      height: 0
    });
    element.appendChild(inner);
    return element;
  },
  end: function end(color) {
    var element = document.createElement('div');
    element.textContent = 'end';
    U.css(element, {
      position: 'absolute',
      overflow: 'visible',
      'border-width': 0,
      'border-style': 'solid',
      color: color,
      'border-color': color
    });
    return element;
  },
  bounds: function bounds() {
    var element = document.createElement('div');
    U.css(element, {
      position: 'absolute',
      overflow: 'visible',
      'white-space': 'nowrap',
      'pointer-events': 'none',
      'font-size': FONT_SIZE
    });
    element.style.zIndex = ZINDEX;
    return element;
  },
  trigger: function trigger(color) {
    // inner to be above or below line but keep position
    var inner = document.createElement('div');
    inner.textContent = 'trigger';
    U.css(inner, {
      position: 'relative'
    });
    // wrapper for right: 0 and main element has no size
    var wrapper = document.createElement('div');
    U.css(wrapper, {
      position: 'absolute',
      overflow: 'visible',
      'border-width': 0,
      'border-style': 'solid',
      color: color,
      'border-color': color
    });
    wrapper.appendChild(inner);
    // element
    var element = document.createElement('div');
    U.css(element, {
      position: 'fixed',
      overflow: 'visible',
      'white-space': 'nowrap',
      'pointer-events': 'none',
      'font-size': FONT_SIZE
    });
    element.style.zIndex = ZINDEX;
    element.appendChild(wrapper);
    return element;
  }
};

var _autoindex$1 = 0;

var Indicator = function () {
  function Indicator(scene, options) {
    classCallCheck(this, Indicator);

    options.name = options.name || _autoindex$1;

    _autoindex$1++;

    this._elemBounds = TPL.bounds();
    this._elemStart = TPL.start(options.colorStart);
    this._elemEnd = TPL.end(options.colorEnd);

    this._boundsContainer = options.parent && U.get.elements(options.parent)[0];

    // prepare bounds elements
    this._elemStart.firstChild.textContent += ' ' + options.name;
    this._elemEnd.textContent += ' ' + options.name;
    this._elemBounds.appendChild(this._elemStart);
    this._elemBounds.appendChild(this._elemEnd);

    this._vertical = null;
    this._ctrl = null;

    // set public variables
    this.options = options;
    this.bounds = this._elemBounds;
    this.triggerGroup = undefined; // will be set later

    this.scene = scene;
  }

  // add indicators to DOM


  createClass(Indicator, [{
    key: 'add',
    value: function add() {
      var _this = this;

      this._ctrl = this.scene.controller();
      this._vertical = this._ctrl.info('vertical');

      var isDocument = this._ctrl.info('isDocument');

      if (!this._boundsContainer) {
        // no parent supplied or doesnt exist
        this._boundsContainer = isDocument ? document.body : this._ctrl.info('container'); // check if window/document (then use body)
      }
      if (!isDocument && U.css(this._boundsContainer, 'position') === 'static') {
        // position mode needed for correct positioning of indicators
        U.css(this._boundsContainer, { position: 'relative' });
      }

      // add listeners for updates
      this.scene.on('change.plugin_addIndicators', this._handleTriggerParamsChange);
      this.scene.on('shift.plugin_addIndicators', this._handleBoundsParamsChange);

      // updates trigger & bounds (will add elements if needed)
      this._updateTriggerGroup();
      this._updateBounds();

      setTimeout(function () {
        // do after all execution is finished otherwise sometimes size calculations are off
        _this._ctrl.updateBoundsPositions(_this);
      }, 0);

      U.log(3, 'added indicators');
    }

    // remove indicators from DOM

  }, {
    key: 'remove',
    value: function remove() {
      if (this.triggerGroup) {
        // if not set there's nothing to remove
        this.scene.off('change.plugin_addIndicators', this._handleTriggerParamsChange);
        this.scene.off('shift.plugin_addIndicators', this._handleBoundsParamsChange);

        if (this.triggerGroup.members.length > 1) {
          // just remove from memberlist of old group
          var group = this.triggerGroup;
          group.members.splice(group.members.indexOf(this), 1);
          this._ctrl._indicators.updateTriggerGroupLabel(group);
          this._ctrl._indicators.updateTriggerGroupPositions(group);
          this.triggerGroup = undefined;
        } else {
          // remove complete group
          this._removeTriggerGroup();
        }
        this._removeBounds();

        U.log(3, 'removed indicators');
      }
    }

    // event handler for when bounds params change

  }, {
    key: '_handleBoundsParamsChange',
    value: function _handleBoundsParamsChange() {
      this._updateBounds();
    }

    // event handler for when trigger params change

  }, {
    key: '_handleTriggerParamsChange',
    value: function _handleTriggerParamsChange(event) {
      if (event.what === 'triggerHook') {
        this._updateTriggerGroup();
      }
    }

    // adds an new bounds elements to the array and to the DOM

  }, {
    key: '_addBounds',
    value: function _addBounds() {
      var v = this._ctrl.info('vertical');
      // apply stuff we didn't know before...
      U.css(this._elemStart.firstChild, {
        'border-bottom-width': v ? 1 : 0,
        'border-right-width': v ? 0 : 1,
        bottom: v ? -1 : this.options.indent,
        right: v ? this.options.indent : -1,
        padding: v ? '0 8px' : '2px 4px'
      });
      U.css(this._elemEnd, {
        'border-top-width': v ? 1 : 0,
        'border-left-width': v ? 0 : 1,
        top: v ? '100%' : '',
        right: v ? this.options.indent : '',
        bottom: v ? '' : this.options.indent,
        left: v ? '' : '100%',
        padding: v ? '0 8px' : '2px 4px'
      });
      // append
      this._boundsContainer.appendChild(this._elemBounds);
    }

    // remove bounds from list and DOM

  }, {
    key: '_removeBounds',
    value: function _removeBounds() {
      this._elemBounds.parentNode.removeChild(this._elemBounds);
    }

    // update the start and end positions of the scene

  }, {
    key: '_updateBounds',
    value: function _updateBounds() {
      if (this._elemBounds.parentNode !== this._boundsContainer) {
        this._addBounds(); // Add Bounds elements (start/end)
      }
      var css = {};
      css[this._vertical ? 'top' : 'left'] = this.scene.triggerPosition();
      css[this._vertical ? 'height' : 'width'] = this.scene.duration();
      U.css(this._elemBounds, css);
      U.css(this._elemEnd, {
        display: this.scene.duration() > 0 ? '' : 'none'
      });
    }

    // adds an new trigger group to the array and to the DOM

  }, {
    key: '_addTriggerGroup',
    value: function _addTriggerGroup() {
      var triggerElem = TPL.trigger(this.options.colorTrigger); // new trigger element
      var css = {};
      css[this._vertical ? 'right' : 'bottom'] = 0;
      css[this._vertical ? 'border-top-width' : 'border-left-width'] = 1;
      U.css(triggerElem.firstChild, css);
      U.css(triggerElem.firstChild.firstChild, {
        padding: this._vertical ? '0 8px 3px 8px' : '3px 4px'
      });
      document.body.appendChild(triggerElem); // directly add to body
      var newGroup = {
        triggerHook: this.scene.triggerHook(),
        element: triggerElem,
        members: [this]
      };
      this._ctrl._indicators.groups.push(newGroup);
      this.triggerGroup = newGroup;
      // update right away
      this._ctrl.updateTriggerGroupLabel(newGroup);
      this._ctrl.updateTriggerGroupPositions(newGroup);
    }
  }, {
    key: '_removeTriggerGroup',
    value: function _removeTriggerGroup() {
      this._ctrl._indicators.groups.splice(this._ctrl._indicators.groups.indexOf(this.triggerGroup), 1);
      this.triggerGroup.element.parentNode.removeChild(this.triggerGroup.element);
      this.triggerGroup = undefined;
    }

    // updates the trigger group -> either join existing or add new one

  }, {
    key: '_updateTriggerGroup',
    value: function _updateTriggerGroup() {
      var triggerHook = this.scene.triggerHook();
      var closeEnough = 0.0001;

      // Have a group, check if it still matches
      if (this.triggerGroup) {
        if (Math.abs(this.triggerGroup.triggerHook - triggerHook) < closeEnough) {
          // _util.log(0, "trigger", options.name, "->", "no need to change, still in sync");
          return; // all good
        }
      }

      // Don't have a group, check if a matching one exists
      // _util.log(0, "trigger", options.name, "->", "out of sync!");
      var groups = this._ctrl._indicators.groups;
      var group = void 0;
      var i = groups.length;

      while (i--) {
        group = groups[i];
        if (Math.abs(group.triggerHook - triggerHook) < closeEnough) {
          // found a match!
          // _util.log(0, "trigger", options.name, "->", "found match");
          if (this.triggerGroup) {
            // do I have an old group that is out of sync?
            if (this.triggerGroup.members.length === 1) {
              // is it the only remaining group?
              // _util.log(0, "trigger", options.name, "->", "kill");
              // was the last member, remove the whole group
              this._removeTriggerGroup();
            } else {
              this.triggerGroup.members.splice(this.triggerGroup.members.indexOf(this), 1); // just remove from memberlist of old group
              this._ctrl._indicators.updateTriggerGroupLabel(this.triggerGroup);
              this._ctrl._indicators.updateTriggerGroupPositions(this.triggerGroup);
              // _util.log(0, "trigger", options.name, "->", "removing from previous member list");
            }
          }
          // join new group
          group.members.push(this);
          this.triggerGroup = group;
          this._ctrl._indicators.updateTriggerGroupLabel(group);
          return;
        }
      }

      // at this point I am obviously out of sync and don't match any other group
      if (this.triggerGroup) {
        if (this.triggerGroup.members.length === 1) {
          // _util.log(0, "trigger", options.name, "->", "updating existing");
          // out of sync but i'm the only member => just change and update
          this.triggerGroup.triggerHook = triggerHook;
          this._ctrl._indicators.updateTriggerGroupPositions(this.triggerGroup);
          return;
        }
        // _util.log(0, "trigger", options.name, "->", "removing from previous member list");
        this.triggerGroup.members.splice(this.triggerGroup.members.indexOf(this), 1); // just remove from memberlist of old group
        this._ctrl._indicators.updateTriggerGroupLabel(this.triggerGroup);
        this._ctrl._indicators.updateTriggerGroupPositions(this.triggerGroup);
        this.triggerGroup = undefined; // need a brand new group...
      }
      // _util.log(0, "trigger", options.name, "->", "add a new one");
      // did not find any match, make new trigger group
      this._addTriggerGroup();
    }
  }]);
  return Indicator;
}();

/* eslint-env browser */

var PIN_SPACER_ATTRIBUTE$1 = 'data-scrollmagic-pin-spacer';

var NAMESPACE$1 = 'ScrollWizardry.Scene';

var SCENE_STATE_BEFORE = 'BEFORE';
var SCENE_STATE_DURING = 'DURING';
var SCENE_STATE_AFTER = 'AFTER';

var _state = SCENE_STATE_BEFORE;
var _progress = 0;
var _scrollOffset = { start: 0, end: 0 };
var _triggerPos = 0;
var _durationUpdateMethod = void 0;
var _controller = void 0;
var _listeners = {};

var _pin = void 0;
var _pinOptions = void 0;

var _cssClasses = void 0;
var _cssClassElems = [];

var _tween = void 0;

var _indicator = void 0;
var DEFAULT_INDICATOR_OPTIONS = {
  name: '',
  indent: 0,
  parent: undefined,
  colorStart: 'green',
  colorEnd: 'red',
  colorTrigger: 'blue'
};

var SCENE_OPTIONS = {
  defaults: {
    duration: 0,
    offset: 0,
    triggerElement: undefined,
    triggerHook: 0.5,
    reverse: true,
    loglevel: 2,
    tweenChanges: false
  },
  validate: {
    duration: function duration(val) {
      if (U.type.String(val) && val.match(/^(\.|\d)*\d+%$/)) {
        // percentage value
        var perc = parseFloat(val) / 100;
        val = function val() {
          return _controller ? _controller.info('size') * perc : 0;
        };
      }
      if (U.type.Function(val)) {
        // function
        _durationUpdateMethod = val;
        try {
          val = parseFloat(_durationUpdateMethod());
        } catch (e) {
          val = -1; // will cause error below
        }
      }
      // val has to be float
      val = parseFloat(val);
      if (!U.type.Number(val) || val < 0) {
        if (_durationUpdateMethod) {
          _durationUpdateMethod = undefined;
          throw Error('Invalid return value of supplied function for option "duration": ' + val);
        } else {
          throw Error('Invalid value for option "duration": ' + val);
        }
      }
      return val;
    },
    offset: function offset(val) {
      val = parseFloat(val);
      if (!U.type.Number(val)) {
        throw Error('Invalid value for option "offset": ' + val);
      }
      return val;
    },
    triggerElement: function triggerElement(val) {
      val = val || undefined;
      if (val) {
        var elem = U.get.elements(val)[0];
        if (elem && elem.parentNode) {
          val = elem;
        } else {
          throw Error('Element defined in option "triggerElement" was not found: ' + val);
        }
      }
      return val;
    },
    triggerHook: function triggerHook(val) {
      var translate = { onCenter: 0.5, onEnter: 1, onLeave: 0 };
      if (U.type.Number(val)) {
        val = Math.max(0, Math.min(parseFloat(val), 1)); //  make sure its betweeen 0 and 1
      } else if (val in translate) {
        val = translate[val];
      } else {
        throw Error('Invalid value for option "triggerHook": ' + val);
      }
      return val;
    },
    reverse: function reverse(val) {
      return !!val; // force boolean
    },
    loglevel: function loglevel(val) {
      val = parseInt(val, 10);
      if (!U.type.Number(val) || val < 0 || val > 3) {
        throw Error('Invalid value for option "loglevel": ' + val);
      }
      return val;
    },
    tweenChanges: function tweenChanges(val) {
      return !!val;
    }
  },
  // list of options that trigger a `shift` event
  shifts: ['duration', 'offset', 'triggerHook']
};

var DEFAULT_OPTIONS$1 = SCENE_OPTIONS.defaults;

var Scene = function () {
  function Scene(options) {
    var _this = this;

    classCallCheck(this, Scene);

    this.options = U.extend({}, DEFAULT_OPTIONS$1, options);

    // add getters/setters for all possible options
    for (var optionName in DEFAULT_OPTIONS$1) {
      this._addSceneOption(optionName);
    }

    // validate all options
    this._validateOption();

    this.on('change.internal', function (event) {
      if (event.what !== 'loglevel' && event.what !== 'tweenChanges') {
        // no need for a scene update scene with these options...
        if (event.what === 'triggerElement') {
          _this._updateTriggerElementPosition();
        } else if (event.what === 'reverse') {
          // the only property left that may have an impact on the current scene state. Everything else is handled by the shift event.
          _this.update();
        }
      }
    });

    this.on('shift.internal', function (event) {
      _this._updateScrollOffset();
      _this.update(); // update scene to reflect new position
    });

    // pinning

    this.on('shift.internal', function (event) {
      var durationChanged = event.reason === 'duration';
      if (_state === SCENE_STATE_AFTER && durationChanged || _state === SCENE_STATE_DURING && _this.options.duration === 0) {
        // if [duration changed after a scene (inside scene progress updates pin position)] or [duration is 0, we are in pin phase and some other value changed].
        _this._updatePinState();
      }
      if (durationChanged) {
        _this._updatePinDimensions();
      }
    });

    this.on('progress.internal', function (event) {
      _this._updatePinState();
    });

    this.on('add.internal', function (event) {
      _this._updatePinDimensions();
    });

    this.on('destroy.internal', function (event) {
      _this.removePin(event.reset);
    });

    // class toggle

    this.on('destroy.internal', function (event) {
      _this.removeClassToggle(event.reset);
    });

    // gsap

    this.on('progress.plugin_gsap', function () {
      _this._updateTweenProgress();
    });

    this.on('destroy.plugin_gsap', function (event) {
      _this.removeTween(event.reset);
    });
  }

  createClass(Scene, [{
    key: 'on',
    value: function on(names, callback) {
      if (U.type.Function(callback)) {
        names = names.trim().split(' ');
        names.forEach(function (fullname) {
          var nameparts = fullname.split('.');
          var eventname = nameparts[0];
          var namespace = nameparts[1];
          if (eventname !== '*') {
            // disallow wildcards
            if (!_listeners[eventname]) {
              _listeners[eventname] = [];
            }
            _listeners[eventname].push({
              namespace: namespace || '',
              callback: callback
            });
          }
        });
      } else {
        U.log(1, 'ERROR when calling \'.on()\': Supplied callback for \'' + names + '\' is not a valid function!');
      }
      return this;
    }
  }, {
    key: 'off',
    value: function off(names, callback) {
      if (!names) {
        U.log(1, 'ERROR: Invalid event name supplied.');
        return this;
      }
      names = names.trim().split(' ');
      names.forEach(function (fullname, key) {
        var nameparts = fullname.split('.');
        var eventname = nameparts[0];
        var namespace = nameparts[1] || '';
        var removeList = eventname === '*' ? Object.keys(_listeners) : [eventname];
        removeList.forEach(function (remove) {
          var list = _listeners[remove] || [];
          var i = list.length;
          while (i--) {
            var listener = list[i];
            if (listener && (namespace === listener.namespace || namespace === '*') && (!callback || callback === listener.callback)) {
              list.splice(i, 1);
            }
          }
          if (!list.length) {
            delete _listeners[remove];
          }
        });
      });
      return this;
    }
  }, {
    key: 'trigger',
    value: function trigger(name, vars) {
      var _this2 = this;

      if (name) {
        var nameparts = name.trim().split('.');
        var eventname = nameparts[0];
        var namespace = nameparts[1];
        var listeners = _listeners[eventname];
        U.log(3, 'event fired:', eventname, vars ? '->' : '', vars || '');
        if (listeners) {
          listeners.forEach(function (listener, key) {
            if (!namespace || namespace === listener.namespace) {
              listener.callback.call(_this2, new Event$1(eventname, listener.namespace, _this2, vars));
            }
          });
        }
      } else {
        U.log(1, 'ERROR: Invalid event name supplied.');
      }
      return this;
    }
  }, {
    key: 'addTo',
    value: function addTo(controller) {
      if (_controller !== controller) {
        // new controller
        if (_controller) {
          // was associated to a different controller before, so remove it...
          _controller.removeScene(this);
        }
        _controller = controller;
        this._validateOption();
        this._updateDuration(true);
        this._updateTriggerElementPosition(true);
        this._updateScrollOffset();
        _controller.info('container').addEventListener('resize', this._onContainerResize);
        controller.addScene(this);
        this.trigger('add', { controller: _controller });
        U.log(3, 'added ' + NAMESPACE$1 + ' to controller');
        this.update();
      }
      return this;
    }
  }, {
    key: 'remove',
    value: function remove() {
      if (_controller) {
        _controller.info('container').removeEventListener('resize', this._onContainerResize);
        var tmpParent = _controller;
        _controller = undefined;
        tmpParent.removeScene(this);
        this.trigger('remove');
        U.log(3, 'removed ' + NAMESPACE$1 + ' from controller');
      }
      return this;
    }
  }, {
    key: 'destroy',
    value: function destroy(reset) {
      this.trigger('destroy', { reset: reset });
      this.remove();
      this.off('*.*');
      U.log(3, 'destroyed ' + NAMESPACE$1 + ' (reset: ' + (reset ? 'true' : 'false') + ')');
      return null;
    }
  }, {
    key: 'update',
    value: function update(immediately) {
      if (_controller) {
        if (immediately) {
          if (_controller.enabled()) {
            var scrollPos = _controller.info('scrollPos');
            var newProgress = void 0;

            if (this.options.duration > 0) {
              newProgress = (scrollPos - _scrollOffset.start) / (_scrollOffset.end - _scrollOffset.start);
            } else {
              newProgress = scrollPos >= _scrollOffset.start ? 1 : 0;
            }

            this.trigger('update', { startPos: _scrollOffset.start, endPos: _scrollOffset.end, scrollPos: scrollPos });

            this.progress(newProgress);
          } else if (_pin && _state === SCENE_STATE_DURING) {
            this._updatePinState(true); // unpin in position
          }
        } else {
          _controller.updateScene(this, false);
        }
      }
      return this;
    }
  }, {
    key: 'refresh',
    value: function refresh() {
      this._updateDuration();
      this._updateTriggerElementPosition();
      // update trigger element position
      return this;
    }
  }, {
    key: 'progress',
    value: function progress(_progress2) {
      var _this3 = this;

      if (!arguments.length) {
        // get
        return _progress;
      } // set

      var doUpdate = false;
      var oldState = _state;
      var scrollDirection = _controller ? _controller.info('scrollDirection') : 'PAUSED';
      var reverseOrForward = this.options.reverse || _progress2 >= _progress;
      if (this.options.duration === 0) {
        // zero duration scenes
        doUpdate = _progress !== _progress2;
        _progress = _progress2 < 1 && reverseOrForward ? 0 : 1;
        _state = _progress === 0 ? SCENE_STATE_BEFORE : SCENE_STATE_DURING;
      } else {
        // scenes with start and end
        if (_progress2 < 0 && _state !== SCENE_STATE_BEFORE && reverseOrForward) {
          // go back to initial state
          _progress = 0;
          _state = SCENE_STATE_BEFORE;
          doUpdate = true;
        } else if (_progress2 >= 0 && _progress2 < 1 && reverseOrForward) {
          _progress = _progress2;
          _state = SCENE_STATE_DURING;
          doUpdate = true;
        } else if (_progress2 >= 1 && _state !== SCENE_STATE_AFTER) {
          _progress = 1;
          _state = SCENE_STATE_AFTER;
          doUpdate = true;
        } else if (_state === SCENE_STATE_DURING && !reverseOrForward) {
          this._updatePinState(); // in case we scrolled backwards mid-scene and reverse is disabled => update the pin position, so it doesn't move back as well.
        }
      }
      if (doUpdate) {
        // fire events
        var eventVars = { progress: _progress, state: _state, scrollDirection: scrollDirection };
        var stateChanged = _state !== oldState;

        var trigger = function trigger(eventName) {
          // tmp helper to simplify code
          _this3.trigger(eventName, eventVars);
        };

        if (stateChanged) {
          // enter events
          if (oldState !== SCENE_STATE_DURING) {
            trigger('enter');
            trigger(oldState === SCENE_STATE_BEFORE ? 'start' : 'end');
          }
        }
        trigger('progress');
        if (stateChanged) {
          // leave events
          if (_state !== SCENE_STATE_DURING) {
            trigger(_state === SCENE_STATE_BEFORE ? 'start' : 'end');
            trigger('leave');
          }
        }
      }

      return this;
    }
  }, {
    key: '_updateScrollOffset',
    value: function _updateScrollOffset() {
      _scrollOffset = { start: _triggerPos + this.options.offset };
      if (_controller && this.options.triggerElement) {
        // take away triggerHook portion to get relative to top
        _scrollOffset.start -= _controller.info('size') * this.options.triggerHook;
      }
      _scrollOffset.end = _scrollOffset.start + this.options.duration;
    }
  }, {
    key: '_updateDuration',
    value: function _updateDuration(suppressEvents) {
      // update duration
      if (_durationUpdateMethod) {
        var varname = 'duration';
        if (this._changeOption(varname, _durationUpdateMethod.call(this)) && !suppressEvents) {
          // set
          this.trigger('change', { what: varname, newval: this.options[varname] });
          this.trigger('shift', { reason: varname });
        }
      }
    }
  }, {
    key: '_updateTriggerElementPosition',
    value: function _updateTriggerElementPosition(suppressEvents) {
      var elementPos = 0;
      var telem = this.options.triggerElement;
      if (_controller && (telem || _triggerPos > 0)) {
        // either an element exists or was removed and the triggerPos is still > 0
        if (telem) {
          // there currently a triggerElement set
          if (telem.parentNode) {
            // check if element is still attached to DOM
            var controllerInfo = _controller.info();
            var containerOffset = U.get.offset(controllerInfo.container); // container position is needed because element offset is returned in relation to document, not in relation to container.
            var param = controllerInfo.vertical ? 'top' : 'left'; // which param is of interest ?

            // if parent is spacer, use spacer position instead so correct start position is returned for pinned elements.
            while (telem.parentNode.hasAttribute(PIN_SPACER_ATTRIBUTE$1)) {
              telem = telem.parentNode;
            }

            var elementOffset = U.get.offset(telem);

            if (!controllerInfo.isDocument) {
              // container is not the document root, so substract scroll Position to get correct trigger element position relative to scrollcontent
              containerOffset[param] -= _controller.scrollPos();
            }

            elementPos = elementOffset[param] - containerOffset[param];
          } else {
            // there was an element, but it was removed from DOM
            U.log(2, 'WARNING: triggerElement was removed from DOM and will be reset to', undefined);
            this.triggerElement(undefined); // unset, so a change event is triggered
          }
        }

        var changed = elementPos !== _triggerPos;
        _triggerPos = elementPos;
        if (changed && !suppressEvents) {
          this.trigger('shift', { reason: 'triggerElementPosition' });
        }
      }
    }
  }, {
    key: '_onContainerResize',
    value: function _onContainerResize(event) {
      if (this.options.triggerHook > 0) {
        this.trigger('shift', { reason: 'containerResize' });
      }
    }
  }, {
    key: '_validateOption',
    value: function _validateOption(check) {
      var _this4 = this;

      check = arguments.length ? [check] : Object.keys(SCENE_OPTIONS.validate);
      check.forEach(function (optionName, key) {
        var value = void 0;
        if (SCENE_OPTIONS.validate[optionName]) {
          // there is a validation method for this option
          try {
            // validate value
            value = SCENE_OPTIONS.validate[optionName](_this4.options[optionName]);
          } catch (event) {
            // validation failed -> reset to default
            value = DEFAULT_OPTIONS$1[optionName];
            var logMSG = U.type.String(event) ? [event] : event;
            if (U.type.Array(logMSG)) {
              logMSG[0] = 'ERROR: ' + logMSG[0];
              logMSG.unshift(1); // loglevel 1 for error msg
              U.log.apply(_this4, logMSG);
            } else {
              U.log(1, 'ERROR: Problem executing validation callback for option \'' + optionName + '\':', event.message);
            }
          } finally {
            _this4.options[optionName] = value;
          }
        }
      });
    }
  }, {
    key: '_changeOption',
    value: function _changeOption(varname, newval) {
      var changed = false;
      var oldval = this.options[varname];
      if (this.options[varname] !== newval) {
        this.options[varname] = newval;
        this._validateOption(varname); // resets to default if necessary
        changed = oldval !== this.options[varname];
      }
      return changed;
    }
  }, {
    key: '_addSceneOption',
    value: function _addSceneOption(optionName) {
      if (!this[optionName]) {
        this[optionName] = function (newVal) {
          if (!arguments.length) {
            // get
            return this.options[optionName];
          }
          if (optionName === 'duration') {
            // new duration is set, so any previously set function must be unset
            _durationUpdateMethod = undefined;
          }
          if (this._changeOption(optionName, newVal)) {
            // set
            this.trigger('change', { what: optionName, newval: this.options[optionName] });
            if (SCENE_OPTIONS.shifts.indexOf(optionName) > -1) {
              this.trigger('shift', { reason: optionName });
            }
          }

          return this;
        };
      }
    }
  }, {
    key: 'controller',
    value: function controller() {
      return _controller;
    }
  }, {
    key: 'state',
    value: function state() {
      return _state;
    }
  }, {
    key: 'scrollOffset',
    value: function scrollOffset() {
      return _scrollOffset.start;
    }
  }, {
    key: 'triggerPosition',
    value: function triggerPosition() {
      var pos = this.options.offset; // the offset is the basis
      if (_controller) {
        // get the trigger position
        if (this.options.triggerElement) {
          // Element as trigger
          pos += _triggerPos;
        } else {
          // return the height of the triggerHook to start at the beginning
          pos += _controller.info('size') * this.triggerHook();
        }
      }
      return pos;
    }

    // pinning

  }, {
    key: '_updatePinState',
    value: function _updatePinState(forceUnpin) {
      if (_pin && _controller) {
        var containerInfo = _controller.info();
        var pinTarget = _pinOptions.spacer.firstChild; // may be pin element or another spacer, if cascading pins

        if (!forceUnpin && _state === SCENE_STATE_DURING) {
          // during scene or if duration is 0 and we are past the trigger
          // pinned state
          if (U.css(pinTarget, 'position') !== 'fixed') {
            // change state before updating pin spacer (position changes due to fixed collapsing might occur.)
            U.css(pinTarget, { position: 'fixed' });
            // update pin spacer
            this._updatePinDimensions();
          }

          var fixedPos = U.get.offset(_pinOptions.spacer, true); // get viewport position of spacer
          var scrollDistance = this.options.reverse || this.options.duration === 0 ? containerInfo.scrollPos - _scrollOffset.start // quicker
          : Math.round(_progress * this.options.duration * 10) / 10; // if no reverse and during pin the position needs to be recalculated using the progress

          // add scrollDistance
          fixedPos[containerInfo.vertical ? 'top' : 'left'] += scrollDistance;

          // set new values
          U.css(_pinOptions.spacer.firstChild, {
            top: fixedPos.top,
            left: fixedPos.left
          });
        } else {
          // unpinned state
          var newCSS = {
            position: _pinOptions.inFlow ? 'relative' : 'absolute',
            top: 0,
            left: 0
          };
          var change = U.css(pinTarget, 'position') !== newCSS.position;

          if (!_pinOptions.pushFollowers) {
            newCSS[containerInfo.vertical ? 'top' : 'left'] = this.options.duration * _progress;
          } else if (this.options.duration > 0) {
            // only concerns scenes with duration
            if (_state === SCENE_STATE_AFTER && parseFloat(U.css(_pinOptions.spacer, 'padding-top')) === 0) {
              change = true; // if in after state but havent updated spacer yet (jumped past pin)
            } else if (_state === SCENE_STATE_BEFORE && parseFloat(U.css(_pinOptions.spacer, 'padding-bottom')) === 0) {
              // before
              change = true; // jumped past fixed state upward direction
            }
          }
          // set new values
          U.css(pinTarget, newCSS);
          if (change) {
            // update pin spacer if state changed
            this._updatePinDimensions();
          }
        }
      }
    }
  }, {
    key: '_updatePinDimensions',
    value: function _updatePinDimensions() {
      if (_pin && _controller && _pinOptions.inFlow) {
        // no spacerresize, if original position is absolute
        var after = _state === SCENE_STATE_AFTER;
        var before = _state === SCENE_STATE_BEFORE;
        var during = _state === SCENE_STATE_DURING;
        var vertical = _controller.info('vertical');
        var pinTarget = _pinOptions.spacer.firstChild; // usually the pined element but can also be another spacer (cascaded pins)
        var marginCollapse = U.isMarginCollapseType(U.css(_pinOptions.spacer, 'display'));
        var css = {};

        // set new size
        // if relsize: spacer -> pin | else: pin -> spacer
        if (_pinOptions.relSize.width || _pinOptions.relSize.autoFullWidth) {
          if (during) {
            U.css(_pin, { width: U.get.width(_pinOptions.spacer) });
          } else {
            U.css(_pin, { width: '100%' });
          }
        } else {
          // minwidth is needed for cascaded pins.
          css['min-width'] = U.get.width(vertical ? _pin : pinTarget, true, true);
          css.width = during ? css['min-width'] : 'auto';
        }
        if (_pinOptions.relSize.height) {
          if (during) {
            // the only padding the spacer should ever include is the duration (if pushFollowers = true), so we need to substract that.
            U.css(_pin, { height: U.get.height(_pinOptions.spacer) - (_pinOptions.pushFollowers ? this.options.duration : 0) });
          } else {
            U.css(_pin, { height: '100%' });
          }
        } else {
          // margin is only included if it's a cascaded pin to resolve an IE9 bug
          css['min-height'] = U.get.height(vertical ? pinTarget : _pin, true, !marginCollapse); // needed for cascading pins
          css.height = during ? css['min-height'] : 'auto';
        }

        // add space for duration if pushFollowers is true
        if (_pinOptions.pushFollowers) {
          css['padding' + (vertical ? 'Top' : 'Left')] = this.options.duration * _progress;
          css['padding' + (vertical ? 'Bottom' : 'Right')] = this.options.duration * (1 - _progress);
        }
        U.css(_pinOptions.spacer, css);
      }
    }
  }, {
    key: '_updatePinInContainer',
    value: function _updatePinInContainer() {
      if (_controller && _pin && _state === SCENE_STATE_DURING && !_controller.info('isDocument')) {
        this._updatePinState();
      }
    }
  }, {
    key: '_updateRelativePinSpacer',
    value: function _updateRelativePinSpacer() {
      if (_controller && _pin && _state === SCENE_STATE_DURING && ( // element in pinned state?
      // is width or height relatively sized, but not in relation to body? then we need to recalc.
      (_pinOptions.relSize.width || _pinOptions.relSize.autoFullWidth) && U.get.width(window) !== U.get.width(_pinOptions.spacer.parentNode) || _pinOptions.relSize.height && U.get.height(window) !== U.get.height(_pinOptions.spacer.parentNode))) {
        this._updatePinDimensions();
      }
    }
  }, {
    key: '_onMousewheelOverPin',
    value: function _onMousewheelOverPin(event) {
      if (_controller && _pin && _state === SCENE_STATE_DURING && !_controller.info('isDocument')) {
        // in pin state
        event.preventDefault();
        _controller._setScrollPos(_controller.info('scrollPos') - ((event.wheelDelta || event[_controller.info('vertical') ? 'wheelDeltaY' : 'wheelDeltaX']) / 3 || -event.detail * 30));
      }
    }
  }, {
    key: 'setPin',
    value: function setPin(element, settings) {
      var _this5 = this;

      var defaultSettings = {
        pushFollowers: true,
        spacerClass: 'scrollmagic-pin-spacer'
      };
      settings = U.extend({}, defaultSettings, settings);

      // validate Element
      element = U.get.elements(element)[0];
      if (!element) {
        U.log(1, "ERROR calling method 'setPin()': Invalid pin element supplied.");
        return this; // cancel
      } else if (U.css(element, 'position') === 'fixed') {
        U.log(1, "ERROR calling method 'setPin()': Pin does not work with elements that are positioned 'fixed'.");
        return this; // cancel
      }

      if (_pin) {
        // preexisting pin?
        if (_pin === element) {
          // same pin we already have -> do nothing
          return this; // cancel
        }
        // kill old pin
        this.removePin();
      }
      _pin = element;

      var parentDisplay = _pin.parentNode.style.display;
      var boundsParams = ['top', 'left', 'bottom', 'right', 'margin', 'marginLeft', 'marginRight', 'marginTop', 'marginBottom'];

      _pin.parentNode.style.display = 'none'; // hack start to force css to return stylesheet values instead of calculated px values.

      var inFlow = U.css(_pin, 'position') !== 'absolute';
      var pinCSS = U.css(_pin, boundsParams.concat(['display']));
      var sizeCSS = U.css(_pin, ['width', 'height']);
      _pin.parentNode.style.display = parentDisplay; // hack end.

      if (!inFlow && settings.pushFollowers) {
        U.log(2, 'WARNING: If the pinned element is positioned absolutely pushFollowers will be disabled.');
        settings.pushFollowers = false;
      }

      // wait until all finished, because with responsive duration it will only be set after scene is added to controller
      window.setTimeout(function () {
        if (_pin && _this5.options.duration === 0 && settings.pushFollowers) {
          U.log(2, 'WARNING: pushFollowers =', true, 'has no effect, when scene duration is 0.');
        }
      }, 0);

      // create spacer and insert
      var spacer = _pin.parentNode.insertBefore(document.createElement('div'), _pin);
      var spacerCSS = U.extend(pinCSS, {
        position: inFlow ? 'relative' : 'absolute',
        boxSizing: 'content-box',
        mozBoxSizing: 'content-box',
        webkitBoxSizing: 'content-box'
      });

      if (!inFlow) {
        // copy size if positioned absolutely, to work for bottom/right positioned elements.
        U.extend(spacerCSS, U.css(_pin, ['width', 'height']));
      }

      U.css(spacer, spacerCSS);
      spacer.setAttribute(PIN_SPACER_ATTRIBUTE$1, '');
      U.addClass(spacer, settings.spacerClass);

      // set the pin Options
      _pinOptions = {
        spacer: spacer,
        relSize: { // save if size is defined using % values. if so, handle spacer resize differently...
          width: sizeCSS.width.slice(-1) === '%',
          height: sizeCSS.height.slice(-1) === '%',
          autoFullWidth: sizeCSS.width === 'auto' && inFlow && U.isMarginCollapseType(pinCSS.display)
        },
        pushFollowers: settings.pushFollowers,
        inFlow: inFlow // stores if the element takes up space in the document flow
      };

      if (!_pin.___origStyle) {
        _pin.___origStyle = {};
        var pinInlineCSS = _pin.style;
        var copyStyles = boundsParams.concat(['width', 'height', 'position', 'boxSizing', 'mozBoxSizing', 'webkitBoxSizing']);
        copyStyles.forEach(function (val) {
          _pin.___origStyle[val] = pinInlineCSS[val] || '';
        });
      }

      // if relative size, transfer it to spacer and make pin calculate it...
      if (_pinOptions.relSize.width) {
        U.css(spacer, { width: sizeCSS.width });
      }
      if (_pinOptions.relSize.height) {
        U.css(spacer, { height: sizeCSS.height });
      }

      // now place the pin element inside the spacer
      spacer.appendChild(_pin);
      // and set new css
      U.css(_pin, {
        position: inFlow ? 'relative' : 'absolute',
        margin: 'auto',
        top: 'auto',
        left: 'auto',
        bottom: 'auto',
        right: 'auto'
      });

      if (_pinOptions.relSize.width || _pinOptions.relSize.autoFullWidth) {
        U.css(_pin, {
          boxSizing: 'border-box',
          mozBoxSizing: 'border-box',
          webkitBoxSizing: 'border-box'
        });
      }

      // add listener to document to update pin position in case controller is not the document.
      window.addEventListener('scroll', this._updatePinInContainer);
      window.addEventListener('resize', this._updatePinInContainer);
      window.addEventListener('resize', this._updateRelativePinSpacer);
      // add mousewheel listener to catch scrolls over fixed elements
      _pin.addEventListener('mousewheel', this._onMousewheelOverPin);
      _pin.addEventListener('DOMMouseScroll', this._onMousewheelOverPin);

      U.log(3, 'added pin');

      // finally update the pin to init
      this._updatePinState();

      return this;
    }
  }, {
    key: 'removePin',
    value: function removePin(reset) {
      if (_pin) {
        if (_state === SCENE_STATE_DURING) {
          this._updatePinState(true); // force unpin at position
        }
        if (reset || !_controller) {
          // if there's no controller no progress was made anyway...
          var pinTarget = _pinOptions.spacer.firstChild; // usually the pin element, but may be another spacer (cascaded pins)...
          if (pinTarget.hasAttribute(PIN_SPACER_ATTRIBUTE$1)) {
            // copy margins to child spacer
            var style = _pinOptions.spacer.style;
            var values = ['margin', 'marginLeft', 'marginRight', 'marginTop', 'marginBottom'];
            var margins = {};
            values.forEach(function (val) {
              margins[val] = style[val] || '';
            });
            U.css(pinTarget, margins);
          }
          _pinOptions.spacer.parentNode.insertBefore(pinTarget, _pinOptions.spacer);
          _pinOptions.spacer.parentNode.removeChild(_pinOptions.spacer);
          if (!_pin.parentNode.hasAttribute(PIN_SPACER_ATTRIBUTE$1)) {
            // if it's the last pin for this element -> restore inline styles
            // TODO: only correctly set for first pin (when cascading) - how to fix?
            U.css(_pin, _pin.___origStyle);
            delete _pin.___origStyle;
          }
        }
        window.removeEventListener('scroll', this._updatePinInContainer);
        window.removeEventListener('resize', this._updatePinInContainer);
        window.removeEventListener('resize', this._updateRelativePinSpacer);
        _pin.removeEventListener('mousewheel', this._onMousewheelOverPin);
        _pin.removeEventListener('DOMMouseScroll', this._onMousewheelOverPin);
        _pin = undefined;
        U.log(3, 'removed pin (reset: ' + (reset ? 'true' : 'false') + ')');
      }
      return this;
    }

    // class toggle

  }, {
    key: 'setClassToggle',
    value: function setClassToggle(element, classes) {
      var elems = U.get.elements(element);
      if (elems.length === 0 || !U.type.String(classes)) {
        U.log(1, 'ERROR calling method \'setClassToggle()\': Invalid ' + (elems.length === 0 ? 'element' : 'classes') + ' supplied.');
        return this;
      }
      if (_cssClassElems.length > 0) {
        // remove old ones
        this.removeClassToggle();
      }
      _cssClasses = classes;
      _cssClassElems = elems;
      this.on('enter.internal_class leave.internal_class', function (e) {
        var toggle = e.type === 'enter' ? U.addClass : U.removeClass;
        _cssClassElems.forEach(function (elem, key) {
          toggle(elem, _cssClasses);
        });
      });
      return this;
    }
  }, {
    key: 'removeClassToggle',
    value: function removeClassToggle(reset) {
      if (reset) {
        _cssClassElems.forEach(function (elem, key) {
          U.removeClass(elem, _cssClasses);
        });
      }
      this.off('start.internal_class end.internal_class');
      _cssClasses = undefined;
      _cssClassElems = [];
      return this;
    }

    // gsap

  }, {
    key: '_updateTweenProgress',
    value: function _updateTweenProgress() {
      if (_tween) {
        var progress = this.progress();
        var state = this.state();
        if (_tween.repeat && _tween.repeat() === -1) {
          // infinite loop, so not in relation to progress
          if (state === 'DURING' && _tween.paused()) {
            _tween.play();
          } else if (state !== 'DURING' && !_tween.paused()) {
            _tween.pause();
          }
        } else if (progress !== _tween.progress()) {
          // do we even need to update the progress?
          // no infinite loop - so should we just play or go to a specific point in time?
          if (this.duration() === 0) {
            // play the animation
            if (progress > 0) {
              // play from 0 to 1
              _tween.play();
            } else {
              // play from 1 to 0
              _tween.reverse();
            }
          } else {
            // go to a specific point in time
            if (this.tweenChanges() && _tween.tweenTo) {
              // go smooth
              _tween.tweenTo(progress * _tween.duration());
            } else {
              // just hard set it
              _tween.progress(progress).pause();
            }
          }
        }
      }
    }
  }, {
    key: 'setTween',
    value: function setTween(TweenObject, duration, params) {
      var newTween = void 0;
      if (arguments.length > 1) {
        if (arguments.length < 3) {
          params = duration;
          duration = 1;
        }
        TweenObject = window.TweenMax.to(TweenObject, duration, params);
      }
      try {
        // wrap Tween into a Timeline Object if available to include delay and repeats in the duration and standardize methods.
        if (window.TimelineMax) {
          newTween = new window.TimelineMax({ smoothChildTiming: true }).add(TweenObject);
        } else {
          newTween = TweenObject;
        }
        newTween.pause();
      } catch (event) {
        U.log(1, "ERROR calling method 'setTween()': Supplied argument is not a valid TweenObject");
        return this;
      }
      if (_tween) {
        // kill old tween?
        this.removeTween();
      }
      _tween = newTween;

      // some properties need to be transferred it to the wrapper, otherwise they would get lost.
      if (TweenObject.repeat && TweenObject.repeat() === -1) {
        // TweenMax or TimelineMax Object?
        _tween.repeat(-1);
        _tween.yoyo(TweenObject.yoyo());
      }

      // (BUILD) - REMOVE IN MINIFY - START

      // Some tween validations and debugging helpers

      if (this.tweenChanges() && !_tween.tweenTo) {
        U.log(2, 'WARNING: tweenChanges will only work if the TimelineMax object is available for ScrollMagic.');
      }

      // check if there are position tweens defined for the trigger and warn about it :)
      if (_tween && this.controller() && this.triggerElement() && this.loglevel() >= 2) {
        // controller is needed to know scroll direction.
        var triggerTweens = window.TweenMax.getTweensOf(this.triggerElement());
        var vertical = this.controller().info('vertical');
        triggerTweens.forEach(function (value, index) {
          var tweenvars = value.vars.css || value.vars;
          var condition = vertical ? tweenvars.top !== undefined || tweenvars.bottom !== undefined : tweenvars.left !== undefined || tweenvars.right !== undefined;
          if (condition) {
            U.log(2, 'WARNING: Tweening the position of the trigger element affects the scene timing and should be avoided!');
          }
        });
      }

      // warn about tween overwrites, when an element is tweened multiple times
      if (parseFloat(window.TweenMax.version) >= 1.14) {
        (function () {
          // onOverwrite only present since GSAP v1.14.0
          var list = _tween.getChildren ? _tween.getChildren(true, true, false) : [_tween]; // get all nested tween objects
          var newCallback = function newCallback() {
            U.log(2, 'WARNING: tween was overwritten by another. To learn how to avoid this issue see here: https://github.com/janpaepke/ScrollMagic/wiki/WARNING:-tween-was-overwritten-by-another');
          };

          var _loop = function _loop(i, _thisTween, _oldCallback) {
            /* jshint loopfunc: true */
            _thisTween = list[i];
            if (_oldCallback !== newCallback) {
              // if tweens is added more than once
              _oldCallback = _thisTween.vars.onOverwrite;
              _thisTween.vars.onOverwrite = function () {
                if (_oldCallback) {
                  _oldCallback.apply(this, arguments);
                }
                newCallback.apply(this, arguments);
              };
            }
            thisTween = _thisTween;
            oldCallback = _oldCallback;
          };

          for (var i = 0, thisTween, oldCallback; i < list.length; i++) {
            _loop(i, thisTween, oldCallback);
          }
        })();
      }

      U.log(3, 'added tween');

      // (BUILD) - REMOVE IN MINIFY - END

      this._updateTweenProgress();

      return this;
    }
  }, {
    key: 'removeTween',
    value: function removeTween(reset) {
      if (_tween) {
        if (reset) {
          _tween.progress(0).pause();
        }
        _tween.kill();
        _tween = undefined;
        U.log(3, 'removed tween (reset: ' + (reset ? 'true' : 'false') + ')');
      }
      return this;
    }

    // indicators

  }, {
    key: 'addIndicators',
    value: function addIndicators(options) {
      if (!_indicator) {
        options = U.extend({}, DEFAULT_INDICATOR_OPTIONS, options);

        _indicator = new Indicator(this, options);

        this.on('add.plugin_addIndicators', _indicator.add.bind(_indicator));
        this.on('remove.plugin_addIndicators', _indicator.remove.bind(_indicator));
        this.on('destroy.plugin_addIndicators', this.removeIndicators);

        // it the scene already has a controller we can start right away.
        if (this.controller()) {
          _indicator.add();
        }
      }
      return this;
    }
  }, {
    key: 'removeIndicators',
    value: function removeIndicators() {
      if (_indicator) {
        _indicator.remove();
        this.off('*.plugin_addIndicators');
        _indicator = undefined;
      }
      return this;
    }
  }]);
  return Scene;
}();

/* eslint-env browser */

var PIN_SPACER_ATTRIBUTE = 'data-scrollmagic-pin-spacer';

var NAMESPACE = 'ScrollWizardry.Controller';

var SCROLL_DIRECTION_FORWARD = 'FORWARD';
var SCROLL_DIRECTION_REVERSE = 'REVERSE';
var SCROLL_DIRECTION_PAUSED = 'PAUSED';

var EDGE_OFFSET = 15; // minimum edge distance, added to indentation

var _sceneObjects = [];
var _updateScenesOnNextCycle = false;
var _scrollPos = 0;
var _scrollDirection = SCROLL_DIRECTION_PAUSED;
var _isDocument = true;
var _viewPortSize = 0;
var _enabled = true;
var _updateTimeout = void 0;
var _refreshTimeout = void 0;

var CONTROLLER_OPTIONS = {
  defaults: {
    container: window,
    vertical: true,
    globalSceneOptions: {},
    loglevel: 2,
    refreshInterval: 100,
    addIndicators: false
  }
};

var DEFAULT_OPTIONS = CONTROLLER_OPTIONS.defaults;

var Controller = function () {
  function Controller(options) {
    var _this = this;

    classCallCheck(this, Controller);

    this.options = U.extend({}, DEFAULT_OPTIONS, options);

    this.options.container = U.get.elements(this.options.container)[0];

    // check scroll container
    if (!this.options.container) {
      U.log(1, 'ERROR creating object ' + NAMESPACE + ': No valid scroll container supplied');
      throw Error(NAMESPACE + ' init failed.'); // cancel
    }

    _isDocument = this.options.container === window || this.options.container === document.body || !document.body.contains(this.options.container);

    // normalize to window
    if (_isDocument) {
      this.options.container = window;
    }

    // update container size immediately
    _viewPortSize = this._getViewportSize();

    // set event handlers
    this.options.container.addEventListener('resize', function (event) {
      _this._onChange(event);
    });
    this.options.container.addEventListener('scroll', function (event) {
      _this._onChange(event);
    });

    var ri = parseInt(this.options.refreshInterval, 10);
    this.options.refreshInterval = U.type.Number(ri) ? ri : DEFAULT_OPTIONS.refreshInterval;
    this._scheduleRefresh();

    // indicators
    this._info = this.info();
    this._container = this._info.container;
    this._isDocument = this._info.isDocument;
    this._vertical = this._info.vertical;
    this._indicators = { // container for all indicators and methods
      groups: []
    };

    if (this.options.addIndicators) {
      this._container.addEventListener('resize', this._handleTriggerPositionChange.bind(this));
      if (!this._isDocument) {
        window.addEventListener('resize', this._handleTriggerPositionChange.bind(this));
        window.addEventListener('scroll', this._handleTriggerPositionChange.bind(this));
      }
      // update all related bounds containers
      this._container.addEventListener('resize', this._handleBoundsPositionChange.bind(this));
      this._container.addEventListener('scroll', this._handleBoundsPositionChange.bind(this));
    }

    U.log(3, 'added new ' + NAMESPACE);
  }

  createClass(Controller, [{
    key: '_scheduleRefresh',
    value: function _scheduleRefresh() {
      var _this2 = this;

      if (this.options.refreshInterval > 0) {
        _refreshTimeout = window.setTimeout(function () {
          _this2._refresh();
        }, this.options.refreshInterval);
      }
    }
  }, {
    key: '_getScrollPos',
    value: function _getScrollPos() {
      return this.options.vertical ? U.get.scrollTop(this.options.container) : U.get.scrollLeft(this.options.container);
    }
  }, {
    key: '_getViewportSize',
    value: function _getViewportSize() {
      return this.options.vertical ? U.get.height(this.options.container) : U.get.width(this.options.container);
    }
  }, {
    key: '_setScrollPos',
    value: function _setScrollPos(pos) {
      if (this.options.vertical) {
        if (_isDocument) {
          window.scrollTo(U.get.scrollLeft(), pos);
        } else {
          this.options.container.scrollTop = pos;
        }
      } else if (_isDocument) {
        window.scrollTo(pos, U.get.scrollTop());
      } else {
        this.options.container.scrollLeft = pos;
      }
    }
  }, {
    key: '_updateScenes',
    value: function _updateScenes() {
      if (_enabled && _updateScenesOnNextCycle) {
        // determine scenes to update
        var scenesToUpdate = U.type.Array(_updateScenesOnNextCycle) ? _updateScenesOnNextCycle : _sceneObjects.slice(0);

        // reset scenes
        _updateScenesOnNextCycle = false;

        var oldScrollPos = _scrollPos;

        // update scroll pos now instead of on change, as it might have changed since scheduling (i.e. in-browser smooth scroll)
        _scrollPos = this.scrollPos();

        var deltaScroll = _scrollPos - oldScrollPos;

        if (deltaScroll !== 0) {
          // scroll position changed?
          _scrollDirection = deltaScroll > 0 ? SCROLL_DIRECTION_FORWARD : SCROLL_DIRECTION_REVERSE;
        }

        // reverse order of scenes if scrolling reverse
        if (_scrollDirection === SCROLL_DIRECTION_REVERSE) {
          scenesToUpdate.reverse();
        }

        // update scenes
        scenesToUpdate.forEach(function (scene, index) {
          U.log(3, 'updating scene ' + (index + 1) + '/' + scenesToUpdate.length + ' (' + _sceneObjects.length + ' total)');
          scene.update(true);
        });

        if (scenesToUpdate.length === 0 && this.options.loglevel >= 3) {
          U.log(3, 'updating 0 scenes (nothing added to controller)');
        }
      }
    }
  }, {
    key: '_debounceUpdate',
    value: function _debounceUpdate() {
      var _this3 = this;

      _updateTimeout = U.rAF(function () {
        _this3._updateScenes();
      });
    }
  }, {
    key: '_onChange',
    value: function _onChange(event) {
      U.log(3, 'event fired causing an update:', event.type);
      if (event.type === 'resize') {
        // resize
        _viewPortSize = this._getViewportSize();
        _scrollDirection = SCROLL_DIRECTION_PAUSED;
      }
      // schedule update
      if (_updateScenesOnNextCycle !== true) {
        _updateScenesOnNextCycle = true;
        this._debounceUpdate();
      }
    }
  }, {
    key: '_refresh',
    value: function _refresh() {
      if (!_isDocument) {
        // simulate resize event, only works for viewport relevant param (performance)
        if (_viewPortSize !== this._getViewportSize()) {
          var resizeEvent = void 0;
          try {
            resizeEvent = new Event('resize', { bubbles: false, cancelable: false });
          } catch (event) {
            // stupid IE
            resizeEvent = document.createEvent('Event');
            resizeEvent.initEvent('resize', false, false);
          }
          this.options.container.dispatchEvent(resizeEvent);
        }
      }

      // refresh all scenes
      _sceneObjects.forEach(function (scene, index) {
        scene.refresh();
      });

      this._scheduleRefresh();
    }
  }, {
    key: '_sortScenes',
    value: function _sortScenes(ScenesArray) {
      if (ScenesArray.length <= 1) {
        return ScenesArray;
      }
      var scenes = ScenesArray.slice(0);
      scenes.sort(function (a, b) {
        return a.scrollOffset() > b.scrollOffset() ? 1 : -1;
      });
      return scenes;
    }
  }, {
    key: 'addScene',
    value: function addScene(newScene) {
      var _this4 = this;

      if (U.type.Array(newScene)) {
        newScene.forEach(function (scene, index) {
          _this4.addScene(scene);
        });
      } else if (newScene.controller() !== this) {
        newScene.addTo(this);
      } else if (_sceneObjects.indexOf(newScene) < 0) {
        // new scene
        _sceneObjects.push(newScene); // add to array
        _sceneObjects = this._sortScenes(_sceneObjects); // sort
        newScene.on('shift.controller_sort', function () {
          // resort whenever scene moves
          _sceneObjects = _this4._sortScenes(_sceneObjects);
        });
        // insert global defaults.
        for (var key in this.options.globalSceneOptions) {
          if (newScene[key]) {
            newScene[key].call(newScene, this.options.globalSceneOptions[key]);
          }
        }
        U.log(3, 'adding Scene (now ' + _sceneObjects.length + ' total)');
      }

      // indicators

      if (this.options.addIndicators) {
        if (newScene instanceof Scene && newScene.controller() === this) {
          newScene.addIndicators();
        }
      }

      return this;
    }
  }, {
    key: 'removeScene',
    value: function removeScene(scene) {
      var _this5 = this;

      if (U.type.Array(scene)) {
        scene.forEach(function (_scene, index) {
          _this5.removeScene(_scene);
        });
      } else {
        var index = _sceneObjects.indexOf(scene);
        if (index > -1) {
          scene.off('shift.controller_sort');
          _sceneObjects.splice(index, 1);
          U.log(3, 'removing Scene (now ' + _sceneObjects.length + ' left)');
          scene.remove();
        }
      }
      return this;
    }
  }, {
    key: 'updateScene',
    value: function updateScene(scene, immediately) {
      var _this6 = this;

      if (U.type.Array(scene)) {
        scene.forEach(function (_scene, index) {
          _this6.updateScene(_scene, immediately);
        });
      } else if (immediately) {
        scene.update(true);

        // if _updateScenesOnNextCycle is true, all connected scenes are already scheduled for update
      } else if (_updateScenesOnNextCycle !== true) {
        // prep array for next update cycle
        _updateScenesOnNextCycle = _updateScenesOnNextCycle || [];
        if (_updateScenesOnNextCycle.indexOf(scene) === -1) {
          _updateScenesOnNextCycle.push(scene);
        }
        _updateScenesOnNextCycle = this._sortScenes(_updateScenesOnNextCycle); // sort
        this._debounceUpdate();
      }
      return this;
    }
  }, {
    key: 'update',
    value: function update(immediately) {
      this._onChange({ type: 'resize' }); // will update size and set _updateScenesOnNextCycle to true
      if (immediately) {
        this._updateScenes();
      }
      return this;
    }
  }, {
    key: 'scrollTo',
    value: function scrollTo(scrollTarget, additionalParameter) {
      if (U.type.Number(scrollTarget)) {
        // excecute
        this._setScrollPos.call(this.options.container, scrollTarget, additionalParameter);
      } else if (U.type.Function(scrollTarget)) {
        // assign new scroll function
        this._setScrollPos = scrollTarget;
      } else if (scrollTarget instanceof HTMLElement) {
        // scroll to element
        var elem = U.get.elements(scrollTarget)[0];
        if (elem) {
          // if parent is pin spacer, use spacer position instead so correct start position is returned for pinned elements.
          while (elem.parentNode.hasAttribute(PIN_SPACER_ATTRIBUTE)) {
            elem = elem.parentNode;
          }

          // which param is of interest ?
          var param = this.options.vertical ? 'top' : 'left';

          // container position is needed because element offset is returned in relation to document, not in relation to container.
          var containerOffset = U.get.offset(this.options.container);

          var elementOffset = U.get.offset(elem);

          if (!_isDocument) {
            // container is not the document root, so substract scroll Position to get correct trigger element position relative to scrollcontent
            containerOffset[param] -= this.scrollPos();
          }

          this.scrollTo(elementOffset[param] - containerOffset[param], additionalParameter);
        } else {
          U.log(2, 'scrollTo(): The supplied argument is invalid. Scroll cancelled.', scrollTarget);
        }
      } else {
        // scroll to scene
        if (scrollTarget.controller() === this) {
          // check if the controller is associated with this scene
          this.scrollTo(scrollTarget.scrollOffset(), additionalParameter);
        } else {
          U.log(2, 'scrollTo(): The supplied scene does not belong to this controller. Scroll cancelled.', scrollTarget);
        }
      }
      return this;
    }
  }, {
    key: 'scrollPos',
    value: function scrollPos(scrollPosMethod) {
      if (!arguments.length) {
        // get
        return this._getScrollPos.call(this);
      } // set
      if (U.type.Function(scrollPosMethod)) {
        this._getScrollPos = scrollPosMethod;
      } else {
        U.log(2, "Provided value for method 'scrollPos' is not a function. To change the current scroll position use 'scrollTo()'.");
      }

      return this;
    }
  }, {
    key: 'info',
    value: function info(about) {
      var values = {
        size: _viewPortSize, // contains height or width (in regard to orientation)
        vertical: this.options.vertical,
        scrollPos: _scrollPos,
        scrollDirection: _scrollDirection,
        container: this.options.container,
        isDocument: _isDocument
      };
      if (values[about]) {
        return values[about];
      }
      return values;
    }
  }, {
    key: 'loglevel',
    value: function loglevel(newLoglevel) {
      if (!arguments.length) {
        // get
        return this.options.loglevel;
      } else if (this.options.loglevel !== newLoglevel) {
        // set
        this.options.loglevel = newLoglevel;
      }
      return this;
    }
  }, {
    key: 'enabled',
    value: function enabled(newState) {
      if (!arguments.length) {
        // get
        return _enabled;
      } else if (_enabled !== newState) {
        // set
        _enabled = !!newState;
        this.updateScene(_sceneObjects, true);
      }
      return this;
    }
  }, {
    key: 'destroy',
    value: function destroy(resetScenes) {
      var _this7 = this;

      window.clearTimeout(_refreshTimeout);

      var i = _sceneObjects.length;

      while (i--) {
        _sceneObjects[i].destroy(resetScenes);
      }

      this.options.container.removeEventListener('resize', function (event) {
        _this7._onChange(event);
      });
      this.options.container.removeEventListener('scroll', function (event) {
        _this7._onChange(event);
      });

      U.cAF(_updateTimeout);

      U.log(3, 'destroyed ' + NAMESPACE + ' (reset: ' + (resetScenes ? 'true' : 'false') + ')');

      // indicators

      if (this.options.addIndicators) {
        this._container.removeEventListener('resize', this._handleTriggerPositionChange.bind(this));
        if (!this._isDocument) {
          window.removeEventListener('resize', this._handleTriggerPositionChange.bind(this));
          window.removeEventListener('scroll', this._handleTriggerPositionChange.bind(this));
        }
        this._container.removeEventListener('resize', this._handleBoundsPositionChange.bind(this));
        this._container.removeEventListener('scroll', this._handleBoundsPositionChange.bind(this));
      }

      return null;
    }

    // indicators

    // event handler for when associated bounds markers need to be repositioned

  }, {
    key: '_handleBoundsPositionChange',
    value: function _handleBoundsPositionChange() {
      this.updateBoundsPositions();
    }

    // event handler for when associated trigger groups need to be repositioned

  }, {
    key: '_handleTriggerPositionChange',
    value: function _handleTriggerPositionChange() {
      this.updateTriggerGroupPositions();
    }

    // updates the position of the bounds container to aligned to the right for vertical containers and to the bottom for horizontal

  }, {
    key: 'updateBoundsPositions',
    value: function updateBoundsPositions(specificIndicator) {
      // constant for all bounds
      var groups = specificIndicator ? [U.extend({}, specificIndicator.triggerGroup, { members: [specificIndicator] })] : // create a group with only one element
      this._indicators.groups; // use all
      var g = groups.length;
      var css = {};
      var paramPos = this._vertical ? 'left' : 'top';
      var paramDimension = this._vertical ? 'width' : 'height';
      var edge = this._vertical ? U.get.scrollLeft(this._container) + U.get.width(this._container) - EDGE_OFFSET : U.get.scrollTop(this._container) + U.get.height(this._container) - EDGE_OFFSET;
      var b = void 0;
      var triggerSize = void 0;
      var group = void 0;
      while (g--) {
        // group loop
        group = groups[g];
        b = group.members.length;
        triggerSize = U.get[paramDimension](group.element.firstChild);
        while (b--) {
          // indicators loop
          css[paramPos] = edge - triggerSize;
          U.css(group.members[b].bounds, css);
        }
      }
    }

    // updates the positions of all trigger groups attached to a controller or a specific one, if provided

  }, {
    key: 'updateTriggerGroupPositions',
    value: function updateTriggerGroupPositions(specificGroup) {
      // constant vars
      var groups = specificGroup ? [specificGroup] : this._indicators.groups;
      var i = groups.length;
      var container = this._isDocument ? document.body : this._container;
      var containerOffset = this._isDocument ? { top: 0, left: 0 } : U.get.offset(container, true);
      var edge = this._vertical ? U.get.width(this._container) - EDGE_OFFSET : U.get.height(this._container) - EDGE_OFFSET;
      var paramDimension = this._vertical ? 'width' : 'height';
      var paramTransform = this._vertical ? 'Y' : 'X';
      // changing vars
      var group = void 0;
      var elem = void 0;
      var pos = void 0;
      var elemSize = void 0;
      var transform = void 0;
      while (i--) {
        group = groups[i];
        elem = group.element;
        pos = group.triggerHook * this.info('size');
        elemSize = U.get[paramDimension](elem.firstChild.firstChild);
        transform = pos > elemSize ? 'translate' + paramTransform + '(-100%)' : '';

        U.css(elem, {
          top: containerOffset.top + (this._vertical ? pos : edge - group.members[0].options.indent),
          left: containerOffset.left + (this._vertical ? edge - group.members[0].options.indent : pos)
        });
        U.css(elem.firstChild.firstChild, {
          '-ms-transform': transform,
          '-webkit-transform': transform,
          transform: transform
        });
      }
    }

    // updates the label for the group to contain the name, if it only has one member

  }, {
    key: 'updateTriggerGroupLabel',
    value: function updateTriggerGroupLabel(group) {
      var text = 'trigger' + (group.members.length > 1 ? '' : ' ' + group.members[0].options.name);
      var elem = group.element.firstChild.firstChild;
      var doUpdate = elem.textContent !== text;
      if (doUpdate) {
        elem.textContent = text;
        if (this._vertical) {
          // bounds position is dependent on text length, so update
          this.updateBoundsPositions();
        }
      }
    }
  }]);
  return Controller;
}();

var index = {
  Controller: Controller,
  Scene: Scene
};

return index;

}());
//# sourceMappingURL=scrollwizardry.js.map