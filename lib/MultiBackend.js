'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _objectAssign = require('./objectAssign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _default = function _default(manager, sourceOptions) {
  var _this = this;

  _classCallCheck(this, _default);

  this.setup = function () {
    if (typeof window === 'undefined') {
      return;
    }

    if (_this.constructor.isSetUp) {
      throw new Error('Cannot have two MultiBackends at the same time.');
    }
    _this.constructor.isSetUp = true;
    _this.addEventListeners(window);
    _this.backends[_this.current].instance.setup();
  };

  this.teardown = function () {
    if (typeof window === 'undefined') {
      return;
    }

    _this.constructor.isSetUp = false;
    _this.removeEventListeners(window);
    _this.backends[_this.current].instance.teardown();
  };

  this.connectDragSource = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _this.connectBackend('connectDragSource', args);
  };

  this.connectDragPreview = function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return _this.connectBackend('connectDragPreview', args);
  };

  this.connectDropTarget = function () {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    return _this.connectBackend('connectDropTarget', args);
  };

  this.previewEnabled = function () {
    return _this.backends[_this.current].preview;
  };

  this.addEventListeners = function (target) {
    _this.backends.forEach(function (backend) {
      if (backend.transition) {
        target.addEventListener(backend.transition.event, _this.backendSwitcher, true);
      }
    });
  };

  this.removeEventListeners = function (target) {
    _this.backends.forEach(function (backend) {
      if (backend.transition) {
        target.removeEventListener(backend.transition.event, _this.backendSwitcher, true);
      }
    });
  };

  this.backendSwitcher = function (event) {
    var oldBackend = _this.current;

    var i = 0;
    _this.backends.some(function (backend) {
      if (i !== _this.current && backend.transition && backend.transition.check(event)) {
        _this.current = i;
        return true;
      }
      i += 1;
      return false;
    });

    if (_this.current !== oldBackend) {
      _this.backends[oldBackend].instance.teardown();
      Object.keys(_this.nodes).forEach(function (id) {
        var node = _this.nodes[id];
        node.handler();
        node.handler = _this.callBackend(node.func, node.args);
      });
      _this.backends[_this.current].instance.setup();

      var newEvent = null;
      try {
        newEvent = new event.constructor(event.type, event);
      } catch (_e) {
        newEvent = document.createEvent('Event');
        newEvent.initEvent(event.type, event.bubbles, event.cancelable);
      }
      event.target.dispatchEvent(newEvent);
    }
  };

  this.callBackend = function (func, args) {
    var _backends$current$ins;

    return (_backends$current$ins = _this.backends[_this.current].instance)[func].apply(_backends$current$ins, _toConsumableArray(args));
  };

  this.connectBackend = function (func, args) {
    var nodeId = func + '_' + args[0];
    var handler = _this.callBackend(func, args);
    _this.nodes[nodeId] = { func: func, args: args, handler: handler };

    return function () {
      var _nodes$nodeId;

      var r = (_nodes$nodeId = _this.nodes[nodeId]).handler.apply(_nodes$nodeId, arguments);
      delete _this.nodes[nodeId];
      return r;
    };
  };

  var options = (0, _objectAssign2.default)({ backends: [] }, sourceOptions || {});

  if (options.backends.length < 1) {
    throw new Error('You must specify at least one Backend, if you are coming from 2.x.x (or don\'t understand this error)\n        see this guide: https://github.com/louisbrunner/react-dnd-multi-backend#migrating-from-2xx');
  }

  this.current = 0;

  this.backends = [];
  options.backends.forEach(function (backend) {
    if (!backend.backend) {
      throw new Error('You must specify a \'backend\' property in your Backend entry: ' + backend);
    }
    var transition = backend.transition;
    if (transition && !transition._isMBTransition) {
      throw new Error('You must specify a valid \'transition\' property (either undefined or the return of \'createTransition\') in your Backend entry: ' + backend);
    }
    _this.backends.push({
      instance: new backend.backend(manager),
      preview: backend.preview || false,
      transition: transition
    });
  });

  this.nodes = {};
}

// DnD Backend API


// Used by Preview component


// Multi Backend Listeners


// Switching logic
;

exports.default = _default;