(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';
(typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

var angular = (typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null),
    bodyclass = require('./bodyclass.js'),
    utils = require('./utils.js');

//--- Add additional body classes for individualized CSS rules
bodyclass();

//--- Pimp old Twoday classes, e.g. button in a .message
utils.pimpClasses();

//--- Set up the Angular app, Modernizr constant and run the FastClick js
angular
    .module('f5SkinApp', ['mm.foundation', 'toastr'])
    .config(function(toastrConfig){
        angular.extend(toastrConfig, {
            allowHtml: true,
            closeButton: true,
            progressBar: true,
            timeOut: 8000
        });
    })
    .constant('Modernizr', window.Modernizr)
    .run( function(){ window.FastClick.attach(document.body); });

//--- Require all services, controllers and directives through their folder's index.js
require('./services');
require('./controllers');
require('./directives');
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./bodyclass.js":8,"./controllers":14,"./directives":15,"./services":22,"./utils.js":23}],2:[function(require,module,exports){
var _ = require("lodash");
var pointer = require("json-pointer");
var levenshtein = require("./levenshtein");

/**
 * Backtrace an optimal path through a levenshtein distance matrix.
 *
 * @returns {Array} List of operations
 */
function matrixToOperations (matrix, i, j) {
  if (i === 0 && j === 0) {
    return [];
  } else if (i === 0) {
    return matrixToOperations(matrix, i, j - 1).concat("add");
  } else if (j === 0) {
    return matrixToOperations(matrix, i - 1, j).concat("remove");
  } else {
    var left = matrix[i][j - 1];
    var up = matrix[i - 1][j];
    var upleft = matrix[i - 1][j - 1];

    if (upleft <= up && upleft <= left) {
      if (upleft === matrix[i][j]) {
        return matrixToOperations(matrix, i - 1, j - 1).concat("eq");
      } else {
        return matrixToOperations(matrix, i - 1, j - 1).concat("replace");
      }
    } else if (left <= upleft && left <= up) {
      return matrixToOperations(matrix, i, j - 1).concat("add");
    } else {
      return matrixToOperations(matrix, i - 1, j).concat("remove");
    }
  }
}

function diff (from, to) {
  var ops = [];

  if (_.isEqual(from, to)) {
    return [];
  } else if (_.isPlainObject(from) && _.isPlainObject(to)) {
    var keys = _.union(_.keys(from), _.keys(to));

    ops = keys.map(function (key) {
      var hasFrom = from.hasOwnProperty(key);
      var hasTo = to.hasOwnProperty(key);

      if (hasFrom && hasTo) {
        var d = diff(from[key], to[key]);

        return d.map(function (op) {
          op.path.unshift(key);

          return op;
        });
      } else if (hasFrom) {
        return { op: "remove", path: [key] };
      } else {
        return { op: "add", path: [key], value: to[key] };
      }
    });

    return _.flatten(ops, true);
  } else if (_.isArray(from) && _.isArray(to)) {
    var matrix = levenshtein(from, to);
    ops = [];

    if (matrix) {
      var m = matrix.length;
      var n = matrix[0].length;
      var i = 0;
      var j = 0;
      var o = matrixToOperations(matrix, m - 1, n - 1);

      o.forEach(function (op) {
        if (op == "add") {
          ops.push({ op: "add", path: [j], value: to[j] });
          j++;
        } else if (op == "remove") {
          ops.push({ op: "remove", path: [j] });
          i++;
        } else if (op == "replace") {
          var operations = diff(from[i], to[j]);

          ops = ops.concat(operations.map(function (op) {
            op.path.unshift(j);

            return op;
          }));

          i++;
          j++;
        } else {
          i++;
          j++;
        }
      });
    }

    return ops;
  } else {
    return [{ op: "replace", path: [], value: to }];
  }
}

module.exports = function (from, to) {
  var ops = diff(from, to);
  ops = _.map(ops, function (op) {
    op.path = pointer.compile(op.path.map(function (p) { return "" + p; }));

    return op;
  });

  return ops;
};

},{"./levenshtein":3,"json-pointer":4,"lodash":6}],3:[function(require,module,exports){
var _ = require("lodash");

// Compute the levenshtein edit distance matrix for two lists.
//
// It can be used to infer the concrete edit operations to transform the first
// list into the second.
//
// Returns an m*n matrix, where the (i, j) cell contains the levenshtein
// distance between the i-element prefix of from and the j-element prefix of to.
module.exports = function (from, to) {
  if (_.isEqual(from, to)) {
    return null;
  }

  var m = from.length;
  var n = to.length;
  var d = _.range(0, m + 1).map(function (x) {
    return [x];
  });

  d[0] = _.range(0, n + 1);

  for (var i = 1; i <= m; i++) {
    for (var j = 1; j <= n; j++) {
      var replacementCost = 1;

      if (_.isEqual(from[i - 1], to[j - 1])) {
        replacementCost = 0;
      }

      d[i][j] = _.min([d[i - 1][j - 1] + replacementCost,
                       d[i - 1][j] + 1,
                       d[i][j - 1] + 1]);
    }
  }

  return d;
};

},{"lodash":6}],4:[function(require,module,exports){
'use strict';

var each = require('foreach');
module.exports = api;


/**
 * Convenience wrapper around the api.
 * Calls `.get` when called with an `object` and a `pointer`.
 * Calls `.set` when also called with `value`.
 * If only supplied `object`, returns a partially applied function, mapped to the object.
 *
 * @param obj
 * @param pointer
 * @param value
 * @returns {*}
 */

function api (obj, pointer, value) {
    // .set()
    if (arguments.length === 3) {
        return api.set(obj, pointer, value);
    }
    // .get()
    if (arguments.length === 2) {
        return api.get(obj, pointer);
    }
    // Return a partially applied function on `obj`.
    var wrapped = api.bind(api, obj);

    // Support for oo style
    for (var name in api) {
        if (api.hasOwnProperty(name)) {
            wrapped[name] = api[name].bind(wrapped, obj);
        }
    }
    return wrapped;
}


/**
 * Lookup a json pointer in an object
 *
 * @param obj
 * @param pointer
 * @returns {*}
 */
api.get = function get (obj, pointer) {
    var tok,
        refTokens = api.parse(pointer);
    while (refTokens.length) {
        tok = refTokens.shift();
        if (!obj.hasOwnProperty(tok)) {
            throw new Error('Invalid reference token: ' + tok);
        }
        obj = obj[tok];
    }
    return obj;
};

/**
 * Sets a value on an object
 *
 * @param obj
 * @param pointer
 * @param value
 */
api.set = function set (obj, pointer, value) {
    var refTokens = api.parse(pointer),
        tok,
        nextTok = refTokens[0];
    while (refTokens.length > 1) {
        tok = refTokens.shift();
        nextTok = refTokens[0];

        if (!obj.hasOwnProperty(tok)) {
            if (nextTok.match(/^\d+$/)) {
                obj[tok] = [];
            } else {
                obj[tok] = {};
            }
        }
        obj = obj[tok];
    }
    obj[nextTok] = value;
    return this;
};

/**
 * Removes an attribute
 *
 * @param obj
 * @param pointer
 */
api.remove = function (obj, pointer) {
    var refTokens = api.parse(pointer);
    var finalToken = refTokens.pop();
    if (finalToken === undefined) {
        throw new Error('Invalid JSON pointer for remove: "' + pointer + '"');
    }
    delete api.get(obj, api.compile(refTokens))[finalToken];
};

/**
 * Returns a (pointer -> value) dictionary for an object
 *
 * @param obj
 * @param {function} descend
 * @returns {}
 */
api.dict = function dict (obj, descend) {
    var results = {};
    api.walk(obj, function (value, pointer) {
        results[pointer] = value;
    }, descend);
    return results;
};

/**
 * Iterates over an object
 * Iterator: function (value, pointer) {}
 *
 * @param obj
 * @param {function} iterator
 * @param {function} descend
 */
api.walk = function walk (obj, iterator, descend) {
    var refTokens = [];

    descend = descend || function (value) {
        var type = Object.prototype.toString.call(value);
        return type === '[object Object]' || type === '[object Array]';
    };

    (function next (cur) {
        each(cur, function (value, key) {
            refTokens.push(String(key));
            if (descend(value)) {
                next(value);
            } else {
                iterator(value, api.compile(refTokens));
            }
            refTokens.pop();
        });
    }(obj));
};

/**
 * Tests if an object has a value for a json pointer
 *
 * @param obj
 * @param pointer
 * @returns {boolean}
 */
api.has = function has (obj, pointer) {
    try {
        api.get(obj, pointer);
    } catch (e) {
        return false;
    }
    return true;
};

/**
 * Escapes a reference token
 *
 * @param str
 * @returns {string}
 */
api.escape = function escape (str) {
    return str.toString().replace(/~/g, '~0').replace(/\//g, '~1');
};

/**
 * Unescapes a reference token
 *
 * @param str
 * @returns {string}
 */
api.unescape = function unescape (str) {
    return str.replace(/~1/g, '/').replace(/~0/g, '~');
};

/**
 * Converts a json pointer into a array of reference tokens
 *
 * @param pointer
 * @returns {Array}
 */
api.parse = function parse (pointer) {
    if (pointer === '') { return []; }
    if (pointer.charAt(0) !== '/') { throw new Error('Invalid JSON pointer: ' + pointer); }
    return pointer.substring(1).split(/\//).map(api.unescape);
};

/**
 * Builds a json pointer from a array of reference tokens
 *
 * @param refTokens
 * @returns {string}
 */
api.compile = function compile (refTokens) {
    if (refTokens.length === 0) { return ''; }
    return '/' + refTokens.map(api.escape).join('/');
};

},{"foreach":5}],5:[function(require,module,exports){

var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

module.exports = function forEach (obj, fn, ctx) {
    if (toString.call(fn) !== '[object Function]') {
        throw new TypeError('iterator must be a function');
    }
    var l = obj.length;
    if (l === +l) {
        for (var i = 0; i < l; i++) {
            fn.call(ctx, obj[i], i, obj);
        }
    } else {
        for (var k in obj) {
            if (hasOwn.call(obj, k)) {
                fn.call(ctx, obj[k], k, obj);
            }
        }
    }
};


},{}],6:[function(require,module,exports){
(function (global){
/**
 * @license
 * Lo-Dash 2.4.2 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern -o ./dist/lodash.js`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
;(function() {

  /** Used as a safe reference for `undefined` in pre ES5 environments */
  var undefined;

  /** Used to pool arrays and objects used internally */
  var arrayPool = [],
      objectPool = [];

  /** Used to generate unique IDs */
  var idCounter = 0;

  /** Used to prefix keys to avoid issues with `__proto__` and properties on `Object.prototype` */
  var keyPrefix = +new Date + '';

  /** Used as the size when optimizations are enabled for large arrays */
  var largeArraySize = 75;

  /** Used as the max size of the `arrayPool` and `objectPool` */
  var maxPoolSize = 40;

  /** Used to detect and test whitespace */
  var whitespace = (
    // whitespace
    ' \t\x0B\f\xA0\ufeff' +

    // line terminators
    '\n\r\u2028\u2029' +

    // unicode category "Zs" space separators
    '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000'
  );

  /** Used to match empty string literals in compiled template source */
  var reEmptyStringLeading = /\b__p \+= '';/g,
      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

  /**
   * Used to match ES6 template delimiters
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-literals-string-literals
   */
  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

  /** Used to match regexp flags from their coerced string values */
  var reFlags = /\w*$/;

  /** Used to detected named functions */
  var reFuncName = /^\s*function[ \n\r\t]+\w/;

  /** Used to match "interpolate" template delimiters */
  var reInterpolate = /<%=([\s\S]+?)%>/g;

  /** Used to match leading whitespace and zeros to be removed */
  var reLeadingSpacesAndZeros = RegExp('^[' + whitespace + ']*0+(?=.$)');

  /** Used to ensure capturing order of template delimiters */
  var reNoMatch = /($^)/;

  /** Used to detect functions containing a `this` reference */
  var reThis = /\bthis\b/;

  /** Used to match unescaped characters in compiled string literals */
  var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;

  /** Used to assign default `context` object properties */
  var contextProps = [
    'Array', 'Boolean', 'Date', 'Function', 'Math', 'Number', 'Object',
    'RegExp', 'String', '_', 'attachEvent', 'clearTimeout', 'isFinite', 'isNaN',
    'parseInt', 'setTimeout'
  ];

  /** Used to make template sourceURLs easier to identify */
  var templateCounter = 0;

  /** `Object#toString` result shortcuts */
  var argsClass = '[object Arguments]',
      arrayClass = '[object Array]',
      boolClass = '[object Boolean]',
      dateClass = '[object Date]',
      funcClass = '[object Function]',
      numberClass = '[object Number]',
      objectClass = '[object Object]',
      regexpClass = '[object RegExp]',
      stringClass = '[object String]';

  /** Used to identify object classifications that `_.clone` supports */
  var cloneableClasses = {};
  cloneableClasses[funcClass] = false;
  cloneableClasses[argsClass] = cloneableClasses[arrayClass] =
  cloneableClasses[boolClass] = cloneableClasses[dateClass] =
  cloneableClasses[numberClass] = cloneableClasses[objectClass] =
  cloneableClasses[regexpClass] = cloneableClasses[stringClass] = true;

  /** Used as an internal `_.debounce` options object */
  var debounceOptions = {
    'leading': false,
    'maxWait': 0,
    'trailing': false
  };

  /** Used as the property descriptor for `__bindData__` */
  var descriptor = {
    'configurable': false,
    'enumerable': false,
    'value': null,
    'writable': false
  };

  /** Used to determine if values are of the language type Object */
  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };

  /** Used to escape characters for inclusion in compiled string literals */
  var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  /** Used as a reference to the global object */
  var root = (objectTypes[typeof window] && window) || this;

  /** Detect free variable `exports` */
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  /** Detect free variable `module` */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports` */
  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
  var freeGlobal = objectTypes[typeof global] && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    root = freeGlobal;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * The base implementation of `_.indexOf` without support for binary searches
   * or `fromIndex` constraints.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {*} value The value to search for.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {number} Returns the index of the matched value or `-1`.
   */
  function baseIndexOf(array, value, fromIndex) {
    var index = (fromIndex || 0) - 1,
        length = array ? array.length : 0;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  /**
   * An implementation of `_.contains` for cache objects that mimics the return
   * signature of `_.indexOf` by returning `0` if the value is found, else `-1`.
   *
   * @private
   * @param {Object} cache The cache object to inspect.
   * @param {*} value The value to search for.
   * @returns {number} Returns `0` if `value` is found, else `-1`.
   */
  function cacheIndexOf(cache, value) {
    var type = typeof value;
    cache = cache.cache;

    if (type == 'boolean' || value == null) {
      return cache[value] ? 0 : -1;
    }
    if (type != 'number' && type != 'string') {
      type = 'object';
    }
    var key = type == 'number' ? value : keyPrefix + value;
    cache = (cache = cache[type]) && cache[key];

    return type == 'object'
      ? (cache && baseIndexOf(cache, value) > -1 ? 0 : -1)
      : (cache ? 0 : -1);
  }

  /**
   * Adds a given value to the corresponding cache object.
   *
   * @private
   * @param {*} value The value to add to the cache.
   */
  function cachePush(value) {
    var cache = this.cache,
        type = typeof value;

    if (type == 'boolean' || value == null) {
      cache[value] = true;
    } else {
      if (type != 'number' && type != 'string') {
        type = 'object';
      }
      var key = type == 'number' ? value : keyPrefix + value,
          typeCache = cache[type] || (cache[type] = {});

      if (type == 'object') {
        (typeCache[key] || (typeCache[key] = [])).push(value);
      } else {
        typeCache[key] = true;
      }
    }
  }

  /**
   * Used by `_.max` and `_.min` as the default callback when a given
   * collection is a string value.
   *
   * @private
   * @param {string} value The character to inspect.
   * @returns {number} Returns the code unit of given character.
   */
  function charAtCallback(value) {
    return value.charCodeAt(0);
  }

  /**
   * Used by `sortBy` to compare transformed `collection` elements, stable sorting
   * them in ascending order.
   *
   * @private
   * @param {Object} a The object to compare to `b`.
   * @param {Object} b The object to compare to `a`.
   * @returns {number} Returns the sort order indicator of `1` or `-1`.
   */
  function compareAscending(a, b) {
    var ac = a.criteria,
        bc = b.criteria,
        index = -1,
        length = ac.length;

    while (++index < length) {
      var value = ac[index],
          other = bc[index];

      if (value !== other) {
        if (value > other || typeof value == 'undefined') {
          return 1;
        }
        if (value < other || typeof other == 'undefined') {
          return -1;
        }
      }
    }
    // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
    // that causes it, under certain circumstances, to return the same value for
    // `a` and `b`. See https://github.com/jashkenas/underscore/pull/1247
    //
    // This also ensures a stable sort in V8 and other engines.
    // See http://code.google.com/p/v8/issues/detail?id=90
    return a.index - b.index;
  }

  /**
   * Creates a cache object to optimize linear searches of large arrays.
   *
   * @private
   * @param {Array} [array=[]] The array to search.
   * @returns {null|Object} Returns the cache object or `null` if caching should not be used.
   */
  function createCache(array) {
    var index = -1,
        length = array.length,
        first = array[0],
        mid = array[(length / 2) | 0],
        last = array[length - 1];

    if (first && typeof first == 'object' &&
        mid && typeof mid == 'object' && last && typeof last == 'object') {
      return false;
    }
    var cache = getObject();
    cache['false'] = cache['null'] = cache['true'] = cache['undefined'] = false;

    var result = getObject();
    result.array = array;
    result.cache = cache;
    result.push = cachePush;

    while (++index < length) {
      result.push(array[index]);
    }
    return result;
  }

  /**
   * Used by `template` to escape characters for inclusion in compiled
   * string literals.
   *
   * @private
   * @param {string} match The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  function escapeStringChar(match) {
    return '\\' + stringEscapes[match];
  }

  /**
   * Gets an array from the array pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Array} The array from the pool.
   */
  function getArray() {
    return arrayPool.pop() || [];
  }

  /**
   * Gets an object from the object pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Object} The object from the pool.
   */
  function getObject() {
    return objectPool.pop() || {
      'array': null,
      'cache': null,
      'criteria': null,
      'false': false,
      'index': 0,
      'null': false,
      'number': null,
      'object': null,
      'push': null,
      'string': null,
      'true': false,
      'undefined': false,
      'value': null
    };
  }

  /**
   * Releases the given array back to the array pool.
   *
   * @private
   * @param {Array} [array] The array to release.
   */
  function releaseArray(array) {
    array.length = 0;
    if (arrayPool.length < maxPoolSize) {
      arrayPool.push(array);
    }
  }

  /**
   * Releases the given object back to the object pool.
   *
   * @private
   * @param {Object} [object] The object to release.
   */
  function releaseObject(object) {
    var cache = object.cache;
    if (cache) {
      releaseObject(cache);
    }
    object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null;
    if (objectPool.length < maxPoolSize) {
      objectPool.push(object);
    }
  }

  /**
   * Slices the `collection` from the `start` index up to, but not including,
   * the `end` index.
   *
   * Note: This function is used instead of `Array#slice` to support node lists
   * in IE < 9 and to ensure dense arrays are returned.
   *
   * @private
   * @param {Array|Object|string} collection The collection to slice.
   * @param {number} start The start index.
   * @param {number} end The end index.
   * @returns {Array} Returns the new array.
   */
  function slice(array, start, end) {
    start || (start = 0);
    if (typeof end == 'undefined') {
      end = array ? array.length : 0;
    }
    var index = -1,
        length = end - start || 0,
        result = Array(length < 0 ? 0 : length);

    while (++index < length) {
      result[index] = array[start + index];
    }
    return result;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Create a new `lodash` function using the given context object.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {Object} [context=root] The context object.
   * @returns {Function} Returns the `lodash` function.
   */
  function runInContext(context) {
    // Avoid issues with some ES3 environments that attempt to use values, named
    // after built-in constructors like `Object`, for the creation of literals.
    // ES5 clears this up by stating that literals must use built-in constructors.
    // See http://es5.github.io/#x11.1.5.
    context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;

    /** Native constructor references */
    var Array = context.Array,
        Boolean = context.Boolean,
        Date = context.Date,
        Function = context.Function,
        Math = context.Math,
        Number = context.Number,
        Object = context.Object,
        RegExp = context.RegExp,
        String = context.String,
        TypeError = context.TypeError;

    /**
     * Used for `Array` method references.
     *
     * Normally `Array.prototype` would suffice, however, using an array literal
     * avoids issues in Narwhal.
     */
    var arrayRef = [];

    /** Used for native method references */
    var objectProto = Object.prototype;

    /** Used to restore the original `_` reference in `noConflict` */
    var oldDash = context._;

    /** Used to resolve the internal [[Class]] of values */
    var toString = objectProto.toString;

    /** Used to detect if a method is native */
    var reNative = RegExp('^' +
      String(toString)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/toString| for [^\]]+/g, '.*?') + '$'
    );

    /** Native method shortcuts */
    var ceil = Math.ceil,
        clearTimeout = context.clearTimeout,
        floor = Math.floor,
        fnToString = Function.prototype.toString,
        getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf,
        hasOwnProperty = objectProto.hasOwnProperty,
        push = arrayRef.push,
        setTimeout = context.setTimeout,
        splice = arrayRef.splice,
        unshift = arrayRef.unshift;

    /** Used to set meta data on functions */
    var defineProperty = (function() {
      // IE 8 only accepts DOM elements
      try {
        var o = {},
            func = isNative(func = Object.defineProperty) && func,
            result = func(o, o, o) && func;
      } catch(e) { }
      return result;
    }());

    /* Native method shortcuts for methods with the same name as other `lodash` methods */
    var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate,
        nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray,
        nativeIsFinite = context.isFinite,
        nativeIsNaN = context.isNaN,
        nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys,
        nativeMax = Math.max,
        nativeMin = Math.min,
        nativeParseInt = context.parseInt,
        nativeRandom = Math.random;

    /** Used to lookup a built-in constructor by [[Class]] */
    var ctorByClass = {};
    ctorByClass[arrayClass] = Array;
    ctorByClass[boolClass] = Boolean;
    ctorByClass[dateClass] = Date;
    ctorByClass[funcClass] = Function;
    ctorByClass[objectClass] = Object;
    ctorByClass[numberClass] = Number;
    ctorByClass[regexpClass] = RegExp;
    ctorByClass[stringClass] = String;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object which wraps the given value to enable intuitive
     * method chaining.
     *
     * In addition to Lo-Dash methods, wrappers also have the following `Array` methods:
     * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,
     * and `unshift`
     *
     * Chaining is supported in custom builds as long as the `value` method is
     * implicitly or explicitly included in the build.
     *
     * The chainable wrapper functions are:
     * `after`, `assign`, `bind`, `bindAll`, `bindKey`, `chain`, `compact`,
     * `compose`, `concat`, `countBy`, `create`, `createCallback`, `curry`,
     * `debounce`, `defaults`, `defer`, `delay`, `difference`, `filter`, `flatten`,
     * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,
     * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,
     * `invoke`, `keys`, `map`, `max`, `memoize`, `merge`, `min`, `object`, `omit`,
     * `once`, `pairs`, `partial`, `partialRight`, `pick`, `pluck`, `pull`, `push`,
     * `range`, `reject`, `remove`, `rest`, `reverse`, `shuffle`, `slice`, `sort`,
     * `sortBy`, `splice`, `tap`, `throttle`, `times`, `toArray`, `transform`,
     * `union`, `uniq`, `unshift`, `unzip`, `values`, `where`, `without`, `wrap`,
     * and `zip`
     *
     * The non-chainable wrapper functions are:
     * `clone`, `cloneDeep`, `contains`, `escape`, `every`, `find`, `findIndex`,
     * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `has`, `identity`,
     * `indexOf`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,
     * `isEmpty`, `isEqual`, `isFinite`, `isFunction`, `isNaN`, `isNull`, `isNumber`,
     * `isObject`, `isPlainObject`, `isRegExp`, `isString`, `isUndefined`, `join`,
     * `lastIndexOf`, `mixin`, `noConflict`, `parseInt`, `pop`, `random`, `reduce`,
     * `reduceRight`, `result`, `shift`, `size`, `some`, `sortedIndex`, `runInContext`,
     * `template`, `unescape`, `uniqueId`, and `value`
     *
     * The wrapper functions `first` and `last` return wrapped values when `n` is
     * provided, otherwise they return unwrapped values.
     *
     * Explicit chaining can be enabled by using the `_.chain` method.
     *
     * @name _
     * @constructor
     * @category Chaining
     * @param {*} value The value to wrap in a `lodash` instance.
     * @returns {Object} Returns a `lodash` instance.
     * @example
     *
     * var wrapped = _([1, 2, 3]);
     *
     * // returns an unwrapped value
     * wrapped.reduce(function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * // returns a wrapped value
     * var squares = wrapped.map(function(num) {
     *   return num * num;
     * });
     *
     * _.isArray(squares);
     * // => false
     *
     * _.isArray(squares.value());
     * // => true
     */
    function lodash(value) {
      // don't wrap if already wrapped, even if wrapped by a different `lodash` constructor
      return (value && typeof value == 'object' && !isArray(value) && hasOwnProperty.call(value, '__wrapped__'))
       ? value
       : new lodashWrapper(value);
    }

    /**
     * A fast path for creating `lodash` wrapper objects.
     *
     * @private
     * @param {*} value The value to wrap in a `lodash` instance.
     * @param {boolean} chainAll A flag to enable chaining for all methods
     * @returns {Object} Returns a `lodash` instance.
     */
    function lodashWrapper(value, chainAll) {
      this.__chain__ = !!chainAll;
      this.__wrapped__ = value;
    }
    // ensure `new lodashWrapper` is an instance of `lodash`
    lodashWrapper.prototype = lodash.prototype;

    /**
     * An object used to flag environments features.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    var support = lodash.support = {};

    /**
     * Detect if functions can be decompiled by `Function#toString`
     * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcDecomp = !isNative(context.WinRTError) && reThis.test(runInContext);

    /**
     * Detect if `Function#name` is supported (all but IE).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcNames = typeof Function.name == 'string';

    /**
     * By default, the template delimiters used by Lo-Dash are similar to those in
     * embedded Ruby (ERB). Change the following template settings to use alternative
     * delimiters.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    lodash.templateSettings = {

      /**
       * Used to detect `data` property values to be HTML-escaped.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'escape': /<%-([\s\S]+?)%>/g,

      /**
       * Used to detect code to be evaluated.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'evaluate': /<%([\s\S]+?)%>/g,

      /**
       * Used to detect `data` property values to inject.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'interpolate': reInterpolate,

      /**
       * Used to reference the data object in the template text.
       *
       * @memberOf _.templateSettings
       * @type string
       */
      'variable': '',

      /**
       * Used to import variables into the compiled template.
       *
       * @memberOf _.templateSettings
       * @type Object
       */
      'imports': {

        /**
         * A reference to the `lodash` function.
         *
         * @memberOf _.templateSettings.imports
         * @type Function
         */
        '_': lodash
      }
    };

    /*--------------------------------------------------------------------------*/

    /**
     * The base implementation of `_.bind` that creates the bound function and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new bound function.
     */
    function baseBind(bindData) {
      var func = bindData[0],
          partialArgs = bindData[2],
          thisArg = bindData[4];

      function bound() {
        // `Function#bind` spec
        // http://es5.github.io/#x15.3.4.5
        if (partialArgs) {
          // avoid `arguments` object deoptimizations by using `slice` instead
          // of `Array.prototype.slice.call` and not assigning `arguments` to a
          // variable as a ternary expression
          var args = slice(partialArgs);
          push.apply(args, arguments);
        }
        // mimic the constructor's `return` behavior
        // http://es5.github.io/#x13.2.2
        if (this instanceof bound) {
          // ensure `new bound` is an instance of `func`
          var thisBinding = baseCreate(func.prototype),
              result = func.apply(thisBinding, args || arguments);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisArg, args || arguments);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.clone` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates clones with source counterparts.
     * @returns {*} Returns the cloned value.
     */
    function baseClone(value, isDeep, callback, stackA, stackB) {
      if (callback) {
        var result = callback(value);
        if (typeof result != 'undefined') {
          return result;
        }
      }
      // inspect [[Class]]
      var isObj = isObject(value);
      if (isObj) {
        var className = toString.call(value);
        if (!cloneableClasses[className]) {
          return value;
        }
        var ctor = ctorByClass[className];
        switch (className) {
          case boolClass:
          case dateClass:
            return new ctor(+value);

          case numberClass:
          case stringClass:
            return new ctor(value);

          case regexpClass:
            result = ctor(value.source, reFlags.exec(value));
            result.lastIndex = value.lastIndex;
            return result;
        }
      } else {
        return value;
      }
      var isArr = isArray(value);
      if (isDeep) {
        // check for circular references and return corresponding clone
        var initedStack = !stackA;
        stackA || (stackA = getArray());
        stackB || (stackB = getArray());

        var length = stackA.length;
        while (length--) {
          if (stackA[length] == value) {
            return stackB[length];
          }
        }
        result = isArr ? ctor(value.length) : {};
      }
      else {
        result = isArr ? slice(value) : assign({}, value);
      }
      // add array properties assigned by `RegExp#exec`
      if (isArr) {
        if (hasOwnProperty.call(value, 'index')) {
          result.index = value.index;
        }
        if (hasOwnProperty.call(value, 'input')) {
          result.input = value.input;
        }
      }
      // exit for shallow clone
      if (!isDeep) {
        return result;
      }
      // add the source value to the stack of traversed objects
      // and associate it with its clone
      stackA.push(value);
      stackB.push(result);

      // recursively populate clone (susceptible to call stack limits)
      (isArr ? forEach : forOwn)(value, function(objValue, key) {
        result[key] = baseClone(objValue, isDeep, callback, stackA, stackB);
      });

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} prototype The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    function baseCreate(prototype, properties) {
      return isObject(prototype) ? nativeCreate(prototype) : {};
    }
    // fallback for browsers without `Object.create`
    if (!nativeCreate) {
      baseCreate = (function() {
        function Object() {}
        return function(prototype) {
          if (isObject(prototype)) {
            Object.prototype = prototype;
            var result = new Object;
            Object.prototype = null;
          }
          return result || context.Object();
        };
      }());
    }

    /**
     * The base implementation of `_.createCallback` without support for creating
     * "_.pluck" or "_.where" style callbacks.
     *
     * @private
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     */
    function baseCreateCallback(func, thisArg, argCount) {
      if (typeof func != 'function') {
        return identity;
      }
      // exit early for no `thisArg` or already bound by `Function#bind`
      if (typeof thisArg == 'undefined' || !('prototype' in func)) {
        return func;
      }
      var bindData = func.__bindData__;
      if (typeof bindData == 'undefined') {
        if (support.funcNames) {
          bindData = !func.name;
        }
        bindData = bindData || !support.funcDecomp;
        if (!bindData) {
          var source = fnToString.call(func);
          if (!support.funcNames) {
            bindData = !reFuncName.test(source);
          }
          if (!bindData) {
            // checks if `func` references the `this` keyword and stores the result
            bindData = reThis.test(source);
            setBindData(func, bindData);
          }
        }
      }
      // exit early if there are no `this` references or `func` is bound
      if (bindData === false || (bindData !== true && bindData[1] & 1)) {
        return func;
      }
      switch (argCount) {
        case 1: return function(value) {
          return func.call(thisArg, value);
        };
        case 2: return function(a, b) {
          return func.call(thisArg, a, b);
        };
        case 3: return function(value, index, collection) {
          return func.call(thisArg, value, index, collection);
        };
        case 4: return function(accumulator, value, index, collection) {
          return func.call(thisArg, accumulator, value, index, collection);
        };
      }
      return bind(func, thisArg);
    }

    /**
     * The base implementation of `createWrapper` that creates the wrapper and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new function.
     */
    function baseCreateWrapper(bindData) {
      var func = bindData[0],
          bitmask = bindData[1],
          partialArgs = bindData[2],
          partialRightArgs = bindData[3],
          thisArg = bindData[4],
          arity = bindData[5];

      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          key = func;

      function bound() {
        var thisBinding = isBind ? thisArg : this;
        if (partialArgs) {
          var args = slice(partialArgs);
          push.apply(args, arguments);
        }
        if (partialRightArgs || isCurry) {
          args || (args = slice(arguments));
          if (partialRightArgs) {
            push.apply(args, partialRightArgs);
          }
          if (isCurry && args.length < arity) {
            bitmask |= 16 & ~32;
            return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
          }
        }
        args || (args = arguments);
        if (isBindKey) {
          func = thisBinding[key];
        }
        if (this instanceof bound) {
          thisBinding = baseCreate(func.prototype);
          var result = func.apply(thisBinding, args);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisBinding, args);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.difference` that accepts a single array
     * of values to exclude.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {Array} [values] The array of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     */
    function baseDifference(array, values) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          isLarge = length >= largeArraySize && indexOf === baseIndexOf,
          result = [];

      if (isLarge) {
        var cache = createCache(values);
        if (cache) {
          indexOf = cacheIndexOf;
          values = cache;
        } else {
          isLarge = false;
        }
      }
      while (++index < length) {
        var value = array[index];
        if (indexOf(values, value) < 0) {
          result.push(value);
        }
      }
      if (isLarge) {
        releaseObject(values);
      }
      return result;
    }

    /**
     * The base implementation of `_.flatten` without support for callback
     * shorthands or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {boolean} [isStrict=false] A flag to restrict flattening to arrays and `arguments` objects.
     * @param {number} [fromIndex=0] The index to start from.
     * @returns {Array} Returns a new flattened array.
     */
    function baseFlatten(array, isShallow, isStrict, fromIndex) {
      var index = (fromIndex || 0) - 1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];

        if (value && typeof value == 'object' && typeof value.length == 'number'
            && (isArray(value) || isArguments(value))) {
          // recursively flatten arrays (susceptible to call stack limits)
          if (!isShallow) {
            value = baseFlatten(value, isShallow, isStrict);
          }
          var valIndex = -1,
              valLength = value.length,
              resIndex = result.length;

          result.length += valLength;
          while (++valIndex < valLength) {
            result[resIndex++] = value[valIndex];
          }
        } else if (!isStrict) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.isEqual`, without support for `thisArg` binding,
     * that allows partial "_.where" style comparisons.
     *
     * @private
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.
     * @param {Array} [stackA=[]] Tracks traversed `a` objects.
     * @param {Array} [stackB=[]] Tracks traversed `b` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
      // used to indicate that when comparing objects, `a` has at least the properties of `b`
      if (callback) {
        var result = callback(a, b);
        if (typeof result != 'undefined') {
          return !!result;
        }
      }
      // exit early for identical values
      if (a === b) {
        // treat `+0` vs. `-0` as not equal
        return a !== 0 || (1 / a == 1 / b);
      }
      var type = typeof a,
          otherType = typeof b;

      // exit early for unlike primitive values
      if (a === a &&
          !(a && objectTypes[type]) &&
          !(b && objectTypes[otherType])) {
        return false;
      }
      // exit early for `null` and `undefined` avoiding ES3's Function#call behavior
      // http://es5.github.io/#x15.3.4.4
      if (a == null || b == null) {
        return a === b;
      }
      // compare [[Class]] names
      var className = toString.call(a),
          otherClass = toString.call(b);

      if (className == argsClass) {
        className = objectClass;
      }
      if (otherClass == argsClass) {
        otherClass = objectClass;
      }
      if (className != otherClass) {
        return false;
      }
      switch (className) {
        case boolClass:
        case dateClass:
          // coerce dates and booleans to numbers, dates to milliseconds and booleans
          // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
          return +a == +b;

        case numberClass:
          // treat `NaN` vs. `NaN` as equal
          return (a != +a)
            ? b != +b
            // but treat `+0` vs. `-0` as not equal
            : (a == 0 ? (1 / a == 1 / b) : a == +b);

        case regexpClass:
        case stringClass:
          // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
          // treat string primitives and their corresponding object instances as equal
          return a == String(b);
      }
      var isArr = className == arrayClass;
      if (!isArr) {
        // unwrap any `lodash` wrapped values
        var aWrapped = hasOwnProperty.call(a, '__wrapped__'),
            bWrapped = hasOwnProperty.call(b, '__wrapped__');

        if (aWrapped || bWrapped) {
          return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
        }
        // exit for functions and DOM nodes
        if (className != objectClass) {
          return false;
        }
        // in older versions of Opera, `arguments` objects have `Array` constructors
        var ctorA = a.constructor,
            ctorB = b.constructor;

        // non `Object` object instances with different constructors are not equal
        if (ctorA != ctorB &&
              !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
              ('constructor' in a && 'constructor' in b)
            ) {
          return false;
        }
      }
      // assume cyclic structures are equal
      // the algorithm for detecting cyclic structures is adapted from ES 5.1
      // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
      var initedStack = !stackA;
      stackA || (stackA = getArray());
      stackB || (stackB = getArray());

      var length = stackA.length;
      while (length--) {
        if (stackA[length] == a) {
          return stackB[length] == b;
        }
      }
      var size = 0;
      result = true;

      // add `a` and `b` to the stack of traversed objects
      stackA.push(a);
      stackB.push(b);

      // recursively compare objects and arrays (susceptible to call stack limits)
      if (isArr) {
        // compare lengths to determine if a deep comparison is necessary
        length = a.length;
        size = b.length;
        result = size == length;

        if (result || isWhere) {
          // deep compare the contents, ignoring non-numeric properties
          while (size--) {
            var index = length,
                value = b[size];

            if (isWhere) {
              while (index--) {
                if ((result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB))) {
                  break;
                }
              }
            } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
              break;
            }
          }
        }
      }
      else {
        // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
        // which, in this case, is more costly
        forIn(b, function(value, key, b) {
          if (hasOwnProperty.call(b, key)) {
            // count the number of properties.
            size++;
            // deep compare each property value.
            return (result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB));
          }
        });

        if (result && !isWhere) {
          // ensure both objects have the same number of properties
          forIn(a, function(value, key, a) {
            if (hasOwnProperty.call(a, key)) {
              // `size` will be `-1` if `a` has more properties than `b`
              return (result = --size > -1);
            }
          });
        }
      }
      stackA.pop();
      stackB.pop();

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.merge` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates values with source counterparts.
     */
    function baseMerge(object, source, callback, stackA, stackB) {
      (isArray(source) ? forEach : forOwn)(source, function(source, key) {
        var found,
            isArr,
            result = source,
            value = object[key];

        if (source && ((isArr = isArray(source)) || isPlainObject(source))) {
          // avoid merging previously merged cyclic sources
          var stackLength = stackA.length;
          while (stackLength--) {
            if ((found = stackA[stackLength] == source)) {
              value = stackB[stackLength];
              break;
            }
          }
          if (!found) {
            var isShallow;
            if (callback) {
              result = callback(value, source);
              if ((isShallow = typeof result != 'undefined')) {
                value = result;
              }
            }
            if (!isShallow) {
              value = isArr
                ? (isArray(value) ? value : [])
                : (isPlainObject(value) ? value : {});
            }
            // add `source` and associated `value` to the stack of traversed objects
            stackA.push(source);
            stackB.push(value);

            // recursively merge objects and arrays (susceptible to call stack limits)
            if (!isShallow) {
              baseMerge(value, source, callback, stackA, stackB);
            }
          }
        }
        else {
          if (callback) {
            result = callback(value, source);
            if (typeof result == 'undefined') {
              result = source;
            }
          }
          if (typeof result != 'undefined') {
            value = result;
          }
        }
        object[key] = value;
      });
    }

    /**
     * The base implementation of `_.random` without argument juggling or support
     * for returning floating-point numbers.
     *
     * @private
     * @param {number} min The minimum possible value.
     * @param {number} max The maximum possible value.
     * @returns {number} Returns a random number.
     */
    function baseRandom(min, max) {
      return min + floor(nativeRandom() * (max - min + 1));
    }

    /**
     * The base implementation of `_.uniq` without support for callback shorthands
     * or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function} [callback] The function called per iteration.
     * @returns {Array} Returns a duplicate-value-free array.
     */
    function baseUniq(array, isSorted, callback) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          result = [];

      var isLarge = !isSorted && length >= largeArraySize && indexOf === baseIndexOf,
          seen = (callback || isLarge) ? getArray() : result;

      if (isLarge) {
        var cache = createCache(seen);
        indexOf = cacheIndexOf;
        seen = cache;
      }
      while (++index < length) {
        var value = array[index],
            computed = callback ? callback(value, index, array) : value;

        if (isSorted
              ? !index || seen[seen.length - 1] !== computed
              : indexOf(seen, computed) < 0
            ) {
          if (callback || isLarge) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
      if (isLarge) {
        releaseArray(seen.array);
        releaseObject(seen);
      } else if (callback) {
        releaseArray(seen);
      }
      return result;
    }

    /**
     * Creates a function that aggregates a collection, creating an object composed
     * of keys generated from the results of running each element of the collection
     * through a callback. The given `setter` function sets the keys and values
     * of the composed object.
     *
     * @private
     * @param {Function} setter The setter function.
     * @returns {Function} Returns the new aggregator function.
     */
    function createAggregator(setter) {
      return function(collection, callback, thisArg) {
        var result = {};
        callback = lodash.createCallback(callback, thisArg, 3);

        var index = -1,
            length = collection ? collection.length : 0;

        if (typeof length == 'number') {
          while (++index < length) {
            var value = collection[index];
            setter(result, value, callback(value, index, collection), collection);
          }
        } else {
          forOwn(collection, function(value, key, collection) {
            setter(result, value, callback(value, key, collection), collection);
          });
        }
        return result;
      };
    }

    /**
     * Creates a function that, when called, either curries or invokes `func`
     * with an optional `this` binding and partially applied arguments.
     *
     * @private
     * @param {Function|string} func The function or method name to reference.
     * @param {number} bitmask The bitmask of method flags to compose.
     *  The bitmask may be composed of the following flags:
     *  1 - `_.bind`
     *  2 - `_.bindKey`
     *  4 - `_.curry`
     *  8 - `_.curry` (bound)
     *  16 - `_.partial`
     *  32 - `_.partialRight`
     * @param {Array} [partialArgs] An array of arguments to prepend to those
     *  provided to the new function.
     * @param {Array} [partialRightArgs] An array of arguments to append to those
     *  provided to the new function.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {number} [arity] The arity of `func`.
     * @returns {Function} Returns the new function.
     */
    function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          isPartial = bitmask & 16,
          isPartialRight = bitmask & 32;

      if (!isBindKey && !isFunction(func)) {
        throw new TypeError;
      }
      if (isPartial && !partialArgs.length) {
        bitmask &= ~16;
        isPartial = partialArgs = false;
      }
      if (isPartialRight && !partialRightArgs.length) {
        bitmask &= ~32;
        isPartialRight = partialRightArgs = false;
      }
      var bindData = func && func.__bindData__;
      if (bindData && bindData !== true) {
        // clone `bindData`
        bindData = slice(bindData);
        if (bindData[2]) {
          bindData[2] = slice(bindData[2]);
        }
        if (bindData[3]) {
          bindData[3] = slice(bindData[3]);
        }
        // set `thisBinding` is not previously bound
        if (isBind && !(bindData[1] & 1)) {
          bindData[4] = thisArg;
        }
        // set if previously bound but not currently (subsequent curried functions)
        if (!isBind && bindData[1] & 1) {
          bitmask |= 8;
        }
        // set curried arity if not yet set
        if (isCurry && !(bindData[1] & 4)) {
          bindData[5] = arity;
        }
        // append partial left arguments
        if (isPartial) {
          push.apply(bindData[2] || (bindData[2] = []), partialArgs);
        }
        // append partial right arguments
        if (isPartialRight) {
          unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
        }
        // merge flags
        bindData[1] |= bitmask;
        return createWrapper.apply(null, bindData);
      }
      // fast path for `_.bind`
      var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
      return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
    }

    /**
     * Used by `escape` to convert characters to HTML entities.
     *
     * @private
     * @param {string} match The matched character to escape.
     * @returns {string} Returns the escaped character.
     */
    function escapeHtmlChar(match) {
      return htmlEscapes[match];
    }

    /**
     * Gets the appropriate "indexOf" function. If the `_.indexOf` method is
     * customized, this method returns the custom method, otherwise it returns
     * the `baseIndexOf` function.
     *
     * @private
     * @returns {Function} Returns the "indexOf" function.
     */
    function getIndexOf() {
      var result = (result = lodash.indexOf) === indexOf ? baseIndexOf : result;
      return result;
    }

    /**
     * Checks if `value` is a native function.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
     */
    function isNative(value) {
      return typeof value == 'function' && reNative.test(value);
    }

    /**
     * Sets `this` binding data on a given function.
     *
     * @private
     * @param {Function} func The function to set data on.
     * @param {Array} value The data array to set.
     */
    var setBindData = !defineProperty ? noop : function(func, value) {
      descriptor.value = value;
      defineProperty(func, '__bindData__', descriptor);
      descriptor.value = null;
    };

    /**
     * A fallback implementation of `isPlainObject` which checks if a given value
     * is an object created by the `Object` constructor, assuming objects created
     * by the `Object` constructor have no inherited enumerable properties and that
     * there are no `Object.prototype` extensions.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     */
    function shimIsPlainObject(value) {
      var ctor,
          result;

      // avoid non Object objects, `arguments` objects, and DOM elements
      if (!(value && toString.call(value) == objectClass) ||
          (ctor = value.constructor, isFunction(ctor) && !(ctor instanceof ctor))) {
        return false;
      }
      // In most environments an object's own properties are iterated before
      // its inherited properties. If the last iterated property is an object's
      // own property then there are no inherited enumerable properties.
      forIn(value, function(value, key) {
        result = key;
      });
      return typeof result == 'undefined' || hasOwnProperty.call(value, result);
    }

    /**
     * Used by `unescape` to convert HTML entities to characters.
     *
     * @private
     * @param {string} match The matched character to unescape.
     * @returns {string} Returns the unescaped character.
     */
    function unescapeHtmlChar(match) {
      return htmlUnescapes[match];
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Checks if `value` is an `arguments` object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
     * @example
     *
     * (function() { return _.isArguments(arguments); })(1, 2, 3);
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    function isArguments(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == argsClass || false;
    }

    /**
     * Checks if `value` is an array.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
     * @example
     *
     * (function() { return _.isArray(arguments); })();
     * // => false
     *
     * _.isArray([1, 2, 3]);
     * // => true
     */
    var isArray = nativeIsArray || function(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == arrayClass || false;
    };

    /**
     * A fallback implementation of `Object.keys` which produces an array of the
     * given object's own enumerable property names.
     *
     * @private
     * @type Function
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     */
    var shimKeys = function(object) {
      var index, iterable = object, result = [];
      if (!iterable) return result;
      if (!(objectTypes[typeof object])) return result;
        for (index in iterable) {
          if (hasOwnProperty.call(iterable, index)) {
            result.push(index);
          }
        }
      return result
    };

    /**
     * Creates an array composed of the own enumerable property names of an object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     * @example
     *
     * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
     * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
     */
    var keys = !nativeKeys ? shimKeys : function(object) {
      if (!isObject(object)) {
        return [];
      }
      return nativeKeys(object);
    };

    /**
     * Used to convert characters to HTML entities:
     *
     * Though the `>` character is escaped for symmetry, characters like `>` and `/`
     * don't require escaping in HTML and have no special meaning unless they're part
     * of a tag or an unquoted attribute value.
     * http://mathiasbynens.be/notes/ambiguous-ampersands (under "semi-related fun fact")
     */
    var htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    /** Used to convert HTML entities to characters */
    var htmlUnescapes = invert(htmlEscapes);

    /** Used to match HTML entities and HTML characters */
    var reEscapedHtml = RegExp('(' + keys(htmlUnescapes).join('|') + ')', 'g'),
        reUnescapedHtml = RegExp('[' + keys(htmlEscapes).join('') + ']', 'g');

    /*--------------------------------------------------------------------------*/

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object. Subsequent sources will overwrite property assignments of previous
     * sources. If a callback is provided it will be executed to produce the
     * assigned values. The callback is bound to `thisArg` and invoked with two
     * arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @type Function
     * @alias extend
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize assigning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });
     * // => { 'name': 'fred', 'employer': 'slate' }
     *
     * var defaults = _.partialRight(_.assign, function(a, b) {
     *   return typeof a == 'undefined' ? b : a;
     * });
     *
     * var object = { 'name': 'barney' };
     * defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var assign = function(object, source, guard) {
      var index, iterable = object, result = iterable;
      if (!iterable) return result;
      var args = arguments,
          argsIndex = 0,
          argsLength = typeof guard == 'number' ? 2 : args.length;
      if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {
        var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);
      } else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {
        callback = args[--argsLength];
      }
      while (++argsIndex < argsLength) {
        iterable = args[argsIndex];
        if (iterable && objectTypes[typeof iterable]) {
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          result[index] = callback ? callback(result[index], iterable[index]) : iterable[index];
        }
        }
      }
      return result
    };

    /**
     * Creates a clone of `value`. If `isDeep` is `true` nested objects will also
     * be cloned, otherwise they will be assigned by reference. If a callback
     * is provided it will be executed to produce the cloned values. If the
     * callback returns `undefined` cloning will be handled by the method instead.
     * The callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var shallow = _.clone(characters);
     * shallow[0] === characters[0];
     * // => true
     *
     * var deep = _.clone(characters, true);
     * deep[0] === characters[0];
     * // => false
     *
     * _.mixin({
     *   'clone': _.partialRight(_.clone, function(value) {
     *     return _.isElement(value) ? value.cloneNode(false) : undefined;
     *   })
     * });
     *
     * var clone = _.clone(document.body);
     * clone.childNodes.length;
     * // => 0
     */
    function clone(value, isDeep, callback, thisArg) {
      // allows working with "Collections" methods without using their `index`
      // and `collection` arguments for `isDeep` and `callback`
      if (typeof isDeep != 'boolean' && isDeep != null) {
        thisArg = callback;
        callback = isDeep;
        isDeep = false;
      }
      return baseClone(value, isDeep, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates a deep clone of `value`. If a callback is provided it will be
     * executed to produce the cloned values. If the callback returns `undefined`
     * cloning will be handled by the method instead. The callback is bound to
     * `thisArg` and invoked with one argument; (value).
     *
     * Note: This method is loosely based on the structured clone algorithm. Functions
     * and DOM nodes are **not** cloned. The enumerable properties of `arguments` objects and
     * objects created by constructors other than `Object` are cloned to plain `Object` objects.
     * See http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the deep cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var deep = _.cloneDeep(characters);
     * deep[0] === characters[0];
     * // => false
     *
     * var view = {
     *   'label': 'docs',
     *   'node': element
     * };
     *
     * var clone = _.cloneDeep(view, function(value) {
     *   return _.isElement(value) ? value.cloneNode(true) : undefined;
     * });
     *
     * clone.node == view.node;
     * // => false
     */
    function cloneDeep(value, callback, thisArg) {
      return baseClone(value, true, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates an object that inherits from the given `prototype` object. If a
     * `properties` object is provided its own enumerable properties are assigned
     * to the created object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} prototype The object to inherit from.
     * @param {Object} [properties] The properties to assign to the object.
     * @returns {Object} Returns the new object.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * function Circle() {
     *   Shape.call(this);
     * }
     *
     * Circle.prototype = _.create(Shape.prototype, { 'constructor': Circle });
     *
     * var circle = new Circle;
     * circle instanceof Circle;
     * // => true
     *
     * circle instanceof Shape;
     * // => true
     */
    function create(prototype, properties) {
      var result = baseCreate(prototype);
      return properties ? assign(result, properties) : result;
    }

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object for all destination properties that resolve to `undefined`. Once a
     * property is set, additional defaults of the same property will be ignored.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param- {Object} [guard] Allows working with `_.reduce` without using its
     *  `key` and `object` arguments as sources.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var object = { 'name': 'barney' };
     * _.defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var defaults = function(object, source, guard) {
      var index, iterable = object, result = iterable;
      if (!iterable) return result;
      var args = arguments,
          argsIndex = 0,
          argsLength = typeof guard == 'number' ? 2 : args.length;
      while (++argsIndex < argsLength) {
        iterable = args[argsIndex];
        if (iterable && objectTypes[typeof iterable]) {
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          if (typeof result[index] == 'undefined') result[index] = iterable[index];
        }
        }
      }
      return result
    };

    /**
     * This method is like `_.findIndex` except that it returns the key of the
     * first element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': false },
     *   'fred': {    'age': 40, 'blocked': true },
     *   'pebbles': { 'age': 1,  'blocked': false }
     * };
     *
     * _.findKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => 'barney' (property order is not guaranteed across environments)
     *
     * // using "_.where" callback shorthand
     * _.findKey(characters, { 'age': 1 });
     * // => 'pebbles'
     *
     * // using "_.pluck" callback shorthand
     * _.findKey(characters, 'blocked');
     * // => 'fred'
     */
    function findKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwn(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * This method is like `_.findKey` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': true },
     *   'fred': {    'age': 40, 'blocked': false },
     *   'pebbles': { 'age': 1,  'blocked': true }
     * };
     *
     * _.findLastKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => returns `pebbles`, assuming `_.findKey` returns `barney`
     *
     * // using "_.where" callback shorthand
     * _.findLastKey(characters, { 'age': 40 });
     * // => 'fred'
     *
     * // using "_.pluck" callback shorthand
     * _.findLastKey(characters, 'blocked');
     * // => 'pebbles'
     */
    function findLastKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwnRight(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over own and inherited enumerable properties of an object,
     * executing the callback for each property. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, key, object). Callbacks may exit
     * iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forIn(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
     */
    var forIn = function(collection, callback, thisArg) {
      var index, iterable = collection, result = iterable;
      if (!iterable) return result;
      if (!objectTypes[typeof iterable]) return result;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
        for (index in iterable) {
          if (callback(iterable[index], index, collection) === false) return result;
        }
      return result
    };

    /**
     * This method is like `_.forIn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forInRight(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'move', 'y', and 'x' assuming `_.forIn ` logs 'x', 'y', and 'move'
     */
    function forInRight(object, callback, thisArg) {
      var pairs = [];

      forIn(object, function(value, key) {
        pairs.push(key, value);
      });

      var length = pairs.length;
      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(pairs[length--], pairs[length], object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Iterates over own enumerable properties of an object, executing the callback
     * for each property. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, key, object). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
     */
    var forOwn = function(collection, callback, thisArg) {
      var index, iterable = collection, result = iterable;
      if (!iterable) return result;
      if (!objectTypes[typeof iterable]) return result;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          if (callback(iterable[index], index, collection) === false) return result;
        }
      return result
    };

    /**
     * This method is like `_.forOwn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwnRight({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs 'length', '1', and '0' assuming `_.forOwn` logs '0', '1', and 'length'
     */
    function forOwnRight(object, callback, thisArg) {
      var props = keys(object),
          length = props.length;

      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        var key = props[length];
        if (callback(object[key], key, object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Creates a sorted array of property names of all enumerable properties,
     * own and inherited, of `object` that have function values.
     *
     * @static
     * @memberOf _
     * @alias methods
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names that have function values.
     * @example
     *
     * _.functions(_);
     * // => ['all', 'any', 'bind', 'bindAll', 'clone', 'compact', 'compose', ...]
     */
    function functions(object) {
      var result = [];
      forIn(object, function(value, key) {
        if (isFunction(value)) {
          result.push(key);
        }
      });
      return result.sort();
    }

    /**
     * Checks if the specified property name exists as a direct property of `object`,
     * instead of an inherited property.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @param {string} key The name of the property to check.
     * @returns {boolean} Returns `true` if key is a direct property, else `false`.
     * @example
     *
     * _.has({ 'a': 1, 'b': 2, 'c': 3 }, 'b');
     * // => true
     */
    function has(object, key) {
      return object ? hasOwnProperty.call(object, key) : false;
    }

    /**
     * Creates an object composed of the inverted keys and values of the given object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to invert.
     * @returns {Object} Returns the created inverted object.
     * @example
     *
     * _.invert({ 'first': 'fred', 'second': 'barney' });
     * // => { 'fred': 'first', 'barney': 'second' }
     */
    function invert(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = {};

      while (++index < length) {
        var key = props[index];
        result[object[key]] = key;
      }
      return result;
    }

    /**
     * Checks if `value` is a boolean value.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a boolean value, else `false`.
     * @example
     *
     * _.isBoolean(null);
     * // => false
     */
    function isBoolean(value) {
      return value === true || value === false ||
        value && typeof value == 'object' && toString.call(value) == boolClass || false;
    }

    /**
     * Checks if `value` is a date.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a date, else `false`.
     * @example
     *
     * _.isDate(new Date);
     * // => true
     */
    function isDate(value) {
      return value && typeof value == 'object' && toString.call(value) == dateClass || false;
    }

    /**
     * Checks if `value` is a DOM element.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a DOM element, else `false`.
     * @example
     *
     * _.isElement(document.body);
     * // => true
     */
    function isElement(value) {
      return value && value.nodeType === 1 || false;
    }

    /**
     * Checks if `value` is empty. Arrays, strings, or `arguments` objects with a
     * length of `0` and objects with no own enumerable properties are considered
     * "empty".
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object|string} value The value to inspect.
     * @returns {boolean} Returns `true` if the `value` is empty, else `false`.
     * @example
     *
     * _.isEmpty([1, 2, 3]);
     * // => false
     *
     * _.isEmpty({});
     * // => true
     *
     * _.isEmpty('');
     * // => true
     */
    function isEmpty(value) {
      var result = true;
      if (!value) {
        return result;
      }
      var className = toString.call(value),
          length = value.length;

      if ((className == arrayClass || className == stringClass || className == argsClass ) ||
          (className == objectClass && typeof length == 'number' && isFunction(value.splice))) {
        return !length;
      }
      forOwn(value, function() {
        return (result = false);
      });
      return result;
    }

    /**
     * Performs a deep comparison between two values to determine if they are
     * equivalent to each other. If a callback is provided it will be executed
     * to compare values. If the callback returns `undefined` comparisons will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (a, b).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var copy = { 'name': 'fred' };
     *
     * object == copy;
     * // => false
     *
     * _.isEqual(object, copy);
     * // => true
     *
     * var words = ['hello', 'goodbye'];
     * var otherWords = ['hi', 'goodbye'];
     *
     * _.isEqual(words, otherWords, function(a, b) {
     *   var reGreet = /^(?:hello|hi)$/i,
     *       aGreet = _.isString(a) && reGreet.test(a),
     *       bGreet = _.isString(b) && reGreet.test(b);
     *
     *   return (aGreet || bGreet) ? (aGreet == bGreet) : undefined;
     * });
     * // => true
     */
    function isEqual(a, b, callback, thisArg) {
      return baseIsEqual(a, b, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 2));
    }

    /**
     * Checks if `value` is, or can be coerced to, a finite number.
     *
     * Note: This is not the same as native `isFinite` which will return true for
     * booleans and empty strings. See http://es5.github.io/#x15.1.2.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is finite, else `false`.
     * @example
     *
     * _.isFinite(-101);
     * // => true
     *
     * _.isFinite('10');
     * // => true
     *
     * _.isFinite(true);
     * // => false
     *
     * _.isFinite('');
     * // => false
     *
     * _.isFinite(Infinity);
     * // => false
     */
    function isFinite(value) {
      return nativeIsFinite(value) && !nativeIsNaN(parseFloat(value));
    }

    /**
     * Checks if `value` is a function.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     */
    function isFunction(value) {
      return typeof value == 'function';
    }

    /**
     * Checks if `value` is the language type of Object.
     * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(1);
     * // => false
     */
    function isObject(value) {
      // check if the value is the ECMAScript language type of Object
      // http://es5.github.io/#x8
      // and avoid a V8 bug
      // http://code.google.com/p/v8/issues/detail?id=2291
      return !!(value && objectTypes[typeof value]);
    }

    /**
     * Checks if `value` is `NaN`.
     *
     * Note: This is not the same as native `isNaN` which will return `true` for
     * `undefined` and other non-numeric values. See http://es5.github.io/#x15.1.2.4.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `NaN`, else `false`.
     * @example
     *
     * _.isNaN(NaN);
     * // => true
     *
     * _.isNaN(new Number(NaN));
     * // => true
     *
     * isNaN(undefined);
     * // => true
     *
     * _.isNaN(undefined);
     * // => false
     */
    function isNaN(value) {
      // `NaN` as a primitive is the only value that is not equal to itself
      // (perform the [[Class]] check first to avoid errors with some host objects in IE)
      return isNumber(value) && value != +value;
    }

    /**
     * Checks if `value` is `null`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `null`, else `false`.
     * @example
     *
     * _.isNull(null);
     * // => true
     *
     * _.isNull(undefined);
     * // => false
     */
    function isNull(value) {
      return value === null;
    }

    /**
     * Checks if `value` is a number.
     *
     * Note: `NaN` is considered a number. See http://es5.github.io/#x8.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a number, else `false`.
     * @example
     *
     * _.isNumber(8.4 * 5);
     * // => true
     */
    function isNumber(value) {
      return typeof value == 'number' ||
        value && typeof value == 'object' && toString.call(value) == numberClass || false;
    }

    /**
     * Checks if `value` is an object created by the `Object` constructor.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * _.isPlainObject(new Shape);
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'x': 0, 'y': 0 });
     * // => true
     */
    var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
      if (!(value && toString.call(value) == objectClass)) {
        return false;
      }
      var valueOf = value.valueOf,
          objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

      return objProto
        ? (value == objProto || getPrototypeOf(value) == objProto)
        : shimIsPlainObject(value);
    };

    /**
     * Checks if `value` is a regular expression.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a regular expression, else `false`.
     * @example
     *
     * _.isRegExp(/fred/);
     * // => true
     */
    function isRegExp(value) {
      return value && typeof value == 'object' && toString.call(value) == regexpClass || false;
    }

    /**
     * Checks if `value` is a string.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
     * @example
     *
     * _.isString('fred');
     * // => true
     */
    function isString(value) {
      return typeof value == 'string' ||
        value && typeof value == 'object' && toString.call(value) == stringClass || false;
    }

    /**
     * Checks if `value` is `undefined`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `undefined`, else `false`.
     * @example
     *
     * _.isUndefined(void 0);
     * // => true
     */
    function isUndefined(value) {
      return typeof value == 'undefined';
    }

    /**
     * Creates an object with the same keys as `object` and values generated by
     * running each own enumerable property of `object` through the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new object with values of the results of each `callback` execution.
     * @example
     *
     * _.mapValues({ 'a': 1, 'b': 2, 'c': 3} , function(num) { return num * 3; });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     *
     * var characters = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // using "_.pluck" callback shorthand
     * _.mapValues(characters, 'age');
     * // => { 'fred': 40, 'pebbles': 1 }
     */
    function mapValues(object, callback, thisArg) {
      var result = {};
      callback = lodash.createCallback(callback, thisArg, 3);

      forOwn(object, function(value, key, object) {
        result[key] = callback(value, key, object);
      });
      return result;
    }

    /**
     * Recursively merges own enumerable properties of the source object(s), that
     * don't resolve to `undefined` into the destination object. Subsequent sources
     * will overwrite property assignments of previous sources. If a callback is
     * provided it will be executed to produce the merged values of the destination
     * and source properties. If the callback returns `undefined` merging will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var names = {
     *   'characters': [
     *     { 'name': 'barney' },
     *     { 'name': 'fred' }
     *   ]
     * };
     *
     * var ages = {
     *   'characters': [
     *     { 'age': 36 },
     *     { 'age': 40 }
     *   ]
     * };
     *
     * _.merge(names, ages);
     * // => { 'characters': [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred', 'age': 40 }] }
     *
     * var food = {
     *   'fruits': ['apple'],
     *   'vegetables': ['beet']
     * };
     *
     * var otherFood = {
     *   'fruits': ['banana'],
     *   'vegetables': ['carrot']
     * };
     *
     * _.merge(food, otherFood, function(a, b) {
     *   return _.isArray(a) ? a.concat(b) : undefined;
     * });
     * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot] }
     */
    function merge(object) {
      var args = arguments,
          length = 2;

      if (!isObject(object)) {
        return object;
      }
      // allows working with `_.reduce` and `_.reduceRight` without using
      // their `index` and `collection` arguments
      if (typeof args[2] != 'number') {
        length = args.length;
      }
      if (length > 3 && typeof args[length - 2] == 'function') {
        var callback = baseCreateCallback(args[--length - 1], args[length--], 2);
      } else if (length > 2 && typeof args[length - 1] == 'function') {
        callback = args[--length];
      }
      var sources = slice(arguments, 1, length),
          index = -1,
          stackA = getArray(),
          stackB = getArray();

      while (++index < length) {
        baseMerge(object, sources[index], callback, stackA, stackB);
      }
      releaseArray(stackA);
      releaseArray(stackB);
      return object;
    }

    /**
     * Creates a shallow clone of `object` excluding the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` omitting the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The properties to omit or the
     *  function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object without the omitted properties.
     * @example
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, 'age');
     * // => { 'name': 'fred' }
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, function(value) {
     *   return typeof value == 'number';
     * });
     * // => { 'name': 'fred' }
     */
    function omit(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var props = [];
        forIn(object, function(value, key) {
          props.push(key);
        });
        props = baseDifference(props, baseFlatten(arguments, true, false, 1));

        var index = -1,
            length = props.length;

        while (++index < length) {
          var key = props[index];
          result[key] = object[key];
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (!callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * Creates a two dimensional array of an object's key-value pairs,
     * i.e. `[[key1, value1], [key2, value2]]`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns new array of key-value pairs.
     * @example
     *
     * _.pairs({ 'barney': 36, 'fred': 40 });
     * // => [['barney', 36], ['fred', 40]] (property order is not guaranteed across environments)
     */
    function pairs(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        var key = props[index];
        result[index] = [key, object[key]];
      }
      return result;
    }

    /**
     * Creates a shallow clone of `object` composed of the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` picking the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The function called per
     *  iteration or property names to pick, specified as individual property
     *  names or arrays of property names.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object composed of the picked properties.
     * @example
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, 'name');
     * // => { 'name': 'fred' }
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, function(value, key) {
     *   return key.charAt(0) != '_';
     * });
     * // => { 'name': 'fred' }
     */
    function pick(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var index = -1,
            props = baseFlatten(arguments, true, false, 1),
            length = isObject(object) ? props.length : 0;

        while (++index < length) {
          var key = props[index];
          if (key in object) {
            result[key] = object[key];
          }
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * An alternative to `_.reduce` this method transforms `object` to a new
     * `accumulator` object which is the result of running each of its own
     * enumerable properties through a callback, with each callback execution
     * potentially mutating the `accumulator` object. The callback is bound to
     * `thisArg` and invoked with four arguments; (accumulator, value, key, object).
     * Callbacks may exit iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] The custom accumulator value.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var squares = _.transform([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(result, num) {
     *   num *= num;
     *   if (num % 2) {
     *     return result.push(num) < 3;
     *   }
     * });
     * // => [1, 9, 25]
     *
     * var mapped = _.transform({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     * });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function transform(object, callback, accumulator, thisArg) {
      var isArr = isArray(object);
      if (accumulator == null) {
        if (isArr) {
          accumulator = [];
        } else {
          var ctor = object && object.constructor,
              proto = ctor && ctor.prototype;

          accumulator = baseCreate(proto);
        }
      }
      if (callback) {
        callback = lodash.createCallback(callback, thisArg, 4);
        (isArr ? forEach : forOwn)(object, function(value, index, object) {
          return callback(accumulator, value, index, object);
        });
      }
      return accumulator;
    }

    /**
     * Creates an array composed of the own enumerable property values of `object`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property values.
     * @example
     *
     * _.values({ 'one': 1, 'two': 2, 'three': 3 });
     * // => [1, 2, 3] (property order is not guaranteed across environments)
     */
    function values(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        result[index] = object[props[index]];
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array of elements from the specified indexes, or keys, of the
     * `collection`. Indexes may be specified as individual arguments or as arrays
     * of indexes.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {...(number|number[]|string|string[])} [index] The indexes of `collection`
     *   to retrieve, specified as individual indexes or arrays of indexes.
     * @returns {Array} Returns a new array of elements corresponding to the
     *  provided indexes.
     * @example
     *
     * _.at(['a', 'b', 'c', 'd', 'e'], [0, 2, 4]);
     * // => ['a', 'c', 'e']
     *
     * _.at(['fred', 'barney', 'pebbles'], 0, 2);
     * // => ['fred', 'pebbles']
     */
    function at(collection) {
      var args = arguments,
          index = -1,
          props = baseFlatten(args, true, false, 1),
          length = (args[2] && args[2][args[1]] === collection) ? 1 : props.length,
          result = Array(length);

      while(++index < length) {
        result[index] = collection[props[index]];
      }
      return result;
    }

    /**
     * Checks if a given value is present in a collection using strict equality
     * for comparisons, i.e. `===`. If `fromIndex` is negative, it is used as the
     * offset from the end of the collection.
     *
     * @static
     * @memberOf _
     * @alias include
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {*} target The value to check for.
     * @param {number} [fromIndex=0] The index to search from.
     * @returns {boolean} Returns `true` if the `target` element is found, else `false`.
     * @example
     *
     * _.contains([1, 2, 3], 1);
     * // => true
     *
     * _.contains([1, 2, 3], 1, 2);
     * // => false
     *
     * _.contains({ 'name': 'fred', 'age': 40 }, 'fred');
     * // => true
     *
     * _.contains('pebbles', 'eb');
     * // => true
     */
    function contains(collection, target, fromIndex) {
      var index = -1,
          indexOf = getIndexOf(),
          length = collection ? collection.length : 0,
          result = false;

      fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;
      if (isArray(collection)) {
        result = indexOf(collection, target, fromIndex) > -1;
      } else if (typeof length == 'number') {
        result = (isString(collection) ? collection.indexOf(target, fromIndex) : indexOf(collection, target, fromIndex)) > -1;
      } else {
        forOwn(collection, function(value) {
          if (++index >= fromIndex) {
            return !(result = value === target);
          }
        });
      }
      return result;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of `collection` through the callback. The corresponding value
     * of each key is the number of times the key was returned by the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy(['one', 'two', 'three'], 'length');
     * // => { '3': 2, '5': 1 }
     */
    var countBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key]++ : result[key] = 1);
    });

    /**
     * Checks if the given callback returns truey value for **all** elements of
     * a collection. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias all
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if all elements passed the callback check,
     *  else `false`.
     * @example
     *
     * _.every([true, 1, null, 'yes']);
     * // => false
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.every(characters, 'age');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.every(characters, { 'age': 36 });
     * // => false
     */
    function every(collection, callback, thisArg) {
      var result = true;
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          if (!(result = !!callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          return (result = !!callback(value, index, collection));
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning an array of all elements
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias select
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that passed the callback check.
     * @example
     *
     * var evens = _.filter([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [2, 4, 6]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.filter(characters, 'blocked');
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     *
     * // using "_.where" callback shorthand
     * _.filter(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     */
    function filter(collection, callback, thisArg) {
      var result = [];
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            result.push(value);
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result.push(value);
          }
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning the first element that
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias detect, findWhere
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.find(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => { 'name': 'barney', 'age': 36, 'blocked': false }
     *
     * // using "_.where" callback shorthand
     * _.find(characters, { 'age': 1 });
     * // =>  { 'name': 'pebbles', 'age': 1, 'blocked': false }
     *
     * // using "_.pluck" callback shorthand
     * _.find(characters, 'blocked');
     * // => { 'name': 'fred', 'age': 40, 'blocked': true }
     */
    function find(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            return value;
          }
        }
      } else {
        var result;
        forOwn(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result = value;
            return false;
          }
        });
        return result;
      }
    }

    /**
     * This method is like `_.find` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * _.findLast([1, 2, 3, 4], function(num) {
     *   return num % 2 == 1;
     * });
     * // => 3
     */
    function findLast(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forEachRight(collection, function(value, index, collection) {
        if (callback(value, index, collection)) {
          result = value;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over elements of a collection, executing the callback for each
     * element. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * Note: As with other "Collections" methods, objects with a `length` property
     * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
     * may be used for object iteration.
     *
     * @static
     * @memberOf _
     * @alias each
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');
     * // => logs each number and returns '1,2,3'
     *
     * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { console.log(num); });
     * // => logs each number and returns the object (property order is not guaranteed across environments)
     */
    function forEach(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0;

      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        while (++index < length) {
          if (callback(collection[index], index, collection) === false) {
            break;
          }
        }
      } else {
        forOwn(collection, callback);
      }
      return collection;
    }

    /**
     * This method is like `_.forEach` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias eachRight
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEachRight(function(num) { console.log(num); }).join(',');
     * // => logs each number from right to left and returns '3,2,1'
     */
    function forEachRight(collection, callback, thisArg) {
      var length = collection ? collection.length : 0;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        while (length--) {
          if (callback(collection[length], length, collection) === false) {
            break;
          }
        }
      } else {
        var props = keys(collection);
        length = props.length;
        forOwn(collection, function(value, key, collection) {
          key = props ? props[--length] : --length;
          return callback(collection[key], key, collection);
        });
      }
      return collection;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of a collection through the callback. The corresponding value
     * of each key is an array of the elements responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * // using "_.pluck" callback shorthand
     * _.groupBy(['one', 'two', 'three'], 'length');
     * // => { '3': ['one', 'two'], '5': ['three'] }
     */
    var groupBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key] : result[key] = []).push(value);
    });

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of the collection through the given callback. The corresponding
     * value of each key is the last element responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * var keys = [
     *   { 'dir': 'left', 'code': 97 },
     *   { 'dir': 'right', 'code': 100 }
     * ];
     *
     * _.indexBy(keys, 'dir');
     * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(keys, function(key) { return String.fromCharCode(key.code); });
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(characters, function(key) { this.fromCharCode(key.code); }, String);
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     */
    var indexBy = createAggregator(function(result, value, key) {
      result[key] = value;
    });

    /**
     * Invokes the method named by `methodName` on each element in the `collection`
     * returning an array of the results of each invoked method. Additional arguments
     * will be provided to each invoked method. If `methodName` is a function it
     * will be invoked for, and `this` bound to, each element in the `collection`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|string} methodName The name of the method to invoke or
     *  the function invoked per iteration.
     * @param {...*} [arg] Arguments to invoke the method with.
     * @returns {Array} Returns a new array of the results of each invoked method.
     * @example
     *
     * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
     * // => [[1, 5, 7], [1, 2, 3]]
     *
     * _.invoke([123, 456], String.prototype.split, '');
     * // => [['1', '2', '3'], ['4', '5', '6']]
     */
    function invoke(collection, methodName) {
      var args = slice(arguments, 2),
          index = -1,
          isFunc = typeof methodName == 'function',
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        result[++index] = (isFunc ? methodName : value[methodName]).apply(value, args);
      });
      return result;
    }

    /**
     * Creates an array of values by running each element in the collection
     * through the callback. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias collect
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of the results of each `callback` execution.
     * @example
     *
     * _.map([1, 2, 3], function(num) { return num * 3; });
     * // => [3, 6, 9]
     *
     * _.map({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { return num * 3; });
     * // => [3, 6, 9] (property order is not guaranteed across environments)
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(characters, 'name');
     * // => ['barney', 'fred']
     */
    function map(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0;

      callback = lodash.createCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        var result = Array(length);
        while (++index < length) {
          result[index] = callback(collection[index], index, collection);
        }
      } else {
        result = [];
        forOwn(collection, function(value, key, collection) {
          result[++index] = callback(value, key, collection);
        });
      }
      return result;
    }

    /**
     * Retrieves the maximum value of a collection. If the collection is empty or
     * falsey `-Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the maximum value.
     * @example
     *
     * _.max([4, 2, 8, 6]);
     * // => 8
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.max(characters, function(chr) { return chr.age; });
     * // => { 'name': 'fred', 'age': 40 };
     *
     * // using "_.pluck" callback shorthand
     * _.max(characters, 'age');
     * // => { 'name': 'fred', 'age': 40 };
     */
    function max(collection, callback, thisArg) {
      var computed = -Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value > result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        forEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current > computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the minimum value of a collection. If the collection is empty or
     * falsey `Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the minimum value.
     * @example
     *
     * _.min([4, 2, 8, 6]);
     * // => 2
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.min(characters, function(chr) { return chr.age; });
     * // => { 'name': 'barney', 'age': 36 };
     *
     * // using "_.pluck" callback shorthand
     * _.min(characters, 'age');
     * // => { 'name': 'barney', 'age': 36 };
     */
    function min(collection, callback, thisArg) {
      var computed = Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value < result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        forEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current < computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the value of a specified property from all elements in the collection.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {string} property The name of the property to pluck.
     * @returns {Array} Returns a new array of property values.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.pluck(characters, 'name');
     * // => ['barney', 'fred']
     */
    var pluck = map;

    /**
     * Reduces a collection to a value which is the accumulated result of running
     * each element in the collection through the callback, where each successive
     * callback execution consumes the return value of the previous execution. If
     * `accumulator` is not provided the first element of the collection will be
     * used as the initial `accumulator` value. The callback is bound to `thisArg`
     * and invoked with four arguments; (accumulator, value, index|key, collection).
     *
     * @static
     * @memberOf _
     * @alias foldl, inject
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var sum = _.reduce([1, 2, 3], function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * var mapped = _.reduce({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     *   return result;
     * }, {});
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function reduce(collection, callback, accumulator, thisArg) {
      if (!collection) return accumulator;
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);

      var index = -1,
          length = collection.length;

      if (typeof length == 'number') {
        if (noaccum) {
          accumulator = collection[++index];
        }
        while (++index < length) {
          accumulator = callback(accumulator, collection[index], index, collection);
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          accumulator = noaccum
            ? (noaccum = false, value)
            : callback(accumulator, value, index, collection)
        });
      }
      return accumulator;
    }

    /**
     * This method is like `_.reduce` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias foldr
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var list = [[0, 1], [2, 3], [4, 5]];
     * var flat = _.reduceRight(list, function(a, b) { return a.concat(b); }, []);
     * // => [4, 5, 2, 3, 0, 1]
     */
    function reduceRight(collection, callback, accumulator, thisArg) {
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);
      forEachRight(collection, function(value, index, collection) {
        accumulator = noaccum
          ? (noaccum = false, value)
          : callback(accumulator, value, index, collection);
      });
      return accumulator;
    }

    /**
     * The opposite of `_.filter` this method returns the elements of a
     * collection that the callback does **not** return truey for.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that failed the callback check.
     * @example
     *
     * var odds = _.reject([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [1, 3, 5]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.reject(characters, 'blocked');
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     *
     * // using "_.where" callback shorthand
     * _.reject(characters, { 'age': 36 });
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     */
    function reject(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);
      return filter(collection, function(value, index, collection) {
        return !callback(value, index, collection);
      });
    }

    /**
     * Retrieves a random element or `n` random elements from a collection.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to sample.
     * @param {number} [n] The number of elements to sample.
     * @param- {Object} [guard] Allows working with functions like `_.map`
     *  without using their `index` arguments as `n`.
     * @returns {Array} Returns the random sample(s) of `collection`.
     * @example
     *
     * _.sample([1, 2, 3, 4]);
     * // => 2
     *
     * _.sample([1, 2, 3, 4], 2);
     * // => [3, 1]
     */
    function sample(collection, n, guard) {
      if (collection && typeof collection.length != 'number') {
        collection = values(collection);
      }
      if (n == null || guard) {
        return collection ? collection[baseRandom(0, collection.length - 1)] : undefined;
      }
      var result = shuffle(collection);
      result.length = nativeMin(nativeMax(0, n), result.length);
      return result;
    }

    /**
     * Creates an array of shuffled values, using a version of the Fisher-Yates
     * shuffle. See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to shuffle.
     * @returns {Array} Returns a new shuffled collection.
     * @example
     *
     * _.shuffle([1, 2, 3, 4, 5, 6]);
     * // => [4, 1, 6, 3, 5, 2]
     */
    function shuffle(collection) {
      var index = -1,
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        var rand = baseRandom(0, ++index);
        result[index] = result[rand];
        result[rand] = value;
      });
      return result;
    }

    /**
     * Gets the size of the `collection` by returning `collection.length` for arrays
     * and array-like objects or the number of own enumerable properties for objects.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to inspect.
     * @returns {number} Returns `collection.length` or number of own enumerable properties.
     * @example
     *
     * _.size([1, 2]);
     * // => 2
     *
     * _.size({ 'one': 1, 'two': 2, 'three': 3 });
     * // => 3
     *
     * _.size('pebbles');
     * // => 7
     */
    function size(collection) {
      var length = collection ? collection.length : 0;
      return typeof length == 'number' ? length : keys(collection).length;
    }

    /**
     * Checks if the callback returns a truey value for **any** element of a
     * collection. The function returns as soon as it finds a passing value and
     * does not iterate over the entire collection. The callback is bound to
     * `thisArg` and invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias any
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if any element passed the callback check,
     *  else `false`.
     * @example
     *
     * _.some([null, 0, 'yes', false], Boolean);
     * // => true
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.some(characters, 'blocked');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.some(characters, { 'age': 1 });
     * // => false
     */
    function some(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          if ((result = callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          return !(result = callback(value, index, collection));
        });
      }
      return !!result;
    }

    /**
     * Creates an array of elements, sorted in ascending order by the results of
     * running each element in a collection through the callback. This method
     * performs a stable sort, that is, it will preserve the original sort order
     * of equal elements. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an array of property names is provided for `callback` the collection
     * will be sorted by each property value.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Array|Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of sorted elements.
     * @example
     *
     * _.sortBy([1, 2, 3], function(num) { return Math.sin(num); });
     * // => [3, 1, 2]
     *
     * _.sortBy([1, 2, 3], function(num) { return this.sin(num); }, Math);
     * // => [3, 1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'barney',  'age': 26 },
     *   { 'name': 'fred',    'age': 30 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(_.sortBy(characters, 'age'), _.values);
     * // => [['barney', 26], ['fred', 30], ['barney', 36], ['fred', 40]]
     *
     * // sorting by multiple properties
     * _.map(_.sortBy(characters, ['name', 'age']), _.values);
     * // = > [['barney', 26], ['barney', 36], ['fred', 30], ['fred', 40]]
     */
    function sortBy(collection, callback, thisArg) {
      var index = -1,
          isArr = isArray(callback),
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      if (!isArr) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      forEach(collection, function(value, key, collection) {
        var object = result[++index] = getObject();
        if (isArr) {
          object.criteria = map(callback, function(key) { return value[key]; });
        } else {
          (object.criteria = getArray())[0] = callback(value, key, collection);
        }
        object.index = index;
        object.value = value;
      });

      length = result.length;
      result.sort(compareAscending);
      while (length--) {
        var object = result[length];
        result[length] = object.value;
        if (!isArr) {
          releaseArray(object.criteria);
        }
        releaseObject(object);
      }
      return result;
    }

    /**
     * Converts the `collection` to an array.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to convert.
     * @returns {Array} Returns the new converted array.
     * @example
     *
     * (function() { return _.toArray(arguments).slice(1); })(1, 2, 3, 4);
     * // => [2, 3, 4]
     */
    function toArray(collection) {
      if (collection && typeof collection.length == 'number') {
        return slice(collection);
      }
      return values(collection);
    }

    /**
     * Performs a deep comparison of each element in a `collection` to the given
     * `properties` object, returning an array of all elements that have equivalent
     * property values.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Object} props The object of property values to filter by.
     * @returns {Array} Returns a new array of elements that have the given properties.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * _.where(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'pets': ['hoppy'] }]
     *
     * _.where(characters, { 'pets': ['dino'] });
     * // => [{ 'name': 'fred', 'age': 40, 'pets': ['baby puss', 'dino'] }]
     */
    var where = filter;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array with all falsey values removed. The values `false`, `null`,
     * `0`, `""`, `undefined`, and `NaN` are all falsey.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to compact.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.compact([0, 1, false, 2, '', 3]);
     * // => [1, 2, 3]
     */
    function compact(array) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (value) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * Creates an array excluding all values of the provided arrays using strict
     * equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {...Array} [values] The arrays of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.difference([1, 2, 3, 4, 5], [5, 2, 10]);
     * // => [1, 3, 4]
     */
    function difference(array) {
      return baseDifference(array, baseFlatten(arguments, true, true, 1));
    }

    /**
     * This method is like `_.find` except that it returns the index of the first
     * element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.findIndex(characters, function(chr) {
     *   return chr.age < 20;
     * });
     * // => 2
     *
     * // using "_.where" callback shorthand
     * _.findIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findIndex(characters, 'blocked');
     * // => 1
     */
    function findIndex(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0;

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        if (callback(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }

    /**
     * This method is like `_.findIndex` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': true },
     *   { 'name': 'fred',    'age': 40, 'blocked': false },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': true }
     * ];
     *
     * _.findLastIndex(characters, function(chr) {
     *   return chr.age > 30;
     * });
     * // => 1
     *
     * // using "_.where" callback shorthand
     * _.findLastIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findLastIndex(characters, 'blocked');
     * // => 2
     */
    function findLastIndex(array, callback, thisArg) {
      var length = array ? array.length : 0;
      callback = lodash.createCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(array[length], length, array)) {
          return length;
        }
      }
      return -1;
    }

    /**
     * Gets the first element or first `n` elements of an array. If a callback
     * is provided elements at the beginning of the array are returned as long
     * as the callback returns truey. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias head, take
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the first element(s) of `array`.
     * @example
     *
     * _.first([1, 2, 3]);
     * // => 1
     *
     * _.first([1, 2, 3], 2);
     * // => [1, 2]
     *
     * _.first([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false, 'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.first(characters, 'blocked');
     * // => [{ 'name': 'barney', 'blocked': true, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.first(characters, { 'employer': 'slate' }), 'name');
     * // => ['barney', 'fred']
     */
    function first(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = -1;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[0] : undefined;
        }
      }
      return slice(array, 0, nativeMin(nativeMax(0, n), length));
    }

    /**
     * Flattens a nested array (the nesting can be to any depth). If `isShallow`
     * is truey, the array will only be flattened a single level. If a callback
     * is provided each element of the array is passed through the callback before
     * flattening. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new flattened array.
     * @example
     *
     * _.flatten([1, [2], [3, [[4]]]]);
     * // => [1, 2, 3, 4];
     *
     * _.flatten([1, [2], [3, [[4]]]], true);
     * // => [1, 2, 3, [[4]]];
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 30, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.flatten(characters, 'pets');
     * // => ['hoppy', 'baby puss', 'dino']
     */
    function flatten(array, isShallow, callback, thisArg) {
      // juggle arguments
      if (typeof isShallow != 'boolean' && isShallow != null) {
        thisArg = callback;
        callback = (typeof isShallow != 'function' && thisArg && thisArg[isShallow] === array) ? null : isShallow;
        isShallow = false;
      }
      if (callback != null) {
        array = map(array, callback, thisArg);
      }
      return baseFlatten(array, isShallow);
    }

    /**
     * Gets the index at which the first occurrence of `value` is found using
     * strict equality for comparisons, i.e. `===`. If the array is already sorted
     * providing `true` for `fromIndex` will run a faster binary search.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {boolean|number} [fromIndex=0] The index to search from or `true`
     *  to perform a binary search on a sorted array.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 1
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 4
     *
     * _.indexOf([1, 1, 2, 2, 3, 3], 2, true);
     * // => 2
     */
    function indexOf(array, value, fromIndex) {
      if (typeof fromIndex == 'number') {
        var length = array ? array.length : 0;
        fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex || 0);
      } else if (fromIndex) {
        var index = sortedIndex(array, value);
        return array[index] === value ? index : -1;
      }
      return baseIndexOf(array, value, fromIndex);
    }

    /**
     * Gets all but the last element or last `n` elements of an array. If a
     * callback is provided elements at the end of the array are excluded from
     * the result as long as the callback returns truey. The callback is bound
     * to `thisArg` and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.initial([1, 2, 3]);
     * // => [1, 2]
     *
     * _.initial([1, 2, 3], 2);
     * // => [1]
     *
     * _.initial([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [1]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.initial(characters, 'blocked');
     * // => [{ 'name': 'barney',  'blocked': false, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.initial(characters, { 'employer': 'na' }), 'name');
     * // => ['barney', 'fred']
     */
    function initial(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : callback || n;
      }
      return slice(array, 0, nativeMin(nativeMax(0, length - n), length));
    }

    /**
     * Creates an array of unique values present in all provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of shared values.
     * @example
     *
     * _.intersection([1, 2, 3], [5, 2, 1, 4], [2, 1]);
     * // => [1, 2]
     */
    function intersection() {
      var args = [],
          argsIndex = -1,
          argsLength = arguments.length,
          caches = getArray(),
          indexOf = getIndexOf(),
          trustIndexOf = indexOf === baseIndexOf,
          seen = getArray();

      while (++argsIndex < argsLength) {
        var value = arguments[argsIndex];
        if (isArray(value) || isArguments(value)) {
          args.push(value);
          caches.push(trustIndexOf && value.length >= largeArraySize &&
            createCache(argsIndex ? args[argsIndex] : seen));
        }
      }
      var array = args[0],
          index = -1,
          length = array ? array.length : 0,
          result = [];

      outer:
      while (++index < length) {
        var cache = caches[0];
        value = array[index];

        if ((cache ? cacheIndexOf(cache, value) : indexOf(seen, value)) < 0) {
          argsIndex = argsLength;
          (cache || seen).push(value);
          while (--argsIndex) {
            cache = caches[argsIndex];
            if ((cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value)) < 0) {
              continue outer;
            }
          }
          result.push(value);
        }
      }
      while (argsLength--) {
        cache = caches[argsLength];
        if (cache) {
          releaseObject(cache);
        }
      }
      releaseArray(caches);
      releaseArray(seen);
      return result;
    }

    /**
     * Gets the last element or last `n` elements of an array. If a callback is
     * provided elements at the end of the array are returned as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the last element(s) of `array`.
     * @example
     *
     * _.last([1, 2, 3]);
     * // => 3
     *
     * _.last([1, 2, 3], 2);
     * // => [2, 3]
     *
     * _.last([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [2, 3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.last(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.last(characters, { 'employer': 'na' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function last(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[length - 1] : undefined;
        }
      }
      return slice(array, nativeMax(0, length - n));
    }

    /**
     * Gets the index at which the last occurrence of `value` is found using strict
     * equality for comparisons, i.e. `===`. If `fromIndex` is negative, it is used
     * as the offset from the end of the collection.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {number} [fromIndex=array.length-1] The index to search from.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 4
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 1
     */
    function lastIndexOf(array, value, fromIndex) {
      var index = array ? array.length : 0;
      if (typeof fromIndex == 'number') {
        index = (fromIndex < 0 ? nativeMax(0, index + fromIndex) : nativeMin(fromIndex, index - 1)) + 1;
      }
      while (index--) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }

    /**
     * Removes all provided values from the given array using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {...*} [value] The values to remove.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [1, 2, 3, 1, 2, 3];
     * _.pull(array, 2, 3);
     * console.log(array);
     * // => [1, 1]
     */
    function pull(array) {
      var args = arguments,
          argsIndex = 0,
          argsLength = args.length,
          length = array ? array.length : 0;

      while (++argsIndex < argsLength) {
        var index = -1,
            value = args[argsIndex];
        while (++index < length) {
          if (array[index] === value) {
            splice.call(array, index--, 1);
            length--;
          }
        }
      }
      return array;
    }

    /**
     * Creates an array of numbers (positive and/or negative) progressing from
     * `start` up to but not including `end`. If `start` is less than `stop` a
     * zero-length range is created unless a negative `step` is specified.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {number} [start=0] The start of the range.
     * @param {number} end The end of the range.
     * @param {number} [step=1] The value to increment or decrement by.
     * @returns {Array} Returns a new range array.
     * @example
     *
     * _.range(4);
     * // => [0, 1, 2, 3]
     *
     * _.range(1, 5);
     * // => [1, 2, 3, 4]
     *
     * _.range(0, 20, 5);
     * // => [0, 5, 10, 15]
     *
     * _.range(0, -4, -1);
     * // => [0, -1, -2, -3]
     *
     * _.range(1, 4, 0);
     * // => [1, 1, 1]
     *
     * _.range(0);
     * // => []
     */
    function range(start, end, step) {
      start = +start || 0;
      step = typeof step == 'number' ? step : (+step || 1);

      if (end == null) {
        end = start;
        start = 0;
      }
      // use `Array(length)` so engines like Chakra and V8 avoid slower modes
      // http://youtu.be/XAqIpGU8ZZk#t=17m25s
      var index = -1,
          length = nativeMax(0, ceil((end - start) / (step || 1))),
          result = Array(length);

      while (++index < length) {
        result[index] = start;
        start += step;
      }
      return result;
    }

    /**
     * Removes all elements from an array that the callback returns truey for
     * and returns an array of removed elements. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of removed elements.
     * @example
     *
     * var array = [1, 2, 3, 4, 5, 6];
     * var evens = _.remove(array, function(num) { return num % 2 == 0; });
     *
     * console.log(array);
     * // => [1, 3, 5]
     *
     * console.log(evens);
     * // => [2, 4, 6]
     */
    function remove(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        var value = array[index];
        if (callback(value, index, array)) {
          result.push(value);
          splice.call(array, index--, 1);
          length--;
        }
      }
      return result;
    }

    /**
     * The opposite of `_.initial` this method gets all but the first element or
     * first `n` elements of an array. If a callback function is provided elements
     * at the beginning of the array are excluded from the result as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias drop, tail
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.rest([1, 2, 3]);
     * // => [2, 3]
     *
     * _.rest([1, 2, 3], 2);
     * // => [3]
     *
     * _.rest([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true, 'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.rest(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.rest(characters, { 'employer': 'slate' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function rest(array, callback, thisArg) {
      if (typeof callback != 'number' && callback != null) {
        var n = 0,
            index = -1,
            length = array ? array.length : 0;

        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : nativeMax(0, callback);
      }
      return slice(array, n);
    }

    /**
     * Uses a binary search to determine the smallest index at which a value
     * should be inserted into a given sorted array in order to maintain the sort
     * order of the array. If a callback is provided it will be executed for
     * `value` and each element of `array` to compute their sort ranking. The
     * callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to inspect.
     * @param {*} value The value to evaluate.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     * @example
     *
     * _.sortedIndex([20, 30, 50], 40);
     * // => 2
     *
     * // using "_.pluck" callback shorthand
     * _.sortedIndex([{ 'x': 20 }, { 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');
     * // => 2
     *
     * var dict = {
     *   'wordToNumber': { 'twenty': 20, 'thirty': 30, 'fourty': 40, 'fifty': 50 }
     * };
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return dict.wordToNumber[word];
     * });
     * // => 2
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return this.wordToNumber[word];
     * }, dict);
     * // => 2
     */
    function sortedIndex(array, value, callback, thisArg) {
      var low = 0,
          high = array ? array.length : low;

      // explicitly reference `identity` for better inlining in Firefox
      callback = callback ? lodash.createCallback(callback, thisArg, 1) : identity;
      value = callback(value);

      while (low < high) {
        var mid = (low + high) >>> 1;
        (callback(array[mid]) < value)
          ? low = mid + 1
          : high = mid;
      }
      return low;
    }

    /**
     * Creates an array of unique values, in order, of the provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of combined values.
     * @example
     *
     * _.union([1, 2, 3], [5, 2, 1, 4], [2, 1]);
     * // => [1, 2, 3, 5, 4]
     */
    function union() {
      return baseUniq(baseFlatten(arguments, true, true));
    }

    /**
     * Creates a duplicate-value-free version of an array using strict equality
     * for comparisons, i.e. `===`. If the array is sorted, providing
     * `true` for `isSorted` will use a faster algorithm. If a callback is provided
     * each element of `array` is passed through the callback before uniqueness
     * is computed. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias unique
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a duplicate-value-free array.
     * @example
     *
     * _.uniq([1, 2, 1, 3, 1]);
     * // => [1, 2, 3]
     *
     * _.uniq([1, 1, 2, 2, 3], true);
     * // => [1, 2, 3]
     *
     * _.uniq(['A', 'b', 'C', 'a', 'B', 'c'], function(letter) { return letter.toLowerCase(); });
     * // => ['A', 'b', 'C']
     *
     * _.uniq([1, 2.5, 3, 1.5, 2, 3.5], function(num) { return this.floor(num); }, Math);
     * // => [1, 2.5, 3]
     *
     * // using "_.pluck" callback shorthand
     * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
     * // => [{ 'x': 1 }, { 'x': 2 }]
     */
    function uniq(array, isSorted, callback, thisArg) {
      // juggle arguments
      if (typeof isSorted != 'boolean' && isSorted != null) {
        thisArg = callback;
        callback = (typeof isSorted != 'function' && thisArg && thisArg[isSorted] === array) ? null : isSorted;
        isSorted = false;
      }
      if (callback != null) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      return baseUniq(array, isSorted, callback);
    }

    /**
     * Creates an array excluding all provided values using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to filter.
     * @param {...*} [value] The values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.without([1, 2, 1, 0, 3, 1, 4], 0, 1);
     * // => [2, 3, 4]
     */
    function without(array) {
      return baseDifference(array, slice(arguments, 1));
    }

    /**
     * Creates an array that is the symmetric difference of the provided arrays.
     * See http://en.wikipedia.org/wiki/Symmetric_difference.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of values.
     * @example
     *
     * _.xor([1, 2, 3], [5, 2, 1, 4]);
     * // => [3, 5, 4]
     *
     * _.xor([1, 2, 5], [2, 3, 5], [3, 4, 5]);
     * // => [1, 4, 5]
     */
    function xor() {
      var index = -1,
          length = arguments.length;

      while (++index < length) {
        var array = arguments[index];
        if (isArray(array) || isArguments(array)) {
          var result = result
            ? baseUniq(baseDifference(result, array).concat(baseDifference(array, result)))
            : array;
        }
      }
      return result || [];
    }

    /**
     * Creates an array of grouped elements, the first of which contains the first
     * elements of the given arrays, the second of which contains the second
     * elements of the given arrays, and so on.
     *
     * @static
     * @memberOf _
     * @alias unzip
     * @category Arrays
     * @param {...Array} [array] Arrays to process.
     * @returns {Array} Returns a new array of grouped elements.
     * @example
     *
     * _.zip(['fred', 'barney'], [30, 40], [true, false]);
     * // => [['fred', 30, true], ['barney', 40, false]]
     */
    function zip() {
      var array = arguments.length > 1 ? arguments : arguments[0],
          index = -1,
          length = array ? max(pluck(array, 'length')) : 0,
          result = Array(length < 0 ? 0 : length);

      while (++index < length) {
        result[index] = pluck(array, index);
      }
      return result;
    }

    /**
     * Creates an object composed from arrays of `keys` and `values`. Provide
     * either a single two dimensional array, i.e. `[[key1, value1], [key2, value2]]`
     * or two arrays, one of `keys` and one of corresponding `values`.
     *
     * @static
     * @memberOf _
     * @alias object
     * @category Arrays
     * @param {Array} keys The array of keys.
     * @param {Array} [values=[]] The array of values.
     * @returns {Object} Returns an object composed of the given keys and
     *  corresponding values.
     * @example
     *
     * _.zipObject(['fred', 'barney'], [30, 40]);
     * // => { 'fred': 30, 'barney': 40 }
     */
    function zipObject(keys, values) {
      var index = -1,
          length = keys ? keys.length : 0,
          result = {};

      if (!values && length && !isArray(keys[0])) {
        values = [];
      }
      while (++index < length) {
        var key = keys[index];
        if (values) {
          result[key] = values[index];
        } else if (key) {
          result[key[0]] = key[1];
        }
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that executes `func`, with  the `this` binding and
     * arguments of the created function, only after being called `n` times.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {number} n The number of times the function must be called before
     *  `func` is executed.
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var saves = ['profile', 'settings'];
     *
     * var done = _.after(saves.length, function() {
     *   console.log('Done saving!');
     * });
     *
     * _.forEach(saves, function(type) {
     *   asyncSave({ 'type': type, 'complete': done });
     * });
     * // => logs 'Done saving!', after all saves have completed
     */
    function after(n, func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (--n < 1) {
          return func.apply(this, arguments);
        }
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with the `this`
     * binding of `thisArg` and prepends any additional `bind` arguments to those
     * provided to the bound function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to bind.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var func = function(greeting) {
     *   return greeting + ' ' + this.name;
     * };
     *
     * func = _.bind(func, { 'name': 'fred' }, 'hi');
     * func();
     * // => 'hi fred'
     */
    function bind(func, thisArg) {
      return arguments.length > 2
        ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
        : createWrapper(func, 1, null, null, thisArg);
    }

    /**
     * Binds methods of an object to the object itself, overwriting the existing
     * method. Method names may be specified as individual arguments or as arrays
     * of method names. If no method names are provided all the function properties
     * of `object` will be bound.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object to bind and assign the bound methods to.
     * @param {...string} [methodName] The object method names to
     *  bind, specified as individual method names or arrays of method names.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var view = {
     *   'label': 'docs',
     *   'onClick': function() { console.log('clicked ' + this.label); }
     * };
     *
     * _.bindAll(view);
     * jQuery('#docs').on('click', view.onClick);
     * // => logs 'clicked docs', when the button is clicked
     */
    function bindAll(object) {
      var funcs = arguments.length > 1 ? baseFlatten(arguments, true, false, 1) : functions(object),
          index = -1,
          length = funcs.length;

      while (++index < length) {
        var key = funcs[index];
        object[key] = createWrapper(object[key], 1, null, null, object);
      }
      return object;
    }

    /**
     * Creates a function that, when called, invokes the method at `object[key]`
     * and prepends any additional `bindKey` arguments to those provided to the bound
     * function. This method differs from `_.bind` by allowing bound functions to
     * reference methods that will be redefined or don't yet exist.
     * See http://michaux.ca/articles/lazy-function-definition-pattern.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object the method belongs to.
     * @param {string} key The key of the method.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var object = {
     *   'name': 'fred',
     *   'greet': function(greeting) {
     *     return greeting + ' ' + this.name;
     *   }
     * };
     *
     * var func = _.bindKey(object, 'greet', 'hi');
     * func();
     * // => 'hi fred'
     *
     * object.greet = function(greeting) {
     *   return greeting + 'ya ' + this.name + '!';
     * };
     *
     * func();
     * // => 'hiya fred!'
     */
    function bindKey(object, key) {
      return arguments.length > 2
        ? createWrapper(key, 19, slice(arguments, 2), null, object)
        : createWrapper(key, 3, null, null, object);
    }

    /**
     * Creates a function that is the composition of the provided functions,
     * where each function consumes the return value of the function that follows.
     * For example, composing the functions `f()`, `g()`, and `h()` produces `f(g(h()))`.
     * Each function is executed with the `this` binding of the composed function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {...Function} [func] Functions to compose.
     * @returns {Function} Returns the new composed function.
     * @example
     *
     * var realNameMap = {
     *   'pebbles': 'penelope'
     * };
     *
     * var format = function(name) {
     *   name = realNameMap[name.toLowerCase()] || name;
     *   return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
     * };
     *
     * var greet = function(formatted) {
     *   return 'Hiya ' + formatted + '!';
     * };
     *
     * var welcome = _.compose(greet, format);
     * welcome('pebbles');
     * // => 'Hiya Penelope!'
     */
    function compose() {
      var funcs = arguments,
          length = funcs.length;

      while (length--) {
        if (!isFunction(funcs[length])) {
          throw new TypeError;
        }
      }
      return function() {
        var args = arguments,
            length = funcs.length;

        while (length--) {
          args = [funcs[length].apply(this, args)];
        }
        return args[0];
      };
    }

    /**
     * Creates a function which accepts one or more arguments of `func` that when
     * invoked either executes `func` returning its result, if all `func` arguments
     * have been provided, or returns a function that accepts one or more of the
     * remaining `func` arguments, and so on. The arity of `func` can be specified
     * if `func.length` is not sufficient.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to curry.
     * @param {number} [arity=func.length] The arity of `func`.
     * @returns {Function} Returns the new curried function.
     * @example
     *
     * var curried = _.curry(function(a, b, c) {
     *   console.log(a + b + c);
     * });
     *
     * curried(1)(2)(3);
     * // => 6
     *
     * curried(1, 2)(3);
     * // => 6
     *
     * curried(1, 2, 3);
     * // => 6
     */
    function curry(func, arity) {
      arity = typeof arity == 'number' ? arity : (+arity || func.length);
      return createWrapper(func, 4, null, null, null, arity);
    }

    /**
     * Creates a function that will delay the execution of `func` until after
     * `wait` milliseconds have elapsed since the last time it was invoked.
     * Provide an options object to indicate that `func` should be invoked on
     * the leading and/or trailing edge of the `wait` timeout. Subsequent calls
     * to the debounced function will return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the debounced function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to debounce.
     * @param {number} wait The number of milliseconds to delay.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=false] Specify execution on the leading edge of the timeout.
     * @param {number} [options.maxWait] The maximum time `func` is allowed to be delayed before it's called.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new debounced function.
     * @example
     *
     * // avoid costly calculations while the window size is in flux
     * var lazyLayout = _.debounce(calculateLayout, 150);
     * jQuery(window).on('resize', lazyLayout);
     *
     * // execute `sendMail` when the click event is fired, debouncing subsequent calls
     * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
     *   'leading': true,
     *   'trailing': false
     * });
     *
     * // ensure `batchLog` is executed once after 1 second of debounced calls
     * var source = new EventSource('/stream');
     * source.addEventListener('message', _.debounce(batchLog, 250, {
     *   'maxWait': 1000
     * }, false);
     */
    function debounce(func, wait, options) {
      var args,
          maxTimeoutId,
          result,
          stamp,
          thisArg,
          timeoutId,
          trailingCall,
          lastCalled = 0,
          maxWait = false,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      wait = nativeMax(0, wait) || 0;
      if (options === true) {
        var leading = true;
        trailing = false;
      } else if (isObject(options)) {
        leading = options.leading;
        maxWait = 'maxWait' in options && (nativeMax(wait, options.maxWait) || 0);
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      var delayed = function() {
        var remaining = wait - (now() - stamp);
        if (remaining <= 0) {
          if (maxTimeoutId) {
            clearTimeout(maxTimeoutId);
          }
          var isCalled = trailingCall;
          maxTimeoutId = timeoutId = trailingCall = undefined;
          if (isCalled) {
            lastCalled = now();
            result = func.apply(thisArg, args);
            if (!timeoutId && !maxTimeoutId) {
              args = thisArg = null;
            }
          }
        } else {
          timeoutId = setTimeout(delayed, remaining);
        }
      };

      var maxDelayed = function() {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        maxTimeoutId = timeoutId = trailingCall = undefined;
        if (trailing || (maxWait !== wait)) {
          lastCalled = now();
          result = func.apply(thisArg, args);
          if (!timeoutId && !maxTimeoutId) {
            args = thisArg = null;
          }
        }
      };

      return function() {
        args = arguments;
        stamp = now();
        thisArg = this;
        trailingCall = trailing && (timeoutId || !leading);

        if (maxWait === false) {
          var leadingCall = leading && !timeoutId;
        } else {
          if (!maxTimeoutId && !leading) {
            lastCalled = stamp;
          }
          var remaining = maxWait - (stamp - lastCalled),
              isCalled = remaining <= 0;

          if (isCalled) {
            if (maxTimeoutId) {
              maxTimeoutId = clearTimeout(maxTimeoutId);
            }
            lastCalled = stamp;
            result = func.apply(thisArg, args);
          }
          else if (!maxTimeoutId) {
            maxTimeoutId = setTimeout(maxDelayed, remaining);
          }
        }
        if (isCalled && timeoutId) {
          timeoutId = clearTimeout(timeoutId);
        }
        else if (!timeoutId && wait !== maxWait) {
          timeoutId = setTimeout(delayed, wait);
        }
        if (leadingCall) {
          isCalled = true;
          result = func.apply(thisArg, args);
        }
        if (isCalled && !timeoutId && !maxTimeoutId) {
          args = thisArg = null;
        }
        return result;
      };
    }

    /**
     * Defers executing the `func` function until the current call stack has cleared.
     * Additional arguments will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to defer.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.defer(function(text) { console.log(text); }, 'deferred');
     * // logs 'deferred' after one or more milliseconds
     */
    function defer(func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 1);
      return setTimeout(function() { func.apply(undefined, args); }, 1);
    }

    /**
     * Executes the `func` function after `wait` milliseconds. Additional arguments
     * will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to delay.
     * @param {number} wait The number of milliseconds to delay execution.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.delay(function(text) { console.log(text); }, 1000, 'later');
     * // => logs 'later' after one second
     */
    function delay(func, wait) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 2);
      return setTimeout(function() { func.apply(undefined, args); }, wait);
    }

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided it will be used to determine the cache key for storing the result
     * based on the arguments provided to the memoized function. By default, the
     * first argument provided to the memoized function is used as the cache key.
     * The `func` is executed with the `this` binding of the memoized function.
     * The result cache is exposed as the `cache` property on the memoized function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] A function used to resolve the cache key.
     * @returns {Function} Returns the new memoizing function.
     * @example
     *
     * var fibonacci = _.memoize(function(n) {
     *   return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
     * });
     *
     * fibonacci(9)
     * // => 34
     *
     * var data = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // modifying the result cache
     * var get = _.memoize(function(name) { return data[name]; }, _.identity);
     * get('pebbles');
     * // => { 'name': 'pebbles', 'age': 1 }
     *
     * get.cache.pebbles.name = 'penelope';
     * get('pebbles');
     * // => { 'name': 'penelope', 'age': 1 }
     */
    function memoize(func, resolver) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var memoized = function() {
        var cache = memoized.cache,
            key = resolver ? resolver.apply(this, arguments) : keyPrefix + arguments[0];

        return hasOwnProperty.call(cache, key)
          ? cache[key]
          : (cache[key] = func.apply(this, arguments));
      }
      memoized.cache = {};
      return memoized;
    }

    /**
     * Creates a function that is restricted to execute `func` once. Repeat calls to
     * the function will return the value of the first call. The `func` is executed
     * with the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var initialize = _.once(createApplication);
     * initialize();
     * initialize();
     * // `initialize` executes `createApplication` once
     */
    function once(func) {
      var ran,
          result;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (ran) {
          return result;
        }
        ran = true;
        result = func.apply(this, arguments);

        // clear the `func` variable so the function may be garbage collected
        func = null;
        return result;
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with any additional
     * `partial` arguments prepended to those provided to the new function. This
     * method is similar to `_.bind` except it does **not** alter the `this` binding.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var greet = function(greeting, name) { return greeting + ' ' + name; };
     * var hi = _.partial(greet, 'hi');
     * hi('fred');
     * // => 'hi fred'
     */
    function partial(func) {
      return createWrapper(func, 16, slice(arguments, 1));
    }

    /**
     * This method is like `_.partial` except that `partial` arguments are
     * appended to those provided to the new function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var defaultsDeep = _.partialRight(_.merge, _.defaults);
     *
     * var options = {
     *   'variable': 'data',
     *   'imports': { 'jq': $ }
     * };
     *
     * defaultsDeep(options, _.templateSettings);
     *
     * options.variable
     * // => 'data'
     *
     * options.imports
     * // => { '_': _, 'jq': $ }
     */
    function partialRight(func) {
      return createWrapper(func, 32, null, slice(arguments, 1));
    }

    /**
     * Creates a function that, when executed, will only call the `func` function
     * at most once per every `wait` milliseconds. Provide an options object to
     * indicate that `func` should be invoked on the leading and/or trailing edge
     * of the `wait` timeout. Subsequent calls to the throttled function will
     * return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the throttled function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to throttle.
     * @param {number} wait The number of milliseconds to throttle executions to.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=true] Specify execution on the leading edge of the timeout.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new throttled function.
     * @example
     *
     * // avoid excessively updating the position while scrolling
     * var throttled = _.throttle(updatePosition, 100);
     * jQuery(window).on('scroll', throttled);
     *
     * // execute `renewToken` when the click event is fired, but not more than once every 5 minutes
     * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
     *   'trailing': false
     * }));
     */
    function throttle(func, wait, options) {
      var leading = true,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      if (options === false) {
        leading = false;
      } else if (isObject(options)) {
        leading = 'leading' in options ? options.leading : leading;
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      debounceOptions.leading = leading;
      debounceOptions.maxWait = wait;
      debounceOptions.trailing = trailing;

      return debounce(func, wait, debounceOptions);
    }

    /**
     * Creates a function that provides `value` to the wrapper function as its
     * first argument. Additional arguments provided to the function are appended
     * to those provided to the wrapper function. The wrapper is executed with
     * the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {*} value The value to wrap.
     * @param {Function} wrapper The wrapper function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var p = _.wrap(_.escape, function(func, text) {
     *   return '<p>' + func(text) + '</p>';
     * });
     *
     * p('Fred, Wilma, & Pebbles');
     * // => '<p>Fred, Wilma, &amp; Pebbles</p>'
     */
    function wrap(value, wrapper) {
      return createWrapper(wrapper, 16, [value]);
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that returns `value`.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value The value to return from the new function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var getter = _.constant(object);
     * getter() === object;
     * // => true
     */
    function constant(value) {
      return function() {
        return value;
      };
    }

    /**
     * Produces a callback bound to an optional `thisArg`. If `func` is a property
     * name the created callback will return the property value for a given element.
     * If `func` is an object the created callback will return `true` for elements
     * that contain the equivalent object properties, otherwise it will return `false`.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // wrap to create custom callback shorthands
     * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
     *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
     *   return !match ? func(callback, thisArg) : function(object) {
     *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
     *   };
     * });
     *
     * _.filter(characters, 'age__gt38');
     * // => [{ 'name': 'fred', 'age': 40 }]
     */
    function createCallback(func, thisArg, argCount) {
      var type = typeof func;
      if (func == null || type == 'function') {
        return baseCreateCallback(func, thisArg, argCount);
      }
      // handle "_.pluck" style callback shorthands
      if (type != 'object') {
        return property(func);
      }
      var props = keys(func),
          key = props[0],
          a = func[key];

      // handle "_.where" style callback shorthands
      if (props.length == 1 && a === a && !isObject(a)) {
        // fast path the common case of providing an object with a single
        // property containing a primitive value
        return function(object) {
          var b = object[key];
          return a === b && (a !== 0 || (1 / a == 1 / b));
        };
      }
      return function(object) {
        var length = props.length,
            result = false;

        while (length--) {
          if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
            break;
          }
        }
        return result;
      };
    }

    /**
     * Converts the characters `&`, `<`, `>`, `"`, and `'` in `string` to their
     * corresponding HTML entities.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to escape.
     * @returns {string} Returns the escaped string.
     * @example
     *
     * _.escape('Fred, Wilma, & Pebbles');
     * // => 'Fred, Wilma, &amp; Pebbles'
     */
    function escape(string) {
      return string == null ? '' : String(string).replace(reUnescapedHtml, escapeHtmlChar);
    }

    /**
     * This method returns the first argument provided to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.identity(object) === object;
     * // => true
     */
    function identity(value) {
      return value;
    }

    /**
     * Adds function properties of a source object to the destination object.
     * If `object` is a function methods will be added to its prototype as well.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Function|Object} [object=lodash] object The destination object.
     * @param {Object} source The object of functions to add.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.chain=true] Specify whether the functions added are chainable.
     * @example
     *
     * function capitalize(string) {
     *   return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
     * }
     *
     * _.mixin({ 'capitalize': capitalize });
     * _.capitalize('fred');
     * // => 'Fred'
     *
     * _('fred').capitalize().value();
     * // => 'Fred'
     *
     * _.mixin({ 'capitalize': capitalize }, { 'chain': false });
     * _('fred').capitalize();
     * // => 'Fred'
     */
    function mixin(object, source, options) {
      var chain = true,
          methodNames = source && functions(source);

      if (!source || (!options && !methodNames.length)) {
        if (options == null) {
          options = source;
        }
        ctor = lodashWrapper;
        source = object;
        object = lodash;
        methodNames = functions(source);
      }
      if (options === false) {
        chain = false;
      } else if (isObject(options) && 'chain' in options) {
        chain = options.chain;
      }
      var ctor = object,
          isFunc = isFunction(ctor);

      forEach(methodNames, function(methodName) {
        var func = object[methodName] = source[methodName];
        if (isFunc) {
          ctor.prototype[methodName] = function() {
            var chainAll = this.__chain__,
                value = this.__wrapped__,
                args = [value];

            push.apply(args, arguments);
            var result = func.apply(object, args);
            if (chain || chainAll) {
              if (value === result && isObject(result)) {
                return this;
              }
              result = new ctor(result);
              result.__chain__ = chainAll;
            }
            return result;
          };
        }
      });
    }

    /**
     * Reverts the '_' variable to its previous value and returns a reference to
     * the `lodash` function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @returns {Function} Returns the `lodash` function.
     * @example
     *
     * var lodash = _.noConflict();
     */
    function noConflict() {
      context._ = oldDash;
      return this;
    }

    /**
     * A no-operation function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.noop(object) === undefined;
     * // => true
     */
    function noop() {
      // no operation performed
    }

    /**
     * Gets the number of milliseconds that have elapsed since the Unix epoch
     * (1 January 1970 00:00:00 UTC).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var stamp = _.now();
     * _.defer(function() { console.log(_.now() - stamp); });
     * // => logs the number of milliseconds it took for the deferred function to be called
     */
    var now = isNative(now = Date.now) && now || function() {
      return new Date().getTime();
    };

    /**
     * Converts the given value into an integer of the specified radix.
     * If `radix` is `undefined` or `0` a `radix` of `10` is used unless the
     * `value` is a hexadecimal, in which case a `radix` of `16` is used.
     *
     * Note: This method avoids differences in native ES3 and ES5 `parseInt`
     * implementations. See http://es5.github.io/#E.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} value The value to parse.
     * @param {number} [radix] The radix used to interpret the value to parse.
     * @returns {number} Returns the new integer value.
     * @example
     *
     * _.parseInt('08');
     * // => 8
     */
    var parseInt = nativeParseInt(whitespace + '08') == 8 ? nativeParseInt : function(value, radix) {
      // Firefox < 21 and Opera < 15 follow the ES3 specified implementation of `parseInt`
      return nativeParseInt(isString(value) ? value.replace(reLeadingSpacesAndZeros, '') : value, radix || 0);
    };

    /**
     * Creates a "_.pluck" style function, which returns the `key` value of a
     * given object.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} key The name of the property to retrieve.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var characters = [
     *   { 'name': 'fred',   'age': 40 },
     *   { 'name': 'barney', 'age': 36 }
     * ];
     *
     * var getName = _.property('name');
     *
     * _.map(characters, getName);
     * // => ['barney', 'fred']
     *
     * _.sortBy(characters, getName);
     * // => [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred',   'age': 40 }]
     */
    function property(key) {
      return function(object) {
        return object[key];
      };
    }

    /**
     * Produces a random number between `min` and `max` (inclusive). If only one
     * argument is provided a number between `0` and the given number will be
     * returned. If `floating` is truey or either `min` or `max` are floats a
     * floating-point number will be returned instead of an integer.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} [min=0] The minimum possible value.
     * @param {number} [max=1] The maximum possible value.
     * @param {boolean} [floating=false] Specify returning a floating-point number.
     * @returns {number} Returns a random number.
     * @example
     *
     * _.random(0, 5);
     * // => an integer between 0 and 5
     *
     * _.random(5);
     * // => also an integer between 0 and 5
     *
     * _.random(5, true);
     * // => a floating-point number between 0 and 5
     *
     * _.random(1.2, 5.2);
     * // => a floating-point number between 1.2 and 5.2
     */
    function random(min, max, floating) {
      var noMin = min == null,
          noMax = max == null;

      if (floating == null) {
        if (typeof min == 'boolean' && noMax) {
          floating = min;
          min = 1;
        }
        else if (!noMax && typeof max == 'boolean') {
          floating = max;
          noMax = true;
        }
      }
      if (noMin && noMax) {
        max = 1;
      }
      min = +min || 0;
      if (noMax) {
        max = min;
        min = 0;
      } else {
        max = +max || 0;
      }
      if (floating || min % 1 || max % 1) {
        var rand = nativeRandom();
        return nativeMin(min + (rand * (max - min + parseFloat('1e-' + ((rand +'').length - 1)))), max);
      }
      return baseRandom(min, max);
    }

    /**
     * Resolves the value of property `key` on `object`. If `key` is a function
     * it will be invoked with the `this` binding of `object` and its result returned,
     * else the property value is returned. If `object` is falsey then `undefined`
     * is returned.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Object} object The object to inspect.
     * @param {string} key The name of the property to resolve.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = {
     *   'cheese': 'crumpets',
     *   'stuff': function() {
     *     return 'nonsense';
     *   }
     * };
     *
     * _.result(object, 'cheese');
     * // => 'crumpets'
     *
     * _.result(object, 'stuff');
     * // => 'nonsense'
     */
    function result(object, key) {
      if (object) {
        var value = object[key];
        return isFunction(value) ? object[key]() : value;
      }
    }

    /**
     * A micro-templating method that handles arbitrary delimiters, preserves
     * whitespace, and correctly escapes quotes within interpolated code.
     *
     * Note: In the development build, `_.template` utilizes sourceURLs for easier
     * debugging. See http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
     *
     * For more information on precompiling templates see:
     * https://lodash.com/custom-builds
     *
     * For more information on Chrome extension sandboxes see:
     * http://developer.chrome.com/stable/extensions/sandboxingEval.html
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} text The template text.
     * @param {Object} data The data object used to populate the text.
     * @param {Object} [options] The options object.
     * @param {RegExp} [options.escape] The "escape" delimiter.
     * @param {RegExp} [options.evaluate] The "evaluate" delimiter.
     * @param {Object} [options.imports] An object to import into the template as local variables.
     * @param {RegExp} [options.interpolate] The "interpolate" delimiter.
     * @param {string} [sourceURL] The sourceURL of the template's compiled source.
     * @param {string} [variable] The data object variable name.
     * @returns {Function|string} Returns a compiled function when no `data` object
     *  is given, else it returns the interpolated text.
     * @example
     *
     * // using the "interpolate" delimiter to create a compiled template
     * var compiled = _.template('hello <%= name %>');
     * compiled({ 'name': 'fred' });
     * // => 'hello fred'
     *
     * // using the "escape" delimiter to escape HTML in data property values
     * _.template('<b><%- value %></b>', { 'value': '<script>' });
     * // => '<b>&lt;script&gt;</b>'
     *
     * // using the "evaluate" delimiter to generate HTML
     * var list = '<% _.forEach(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the ES6 delimiter as an alternative to the default "interpolate" delimiter
     * _.template('hello ${ name }', { 'name': 'pebbles' });
     * // => 'hello pebbles'
     *
     * // using the internal `print` function in "evaluate" delimiters
     * _.template('<% print("hello " + name); %>!', { 'name': 'barney' });
     * // => 'hello barney!'
     *
     * // using a custom template delimiters
     * _.templateSettings = {
     *   'interpolate': /{{([\s\S]+?)}}/g
     * };
     *
     * _.template('hello {{ name }}!', { 'name': 'mustache' });
     * // => 'hello mustache!'
     *
     * // using the `imports` option to import jQuery
     * var list = '<% jq.each(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] }, { 'imports': { 'jq': jQuery } });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the `sourceURL` option to specify a custom sourceURL for the template
     * var compiled = _.template('hello <%= name %>', null, { 'sourceURL': '/basic/greeting.jst' });
     * compiled(data);
     * // => find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector
     *
     * // using the `variable` option to ensure a with-statement isn't used in the compiled template
     * var compiled = _.template('hi <%= data.name %>!', null, { 'variable': 'data' });
     * compiled.source;
     * // => function(data) {
     *   var __t, __p = '', __e = _.escape;
     *   __p += 'hi ' + ((__t = ( data.name )) == null ? '' : __t) + '!';
     *   return __p;
     * }
     *
     * // using the `source` property to inline compiled templates for meaningful
     * // line numbers in error messages and a stack trace
     * fs.writeFileSync(path.join(cwd, 'jst.js'), '\
     *   var JST = {\
     *     "main": ' + _.template(mainText).source + '\
     *   };\
     * ');
     */
    function template(text, data, options) {
      // based on John Resig's `tmpl` implementation
      // http://ejohn.org/blog/javascript-micro-templating/
      // and Laura Doktorova's doT.js
      // https://github.com/olado/doT
      var settings = lodash.templateSettings;
      text = String(text || '');

      // avoid missing dependencies when `iteratorTemplate` is not defined
      options = defaults({}, options, settings);

      var imports = defaults({}, options.imports, settings.imports),
          importsKeys = keys(imports),
          importsValues = values(imports);

      var isEvaluating,
          index = 0,
          interpolate = options.interpolate || reNoMatch,
          source = "__p += '";

      // compile the regexp to match each delimiter
      var reDelimiters = RegExp(
        (options.escape || reNoMatch).source + '|' +
        interpolate.source + '|' +
        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
        (options.evaluate || reNoMatch).source + '|$'
      , 'g');

      text.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
        interpolateValue || (interpolateValue = esTemplateValue);

        // escape characters that cannot be included in string literals
        source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar);

        // replace delimiters with snippets
        if (escapeValue) {
          source += "' +\n__e(" + escapeValue + ") +\n'";
        }
        if (evaluateValue) {
          isEvaluating = true;
          source += "';\n" + evaluateValue + ";\n__p += '";
        }
        if (interpolateValue) {
          source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
        }
        index = offset + match.length;

        // the JS engine embedded in Adobe products requires returning the `match`
        // string in order to produce the correct `offset` value
        return match;
      });

      source += "';\n";

      // if `variable` is not specified, wrap a with-statement around the generated
      // code to add the data object to the top of the scope chain
      var variable = options.variable,
          hasVariable = variable;

      if (!hasVariable) {
        variable = 'obj';
        source = 'with (' + variable + ') {\n' + source + '\n}\n';
      }
      // cleanup code by stripping empty strings
      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
        .replace(reEmptyStringMiddle, '$1')
        .replace(reEmptyStringTrailing, '$1;');

      // frame code as the function body
      source = 'function(' + variable + ') {\n' +
        (hasVariable ? '' : variable + ' || (' + variable + ' = {});\n') +
        "var __t, __p = '', __e = _.escape" +
        (isEvaluating
          ? ', __j = Array.prototype.join;\n' +
            "function print() { __p += __j.call(arguments, '') }\n"
          : ';\n'
        ) +
        source +
        'return __p\n}';

      // Use a sourceURL for easier debugging.
      // http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
      var sourceURL = '\n/*\n//# sourceURL=' + (options.sourceURL || '/lodash/template/source[' + (templateCounter++) + ']') + '\n*/';

      try {
        var result = Function(importsKeys, 'return ' + source + sourceURL).apply(undefined, importsValues);
      } catch(e) {
        e.source = source;
        throw e;
      }
      if (data) {
        return result(data);
      }
      // provide the compiled function's source by its `toString` method, in
      // supported environments, or the `source` property as a convenience for
      // inlining compiled templates during the build process
      result.source = source;
      return result;
    }

    /**
     * Executes the callback `n` times, returning an array of the results
     * of each callback execution. The callback is bound to `thisArg` and invoked
     * with one argument; (index).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} n The number of times to execute the callback.
     * @param {Function} callback The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns an array of the results of each `callback` execution.
     * @example
     *
     * var diceRolls = _.times(3, _.partial(_.random, 1, 6));
     * // => [3, 6, 4]
     *
     * _.times(3, function(n) { mage.castSpell(n); });
     * // => calls `mage.castSpell(n)` three times, passing `n` of `0`, `1`, and `2` respectively
     *
     * _.times(3, function(n) { this.cast(n); }, mage);
     * // => also calls `mage.castSpell(n)` three times
     */
    function times(n, callback, thisArg) {
      n = (n = +n) > -1 ? n : 0;
      var index = -1,
          result = Array(n);

      callback = baseCreateCallback(callback, thisArg, 1);
      while (++index < n) {
        result[index] = callback(index);
      }
      return result;
    }

    /**
     * The inverse of `_.escape` this method converts the HTML entities
     * `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` in `string` to their
     * corresponding characters.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to unescape.
     * @returns {string} Returns the unescaped string.
     * @example
     *
     * _.unescape('Fred, Barney &amp; Pebbles');
     * // => 'Fred, Barney & Pebbles'
     */
    function unescape(string) {
      return string == null ? '' : String(string).replace(reEscapedHtml, unescapeHtmlChar);
    }

    /**
     * Generates a unique ID. If `prefix` is provided the ID will be appended to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} [prefix] The value to prefix the ID with.
     * @returns {string} Returns the unique ID.
     * @example
     *
     * _.uniqueId('contact_');
     * // => 'contact_104'
     *
     * _.uniqueId();
     * // => '105'
     */
    function uniqueId(prefix) {
      var id = ++idCounter;
      return String(prefix == null ? '' : prefix) + id;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object that wraps the given value with explicit
     * method chaining enabled.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to wrap.
     * @returns {Object} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'pebbles', 'age': 1 }
     * ];
     *
     * var youngest = _.chain(characters)
     *     .sortBy('age')
     *     .map(function(chr) { return chr.name + ' is ' + chr.age; })
     *     .first()
     *     .value();
     * // => 'pebbles is 1'
     */
    function chain(value) {
      value = new lodashWrapper(value);
      value.__chain__ = true;
      return value;
    }

    /**
     * Invokes `interceptor` with the `value` as the first argument and then
     * returns `value`. The purpose of this method is to "tap into" a method
     * chain in order to perform operations on intermediate results within
     * the chain.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to provide to `interceptor`.
     * @param {Function} interceptor The function to invoke.
     * @returns {*} Returns `value`.
     * @example
     *
     * _([1, 2, 3, 4])
     *  .tap(function(array) { array.pop(); })
     *  .reverse()
     *  .value();
     * // => [3, 2, 1]
     */
    function tap(value, interceptor) {
      interceptor(value);
      return value;
    }

    /**
     * Enables explicit method chaining on the wrapper object.
     *
     * @name chain
     * @memberOf _
     * @category Chaining
     * @returns {*} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // without explicit chaining
     * _(characters).first();
     * // => { 'name': 'barney', 'age': 36 }
     *
     * // with explicit chaining
     * _(characters).chain()
     *   .first()
     *   .pick('age')
     *   .value();
     * // => { 'age': 36 }
     */
    function wrapperChain() {
      this.__chain__ = true;
      return this;
    }

    /**
     * Produces the `toString` result of the wrapped value.
     *
     * @name toString
     * @memberOf _
     * @category Chaining
     * @returns {string} Returns the string result.
     * @example
     *
     * _([1, 2, 3]).toString();
     * // => '1,2,3'
     */
    function wrapperToString() {
      return String(this.__wrapped__);
    }

    /**
     * Extracts the wrapped value.
     *
     * @name valueOf
     * @memberOf _
     * @alias value
     * @category Chaining
     * @returns {*} Returns the wrapped value.
     * @example
     *
     * _([1, 2, 3]).valueOf();
     * // => [1, 2, 3]
     */
    function wrapperValueOf() {
      return this.__wrapped__;
    }

    /*--------------------------------------------------------------------------*/

    // add functions that return wrapped values when chaining
    lodash.after = after;
    lodash.assign = assign;
    lodash.at = at;
    lodash.bind = bind;
    lodash.bindAll = bindAll;
    lodash.bindKey = bindKey;
    lodash.chain = chain;
    lodash.compact = compact;
    lodash.compose = compose;
    lodash.constant = constant;
    lodash.countBy = countBy;
    lodash.create = create;
    lodash.createCallback = createCallback;
    lodash.curry = curry;
    lodash.debounce = debounce;
    lodash.defaults = defaults;
    lodash.defer = defer;
    lodash.delay = delay;
    lodash.difference = difference;
    lodash.filter = filter;
    lodash.flatten = flatten;
    lodash.forEach = forEach;
    lodash.forEachRight = forEachRight;
    lodash.forIn = forIn;
    lodash.forInRight = forInRight;
    lodash.forOwn = forOwn;
    lodash.forOwnRight = forOwnRight;
    lodash.functions = functions;
    lodash.groupBy = groupBy;
    lodash.indexBy = indexBy;
    lodash.initial = initial;
    lodash.intersection = intersection;
    lodash.invert = invert;
    lodash.invoke = invoke;
    lodash.keys = keys;
    lodash.map = map;
    lodash.mapValues = mapValues;
    lodash.max = max;
    lodash.memoize = memoize;
    lodash.merge = merge;
    lodash.min = min;
    lodash.omit = omit;
    lodash.once = once;
    lodash.pairs = pairs;
    lodash.partial = partial;
    lodash.partialRight = partialRight;
    lodash.pick = pick;
    lodash.pluck = pluck;
    lodash.property = property;
    lodash.pull = pull;
    lodash.range = range;
    lodash.reject = reject;
    lodash.remove = remove;
    lodash.rest = rest;
    lodash.shuffle = shuffle;
    lodash.sortBy = sortBy;
    lodash.tap = tap;
    lodash.throttle = throttle;
    lodash.times = times;
    lodash.toArray = toArray;
    lodash.transform = transform;
    lodash.union = union;
    lodash.uniq = uniq;
    lodash.values = values;
    lodash.where = where;
    lodash.without = without;
    lodash.wrap = wrap;
    lodash.xor = xor;
    lodash.zip = zip;
    lodash.zipObject = zipObject;

    // add aliases
    lodash.collect = map;
    lodash.drop = rest;
    lodash.each = forEach;
    lodash.eachRight = forEachRight;
    lodash.extend = assign;
    lodash.methods = functions;
    lodash.object = zipObject;
    lodash.select = filter;
    lodash.tail = rest;
    lodash.unique = uniq;
    lodash.unzip = zip;

    // add functions to `lodash.prototype`
    mixin(lodash);

    /*--------------------------------------------------------------------------*/

    // add functions that return unwrapped values when chaining
    lodash.clone = clone;
    lodash.cloneDeep = cloneDeep;
    lodash.contains = contains;
    lodash.escape = escape;
    lodash.every = every;
    lodash.find = find;
    lodash.findIndex = findIndex;
    lodash.findKey = findKey;
    lodash.findLast = findLast;
    lodash.findLastIndex = findLastIndex;
    lodash.findLastKey = findLastKey;
    lodash.has = has;
    lodash.identity = identity;
    lodash.indexOf = indexOf;
    lodash.isArguments = isArguments;
    lodash.isArray = isArray;
    lodash.isBoolean = isBoolean;
    lodash.isDate = isDate;
    lodash.isElement = isElement;
    lodash.isEmpty = isEmpty;
    lodash.isEqual = isEqual;
    lodash.isFinite = isFinite;
    lodash.isFunction = isFunction;
    lodash.isNaN = isNaN;
    lodash.isNull = isNull;
    lodash.isNumber = isNumber;
    lodash.isObject = isObject;
    lodash.isPlainObject = isPlainObject;
    lodash.isRegExp = isRegExp;
    lodash.isString = isString;
    lodash.isUndefined = isUndefined;
    lodash.lastIndexOf = lastIndexOf;
    lodash.mixin = mixin;
    lodash.noConflict = noConflict;
    lodash.noop = noop;
    lodash.now = now;
    lodash.parseInt = parseInt;
    lodash.random = random;
    lodash.reduce = reduce;
    lodash.reduceRight = reduceRight;
    lodash.result = result;
    lodash.runInContext = runInContext;
    lodash.size = size;
    lodash.some = some;
    lodash.sortedIndex = sortedIndex;
    lodash.template = template;
    lodash.unescape = unescape;
    lodash.uniqueId = uniqueId;

    // add aliases
    lodash.all = every;
    lodash.any = some;
    lodash.detect = find;
    lodash.findWhere = find;
    lodash.foldl = reduce;
    lodash.foldr = reduceRight;
    lodash.include = contains;
    lodash.inject = reduce;

    mixin(function() {
      var source = {}
      forOwn(lodash, function(func, methodName) {
        if (!lodash.prototype[methodName]) {
          source[methodName] = func;
        }
      });
      return source;
    }(), false);

    /*--------------------------------------------------------------------------*/

    // add functions capable of returning wrapped and unwrapped values when chaining
    lodash.first = first;
    lodash.last = last;
    lodash.sample = sample;

    // add aliases
    lodash.take = first;
    lodash.head = first;

    forOwn(lodash, function(func, methodName) {
      var callbackable = methodName !== 'sample';
      if (!lodash.prototype[methodName]) {
        lodash.prototype[methodName]= function(n, guard) {
          var chainAll = this.__chain__,
              result = func(this.__wrapped__, n, guard);

          return !chainAll && (n == null || (guard && !(callbackable && typeof n == 'function')))
            ? result
            : new lodashWrapper(result, chainAll);
        };
      }
    });

    /*--------------------------------------------------------------------------*/

    /**
     * The semantic version number.
     *
     * @static
     * @memberOf _
     * @type string
     */
    lodash.VERSION = '2.4.2';

    // add "Chaining" functions to the wrapper
    lodash.prototype.chain = wrapperChain;
    lodash.prototype.toString = wrapperToString;
    lodash.prototype.value = wrapperValueOf;
    lodash.prototype.valueOf = wrapperValueOf;

    // add `Array` functions that return unwrapped values
    forEach(['join', 'pop', 'shift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        var chainAll = this.__chain__,
            result = func.apply(this.__wrapped__, arguments);

        return chainAll
          ? new lodashWrapper(result, chainAll)
          : result;
      };
    });

    // add `Array` functions that return the existing wrapped value
    forEach(['push', 'reverse', 'sort', 'unshift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        func.apply(this.__wrapped__, arguments);
        return this;
      };
    });

    // add `Array` functions that return new wrapped values
    forEach(['concat', 'slice', 'splice'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        return new lodashWrapper(func.apply(this.__wrapped__, arguments), this.__chain__);
      };
    });

    return lodash;
  }

  /*--------------------------------------------------------------------------*/

  // expose Lo-Dash
  var _ = runInContext();

  // some AMD build optimizers like r.js check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose Lo-Dash to the global object even when an AMD loader is present in
    // case Lo-Dash is loaded with a RequireJS shim config.
    // See http://requirejs.org/docs/api.html#config-shim
    root._ = _;

    // define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module
    define(function() {
      return _;
    });
  }
  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (freeExports && freeModule) {
    // in Node.js or RingoJS
    if (moduleExports) {
      (freeModule.exports = _)._ = _;
    }
    // in Narwhal or Rhino -require
    else {
      freeExports._ = _;
    }
  }
  else {
    // in a browser or Rhino
    root._ = _;
  }
}.call(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],7:[function(require,module,exports){
'use strict';

/**
 * Sets the appropriate background image based on the actual hour of the day and user defined image items/slots
 *
 */

module.exports = {

    setImage: function(timeSlots){
        var getMinute = function(date){ return date.getHours()*60+date.getMinutes(); };
//----- return immediately if there are no user defined time slots/images
        if (timeSlots.length===0) return;
//----- get the current minute of the day
        var h = getMinute(new Date());
//----- check with each timeslot to find the appropriate entry
        $.each( timeSlots, function(){
            if (h>=getMinute(this.from) && h<=getMinute(this.to)){
                var $body = $('body');
//------------- do nothing if this background image has already been installed before
                if ($body.data('url')===this.href) return false;
//------------- once timeslot was found, preload the image
                var self = this;
                $('<img/>').attr('src', self.href).load( function(){
//----------------- remove the temp img to prevent memory leaks
                    $(this).remove();
//----------------- now set the background-image with all params
                    $body.data('url', self.href)
                         .css({
                            'background-image': 'url("'+self.href+'")',
                            'background-repeat': self.repeat,
                            'background-position': self.position,
                            'background-attachment': self.attachment,
                            'background-size': self.size,
                            'height': '100%'
                    });
//----------------- and fade the preloading animation
                    $("#loader-wrapper").fadeOut("slow");
                });
//------------- then quit the each loop
                return false;
            }
        });
    }

};
},{}],8:[function(require,module,exports){
'use strict';

/**
 * Adds additional classes to the BODY element
 * onHome ~ if the homepage is displayed
 * onTopic ~ if a topic page is displayed
 * topic-{topicID} ~ ID of the topic (lowercase ID)
 * onStory ~ if a story is displayed
 * story-{storyID} ~ ID of the story (lowercase ID)
 *
 * Examples:
 * pathname="/" ===> bodyclass="onHome"
 * pathname="/topics/Testthema/" ==> bodyclass="onTopic topic-testthema"
 * pathname="/stories/is-it-me-youre-looking-for/" ==> bodyclass="onStory story-is-it-me-youre-looking-for"
 *
 */

module.exports = function(){

    var bodyclass = "";
    if (location.pathname === "/") bodyclass = "onHome";
    else {
        var path = location.pathname.replace(/\//g, " ").trim().split(" ");
        switch (path[0]) {
            case "topics":  bodyclass = "onTopic " + path[1].toLowerCase(); break;
            case "stories": bodyclass = "onStory " + path[1].toLowerCase(); break;
        }
    }
    if (bodyclass.length>0) $("body").addClass(bodyclass);

};
},{}],9:[function(require,module,exports){
'use strict';

module.exports = function($rootScope, $filter, $q, UpdateCheck, TwodaySkin, toastr){
    
    var vm = this;
    
    vm.param = $rootScope.param;

    vm.msgClose = true;
    vm.isChecking = false;

    vm.dateNextCheck = function(){
        return (vm.param.update.gap<0
            ? "Keine Prüfung"
            : $filter('date')(new Date(vm.param.update.lastCheck.getTime()+vm.param.update.gap), "dd.MM.yyyy HH:mm"));
    };

    vm.updateChecks = [
        { check: "täglich", gap: 24*60*60*1000 },
        { check: "wöchentlich", gap: 7*24*60*60*1000 },
        { check: "monatlich", gap: 30*24*60*60*1000 },
        { check: "niemals", gap: -1 }
    ];

    vm.useFrequency = function(index){
        var frequency = vm.updateChecks[index];
        vm.param.update.check = frequency.check;
        vm.param.update.gap = frequency.gap;
    };

    vm.checkSkinUpdate = function(){

        var skinEditUrl = vm.param.layoutUrl+"skins/edit?key=",
            promises = [];

        $.each( vm.release.skins, function(){
            promises.push( TwodaySkin.get(skinEditUrl+this.name) );
        });

        $q.all(promises).then( function(results){ // success: all skins read

            $.each( results, function(index, response){ // response = {config, data, headers, status, statusText}

                var skin = vm.release.skins[index];
                var $form = $(response.data).find("form").eq(0);
                var skinCode = $.trim($form.find("textarea[name=skin]").val());
                var isSkinInitial = (skinCode.length === 0);
                if (typeof vm.param.update.overwrite[skin.name] !== "undefined"){
                    switch(vm.param.update.overwrite[skin.name]){ // always, never
                        case "always": skin.status = "needsupdate"; break;
                        case "never":  skin.status = (isSkinInitial ? "needsupdate" : "skipped"); break;
                    }
                } else {
                    skin.status = (skin.content.length===skinCode.length && skin.content===skinCode ? "isequal" : "needsupdate");
                }
                console.log("Index:", index, skin.name, isSkinInitial, "Rlse:", skin.content.length, "Blog:", skinCode.length, skin.status);
            });

            vm.releaseChecked = true;
        }, function(){ // error: at least one skin read failed
            toastr.error("Mindestens ein Skin konnte nicht fehlerfrei gelesen werden!", vm.param.msgHeader);
        });
    };

    vm.checkReleaseUpdate = function(){

        vm.isChecking = true;
        vm.releaseLoaded = true;
        vm.releaseChecked = false;

        UpdateCheck.verify(vm.param).then(
            function(release){
                vm.release = release.data;
                vm.newVersion = release.newVersion;
                vm.msgClose = false;
                vm.param.update.lastCheck = new Date();
                vm.isChecking = false;
                if (vm.newVersion) vm.checkSkinUpdate();
            },
            function(status){
                vm.isChecking = vm.releaseLoaded = vm.msgClose = false;
            });

    };

    vm.updateStatus = function(skinStatus){

        var updStatus = {
                "unchecked":    "noch nicht geprüft",
                "isequal":      "ist bereits aktuell",
                "needsupdate":  "wird aktualisiert",
                "updated":      "wurde erfolgreich aktualisiert",
                "error":        "Aktualisierung fehlgeschlagen",
                "skipped":      "Benutzerskin bleibt unverändert"
            },
            statParts = skinStatus.split("~");

        return updStatus[statParts[0]]+(statParts.length>1 ? "->"+statParts[1] : "");

    };

    vm.installRelease = function(){

        $.each( vm.release.skins, function(){
            var skin = this;
            if (skin.status === "needsupdate"){
                TwodaySkin.update(skin, vm.param).then(function(skin){
                    // success: skin.status already updated
                }, function(status, skin){
                    // error: skin.status already updated
                });
            }
        });

    };

};

},{}],10:[function(require,module,exports){
'use strict';

var background = require('../background.js'),
    utils = require('../utils.js');

module.exports = function($rootScope, ImageProvider, $window, toastr){
    
    var vm = this;
    
    vm.param = $rootScope.param;

    vm.positions = [
        "left top", "left center", "left bottom",
        "right top", "right center", "right bottom",
        "center top", "center center", "center bottom"
    ];

    vm.repeats = [ "repeat", "repeat-x", "repeat-y", "no-repeat" ];

    vm.sizes = [ "auto", "cover", "contain" ];

    vm.attachments = [ "fixed", "local", "scroll" ];

    vm.isEditMode = vm.isCreateMode = vm.isQueryImage = false;

    vm.slotCheck = function(){
        var slots=vm.param.timeSlots, slotEnd=-1, status=(slots.length>0 ? "" : "Keine Hintergrund-Zeitfenster vorhanden!");
        $.each( vm.param.timeSlots, function(){
            //console.log("from: "+utils.getMinute(this.from)+" slotEnd: "+slotEnd+" ("+(slotEnd+1)+")");
            if (utils.getMinute(this.from)!==slotEnd+1){
                status = (slotEnd<0
                       ? "Die Zeitangabe beginnt nicht bei 00:00 Uhr!"
                       : "Es besteht eine Zeitlücke bei "+utils.formatTime(this.from)+" Uhr!");
                return false;
            } else slotEnd = utils.getMinute(this.to);
        });
        if (status.length===0 && slotEnd!==23*60+59) status = "Die Zeitangabe endet nicht bei 23:59 Uhr!";
        vm.slotStatusOK = (status.length===0);
        vm.slotStatus = (vm.slotStatusOK ? "Alle Hintergrund-Zeitfenster vollständig definiert." : status);
    };

    vm.edit = function(index){
        vm.slot = angular.copy(vm.param.timeSlots[index]);
        vm.index = index;
        vm.isEditMode = true;
    };

    vm.cancel = function(){
        if (vm.isCreateMode) delete vm.slot;
        vm.isEditMode = vm.isCreateMode = false;
    };

    vm.save = function(){
        if (vm.isCreateMode) vm.insert(); else vm.update();
        background.setImage(vm.param.timeSlots);
        vm.slotCheck();
        vm.isEditMode = vm.isCreateMode = false;
    };

    vm.sort = function(){
        vm.param.timeSlots.sort( function(a,b){ return utils.getMinute(a.from) - utils.getMinute(b.from); });
    };

    vm.findFirst = function(cbSelectCondition){
        var slots = vm.param.timeSlots, selectedIndex = -1;
        $.each( slots, function(index, slot){
            if (cbSelectCondition(slot)){
                selectedIndex = index;
                return false;
            }
        });
        return selectedIndex;
    };

    vm.insert = function(){
//----- Get the currently defined timeslots
        var slots = vm.param.timeSlots, slot, sIdx = 0, clone = null;
//----- Delete all old slots that are encompassed/embedded by the new slot
        while (sIdx<slots.length){
            slot = slots[sIdx];
            if (slot.from>=vm.slot.from && slot.to<=vm.slot.to)
                vm.remove(sIdx, "nocheck");
            else
                sIdx++;
        }
//----- Find the first slot where new-fromTime is included
        sIdx = vm.findFirst(function(thisSlot){ return (vm.slot.from<thisSlot.to); });
        if (sIdx>=0){
            if (vm.slot.from>slots[sIdx].from && vm.slot.to<slots[sIdx].to){
                clone = angular.copy(slots[sIdx]);
                clone.from = utils.addMinutes(vm.slot.to, +1);
                slots[sIdx].to = utils.addMinutes(vm.slot.from, -1);
            } else if (vm.slot.from<=slots[sIdx].from && vm.slot.to<slots[sIdx].to){
                slots[sIdx].from = utils.addMinutes(vm.slot.to, +1);
            } else if (vm.slot.to>=slots[sIdx].to){
                slots[sIdx].to = utils.addMinutes(vm.slot.from, -1);
                if (slots.length>sIdx+1) slots[sIdx+1].from = utils.addMinutes(vm.slot.to, +1);
            }
        }
//----- Push the new slot to the array
        slots.push(vm.slot);
//----- Push the clone slot to the array if there is one
        if (clone!==null) slots.push(clone);
//----- and re-sort
        vm.sort();
    };

    vm.update = function(){
        vm.param.timeSlots[vm.index] = vm.slot;
        vm.sort();
    };

    vm.remove = function(index, nocheck){
//----- Get the currently defined timeslots
        var slots = vm.param.timeSlots;
//----- If index to delete is not the first, then consolidate times with preceeding timeslot
        if (index>0) slots[index-1].to = slots[index].to;
//----- If index is the first and there is a succeeding timeslot, consolidate with succeeding timeslot
        else if (slots.length>1) slots[1].from = slots[0].from;
//----- anyway delete this index now
        slots.splice(index, 1);
//----- and re-check the slots status unless internal call from insert function
        if (nocheck || '' !== 'nocheck') vm.slotCheck();
    };

    vm.create = function(){
        vm.slot = {
              "from": new Date(1970,0,1,0,0,0), "to": new Date(1970,0,1,23,59,0),
              "repeat": "no-repeat", "position": "center top", "size": "cover",
              "attachment": "fixed", "href": vm.param.site.imgFolder };
        vm.isCreateMode = true;
    };

    vm.usePosition = function(index){
        vm.slot.position = vm.positions[index];
    };

    vm.useRepeat = function(index){
        vm.slot.repeat = vm.repeats[index];
    };

    vm.useSize = function(index){
        vm.slot.size = vm.sizes[index];
    };

    vm.useAttachment = function(index){
        vm.slot.attachment = vm.attachments[index];
    };

    vm.navImagePool = {
        providers: [
            {
                name: 'Unsplash',
                file: 'unsplash.json',
                append: function(target, srcRatio){
                    var w, h;
                    switch (target){
                        case 'gallery': w=300; h=200; break;
                        case 'fullscreen': w=$window.screen.width; h=$window.screen.height; break;
                        case 'background': w=1920; h=Math.round(1920/srcRatio); break;
                    }
                    return '?fm=jpg&q=75&w='+w+'&h='+h+'&fit=crop';
                }
            },
            {
                name: "Picjumbo",
                file: 'picjumbo.json',
                append: function(target, srcRatio){
                    return '';
                }
            }
        ],
        provider: {},
        images: [],
        page: -1,
        lastPage: 0,
        pageSize: 24,
        pageImages: [],
        isLoadingImages: false,
        isFirstPage: function(){ return this.page === 0; },
        isLastPage: function(){ return this.page === this.lastPage; },
        useProvider: function(index){ this.provider = this.providers[index]; this.loadImages(); },
        nextPage: function(){ ++this.page; this.showImages(); },
        prevPage: function(){ --this.page; this.showImages(); },
        toFirstPage: function(){ this.page=0; this.showImages(); },
        toLastPage: function(){ this.page=this.lastPage; this.showImages(); },
        viewImage: function(index){
            var i = this.page*this.pageSize,
                j = Math.min(i+this.pageSize, this.images.length),
                swipeImages = [];
            while (i<j){
                swipeImages.push({ href: this.images[i]['img_url']+this.provider.append('fullscreen') });
                ++i;
            }
            $.swipebox( swipeImages, {useSVG: false, initialIndexOnArray: index} );
        },
        selectImage: function(index){
            var i = this.page*this.pageSize+index,
                ratio = (typeof this.images[i].ratio !== 'undefined' ? this.images[i].ratio : 1.5);
            vm.slot.href = this.images[i]['img_url']+this.provider.append('background', ratio);
            vm.isQueryImage = false;
        },
        showImages: function(){
            var i = this.page*this.pageSize,
                j = Math.min(i+this.pageSize, this.images.length);
            this.pageImages.length = 0;
            while (i<j){
                this.pageImages.push({
                    'background-image': 'url("'+this.images[i]['img_url']+this.provider.append('gallery')+'")'
                });
                ++i;
            }
        },
        loadImages: function(){
            var self = this;
            self.isLoadingImages = true;
            self.images.length = 0;
            self.pageImages.length = 0;
            self.page = 0;
            ImageProvider.load(vm.param.update.releaseUrl+self.provider.file).then(
                function(data){
                    self.images = data || [];
                    self.lastPage = (self.images.length===0 ? 0 : Math.floor((self.images.length-1)/self.pageSize));
                    self.showImages();
                    self.isLoadingImages = false;
                },
                function(data, status){
                    toastr.error("Fehler beim Lesen der Bilddaten von "+self.provider+", Status: "+status, vm.param.msgHeader);
                    self.lastPage = 0;
                    self.isLoadingImages = false;
                }
            );
        }
    };

    vm.queryImage = function(){
        vm.isQueryImage = true;
        if (vm.navImagePool.page<0) vm.navImagePool.useProvider(0);
    };

    vm.slotCheck();

};
},{"../background.js":7,"../utils.js":23}],11:[function(require,module,exports){
'use strict';

module.exports = function($rootScope){

    var vm = this;
    
    vm.param = $rootScope.param;

    vm.setStaticFolder = function(){
        vm.param.site.imgFolder = vm.param.staticUrl + vm.param.userName + "/images/";
    };

    vm.testLoader = function(){
        $("#loader-wrapper").show(0).delay(3000).hide(0);
    };

};

},{}],12:[function(require,module,exports){
'use strict';

module.exports = function ($rootScope, $modalInstance){

    var vm = this;

    vm.param = $rootScope.param;

    vm.ok = function(){ $modalInstance.close(); };

    vm.cancel = function(){ $modalInstance.dismiss(); };

};

},{}],13:[function(require,module,exports){
'use strict';

var background = require('../background.js'),
    utils = require('../utils.js');

module.exports = function ($scope, $rootScope, Preferences, UpdateCheck, $window, $interval, $modal){
    
//- Define viewmodel as this
    var vm = this;

//- Get the consolidated preferences data (includes standard and user modified settings)
    vm.param = $rootScope.param = Preferences.get("consolidated");

//- Set background image based on time of the day and user defined image items/slots
    var UpdateBackgroundImage = function(){
        background.setImage(vm.param.timeSlots);
    };  UpdateBackgroundImage();

//- Install background image check routine to be called every 5 seconds
    var checkBackgroundTimer = $interval( UpdateBackgroundImage, 5000 );

//- Make sure interval timer will be removed once controller gets destroyed
    $scope.$on('$destroy', function(){
        $interval.cancel(checkBackgroundTimer);
    });

//- Set default value for topics.text if user has not provided one
    if (vm.param.topbar.menuItems.topics.text.length===0)
        vm.param.topbar.menuItems.topics.text = vm.param.siteAlias.toLowerCase();

//- Adjust topics.class if topiclist-macro has found/generated any story topics
    vm.param.topbar.menuItems.topics.drop = ($("#toolbarTopics").has(".dropdown"));

//- Extract breadcrumb/special menu links and put them into the scope
    vm.param.topbar.menuItems.breadcrumbs.items = utils.getBreadcrumbs();
    //console.dir(vm.param.topbar.menuItems.breadcrumbs.items);
    vm.param.topbar.menuItems.abo.items = utils.getSpecialMenu("#aboMenu");
    vm.param.topbar.menuItems.images.items = utils.getSpecialMenu("#imageMenu");

//- Add utility functions to be used in ng-functions (view)
    vm.param.isLoggedIn = function(){
        return (vm.param.userName.length>0);
    };
    vm.param.isAdmin = function(){
        return (vm.param.isLoggedIn() && vm.param.userRole()==="Administrator");
    };
    vm.param.isContributor = function(){
        return (vm.param.isLoggedIn() && (vm.param.userRole()==="Contributor" || vm.param.userRole()==="Administrator"));
    };
    vm.param.sendMail = function(){
        $window.location.href = utils.rot13(vm.param.topbar.mailIcon.href);
    };

//- When true (user clicked the close button), it triggers the fadeout of the response alert-box
    vm.msgClose = false;

    vm.customize = {

        hide: function(){ $('#f5container').fadeOut(); },

        show: function(){ $('#f5container').fadeIn(); },

        open: function(){
            var self = this;
            self.hide();
            var copyOfParam = $.extend(true, {}, vm.param);
            var modalCustomize = $modal.open({
                templateUrl:  "customizeBlogHtml", // in Site-ngTemplates.jade
                controller:   "CustomizeCtrl as customize",
                resolve: {},
                backdrop: "static",
                keyboard: false,
                windowClass: "xlarge"
            });
            modalCustomize.result.then(
                function(){ // User confirmed change
                    if (!angular.equals(copyOfParam, vm.param)) Preferences.save(vm.param);
                    self.show();
                },
                function(){ // User cancelled change
                    if (!angular.equals(copyOfParam, vm.param)) vm.param = copyOfParam;
                    self.show();
                });
        }
    };

//- Check for available updates if user is admin and check frequency is not "never"
    if (vm.param.isAdmin() && vm.param.update.gap>0){
        UpdateCheck.onLoad(vm.param);
    }
};
},{"../background.js":7,"../utils.js":23}],14:[function(require,module,exports){
(function (global){
'use strict';

/**
 * Browserify all controllers
 *
 */

(typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null)
    .module('f5SkinApp')
    .controller('F5MainCtrl', ['$scope', '$rootScope', 'Preferences', 'UpdateCheck', '$window', '$interval', '$modal', require('./F5MainCtrl')])
    .controller('CustomizeCtrl', ['$rootScope', '$modalInstance', require('./CustomizeCtrl')])
    .controller('CustCoreDataCtrl', ['$rootScope', require('./CustCoreDataCtrl')])
    .controller('CustBackgroundsCtrl', ['$rootScope', 'ImageProvider', '$window', 'toastr', require('./CustBackgroundsCtrl')])
    .controller('CustAppUpdateCtrl', ['$rootScope', '$filter', '$q', 'UpdateCheck', 'TwodaySkin', 'toastr', require('./CustAppUpdateCtrl')]);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./CustAppUpdateCtrl":9,"./CustBackgroundsCtrl":10,"./CustCoreDataCtrl":11,"./CustomizeCtrl":12,"./F5MainCtrl":13}],15:[function(require,module,exports){
(function (global){
'use strict';

/**
 * Browserify all directives
 *
 */

(typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null)
    .module('f5SkinApp')
    .directive('resizable', ['$window', require('./resizable')]);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./resizable":16}],16:[function(require,module,exports){
'use strict';

module.exports = function($window){

    return {
        restrict: 'A',
        controller: function ($scope, $element) {

            var resizePhotoContainer = function(){
                $scope.width = $element.width();
                $scope.height = Math.round($scope.width/1.5);
                $element.css('height', $scope.height+'px');
            };

            angular.element($window).bind('resize', resizePhotoContainer);

            resizePhotoContainer();

        }
    }
};
},{}],17:[function(require,module,exports){
'use strict';

module.exports = function($cacheFactory, item){

    return $cacheFactory(item);

};
},{}],18:[function(require,module,exports){
'use strict';

module.exports = function($http, $q){

    return {

        load: function(url){

            var q = $q.defer();

            $http.get( url )

                .success(function(data) { q.resolve(data); })
                .error(function(data, status){ q.reject([], status); });

            return q.promise;

        }
    };
};
},{}],19:[function(require,module,exports){
'use strict';

var jsondiff = require('rfc6902-json-diff'),
    utils = require('../utils.js');

module.exports = function(CacheItem, TwodaySkin, toastr){

    return {
        //-- type: "standard" or "consolidated" (incl. usrPreferences)
        get: function(type){

            //- Read preferences from cache
            var cachedPreferences = CacheItem.get(type+'Preferences');

            //- Have they been cached before?
            if (cachedPreferences){
                return cachedPreferences;
            } else {

                //- Consolidate (deep merge) standardPreferences, userPreferences and generic core info from Twoday macros
                var stdPreferences = JSON.parse($("#stdPreferences").text() || "{}"),
                    usrPreferences = (type === "consolidated" ? JSON.parse($("#usrPreferences").text() || "{}") : {}),
                    preferences = $.extend( true, {}, stdPreferences, usrPreferences, window.f5CoreInfo );

                //- Parse stringified/converted dates and re-convert to true date format
                preferences.update.lastCheck = new Date(Date.parse(preferences.update.lastCheck));
                $.each(preferences.timeSlots, function () {
                    this.from = new Date(1970, 0, 1, (this.from / 60 >> 0), (this.from % 60), 0);
                    this.to = new Date(1970, 0, 1, (this.to / 60 >> 0), (this.to % 60), 0);
                });

                //- Put preferences into cache area
                CacheItem.put(type+'Preferences', preferences);

                //- and return the preferences object
                return preferences;

            }

        },

        refactor: function(param){

            var prefs = {};
            $.extend( true, prefs, param );
            $.each(prefs.timeSlots, function () {
                this.from = utils.getMinute(this.from);
                this.to = utils.getMinute(this.to);
                if (typeof this.$$hashKey !== 'undefined') delete(this.$$hashKey);
            });
            return prefs;

        },

        save: function(param){

            var stdPreferences = this.get("standard"),
                usrPreferences = {},
                cleanParam = this.refactor(param),
                patch = jsondiff(stdPreferences, param),
                excludes = '$$|topics/drop|breadcrumbs/items|images/items|abo/items'.split('|'),
                i, len, names, objPath, arrayCheck;

            //- save consolidated param as well to the cache
            CacheItem.put('consolidatedPreferences', param);

            //console.dir(patch);
            $.each( patch, function(){

                //- do not include functions whatsoever
                if (typeof this.value === "function") return true;

                //- test for excludes to be ignored
                for (i=0, len=excludes.length; i<len; ++i){
                    if (this.path.indexOf(excludes[i])>=0) return true;
                }

                //- eliminate 1st slash and split path into field names (e.g. "/site/title" --> ["site", "title"])
                names = this.path.substr(1).split('/');
                objPath = 'usrPreferences';
                for (i=0, len=names.length; i<len; ++i){
                    objPath += '.'+names[i];
                    if (i+1 === len){
                        if (typeof this.value.$$hashKey !== 'undefined') delete(this.value.$$hashKey);
                        eval(objPath+'=this.value');
                    } else {
                        arrayCheck = 'cleanParam.'+objPath.substr(15);
                        if (eval('angular.isArray('+arrayCheck+')')){
                            if (eval('typeof ' + objPath) === 'undefined'){
                                eval(objPath+'='+arrayCheck);
                            }
                            return true;
                        } else {
                            if (eval('typeof ' + objPath) === 'undefined') {
                                eval(objPath + '={}');
                            }
                        }
                    }
                }
            });

            TwodaySkin.update(
                { name: "Site.usrPreferences", content: angular.toJson(usrPreferences, true), status: "unsaved"},
                param
            ).then( function(skin){
                // success: no user message needed
            }, function(status, skin){
                toastr.error("Skin: '"+skin.name+"' konnte nicht erfolgreich aktualisiert werden (Status: "+status+").", param.msgHeader);
            });

        }
    }

};
},{"../utils.js":23,"rfc6902-json-diff":2}],20:[function(require,module,exports){
'use strict';

module.exports = function($http, $q){

    return {

        get: function(url){

            /**
             * @param url: Twoday url to read
             * @returns: $http: promise
             *
             */

            return $http.get(url);

        },

        update: function(skin, param){

            /**
             * @param skin: object, at minimum holds the following props
             *      name: Name of the skin to be updated, e.g. "Site.usrPreferences"
             *      content: Content that shall be written to the skin
             *      status: Status field
             * @param param: holds the consolidated preferences
             * @returns status: string "updated" or "error~xxx" in skin.status
             *
             */

            var q = $q.defer();

            $http.get( param.layoutUrl+"skins/edit?key="+skin.name )

                .success(function(data){
                    var $form = $(data).find("form").eq(0);

                    $http({
                        method: $form.attr("method"),
                        url: $form.attr("action"),
                        headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'},
                        data: $.param({
                            secretKey: $form.find("input[name=secretKey]").val(),
                            action: $form.find("input[name=action]").val(),
                            key: $form.find("input[name=key]").val(),
                            skinset: $form.find("input[name=skinset]").val(),
                            module: $form.find("input[name=module]").val(),
                            title: $form.find("input[name=title]").val(),
                            description: $form.find("textarea[name=description]").html(),
                            skin: skin.content,
                            save: $form.find("input[name=save]").val()
                        })
                    })

                    .success(function(){
                        skin.status = "updated";
                        q.resolve(skin);
                    })

                    .error(function(data, status){
                        skin.status = "error~"+status;
                        q.reject(status, skin);
                    });
                })

                .error(function(data, status){
                    skin.status = "error~"+status;
                    q.reject(status, skin);
                });

            return q.promise;

        }
    };
};
},{}],21:[function(require,module,exports){
'use strict';

var utils = require('../utils.js');

module.exports = function($http, $q, Preferences, toastr){

    return {

        onLoad: function(param){

            if (param.update.lastCheck.getTime()+param.update.gap < Date.now()){
                console.log("lastCheck:", param.update.lastCheck, param.update.lastCheck.getTime(), "Gap:", param.update.gap, "Now:", Date.now());
                param.update.lastCheck = new Date();
                Preferences.save(param);
                this.verify(param).then(
                    function(release){
                        if (release.newVersion){
                            toastr.info('Es ist eine neuere Version der Blog-App verfügbar! Sie können diese über '+
                                '<i class="fa fa-cogs"></i> und <strong>Aktualisierung</strong> herunterladen.',
                                param.msgHeader);
                        }
                    },
                    function(status){
                        toastr.error('Fehler während der Überprüfung auf eine neuere App-Version: '+status,
                                param.msgHeader);
                    }
                );
            }

        },

        verify: function(param){

            var q = $q.defer();

            $http.get(param.update.releaseUrl + "releaseinfo.xml")
            .success(function (data){
                var release = utils.getRelease($(data)),
                    newVersion = (utils.parseVersion(release.version) > utils.parseVersion(param.update.version));
                q.resolve({ 'data': release, 'newVersion': newVersion });
            })
            .error(function (data, status){
                q.reject(status);
            });

            return q.promise;

        }
    };
};
},{"../utils.js":23}],22:[function(require,module,exports){
(function (global){
'use strict';

/**
 * Browserify all services
 *
 */

(typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null)
    .module('f5SkinApp')
    .factory('CacheItem', ['$cacheFactory', require('./CacheItem')])
    .factory('ImageProvider', ['$http', '$q', require('./ImageProvider')])
    .factory('TwodaySkin', ['$http', '$q', require('./TwodaySkin')])
    .factory('Preferences', ['CacheItem', 'TwodaySkin', 'toastr', require('./Preferences')])
    .factory('UpdateCheck', ['$http', '$q', 'Preferences', 'toastr', require('./UpdateCheck')]);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./CacheItem":17,"./ImageProvider":18,"./Preferences":19,"./TwodaySkin":20,"./UpdateCheck":21}],23:[function(require,module,exports){
"use strict";

/**
 * Provides a set of utility functions
 *
 */

module.exports = {

//- Converts selected DOM links to an array of link objects (href,text)
    linksToObjects: function(selector){
        var linkObjects = [];
            $(selector).each( function(){
                linkObjects.push({ "href": this.href, "text": this.innerText });
            });
        return linkObjects;
    },

//- Extract breadcrumbs-links out of Twoday's modToolbarNavigationpath-macro and return as an array of link objects
    getBreadcrumbs: function(){
        return this.linksToObjects("#breadcrumbsMenu >a:not([id])");
    },

//- Get special menu items (imageMenu/aboMenu) as an array of link objects
    getSpecialMenu: function(menuID){
        return this.linksToObjects(menuID+" a");
    },

//- Pimp server generated Twoday classes to enforce Foundation style
    pimpClasses: function(){
        $(".message .button").addClass("secondary tiny radius");
    },

//- Rotation13 method used to obfuscate email-address
    rot13: function(s){
        return s.replace(/[a-zA-Z]/g, function(c){
            return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
        });
    },

//- Gets minutes from a given date
    getMinute: function(date){
        return date.getHours()*60+date.getMinutes();
    },

//- Adds/Subtracts minutes from a given date (add: minutes>0, subtract: minutes<0)
    addMinutes: function(date, minutes){
        var newTime = this.getMinute(date) + minutes;
        return new Date(1970,0,1,(newTime/60>>0),(newTime % 60),0);
    },

//- Formats time string to "hh:mm"
    formatTime: function(date){
        return ("0"+date.getHours()).slice(-2)+":"+("0"+date.getMinutes()).slice(-2);
    },

//- Converts string-version ("1.2.3") to a comparable int (123)
    parseVersion: function(version){
        return parseInt(version.replace(/\./g,""), 10);
    },

//- Parse CRC32 value from the skin's top line
    parseCRC: function(chars){
        var crc32 = chars.match(/CRC32:.(.*)[ ]/);
        return (crc32 !== null ? parseInt(crc32[1], 10) : -1);
    },

//- Extract header data and skin information from releaseinfo.xml
    getRelease: function($data){
        var release = {
            version: $data.find("version").text(),
            author: $data.find("author").text(),
            releasedate: new Date(Date.parse($data.find("releasedate").text())),
            skins: []
        };
        $data.find("skin").each( function(){
            var self = $(this),
                skinName = self.attr("key"),
                dateSourceWasUpdated = new Date(Date.parse(self.attr("lastupdate"))),
                skinCRC = self.attr("crc"),
                skinContent = self.find("content").text();
            release.skins.push({
                name: skinName,
                update: dateSourceWasUpdated,
                crc32: skinCRC,
                content: $.trim(skinContent),
                status: "unchecked"
            });
        });
        return release;
    }

};
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwL2FwcC5qcyIsIm5vZGVfbW9kdWxlcy9yZmM2OTAyLWpzb24tZGlmZi9saWIvZGlmZi5qcyIsIm5vZGVfbW9kdWxlcy9yZmM2OTAyLWpzb24tZGlmZi9saWIvbGV2ZW5zaHRlaW4uanMiLCJub2RlX21vZHVsZXMvcmZjNjkwMi1qc29uLWRpZmYvbm9kZV9tb2R1bGVzL2pzb24tcG9pbnRlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZmM2OTAyLWpzb24tZGlmZi9ub2RlX21vZHVsZXMvanNvbi1wb2ludGVyL25vZGVfbW9kdWxlcy9mb3JlYWNoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JmYzY5MDItanNvbi1kaWZmL25vZGVfbW9kdWxlcy9sb2Rhc2gvZGlzdC9sb2Rhc2guanMiLCJzcmMvanMvYXBwL2JhY2tncm91bmQuanMiLCJzcmMvanMvYXBwL2JvZHljbGFzcy5qcyIsInNyYy9qcy9hcHAvY29udHJvbGxlcnMvQ3VzdEFwcFVwZGF0ZUN0cmwuanMiLCJzcmMvanMvYXBwL2NvbnRyb2xsZXJzL0N1c3RCYWNrZ3JvdW5kc0N0cmwuanMiLCJzcmMvanMvYXBwL2NvbnRyb2xsZXJzL0N1c3RDb3JlRGF0YUN0cmwuanMiLCJzcmMvanMvYXBwL2NvbnRyb2xsZXJzL0N1c3RvbWl6ZUN0cmwuanMiLCJzcmMvanMvYXBwL2NvbnRyb2xsZXJzL0Y1TWFpbkN0cmwuanMiLCJzcmMvanMvYXBwL2NvbnRyb2xsZXJzL2luZGV4LmpzIiwic3JjL2pzL2FwcC9kaXJlY3RpdmVzL2luZGV4LmpzIiwic3JjL2pzL2FwcC9kaXJlY3RpdmVzL3Jlc2l6YWJsZS5qcyIsInNyYy9qcy9hcHAvc2VydmljZXMvQ2FjaGVJdGVtLmpzIiwic3JjL2pzL2FwcC9zZXJ2aWNlcy9JbWFnZVByb3ZpZGVyLmpzIiwic3JjL2pzL2FwcC9zZXJ2aWNlcy9QcmVmZXJlbmNlcy5qcyIsInNyYy9qcy9hcHAvc2VydmljZXMvVHdvZGF5U2tpbi5qcyIsInNyYy9qcy9hcHAvc2VydmljZXMvVXBkYXRlQ2hlY2suanMiLCJzcmMvanMvYXBwL3NlcnZpY2VzL2luZGV4LmpzIiwic3JjL2pzL2FwcC91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2xvTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xyXG4odHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy4kIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC4kIDogbnVsbCk7XHJcblxyXG52YXIgYW5ndWxhciA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LmFuZ3VsYXIgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLmFuZ3VsYXIgOiBudWxsKSxcclxuICAgIGJvZHljbGFzcyA9IHJlcXVpcmUoJy4vYm9keWNsYXNzLmpzJyksXHJcbiAgICB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMuanMnKTtcclxuXHJcbi8vLS0tIEFkZCBhZGRpdGlvbmFsIGJvZHkgY2xhc3NlcyBmb3IgaW5kaXZpZHVhbGl6ZWQgQ1NTIHJ1bGVzXHJcbmJvZHljbGFzcygpO1xyXG5cclxuLy8tLS0gUGltcCBvbGQgVHdvZGF5IGNsYXNzZXMsIGUuZy4gYnV0dG9uIGluIGEgLm1lc3NhZ2VcclxudXRpbHMucGltcENsYXNzZXMoKTtcclxuXHJcbi8vLS0tIFNldCB1cCB0aGUgQW5ndWxhciBhcHAsIE1vZGVybml6ciBjb25zdGFudCBhbmQgcnVuIHRoZSBGYXN0Q2xpY2sganNcclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnZjVTa2luQXBwJywgWydtbS5mb3VuZGF0aW9uJywgJ3RvYXN0ciddKVxyXG4gICAgLmNvbmZpZyhmdW5jdGlvbih0b2FzdHJDb25maWcpe1xyXG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHRvYXN0ckNvbmZpZywge1xyXG4gICAgICAgICAgICBhbGxvd0h0bWw6IHRydWUsXHJcbiAgICAgICAgICAgIGNsb3NlQnV0dG9uOiB0cnVlLFxyXG4gICAgICAgICAgICBwcm9ncmVzc0JhcjogdHJ1ZSxcclxuICAgICAgICAgICAgdGltZU91dDogODAwMFxyXG4gICAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIC5jb25zdGFudCgnTW9kZXJuaXpyJywgd2luZG93Lk1vZGVybml6cilcclxuICAgIC5ydW4oIGZ1bmN0aW9uKCl7IHdpbmRvdy5GYXN0Q2xpY2suYXR0YWNoKGRvY3VtZW50LmJvZHkpOyB9KTtcclxuXHJcbi8vLS0tIFJlcXVpcmUgYWxsIHNlcnZpY2VzLCBjb250cm9sbGVycyBhbmQgZGlyZWN0aXZlcyB0aHJvdWdoIHRoZWlyIGZvbGRlcidzIGluZGV4LmpzXHJcbnJlcXVpcmUoJy4vc2VydmljZXMnKTtcclxucmVxdWlyZSgnLi9jb250cm9sbGVycycpO1xyXG5yZXF1aXJlKCcuL2RpcmVjdGl2ZXMnKTsiLCJ2YXIgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG52YXIgcG9pbnRlciA9IHJlcXVpcmUoXCJqc29uLXBvaW50ZXJcIik7XG52YXIgbGV2ZW5zaHRlaW4gPSByZXF1aXJlKFwiLi9sZXZlbnNodGVpblwiKTtcblxuLyoqXG4gKiBCYWNrdHJhY2UgYW4gb3B0aW1hbCBwYXRoIHRocm91Z2ggYSBsZXZlbnNodGVpbiBkaXN0YW5jZSBtYXRyaXguXG4gKlxuICogQHJldHVybnMge0FycmF5fSBMaXN0IG9mIG9wZXJhdGlvbnNcbiAqL1xuZnVuY3Rpb24gbWF0cml4VG9PcGVyYXRpb25zIChtYXRyaXgsIGksIGopIHtcbiAgaWYgKGkgPT09IDAgJiYgaiA9PT0gMCkge1xuICAgIHJldHVybiBbXTtcbiAgfSBlbHNlIGlmIChpID09PSAwKSB7XG4gICAgcmV0dXJuIG1hdHJpeFRvT3BlcmF0aW9ucyhtYXRyaXgsIGksIGogLSAxKS5jb25jYXQoXCJhZGRcIik7XG4gIH0gZWxzZSBpZiAoaiA9PT0gMCkge1xuICAgIHJldHVybiBtYXRyaXhUb09wZXJhdGlvbnMobWF0cml4LCBpIC0gMSwgaikuY29uY2F0KFwicmVtb3ZlXCIpO1xuICB9IGVsc2Uge1xuICAgIHZhciBsZWZ0ID0gbWF0cml4W2ldW2ogLSAxXTtcbiAgICB2YXIgdXAgPSBtYXRyaXhbaSAtIDFdW2pdO1xuICAgIHZhciB1cGxlZnQgPSBtYXRyaXhbaSAtIDFdW2ogLSAxXTtcblxuICAgIGlmICh1cGxlZnQgPD0gdXAgJiYgdXBsZWZ0IDw9IGxlZnQpIHtcbiAgICAgIGlmICh1cGxlZnQgPT09IG1hdHJpeFtpXVtqXSkge1xuICAgICAgICByZXR1cm4gbWF0cml4VG9PcGVyYXRpb25zKG1hdHJpeCwgaSAtIDEsIGogLSAxKS5jb25jYXQoXCJlcVwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBtYXRyaXhUb09wZXJhdGlvbnMobWF0cml4LCBpIC0gMSwgaiAtIDEpLmNvbmNhdChcInJlcGxhY2VcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChsZWZ0IDw9IHVwbGVmdCAmJiBsZWZ0IDw9IHVwKSB7XG4gICAgICByZXR1cm4gbWF0cml4VG9PcGVyYXRpb25zKG1hdHJpeCwgaSwgaiAtIDEpLmNvbmNhdChcImFkZFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG1hdHJpeFRvT3BlcmF0aW9ucyhtYXRyaXgsIGkgLSAxLCBqKS5jb25jYXQoXCJyZW1vdmVcIik7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGRpZmYgKGZyb20sIHRvKSB7XG4gIHZhciBvcHMgPSBbXTtcblxuICBpZiAoXy5pc0VxdWFsKGZyb20sIHRvKSkge1xuICAgIHJldHVybiBbXTtcbiAgfSBlbHNlIGlmIChfLmlzUGxhaW5PYmplY3QoZnJvbSkgJiYgXy5pc1BsYWluT2JqZWN0KHRvKSkge1xuICAgIHZhciBrZXlzID0gXy51bmlvbihfLmtleXMoZnJvbSksIF8ua2V5cyh0bykpO1xuXG4gICAgb3BzID0ga2V5cy5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgdmFyIGhhc0Zyb20gPSBmcm9tLmhhc093blByb3BlcnR5KGtleSk7XG4gICAgICB2YXIgaGFzVG8gPSB0by5oYXNPd25Qcm9wZXJ0eShrZXkpO1xuXG4gICAgICBpZiAoaGFzRnJvbSAmJiBoYXNUbykge1xuICAgICAgICB2YXIgZCA9IGRpZmYoZnJvbVtrZXldLCB0b1trZXldKTtcblxuICAgICAgICByZXR1cm4gZC5tYXAoZnVuY3Rpb24gKG9wKSB7XG4gICAgICAgICAgb3AucGF0aC51bnNoaWZ0KGtleSk7XG5cbiAgICAgICAgICByZXR1cm4gb3A7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmIChoYXNGcm9tKSB7XG4gICAgICAgIHJldHVybiB7IG9wOiBcInJlbW92ZVwiLCBwYXRoOiBba2V5XSB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHsgb3A6IFwiYWRkXCIsIHBhdGg6IFtrZXldLCB2YWx1ZTogdG9ba2V5XSB9O1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIF8uZmxhdHRlbihvcHMsIHRydWUpO1xuICB9IGVsc2UgaWYgKF8uaXNBcnJheShmcm9tKSAmJiBfLmlzQXJyYXkodG8pKSB7XG4gICAgdmFyIG1hdHJpeCA9IGxldmVuc2h0ZWluKGZyb20sIHRvKTtcbiAgICBvcHMgPSBbXTtcblxuICAgIGlmIChtYXRyaXgpIHtcbiAgICAgIHZhciBtID0gbWF0cml4Lmxlbmd0aDtcbiAgICAgIHZhciBuID0gbWF0cml4WzBdLmxlbmd0aDtcbiAgICAgIHZhciBpID0gMDtcbiAgICAgIHZhciBqID0gMDtcbiAgICAgIHZhciBvID0gbWF0cml4VG9PcGVyYXRpb25zKG1hdHJpeCwgbSAtIDEsIG4gLSAxKTtcblxuICAgICAgby5mb3JFYWNoKGZ1bmN0aW9uIChvcCkge1xuICAgICAgICBpZiAob3AgPT0gXCJhZGRcIikge1xuICAgICAgICAgIG9wcy5wdXNoKHsgb3A6IFwiYWRkXCIsIHBhdGg6IFtqXSwgdmFsdWU6IHRvW2pdIH0pO1xuICAgICAgICAgIGorKztcbiAgICAgICAgfSBlbHNlIGlmIChvcCA9PSBcInJlbW92ZVwiKSB7XG4gICAgICAgICAgb3BzLnB1c2goeyBvcDogXCJyZW1vdmVcIiwgcGF0aDogW2pdIH0pO1xuICAgICAgICAgIGkrKztcbiAgICAgICAgfSBlbHNlIGlmIChvcCA9PSBcInJlcGxhY2VcIikge1xuICAgICAgICAgIHZhciBvcGVyYXRpb25zID0gZGlmZihmcm9tW2ldLCB0b1tqXSk7XG5cbiAgICAgICAgICBvcHMgPSBvcHMuY29uY2F0KG9wZXJhdGlvbnMubWFwKGZ1bmN0aW9uIChvcCkge1xuICAgICAgICAgICAgb3AucGF0aC51bnNoaWZ0KGopO1xuXG4gICAgICAgICAgICByZXR1cm4gb3A7XG4gICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgaSsrO1xuICAgICAgICAgIGorKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpKys7XG4gICAgICAgICAgaisrO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3BzO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBbeyBvcDogXCJyZXBsYWNlXCIsIHBhdGg6IFtdLCB2YWx1ZTogdG8gfV07XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZnJvbSwgdG8pIHtcbiAgdmFyIG9wcyA9IGRpZmYoZnJvbSwgdG8pO1xuICBvcHMgPSBfLm1hcChvcHMsIGZ1bmN0aW9uIChvcCkge1xuICAgIG9wLnBhdGggPSBwb2ludGVyLmNvbXBpbGUob3AucGF0aC5tYXAoZnVuY3Rpb24gKHApIHsgcmV0dXJuIFwiXCIgKyBwOyB9KSk7XG5cbiAgICByZXR1cm4gb3A7XG4gIH0pO1xuXG4gIHJldHVybiBvcHM7XG59O1xuIiwidmFyIF8gPSByZXF1aXJlKFwibG9kYXNoXCIpO1xuXG4vLyBDb21wdXRlIHRoZSBsZXZlbnNodGVpbiBlZGl0IGRpc3RhbmNlIG1hdHJpeCBmb3IgdHdvIGxpc3RzLlxuLy9cbi8vIEl0IGNhbiBiZSB1c2VkIHRvIGluZmVyIHRoZSBjb25jcmV0ZSBlZGl0IG9wZXJhdGlvbnMgdG8gdHJhbnNmb3JtIHRoZSBmaXJzdFxuLy8gbGlzdCBpbnRvIHRoZSBzZWNvbmQuXG4vL1xuLy8gUmV0dXJucyBhbiBtKm4gbWF0cml4LCB3aGVyZSB0aGUgKGksIGopIGNlbGwgY29udGFpbnMgdGhlIGxldmVuc2h0ZWluXG4vLyBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBpLWVsZW1lbnQgcHJlZml4IG9mIGZyb20gYW5kIHRoZSBqLWVsZW1lbnQgcHJlZml4IG9mIHRvLlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZnJvbSwgdG8pIHtcbiAgaWYgKF8uaXNFcXVhbChmcm9tLCB0bykpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZhciBtID0gZnJvbS5sZW5ndGg7XG4gIHZhciBuID0gdG8ubGVuZ3RoO1xuICB2YXIgZCA9IF8ucmFuZ2UoMCwgbSArIDEpLm1hcChmdW5jdGlvbiAoeCkge1xuICAgIHJldHVybiBbeF07XG4gIH0pO1xuXG4gIGRbMF0gPSBfLnJhbmdlKDAsIG4gKyAxKTtcblxuICBmb3IgKHZhciBpID0gMTsgaSA8PSBtOyBpKyspIHtcbiAgICBmb3IgKHZhciBqID0gMTsgaiA8PSBuOyBqKyspIHtcbiAgICAgIHZhciByZXBsYWNlbWVudENvc3QgPSAxO1xuXG4gICAgICBpZiAoXy5pc0VxdWFsKGZyb21baSAtIDFdLCB0b1tqIC0gMV0pKSB7XG4gICAgICAgIHJlcGxhY2VtZW50Q29zdCA9IDA7XG4gICAgICB9XG5cbiAgICAgIGRbaV1bal0gPSBfLm1pbihbZFtpIC0gMV1baiAtIDFdICsgcmVwbGFjZW1lbnRDb3N0LFxuICAgICAgICAgICAgICAgICAgICAgICBkW2kgLSAxXVtqXSArIDEsXG4gICAgICAgICAgICAgICAgICAgICAgIGRbaV1baiAtIDFdICsgMV0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBkO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVhY2ggPSByZXF1aXJlKCdmb3JlYWNoJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGFwaTtcblxuXG4vKipcbiAqIENvbnZlbmllbmNlIHdyYXBwZXIgYXJvdW5kIHRoZSBhcGkuXG4gKiBDYWxscyBgLmdldGAgd2hlbiBjYWxsZWQgd2l0aCBhbiBgb2JqZWN0YCBhbmQgYSBgcG9pbnRlcmAuXG4gKiBDYWxscyBgLnNldGAgd2hlbiBhbHNvIGNhbGxlZCB3aXRoIGB2YWx1ZWAuXG4gKiBJZiBvbmx5IHN1cHBsaWVkIGBvYmplY3RgLCByZXR1cm5zIGEgcGFydGlhbGx5IGFwcGxpZWQgZnVuY3Rpb24sIG1hcHBlZCB0byB0aGUgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSBvYmpcbiAqIEBwYXJhbSBwb2ludGVyXG4gKiBAcGFyYW0gdmFsdWVcbiAqIEByZXR1cm5zIHsqfVxuICovXG5cbmZ1bmN0aW9uIGFwaSAob2JqLCBwb2ludGVyLCB2YWx1ZSkge1xuICAgIC8vIC5zZXQoKVxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG4gICAgICAgIHJldHVybiBhcGkuc2V0KG9iaiwgcG9pbnRlciwgdmFsdWUpO1xuICAgIH1cbiAgICAvLyAuZ2V0KClcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICByZXR1cm4gYXBpLmdldChvYmosIHBvaW50ZXIpO1xuICAgIH1cbiAgICAvLyBSZXR1cm4gYSBwYXJ0aWFsbHkgYXBwbGllZCBmdW5jdGlvbiBvbiBgb2JqYC5cbiAgICB2YXIgd3JhcHBlZCA9IGFwaS5iaW5kKGFwaSwgb2JqKTtcblxuICAgIC8vIFN1cHBvcnQgZm9yIG9vIHN0eWxlXG4gICAgZm9yICh2YXIgbmFtZSBpbiBhcGkpIHtcbiAgICAgICAgaWYgKGFwaS5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgd3JhcHBlZFtuYW1lXSA9IGFwaVtuYW1lXS5iaW5kKHdyYXBwZWQsIG9iaik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHdyYXBwZWQ7XG59XG5cblxuLyoqXG4gKiBMb29rdXAgYSBqc29uIHBvaW50ZXIgaW4gYW4gb2JqZWN0XG4gKlxuICogQHBhcmFtIG9ialxuICogQHBhcmFtIHBvaW50ZXJcbiAqIEByZXR1cm5zIHsqfVxuICovXG5hcGkuZ2V0ID0gZnVuY3Rpb24gZ2V0IChvYmosIHBvaW50ZXIpIHtcbiAgICB2YXIgdG9rLFxuICAgICAgICByZWZUb2tlbnMgPSBhcGkucGFyc2UocG9pbnRlcik7XG4gICAgd2hpbGUgKHJlZlRva2Vucy5sZW5ndGgpIHtcbiAgICAgICAgdG9rID0gcmVmVG9rZW5zLnNoaWZ0KCk7XG4gICAgICAgIGlmICghb2JqLmhhc093blByb3BlcnR5KHRvaykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCByZWZlcmVuY2UgdG9rZW46ICcgKyB0b2spO1xuICAgICAgICB9XG4gICAgICAgIG9iaiA9IG9ialt0b2tdO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xufTtcblxuLyoqXG4gKiBTZXRzIGEgdmFsdWUgb24gYW4gb2JqZWN0XG4gKlxuICogQHBhcmFtIG9ialxuICogQHBhcmFtIHBvaW50ZXJcbiAqIEBwYXJhbSB2YWx1ZVxuICovXG5hcGkuc2V0ID0gZnVuY3Rpb24gc2V0IChvYmosIHBvaW50ZXIsIHZhbHVlKSB7XG4gICAgdmFyIHJlZlRva2VucyA9IGFwaS5wYXJzZShwb2ludGVyKSxcbiAgICAgICAgdG9rLFxuICAgICAgICBuZXh0VG9rID0gcmVmVG9rZW5zWzBdO1xuICAgIHdoaWxlIChyZWZUb2tlbnMubGVuZ3RoID4gMSkge1xuICAgICAgICB0b2sgPSByZWZUb2tlbnMuc2hpZnQoKTtcbiAgICAgICAgbmV4dFRvayA9IHJlZlRva2Vuc1swXTtcblxuICAgICAgICBpZiAoIW9iai5oYXNPd25Qcm9wZXJ0eSh0b2spKSB7XG4gICAgICAgICAgICBpZiAobmV4dFRvay5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgICAgICAgICAgICBvYmpbdG9rXSA9IFtdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvYmpbdG9rXSA9IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG9iaiA9IG9ialt0b2tdO1xuICAgIH1cbiAgICBvYmpbbmV4dFRva10gPSB2YWx1ZTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlcyBhbiBhdHRyaWJ1dGVcbiAqXG4gKiBAcGFyYW0gb2JqXG4gKiBAcGFyYW0gcG9pbnRlclxuICovXG5hcGkucmVtb3ZlID0gZnVuY3Rpb24gKG9iaiwgcG9pbnRlcikge1xuICAgIHZhciByZWZUb2tlbnMgPSBhcGkucGFyc2UocG9pbnRlcik7XG4gICAgdmFyIGZpbmFsVG9rZW4gPSByZWZUb2tlbnMucG9wKCk7XG4gICAgaWYgKGZpbmFsVG9rZW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgSlNPTiBwb2ludGVyIGZvciByZW1vdmU6IFwiJyArIHBvaW50ZXIgKyAnXCInKTtcbiAgICB9XG4gICAgZGVsZXRlIGFwaS5nZXQob2JqLCBhcGkuY29tcGlsZShyZWZUb2tlbnMpKVtmaW5hbFRva2VuXTtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIChwb2ludGVyIC0+IHZhbHVlKSBkaWN0aW9uYXJ5IGZvciBhbiBvYmplY3RcbiAqXG4gKiBAcGFyYW0gb2JqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBkZXNjZW5kXG4gKiBAcmV0dXJucyB7fVxuICovXG5hcGkuZGljdCA9IGZ1bmN0aW9uIGRpY3QgKG9iaiwgZGVzY2VuZCkge1xuICAgIHZhciByZXN1bHRzID0ge307XG4gICAgYXBpLndhbGsob2JqLCBmdW5jdGlvbiAodmFsdWUsIHBvaW50ZXIpIHtcbiAgICAgICAgcmVzdWx0c1twb2ludGVyXSA9IHZhbHVlO1xuICAgIH0sIGRlc2NlbmQpO1xuICAgIHJldHVybiByZXN1bHRzO1xufTtcblxuLyoqXG4gKiBJdGVyYXRlcyBvdmVyIGFuIG9iamVjdFxuICogSXRlcmF0b3I6IGZ1bmN0aW9uICh2YWx1ZSwgcG9pbnRlcikge31cbiAqXG4gKiBAcGFyYW0gb2JqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBpdGVyYXRvclxuICogQHBhcmFtIHtmdW5jdGlvbn0gZGVzY2VuZFxuICovXG5hcGkud2FsayA9IGZ1bmN0aW9uIHdhbGsgKG9iaiwgaXRlcmF0b3IsIGRlc2NlbmQpIHtcbiAgICB2YXIgcmVmVG9rZW5zID0gW107XG5cbiAgICBkZXNjZW5kID0gZGVzY2VuZCB8fCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIHR5cGUgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICAgICAgICByZXR1cm4gdHlwZSA9PT0gJ1tvYmplY3QgT2JqZWN0XScgfHwgdHlwZSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICB9O1xuXG4gICAgKGZ1bmN0aW9uIG5leHQgKGN1cikge1xuICAgICAgICBlYWNoKGN1ciwgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgIHJlZlRva2Vucy5wdXNoKFN0cmluZyhrZXkpKTtcbiAgICAgICAgICAgIGlmIChkZXNjZW5kKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIG5leHQodmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpdGVyYXRvcih2YWx1ZSwgYXBpLmNvbXBpbGUocmVmVG9rZW5zKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZWZUb2tlbnMucG9wKCk7XG4gICAgICAgIH0pO1xuICAgIH0ob2JqKSk7XG59O1xuXG4vKipcbiAqIFRlc3RzIGlmIGFuIG9iamVjdCBoYXMgYSB2YWx1ZSBmb3IgYSBqc29uIHBvaW50ZXJcbiAqXG4gKiBAcGFyYW0gb2JqXG4gKiBAcGFyYW0gcG9pbnRlclxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmFwaS5oYXMgPSBmdW5jdGlvbiBoYXMgKG9iaiwgcG9pbnRlcikge1xuICAgIHRyeSB7XG4gICAgICAgIGFwaS5nZXQob2JqLCBwb2ludGVyKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIEVzY2FwZXMgYSByZWZlcmVuY2UgdG9rZW5cbiAqXG4gKiBAcGFyYW0gc3RyXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5hcGkuZXNjYXBlID0gZnVuY3Rpb24gZXNjYXBlIChzdHIpIHtcbiAgICByZXR1cm4gc3RyLnRvU3RyaW5nKCkucmVwbGFjZSgvfi9nLCAnfjAnKS5yZXBsYWNlKC9cXC8vZywgJ34xJyk7XG59O1xuXG4vKipcbiAqIFVuZXNjYXBlcyBhIHJlZmVyZW5jZSB0b2tlblxuICpcbiAqIEBwYXJhbSBzdHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmFwaS51bmVzY2FwZSA9IGZ1bmN0aW9uIHVuZXNjYXBlIChzdHIpIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoL34xL2csICcvJykucmVwbGFjZSgvfjAvZywgJ34nKTtcbn07XG5cbi8qKlxuICogQ29udmVydHMgYSBqc29uIHBvaW50ZXIgaW50byBhIGFycmF5IG9mIHJlZmVyZW5jZSB0b2tlbnNcbiAqXG4gKiBAcGFyYW0gcG9pbnRlclxuICogQHJldHVybnMge0FycmF5fVxuICovXG5hcGkucGFyc2UgPSBmdW5jdGlvbiBwYXJzZSAocG9pbnRlcikge1xuICAgIGlmIChwb2ludGVyID09PSAnJykgeyByZXR1cm4gW107IH1cbiAgICBpZiAocG9pbnRlci5jaGFyQXQoMCkgIT09ICcvJykgeyB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgSlNPTiBwb2ludGVyOiAnICsgcG9pbnRlcik7IH1cbiAgICByZXR1cm4gcG9pbnRlci5zdWJzdHJpbmcoMSkuc3BsaXQoL1xcLy8pLm1hcChhcGkudW5lc2NhcGUpO1xufTtcblxuLyoqXG4gKiBCdWlsZHMgYSBqc29uIHBvaW50ZXIgZnJvbSBhIGFycmF5IG9mIHJlZmVyZW5jZSB0b2tlbnNcbiAqXG4gKiBAcGFyYW0gcmVmVG9rZW5zXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5hcGkuY29tcGlsZSA9IGZ1bmN0aW9uIGNvbXBpbGUgKHJlZlRva2Vucykge1xuICAgIGlmIChyZWZUb2tlbnMubGVuZ3RoID09PSAwKSB7IHJldHVybiAnJzsgfVxuICAgIHJldHVybiAnLycgKyByZWZUb2tlbnMubWFwKGFwaS5lc2NhcGUpLmpvaW4oJy8nKTtcbn07XG4iLCJcbnZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBmb3JFYWNoIChvYmosIGZuLCBjdHgpIHtcbiAgICBpZiAodG9TdHJpbmcuY2FsbChmbikgIT09ICdbb2JqZWN0IEZ1bmN0aW9uXScpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignaXRlcmF0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgfVxuICAgIHZhciBsID0gb2JqLmxlbmd0aDtcbiAgICBpZiAobCA9PT0gK2wpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIGZuLmNhbGwoY3R4LCBvYmpbaV0sIGksIG9iaik7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKHZhciBrIGluIG9iaikge1xuICAgICAgICAgICAgaWYgKGhhc093bi5jYWxsKG9iaiwgaykpIHtcbiAgICAgICAgICAgICAgICBmbi5jYWxsKGN0eCwgb2JqW2tdLCBrLCBvYmopO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxuIiwiLyoqXG4gKiBAbGljZW5zZVxuICogTG8tRGFzaCAyLjQuMiAoQ3VzdG9tIEJ1aWxkKSA8aHR0cHM6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZGVybiAtbyAuL2Rpc3QvbG9kYXNoLmpzYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHBzOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG47KGZ1bmN0aW9uKCkge1xuXG4gIC8qKiBVc2VkIGFzIGEgc2FmZSByZWZlcmVuY2UgZm9yIGB1bmRlZmluZWRgIGluIHByZSBFUzUgZW52aXJvbm1lbnRzICovXG4gIHZhciB1bmRlZmluZWQ7XG5cbiAgLyoqIFVzZWQgdG8gcG9vbCBhcnJheXMgYW5kIG9iamVjdHMgdXNlZCBpbnRlcm5hbGx5ICovXG4gIHZhciBhcnJheVBvb2wgPSBbXSxcbiAgICAgIG9iamVjdFBvb2wgPSBbXTtcblxuICAvKiogVXNlZCB0byBnZW5lcmF0ZSB1bmlxdWUgSURzICovXG4gIHZhciBpZENvdW50ZXIgPSAwO1xuXG4gIC8qKiBVc2VkIHRvIHByZWZpeCBrZXlzIHRvIGF2b2lkIGlzc3VlcyB3aXRoIGBfX3Byb3RvX19gIGFuZCBwcm9wZXJ0aWVzIG9uIGBPYmplY3QucHJvdG90eXBlYCAqL1xuICB2YXIga2V5UHJlZml4ID0gK25ldyBEYXRlICsgJyc7XG5cbiAgLyoqIFVzZWQgYXMgdGhlIHNpemUgd2hlbiBvcHRpbWl6YXRpb25zIGFyZSBlbmFibGVkIGZvciBsYXJnZSBhcnJheXMgKi9cbiAgdmFyIGxhcmdlQXJyYXlTaXplID0gNzU7XG5cbiAgLyoqIFVzZWQgYXMgdGhlIG1heCBzaXplIG9mIHRoZSBgYXJyYXlQb29sYCBhbmQgYG9iamVjdFBvb2xgICovXG4gIHZhciBtYXhQb29sU2l6ZSA9IDQwO1xuXG4gIC8qKiBVc2VkIHRvIGRldGVjdCBhbmQgdGVzdCB3aGl0ZXNwYWNlICovXG4gIHZhciB3aGl0ZXNwYWNlID0gKFxuICAgIC8vIHdoaXRlc3BhY2VcbiAgICAnIFxcdFxceDBCXFxmXFx4QTBcXHVmZWZmJyArXG5cbiAgICAvLyBsaW5lIHRlcm1pbmF0b3JzXG4gICAgJ1xcblxcclxcdTIwMjhcXHUyMDI5JyArXG5cbiAgICAvLyB1bmljb2RlIGNhdGVnb3J5IFwiWnNcIiBzcGFjZSBzZXBhcmF0b3JzXG4gICAgJ1xcdTE2ODBcXHUxODBlXFx1MjAwMFxcdTIwMDFcXHUyMDAyXFx1MjAwM1xcdTIwMDRcXHUyMDA1XFx1MjAwNlxcdTIwMDdcXHUyMDA4XFx1MjAwOVxcdTIwMGFcXHUyMDJmXFx1MjA1ZlxcdTMwMDAnXG4gICk7XG5cbiAgLyoqIFVzZWQgdG8gbWF0Y2ggZW1wdHkgc3RyaW5nIGxpdGVyYWxzIGluIGNvbXBpbGVkIHRlbXBsYXRlIHNvdXJjZSAqL1xuICB2YXIgcmVFbXB0eVN0cmluZ0xlYWRpbmcgPSAvXFxiX19wIFxcKz0gJyc7L2csXG4gICAgICByZUVtcHR5U3RyaW5nTWlkZGxlID0gL1xcYihfX3AgXFwrPSkgJycgXFwrL2csXG4gICAgICByZUVtcHR5U3RyaW5nVHJhaWxpbmcgPSAvKF9fZVxcKC4qP1xcKXxcXGJfX3RcXCkpIFxcK1xcbicnOy9nO1xuXG4gIC8qKlxuICAgKiBVc2VkIHRvIG1hdGNoIEVTNiB0ZW1wbGF0ZSBkZWxpbWl0ZXJzXG4gICAqIGh0dHA6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLWxpdGVyYWxzLXN0cmluZy1saXRlcmFsc1xuICAgKi9cbiAgdmFyIHJlRXNUZW1wbGF0ZSA9IC9cXCRcXHsoW15cXFxcfV0qKD86XFxcXC5bXlxcXFx9XSopKilcXH0vZztcblxuICAvKiogVXNlZCB0byBtYXRjaCByZWdleHAgZmxhZ3MgZnJvbSB0aGVpciBjb2VyY2VkIHN0cmluZyB2YWx1ZXMgKi9cbiAgdmFyIHJlRmxhZ3MgPSAvXFx3KiQvO1xuXG4gIC8qKiBVc2VkIHRvIGRldGVjdGVkIG5hbWVkIGZ1bmN0aW9ucyAqL1xuICB2YXIgcmVGdW5jTmFtZSA9IC9eXFxzKmZ1bmN0aW9uWyBcXG5cXHJcXHRdK1xcdy87XG5cbiAgLyoqIFVzZWQgdG8gbWF0Y2ggXCJpbnRlcnBvbGF0ZVwiIHRlbXBsYXRlIGRlbGltaXRlcnMgKi9cbiAgdmFyIHJlSW50ZXJwb2xhdGUgPSAvPCU9KFtcXHNcXFNdKz8pJT4vZztcblxuICAvKiogVXNlZCB0byBtYXRjaCBsZWFkaW5nIHdoaXRlc3BhY2UgYW5kIHplcm9zIHRvIGJlIHJlbW92ZWQgKi9cbiAgdmFyIHJlTGVhZGluZ1NwYWNlc0FuZFplcm9zID0gUmVnRXhwKCdeWycgKyB3aGl0ZXNwYWNlICsgJ10qMCsoPz0uJCknKTtcblxuICAvKiogVXNlZCB0byBlbnN1cmUgY2FwdHVyaW5nIG9yZGVyIG9mIHRlbXBsYXRlIGRlbGltaXRlcnMgKi9cbiAgdmFyIHJlTm9NYXRjaCA9IC8oJF4pLztcblxuICAvKiogVXNlZCB0byBkZXRlY3QgZnVuY3Rpb25zIGNvbnRhaW5pbmcgYSBgdGhpc2AgcmVmZXJlbmNlICovXG4gIHZhciByZVRoaXMgPSAvXFxidGhpc1xcYi87XG5cbiAgLyoqIFVzZWQgdG8gbWF0Y2ggdW5lc2NhcGVkIGNoYXJhY3RlcnMgaW4gY29tcGlsZWQgc3RyaW5nIGxpdGVyYWxzICovXG4gIHZhciByZVVuZXNjYXBlZFN0cmluZyA9IC9bJ1xcblxcclxcdFxcdTIwMjhcXHUyMDI5XFxcXF0vZztcblxuICAvKiogVXNlZCB0byBhc3NpZ24gZGVmYXVsdCBgY29udGV4dGAgb2JqZWN0IHByb3BlcnRpZXMgKi9cbiAgdmFyIGNvbnRleHRQcm9wcyA9IFtcbiAgICAnQXJyYXknLCAnQm9vbGVhbicsICdEYXRlJywgJ0Z1bmN0aW9uJywgJ01hdGgnLCAnTnVtYmVyJywgJ09iamVjdCcsXG4gICAgJ1JlZ0V4cCcsICdTdHJpbmcnLCAnXycsICdhdHRhY2hFdmVudCcsICdjbGVhclRpbWVvdXQnLCAnaXNGaW5pdGUnLCAnaXNOYU4nLFxuICAgICdwYXJzZUludCcsICdzZXRUaW1lb3V0J1xuICBdO1xuXG4gIC8qKiBVc2VkIHRvIG1ha2UgdGVtcGxhdGUgc291cmNlVVJMcyBlYXNpZXIgdG8gaWRlbnRpZnkgKi9cbiAgdmFyIHRlbXBsYXRlQ291bnRlciA9IDA7XG5cbiAgLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCBzaG9ydGN1dHMgKi9cbiAgdmFyIGFyZ3NDbGFzcyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nLFxuICAgICAgYXJyYXlDbGFzcyA9ICdbb2JqZWN0IEFycmF5XScsXG4gICAgICBib29sQ2xhc3MgPSAnW29iamVjdCBCb29sZWFuXScsXG4gICAgICBkYXRlQ2xhc3MgPSAnW29iamVjdCBEYXRlXScsXG4gICAgICBmdW5jQ2xhc3MgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgICAgbnVtYmVyQ2xhc3MgPSAnW29iamVjdCBOdW1iZXJdJyxcbiAgICAgIG9iamVjdENsYXNzID0gJ1tvYmplY3QgT2JqZWN0XScsXG4gICAgICByZWdleHBDbGFzcyA9ICdbb2JqZWN0IFJlZ0V4cF0nLFxuICAgICAgc3RyaW5nQ2xhc3MgPSAnW29iamVjdCBTdHJpbmddJztcblxuICAvKiogVXNlZCB0byBpZGVudGlmeSBvYmplY3QgY2xhc3NpZmljYXRpb25zIHRoYXQgYF8uY2xvbmVgIHN1cHBvcnRzICovXG4gIHZhciBjbG9uZWFibGVDbGFzc2VzID0ge307XG4gIGNsb25lYWJsZUNsYXNzZXNbZnVuY0NsYXNzXSA9IGZhbHNlO1xuICBjbG9uZWFibGVDbGFzc2VzW2FyZ3NDbGFzc10gPSBjbG9uZWFibGVDbGFzc2VzW2FycmF5Q2xhc3NdID1cbiAgY2xvbmVhYmxlQ2xhc3Nlc1tib29sQ2xhc3NdID0gY2xvbmVhYmxlQ2xhc3Nlc1tkYXRlQ2xhc3NdID1cbiAgY2xvbmVhYmxlQ2xhc3Nlc1tudW1iZXJDbGFzc10gPSBjbG9uZWFibGVDbGFzc2VzW29iamVjdENsYXNzXSA9XG4gIGNsb25lYWJsZUNsYXNzZXNbcmVnZXhwQ2xhc3NdID0gY2xvbmVhYmxlQ2xhc3Nlc1tzdHJpbmdDbGFzc10gPSB0cnVlO1xuXG4gIC8qKiBVc2VkIGFzIGFuIGludGVybmFsIGBfLmRlYm91bmNlYCBvcHRpb25zIG9iamVjdCAqL1xuICB2YXIgZGVib3VuY2VPcHRpb25zID0ge1xuICAgICdsZWFkaW5nJzogZmFsc2UsXG4gICAgJ21heFdhaXQnOiAwLFxuICAgICd0cmFpbGluZyc6IGZhbHNlXG4gIH07XG5cbiAgLyoqIFVzZWQgYXMgdGhlIHByb3BlcnR5IGRlc2NyaXB0b3IgZm9yIGBfX2JpbmREYXRhX19gICovXG4gIHZhciBkZXNjcmlwdG9yID0ge1xuICAgICdjb25maWd1cmFibGUnOiBmYWxzZSxcbiAgICAnZW51bWVyYWJsZSc6IGZhbHNlLFxuICAgICd2YWx1ZSc6IG51bGwsXG4gICAgJ3dyaXRhYmxlJzogZmFsc2VcbiAgfTtcblxuICAvKiogVXNlZCB0byBkZXRlcm1pbmUgaWYgdmFsdWVzIGFyZSBvZiB0aGUgbGFuZ3VhZ2UgdHlwZSBPYmplY3QgKi9cbiAgdmFyIG9iamVjdFR5cGVzID0ge1xuICAgICdib29sZWFuJzogZmFsc2UsXG4gICAgJ2Z1bmN0aW9uJzogdHJ1ZSxcbiAgICAnb2JqZWN0JzogdHJ1ZSxcbiAgICAnbnVtYmVyJzogZmFsc2UsXG4gICAgJ3N0cmluZyc6IGZhbHNlLFxuICAgICd1bmRlZmluZWQnOiBmYWxzZVxuICB9O1xuXG4gIC8qKiBVc2VkIHRvIGVzY2FwZSBjaGFyYWN0ZXJzIGZvciBpbmNsdXNpb24gaW4gY29tcGlsZWQgc3RyaW5nIGxpdGVyYWxzICovXG4gIHZhciBzdHJpbmdFc2NhcGVzID0ge1xuICAgICdcXFxcJzogJ1xcXFwnLFxuICAgIFwiJ1wiOiBcIidcIixcbiAgICAnXFxuJzogJ24nLFxuICAgICdcXHInOiAncicsXG4gICAgJ1xcdCc6ICd0JyxcbiAgICAnXFx1MjAyOCc6ICd1MjAyOCcsXG4gICAgJ1xcdTIwMjknOiAndTIwMjknXG4gIH07XG5cbiAgLyoqIFVzZWQgYXMgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QgKi9cbiAgdmFyIHJvb3QgPSAob2JqZWN0VHlwZXNbdHlwZW9mIHdpbmRvd10gJiYgd2luZG93KSB8fCB0aGlzO1xuXG4gIC8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZXhwb3J0c2AgKi9cbiAgdmFyIGZyZWVFeHBvcnRzID0gb2JqZWN0VHlwZXNbdHlwZW9mIGV4cG9ydHNdICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblxuICAvKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWAgKi9cbiAgdmFyIGZyZWVNb2R1bGUgPSBvYmplY3RUeXBlc1t0eXBlb2YgbW9kdWxlXSAmJiBtb2R1bGUgJiYgIW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGU7XG5cbiAgLyoqIERldGVjdCB0aGUgcG9wdWxhciBDb21tb25KUyBleHRlbnNpb24gYG1vZHVsZS5leHBvcnRzYCAqL1xuICB2YXIgbW9kdWxlRXhwb3J0cyA9IGZyZWVNb2R1bGUgJiYgZnJlZU1vZHVsZS5leHBvcnRzID09PSBmcmVlRXhwb3J0cyAmJiBmcmVlRXhwb3J0cztcblxuICAvKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAgZnJvbSBOb2RlLmpzIG9yIEJyb3dzZXJpZmllZCBjb2RlIGFuZCB1c2UgaXQgYXMgYHJvb3RgICovXG4gIHZhciBmcmVlR2xvYmFsID0gb2JqZWN0VHlwZXNbdHlwZW9mIGdsb2JhbF0gJiYgZ2xvYmFsO1xuICBpZiAoZnJlZUdsb2JhbCAmJiAoZnJlZUdsb2JhbC5nbG9iYWwgPT09IGZyZWVHbG9iYWwgfHwgZnJlZUdsb2JhbC53aW5kb3cgPT09IGZyZWVHbG9iYWwpKSB7XG4gICAgcm9vdCA9IGZyZWVHbG9iYWw7XG4gIH1cblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaW5kZXhPZmAgd2l0aG91dCBzdXBwb3J0IGZvciBiaW5hcnkgc2VhcmNoZXNcbiAgICogb3IgYGZyb21JbmRleGAgY29uc3RyYWludHMuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBzZWFyY2guXG4gICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNlYXJjaCBmb3IuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbZnJvbUluZGV4PTBdIFRoZSBpbmRleCB0byBzZWFyY2ggZnJvbS5cbiAgICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIG1hdGNoZWQgdmFsdWUgb3IgYC0xYC5cbiAgICovXG4gIGZ1bmN0aW9uIGJhc2VJbmRleE9mKGFycmF5LCB2YWx1ZSwgZnJvbUluZGV4KSB7XG4gICAgdmFyIGluZGV4ID0gKGZyb21JbmRleCB8fCAwKSAtIDEsXG4gICAgICAgIGxlbmd0aCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogMDtcblxuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICBpZiAoYXJyYXlbaW5kZXhdID09PSB2YWx1ZSkge1xuICAgICAgICByZXR1cm4gaW5kZXg7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBpbXBsZW1lbnRhdGlvbiBvZiBgXy5jb250YWluc2AgZm9yIGNhY2hlIG9iamVjdHMgdGhhdCBtaW1pY3MgdGhlIHJldHVyblxuICAgKiBzaWduYXR1cmUgb2YgYF8uaW5kZXhPZmAgYnkgcmV0dXJuaW5nIGAwYCBpZiB0aGUgdmFsdWUgaXMgZm91bmQsIGVsc2UgYC0xYC5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtPYmplY3R9IGNhY2hlIFRoZSBjYWNoZSBvYmplY3QgdG8gaW5zcGVjdC5cbiAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2VhcmNoIGZvci5cbiAgICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyBgMGAgaWYgYHZhbHVlYCBpcyBmb3VuZCwgZWxzZSBgLTFgLlxuICAgKi9cbiAgZnVuY3Rpb24gY2FjaGVJbmRleE9mKGNhY2hlLCB2YWx1ZSkge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICAgIGNhY2hlID0gY2FjaGUuY2FjaGU7XG5cbiAgICBpZiAodHlwZSA9PSAnYm9vbGVhbicgfHwgdmFsdWUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGNhY2hlW3ZhbHVlXSA/IDAgOiAtMTtcbiAgICB9XG4gICAgaWYgKHR5cGUgIT0gJ251bWJlcicgJiYgdHlwZSAhPSAnc3RyaW5nJykge1xuICAgICAgdHlwZSA9ICdvYmplY3QnO1xuICAgIH1cbiAgICB2YXIga2V5ID0gdHlwZSA9PSAnbnVtYmVyJyA/IHZhbHVlIDoga2V5UHJlZml4ICsgdmFsdWU7XG4gICAgY2FjaGUgPSAoY2FjaGUgPSBjYWNoZVt0eXBlXSkgJiYgY2FjaGVba2V5XTtcblxuICAgIHJldHVybiB0eXBlID09ICdvYmplY3QnXG4gICAgICA/IChjYWNoZSAmJiBiYXNlSW5kZXhPZihjYWNoZSwgdmFsdWUpID4gLTEgPyAwIDogLTEpXG4gICAgICA6IChjYWNoZSA/IDAgOiAtMSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIGdpdmVuIHZhbHVlIHRvIHRoZSBjb3JyZXNwb25kaW5nIGNhY2hlIG9iamVjdC5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYWRkIHRvIHRoZSBjYWNoZS5cbiAgICovXG4gIGZ1bmN0aW9uIGNhY2hlUHVzaCh2YWx1ZSkge1xuICAgIHZhciBjYWNoZSA9IHRoaXMuY2FjaGUsXG4gICAgICAgIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG5cbiAgICBpZiAodHlwZSA9PSAnYm9vbGVhbicgfHwgdmFsdWUgPT0gbnVsbCkge1xuICAgICAgY2FjaGVbdmFsdWVdID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHR5cGUgIT0gJ251bWJlcicgJiYgdHlwZSAhPSAnc3RyaW5nJykge1xuICAgICAgICB0eXBlID0gJ29iamVjdCc7XG4gICAgICB9XG4gICAgICB2YXIga2V5ID0gdHlwZSA9PSAnbnVtYmVyJyA/IHZhbHVlIDoga2V5UHJlZml4ICsgdmFsdWUsXG4gICAgICAgICAgdHlwZUNhY2hlID0gY2FjaGVbdHlwZV0gfHwgKGNhY2hlW3R5cGVdID0ge30pO1xuXG4gICAgICBpZiAodHlwZSA9PSAnb2JqZWN0Jykge1xuICAgICAgICAodHlwZUNhY2hlW2tleV0gfHwgKHR5cGVDYWNoZVtrZXldID0gW10pKS5wdXNoKHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHR5cGVDYWNoZVtrZXldID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXNlZCBieSBgXy5tYXhgIGFuZCBgXy5taW5gIGFzIHRoZSBkZWZhdWx0IGNhbGxiYWNrIHdoZW4gYSBnaXZlblxuICAgKiBjb2xsZWN0aW9uIGlzIGEgc3RyaW5nIHZhbHVlLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgVGhlIGNoYXJhY3RlciB0byBpbnNwZWN0LlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBjb2RlIHVuaXQgb2YgZ2l2ZW4gY2hhcmFjdGVyLlxuICAgKi9cbiAgZnVuY3Rpb24gY2hhckF0Q2FsbGJhY2sodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUuY2hhckNvZGVBdCgwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2VkIGJ5IGBzb3J0QnlgIHRvIGNvbXBhcmUgdHJhbnNmb3JtZWQgYGNvbGxlY3Rpb25gIGVsZW1lbnRzLCBzdGFibGUgc29ydGluZ1xuICAgKiB0aGVtIGluIGFzY2VuZGluZyBvcmRlci5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtPYmplY3R9IGEgVGhlIG9iamVjdCB0byBjb21wYXJlIHRvIGBiYC5cbiAgICogQHBhcmFtIHtPYmplY3R9IGIgVGhlIG9iamVjdCB0byBjb21wYXJlIHRvIGBhYC5cbiAgICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgc29ydCBvcmRlciBpbmRpY2F0b3Igb2YgYDFgIG9yIGAtMWAuXG4gICAqL1xuICBmdW5jdGlvbiBjb21wYXJlQXNjZW5kaW5nKGEsIGIpIHtcbiAgICB2YXIgYWMgPSBhLmNyaXRlcmlhLFxuICAgICAgICBiYyA9IGIuY3JpdGVyaWEsXG4gICAgICAgIGluZGV4ID0gLTEsXG4gICAgICAgIGxlbmd0aCA9IGFjLmxlbmd0aDtcblxuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICB2YXIgdmFsdWUgPSBhY1tpbmRleF0sXG4gICAgICAgICAgb3RoZXIgPSBiY1tpbmRleF07XG5cbiAgICAgIGlmICh2YWx1ZSAhPT0gb3RoZXIpIHtcbiAgICAgICAgaWYgKHZhbHVlID4gb3RoZXIgfHwgdHlwZW9mIHZhbHVlID09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhbHVlIDwgb3RoZXIgfHwgdHlwZW9mIG90aGVyID09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIC8vIEZpeGVzIGFuIGBBcnJheSNzb3J0YCBidWcgaW4gdGhlIEpTIGVuZ2luZSBlbWJlZGRlZCBpbiBBZG9iZSBhcHBsaWNhdGlvbnNcbiAgICAvLyB0aGF0IGNhdXNlcyBpdCwgdW5kZXIgY2VydGFpbiBjaXJjdW1zdGFuY2VzLCB0byByZXR1cm4gdGhlIHNhbWUgdmFsdWUgZm9yXG4gICAgLy8gYGFgIGFuZCBgYmAuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vamFzaGtlbmFzL3VuZGVyc2NvcmUvcHVsbC8xMjQ3XG4gICAgLy9cbiAgICAvLyBUaGlzIGFsc28gZW5zdXJlcyBhIHN0YWJsZSBzb3J0IGluIFY4IGFuZCBvdGhlciBlbmdpbmVzLlxuICAgIC8vIFNlZSBodHRwOi8vY29kZS5nb29nbGUuY29tL3AvdjgvaXNzdWVzL2RldGFpbD9pZD05MFxuICAgIHJldHVybiBhLmluZGV4IC0gYi5pbmRleDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgY2FjaGUgb2JqZWN0IHRvIG9wdGltaXplIGxpbmVhciBzZWFyY2hlcyBvZiBsYXJnZSBhcnJheXMuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7QXJyYXl9IFthcnJheT1bXV0gVGhlIGFycmF5IHRvIHNlYXJjaC5cbiAgICogQHJldHVybnMge251bGx8T2JqZWN0fSBSZXR1cm5zIHRoZSBjYWNoZSBvYmplY3Qgb3IgYG51bGxgIGlmIGNhY2hpbmcgc2hvdWxkIG5vdCBiZSB1c2VkLlxuICAgKi9cbiAgZnVuY3Rpb24gY3JlYXRlQ2FjaGUoYXJyYXkpIHtcbiAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgbGVuZ3RoID0gYXJyYXkubGVuZ3RoLFxuICAgICAgICBmaXJzdCA9IGFycmF5WzBdLFxuICAgICAgICBtaWQgPSBhcnJheVsobGVuZ3RoIC8gMikgfCAwXSxcbiAgICAgICAgbGFzdCA9IGFycmF5W2xlbmd0aCAtIDFdO1xuXG4gICAgaWYgKGZpcnN0ICYmIHR5cGVvZiBmaXJzdCA9PSAnb2JqZWN0JyAmJlxuICAgICAgICBtaWQgJiYgdHlwZW9mIG1pZCA9PSAnb2JqZWN0JyAmJiBsYXN0ICYmIHR5cGVvZiBsYXN0ID09ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciBjYWNoZSA9IGdldE9iamVjdCgpO1xuICAgIGNhY2hlWydmYWxzZSddID0gY2FjaGVbJ251bGwnXSA9IGNhY2hlWyd0cnVlJ10gPSBjYWNoZVsndW5kZWZpbmVkJ10gPSBmYWxzZTtcblxuICAgIHZhciByZXN1bHQgPSBnZXRPYmplY3QoKTtcbiAgICByZXN1bHQuYXJyYXkgPSBhcnJheTtcbiAgICByZXN1bHQuY2FjaGUgPSBjYWNoZTtcbiAgICByZXN1bHQucHVzaCA9IGNhY2hlUHVzaDtcblxuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICByZXN1bHQucHVzaChhcnJheVtpbmRleF0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZWQgYnkgYHRlbXBsYXRlYCB0byBlc2NhcGUgY2hhcmFjdGVycyBmb3IgaW5jbHVzaW9uIGluIGNvbXBpbGVkXG4gICAqIHN0cmluZyBsaXRlcmFscy5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IG1hdGNoIFRoZSBtYXRjaGVkIGNoYXJhY3RlciB0byBlc2NhcGUuXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGVzY2FwZWQgY2hhcmFjdGVyLlxuICAgKi9cbiAgZnVuY3Rpb24gZXNjYXBlU3RyaW5nQ2hhcihtYXRjaCkge1xuICAgIHJldHVybiAnXFxcXCcgKyBzdHJpbmdFc2NhcGVzW21hdGNoXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGFuIGFycmF5IGZyb20gdGhlIGFycmF5IHBvb2wgb3IgY3JlYXRlcyBhIG5ldyBvbmUgaWYgdGhlIHBvb2wgaXMgZW1wdHkuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEByZXR1cm5zIHtBcnJheX0gVGhlIGFycmF5IGZyb20gdGhlIHBvb2wuXG4gICAqL1xuICBmdW5jdGlvbiBnZXRBcnJheSgpIHtcbiAgICByZXR1cm4gYXJyYXlQb29sLnBvcCgpIHx8IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYW4gb2JqZWN0IGZyb20gdGhlIG9iamVjdCBwb29sIG9yIGNyZWF0ZXMgYSBuZXcgb25lIGlmIHRoZSBwb29sIGlzIGVtcHR5LlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgb2JqZWN0IGZyb20gdGhlIHBvb2wuXG4gICAqL1xuICBmdW5jdGlvbiBnZXRPYmplY3QoKSB7XG4gICAgcmV0dXJuIG9iamVjdFBvb2wucG9wKCkgfHwge1xuICAgICAgJ2FycmF5JzogbnVsbCxcbiAgICAgICdjYWNoZSc6IG51bGwsXG4gICAgICAnY3JpdGVyaWEnOiBudWxsLFxuICAgICAgJ2ZhbHNlJzogZmFsc2UsXG4gICAgICAnaW5kZXgnOiAwLFxuICAgICAgJ251bGwnOiBmYWxzZSxcbiAgICAgICdudW1iZXInOiBudWxsLFxuICAgICAgJ29iamVjdCc6IG51bGwsXG4gICAgICAncHVzaCc6IG51bGwsXG4gICAgICAnc3RyaW5nJzogbnVsbCxcbiAgICAgICd0cnVlJzogZmFsc2UsXG4gICAgICAndW5kZWZpbmVkJzogZmFsc2UsXG4gICAgICAndmFsdWUnOiBudWxsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWxlYXNlcyB0aGUgZ2l2ZW4gYXJyYXkgYmFjayB0byB0aGUgYXJyYXkgcG9vbC5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtBcnJheX0gW2FycmF5XSBUaGUgYXJyYXkgdG8gcmVsZWFzZS5cbiAgICovXG4gIGZ1bmN0aW9uIHJlbGVhc2VBcnJheShhcnJheSkge1xuICAgIGFycmF5Lmxlbmd0aCA9IDA7XG4gICAgaWYgKGFycmF5UG9vbC5sZW5ndGggPCBtYXhQb29sU2l6ZSkge1xuICAgICAgYXJyYXlQb29sLnB1c2goYXJyYXkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWxlYXNlcyB0aGUgZ2l2ZW4gb2JqZWN0IGJhY2sgdG8gdGhlIG9iamVjdCBwb29sLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge09iamVjdH0gW29iamVjdF0gVGhlIG9iamVjdCB0byByZWxlYXNlLlxuICAgKi9cbiAgZnVuY3Rpb24gcmVsZWFzZU9iamVjdChvYmplY3QpIHtcbiAgICB2YXIgY2FjaGUgPSBvYmplY3QuY2FjaGU7XG4gICAgaWYgKGNhY2hlKSB7XG4gICAgICByZWxlYXNlT2JqZWN0KGNhY2hlKTtcbiAgICB9XG4gICAgb2JqZWN0LmFycmF5ID0gb2JqZWN0LmNhY2hlID0gb2JqZWN0LmNyaXRlcmlhID0gb2JqZWN0Lm9iamVjdCA9IG9iamVjdC5udW1iZXIgPSBvYmplY3Quc3RyaW5nID0gb2JqZWN0LnZhbHVlID0gbnVsbDtcbiAgICBpZiAob2JqZWN0UG9vbC5sZW5ndGggPCBtYXhQb29sU2l6ZSkge1xuICAgICAgb2JqZWN0UG9vbC5wdXNoKG9iamVjdCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNsaWNlcyB0aGUgYGNvbGxlY3Rpb25gIGZyb20gdGhlIGBzdGFydGAgaW5kZXggdXAgdG8sIGJ1dCBub3QgaW5jbHVkaW5nLFxuICAgKiB0aGUgYGVuZGAgaW5kZXguXG4gICAqXG4gICAqIE5vdGU6IFRoaXMgZnVuY3Rpb24gaXMgdXNlZCBpbnN0ZWFkIG9mIGBBcnJheSNzbGljZWAgdG8gc3VwcG9ydCBub2RlIGxpc3RzXG4gICAqIGluIElFIDwgOSBhbmQgdG8gZW5zdXJlIGRlbnNlIGFycmF5cyBhcmUgcmV0dXJuZWQuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBzbGljZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0IFRoZSBzdGFydCBpbmRleC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGVuZCBUaGUgZW5kIGluZGV4LlxuICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBhcnJheS5cbiAgICovXG4gIGZ1bmN0aW9uIHNsaWNlKGFycmF5LCBzdGFydCwgZW5kKSB7XG4gICAgc3RhcnQgfHwgKHN0YXJ0ID0gMCk7XG4gICAgaWYgKHR5cGVvZiBlbmQgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGVuZCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogMDtcbiAgICB9XG4gICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgIGxlbmd0aCA9IGVuZCAtIHN0YXJ0IHx8IDAsXG4gICAgICAgIHJlc3VsdCA9IEFycmF5KGxlbmd0aCA8IDAgPyAwIDogbGVuZ3RoKTtcblxuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICByZXN1bHRbaW5kZXhdID0gYXJyYXlbc3RhcnQgKyBpbmRleF07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBsb2Rhc2hgIGZ1bmN0aW9uIHVzaW5nIHRoZSBnaXZlbiBjb250ZXh0IG9iamVjdC5cbiAgICpcbiAgICogQHN0YXRpY1xuICAgKiBAbWVtYmVyT2YgX1xuICAgKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbY29udGV4dD1yb290XSBUaGUgY29udGV4dCBvYmplY3QuXG4gICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgYGxvZGFzaGAgZnVuY3Rpb24uXG4gICAqL1xuICBmdW5jdGlvbiBydW5JbkNvbnRleHQoY29udGV4dCkge1xuICAgIC8vIEF2b2lkIGlzc3VlcyB3aXRoIHNvbWUgRVMzIGVudmlyb25tZW50cyB0aGF0IGF0dGVtcHQgdG8gdXNlIHZhbHVlcywgbmFtZWRcbiAgICAvLyBhZnRlciBidWlsdC1pbiBjb25zdHJ1Y3RvcnMgbGlrZSBgT2JqZWN0YCwgZm9yIHRoZSBjcmVhdGlvbiBvZiBsaXRlcmFscy5cbiAgICAvLyBFUzUgY2xlYXJzIHRoaXMgdXAgYnkgc3RhdGluZyB0aGF0IGxpdGVyYWxzIG11c3QgdXNlIGJ1aWx0LWluIGNvbnN0cnVjdG9ycy5cbiAgICAvLyBTZWUgaHR0cDovL2VzNS5naXRodWIuaW8vI3gxMS4xLjUuXG4gICAgY29udGV4dCA9IGNvbnRleHQgPyBfLmRlZmF1bHRzKHJvb3QuT2JqZWN0KCksIGNvbnRleHQsIF8ucGljayhyb290LCBjb250ZXh0UHJvcHMpKSA6IHJvb3Q7XG5cbiAgICAvKiogTmF0aXZlIGNvbnN0cnVjdG9yIHJlZmVyZW5jZXMgKi9cbiAgICB2YXIgQXJyYXkgPSBjb250ZXh0LkFycmF5LFxuICAgICAgICBCb29sZWFuID0gY29udGV4dC5Cb29sZWFuLFxuICAgICAgICBEYXRlID0gY29udGV4dC5EYXRlLFxuICAgICAgICBGdW5jdGlvbiA9IGNvbnRleHQuRnVuY3Rpb24sXG4gICAgICAgIE1hdGggPSBjb250ZXh0Lk1hdGgsXG4gICAgICAgIE51bWJlciA9IGNvbnRleHQuTnVtYmVyLFxuICAgICAgICBPYmplY3QgPSBjb250ZXh0Lk9iamVjdCxcbiAgICAgICAgUmVnRXhwID0gY29udGV4dC5SZWdFeHAsXG4gICAgICAgIFN0cmluZyA9IGNvbnRleHQuU3RyaW5nLFxuICAgICAgICBUeXBlRXJyb3IgPSBjb250ZXh0LlR5cGVFcnJvcjtcblxuICAgIC8qKlxuICAgICAqIFVzZWQgZm9yIGBBcnJheWAgbWV0aG9kIHJlZmVyZW5jZXMuXG4gICAgICpcbiAgICAgKiBOb3JtYWxseSBgQXJyYXkucHJvdG90eXBlYCB3b3VsZCBzdWZmaWNlLCBob3dldmVyLCB1c2luZyBhbiBhcnJheSBsaXRlcmFsXG4gICAgICogYXZvaWRzIGlzc3VlcyBpbiBOYXJ3aGFsLlxuICAgICAqL1xuICAgIHZhciBhcnJheVJlZiA9IFtdO1xuXG4gICAgLyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcyAqL1xuICAgIHZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbiAgICAvKiogVXNlZCB0byByZXN0b3JlIHRoZSBvcmlnaW5hbCBgX2AgcmVmZXJlbmNlIGluIGBub0NvbmZsaWN0YCAqL1xuICAgIHZhciBvbGREYXNoID0gY29udGV4dC5fO1xuXG4gICAgLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgaW50ZXJuYWwgW1tDbGFzc11dIG9mIHZhbHVlcyAqL1xuICAgIHZhciB0b1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4gICAgLyoqIFVzZWQgdG8gZGV0ZWN0IGlmIGEgbWV0aG9kIGlzIG5hdGl2ZSAqL1xuICAgIHZhciByZU5hdGl2ZSA9IFJlZ0V4cCgnXicgK1xuICAgICAgU3RyaW5nKHRvU3RyaW5nKVxuICAgICAgICAucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKVxuICAgICAgICAucmVwbGFjZSgvdG9TdHJpbmd8IGZvciBbXlxcXV0rL2csICcuKj8nKSArICckJ1xuICAgICk7XG5cbiAgICAvKiogTmF0aXZlIG1ldGhvZCBzaG9ydGN1dHMgKi9cbiAgICB2YXIgY2VpbCA9IE1hdGguY2VpbCxcbiAgICAgICAgY2xlYXJUaW1lb3V0ID0gY29udGV4dC5jbGVhclRpbWVvdXQsXG4gICAgICAgIGZsb29yID0gTWF0aC5mbG9vcixcbiAgICAgICAgZm5Ub1N0cmluZyA9IEZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZyxcbiAgICAgICAgZ2V0UHJvdG90eXBlT2YgPSBpc05hdGl2ZShnZXRQcm90b3R5cGVPZiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZikgJiYgZ2V0UHJvdG90eXBlT2YsXG4gICAgICAgIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHksXG4gICAgICAgIHB1c2ggPSBhcnJheVJlZi5wdXNoLFxuICAgICAgICBzZXRUaW1lb3V0ID0gY29udGV4dC5zZXRUaW1lb3V0LFxuICAgICAgICBzcGxpY2UgPSBhcnJheVJlZi5zcGxpY2UsXG4gICAgICAgIHVuc2hpZnQgPSBhcnJheVJlZi51bnNoaWZ0O1xuXG4gICAgLyoqIFVzZWQgdG8gc2V0IG1ldGEgZGF0YSBvbiBmdW5jdGlvbnMgKi9cbiAgICB2YXIgZGVmaW5lUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAvLyBJRSA4IG9ubHkgYWNjZXB0cyBET00gZWxlbWVudHNcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciBvID0ge30sXG4gICAgICAgICAgICBmdW5jID0gaXNOYXRpdmUoZnVuYyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkgJiYgZnVuYyxcbiAgICAgICAgICAgIHJlc3VsdCA9IGZ1bmMobywgbywgbykgJiYgZnVuYztcbiAgICAgIH0gY2F0Y2goZSkgeyB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0oKSk7XG5cbiAgICAvKiBOYXRpdmUgbWV0aG9kIHNob3J0Y3V0cyBmb3IgbWV0aG9kcyB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcyAqL1xuICAgIHZhciBuYXRpdmVDcmVhdGUgPSBpc05hdGl2ZShuYXRpdmVDcmVhdGUgPSBPYmplY3QuY3JlYXRlKSAmJiBuYXRpdmVDcmVhdGUsXG4gICAgICAgIG5hdGl2ZUlzQXJyYXkgPSBpc05hdGl2ZShuYXRpdmVJc0FycmF5ID0gQXJyYXkuaXNBcnJheSkgJiYgbmF0aXZlSXNBcnJheSxcbiAgICAgICAgbmF0aXZlSXNGaW5pdGUgPSBjb250ZXh0LmlzRmluaXRlLFxuICAgICAgICBuYXRpdmVJc05hTiA9IGNvbnRleHQuaXNOYU4sXG4gICAgICAgIG5hdGl2ZUtleXMgPSBpc05hdGl2ZShuYXRpdmVLZXlzID0gT2JqZWN0LmtleXMpICYmIG5hdGl2ZUtleXMsXG4gICAgICAgIG5hdGl2ZU1heCA9IE1hdGgubWF4LFxuICAgICAgICBuYXRpdmVNaW4gPSBNYXRoLm1pbixcbiAgICAgICAgbmF0aXZlUGFyc2VJbnQgPSBjb250ZXh0LnBhcnNlSW50LFxuICAgICAgICBuYXRpdmVSYW5kb20gPSBNYXRoLnJhbmRvbTtcblxuICAgIC8qKiBVc2VkIHRvIGxvb2t1cCBhIGJ1aWx0LWluIGNvbnN0cnVjdG9yIGJ5IFtbQ2xhc3NdXSAqL1xuICAgIHZhciBjdG9yQnlDbGFzcyA9IHt9O1xuICAgIGN0b3JCeUNsYXNzW2FycmF5Q2xhc3NdID0gQXJyYXk7XG4gICAgY3RvckJ5Q2xhc3NbYm9vbENsYXNzXSA9IEJvb2xlYW47XG4gICAgY3RvckJ5Q2xhc3NbZGF0ZUNsYXNzXSA9IERhdGU7XG4gICAgY3RvckJ5Q2xhc3NbZnVuY0NsYXNzXSA9IEZ1bmN0aW9uO1xuICAgIGN0b3JCeUNsYXNzW29iamVjdENsYXNzXSA9IE9iamVjdDtcbiAgICBjdG9yQnlDbGFzc1tudW1iZXJDbGFzc10gPSBOdW1iZXI7XG4gICAgY3RvckJ5Q2xhc3NbcmVnZXhwQ2xhc3NdID0gUmVnRXhwO1xuICAgIGN0b3JCeUNsYXNzW3N0cmluZ0NsYXNzXSA9IFN0cmluZztcblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGBsb2Rhc2hgIG9iamVjdCB3aGljaCB3cmFwcyB0aGUgZ2l2ZW4gdmFsdWUgdG8gZW5hYmxlIGludHVpdGl2ZVxuICAgICAqIG1ldGhvZCBjaGFpbmluZy5cbiAgICAgKlxuICAgICAqIEluIGFkZGl0aW9uIHRvIExvLURhc2ggbWV0aG9kcywgd3JhcHBlcnMgYWxzbyBoYXZlIHRoZSBmb2xsb3dpbmcgYEFycmF5YCBtZXRob2RzOlxuICAgICAqIGBjb25jYXRgLCBgam9pbmAsIGBwb3BgLCBgcHVzaGAsIGByZXZlcnNlYCwgYHNoaWZ0YCwgYHNsaWNlYCwgYHNvcnRgLCBgc3BsaWNlYCxcbiAgICAgKiBhbmQgYHVuc2hpZnRgXG4gICAgICpcbiAgICAgKiBDaGFpbmluZyBpcyBzdXBwb3J0ZWQgaW4gY3VzdG9tIGJ1aWxkcyBhcyBsb25nIGFzIHRoZSBgdmFsdWVgIG1ldGhvZCBpc1xuICAgICAqIGltcGxpY2l0bHkgb3IgZXhwbGljaXRseSBpbmNsdWRlZCBpbiB0aGUgYnVpbGQuXG4gICAgICpcbiAgICAgKiBUaGUgY2hhaW5hYmxlIHdyYXBwZXIgZnVuY3Rpb25zIGFyZTpcbiAgICAgKiBgYWZ0ZXJgLCBgYXNzaWduYCwgYGJpbmRgLCBgYmluZEFsbGAsIGBiaW5kS2V5YCwgYGNoYWluYCwgYGNvbXBhY3RgLFxuICAgICAqIGBjb21wb3NlYCwgYGNvbmNhdGAsIGBjb3VudEJ5YCwgYGNyZWF0ZWAsIGBjcmVhdGVDYWxsYmFja2AsIGBjdXJyeWAsXG4gICAgICogYGRlYm91bmNlYCwgYGRlZmF1bHRzYCwgYGRlZmVyYCwgYGRlbGF5YCwgYGRpZmZlcmVuY2VgLCBgZmlsdGVyYCwgYGZsYXR0ZW5gLFxuICAgICAqIGBmb3JFYWNoYCwgYGZvckVhY2hSaWdodGAsIGBmb3JJbmAsIGBmb3JJblJpZ2h0YCwgYGZvck93bmAsIGBmb3JPd25SaWdodGAsXG4gICAgICogYGZ1bmN0aW9uc2AsIGBncm91cEJ5YCwgYGluZGV4QnlgLCBgaW5pdGlhbGAsIGBpbnRlcnNlY3Rpb25gLCBgaW52ZXJ0YCxcbiAgICAgKiBgaW52b2tlYCwgYGtleXNgLCBgbWFwYCwgYG1heGAsIGBtZW1vaXplYCwgYG1lcmdlYCwgYG1pbmAsIGBvYmplY3RgLCBgb21pdGAsXG4gICAgICogYG9uY2VgLCBgcGFpcnNgLCBgcGFydGlhbGAsIGBwYXJ0aWFsUmlnaHRgLCBgcGlja2AsIGBwbHVja2AsIGBwdWxsYCwgYHB1c2hgLFxuICAgICAqIGByYW5nZWAsIGByZWplY3RgLCBgcmVtb3ZlYCwgYHJlc3RgLCBgcmV2ZXJzZWAsIGBzaHVmZmxlYCwgYHNsaWNlYCwgYHNvcnRgLFxuICAgICAqIGBzb3J0QnlgLCBgc3BsaWNlYCwgYHRhcGAsIGB0aHJvdHRsZWAsIGB0aW1lc2AsIGB0b0FycmF5YCwgYHRyYW5zZm9ybWAsXG4gICAgICogYHVuaW9uYCwgYHVuaXFgLCBgdW5zaGlmdGAsIGB1bnppcGAsIGB2YWx1ZXNgLCBgd2hlcmVgLCBgd2l0aG91dGAsIGB3cmFwYCxcbiAgICAgKiBhbmQgYHppcGBcbiAgICAgKlxuICAgICAqIFRoZSBub24tY2hhaW5hYmxlIHdyYXBwZXIgZnVuY3Rpb25zIGFyZTpcbiAgICAgKiBgY2xvbmVgLCBgY2xvbmVEZWVwYCwgYGNvbnRhaW5zYCwgYGVzY2FwZWAsIGBldmVyeWAsIGBmaW5kYCwgYGZpbmRJbmRleGAsXG4gICAgICogYGZpbmRLZXlgLCBgZmluZExhc3RgLCBgZmluZExhc3RJbmRleGAsIGBmaW5kTGFzdEtleWAsIGBoYXNgLCBgaWRlbnRpdHlgLFxuICAgICAqIGBpbmRleE9mYCwgYGlzQXJndW1lbnRzYCwgYGlzQXJyYXlgLCBgaXNCb29sZWFuYCwgYGlzRGF0ZWAsIGBpc0VsZW1lbnRgLFxuICAgICAqIGBpc0VtcHR5YCwgYGlzRXF1YWxgLCBgaXNGaW5pdGVgLCBgaXNGdW5jdGlvbmAsIGBpc05hTmAsIGBpc051bGxgLCBgaXNOdW1iZXJgLFxuICAgICAqIGBpc09iamVjdGAsIGBpc1BsYWluT2JqZWN0YCwgYGlzUmVnRXhwYCwgYGlzU3RyaW5nYCwgYGlzVW5kZWZpbmVkYCwgYGpvaW5gLFxuICAgICAqIGBsYXN0SW5kZXhPZmAsIGBtaXhpbmAsIGBub0NvbmZsaWN0YCwgYHBhcnNlSW50YCwgYHBvcGAsIGByYW5kb21gLCBgcmVkdWNlYCxcbiAgICAgKiBgcmVkdWNlUmlnaHRgLCBgcmVzdWx0YCwgYHNoaWZ0YCwgYHNpemVgLCBgc29tZWAsIGBzb3J0ZWRJbmRleGAsIGBydW5JbkNvbnRleHRgLFxuICAgICAqIGB0ZW1wbGF0ZWAsIGB1bmVzY2FwZWAsIGB1bmlxdWVJZGAsIGFuZCBgdmFsdWVgXG4gICAgICpcbiAgICAgKiBUaGUgd3JhcHBlciBmdW5jdGlvbnMgYGZpcnN0YCBhbmQgYGxhc3RgIHJldHVybiB3cmFwcGVkIHZhbHVlcyB3aGVuIGBuYCBpc1xuICAgICAqIHByb3ZpZGVkLCBvdGhlcndpc2UgdGhleSByZXR1cm4gdW53cmFwcGVkIHZhbHVlcy5cbiAgICAgKlxuICAgICAqIEV4cGxpY2l0IGNoYWluaW5nIGNhbiBiZSBlbmFibGVkIGJ5IHVzaW5nIHRoZSBgXy5jaGFpbmAgbWV0aG9kLlxuICAgICAqXG4gICAgICogQG5hbWUgX1xuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBjYXRlZ29yeSBDaGFpbmluZ1xuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHdyYXAgaW4gYSBgbG9kYXNoYCBpbnN0YW5jZS5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGEgYGxvZGFzaGAgaW5zdGFuY2UuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciB3cmFwcGVkID0gXyhbMSwgMiwgM10pO1xuICAgICAqXG4gICAgICogLy8gcmV0dXJucyBhbiB1bndyYXBwZWQgdmFsdWVcbiAgICAgKiB3cmFwcGVkLnJlZHVjZShmdW5jdGlvbihzdW0sIG51bSkge1xuICAgICAqICAgcmV0dXJuIHN1bSArIG51bTtcbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiA2XG4gICAgICpcbiAgICAgKiAvLyByZXR1cm5zIGEgd3JhcHBlZCB2YWx1ZVxuICAgICAqIHZhciBzcXVhcmVzID0gd3JhcHBlZC5tYXAoZnVuY3Rpb24obnVtKSB7XG4gICAgICogICByZXR1cm4gbnVtICogbnVtO1xuICAgICAqIH0pO1xuICAgICAqXG4gICAgICogXy5pc0FycmF5KHNxdWFyZXMpO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICpcbiAgICAgKiBfLmlzQXJyYXkoc3F1YXJlcy52YWx1ZSgpKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICovXG4gICAgZnVuY3Rpb24gbG9kYXNoKHZhbHVlKSB7XG4gICAgICAvLyBkb24ndCB3cmFwIGlmIGFscmVhZHkgd3JhcHBlZCwgZXZlbiBpZiB3cmFwcGVkIGJ5IGEgZGlmZmVyZW50IGBsb2Rhc2hgIGNvbnN0cnVjdG9yXG4gICAgICByZXR1cm4gKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyAmJiAhaXNBcnJheSh2YWx1ZSkgJiYgaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgJ19fd3JhcHBlZF9fJykpXG4gICAgICAgPyB2YWx1ZVxuICAgICAgIDogbmV3IGxvZGFzaFdyYXBwZXIodmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEEgZmFzdCBwYXRoIGZvciBjcmVhdGluZyBgbG9kYXNoYCB3cmFwcGVyIG9iamVjdHMuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHdyYXAgaW4gYSBgbG9kYXNoYCBpbnN0YW5jZS5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGNoYWluQWxsIEEgZmxhZyB0byBlbmFibGUgY2hhaW5pbmcgZm9yIGFsbCBtZXRob2RzXG4gICAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBhIGBsb2Rhc2hgIGluc3RhbmNlLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGxvZGFzaFdyYXBwZXIodmFsdWUsIGNoYWluQWxsKSB7XG4gICAgICB0aGlzLl9fY2hhaW5fXyA9ICEhY2hhaW5BbGw7XG4gICAgICB0aGlzLl9fd3JhcHBlZF9fID0gdmFsdWU7XG4gICAgfVxuICAgIC8vIGVuc3VyZSBgbmV3IGxvZGFzaFdyYXBwZXJgIGlzIGFuIGluc3RhbmNlIG9mIGBsb2Rhc2hgXG4gICAgbG9kYXNoV3JhcHBlci5wcm90b3R5cGUgPSBsb2Rhc2gucHJvdG90eXBlO1xuXG4gICAgLyoqXG4gICAgICogQW4gb2JqZWN0IHVzZWQgdG8gZmxhZyBlbnZpcm9ubWVudHMgZmVhdHVyZXMuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgKi9cbiAgICB2YXIgc3VwcG9ydCA9IGxvZGFzaC5zdXBwb3J0ID0ge307XG5cbiAgICAvKipcbiAgICAgKiBEZXRlY3QgaWYgZnVuY3Rpb25zIGNhbiBiZSBkZWNvbXBpbGVkIGJ5IGBGdW5jdGlvbiN0b1N0cmluZ2BcbiAgICAgKiAoYWxsIGJ1dCBQUzMgYW5kIG9sZGVyIE9wZXJhIG1vYmlsZSBicm93c2VycyAmIGF2b2lkZWQgaW4gV2luZG93cyA4IGFwcHMpLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIF8uc3VwcG9ydFxuICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgKi9cbiAgICBzdXBwb3J0LmZ1bmNEZWNvbXAgPSAhaXNOYXRpdmUoY29udGV4dC5XaW5SVEVycm9yKSAmJiByZVRoaXMudGVzdChydW5JbkNvbnRleHQpO1xuXG4gICAgLyoqXG4gICAgICogRGV0ZWN0IGlmIGBGdW5jdGlvbiNuYW1lYCBpcyBzdXBwb3J0ZWQgKGFsbCBidXQgSUUpLlxuICAgICAqXG4gICAgICogQG1lbWJlck9mIF8uc3VwcG9ydFxuICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgKi9cbiAgICBzdXBwb3J0LmZ1bmNOYW1lcyA9IHR5cGVvZiBGdW5jdGlvbi5uYW1lID09ICdzdHJpbmcnO1xuXG4gICAgLyoqXG4gICAgICogQnkgZGVmYXVsdCwgdGhlIHRlbXBsYXRlIGRlbGltaXRlcnMgdXNlZCBieSBMby1EYXNoIGFyZSBzaW1pbGFyIHRvIHRob3NlIGluXG4gICAgICogZW1iZWRkZWQgUnVieSAoRVJCKS4gQ2hhbmdlIHRoZSBmb2xsb3dpbmcgdGVtcGxhdGUgc2V0dGluZ3MgdG8gdXNlIGFsdGVybmF0aXZlXG4gICAgICogZGVsaW1pdGVycy5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAqL1xuICAgIGxvZGFzaC50ZW1wbGF0ZVNldHRpbmdzID0ge1xuXG4gICAgICAvKipcbiAgICAgICAqIFVzZWQgdG8gZGV0ZWN0IGBkYXRhYCBwcm9wZXJ0eSB2YWx1ZXMgdG8gYmUgSFRNTC1lc2NhcGVkLlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICAgICAqIEB0eXBlIFJlZ0V4cFxuICAgICAgICovXG4gICAgICAnZXNjYXBlJzogLzwlLShbXFxzXFxTXSs/KSU+L2csXG5cbiAgICAgIC8qKlxuICAgICAgICogVXNlZCB0byBkZXRlY3QgY29kZSB0byBiZSBldmFsdWF0ZWQuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgICAgICogQHR5cGUgUmVnRXhwXG4gICAgICAgKi9cbiAgICAgICdldmFsdWF0ZSc6IC88JShbXFxzXFxTXSs/KSU+L2csXG5cbiAgICAgIC8qKlxuICAgICAgICogVXNlZCB0byBkZXRlY3QgYGRhdGFgIHByb3BlcnR5IHZhbHVlcyB0byBpbmplY3QuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgICAgICogQHR5cGUgUmVnRXhwXG4gICAgICAgKi9cbiAgICAgICdpbnRlcnBvbGF0ZSc6IHJlSW50ZXJwb2xhdGUsXG5cbiAgICAgIC8qKlxuICAgICAgICogVXNlZCB0byByZWZlcmVuY2UgdGhlIGRhdGEgb2JqZWN0IGluIHRoZSB0ZW1wbGF0ZSB0ZXh0LlxuICAgICAgICpcbiAgICAgICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3NcbiAgICAgICAqIEB0eXBlIHN0cmluZ1xuICAgICAgICovXG4gICAgICAndmFyaWFibGUnOiAnJyxcblxuICAgICAgLyoqXG4gICAgICAgKiBVc2VkIHRvIGltcG9ydCB2YXJpYWJsZXMgaW50byB0aGUgY29tcGlsZWQgdGVtcGxhdGUuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgKi9cbiAgICAgICdpbXBvcnRzJzoge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBIHJlZmVyZW5jZSB0byB0aGUgYGxvZGFzaGAgZnVuY3Rpb24uXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXJPZiBfLnRlbXBsYXRlU2V0dGluZ3MuaW1wb3J0c1xuICAgICAgICAgKiBAdHlwZSBGdW5jdGlvblxuICAgICAgICAgKi9cbiAgICAgICAgJ18nOiBsb2Rhc2hcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvKipcbiAgICAgKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5iaW5kYCB0aGF0IGNyZWF0ZXMgdGhlIGJvdW5kIGZ1bmN0aW9uIGFuZFxuICAgICAqIHNldHMgaXRzIG1ldGEgZGF0YS5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtBcnJheX0gYmluZERhdGEgVGhlIGJpbmQgZGF0YSBhcnJheS5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBib3VuZCBmdW5jdGlvbi5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBiYXNlQmluZChiaW5kRGF0YSkge1xuICAgICAgdmFyIGZ1bmMgPSBiaW5kRGF0YVswXSxcbiAgICAgICAgICBwYXJ0aWFsQXJncyA9IGJpbmREYXRhWzJdLFxuICAgICAgICAgIHRoaXNBcmcgPSBiaW5kRGF0YVs0XTtcblxuICAgICAgZnVuY3Rpb24gYm91bmQoKSB7XG4gICAgICAgIC8vIGBGdW5jdGlvbiNiaW5kYCBzcGVjXG4gICAgICAgIC8vIGh0dHA6Ly9lczUuZ2l0aHViLmlvLyN4MTUuMy40LjVcbiAgICAgICAgaWYgKHBhcnRpYWxBcmdzKSB7XG4gICAgICAgICAgLy8gYXZvaWQgYGFyZ3VtZW50c2Agb2JqZWN0IGRlb3B0aW1pemF0aW9ucyBieSB1c2luZyBgc2xpY2VgIGluc3RlYWRcbiAgICAgICAgICAvLyBvZiBgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGxgIGFuZCBub3QgYXNzaWduaW5nIGBhcmd1bWVudHNgIHRvIGFcbiAgICAgICAgICAvLyB2YXJpYWJsZSBhcyBhIHRlcm5hcnkgZXhwcmVzc2lvblxuICAgICAgICAgIHZhciBhcmdzID0gc2xpY2UocGFydGlhbEFyZ3MpO1xuICAgICAgICAgIHB1c2guYXBwbHkoYXJncywgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBtaW1pYyB0aGUgY29uc3RydWN0b3IncyBgcmV0dXJuYCBiZWhhdmlvclxuICAgICAgICAvLyBodHRwOi8vZXM1LmdpdGh1Yi5pby8jeDEzLjIuMlxuICAgICAgICBpZiAodGhpcyBpbnN0YW5jZW9mIGJvdW5kKSB7XG4gICAgICAgICAgLy8gZW5zdXJlIGBuZXcgYm91bmRgIGlzIGFuIGluc3RhbmNlIG9mIGBmdW5jYFxuICAgICAgICAgIHZhciB0aGlzQmluZGluZyA9IGJhc2VDcmVhdGUoZnVuYy5wcm90b3R5cGUpLFxuICAgICAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXNCaW5kaW5nLCBhcmdzIHx8IGFyZ3VtZW50cyk7XG4gICAgICAgICAgcmV0dXJuIGlzT2JqZWN0KHJlc3VsdCkgPyByZXN1bHQgOiB0aGlzQmluZGluZztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzIHx8IGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgICBzZXRCaW5kRGF0YShib3VuZCwgYmluZERhdGEpO1xuICAgICAgcmV0dXJuIGJvdW5kO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmNsb25lYCB3aXRob3V0IGFyZ3VtZW50IGp1Z2dsaW5nIG9yIHN1cHBvcnRcbiAgICAgKiBmb3IgYHRoaXNBcmdgIGJpbmRpbmcuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNsb25lLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGVlcD1mYWxzZV0gU3BlY2lmeSBhIGRlZXAgY2xvbmUuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGNsb25pbmcgdmFsdWVzLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IFtzdGFja0E9W11dIFRyYWNrcyB0cmF2ZXJzZWQgc291cmNlIG9iamVjdHMuXG4gICAgICogQHBhcmFtIHtBcnJheX0gW3N0YWNrQj1bXV0gQXNzb2NpYXRlcyBjbG9uZXMgd2l0aCBzb3VyY2UgY291bnRlcnBhcnRzLlxuICAgICAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBjbG9uZWQgdmFsdWUuXG4gICAgICovXG4gICAgZnVuY3Rpb24gYmFzZUNsb25lKHZhbHVlLCBpc0RlZXAsIGNhbGxiYWNrLCBzdGFja0EsIHN0YWNrQikge1xuICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBjYWxsYmFjayh2YWx1ZSk7XG4gICAgICAgIGlmICh0eXBlb2YgcmVzdWx0ICE9ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gaW5zcGVjdCBbW0NsYXNzXV1cbiAgICAgIHZhciBpc09iaiA9IGlzT2JqZWN0KHZhbHVlKTtcbiAgICAgIGlmIChpc09iaikge1xuICAgICAgICB2YXIgY2xhc3NOYW1lID0gdG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gICAgICAgIGlmICghY2xvbmVhYmxlQ2xhc3Nlc1tjbGFzc05hbWVdKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjdG9yID0gY3RvckJ5Q2xhc3NbY2xhc3NOYW1lXTtcbiAgICAgICAgc3dpdGNoIChjbGFzc05hbWUpIHtcbiAgICAgICAgICBjYXNlIGJvb2xDbGFzczpcbiAgICAgICAgICBjYXNlIGRhdGVDbGFzczpcbiAgICAgICAgICAgIHJldHVybiBuZXcgY3RvcigrdmFsdWUpO1xuXG4gICAgICAgICAgY2FzZSBudW1iZXJDbGFzczpcbiAgICAgICAgICBjYXNlIHN0cmluZ0NsYXNzOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBjdG9yKHZhbHVlKTtcblxuICAgICAgICAgIGNhc2UgcmVnZXhwQ2xhc3M6XG4gICAgICAgICAgICByZXN1bHQgPSBjdG9yKHZhbHVlLnNvdXJjZSwgcmVGbGFncy5leGVjKHZhbHVlKSk7XG4gICAgICAgICAgICByZXN1bHQubGFzdEluZGV4ID0gdmFsdWUubGFzdEluZGV4O1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgICAgdmFyIGlzQXJyID0gaXNBcnJheSh2YWx1ZSk7XG4gICAgICBpZiAoaXNEZWVwKSB7XG4gICAgICAgIC8vIGNoZWNrIGZvciBjaXJjdWxhciByZWZlcmVuY2VzIGFuZCByZXR1cm4gY29ycmVzcG9uZGluZyBjbG9uZVxuICAgICAgICB2YXIgaW5pdGVkU3RhY2sgPSAhc3RhY2tBO1xuICAgICAgICBzdGFja0EgfHwgKHN0YWNrQSA9IGdldEFycmF5KCkpO1xuICAgICAgICBzdGFja0IgfHwgKHN0YWNrQiA9IGdldEFycmF5KCkpO1xuXG4gICAgICAgIHZhciBsZW5ndGggPSBzdGFja0EubGVuZ3RoO1xuICAgICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgICBpZiAoc3RhY2tBW2xlbmd0aF0gPT0gdmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBzdGFja0JbbGVuZ3RoXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ID0gaXNBcnIgPyBjdG9yKHZhbHVlLmxlbmd0aCkgOiB7fTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXN1bHQgPSBpc0FyciA/IHNsaWNlKHZhbHVlKSA6IGFzc2lnbih7fSwgdmFsdWUpO1xuICAgICAgfVxuICAgICAgLy8gYWRkIGFycmF5IHByb3BlcnRpZXMgYXNzaWduZWQgYnkgYFJlZ0V4cCNleGVjYFxuICAgICAgaWYgKGlzQXJyKSB7XG4gICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCAnaW5kZXgnKSkge1xuICAgICAgICAgIHJlc3VsdC5pbmRleCA9IHZhbHVlLmluZGV4O1xuICAgICAgICB9XG4gICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCAnaW5wdXQnKSkge1xuICAgICAgICAgIHJlc3VsdC5pbnB1dCA9IHZhbHVlLmlucHV0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBleGl0IGZvciBzaGFsbG93IGNsb25lXG4gICAgICBpZiAoIWlzRGVlcCkge1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgICAgLy8gYWRkIHRoZSBzb3VyY2UgdmFsdWUgdG8gdGhlIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzXG4gICAgICAvLyBhbmQgYXNzb2NpYXRlIGl0IHdpdGggaXRzIGNsb25lXG4gICAgICBzdGFja0EucHVzaCh2YWx1ZSk7XG4gICAgICBzdGFja0IucHVzaChyZXN1bHQpO1xuXG4gICAgICAvLyByZWN1cnNpdmVseSBwb3B1bGF0ZSBjbG9uZSAoc3VzY2VwdGlibGUgdG8gY2FsbCBzdGFjayBsaW1pdHMpXG4gICAgICAoaXNBcnIgPyBmb3JFYWNoIDogZm9yT3duKSh2YWx1ZSwgZnVuY3Rpb24ob2JqVmFsdWUsIGtleSkge1xuICAgICAgICByZXN1bHRba2V5XSA9IGJhc2VDbG9uZShvYmpWYWx1ZSwgaXNEZWVwLCBjYWxsYmFjaywgc3RhY2tBLCBzdGFja0IpO1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChpbml0ZWRTdGFjaykge1xuICAgICAgICByZWxlYXNlQXJyYXkoc3RhY2tBKTtcbiAgICAgICAgcmVsZWFzZUFycmF5KHN0YWNrQik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmNyZWF0ZWAgd2l0aG91dCBzdXBwb3J0IGZvciBhc3NpZ25pbmdcbiAgICAgKiBwcm9wZXJ0aWVzIHRvIHRoZSBjcmVhdGVkIG9iamVjdC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHByb3RvdHlwZSBUaGUgb2JqZWN0IHRvIGluaGVyaXQgZnJvbS5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBuZXcgb2JqZWN0LlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGJhc2VDcmVhdGUocHJvdG90eXBlLCBwcm9wZXJ0aWVzKSB7XG4gICAgICByZXR1cm4gaXNPYmplY3QocHJvdG90eXBlKSA/IG5hdGl2ZUNyZWF0ZShwcm90b3R5cGUpIDoge307XG4gICAgfVxuICAgIC8vIGZhbGxiYWNrIGZvciBicm93c2VycyB3aXRob3V0IGBPYmplY3QuY3JlYXRlYFxuICAgIGlmICghbmF0aXZlQ3JlYXRlKSB7XG4gICAgICBiYXNlQ3JlYXRlID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICBmdW5jdGlvbiBPYmplY3QoKSB7fVxuICAgICAgICByZXR1cm4gZnVuY3Rpb24ocHJvdG90eXBlKSB7XG4gICAgICAgICAgaWYgKGlzT2JqZWN0KHByb3RvdHlwZSkpIHtcbiAgICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUgPSBwcm90b3R5cGU7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbmV3IE9iamVjdDtcbiAgICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUgPSBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0IHx8IGNvbnRleHQuT2JqZWN0KCk7XG4gICAgICAgIH07XG4gICAgICB9KCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmNyZWF0ZUNhbGxiYWNrYCB3aXRob3V0IHN1cHBvcnQgZm9yIGNyZWF0aW5nXG4gICAgICogXCJfLnBsdWNrXCIgb3IgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tzLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0geyp9IFtmdW5jPWlkZW50aXR5XSBUaGUgdmFsdWUgdG8gY29udmVydCB0byBhIGNhbGxiYWNrLlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiB0aGUgY3JlYXRlZCBjYWxsYmFjay5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW2FyZ0NvdW50XSBUaGUgbnVtYmVyIG9mIGFyZ3VtZW50cyB0aGUgY2FsbGJhY2sgYWNjZXB0cy5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgYSBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBiYXNlQ3JlYXRlQ2FsbGJhY2soZnVuYywgdGhpc0FyZywgYXJnQ291bnQpIHtcbiAgICAgIGlmICh0eXBlb2YgZnVuYyAhPSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiBpZGVudGl0eTtcbiAgICAgIH1cbiAgICAgIC8vIGV4aXQgZWFybHkgZm9yIG5vIGB0aGlzQXJnYCBvciBhbHJlYWR5IGJvdW5kIGJ5IGBGdW5jdGlvbiNiaW5kYFxuICAgICAgaWYgKHR5cGVvZiB0aGlzQXJnID09ICd1bmRlZmluZWQnIHx8ICEoJ3Byb3RvdHlwZScgaW4gZnVuYykpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmM7XG4gICAgICB9XG4gICAgICB2YXIgYmluZERhdGEgPSBmdW5jLl9fYmluZERhdGFfXztcbiAgICAgIGlmICh0eXBlb2YgYmluZERhdGEgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgaWYgKHN1cHBvcnQuZnVuY05hbWVzKSB7XG4gICAgICAgICAgYmluZERhdGEgPSAhZnVuYy5uYW1lO1xuICAgICAgICB9XG4gICAgICAgIGJpbmREYXRhID0gYmluZERhdGEgfHwgIXN1cHBvcnQuZnVuY0RlY29tcDtcbiAgICAgICAgaWYgKCFiaW5kRGF0YSkge1xuICAgICAgICAgIHZhciBzb3VyY2UgPSBmblRvU3RyaW5nLmNhbGwoZnVuYyk7XG4gICAgICAgICAgaWYgKCFzdXBwb3J0LmZ1bmNOYW1lcykge1xuICAgICAgICAgICAgYmluZERhdGEgPSAhcmVGdW5jTmFtZS50ZXN0KHNvdXJjZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghYmluZERhdGEpIHtcbiAgICAgICAgICAgIC8vIGNoZWNrcyBpZiBgZnVuY2AgcmVmZXJlbmNlcyB0aGUgYHRoaXNgIGtleXdvcmQgYW5kIHN0b3JlcyB0aGUgcmVzdWx0XG4gICAgICAgICAgICBiaW5kRGF0YSA9IHJlVGhpcy50ZXN0KHNvdXJjZSk7XG4gICAgICAgICAgICBzZXRCaW5kRGF0YShmdW5jLCBiaW5kRGF0YSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBleGl0IGVhcmx5IGlmIHRoZXJlIGFyZSBubyBgdGhpc2AgcmVmZXJlbmNlcyBvciBgZnVuY2AgaXMgYm91bmRcbiAgICAgIGlmIChiaW5kRGF0YSA9PT0gZmFsc2UgfHwgKGJpbmREYXRhICE9PSB0cnVlICYmIGJpbmREYXRhWzFdICYgMSkpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmM7XG4gICAgICB9XG4gICAgICBzd2l0Y2ggKGFyZ0NvdW50KSB7XG4gICAgICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCB2YWx1ZSk7XG4gICAgICAgIH07XG4gICAgICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGEsIGIpO1xuICAgICAgICB9O1xuICAgICAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgICAgIH07XG4gICAgICAgIGNhc2UgNDogcmV0dXJuIGZ1bmN0aW9uKGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGJpbmQoZnVuYywgdGhpc0FyZyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGNyZWF0ZVdyYXBwZXJgIHRoYXQgY3JlYXRlcyB0aGUgd3JhcHBlciBhbmRcbiAgICAgKiBzZXRzIGl0cyBtZXRhIGRhdGEuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGJpbmREYXRhIFRoZSBiaW5kIGRhdGEgYXJyYXkuXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gICAgICovXG4gICAgZnVuY3Rpb24gYmFzZUNyZWF0ZVdyYXBwZXIoYmluZERhdGEpIHtcbiAgICAgIHZhciBmdW5jID0gYmluZERhdGFbMF0sXG4gICAgICAgICAgYml0bWFzayA9IGJpbmREYXRhWzFdLFxuICAgICAgICAgIHBhcnRpYWxBcmdzID0gYmluZERhdGFbMl0sXG4gICAgICAgICAgcGFydGlhbFJpZ2h0QXJncyA9IGJpbmREYXRhWzNdLFxuICAgICAgICAgIHRoaXNBcmcgPSBiaW5kRGF0YVs0XSxcbiAgICAgICAgICBhcml0eSA9IGJpbmREYXRhWzVdO1xuXG4gICAgICB2YXIgaXNCaW5kID0gYml0bWFzayAmIDEsXG4gICAgICAgICAgaXNCaW5kS2V5ID0gYml0bWFzayAmIDIsXG4gICAgICAgICAgaXNDdXJyeSA9IGJpdG1hc2sgJiA0LFxuICAgICAgICAgIGlzQ3VycnlCb3VuZCA9IGJpdG1hc2sgJiA4LFxuICAgICAgICAgIGtleSA9IGZ1bmM7XG5cbiAgICAgIGZ1bmN0aW9uIGJvdW5kKCkge1xuICAgICAgICB2YXIgdGhpc0JpbmRpbmcgPSBpc0JpbmQgPyB0aGlzQXJnIDogdGhpcztcbiAgICAgICAgaWYgKHBhcnRpYWxBcmdzKSB7XG4gICAgICAgICAgdmFyIGFyZ3MgPSBzbGljZShwYXJ0aWFsQXJncyk7XG4gICAgICAgICAgcHVzaC5hcHBseShhcmdzLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJ0aWFsUmlnaHRBcmdzIHx8IGlzQ3VycnkpIHtcbiAgICAgICAgICBhcmdzIHx8IChhcmdzID0gc2xpY2UoYXJndW1lbnRzKSk7XG4gICAgICAgICAgaWYgKHBhcnRpYWxSaWdodEFyZ3MpIHtcbiAgICAgICAgICAgIHB1c2guYXBwbHkoYXJncywgcGFydGlhbFJpZ2h0QXJncyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpc0N1cnJ5ICYmIGFyZ3MubGVuZ3RoIDwgYXJpdHkpIHtcbiAgICAgICAgICAgIGJpdG1hc2sgfD0gMTYgJiB+MzI7XG4gICAgICAgICAgICByZXR1cm4gYmFzZUNyZWF0ZVdyYXBwZXIoW2Z1bmMsIChpc0N1cnJ5Qm91bmQgPyBiaXRtYXNrIDogYml0bWFzayAmIH4zKSwgYXJncywgbnVsbCwgdGhpc0FyZywgYXJpdHldKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYXJncyB8fCAoYXJncyA9IGFyZ3VtZW50cyk7XG4gICAgICAgIGlmIChpc0JpbmRLZXkpIHtcbiAgICAgICAgICBmdW5jID0gdGhpc0JpbmRpbmdba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcyBpbnN0YW5jZW9mIGJvdW5kKSB7XG4gICAgICAgICAgdGhpc0JpbmRpbmcgPSBiYXNlQ3JlYXRlKGZ1bmMucHJvdG90eXBlKTtcbiAgICAgICAgICB2YXIgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzQmluZGluZywgYXJncyk7XG4gICAgICAgICAgcmV0dXJuIGlzT2JqZWN0KHJlc3VsdCkgPyByZXN1bHQgOiB0aGlzQmluZGluZztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzQmluZGluZywgYXJncyk7XG4gICAgICB9XG4gICAgICBzZXRCaW5kRGF0YShib3VuZCwgYmluZERhdGEpO1xuICAgICAgcmV0dXJuIGJvdW5kO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmRpZmZlcmVuY2VgIHRoYXQgYWNjZXB0cyBhIHNpbmdsZSBhcnJheVxuICAgICAqIG9mIHZhbHVlcyB0byBleGNsdWRlLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gcHJvY2Vzcy5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBbdmFsdWVzXSBUaGUgYXJyYXkgb2YgdmFsdWVzIHRvIGV4Y2x1ZGUuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGEgbmV3IGFycmF5IG9mIGZpbHRlcmVkIHZhbHVlcy5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBiYXNlRGlmZmVyZW5jZShhcnJheSwgdmFsdWVzKSB7XG4gICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICBpbmRleE9mID0gZ2V0SW5kZXhPZigpLFxuICAgICAgICAgIGxlbmd0aCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogMCxcbiAgICAgICAgICBpc0xhcmdlID0gbGVuZ3RoID49IGxhcmdlQXJyYXlTaXplICYmIGluZGV4T2YgPT09IGJhc2VJbmRleE9mLFxuICAgICAgICAgIHJlc3VsdCA9IFtdO1xuXG4gICAgICBpZiAoaXNMYXJnZSkge1xuICAgICAgICB2YXIgY2FjaGUgPSBjcmVhdGVDYWNoZSh2YWx1ZXMpO1xuICAgICAgICBpZiAoY2FjaGUpIHtcbiAgICAgICAgICBpbmRleE9mID0gY2FjaGVJbmRleE9mO1xuICAgICAgICAgIHZhbHVlcyA9IGNhY2hlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlzTGFyZ2UgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gYXJyYXlbaW5kZXhdO1xuICAgICAgICBpZiAoaW5kZXhPZih2YWx1ZXMsIHZhbHVlKSA8IDApIHtcbiAgICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChpc0xhcmdlKSB7XG4gICAgICAgIHJlbGVhc2VPYmplY3QodmFsdWVzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uZmxhdHRlbmAgd2l0aG91dCBzdXBwb3J0IGZvciBjYWxsYmFja1xuICAgICAqIHNob3J0aGFuZHMgb3IgYHRoaXNBcmdgIGJpbmRpbmcuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBmbGF0dGVuLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzU2hhbGxvdz1mYWxzZV0gQSBmbGFnIHRvIHJlc3RyaWN0IGZsYXR0ZW5pbmcgdG8gYSBzaW5nbGUgbGV2ZWwuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbaXNTdHJpY3Q9ZmFsc2VdIEEgZmxhZyB0byByZXN0cmljdCBmbGF0dGVuaW5nIHRvIGFycmF5cyBhbmQgYGFyZ3VtZW50c2Agb2JqZWN0cy5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW2Zyb21JbmRleD0wXSBUaGUgaW5kZXggdG8gc3RhcnQgZnJvbS5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYSBuZXcgZmxhdHRlbmVkIGFycmF5LlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGJhc2VGbGF0dGVuKGFycmF5LCBpc1NoYWxsb3csIGlzU3RyaWN0LCBmcm9tSW5kZXgpIHtcbiAgICAgIHZhciBpbmRleCA9IChmcm9tSW5kZXggfHwgMCkgLSAxLFxuICAgICAgICAgIGxlbmd0aCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogMCxcbiAgICAgICAgICByZXN1bHQgPSBbXTtcblxuICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gYXJyYXlbaW5kZXhdO1xuXG4gICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcgJiYgdHlwZW9mIHZhbHVlLmxlbmd0aCA9PSAnbnVtYmVyJ1xuICAgICAgICAgICAgJiYgKGlzQXJyYXkodmFsdWUpIHx8IGlzQXJndW1lbnRzKHZhbHVlKSkpIHtcbiAgICAgICAgICAvLyByZWN1cnNpdmVseSBmbGF0dGVuIGFycmF5cyAoc3VzY2VwdGlibGUgdG8gY2FsbCBzdGFjayBsaW1pdHMpXG4gICAgICAgICAgaWYgKCFpc1NoYWxsb3cpIHtcbiAgICAgICAgICAgIHZhbHVlID0gYmFzZUZsYXR0ZW4odmFsdWUsIGlzU2hhbGxvdywgaXNTdHJpY3QpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgdmFsSW5kZXggPSAtMSxcbiAgICAgICAgICAgICAgdmFsTGVuZ3RoID0gdmFsdWUubGVuZ3RoLFxuICAgICAgICAgICAgICByZXNJbmRleCA9IHJlc3VsdC5sZW5ndGg7XG5cbiAgICAgICAgICByZXN1bHQubGVuZ3RoICs9IHZhbExlbmd0aDtcbiAgICAgICAgICB3aGlsZSAoKyt2YWxJbmRleCA8IHZhbExlbmd0aCkge1xuICAgICAgICAgICAgcmVzdWx0W3Jlc0luZGV4KytdID0gdmFsdWVbdmFsSW5kZXhdO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICghaXNTdHJpY3QpIHtcbiAgICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNFcXVhbGAsIHdpdGhvdXQgc3VwcG9ydCBmb3IgYHRoaXNBcmdgIGJpbmRpbmcsXG4gICAgICogdGhhdCBhbGxvd3MgcGFydGlhbCBcIl8ud2hlcmVcIiBzdHlsZSBjb21wYXJpc29ucy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHsqfSBhIFRoZSB2YWx1ZSB0byBjb21wYXJlLlxuICAgICAqIEBwYXJhbSB7Kn0gYiBUaGUgb3RoZXIgdmFsdWUgdG8gY29tcGFyZS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29tcGFyaW5nIHZhbHVlcy5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbaXNXaGVyZT1mYWxzZV0gQSBmbGFnIHRvIGluZGljYXRlIHBlcmZvcm1pbmcgcGFydGlhbCBjb21wYXJpc29ucy5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBbc3RhY2tBPVtdXSBUcmFja3MgdHJhdmVyc2VkIGBhYCBvYmplY3RzLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IFtzdGFja0I9W11dIFRyYWNrcyB0cmF2ZXJzZWQgYGJgIG9iamVjdHMuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQsIGVsc2UgYGZhbHNlYC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBiYXNlSXNFcXVhbChhLCBiLCBjYWxsYmFjaywgaXNXaGVyZSwgc3RhY2tBLCBzdGFja0IpIHtcbiAgICAgIC8vIHVzZWQgdG8gaW5kaWNhdGUgdGhhdCB3aGVuIGNvbXBhcmluZyBvYmplY3RzLCBgYWAgaGFzIGF0IGxlYXN0IHRoZSBwcm9wZXJ0aWVzIG9mIGBiYFxuICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBjYWxsYmFjayhhLCBiKTtcbiAgICAgICAgaWYgKHR5cGVvZiByZXN1bHQgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICByZXR1cm4gISFyZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIGV4aXQgZWFybHkgZm9yIGlkZW50aWNhbCB2YWx1ZXNcbiAgICAgIGlmIChhID09PSBiKSB7XG4gICAgICAgIC8vIHRyZWF0IGArMGAgdnMuIGAtMGAgYXMgbm90IGVxdWFsXG4gICAgICAgIHJldHVybiBhICE9PSAwIHx8ICgxIC8gYSA9PSAxIC8gYik7XG4gICAgICB9XG4gICAgICB2YXIgdHlwZSA9IHR5cGVvZiBhLFxuICAgICAgICAgIG90aGVyVHlwZSA9IHR5cGVvZiBiO1xuXG4gICAgICAvLyBleGl0IGVhcmx5IGZvciB1bmxpa2UgcHJpbWl0aXZlIHZhbHVlc1xuICAgICAgaWYgKGEgPT09IGEgJiZcbiAgICAgICAgICAhKGEgJiYgb2JqZWN0VHlwZXNbdHlwZV0pICYmXG4gICAgICAgICAgIShiICYmIG9iamVjdFR5cGVzW290aGVyVHlwZV0pKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIC8vIGV4aXQgZWFybHkgZm9yIGBudWxsYCBhbmQgYHVuZGVmaW5lZGAgYXZvaWRpbmcgRVMzJ3MgRnVuY3Rpb24jY2FsbCBiZWhhdmlvclxuICAgICAgLy8gaHR0cDovL2VzNS5naXRodWIuaW8vI3gxNS4zLjQuNFxuICAgICAgaWYgKGEgPT0gbnVsbCB8fCBiID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGEgPT09IGI7XG4gICAgICB9XG4gICAgICAvLyBjb21wYXJlIFtbQ2xhc3NdXSBuYW1lc1xuICAgICAgdmFyIGNsYXNzTmFtZSA9IHRvU3RyaW5nLmNhbGwoYSksXG4gICAgICAgICAgb3RoZXJDbGFzcyA9IHRvU3RyaW5nLmNhbGwoYik7XG5cbiAgICAgIGlmIChjbGFzc05hbWUgPT0gYXJnc0NsYXNzKSB7XG4gICAgICAgIGNsYXNzTmFtZSA9IG9iamVjdENsYXNzO1xuICAgICAgfVxuICAgICAgaWYgKG90aGVyQ2xhc3MgPT0gYXJnc0NsYXNzKSB7XG4gICAgICAgIG90aGVyQ2xhc3MgPSBvYmplY3RDbGFzcztcbiAgICAgIH1cbiAgICAgIGlmIChjbGFzc05hbWUgIT0gb3RoZXJDbGFzcykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBzd2l0Y2ggKGNsYXNzTmFtZSkge1xuICAgICAgICBjYXNlIGJvb2xDbGFzczpcbiAgICAgICAgY2FzZSBkYXRlQ2xhc3M6XG4gICAgICAgICAgLy8gY29lcmNlIGRhdGVzIGFuZCBib29sZWFucyB0byBudW1iZXJzLCBkYXRlcyB0byBtaWxsaXNlY29uZHMgYW5kIGJvb2xlYW5zXG4gICAgICAgICAgLy8gdG8gYDFgIG9yIGAwYCB0cmVhdGluZyBpbnZhbGlkIGRhdGVzIGNvZXJjZWQgdG8gYE5hTmAgYXMgbm90IGVxdWFsXG4gICAgICAgICAgcmV0dXJuICthID09ICtiO1xuXG4gICAgICAgIGNhc2UgbnVtYmVyQ2xhc3M6XG4gICAgICAgICAgLy8gdHJlYXQgYE5hTmAgdnMuIGBOYU5gIGFzIGVxdWFsXG4gICAgICAgICAgcmV0dXJuIChhICE9ICthKVxuICAgICAgICAgICAgPyBiICE9ICtiXG4gICAgICAgICAgICAvLyBidXQgdHJlYXQgYCswYCB2cy4gYC0wYCBhcyBub3QgZXF1YWxcbiAgICAgICAgICAgIDogKGEgPT0gMCA/ICgxIC8gYSA9PSAxIC8gYikgOiBhID09ICtiKTtcblxuICAgICAgICBjYXNlIHJlZ2V4cENsYXNzOlxuICAgICAgICBjYXNlIHN0cmluZ0NsYXNzOlxuICAgICAgICAgIC8vIGNvZXJjZSByZWdleGVzIHRvIHN0cmluZ3MgKGh0dHA6Ly9lczUuZ2l0aHViLmlvLyN4MTUuMTAuNi40KVxuICAgICAgICAgIC8vIHRyZWF0IHN0cmluZyBwcmltaXRpdmVzIGFuZCB0aGVpciBjb3JyZXNwb25kaW5nIG9iamVjdCBpbnN0YW5jZXMgYXMgZXF1YWxcbiAgICAgICAgICByZXR1cm4gYSA9PSBTdHJpbmcoYik7XG4gICAgICB9XG4gICAgICB2YXIgaXNBcnIgPSBjbGFzc05hbWUgPT0gYXJyYXlDbGFzcztcbiAgICAgIGlmICghaXNBcnIpIHtcbiAgICAgICAgLy8gdW53cmFwIGFueSBgbG9kYXNoYCB3cmFwcGVkIHZhbHVlc1xuICAgICAgICB2YXIgYVdyYXBwZWQgPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKGEsICdfX3dyYXBwZWRfXycpLFxuICAgICAgICAgICAgYldyYXBwZWQgPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKGIsICdfX3dyYXBwZWRfXycpO1xuXG4gICAgICAgIGlmIChhV3JhcHBlZCB8fCBiV3JhcHBlZCkge1xuICAgICAgICAgIHJldHVybiBiYXNlSXNFcXVhbChhV3JhcHBlZCA/IGEuX193cmFwcGVkX18gOiBhLCBiV3JhcHBlZCA/IGIuX193cmFwcGVkX18gOiBiLCBjYWxsYmFjaywgaXNXaGVyZSwgc3RhY2tBLCBzdGFja0IpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGV4aXQgZm9yIGZ1bmN0aW9ucyBhbmQgRE9NIG5vZGVzXG4gICAgICAgIGlmIChjbGFzc05hbWUgIT0gb2JqZWN0Q2xhc3MpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaW4gb2xkZXIgdmVyc2lvbnMgb2YgT3BlcmEsIGBhcmd1bWVudHNgIG9iamVjdHMgaGF2ZSBgQXJyYXlgIGNvbnN0cnVjdG9yc1xuICAgICAgICB2YXIgY3RvckEgPSBhLmNvbnN0cnVjdG9yLFxuICAgICAgICAgICAgY3RvckIgPSBiLmNvbnN0cnVjdG9yO1xuXG4gICAgICAgIC8vIG5vbiBgT2JqZWN0YCBvYmplY3QgaW5zdGFuY2VzIHdpdGggZGlmZmVyZW50IGNvbnN0cnVjdG9ycyBhcmUgbm90IGVxdWFsXG4gICAgICAgIGlmIChjdG9yQSAhPSBjdG9yQiAmJlxuICAgICAgICAgICAgICAhKGlzRnVuY3Rpb24oY3RvckEpICYmIGN0b3JBIGluc3RhbmNlb2YgY3RvckEgJiYgaXNGdW5jdGlvbihjdG9yQikgJiYgY3RvckIgaW5zdGFuY2VvZiBjdG9yQikgJiZcbiAgICAgICAgICAgICAgKCdjb25zdHJ1Y3RvcicgaW4gYSAmJiAnY29uc3RydWN0b3InIGluIGIpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIGFzc3VtZSBjeWNsaWMgc3RydWN0dXJlcyBhcmUgZXF1YWxcbiAgICAgIC8vIHRoZSBhbGdvcml0aG0gZm9yIGRldGVjdGluZyBjeWNsaWMgc3RydWN0dXJlcyBpcyBhZGFwdGVkIGZyb20gRVMgNS4xXG4gICAgICAvLyBzZWN0aW9uIDE1LjEyLjMsIGFic3RyYWN0IG9wZXJhdGlvbiBgSk9gIChodHRwOi8vZXM1LmdpdGh1Yi5pby8jeDE1LjEyLjMpXG4gICAgICB2YXIgaW5pdGVkU3RhY2sgPSAhc3RhY2tBO1xuICAgICAgc3RhY2tBIHx8IChzdGFja0EgPSBnZXRBcnJheSgpKTtcbiAgICAgIHN0YWNrQiB8fCAoc3RhY2tCID0gZ2V0QXJyYXkoKSk7XG5cbiAgICAgIHZhciBsZW5ndGggPSBzdGFja0EubGVuZ3RoO1xuICAgICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAgIGlmIChzdGFja0FbbGVuZ3RoXSA9PSBhKSB7XG4gICAgICAgICAgcmV0dXJuIHN0YWNrQltsZW5ndGhdID09IGI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBzaXplID0gMDtcbiAgICAgIHJlc3VsdCA9IHRydWU7XG5cbiAgICAgIC8vIGFkZCBgYWAgYW5kIGBiYCB0byB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHNcbiAgICAgIHN0YWNrQS5wdXNoKGEpO1xuICAgICAgc3RhY2tCLnB1c2goYik7XG5cbiAgICAgIC8vIHJlY3Vyc2l2ZWx5IGNvbXBhcmUgb2JqZWN0cyBhbmQgYXJyYXlzIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cylcbiAgICAgIGlmIChpc0Fycikge1xuICAgICAgICAvLyBjb21wYXJlIGxlbmd0aHMgdG8gZGV0ZXJtaW5lIGlmIGEgZGVlcCBjb21wYXJpc29uIGlzIG5lY2Vzc2FyeVxuICAgICAgICBsZW5ndGggPSBhLmxlbmd0aDtcbiAgICAgICAgc2l6ZSA9IGIubGVuZ3RoO1xuICAgICAgICByZXN1bHQgPSBzaXplID09IGxlbmd0aDtcblxuICAgICAgICBpZiAocmVzdWx0IHx8IGlzV2hlcmUpIHtcbiAgICAgICAgICAvLyBkZWVwIGNvbXBhcmUgdGhlIGNvbnRlbnRzLCBpZ25vcmluZyBub24tbnVtZXJpYyBwcm9wZXJ0aWVzXG4gICAgICAgICAgd2hpbGUgKHNpemUtLSkge1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gbGVuZ3RoLFxuICAgICAgICAgICAgICAgIHZhbHVlID0gYltzaXplXTtcblxuICAgICAgICAgICAgaWYgKGlzV2hlcmUpIHtcbiAgICAgICAgICAgICAgd2hpbGUgKGluZGV4LS0pIHtcbiAgICAgICAgICAgICAgICBpZiAoKHJlc3VsdCA9IGJhc2VJc0VxdWFsKGFbaW5kZXhdLCB2YWx1ZSwgY2FsbGJhY2ssIGlzV2hlcmUsIHN0YWNrQSwgc3RhY2tCKSkpIHtcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICghKHJlc3VsdCA9IGJhc2VJc0VxdWFsKGFbc2l6ZV0sIHZhbHVlLCBjYWxsYmFjaywgaXNXaGVyZSwgc3RhY2tBLCBzdGFja0IpKSkge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyBkZWVwIGNvbXBhcmUgb2JqZWN0cyB1c2luZyBgZm9ySW5gLCBpbnN0ZWFkIG9mIGBmb3JPd25gLCB0byBhdm9pZCBgT2JqZWN0LmtleXNgXG4gICAgICAgIC8vIHdoaWNoLCBpbiB0aGlzIGNhc2UsIGlzIG1vcmUgY29zdGx5XG4gICAgICAgIGZvckluKGIsIGZ1bmN0aW9uKHZhbHVlLCBrZXksIGIpIHtcbiAgICAgICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChiLCBrZXkpKSB7XG4gICAgICAgICAgICAvLyBjb3VudCB0aGUgbnVtYmVyIG9mIHByb3BlcnRpZXMuXG4gICAgICAgICAgICBzaXplKys7XG4gICAgICAgICAgICAvLyBkZWVwIGNvbXBhcmUgZWFjaCBwcm9wZXJ0eSB2YWx1ZS5cbiAgICAgICAgICAgIHJldHVybiAocmVzdWx0ID0gaGFzT3duUHJvcGVydHkuY2FsbChhLCBrZXkpICYmIGJhc2VJc0VxdWFsKGFba2V5XSwgdmFsdWUsIGNhbGxiYWNrLCBpc1doZXJlLCBzdGFja0EsIHN0YWNrQikpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHJlc3VsdCAmJiAhaXNXaGVyZSkge1xuICAgICAgICAgIC8vIGVuc3VyZSBib3RoIG9iamVjdHMgaGF2ZSB0aGUgc2FtZSBudW1iZXIgb2YgcHJvcGVydGllc1xuICAgICAgICAgIGZvckluKGEsIGZ1bmN0aW9uKHZhbHVlLCBrZXksIGEpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGEsIGtleSkpIHtcbiAgICAgICAgICAgICAgLy8gYHNpemVgIHdpbGwgYmUgYC0xYCBpZiBgYWAgaGFzIG1vcmUgcHJvcGVydGllcyB0aGFuIGBiYFxuICAgICAgICAgICAgICByZXR1cm4gKHJlc3VsdCA9IC0tc2l6ZSA+IC0xKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc3RhY2tBLnBvcCgpO1xuICAgICAgc3RhY2tCLnBvcCgpO1xuXG4gICAgICBpZiAoaW5pdGVkU3RhY2spIHtcbiAgICAgICAgcmVsZWFzZUFycmF5KHN0YWNrQSk7XG4gICAgICAgIHJlbGVhc2VBcnJheShzdGFja0IpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5tZXJnZWAgd2l0aG91dCBhcmd1bWVudCBqdWdnbGluZyBvciBzdXBwb3J0XG4gICAgICogZm9yIGB0aGlzQXJnYCBiaW5kaW5nLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgc291cmNlIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgbWVyZ2luZyBwcm9wZXJ0aWVzLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IFtzdGFja0E9W11dIFRyYWNrcyB0cmF2ZXJzZWQgc291cmNlIG9iamVjdHMuXG4gICAgICogQHBhcmFtIHtBcnJheX0gW3N0YWNrQj1bXV0gQXNzb2NpYXRlcyB2YWx1ZXMgd2l0aCBzb3VyY2UgY291bnRlcnBhcnRzLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGJhc2VNZXJnZShvYmplY3QsIHNvdXJjZSwgY2FsbGJhY2ssIHN0YWNrQSwgc3RhY2tCKSB7XG4gICAgICAoaXNBcnJheShzb3VyY2UpID8gZm9yRWFjaCA6IGZvck93bikoc291cmNlLCBmdW5jdGlvbihzb3VyY2UsIGtleSkge1xuICAgICAgICB2YXIgZm91bmQsXG4gICAgICAgICAgICBpc0FycixcbiAgICAgICAgICAgIHJlc3VsdCA9IHNvdXJjZSxcbiAgICAgICAgICAgIHZhbHVlID0gb2JqZWN0W2tleV07XG5cbiAgICAgICAgaWYgKHNvdXJjZSAmJiAoKGlzQXJyID0gaXNBcnJheShzb3VyY2UpKSB8fCBpc1BsYWluT2JqZWN0KHNvdXJjZSkpKSB7XG4gICAgICAgICAgLy8gYXZvaWQgbWVyZ2luZyBwcmV2aW91c2x5IG1lcmdlZCBjeWNsaWMgc291cmNlc1xuICAgICAgICAgIHZhciBzdGFja0xlbmd0aCA9IHN0YWNrQS5sZW5ndGg7XG4gICAgICAgICAgd2hpbGUgKHN0YWNrTGVuZ3RoLS0pIHtcbiAgICAgICAgICAgIGlmICgoZm91bmQgPSBzdGFja0Fbc3RhY2tMZW5ndGhdID09IHNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgdmFsdWUgPSBzdGFja0Jbc3RhY2tMZW5ndGhdO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICAgICAgdmFyIGlzU2hhbGxvdztcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICByZXN1bHQgPSBjYWxsYmFjayh2YWx1ZSwgc291cmNlKTtcbiAgICAgICAgICAgICAgaWYgKChpc1NoYWxsb3cgPSB0eXBlb2YgcmVzdWx0ICE9ICd1bmRlZmluZWQnKSkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gcmVzdWx0O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlzU2hhbGxvdykge1xuICAgICAgICAgICAgICB2YWx1ZSA9IGlzQXJyXG4gICAgICAgICAgICAgICAgPyAoaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZSA6IFtdKVxuICAgICAgICAgICAgICAgIDogKGlzUGxhaW5PYmplY3QodmFsdWUpID8gdmFsdWUgOiB7fSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBhZGQgYHNvdXJjZWAgYW5kIGFzc29jaWF0ZWQgYHZhbHVlYCB0byB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHNcbiAgICAgICAgICAgIHN0YWNrQS5wdXNoKHNvdXJjZSk7XG4gICAgICAgICAgICBzdGFja0IucHVzaCh2YWx1ZSk7XG5cbiAgICAgICAgICAgIC8vIHJlY3Vyc2l2ZWx5IG1lcmdlIG9iamVjdHMgYW5kIGFycmF5cyAoc3VzY2VwdGlibGUgdG8gY2FsbCBzdGFjayBsaW1pdHMpXG4gICAgICAgICAgICBpZiAoIWlzU2hhbGxvdykge1xuICAgICAgICAgICAgICBiYXNlTWVyZ2UodmFsdWUsIHNvdXJjZSwgY2FsbGJhY2ssIHN0YWNrQSwgc3RhY2tCKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBjYWxsYmFjayh2YWx1ZSwgc291cmNlKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVzdWx0ID09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgIHJlc3VsdCA9IHNvdXJjZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHR5cGVvZiByZXN1bHQgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHZhbHVlID0gcmVzdWx0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBvYmplY3Rba2V5XSA9IHZhbHVlO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ucmFuZG9tYCB3aXRob3V0IGFyZ3VtZW50IGp1Z2dsaW5nIG9yIHN1cHBvcnRcbiAgICAgKiBmb3IgcmV0dXJuaW5nIGZsb2F0aW5nLXBvaW50IG51bWJlcnMuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtaW4gVGhlIG1pbmltdW0gcG9zc2libGUgdmFsdWUuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heCBUaGUgbWF4aW11bSBwb3NzaWJsZSB2YWx1ZS5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIGEgcmFuZG9tIG51bWJlci5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBiYXNlUmFuZG9tKG1pbiwgbWF4KSB7XG4gICAgICByZXR1cm4gbWluICsgZmxvb3IobmF0aXZlUmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnVuaXFgIHdpdGhvdXQgc3VwcG9ydCBmb3IgY2FsbGJhY2sgc2hvcnRoYW5kc1xuICAgICAqIG9yIGB0aGlzQXJnYCBiaW5kaW5nLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gcHJvY2Vzcy5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc1NvcnRlZD1mYWxzZV0gQSBmbGFnIHRvIGluZGljYXRlIHRoYXQgYGFycmF5YCBpcyBzb3J0ZWQuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrXSBUaGUgZnVuY3Rpb24gY2FsbGVkIHBlciBpdGVyYXRpb24uXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGEgZHVwbGljYXRlLXZhbHVlLWZyZWUgYXJyYXkuXG4gICAgICovXG4gICAgZnVuY3Rpb24gYmFzZVVuaXEoYXJyYXksIGlzU29ydGVkLCBjYWxsYmFjaykge1xuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgaW5kZXhPZiA9IGdldEluZGV4T2YoKSxcbiAgICAgICAgICBsZW5ndGggPSBhcnJheSA/IGFycmF5Lmxlbmd0aCA6IDAsXG4gICAgICAgICAgcmVzdWx0ID0gW107XG5cbiAgICAgIHZhciBpc0xhcmdlID0gIWlzU29ydGVkICYmIGxlbmd0aCA+PSBsYXJnZUFycmF5U2l6ZSAmJiBpbmRleE9mID09PSBiYXNlSW5kZXhPZixcbiAgICAgICAgICBzZWVuID0gKGNhbGxiYWNrIHx8IGlzTGFyZ2UpID8gZ2V0QXJyYXkoKSA6IHJlc3VsdDtcblxuICAgICAgaWYgKGlzTGFyZ2UpIHtcbiAgICAgICAgdmFyIGNhY2hlID0gY3JlYXRlQ2FjaGUoc2Vlbik7XG4gICAgICAgIGluZGV4T2YgPSBjYWNoZUluZGV4T2Y7XG4gICAgICAgIHNlZW4gPSBjYWNoZTtcbiAgICAgIH1cbiAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGFycmF5W2luZGV4XSxcbiAgICAgICAgICAgIGNvbXB1dGVkID0gY2FsbGJhY2sgPyBjYWxsYmFjayh2YWx1ZSwgaW5kZXgsIGFycmF5KSA6IHZhbHVlO1xuXG4gICAgICAgIGlmIChpc1NvcnRlZFxuICAgICAgICAgICAgICA/ICFpbmRleCB8fCBzZWVuW3NlZW4ubGVuZ3RoIC0gMV0gIT09IGNvbXB1dGVkXG4gICAgICAgICAgICAgIDogaW5kZXhPZihzZWVuLCBjb21wdXRlZCkgPCAwXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICBpZiAoY2FsbGJhY2sgfHwgaXNMYXJnZSkge1xuICAgICAgICAgICAgc2Vlbi5wdXNoKGNvbXB1dGVkKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoaXNMYXJnZSkge1xuICAgICAgICByZWxlYXNlQXJyYXkoc2Vlbi5hcnJheSk7XG4gICAgICAgIHJlbGVhc2VPYmplY3Qoc2Vlbik7XG4gICAgICB9IGVsc2UgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIHJlbGVhc2VBcnJheShzZWVuKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgYWdncmVnYXRlcyBhIGNvbGxlY3Rpb24sIGNyZWF0aW5nIGFuIG9iamVjdCBjb21wb3NlZFxuICAgICAqIG9mIGtleXMgZ2VuZXJhdGVkIGZyb20gdGhlIHJlc3VsdHMgb2YgcnVubmluZyBlYWNoIGVsZW1lbnQgb2YgdGhlIGNvbGxlY3Rpb25cbiAgICAgKiB0aHJvdWdoIGEgY2FsbGJhY2suIFRoZSBnaXZlbiBgc2V0dGVyYCBmdW5jdGlvbiBzZXRzIHRoZSBrZXlzIGFuZCB2YWx1ZXNcbiAgICAgKiBvZiB0aGUgY29tcG9zZWQgb2JqZWN0LlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBzZXR0ZXIgVGhlIHNldHRlciBmdW5jdGlvbi5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBhZ2dyZWdhdG9yIGZ1bmN0aW9uLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNyZWF0ZUFnZ3JlZ2F0b3Ioc2V0dGVyKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oY29sbGVjdGlvbiwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG5cbiAgICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgICBsZW5ndGggPSBjb2xsZWN0aW9uID8gY29sbGVjdGlvbi5sZW5ndGggOiAwO1xuXG4gICAgICAgIGlmICh0eXBlb2YgbGVuZ3RoID09ICdudW1iZXInKSB7XG4gICAgICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGNvbGxlY3Rpb25baW5kZXhdO1xuICAgICAgICAgICAgc2V0dGVyKHJlc3VsdCwgdmFsdWUsIGNhbGxiYWNrKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbiksIGNvbGxlY3Rpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmb3JPd24oY29sbGVjdGlvbiwgZnVuY3Rpb24odmFsdWUsIGtleSwgY29sbGVjdGlvbikge1xuICAgICAgICAgICAgc2V0dGVyKHJlc3VsdCwgdmFsdWUsIGNhbGxiYWNrKHZhbHVlLCBrZXksIGNvbGxlY3Rpb24pLCBjb2xsZWN0aW9uKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsIGVpdGhlciBjdXJyaWVzIG9yIGludm9rZXMgYGZ1bmNgXG4gICAgICogd2l0aCBhbiBvcHRpb25hbCBgdGhpc2AgYmluZGluZyBhbmQgcGFydGlhbGx5IGFwcGxpZWQgYXJndW1lbnRzLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufHN0cmluZ30gZnVuYyBUaGUgZnVuY3Rpb24gb3IgbWV0aG9kIG5hbWUgdG8gcmVmZXJlbmNlLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBiaXRtYXNrIFRoZSBiaXRtYXNrIG9mIG1ldGhvZCBmbGFncyB0byBjb21wb3NlLlxuICAgICAqICBUaGUgYml0bWFzayBtYXkgYmUgY29tcG9zZWQgb2YgdGhlIGZvbGxvd2luZyBmbGFnczpcbiAgICAgKiAgMSAtIGBfLmJpbmRgXG4gICAgICogIDIgLSBgXy5iaW5kS2V5YFxuICAgICAqICA0IC0gYF8uY3VycnlgXG4gICAgICogIDggLSBgXy5jdXJyeWAgKGJvdW5kKVxuICAgICAqICAxNiAtIGBfLnBhcnRpYWxgXG4gICAgICogIDMyIC0gYF8ucGFydGlhbFJpZ2h0YFxuICAgICAqIEBwYXJhbSB7QXJyYXl9IFtwYXJ0aWFsQXJnc10gQW4gYXJyYXkgb2YgYXJndW1lbnRzIHRvIHByZXBlbmQgdG8gdGhvc2VcbiAgICAgKiAgcHJvdmlkZWQgdG8gdGhlIG5ldyBmdW5jdGlvbi5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBbcGFydGlhbFJpZ2h0QXJnc10gQW4gYXJyYXkgb2YgYXJndW1lbnRzIHRvIGFwcGVuZCB0byB0aG9zZVxuICAgICAqICBwcm92aWRlZCB0byB0aGUgbmV3IGZ1bmN0aW9uLlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgZnVuY2AuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFthcml0eV0gVGhlIGFyaXR5IG9mIGBmdW5jYC5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjcmVhdGVXcmFwcGVyKGZ1bmMsIGJpdG1hc2ssIHBhcnRpYWxBcmdzLCBwYXJ0aWFsUmlnaHRBcmdzLCB0aGlzQXJnLCBhcml0eSkge1xuICAgICAgdmFyIGlzQmluZCA9IGJpdG1hc2sgJiAxLFxuICAgICAgICAgIGlzQmluZEtleSA9IGJpdG1hc2sgJiAyLFxuICAgICAgICAgIGlzQ3VycnkgPSBiaXRtYXNrICYgNCxcbiAgICAgICAgICBpc0N1cnJ5Qm91bmQgPSBiaXRtYXNrICYgOCxcbiAgICAgICAgICBpc1BhcnRpYWwgPSBiaXRtYXNrICYgMTYsXG4gICAgICAgICAgaXNQYXJ0aWFsUmlnaHQgPSBiaXRtYXNrICYgMzI7XG5cbiAgICAgIGlmICghaXNCaW5kS2V5ICYmICFpc0Z1bmN0aW9uKGZ1bmMpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3I7XG4gICAgICB9XG4gICAgICBpZiAoaXNQYXJ0aWFsICYmICFwYXJ0aWFsQXJncy5sZW5ndGgpIHtcbiAgICAgICAgYml0bWFzayAmPSB+MTY7XG4gICAgICAgIGlzUGFydGlhbCA9IHBhcnRpYWxBcmdzID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoaXNQYXJ0aWFsUmlnaHQgJiYgIXBhcnRpYWxSaWdodEFyZ3MubGVuZ3RoKSB7XG4gICAgICAgIGJpdG1hc2sgJj0gfjMyO1xuICAgICAgICBpc1BhcnRpYWxSaWdodCA9IHBhcnRpYWxSaWdodEFyZ3MgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHZhciBiaW5kRGF0YSA9IGZ1bmMgJiYgZnVuYy5fX2JpbmREYXRhX187XG4gICAgICBpZiAoYmluZERhdGEgJiYgYmluZERhdGEgIT09IHRydWUpIHtcbiAgICAgICAgLy8gY2xvbmUgYGJpbmREYXRhYFxuICAgICAgICBiaW5kRGF0YSA9IHNsaWNlKGJpbmREYXRhKTtcbiAgICAgICAgaWYgKGJpbmREYXRhWzJdKSB7XG4gICAgICAgICAgYmluZERhdGFbMl0gPSBzbGljZShiaW5kRGF0YVsyXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJpbmREYXRhWzNdKSB7XG4gICAgICAgICAgYmluZERhdGFbM10gPSBzbGljZShiaW5kRGF0YVszXSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gc2V0IGB0aGlzQmluZGluZ2AgaXMgbm90IHByZXZpb3VzbHkgYm91bmRcbiAgICAgICAgaWYgKGlzQmluZCAmJiAhKGJpbmREYXRhWzFdICYgMSkpIHtcbiAgICAgICAgICBiaW5kRGF0YVs0XSA9IHRoaXNBcmc7XG4gICAgICAgIH1cbiAgICAgICAgLy8gc2V0IGlmIHByZXZpb3VzbHkgYm91bmQgYnV0IG5vdCBjdXJyZW50bHkgKHN1YnNlcXVlbnQgY3VycmllZCBmdW5jdGlvbnMpXG4gICAgICAgIGlmICghaXNCaW5kICYmIGJpbmREYXRhWzFdICYgMSkge1xuICAgICAgICAgIGJpdG1hc2sgfD0gODtcbiAgICAgICAgfVxuICAgICAgICAvLyBzZXQgY3VycmllZCBhcml0eSBpZiBub3QgeWV0IHNldFxuICAgICAgICBpZiAoaXNDdXJyeSAmJiAhKGJpbmREYXRhWzFdICYgNCkpIHtcbiAgICAgICAgICBiaW5kRGF0YVs1XSA9IGFyaXR5O1xuICAgICAgICB9XG4gICAgICAgIC8vIGFwcGVuZCBwYXJ0aWFsIGxlZnQgYXJndW1lbnRzXG4gICAgICAgIGlmIChpc1BhcnRpYWwpIHtcbiAgICAgICAgICBwdXNoLmFwcGx5KGJpbmREYXRhWzJdIHx8IChiaW5kRGF0YVsyXSA9IFtdKSwgcGFydGlhbEFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGFwcGVuZCBwYXJ0aWFsIHJpZ2h0IGFyZ3VtZW50c1xuICAgICAgICBpZiAoaXNQYXJ0aWFsUmlnaHQpIHtcbiAgICAgICAgICB1bnNoaWZ0LmFwcGx5KGJpbmREYXRhWzNdIHx8IChiaW5kRGF0YVszXSA9IFtdKSwgcGFydGlhbFJpZ2h0QXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gbWVyZ2UgZmxhZ3NcbiAgICAgICAgYmluZERhdGFbMV0gfD0gYml0bWFzaztcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVdyYXBwZXIuYXBwbHkobnVsbCwgYmluZERhdGEpO1xuICAgICAgfVxuICAgICAgLy8gZmFzdCBwYXRoIGZvciBgXy5iaW5kYFxuICAgICAgdmFyIGNyZWF0ZXIgPSAoYml0bWFzayA9PSAxIHx8IGJpdG1hc2sgPT09IDE3KSA/IGJhc2VCaW5kIDogYmFzZUNyZWF0ZVdyYXBwZXI7XG4gICAgICByZXR1cm4gY3JlYXRlcihbZnVuYywgYml0bWFzaywgcGFydGlhbEFyZ3MsIHBhcnRpYWxSaWdodEFyZ3MsIHRoaXNBcmcsIGFyaXR5XSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXNlZCBieSBgZXNjYXBlYCB0byBjb252ZXJ0IGNoYXJhY3RlcnMgdG8gSFRNTCBlbnRpdGllcy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1hdGNoIFRoZSBtYXRjaGVkIGNoYXJhY3RlciB0byBlc2NhcGUuXG4gICAgICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgZXNjYXBlZCBjaGFyYWN0ZXIuXG4gICAgICovXG4gICAgZnVuY3Rpb24gZXNjYXBlSHRtbENoYXIobWF0Y2gpIHtcbiAgICAgIHJldHVybiBodG1sRXNjYXBlc1ttYXRjaF07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgYXBwcm9wcmlhdGUgXCJpbmRleE9mXCIgZnVuY3Rpb24uIElmIHRoZSBgXy5pbmRleE9mYCBtZXRob2QgaXNcbiAgICAgKiBjdXN0b21pemVkLCB0aGlzIG1ldGhvZCByZXR1cm5zIHRoZSBjdXN0b20gbWV0aG9kLCBvdGhlcndpc2UgaXQgcmV0dXJuc1xuICAgICAqIHRoZSBgYmFzZUluZGV4T2ZgIGZ1bmN0aW9uLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIFwiaW5kZXhPZlwiIGZ1bmN0aW9uLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdldEluZGV4T2YoKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gKHJlc3VsdCA9IGxvZGFzaC5pbmRleE9mKSA9PT0gaW5kZXhPZiA/IGJhc2VJbmRleE9mIDogcmVzdWx0O1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIG5hdGl2ZSBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGEgbmF0aXZlIGZ1bmN0aW9uLCBlbHNlIGBmYWxzZWAuXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNOYXRpdmUodmFsdWUpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ2Z1bmN0aW9uJyAmJiByZU5hdGl2ZS50ZXN0KHZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIGB0aGlzYCBiaW5kaW5nIGRhdGEgb24gYSBnaXZlbiBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gc2V0IGRhdGEgb24uXG4gICAgICogQHBhcmFtIHtBcnJheX0gdmFsdWUgVGhlIGRhdGEgYXJyYXkgdG8gc2V0LlxuICAgICAqL1xuICAgIHZhciBzZXRCaW5kRGF0YSA9ICFkZWZpbmVQcm9wZXJ0eSA/IG5vb3AgOiBmdW5jdGlvbihmdW5jLCB2YWx1ZSkge1xuICAgICAgZGVzY3JpcHRvci52YWx1ZSA9IHZhbHVlO1xuICAgICAgZGVmaW5lUHJvcGVydHkoZnVuYywgJ19fYmluZERhdGFfXycsIGRlc2NyaXB0b3IpO1xuICAgICAgZGVzY3JpcHRvci52YWx1ZSA9IG51bGw7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEEgZmFsbGJhY2sgaW1wbGVtZW50YXRpb24gb2YgYGlzUGxhaW5PYmplY3RgIHdoaWNoIGNoZWNrcyBpZiBhIGdpdmVuIHZhbHVlXG4gICAgICogaXMgYW4gb2JqZWN0IGNyZWF0ZWQgYnkgdGhlIGBPYmplY3RgIGNvbnN0cnVjdG9yLCBhc3N1bWluZyBvYmplY3RzIGNyZWF0ZWRcbiAgICAgKiBieSB0aGUgYE9iamVjdGAgY29uc3RydWN0b3IgaGF2ZSBubyBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0aWVzIGFuZCB0aGF0XG4gICAgICogdGhlcmUgYXJlIG5vIGBPYmplY3QucHJvdG90eXBlYCBleHRlbnNpb25zLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHBsYWluIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNoaW1Jc1BsYWluT2JqZWN0KHZhbHVlKSB7XG4gICAgICB2YXIgY3RvcixcbiAgICAgICAgICByZXN1bHQ7XG5cbiAgICAgIC8vIGF2b2lkIG5vbiBPYmplY3Qgb2JqZWN0cywgYGFyZ3VtZW50c2Agb2JqZWN0cywgYW5kIERPTSBlbGVtZW50c1xuICAgICAgaWYgKCEodmFsdWUgJiYgdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gb2JqZWN0Q2xhc3MpIHx8XG4gICAgICAgICAgKGN0b3IgPSB2YWx1ZS5jb25zdHJ1Y3RvciwgaXNGdW5jdGlvbihjdG9yKSAmJiAhKGN0b3IgaW5zdGFuY2VvZiBjdG9yKSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgLy8gSW4gbW9zdCBlbnZpcm9ubWVudHMgYW4gb2JqZWN0J3Mgb3duIHByb3BlcnRpZXMgYXJlIGl0ZXJhdGVkIGJlZm9yZVxuICAgICAgLy8gaXRzIGluaGVyaXRlZCBwcm9wZXJ0aWVzLiBJZiB0aGUgbGFzdCBpdGVyYXRlZCBwcm9wZXJ0eSBpcyBhbiBvYmplY3Qnc1xuICAgICAgLy8gb3duIHByb3BlcnR5IHRoZW4gdGhlcmUgYXJlIG5vIGluaGVyaXRlZCBlbnVtZXJhYmxlIHByb3BlcnRpZXMuXG4gICAgICBmb3JJbih2YWx1ZSwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICByZXN1bHQgPSBrZXk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0eXBlb2YgcmVzdWx0ID09ICd1bmRlZmluZWQnIHx8IGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIHJlc3VsdCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXNlZCBieSBgdW5lc2NhcGVgIHRvIGNvbnZlcnQgSFRNTCBlbnRpdGllcyB0byBjaGFyYWN0ZXJzLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbWF0Y2ggVGhlIG1hdGNoZWQgY2hhcmFjdGVyIHRvIHVuZXNjYXBlLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHVuZXNjYXBlZCBjaGFyYWN0ZXIuXG4gICAgICovXG4gICAgZnVuY3Rpb24gdW5lc2NhcGVIdG1sQ2hhcihtYXRjaCkge1xuICAgICAgcmV0dXJuIGh0bWxVbmVzY2FwZXNbbWF0Y2hdO1xuICAgIH1cblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIChmdW5jdGlvbigpIHsgcmV0dXJuIF8uaXNBcmd1bWVudHMoYXJndW1lbnRzKTsgfSkoMSwgMiwgMyk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqXG4gICAgICogXy5pc0FyZ3VtZW50cyhbMSwgMiwgM10pO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNBcmd1bWVudHModmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcgJiYgdHlwZW9mIHZhbHVlLmxlbmd0aCA9PSAnbnVtYmVyJyAmJlxuICAgICAgICB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PSBhcmdzQ2xhc3MgfHwgZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYW4gYXJyYXkuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAdHlwZSBGdW5jdGlvblxuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGFuIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIChmdW5jdGlvbigpIHsgcmV0dXJuIF8uaXNBcnJheShhcmd1bWVudHMpOyB9KSgpO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICpcbiAgICAgKiBfLmlzQXJyYXkoWzEsIDIsIDNdKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICovXG4gICAgdmFyIGlzQXJyYXkgPSBuYXRpdmVJc0FycmF5IHx8IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnICYmIHR5cGVvZiB2YWx1ZS5sZW5ndGggPT0gJ251bWJlcicgJiZcbiAgICAgICAgdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gYXJyYXlDbGFzcyB8fCBmYWxzZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQSBmYWxsYmFjayBpbXBsZW1lbnRhdGlvbiBvZiBgT2JqZWN0LmtleXNgIHdoaWNoIHByb2R1Y2VzIGFuIGFycmF5IG9mIHRoZVxuICAgICAqIGdpdmVuIG9iamVjdCdzIG93biBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSBGdW5jdGlvblxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpbnNwZWN0LlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhbiBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAgICAgKi9cbiAgICB2YXIgc2hpbUtleXMgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICAgIHZhciBpbmRleCwgaXRlcmFibGUgPSBvYmplY3QsIHJlc3VsdCA9IFtdO1xuICAgICAgaWYgKCFpdGVyYWJsZSkgcmV0dXJuIHJlc3VsdDtcbiAgICAgIGlmICghKG9iamVjdFR5cGVzW3R5cGVvZiBvYmplY3RdKSkgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgZm9yIChpbmRleCBpbiBpdGVyYWJsZSkge1xuICAgICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGl0ZXJhYmxlLCBpbmRleCkpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGluZGV4KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBhcnJheSBjb21wb3NlZCBvZiB0aGUgb3duIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgYW4gb2JqZWN0LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaW5zcGVjdC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYW4gYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8ua2V5cyh7ICdvbmUnOiAxLCAndHdvJzogMiwgJ3RocmVlJzogMyB9KTtcbiAgICAgKiAvLyA9PiBbJ29uZScsICd0d28nLCAndGhyZWUnXSAocHJvcGVydHkgb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQgYWNyb3NzIGVudmlyb25tZW50cylcbiAgICAgKi9cbiAgICB2YXIga2V5cyA9ICFuYXRpdmVLZXlzID8gc2hpbUtleXMgOiBmdW5jdGlvbihvYmplY3QpIHtcbiAgICAgIGlmICghaXNPYmplY3Qob2JqZWN0KSkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG4gICAgICByZXR1cm4gbmF0aXZlS2V5cyhvYmplY3QpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBVc2VkIHRvIGNvbnZlcnQgY2hhcmFjdGVycyB0byBIVE1MIGVudGl0aWVzOlxuICAgICAqXG4gICAgICogVGhvdWdoIHRoZSBgPmAgY2hhcmFjdGVyIGlzIGVzY2FwZWQgZm9yIHN5bW1ldHJ5LCBjaGFyYWN0ZXJzIGxpa2UgYD5gIGFuZCBgL2BcbiAgICAgKiBkb24ndCByZXF1aXJlIGVzY2FwaW5nIGluIEhUTUwgYW5kIGhhdmUgbm8gc3BlY2lhbCBtZWFuaW5nIHVubGVzcyB0aGV5J3JlIHBhcnRcbiAgICAgKiBvZiBhIHRhZyBvciBhbiB1bnF1b3RlZCBhdHRyaWJ1dGUgdmFsdWUuXG4gICAgICogaHR0cDovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvYW1iaWd1b3VzLWFtcGVyc2FuZHMgKHVuZGVyIFwic2VtaS1yZWxhdGVkIGZ1biBmYWN0XCIpXG4gICAgICovXG4gICAgdmFyIGh0bWxFc2NhcGVzID0ge1xuICAgICAgJyYnOiAnJmFtcDsnLFxuICAgICAgJzwnOiAnJmx0OycsXG4gICAgICAnPic6ICcmZ3Q7JyxcbiAgICAgICdcIic6ICcmcXVvdDsnLFxuICAgICAgXCInXCI6ICcmIzM5OydcbiAgICB9O1xuXG4gICAgLyoqIFVzZWQgdG8gY29udmVydCBIVE1MIGVudGl0aWVzIHRvIGNoYXJhY3RlcnMgKi9cbiAgICB2YXIgaHRtbFVuZXNjYXBlcyA9IGludmVydChodG1sRXNjYXBlcyk7XG5cbiAgICAvKiogVXNlZCB0byBtYXRjaCBIVE1MIGVudGl0aWVzIGFuZCBIVE1MIGNoYXJhY3RlcnMgKi9cbiAgICB2YXIgcmVFc2NhcGVkSHRtbCA9IFJlZ0V4cCgnKCcgKyBrZXlzKGh0bWxVbmVzY2FwZXMpLmpvaW4oJ3wnKSArICcpJywgJ2cnKSxcbiAgICAgICAgcmVVbmVzY2FwZWRIdG1sID0gUmVnRXhwKCdbJyArIGtleXMoaHRtbEVzY2FwZXMpLmpvaW4oJycpICsgJ10nLCAnZycpO1xuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvKipcbiAgICAgKiBBc3NpZ25zIG93biBlbnVtZXJhYmxlIHByb3BlcnRpZXMgb2Ygc291cmNlIG9iamVjdChzKSB0byB0aGUgZGVzdGluYXRpb25cbiAgICAgKiBvYmplY3QuIFN1YnNlcXVlbnQgc291cmNlcyB3aWxsIG92ZXJ3cml0ZSBwcm9wZXJ0eSBhc3NpZ25tZW50cyBvZiBwcmV2aW91c1xuICAgICAqIHNvdXJjZXMuIElmIGEgY2FsbGJhY2sgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSBleGVjdXRlZCB0byBwcm9kdWNlIHRoZVxuICAgICAqIGFzc2lnbmVkIHZhbHVlcy4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIHR3b1xuICAgICAqIGFyZ3VtZW50czsgKG9iamVjdFZhbHVlLCBzb3VyY2VWYWx1ZSkuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAdHlwZSBGdW5jdGlvblxuICAgICAqIEBhbGlhcyBleHRlbmRcbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAgICAgKiBAcGFyYW0gey4uLk9iamVjdH0gW3NvdXJjZV0gVGhlIHNvdXJjZSBvYmplY3RzLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBhc3NpZ25pbmcgdmFsdWVzLlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5hc3NpZ24oeyAnbmFtZSc6ICdmcmVkJyB9LCB7ICdlbXBsb3llcic6ICdzbGF0ZScgfSk7XG4gICAgICogLy8gPT4geyAnbmFtZSc6ICdmcmVkJywgJ2VtcGxveWVyJzogJ3NsYXRlJyB9XG4gICAgICpcbiAgICAgKiB2YXIgZGVmYXVsdHMgPSBfLnBhcnRpYWxSaWdodChfLmFzc2lnbiwgZnVuY3Rpb24oYSwgYikge1xuICAgICAqICAgcmV0dXJuIHR5cGVvZiBhID09ICd1bmRlZmluZWQnID8gYiA6IGE7XG4gICAgICogfSk7XG4gICAgICpcbiAgICAgKiB2YXIgb2JqZWN0ID0geyAnbmFtZSc6ICdiYXJuZXknIH07XG4gICAgICogZGVmYXVsdHMob2JqZWN0LCB7ICduYW1lJzogJ2ZyZWQnLCAnZW1wbG95ZXInOiAnc2xhdGUnIH0pO1xuICAgICAqIC8vID0+IHsgJ25hbWUnOiAnYmFybmV5JywgJ2VtcGxveWVyJzogJ3NsYXRlJyB9XG4gICAgICovXG4gICAgdmFyIGFzc2lnbiA9IGZ1bmN0aW9uKG9iamVjdCwgc291cmNlLCBndWFyZCkge1xuICAgICAgdmFyIGluZGV4LCBpdGVyYWJsZSA9IG9iamVjdCwgcmVzdWx0ID0gaXRlcmFibGU7XG4gICAgICBpZiAoIWl0ZXJhYmxlKSByZXR1cm4gcmVzdWx0O1xuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgICAgICAgYXJnc0luZGV4ID0gMCxcbiAgICAgICAgICBhcmdzTGVuZ3RoID0gdHlwZW9mIGd1YXJkID09ICdudW1iZXInID8gMiA6IGFyZ3MubGVuZ3RoO1xuICAgICAgaWYgKGFyZ3NMZW5ndGggPiAzICYmIHR5cGVvZiBhcmdzW2FyZ3NMZW5ndGggLSAyXSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IGJhc2VDcmVhdGVDYWxsYmFjayhhcmdzWy0tYXJnc0xlbmd0aCAtIDFdLCBhcmdzW2FyZ3NMZW5ndGgtLV0sIDIpO1xuICAgICAgfSBlbHNlIGlmIChhcmdzTGVuZ3RoID4gMiAmJiB0eXBlb2YgYXJnc1thcmdzTGVuZ3RoIC0gMV0gPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjYWxsYmFjayA9IGFyZ3NbLS1hcmdzTGVuZ3RoXTtcbiAgICAgIH1cbiAgICAgIHdoaWxlICgrK2FyZ3NJbmRleCA8IGFyZ3NMZW5ndGgpIHtcbiAgICAgICAgaXRlcmFibGUgPSBhcmdzW2FyZ3NJbmRleF07XG4gICAgICAgIGlmIChpdGVyYWJsZSAmJiBvYmplY3RUeXBlc1t0eXBlb2YgaXRlcmFibGVdKSB7XG4gICAgICAgIHZhciBvd25JbmRleCA9IC0xLFxuICAgICAgICAgICAgb3duUHJvcHMgPSBvYmplY3RUeXBlc1t0eXBlb2YgaXRlcmFibGVdICYmIGtleXMoaXRlcmFibGUpLFxuICAgICAgICAgICAgbGVuZ3RoID0gb3duUHJvcHMgPyBvd25Qcm9wcy5sZW5ndGggOiAwO1xuXG4gICAgICAgIHdoaWxlICgrK293bkluZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgaW5kZXggPSBvd25Qcm9wc1tvd25JbmRleF07XG4gICAgICAgICAgcmVzdWx0W2luZGV4XSA9IGNhbGxiYWNrID8gY2FsbGJhY2socmVzdWx0W2luZGV4XSwgaXRlcmFibGVbaW5kZXhdKSA6IGl0ZXJhYmxlW2luZGV4XTtcbiAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBjbG9uZSBvZiBgdmFsdWVgLiBJZiBgaXNEZWVwYCBpcyBgdHJ1ZWAgbmVzdGVkIG9iamVjdHMgd2lsbCBhbHNvXG4gICAgICogYmUgY2xvbmVkLCBvdGhlcndpc2UgdGhleSB3aWxsIGJlIGFzc2lnbmVkIGJ5IHJlZmVyZW5jZS4gSWYgYSBjYWxsYmFja1xuICAgICAqIGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgZXhlY3V0ZWQgdG8gcHJvZHVjZSB0aGUgY2xvbmVkIHZhbHVlcy4gSWYgdGhlXG4gICAgICogY2FsbGJhY2sgcmV0dXJucyBgdW5kZWZpbmVkYCBjbG9uaW5nIHdpbGwgYmUgaGFuZGxlZCBieSB0aGUgbWV0aG9kIGluc3RlYWQuXG4gICAgICogVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIG9uZSBhcmd1bWVudDsgKHZhbHVlKS5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2xvbmUuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbaXNEZWVwPWZhbHNlXSBTcGVjaWZ5IGEgZGVlcCBjbG9uZS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY2xvbmluZyB2YWx1ZXMuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGNsb25lZCB2YWx1ZS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIGNoYXJhY3RlcnMgPSBbXG4gICAgICogICB7ICduYW1lJzogJ2Jhcm5leScsICdhZ2UnOiAzNiB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdmcmVkJywgICAnYWdlJzogNDAgfVxuICAgICAqIF07XG4gICAgICpcbiAgICAgKiB2YXIgc2hhbGxvdyA9IF8uY2xvbmUoY2hhcmFjdGVycyk7XG4gICAgICogc2hhbGxvd1swXSA9PT0gY2hhcmFjdGVyc1swXTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiB2YXIgZGVlcCA9IF8uY2xvbmUoY2hhcmFjdGVycywgdHJ1ZSk7XG4gICAgICogZGVlcFswXSA9PT0gY2hhcmFjdGVyc1swXTtcbiAgICAgKiAvLyA9PiBmYWxzZVxuICAgICAqXG4gICAgICogXy5taXhpbih7XG4gICAgICogICAnY2xvbmUnOiBfLnBhcnRpYWxSaWdodChfLmNsb25lLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAqICAgICByZXR1cm4gXy5pc0VsZW1lbnQodmFsdWUpID8gdmFsdWUuY2xvbmVOb2RlKGZhbHNlKSA6IHVuZGVmaW5lZDtcbiAgICAgKiAgIH0pXG4gICAgICogfSk7XG4gICAgICpcbiAgICAgKiB2YXIgY2xvbmUgPSBfLmNsb25lKGRvY3VtZW50LmJvZHkpO1xuICAgICAqIGNsb25lLmNoaWxkTm9kZXMubGVuZ3RoO1xuICAgICAqIC8vID0+IDBcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjbG9uZSh2YWx1ZSwgaXNEZWVwLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgLy8gYWxsb3dzIHdvcmtpbmcgd2l0aCBcIkNvbGxlY3Rpb25zXCIgbWV0aG9kcyB3aXRob3V0IHVzaW5nIHRoZWlyIGBpbmRleGBcbiAgICAgIC8vIGFuZCBgY29sbGVjdGlvbmAgYXJndW1lbnRzIGZvciBgaXNEZWVwYCBhbmQgYGNhbGxiYWNrYFxuICAgICAgaWYgKHR5cGVvZiBpc0RlZXAgIT0gJ2Jvb2xlYW4nICYmIGlzRGVlcCAhPSBudWxsKSB7XG4gICAgICAgIHRoaXNBcmcgPSBjYWxsYmFjaztcbiAgICAgICAgY2FsbGJhY2sgPSBpc0RlZXA7XG4gICAgICAgIGlzRGVlcCA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGJhc2VDbG9uZSh2YWx1ZSwgaXNEZWVwLCB0eXBlb2YgY2FsbGJhY2sgPT0gJ2Z1bmN0aW9uJyAmJiBiYXNlQ3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDEpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZGVlcCBjbG9uZSBvZiBgdmFsdWVgLiBJZiBhIGNhbGxiYWNrIGlzIHByb3ZpZGVkIGl0IHdpbGwgYmVcbiAgICAgKiBleGVjdXRlZCB0byBwcm9kdWNlIHRoZSBjbG9uZWQgdmFsdWVzLiBJZiB0aGUgY2FsbGJhY2sgcmV0dXJucyBgdW5kZWZpbmVkYFxuICAgICAqIGNsb25pbmcgd2lsbCBiZSBoYW5kbGVkIGJ5IHRoZSBtZXRob2QgaW5zdGVhZC4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvXG4gICAgICogYHRoaXNBcmdgIGFuZCBpbnZva2VkIHdpdGggb25lIGFyZ3VtZW50OyAodmFsdWUpLlxuICAgICAqXG4gICAgICogTm90ZTogVGhpcyBtZXRob2QgaXMgbG9vc2VseSBiYXNlZCBvbiB0aGUgc3RydWN0dXJlZCBjbG9uZSBhbGdvcml0aG0uIEZ1bmN0aW9uc1xuICAgICAqIGFuZCBET00gbm9kZXMgYXJlICoqbm90KiogY2xvbmVkLiBUaGUgZW51bWVyYWJsZSBwcm9wZXJ0aWVzIG9mIGBhcmd1bWVudHNgIG9iamVjdHMgYW5kXG4gICAgICogb2JqZWN0cyBjcmVhdGVkIGJ5IGNvbnN0cnVjdG9ycyBvdGhlciB0aGFuIGBPYmplY3RgIGFyZSBjbG9uZWQgdG8gcGxhaW4gYE9iamVjdGAgb2JqZWN0cy5cbiAgICAgKiBTZWUgaHR0cDovL3d3dy53My5vcmcvVFIvaHRtbDUvaW5mcmFzdHJ1Y3R1cmUuaHRtbCNpbnRlcm5hbC1zdHJ1Y3R1cmVkLWNsb25pbmctYWxnb3JpdGhtLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBkZWVwIGNsb25lLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjbG9uaW5nIHZhbHVlcy5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZGVlcCBjbG9uZWQgdmFsdWUuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBjaGFyYWN0ZXJzID0gW1xuICAgICAqICAgeyAnbmFtZSc6ICdiYXJuZXknLCAnYWdlJzogMzYgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgJ2FnZSc6IDQwIH1cbiAgICAgKiBdO1xuICAgICAqXG4gICAgICogdmFyIGRlZXAgPSBfLmNsb25lRGVlcChjaGFyYWN0ZXJzKTtcbiAgICAgKiBkZWVwWzBdID09PSBjaGFyYWN0ZXJzWzBdO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICpcbiAgICAgKiB2YXIgdmlldyA9IHtcbiAgICAgKiAgICdsYWJlbCc6ICdkb2NzJyxcbiAgICAgKiAgICdub2RlJzogZWxlbWVudFxuICAgICAqIH07XG4gICAgICpcbiAgICAgKiB2YXIgY2xvbmUgPSBfLmNsb25lRGVlcCh2aWV3LCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAqICAgcmV0dXJuIF8uaXNFbGVtZW50KHZhbHVlKSA/IHZhbHVlLmNsb25lTm9kZSh0cnVlKSA6IHVuZGVmaW5lZDtcbiAgICAgKiB9KTtcbiAgICAgKlxuICAgICAqIGNsb25lLm5vZGUgPT0gdmlldy5ub2RlO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICovXG4gICAgZnVuY3Rpb24gY2xvbmVEZWVwKHZhbHVlLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgcmV0dXJuIGJhc2VDbG9uZSh2YWx1ZSwgdHJ1ZSwgdHlwZW9mIGNhbGxiYWNrID09ICdmdW5jdGlvbicgJiYgYmFzZUNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAxKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBvYmplY3QgdGhhdCBpbmhlcml0cyBmcm9tIHRoZSBnaXZlbiBgcHJvdG90eXBlYCBvYmplY3QuIElmIGFcbiAgICAgKiBgcHJvcGVydGllc2Agb2JqZWN0IGlzIHByb3ZpZGVkIGl0cyBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzIGFyZSBhc3NpZ25lZFxuICAgICAqIHRvIHRoZSBjcmVhdGVkIG9iamVjdC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHByb3RvdHlwZSBUaGUgb2JqZWN0IHRvIGluaGVyaXQgZnJvbS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXNdIFRoZSBwcm9wZXJ0aWVzIHRvIGFzc2lnbiB0byB0aGUgb2JqZWN0LlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIG5ldyBvYmplY3QuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIGZ1bmN0aW9uIFNoYXBlKCkge1xuICAgICAqICAgdGhpcy54ID0gMDtcbiAgICAgKiAgIHRoaXMueSA9IDA7XG4gICAgICogfVxuICAgICAqXG4gICAgICogZnVuY3Rpb24gQ2lyY2xlKCkge1xuICAgICAqICAgU2hhcGUuY2FsbCh0aGlzKTtcbiAgICAgKiB9XG4gICAgICpcbiAgICAgKiBDaXJjbGUucHJvdG90eXBlID0gXy5jcmVhdGUoU2hhcGUucHJvdG90eXBlLCB7ICdjb25zdHJ1Y3Rvcic6IENpcmNsZSB9KTtcbiAgICAgKlxuICAgICAqIHZhciBjaXJjbGUgPSBuZXcgQ2lyY2xlO1xuICAgICAqIGNpcmNsZSBpbnN0YW5jZW9mIENpcmNsZTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiBjaXJjbGUgaW5zdGFuY2VvZiBTaGFwZTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICovXG4gICAgZnVuY3Rpb24gY3JlYXRlKHByb3RvdHlwZSwgcHJvcGVydGllcykge1xuICAgICAgdmFyIHJlc3VsdCA9IGJhc2VDcmVhdGUocHJvdG90eXBlKTtcbiAgICAgIHJldHVybiBwcm9wZXJ0aWVzID8gYXNzaWduKHJlc3VsdCwgcHJvcGVydGllcykgOiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXNzaWducyBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzIG9mIHNvdXJjZSBvYmplY3QocykgdG8gdGhlIGRlc3RpbmF0aW9uXG4gICAgICogb2JqZWN0IGZvciBhbGwgZGVzdGluYXRpb24gcHJvcGVydGllcyB0aGF0IHJlc29sdmUgdG8gYHVuZGVmaW5lZGAuIE9uY2UgYVxuICAgICAqIHByb3BlcnR5IGlzIHNldCwgYWRkaXRpb25hbCBkZWZhdWx0cyBvZiB0aGUgc2FtZSBwcm9wZXJ0eSB3aWxsIGJlIGlnbm9yZWQuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAdHlwZSBGdW5jdGlvblxuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7Li4uT2JqZWN0fSBbc291cmNlXSBUaGUgc291cmNlIG9iamVjdHMuXG4gICAgICogQHBhcmFtLSB7T2JqZWN0fSBbZ3VhcmRdIEFsbG93cyB3b3JraW5nIHdpdGggYF8ucmVkdWNlYCB3aXRob3V0IHVzaW5nIGl0c1xuICAgICAqICBga2V5YCBhbmQgYG9iamVjdGAgYXJndW1lbnRzIGFzIHNvdXJjZXMuXG4gICAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgb2JqZWN0ID0geyAnbmFtZSc6ICdiYXJuZXknIH07XG4gICAgICogXy5kZWZhdWx0cyhvYmplY3QsIHsgJ25hbWUnOiAnZnJlZCcsICdlbXBsb3llcic6ICdzbGF0ZScgfSk7XG4gICAgICogLy8gPT4geyAnbmFtZSc6ICdiYXJuZXknLCAnZW1wbG95ZXInOiAnc2xhdGUnIH1cbiAgICAgKi9cbiAgICB2YXIgZGVmYXVsdHMgPSBmdW5jdGlvbihvYmplY3QsIHNvdXJjZSwgZ3VhcmQpIHtcbiAgICAgIHZhciBpbmRleCwgaXRlcmFibGUgPSBvYmplY3QsIHJlc3VsdCA9IGl0ZXJhYmxlO1xuICAgICAgaWYgKCFpdGVyYWJsZSkgcmV0dXJuIHJlc3VsdDtcbiAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgICAgIGFyZ3NJbmRleCA9IDAsXG4gICAgICAgICAgYXJnc0xlbmd0aCA9IHR5cGVvZiBndWFyZCA9PSAnbnVtYmVyJyA/IDIgOiBhcmdzLmxlbmd0aDtcbiAgICAgIHdoaWxlICgrK2FyZ3NJbmRleCA8IGFyZ3NMZW5ndGgpIHtcbiAgICAgICAgaXRlcmFibGUgPSBhcmdzW2FyZ3NJbmRleF07XG4gICAgICAgIGlmIChpdGVyYWJsZSAmJiBvYmplY3RUeXBlc1t0eXBlb2YgaXRlcmFibGVdKSB7XG4gICAgICAgIHZhciBvd25JbmRleCA9IC0xLFxuICAgICAgICAgICAgb3duUHJvcHMgPSBvYmplY3RUeXBlc1t0eXBlb2YgaXRlcmFibGVdICYmIGtleXMoaXRlcmFibGUpLFxuICAgICAgICAgICAgbGVuZ3RoID0gb3duUHJvcHMgPyBvd25Qcm9wcy5sZW5ndGggOiAwO1xuXG4gICAgICAgIHdoaWxlICgrK293bkluZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgaW5kZXggPSBvd25Qcm9wc1tvd25JbmRleF07XG4gICAgICAgICAgaWYgKHR5cGVvZiByZXN1bHRbaW5kZXhdID09ICd1bmRlZmluZWQnKSByZXN1bHRbaW5kZXhdID0gaXRlcmFibGVbaW5kZXhdO1xuICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgbGlrZSBgXy5maW5kSW5kZXhgIGV4Y2VwdCB0aGF0IGl0IHJldHVybnMgdGhlIGtleSBvZiB0aGVcbiAgICAgKiBmaXJzdCBlbGVtZW50IHRoYXQgcGFzc2VzIHRoZSBjYWxsYmFjayBjaGVjaywgaW5zdGVhZCBvZiB0aGUgZWxlbWVudCBpdHNlbGYuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHNlYXJjaC5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdHxzdHJpbmd9IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZCBwZXJcbiAgICAgKiAgaXRlcmF0aW9uLiBJZiBhIHByb3BlcnR5IG5hbWUgb3Igb2JqZWN0IGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgdXNlZCB0b1xuICAgICAqICBjcmVhdGUgYSBcIl8ucGx1Y2tcIiBvciBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFjaywgcmVzcGVjdGl2ZWx5LlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd8dW5kZWZpbmVkfSBSZXR1cm5zIHRoZSBrZXkgb2YgdGhlIGZvdW5kIGVsZW1lbnQsIGVsc2UgYHVuZGVmaW5lZGAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBjaGFyYWN0ZXJzID0ge1xuICAgICAqICAgJ2Jhcm5leSc6IHsgICdhZ2UnOiAzNiwgJ2Jsb2NrZWQnOiBmYWxzZSB9LFxuICAgICAqICAgJ2ZyZWQnOiB7ICAgICdhZ2UnOiA0MCwgJ2Jsb2NrZWQnOiB0cnVlIH0sXG4gICAgICogICAncGViYmxlcyc6IHsgJ2FnZSc6IDEsICAnYmxvY2tlZCc6IGZhbHNlIH1cbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogXy5maW5kS2V5KGNoYXJhY3RlcnMsIGZ1bmN0aW9uKGNocikge1xuICAgICAqICAgcmV0dXJuIGNoci5hZ2UgPCA0MDtcbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiAnYmFybmV5JyAocHJvcGVydHkgb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQgYWNyb3NzIGVudmlyb25tZW50cylcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy53aGVyZVwiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8uZmluZEtleShjaGFyYWN0ZXJzLCB7ICdhZ2UnOiAxIH0pO1xuICAgICAqIC8vID0+ICdwZWJibGVzJ1xuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLnBsdWNrXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5maW5kS2V5KGNoYXJhY3RlcnMsICdibG9ja2VkJyk7XG4gICAgICogLy8gPT4gJ2ZyZWQnXG4gICAgICovXG4gICAgZnVuY3Rpb24gZmluZEtleShvYmplY3QsIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgcmVzdWx0O1xuICAgICAgY2FsbGJhY2sgPSBsb2Rhc2guY3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDMpO1xuICAgICAgZm9yT3duKG9iamVjdCwgZnVuY3Rpb24odmFsdWUsIGtleSwgb2JqZWN0KSB7XG4gICAgICAgIGlmIChjYWxsYmFjayh2YWx1ZSwga2V5LCBvYmplY3QpKSB7XG4gICAgICAgICAgcmVzdWx0ID0ga2V5O1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGxpa2UgYF8uZmluZEtleWAgZXhjZXB0IHRoYXQgaXQgaXRlcmF0ZXMgb3ZlciBlbGVtZW50c1xuICAgICAqIG9mIGEgYGNvbGxlY3Rpb25gIGluIHRoZSBvcHBvc2l0ZSBvcmRlci5cbiAgICAgKlxuICAgICAqIElmIGEgcHJvcGVydHkgbmFtZSBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ucGx1Y2tcIiBzdHlsZVxuICAgICAqIGNhbGxiYWNrIHdpbGwgcmV0dXJuIHRoZSBwcm9wZXJ0eSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICAgKlxuICAgICAqIElmIGFuIG9iamVjdCBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFja1xuICAgICAqIHdpbGwgcmV0dXJuIGB0cnVlYCBmb3IgZWxlbWVudHMgdGhhdCBoYXZlIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBnaXZlbiBvYmplY3QsXG4gICAgICogZWxzZSBgZmFsc2VgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gc2VhcmNoLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkIHBlclxuICAgICAqICBpdGVyYXRpb24uIElmIGEgcHJvcGVydHkgbmFtZSBvciBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkIHRvXG4gICAgICogIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge3N0cmluZ3x1bmRlZmluZWR9IFJldHVybnMgdGhlIGtleSBvZiB0aGUgZm91bmQgZWxlbWVudCwgZWxzZSBgdW5kZWZpbmVkYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIGNoYXJhY3RlcnMgPSB7XG4gICAgICogICAnYmFybmV5JzogeyAgJ2FnZSc6IDM2LCAnYmxvY2tlZCc6IHRydWUgfSxcbiAgICAgKiAgICdmcmVkJzogeyAgICAnYWdlJzogNDAsICdibG9ja2VkJzogZmFsc2UgfSxcbiAgICAgKiAgICdwZWJibGVzJzogeyAnYWdlJzogMSwgICdibG9ja2VkJzogdHJ1ZSB9XG4gICAgICogfTtcbiAgICAgKlxuICAgICAqIF8uZmluZExhc3RLZXkoY2hhcmFjdGVycywgZnVuY3Rpb24oY2hyKSB7XG4gICAgICogICByZXR1cm4gY2hyLmFnZSA8IDQwO1xuICAgICAqIH0pO1xuICAgICAqIC8vID0+IHJldHVybnMgYHBlYmJsZXNgLCBhc3N1bWluZyBgXy5maW5kS2V5YCByZXR1cm5zIGBiYXJuZXlgXG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ud2hlcmVcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLmZpbmRMYXN0S2V5KGNoYXJhY3RlcnMsIHsgJ2FnZSc6IDQwIH0pO1xuICAgICAqIC8vID0+ICdmcmVkJ1xuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLnBsdWNrXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5maW5kTGFzdEtleShjaGFyYWN0ZXJzLCAnYmxvY2tlZCcpO1xuICAgICAqIC8vID0+ICdwZWJibGVzJ1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGZpbmRMYXN0S2V5KG9iamVjdCwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIHZhciByZXN1bHQ7XG4gICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICBmb3JPd25SaWdodChvYmplY3QsIGZ1bmN0aW9uKHZhbHVlLCBrZXksIG9iamVjdCkge1xuICAgICAgICBpZiAoY2FsbGJhY2sodmFsdWUsIGtleSwgb2JqZWN0KSkge1xuICAgICAgICAgIHJlc3VsdCA9IGtleTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJdGVyYXRlcyBvdmVyIG93biBhbmQgaW5oZXJpdGVkIGVudW1lcmFibGUgcHJvcGVydGllcyBvZiBhbiBvYmplY3QsXG4gICAgICogZXhlY3V0aW5nIHRoZSBjYWxsYmFjayBmb3IgZWFjaCBwcm9wZXJ0eS4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYFxuICAgICAqIGFuZCBpbnZva2VkIHdpdGggdGhyZWUgYXJndW1lbnRzOyAodmFsdWUsIGtleSwgb2JqZWN0KS4gQ2FsbGJhY2tzIG1heSBleGl0XG4gICAgICogaXRlcmF0aW9uIGVhcmx5IGJ5IGV4cGxpY2l0bHkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAdHlwZSBGdW5jdGlvblxuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWQgcGVyIGl0ZXJhdGlvbi5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBmdW5jdGlvbiBTaGFwZSgpIHtcbiAgICAgKiAgIHRoaXMueCA9IDA7XG4gICAgICogICB0aGlzLnkgPSAwO1xuICAgICAqIH1cbiAgICAgKlxuICAgICAqIFNoYXBlLnByb3RvdHlwZS5tb3ZlID0gZnVuY3Rpb24oeCwgeSkge1xuICAgICAqICAgdGhpcy54ICs9IHg7XG4gICAgICogICB0aGlzLnkgKz0geTtcbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogXy5mb3JJbihuZXcgU2hhcGUsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgKiAgIGNvbnNvbGUubG9nKGtleSk7XG4gICAgICogfSk7XG4gICAgICogLy8gPT4gbG9ncyAneCcsICd5JywgYW5kICdtb3ZlJyAocHJvcGVydHkgb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQgYWNyb3NzIGVudmlyb25tZW50cylcbiAgICAgKi9cbiAgICB2YXIgZm9ySW4gPSBmdW5jdGlvbihjb2xsZWN0aW9uLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgdmFyIGluZGV4LCBpdGVyYWJsZSA9IGNvbGxlY3Rpb24sIHJlc3VsdCA9IGl0ZXJhYmxlO1xuICAgICAgaWYgKCFpdGVyYWJsZSkgcmV0dXJuIHJlc3VsdDtcbiAgICAgIGlmICghb2JqZWN0VHlwZXNbdHlwZW9mIGl0ZXJhYmxlXSkgcmV0dXJuIHJlc3VsdDtcbiAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgJiYgdHlwZW9mIHRoaXNBcmcgPT0gJ3VuZGVmaW5lZCcgPyBjYWxsYmFjayA6IGJhc2VDcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICAgIGZvciAoaW5kZXggaW4gaXRlcmFibGUpIHtcbiAgICAgICAgICBpZiAoY2FsbGJhY2soaXRlcmFibGVbaW5kZXhdLCBpbmRleCwgY29sbGVjdGlvbikgPT09IGZhbHNlKSByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGxpa2UgYF8uZm9ySW5gIGV4Y2VwdCB0aGF0IGl0IGl0ZXJhdGVzIG92ZXIgZWxlbWVudHNcbiAgICAgKiBvZiBhIGBjb2xsZWN0aW9uYCBpbiB0aGUgb3Bwb3NpdGUgb3JkZXIuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkIHBlciBpdGVyYXRpb24uXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogZnVuY3Rpb24gU2hhcGUoKSB7XG4gICAgICogICB0aGlzLnggPSAwO1xuICAgICAqICAgdGhpcy55ID0gMDtcbiAgICAgKiB9XG4gICAgICpcbiAgICAgKiBTaGFwZS5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgKiAgIHRoaXMueCArPSB4O1xuICAgICAqICAgdGhpcy55ICs9IHk7XG4gICAgICogfTtcbiAgICAgKlxuICAgICAqIF8uZm9ySW5SaWdodChuZXcgU2hhcGUsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgKiAgIGNvbnNvbGUubG9nKGtleSk7XG4gICAgICogfSk7XG4gICAgICogLy8gPT4gbG9ncyAnbW92ZScsICd5JywgYW5kICd4JyBhc3N1bWluZyBgXy5mb3JJbiBgIGxvZ3MgJ3gnLCAneScsIGFuZCAnbW92ZSdcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBmb3JJblJpZ2h0KG9iamVjdCwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIHZhciBwYWlycyA9IFtdO1xuXG4gICAgICBmb3JJbihvYmplY3QsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgcGFpcnMucHVzaChrZXksIHZhbHVlKTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgbGVuZ3RoID0gcGFpcnMubGVuZ3RoO1xuICAgICAgY2FsbGJhY2sgPSBiYXNlQ3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDMpO1xuICAgICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAgIGlmIChjYWxsYmFjayhwYWlyc1tsZW5ndGgtLV0sIHBhaXJzW2xlbmd0aF0sIG9iamVjdCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSXRlcmF0ZXMgb3ZlciBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzIG9mIGFuIG9iamVjdCwgZXhlY3V0aW5nIHRoZSBjYWxsYmFja1xuICAgICAqIGZvciBlYWNoIHByb3BlcnR5LiBUaGUgY2FsbGJhY2sgaXMgYm91bmQgdG8gYHRoaXNBcmdgIGFuZCBpbnZva2VkIHdpdGggdGhyZWVcbiAgICAgKiBhcmd1bWVudHM7ICh2YWx1ZSwga2V5LCBvYmplY3QpLiBDYWxsYmFja3MgbWF5IGV4aXQgaXRlcmF0aW9uIGVhcmx5IGJ5XG4gICAgICogZXhwbGljaXRseSByZXR1cm5pbmcgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEB0eXBlIEZ1bmN0aW9uXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZCBwZXIgaXRlcmF0aW9uLlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uZm9yT3duKHsgJzAnOiAnemVybycsICcxJzogJ29uZScsICdsZW5ndGgnOiAyIH0sIGZ1bmN0aW9uKG51bSwga2V5KSB7XG4gICAgICogICBjb25zb2xlLmxvZyhrZXkpO1xuICAgICAqIH0pO1xuICAgICAqIC8vID0+IGxvZ3MgJzAnLCAnMScsIGFuZCAnbGVuZ3RoJyAocHJvcGVydHkgb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQgYWNyb3NzIGVudmlyb25tZW50cylcbiAgICAgKi9cbiAgICB2YXIgZm9yT3duID0gZnVuY3Rpb24oY29sbGVjdGlvbiwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIHZhciBpbmRleCwgaXRlcmFibGUgPSBjb2xsZWN0aW9uLCByZXN1bHQgPSBpdGVyYWJsZTtcbiAgICAgIGlmICghaXRlcmFibGUpIHJldHVybiByZXN1bHQ7XG4gICAgICBpZiAoIW9iamVjdFR5cGVzW3R5cGVvZiBpdGVyYWJsZV0pIHJldHVybiByZXN1bHQ7XG4gICAgICBjYWxsYmFjayA9IGNhbGxiYWNrICYmIHR5cGVvZiB0aGlzQXJnID09ICd1bmRlZmluZWQnID8gY2FsbGJhY2sgOiBiYXNlQ3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDMpO1xuICAgICAgICB2YXIgb3duSW5kZXggPSAtMSxcbiAgICAgICAgICAgIG93blByb3BzID0gb2JqZWN0VHlwZXNbdHlwZW9mIGl0ZXJhYmxlXSAmJiBrZXlzKGl0ZXJhYmxlKSxcbiAgICAgICAgICAgIGxlbmd0aCA9IG93blByb3BzID8gb3duUHJvcHMubGVuZ3RoIDogMDtcblxuICAgICAgICB3aGlsZSAoKytvd25JbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgIGluZGV4ID0gb3duUHJvcHNbb3duSW5kZXhdO1xuICAgICAgICAgIGlmIChjYWxsYmFjayhpdGVyYWJsZVtpbmRleF0sIGluZGV4LCBjb2xsZWN0aW9uKSA9PT0gZmFsc2UpIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgbGlrZSBgXy5mb3JPd25gIGV4Y2VwdCB0aGF0IGl0IGl0ZXJhdGVzIG92ZXIgZWxlbWVudHNcbiAgICAgKiBvZiBhIGBjb2xsZWN0aW9uYCBpbiB0aGUgb3Bwb3NpdGUgb3JkZXIuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkIHBlciBpdGVyYXRpb24uXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5mb3JPd25SaWdodCh7ICcwJzogJ3plcm8nLCAnMSc6ICdvbmUnLCAnbGVuZ3RoJzogMiB9LCBmdW5jdGlvbihudW0sIGtleSkge1xuICAgICAqICAgY29uc29sZS5sb2coa2V5KTtcbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiBsb2dzICdsZW5ndGgnLCAnMScsIGFuZCAnMCcgYXNzdW1pbmcgYF8uZm9yT3duYCBsb2dzICcwJywgJzEnLCBhbmQgJ2xlbmd0aCdcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBmb3JPd25SaWdodChvYmplY3QsIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgcHJvcHMgPSBrZXlzKG9iamVjdCksXG4gICAgICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoO1xuXG4gICAgICBjYWxsYmFjayA9IGJhc2VDcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgdmFyIGtleSA9IHByb3BzW2xlbmd0aF07XG4gICAgICAgIGlmIChjYWxsYmFjayhvYmplY3Rba2V5XSwga2V5LCBvYmplY3QpID09PSBmYWxzZSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqZWN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBzb3J0ZWQgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMgb2YgYWxsIGVudW1lcmFibGUgcHJvcGVydGllcyxcbiAgICAgKiBvd24gYW5kIGluaGVyaXRlZCwgb2YgYG9iamVjdGAgdGhhdCBoYXZlIGZ1bmN0aW9uIHZhbHVlcy5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBhbGlhcyBtZXRob2RzXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaW5zcGVjdC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYW4gYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMgdGhhdCBoYXZlIGZ1bmN0aW9uIHZhbHVlcy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5mdW5jdGlvbnMoXyk7XG4gICAgICogLy8gPT4gWydhbGwnLCAnYW55JywgJ2JpbmQnLCAnYmluZEFsbCcsICdjbG9uZScsICdjb21wYWN0JywgJ2NvbXBvc2UnLCAuLi5dXG4gICAgICovXG4gICAgZnVuY3Rpb24gZnVuY3Rpb25zKG9iamVjdCkge1xuICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgZm9ySW4ob2JqZWN0LCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdC5zb3J0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHRoZSBzcGVjaWZpZWQgcHJvcGVydHkgbmFtZSBleGlzdHMgYXMgYSBkaXJlY3QgcHJvcGVydHkgb2YgYG9iamVjdGAsXG4gICAgICogaW5zdGVhZCBvZiBhbiBpbmhlcml0ZWQgcHJvcGVydHkuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpbnNwZWN0LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBrZXkgaXMgYSBkaXJlY3QgcHJvcGVydHksIGVsc2UgYGZhbHNlYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5oYXMoeyAnYSc6IDEsICdiJzogMiwgJ2MnOiAzIH0sICdiJyk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGhhcyhvYmplY3QsIGtleSkge1xuICAgICAgcmV0dXJuIG9iamVjdCA/IGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpIDogZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBvYmplY3QgY29tcG9zZWQgb2YgdGhlIGludmVydGVkIGtleXMgYW5kIHZhbHVlcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaW52ZXJ0LlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGNyZWF0ZWQgaW52ZXJ0ZWQgb2JqZWN0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmludmVydCh7ICdmaXJzdCc6ICdmcmVkJywgJ3NlY29uZCc6ICdiYXJuZXknIH0pO1xuICAgICAqIC8vID0+IHsgJ2ZyZWQnOiAnZmlyc3QnLCAnYmFybmV5JzogJ3NlY29uZCcgfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGludmVydChvYmplY3QpIHtcbiAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgIHByb3BzID0ga2V5cyhvYmplY3QpLFxuICAgICAgICAgIGxlbmd0aCA9IHByb3BzLmxlbmd0aCxcbiAgICAgICAgICByZXN1bHQgPSB7fTtcblxuICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgdmFyIGtleSA9IHByb3BzW2luZGV4XTtcbiAgICAgICAgcmVzdWx0W29iamVjdFtrZXldXSA9IGtleTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBib29sZWFuIHZhbHVlLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYSBib29sZWFuIHZhbHVlLCBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uaXNCb29sZWFuKG51bGwpO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNCb29sZWFuKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWUgPT09IHRydWUgfHwgdmFsdWUgPT09IGZhbHNlIHx8XG4gICAgICAgIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyAmJiB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PSBib29sQ2xhc3MgfHwgZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBkYXRlLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYSBkYXRlLCBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uaXNEYXRlKG5ldyBEYXRlKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNEYXRlKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnICYmIHRvU3RyaW5nLmNhbGwodmFsdWUpID09IGRhdGVDbGFzcyB8fCBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIERPTSBlbGVtZW50LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYSBET00gZWxlbWVudCwgZWxzZSBgZmFsc2VgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmlzRWxlbWVudChkb2N1bWVudC5ib2R5KTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNFbGVtZW50KHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWUgJiYgdmFsdWUubm9kZVR5cGUgPT09IDEgfHwgZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgZW1wdHkuIEFycmF5cywgc3RyaW5ncywgb3IgYGFyZ3VtZW50c2Agb2JqZWN0cyB3aXRoIGFcbiAgICAgKiBsZW5ndGggb2YgYDBgIGFuZCBvYmplY3RzIHdpdGggbm8gb3duIGVudW1lcmFibGUgcHJvcGVydGllcyBhcmUgY29uc2lkZXJlZFxuICAgICAqIFwiZW1wdHlcIi5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSB2YWx1ZSBUaGUgdmFsdWUgdG8gaW5zcGVjdC5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgZW1wdHksIGVsc2UgYGZhbHNlYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5pc0VtcHR5KFsxLCAyLCAzXSk7XG4gICAgICogLy8gPT4gZmFsc2VcbiAgICAgKlxuICAgICAqIF8uaXNFbXB0eSh7fSk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqXG4gICAgICogXy5pc0VtcHR5KCcnKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSkge1xuICAgICAgdmFyIHJlc3VsdCA9IHRydWU7XG4gICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgICB2YXIgY2xhc3NOYW1lID0gdG9TdHJpbmcuY2FsbCh2YWx1ZSksXG4gICAgICAgICAgbGVuZ3RoID0gdmFsdWUubGVuZ3RoO1xuXG4gICAgICBpZiAoKGNsYXNzTmFtZSA9PSBhcnJheUNsYXNzIHx8IGNsYXNzTmFtZSA9PSBzdHJpbmdDbGFzcyB8fCBjbGFzc05hbWUgPT0gYXJnc0NsYXNzICkgfHxcbiAgICAgICAgICAoY2xhc3NOYW1lID09IG9iamVjdENsYXNzICYmIHR5cGVvZiBsZW5ndGggPT0gJ251bWJlcicgJiYgaXNGdW5jdGlvbih2YWx1ZS5zcGxpY2UpKSkge1xuICAgICAgICByZXR1cm4gIWxlbmd0aDtcbiAgICAgIH1cbiAgICAgIGZvck93bih2YWx1ZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAocmVzdWx0ID0gZmFsc2UpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBlcmZvcm1zIGEgZGVlcCBjb21wYXJpc29uIGJldHdlZW4gdHdvIHZhbHVlcyB0byBkZXRlcm1pbmUgaWYgdGhleSBhcmVcbiAgICAgKiBlcXVpdmFsZW50IHRvIGVhY2ggb3RoZXIuIElmIGEgY2FsbGJhY2sgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSBleGVjdXRlZFxuICAgICAqIHRvIGNvbXBhcmUgdmFsdWVzLiBJZiB0aGUgY2FsbGJhY2sgcmV0dXJucyBgdW5kZWZpbmVkYCBjb21wYXJpc29ucyB3aWxsXG4gICAgICogYmUgaGFuZGxlZCBieSB0aGUgbWV0aG9kIGluc3RlYWQuIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kXG4gICAgICogaW52b2tlZCB3aXRoIHR3byBhcmd1bWVudHM7IChhLCBiKS5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHsqfSBhIFRoZSB2YWx1ZSB0byBjb21wYXJlLlxuICAgICAqIEBwYXJhbSB7Kn0gYiBUaGUgb3RoZXIgdmFsdWUgdG8gY29tcGFyZS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29tcGFyaW5nIHZhbHVlcy5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgb2JqZWN0ID0geyAnbmFtZSc6ICdmcmVkJyB9O1xuICAgICAqIHZhciBjb3B5ID0geyAnbmFtZSc6ICdmcmVkJyB9O1xuICAgICAqXG4gICAgICogb2JqZWN0ID09IGNvcHk7XG4gICAgICogLy8gPT4gZmFsc2VcbiAgICAgKlxuICAgICAqIF8uaXNFcXVhbChvYmplY3QsIGNvcHkpO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKlxuICAgICAqIHZhciB3b3JkcyA9IFsnaGVsbG8nLCAnZ29vZGJ5ZSddO1xuICAgICAqIHZhciBvdGhlcldvcmRzID0gWydoaScsICdnb29kYnllJ107XG4gICAgICpcbiAgICAgKiBfLmlzRXF1YWwod29yZHMsIG90aGVyV29yZHMsIGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgKiAgIHZhciByZUdyZWV0ID0gL14oPzpoZWxsb3xoaSkkL2ksXG4gICAgICogICAgICAgYUdyZWV0ID0gXy5pc1N0cmluZyhhKSAmJiByZUdyZWV0LnRlc3QoYSksXG4gICAgICogICAgICAgYkdyZWV0ID0gXy5pc1N0cmluZyhiKSAmJiByZUdyZWV0LnRlc3QoYik7XG4gICAgICpcbiAgICAgKiAgIHJldHVybiAoYUdyZWV0IHx8IGJHcmVldCkgPyAoYUdyZWV0ID09IGJHcmVldCkgOiB1bmRlZmluZWQ7XG4gICAgICogfSk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGlzRXF1YWwoYSwgYiwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIHJldHVybiBiYXNlSXNFcXVhbChhLCBiLCB0eXBlb2YgY2FsbGJhY2sgPT0gJ2Z1bmN0aW9uJyAmJiBiYXNlQ3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDIpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYHZhbHVlYCBpcywgb3IgY2FuIGJlIGNvZXJjZWQgdG8sIGEgZmluaXRlIG51bWJlci5cbiAgICAgKlxuICAgICAqIE5vdGU6IFRoaXMgaXMgbm90IHRoZSBzYW1lIGFzIG5hdGl2ZSBgaXNGaW5pdGVgIHdoaWNoIHdpbGwgcmV0dXJuIHRydWUgZm9yXG4gICAgICogYm9vbGVhbnMgYW5kIGVtcHR5IHN0cmluZ3MuIFNlZSBodHRwOi8vZXM1LmdpdGh1Yi5pby8jeDE1LjEuMi41LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgZmluaXRlLCBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uaXNGaW5pdGUoLTEwMSk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqXG4gICAgICogXy5pc0Zpbml0ZSgnMTAnKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiBfLmlzRmluaXRlKHRydWUpO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICpcbiAgICAgKiBfLmlzRmluaXRlKCcnKTtcbiAgICAgKiAvLyA9PiBmYWxzZVxuICAgICAqXG4gICAgICogXy5pc0Zpbml0ZShJbmZpbml0eSk7XG4gICAgICogLy8gPT4gZmFsc2VcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc0Zpbml0ZSh2YWx1ZSkge1xuICAgICAgcmV0dXJuIG5hdGl2ZUlzRmluaXRlKHZhbHVlKSAmJiAhbmF0aXZlSXNOYU4ocGFyc2VGbG9hdCh2YWx1ZSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHZhbHVlYCBpcyBhIGZ1bmN0aW9uLCBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uaXNGdW5jdGlvbihfKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnZnVuY3Rpb24nO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZSBsYW5ndWFnZSB0eXBlIG9mIE9iamVjdC5cbiAgICAgKiAoZS5nLiBhcnJheXMsIGZ1bmN0aW9ucywgb2JqZWN0cywgcmVnZXhlcywgYG5ldyBOdW1iZXIoMClgLCBhbmQgYG5ldyBTdHJpbmcoJycpYClcbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmlzT2JqZWN0KHt9KTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqXG4gICAgICogXy5pc09iamVjdCgxKTtcbiAgICAgKiAvLyA9PiBmYWxzZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gICAgICAvLyBjaGVjayBpZiB0aGUgdmFsdWUgaXMgdGhlIEVDTUFTY3JpcHQgbGFuZ3VhZ2UgdHlwZSBvZiBPYmplY3RcbiAgICAgIC8vIGh0dHA6Ly9lczUuZ2l0aHViLmlvLyN4OFxuICAgICAgLy8gYW5kIGF2b2lkIGEgVjggYnVnXG4gICAgICAvLyBodHRwOi8vY29kZS5nb29nbGUuY29tL3AvdjgvaXNzdWVzL2RldGFpbD9pZD0yMjkxXG4gICAgICByZXR1cm4gISEodmFsdWUgJiYgb2JqZWN0VHlwZXNbdHlwZW9mIHZhbHVlXSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYE5hTmAuXG4gICAgICpcbiAgICAgKiBOb3RlOiBUaGlzIGlzIG5vdCB0aGUgc2FtZSBhcyBuYXRpdmUgYGlzTmFOYCB3aGljaCB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yXG4gICAgICogYHVuZGVmaW5lZGAgYW5kIG90aGVyIG5vbi1udW1lcmljIHZhbHVlcy4gU2VlIGh0dHA6Ly9lczUuZ2l0aHViLmlvLyN4MTUuMS4yLjQuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHZhbHVlYCBpcyBgTmFOYCwgZWxzZSBgZmFsc2VgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmlzTmFOKE5hTik7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqXG4gICAgICogXy5pc05hTihuZXcgTnVtYmVyKE5hTikpO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKlxuICAgICAqIGlzTmFOKHVuZGVmaW5lZCk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqXG4gICAgICogXy5pc05hTih1bmRlZmluZWQpO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNOYU4odmFsdWUpIHtcbiAgICAgIC8vIGBOYU5gIGFzIGEgcHJpbWl0aXZlIGlzIHRoZSBvbmx5IHZhbHVlIHRoYXQgaXMgbm90IGVxdWFsIHRvIGl0c2VsZlxuICAgICAgLy8gKHBlcmZvcm0gdGhlIFtbQ2xhc3NdXSBjaGVjayBmaXJzdCB0byBhdm9pZCBlcnJvcnMgd2l0aCBzb21lIGhvc3Qgb2JqZWN0cyBpbiBJRSlcbiAgICAgIHJldHVybiBpc051bWJlcih2YWx1ZSkgJiYgdmFsdWUgIT0gK3ZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGBudWxsYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGBudWxsYCwgZWxzZSBgZmFsc2VgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmlzTnVsbChudWxsKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiBfLmlzTnVsbCh1bmRlZmluZWQpO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNOdWxsKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWUgPT09IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBudW1iZXIuXG4gICAgICpcbiAgICAgKiBOb3RlOiBgTmFOYCBpcyBjb25zaWRlcmVkIGEgbnVtYmVyLiBTZWUgaHR0cDovL2VzNS5naXRodWIuaW8vI3g4LjUuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHZhbHVlYCBpcyBhIG51bWJlciwgZWxzZSBgZmFsc2VgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmlzTnVtYmVyKDguNCAqIDUpO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc051bWJlcih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyB8fFxuICAgICAgICB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcgJiYgdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gbnVtYmVyQ2xhc3MgfHwgZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYW4gb2JqZWN0IGNyZWF0ZWQgYnkgdGhlIGBPYmplY3RgIGNvbnN0cnVjdG9yLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHBsYWluIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBmdW5jdGlvbiBTaGFwZSgpIHtcbiAgICAgKiAgIHRoaXMueCA9IDA7XG4gICAgICogICB0aGlzLnkgPSAwO1xuICAgICAqIH1cbiAgICAgKlxuICAgICAqIF8uaXNQbGFpbk9iamVjdChuZXcgU2hhcGUpO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICpcbiAgICAgKiBfLmlzUGxhaW5PYmplY3QoWzEsIDIsIDNdKTtcbiAgICAgKiAvLyA9PiBmYWxzZVxuICAgICAqXG4gICAgICogXy5pc1BsYWluT2JqZWN0KHsgJ3gnOiAwLCAneSc6IDAgfSk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqL1xuICAgIHZhciBpc1BsYWluT2JqZWN0ID0gIWdldFByb3RvdHlwZU9mID8gc2hpbUlzUGxhaW5PYmplY3QgOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKCEodmFsdWUgJiYgdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gb2JqZWN0Q2xhc3MpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHZhciB2YWx1ZU9mID0gdmFsdWUudmFsdWVPZixcbiAgICAgICAgICBvYmpQcm90byA9IGlzTmF0aXZlKHZhbHVlT2YpICYmIChvYmpQcm90byA9IGdldFByb3RvdHlwZU9mKHZhbHVlT2YpKSAmJiBnZXRQcm90b3R5cGVPZihvYmpQcm90byk7XG5cbiAgICAgIHJldHVybiBvYmpQcm90b1xuICAgICAgICA/ICh2YWx1ZSA9PSBvYmpQcm90byB8fCBnZXRQcm90b3R5cGVPZih2YWx1ZSkgPT0gb2JqUHJvdG8pXG4gICAgICAgIDogc2hpbUlzUGxhaW5PYmplY3QodmFsdWUpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHJlZ3VsYXIgZXhwcmVzc2lvbi5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGEgcmVndWxhciBleHByZXNzaW9uLCBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uaXNSZWdFeHAoL2ZyZWQvKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNSZWdFeHAodmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcgJiYgdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gcmVnZXhwQ2xhc3MgfHwgZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBzdHJpbmcuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHZhbHVlYCBpcyBhIHN0cmluZywgZWxzZSBgZmFsc2VgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmlzU3RyaW5nKCdmcmVkJyk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGlzU3RyaW5nKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdzdHJpbmcnIHx8XG4gICAgICAgIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyAmJiB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PSBzdHJpbmdDbGFzcyB8fCBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBgdW5kZWZpbmVkYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGB1bmRlZmluZWRgLCBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uaXNVbmRlZmluZWQodm9pZCAwKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsdWUpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3VuZGVmaW5lZCc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBvYmplY3Qgd2l0aCB0aGUgc2FtZSBrZXlzIGFzIGBvYmplY3RgIGFuZCB2YWx1ZXMgZ2VuZXJhdGVkIGJ5XG4gICAgICogcnVubmluZyBlYWNoIG93biBlbnVtZXJhYmxlIHByb3BlcnR5IG9mIGBvYmplY3RgIHRocm91Z2ggdGhlIGNhbGxiYWNrLlxuICAgICAqIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWQgd2l0aCB0aHJlZSBhcmd1bWVudHM7XG4gICAgICogKHZhbHVlLCBrZXksIG9iamVjdCkuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdHxzdHJpbmd9IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZFxuICAgICAqICBwZXIgaXRlcmF0aW9uLiBJZiBhIHByb3BlcnR5IG5hbWUgb3Igb2JqZWN0IGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgdXNlZFxuICAgICAqICB0byBjcmVhdGUgYSBcIl8ucGx1Y2tcIiBvciBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFjaywgcmVzcGVjdGl2ZWx5LlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhIG5ldyBvYmplY3Qgd2l0aCB2YWx1ZXMgb2YgdGhlIHJlc3VsdHMgb2YgZWFjaCBgY2FsbGJhY2tgIGV4ZWN1dGlvbi5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5tYXBWYWx1ZXMoeyAnYSc6IDEsICdiJzogMiwgJ2MnOiAzfSAsIGZ1bmN0aW9uKG51bSkgeyByZXR1cm4gbnVtICogMzsgfSk7XG4gICAgICogLy8gPT4geyAnYSc6IDMsICdiJzogNiwgJ2MnOiA5IH1cbiAgICAgKlxuICAgICAqIHZhciBjaGFyYWN0ZXJzID0ge1xuICAgICAqICAgJ2ZyZWQnOiB7ICduYW1lJzogJ2ZyZWQnLCAnYWdlJzogNDAgfSxcbiAgICAgKiAgICdwZWJibGVzJzogeyAnbmFtZSc6ICdwZWJibGVzJywgJ2FnZSc6IDEgfVxuICAgICAqIH07XG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ucGx1Y2tcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLm1hcFZhbHVlcyhjaGFyYWN0ZXJzLCAnYWdlJyk7XG4gICAgICogLy8gPT4geyAnZnJlZCc6IDQwLCAncGViYmxlcyc6IDEgfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG1hcFZhbHVlcyhvYmplY3QsIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG5cbiAgICAgIGZvck93bihvYmplY3QsIGZ1bmN0aW9uKHZhbHVlLCBrZXksIG9iamVjdCkge1xuICAgICAgICByZXN1bHRba2V5XSA9IGNhbGxiYWNrKHZhbHVlLCBrZXksIG9iamVjdCk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVjdXJzaXZlbHkgbWVyZ2VzIG93biBlbnVtZXJhYmxlIHByb3BlcnRpZXMgb2YgdGhlIHNvdXJjZSBvYmplY3QocyksIHRoYXRcbiAgICAgKiBkb24ndCByZXNvbHZlIHRvIGB1bmRlZmluZWRgIGludG8gdGhlIGRlc3RpbmF0aW9uIG9iamVjdC4gU3Vic2VxdWVudCBzb3VyY2VzXG4gICAgICogd2lsbCBvdmVyd3JpdGUgcHJvcGVydHkgYXNzaWdubWVudHMgb2YgcHJldmlvdXMgc291cmNlcy4gSWYgYSBjYWxsYmFjayBpc1xuICAgICAqIHByb3ZpZGVkIGl0IHdpbGwgYmUgZXhlY3V0ZWQgdG8gcHJvZHVjZSB0aGUgbWVyZ2VkIHZhbHVlcyBvZiB0aGUgZGVzdGluYXRpb25cbiAgICAgKiBhbmQgc291cmNlIHByb3BlcnRpZXMuIElmIHRoZSBjYWxsYmFjayByZXR1cm5zIGB1bmRlZmluZWRgIG1lcmdpbmcgd2lsbFxuICAgICAqIGJlIGhhbmRsZWQgYnkgdGhlIG1ldGhvZCBpbnN0ZWFkLiBUaGUgY2FsbGJhY2sgaXMgYm91bmQgdG8gYHRoaXNBcmdgIGFuZFxuICAgICAqIGludm9rZWQgd2l0aCB0d28gYXJndW1lbnRzOyAob2JqZWN0VmFsdWUsIHNvdXJjZVZhbHVlKS5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7Li4uT2JqZWN0fSBbc291cmNlXSBUaGUgc291cmNlIG9iamVjdHMuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIG1lcmdpbmcgcHJvcGVydGllcy5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBuYW1lcyA9IHtcbiAgICAgKiAgICdjaGFyYWN0ZXJzJzogW1xuICAgICAqICAgICB7ICduYW1lJzogJ2Jhcm5leScgfSxcbiAgICAgKiAgICAgeyAnbmFtZSc6ICdmcmVkJyB9XG4gICAgICogICBdXG4gICAgICogfTtcbiAgICAgKlxuICAgICAqIHZhciBhZ2VzID0ge1xuICAgICAqICAgJ2NoYXJhY3RlcnMnOiBbXG4gICAgICogICAgIHsgJ2FnZSc6IDM2IH0sXG4gICAgICogICAgIHsgJ2FnZSc6IDQwIH1cbiAgICAgKiAgIF1cbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogXy5tZXJnZShuYW1lcywgYWdlcyk7XG4gICAgICogLy8gPT4geyAnY2hhcmFjdGVycyc6IFt7ICduYW1lJzogJ2Jhcm5leScsICdhZ2UnOiAzNiB9LCB7ICduYW1lJzogJ2ZyZWQnLCAnYWdlJzogNDAgfV0gfVxuICAgICAqXG4gICAgICogdmFyIGZvb2QgPSB7XG4gICAgICogICAnZnJ1aXRzJzogWydhcHBsZSddLFxuICAgICAqICAgJ3ZlZ2V0YWJsZXMnOiBbJ2JlZXQnXVxuICAgICAqIH07XG4gICAgICpcbiAgICAgKiB2YXIgb3RoZXJGb29kID0ge1xuICAgICAqICAgJ2ZydWl0cyc6IFsnYmFuYW5hJ10sXG4gICAgICogICAndmVnZXRhYmxlcyc6IFsnY2Fycm90J11cbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogXy5tZXJnZShmb29kLCBvdGhlckZvb2QsIGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgKiAgIHJldHVybiBfLmlzQXJyYXkoYSkgPyBhLmNvbmNhdChiKSA6IHVuZGVmaW5lZDtcbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiB7ICdmcnVpdHMnOiBbJ2FwcGxlJywgJ2JhbmFuYSddLCAndmVnZXRhYmxlcyc6IFsnYmVldCcsICdjYXJyb3RdIH1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBtZXJnZShvYmplY3QpIHtcbiAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgICAgIGxlbmd0aCA9IDI7XG5cbiAgICAgIGlmICghaXNPYmplY3Qob2JqZWN0KSkge1xuICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgICAgfVxuICAgICAgLy8gYWxsb3dzIHdvcmtpbmcgd2l0aCBgXy5yZWR1Y2VgIGFuZCBgXy5yZWR1Y2VSaWdodGAgd2l0aG91dCB1c2luZ1xuICAgICAgLy8gdGhlaXIgYGluZGV4YCBhbmQgYGNvbGxlY3Rpb25gIGFyZ3VtZW50c1xuICAgICAgaWYgKHR5cGVvZiBhcmdzWzJdICE9ICdudW1iZXInKSB7XG4gICAgICAgIGxlbmd0aCA9IGFyZ3MubGVuZ3RoO1xuICAgICAgfVxuICAgICAgaWYgKGxlbmd0aCA+IDMgJiYgdHlwZW9mIGFyZ3NbbGVuZ3RoIC0gMl0gPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSBiYXNlQ3JlYXRlQ2FsbGJhY2soYXJnc1stLWxlbmd0aCAtIDFdLCBhcmdzW2xlbmd0aC0tXSwgMik7XG4gICAgICB9IGVsc2UgaWYgKGxlbmd0aCA+IDIgJiYgdHlwZW9mIGFyZ3NbbGVuZ3RoIC0gMV0gPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjYWxsYmFjayA9IGFyZ3NbLS1sZW5ndGhdO1xuICAgICAgfVxuICAgICAgdmFyIHNvdXJjZXMgPSBzbGljZShhcmd1bWVudHMsIDEsIGxlbmd0aCksXG4gICAgICAgICAgaW5kZXggPSAtMSxcbiAgICAgICAgICBzdGFja0EgPSBnZXRBcnJheSgpLFxuICAgICAgICAgIHN0YWNrQiA9IGdldEFycmF5KCk7XG5cbiAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgIGJhc2VNZXJnZShvYmplY3QsIHNvdXJjZXNbaW5kZXhdLCBjYWxsYmFjaywgc3RhY2tBLCBzdGFja0IpO1xuICAgICAgfVxuICAgICAgcmVsZWFzZUFycmF5KHN0YWNrQSk7XG4gICAgICByZWxlYXNlQXJyYXkoc3RhY2tCKTtcbiAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHNoYWxsb3cgY2xvbmUgb2YgYG9iamVjdGAgZXhjbHVkaW5nIHRoZSBzcGVjaWZpZWQgcHJvcGVydGllcy5cbiAgICAgKiBQcm9wZXJ0eSBuYW1lcyBtYXkgYmUgc3BlY2lmaWVkIGFzIGluZGl2aWR1YWwgYXJndW1lbnRzIG9yIGFzIGFycmF5cyBvZlxuICAgICAqIHByb3BlcnR5IG5hbWVzLiBJZiBhIGNhbGxiYWNrIGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgZXhlY3V0ZWQgZm9yIGVhY2hcbiAgICAgKiBwcm9wZXJ0eSBvZiBgb2JqZWN0YCBvbWl0dGluZyB0aGUgcHJvcGVydGllcyB0aGUgY2FsbGJhY2sgcmV0dXJucyB0cnVleVxuICAgICAqIGZvci4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50cztcbiAgICAgKiAodmFsdWUsIGtleSwgb2JqZWN0KS5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgc291cmNlIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufC4uLnN0cmluZ3xzdHJpbmdbXX0gW2NhbGxiYWNrXSBUaGUgcHJvcGVydGllcyB0byBvbWl0IG9yIHRoZVxuICAgICAqICBmdW5jdGlvbiBjYWxsZWQgcGVyIGl0ZXJhdGlvbi5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGFuIG9iamVjdCB3aXRob3V0IHRoZSBvbWl0dGVkIHByb3BlcnRpZXMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8ub21pdCh7ICduYW1lJzogJ2ZyZWQnLCAnYWdlJzogNDAgfSwgJ2FnZScpO1xuICAgICAqIC8vID0+IHsgJ25hbWUnOiAnZnJlZCcgfVxuICAgICAqXG4gICAgICogXy5vbWl0KHsgJ25hbWUnOiAnZnJlZCcsICdhZ2UnOiA0MCB9LCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAqICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJztcbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiB7ICduYW1lJzogJ2ZyZWQnIH1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBvbWl0KG9iamVjdCwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YXIgcHJvcHMgPSBbXTtcbiAgICAgICAgZm9ySW4ob2JqZWN0LCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgcHJvcHMucHVzaChrZXkpO1xuICAgICAgICB9KTtcbiAgICAgICAgcHJvcHMgPSBiYXNlRGlmZmVyZW5jZShwcm9wcywgYmFzZUZsYXR0ZW4oYXJndW1lbnRzLCB0cnVlLCBmYWxzZSwgMSkpO1xuXG4gICAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoO1xuXG4gICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgdmFyIGtleSA9IHByb3BzW2luZGV4XTtcbiAgICAgICAgICByZXN1bHRba2V5XSA9IG9iamVjdFtrZXldO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICAgIGZvckluKG9iamVjdCwgZnVuY3Rpb24odmFsdWUsIGtleSwgb2JqZWN0KSB7XG4gICAgICAgICAgaWYgKCFjYWxsYmFjayh2YWx1ZSwga2V5LCBvYmplY3QpKSB7XG4gICAgICAgICAgICByZXN1bHRba2V5XSA9IHZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSB0d28gZGltZW5zaW9uYWwgYXJyYXkgb2YgYW4gb2JqZWN0J3Mga2V5LXZhbHVlIHBhaXJzLFxuICAgICAqIGkuZS4gYFtba2V5MSwgdmFsdWUxXSwgW2tleTIsIHZhbHVlMl1dYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGluc3BlY3QuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIG5ldyBhcnJheSBvZiBrZXktdmFsdWUgcGFpcnMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8ucGFpcnMoeyAnYmFybmV5JzogMzYsICdmcmVkJzogNDAgfSk7XG4gICAgICogLy8gPT4gW1snYmFybmV5JywgMzZdLCBbJ2ZyZWQnLCA0MF1dIChwcm9wZXJ0eSBvcmRlciBpcyBub3QgZ3VhcmFudGVlZCBhY3Jvc3MgZW52aXJvbm1lbnRzKVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHBhaXJzKG9iamVjdCkge1xuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgcHJvcHMgPSBrZXlzKG9iamVjdCksXG4gICAgICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoLFxuICAgICAgICAgIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgIHZhciBrZXkgPSBwcm9wc1tpbmRleF07XG4gICAgICAgIHJlc3VsdFtpbmRleF0gPSBba2V5LCBvYmplY3Rba2V5XV07XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBzaGFsbG93IGNsb25lIG9mIGBvYmplY3RgIGNvbXBvc2VkIG9mIHRoZSBzcGVjaWZpZWQgcHJvcGVydGllcy5cbiAgICAgKiBQcm9wZXJ0eSBuYW1lcyBtYXkgYmUgc3BlY2lmaWVkIGFzIGluZGl2aWR1YWwgYXJndW1lbnRzIG9yIGFzIGFycmF5cyBvZlxuICAgICAqIHByb3BlcnR5IG5hbWVzLiBJZiBhIGNhbGxiYWNrIGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgZXhlY3V0ZWQgZm9yIGVhY2hcbiAgICAgKiBwcm9wZXJ0eSBvZiBgb2JqZWN0YCBwaWNraW5nIHRoZSBwcm9wZXJ0aWVzIHRoZSBjYWxsYmFjayByZXR1cm5zIHRydWV5XG4gICAgICogZm9yLiBUaGUgY2FsbGJhY2sgaXMgYm91bmQgdG8gYHRoaXNBcmdgIGFuZCBpbnZva2VkIHdpdGggdGhyZWUgYXJndW1lbnRzO1xuICAgICAqICh2YWx1ZSwga2V5LCBvYmplY3QpLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBzb3VyY2Ugb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258Li4uc3RyaW5nfHN0cmluZ1tdfSBbY2FsbGJhY2tdIFRoZSBmdW5jdGlvbiBjYWxsZWQgcGVyXG4gICAgICogIGl0ZXJhdGlvbiBvciBwcm9wZXJ0eSBuYW1lcyB0byBwaWNrLCBzcGVjaWZpZWQgYXMgaW5kaXZpZHVhbCBwcm9wZXJ0eVxuICAgICAqICBuYW1lcyBvciBhcnJheXMgb2YgcHJvcGVydHkgbmFtZXMuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBhbiBvYmplY3QgY29tcG9zZWQgb2YgdGhlIHBpY2tlZCBwcm9wZXJ0aWVzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLnBpY2soeyAnbmFtZSc6ICdmcmVkJywgJ191c2VyaWQnOiAnZnJlZDEnIH0sICduYW1lJyk7XG4gICAgICogLy8gPT4geyAnbmFtZSc6ICdmcmVkJyB9XG4gICAgICpcbiAgICAgKiBfLnBpY2soeyAnbmFtZSc6ICdmcmVkJywgJ191c2VyaWQnOiAnZnJlZDEnIH0sIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgKiAgIHJldHVybiBrZXkuY2hhckF0KDApICE9ICdfJztcbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiB7ICduYW1lJzogJ2ZyZWQnIH1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBwaWNrKG9iamVjdCwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICAgIHByb3BzID0gYmFzZUZsYXR0ZW4oYXJndW1lbnRzLCB0cnVlLCBmYWxzZSwgMSksXG4gICAgICAgICAgICBsZW5ndGggPSBpc09iamVjdChvYmplY3QpID8gcHJvcHMubGVuZ3RoIDogMDtcblxuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgIHZhciBrZXkgPSBwcm9wc1tpbmRleF07XG4gICAgICAgICAgaWYgKGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgICAgIHJlc3VsdFtrZXldID0gb2JqZWN0W2tleV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICAgIGZvckluKG9iamVjdCwgZnVuY3Rpb24odmFsdWUsIGtleSwgb2JqZWN0KSB7XG4gICAgICAgICAgaWYgKGNhbGxiYWNrKHZhbHVlLCBrZXksIG9iamVjdCkpIHtcbiAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQW4gYWx0ZXJuYXRpdmUgdG8gYF8ucmVkdWNlYCB0aGlzIG1ldGhvZCB0cmFuc2Zvcm1zIGBvYmplY3RgIHRvIGEgbmV3XG4gICAgICogYGFjY3VtdWxhdG9yYCBvYmplY3Qgd2hpY2ggaXMgdGhlIHJlc3VsdCBvZiBydW5uaW5nIGVhY2ggb2YgaXRzIG93blxuICAgICAqIGVudW1lcmFibGUgcHJvcGVydGllcyB0aHJvdWdoIGEgY2FsbGJhY2ssIHdpdGggZWFjaCBjYWxsYmFjayBleGVjdXRpb25cbiAgICAgKiBwb3RlbnRpYWxseSBtdXRhdGluZyB0aGUgYGFjY3VtdWxhdG9yYCBvYmplY3QuIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0b1xuICAgICAqIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIGZvdXIgYXJndW1lbnRzOyAoYWNjdW11bGF0b3IsIHZhbHVlLCBrZXksIG9iamVjdCkuXG4gICAgICogQ2FsbGJhY2tzIG1heSBleGl0IGl0ZXJhdGlvbiBlYXJseSBieSBleHBsaWNpdGx5IHJldHVybmluZyBgZmFsc2VgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZCBwZXIgaXRlcmF0aW9uLlxuICAgICAqIEBwYXJhbSB7Kn0gW2FjY3VtdWxhdG9yXSBUaGUgY3VzdG9tIGFjY3VtdWxhdG9yIHZhbHVlLlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBhY2N1bXVsYXRlZCB2YWx1ZS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIHNxdWFyZXMgPSBfLnRyYW5zZm9ybShbMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgMTBdLCBmdW5jdGlvbihyZXN1bHQsIG51bSkge1xuICAgICAqICAgbnVtICo9IG51bTtcbiAgICAgKiAgIGlmIChudW0gJSAyKSB7XG4gICAgICogICAgIHJldHVybiByZXN1bHQucHVzaChudW0pIDwgMztcbiAgICAgKiAgIH1cbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiBbMSwgOSwgMjVdXG4gICAgICpcbiAgICAgKiB2YXIgbWFwcGVkID0gXy50cmFuc2Zvcm0oeyAnYSc6IDEsICdiJzogMiwgJ2MnOiAzIH0sIGZ1bmN0aW9uKHJlc3VsdCwgbnVtLCBrZXkpIHtcbiAgICAgKiAgIHJlc3VsdFtrZXldID0gbnVtICogMztcbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiB7ICdhJzogMywgJ2InOiA2LCAnYyc6IDkgfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRyYW5zZm9ybShvYmplY3QsIGNhbGxiYWNrLCBhY2N1bXVsYXRvciwgdGhpc0FyZykge1xuICAgICAgdmFyIGlzQXJyID0gaXNBcnJheShvYmplY3QpO1xuICAgICAgaWYgKGFjY3VtdWxhdG9yID09IG51bGwpIHtcbiAgICAgICAgaWYgKGlzQXJyKSB7XG4gICAgICAgICAgYWNjdW11bGF0b3IgPSBbXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgY3RvciA9IG9iamVjdCAmJiBvYmplY3QuY29uc3RydWN0b3IsXG4gICAgICAgICAgICAgIHByb3RvID0gY3RvciAmJiBjdG9yLnByb3RvdHlwZTtcblxuICAgICAgICAgIGFjY3VtdWxhdG9yID0gYmFzZUNyZWF0ZShwcm90byk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgNCk7XG4gICAgICAgIChpc0FyciA/IGZvckVhY2ggOiBmb3JPd24pKG9iamVjdCwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBvYmplY3QpIHtcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2soYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgb2JqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYWNjdW11bGF0b3I7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBhcnJheSBjb21wb3NlZCBvZiB0aGUgb3duIGVudW1lcmFibGUgcHJvcGVydHkgdmFsdWVzIG9mIGBvYmplY3RgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaW5zcGVjdC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYW4gYXJyYXkgb2YgcHJvcGVydHkgdmFsdWVzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLnZhbHVlcyh7ICdvbmUnOiAxLCAndHdvJzogMiwgJ3RocmVlJzogMyB9KTtcbiAgICAgKiAvLyA9PiBbMSwgMiwgM10gKHByb3BlcnR5IG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkIGFjcm9zcyBlbnZpcm9ubWVudHMpXG4gICAgICovXG4gICAgZnVuY3Rpb24gdmFsdWVzKG9iamVjdCkge1xuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgcHJvcHMgPSBrZXlzKG9iamVjdCksXG4gICAgICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoLFxuICAgICAgICAgIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgIHJlc3VsdFtpbmRleF0gPSBvYmplY3RbcHJvcHNbaW5kZXhdXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGFycmF5IG9mIGVsZW1lbnRzIGZyb20gdGhlIHNwZWNpZmllZCBpbmRleGVzLCBvciBrZXlzLCBvZiB0aGVcbiAgICAgKiBgY29sbGVjdGlvbmAuIEluZGV4ZXMgbWF5IGJlIHNwZWNpZmllZCBhcyBpbmRpdmlkdWFsIGFyZ3VtZW50cyBvciBhcyBhcnJheXNcbiAgICAgKiBvZiBpbmRleGVzLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25zXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0gey4uLihudW1iZXJ8bnVtYmVyW118c3RyaW5nfHN0cmluZ1tdKX0gW2luZGV4XSBUaGUgaW5kZXhlcyBvZiBgY29sbGVjdGlvbmBcbiAgICAgKiAgIHRvIHJldHJpZXZlLCBzcGVjaWZpZWQgYXMgaW5kaXZpZHVhbCBpbmRleGVzIG9yIGFycmF5cyBvZiBpbmRleGVzLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhIG5ldyBhcnJheSBvZiBlbGVtZW50cyBjb3JyZXNwb25kaW5nIHRvIHRoZVxuICAgICAqICBwcm92aWRlZCBpbmRleGVzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmF0KFsnYScsICdiJywgJ2MnLCAnZCcsICdlJ10sIFswLCAyLCA0XSk7XG4gICAgICogLy8gPT4gWydhJywgJ2MnLCAnZSddXG4gICAgICpcbiAgICAgKiBfLmF0KFsnZnJlZCcsICdiYXJuZXknLCAncGViYmxlcyddLCAwLCAyKTtcbiAgICAgKiAvLyA9PiBbJ2ZyZWQnLCAncGViYmxlcyddXG4gICAgICovXG4gICAgZnVuY3Rpb24gYXQoY29sbGVjdGlvbikge1xuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgICAgICAgaW5kZXggPSAtMSxcbiAgICAgICAgICBwcm9wcyA9IGJhc2VGbGF0dGVuKGFyZ3MsIHRydWUsIGZhbHNlLCAxKSxcbiAgICAgICAgICBsZW5ndGggPSAoYXJnc1syXSAmJiBhcmdzWzJdW2FyZ3NbMV1dID09PSBjb2xsZWN0aW9uKSA/IDEgOiBwcm9wcy5sZW5ndGgsXG4gICAgICAgICAgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgICAgd2hpbGUoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICByZXN1bHRbaW5kZXhdID0gY29sbGVjdGlvbltwcm9wc1tpbmRleF1dO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYSBnaXZlbiB2YWx1ZSBpcyBwcmVzZW50IGluIGEgY29sbGVjdGlvbiB1c2luZyBzdHJpY3QgZXF1YWxpdHlcbiAgICAgKiBmb3IgY29tcGFyaXNvbnMsIGkuZS4gYD09PWAuIElmIGBmcm9tSW5kZXhgIGlzIG5lZ2F0aXZlLCBpdCBpcyB1c2VkIGFzIHRoZVxuICAgICAqIG9mZnNldCBmcm9tIHRoZSBlbmQgb2YgdGhlIGNvbGxlY3Rpb24uXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAYWxpYXMgaW5jbHVkZVxuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHsqfSB0YXJnZXQgVGhlIHZhbHVlIHRvIGNoZWNrIGZvci5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW2Zyb21JbmRleD0wXSBUaGUgaW5kZXggdG8gc2VhcmNoIGZyb20uXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdGFyZ2V0YCBlbGVtZW50IGlzIGZvdW5kLCBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uY29udGFpbnMoWzEsIDIsIDNdLCAxKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiBfLmNvbnRhaW5zKFsxLCAyLCAzXSwgMSwgMik7XG4gICAgICogLy8gPT4gZmFsc2VcbiAgICAgKlxuICAgICAqIF8uY29udGFpbnMoeyAnbmFtZSc6ICdmcmVkJywgJ2FnZSc6IDQwIH0sICdmcmVkJyk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqXG4gICAgICogXy5jb250YWlucygncGViYmxlcycsICdlYicpO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjb250YWlucyhjb2xsZWN0aW9uLCB0YXJnZXQsIGZyb21JbmRleCkge1xuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgaW5kZXhPZiA9IGdldEluZGV4T2YoKSxcbiAgICAgICAgICBsZW5ndGggPSBjb2xsZWN0aW9uID8gY29sbGVjdGlvbi5sZW5ndGggOiAwLFxuICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xuXG4gICAgICBmcm9tSW5kZXggPSAoZnJvbUluZGV4IDwgMCA/IG5hdGl2ZU1heCgwLCBsZW5ndGggKyBmcm9tSW5kZXgpIDogZnJvbUluZGV4KSB8fCAwO1xuICAgICAgaWYgKGlzQXJyYXkoY29sbGVjdGlvbikpIHtcbiAgICAgICAgcmVzdWx0ID0gaW5kZXhPZihjb2xsZWN0aW9uLCB0YXJnZXQsIGZyb21JbmRleCkgPiAtMTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJykge1xuICAgICAgICByZXN1bHQgPSAoaXNTdHJpbmcoY29sbGVjdGlvbikgPyBjb2xsZWN0aW9uLmluZGV4T2YodGFyZ2V0LCBmcm9tSW5kZXgpIDogaW5kZXhPZihjb2xsZWN0aW9uLCB0YXJnZXQsIGZyb21JbmRleCkpID4gLTE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3JPd24oY29sbGVjdGlvbiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICBpZiAoKytpbmRleCA+PSBmcm9tSW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiAhKHJlc3VsdCA9IHZhbHVlID09PSB0YXJnZXQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gb2JqZWN0IGNvbXBvc2VkIG9mIGtleXMgZ2VuZXJhdGVkIGZyb20gdGhlIHJlc3VsdHMgb2YgcnVubmluZ1xuICAgICAqIGVhY2ggZWxlbWVudCBvZiBgY29sbGVjdGlvbmAgdGhyb3VnaCB0aGUgY2FsbGJhY2suIFRoZSBjb3JyZXNwb25kaW5nIHZhbHVlXG4gICAgICogb2YgZWFjaCBrZXkgaXMgdGhlIG51bWJlciBvZiB0aW1lcyB0aGUga2V5IHdhcyByZXR1cm5lZCBieSB0aGUgY2FsbGJhY2suXG4gICAgICogVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50cztcbiAgICAgKiAodmFsdWUsIGluZGV4fGtleSwgY29sbGVjdGlvbikuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8c3RyaW5nfSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWRcbiAgICAgKiAgcGVyIGl0ZXJhdGlvbi4gSWYgYSBwcm9wZXJ0eSBuYW1lIG9yIG9iamVjdCBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIHVzZWRcbiAgICAgKiAgdG8gY3JlYXRlIGEgXCJfLnBsdWNrXCIgb3IgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2ssIHJlc3BlY3RpdmVseS5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjb21wb3NlZCBhZ2dyZWdhdGUgb2JqZWN0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmNvdW50QnkoWzQuMywgNi4xLCA2LjRdLCBmdW5jdGlvbihudW0pIHsgcmV0dXJuIE1hdGguZmxvb3IobnVtKTsgfSk7XG4gICAgICogLy8gPT4geyAnNCc6IDEsICc2JzogMiB9XG4gICAgICpcbiAgICAgKiBfLmNvdW50QnkoWzQuMywgNi4xLCA2LjRdLCBmdW5jdGlvbihudW0pIHsgcmV0dXJuIHRoaXMuZmxvb3IobnVtKTsgfSwgTWF0aCk7XG4gICAgICogLy8gPT4geyAnNCc6IDEsICc2JzogMiB9XG4gICAgICpcbiAgICAgKiBfLmNvdW50QnkoWydvbmUnLCAndHdvJywgJ3RocmVlJ10sICdsZW5ndGgnKTtcbiAgICAgKiAvLyA9PiB7ICczJzogMiwgJzUnOiAxIH1cbiAgICAgKi9cbiAgICB2YXIgY291bnRCeSA9IGNyZWF0ZUFnZ3JlZ2F0b3IoZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwga2V5KSB7XG4gICAgICAoaGFzT3duUHJvcGVydHkuY2FsbChyZXN1bHQsIGtleSkgPyByZXN1bHRba2V5XSsrIDogcmVzdWx0W2tleV0gPSAxKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gY2FsbGJhY2sgcmV0dXJucyB0cnVleSB2YWx1ZSBmb3IgKiphbGwqKiBlbGVtZW50cyBvZlxuICAgICAqIGEgY29sbGVjdGlvbi4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIHRocmVlXG4gICAgICogYXJndW1lbnRzOyAodmFsdWUsIGluZGV4fGtleSwgY29sbGVjdGlvbikuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBhbGlhcyBhbGxcbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvbnNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkXG4gICAgICogIHBlciBpdGVyYXRpb24uIElmIGEgcHJvcGVydHkgbmFtZSBvciBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkXG4gICAgICogIHRvIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFsbCBlbGVtZW50cyBwYXNzZWQgdGhlIGNhbGxiYWNrIGNoZWNrLFxuICAgICAqICBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uZXZlcnkoW3RydWUsIDEsIG51bGwsICd5ZXMnXSk7XG4gICAgICogLy8gPT4gZmFsc2VcbiAgICAgKlxuICAgICAqIHZhciBjaGFyYWN0ZXJzID0gW1xuICAgICAqICAgeyAnbmFtZSc6ICdiYXJuZXknLCAnYWdlJzogMzYgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgJ2FnZSc6IDQwIH1cbiAgICAgKiBdO1xuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLnBsdWNrXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5ldmVyeShjaGFyYWN0ZXJzLCAnYWdlJyk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLndoZXJlXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5ldmVyeShjaGFyYWN0ZXJzLCB7ICdhZ2UnOiAzNiB9KTtcbiAgICAgKiAvLyA9PiBmYWxzZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGV2ZXJ5KGNvbGxlY3Rpb24sIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgIGNhbGxiYWNrID0gbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcblxuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgbGVuZ3RoID0gY29sbGVjdGlvbiA/IGNvbGxlY3Rpb24ubGVuZ3RoIDogMDtcblxuICAgICAgaWYgKHR5cGVvZiBsZW5ndGggPT0gJ251bWJlcicpIHtcbiAgICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICBpZiAoIShyZXN1bHQgPSAhIWNhbGxiYWNrKGNvbGxlY3Rpb25baW5kZXhdLCBpbmRleCwgY29sbGVjdGlvbikpKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvck93bihjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICByZXR1cm4gKHJlc3VsdCA9ICEhY2FsbGJhY2sodmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJdGVyYXRlcyBvdmVyIGVsZW1lbnRzIG9mIGEgY29sbGVjdGlvbiwgcmV0dXJuaW5nIGFuIGFycmF5IG9mIGFsbCBlbGVtZW50c1xuICAgICAqIHRoZSBjYWxsYmFjayByZXR1cm5zIHRydWV5IGZvci4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmRcbiAgICAgKiBpbnZva2VkIHdpdGggdGhyZWUgYXJndW1lbnRzOyAodmFsdWUsIGluZGV4fGtleSwgY29sbGVjdGlvbikuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBhbGlhcyBzZWxlY3RcbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvbnNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkXG4gICAgICogIHBlciBpdGVyYXRpb24uIElmIGEgcHJvcGVydHkgbmFtZSBvciBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkXG4gICAgICogIHRvIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGEgbmV3IGFycmF5IG9mIGVsZW1lbnRzIHRoYXQgcGFzc2VkIHRoZSBjYWxsYmFjayBjaGVjay5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIGV2ZW5zID0gXy5maWx0ZXIoWzEsIDIsIDMsIDQsIDUsIDZdLCBmdW5jdGlvbihudW0pIHsgcmV0dXJuIG51bSAlIDIgPT0gMDsgfSk7XG4gICAgICogLy8gPT4gWzIsIDQsIDZdXG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgJ2FnZSc6IDM2LCAnYmxvY2tlZCc6IGZhbHNlIH0sXG4gICAgICogICB7ICduYW1lJzogJ2ZyZWQnLCAgICdhZ2UnOiA0MCwgJ2Jsb2NrZWQnOiB0cnVlIH1cbiAgICAgKiBdO1xuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLnBsdWNrXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5maWx0ZXIoY2hhcmFjdGVycywgJ2Jsb2NrZWQnKTtcbiAgICAgKiAvLyA9PiBbeyAnbmFtZSc6ICdmcmVkJywgJ2FnZSc6IDQwLCAnYmxvY2tlZCc6IHRydWUgfV1cbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy53aGVyZVwiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8uZmlsdGVyKGNoYXJhY3RlcnMsIHsgJ2FnZSc6IDM2IH0pO1xuICAgICAqIC8vID0+IFt7ICduYW1lJzogJ2Jhcm5leScsICdhZ2UnOiAzNiwgJ2Jsb2NrZWQnOiBmYWxzZSB9XVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGZpbHRlcihjb2xsZWN0aW9uLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgY2FsbGJhY2sgPSBsb2Rhc2guY3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDMpO1xuXG4gICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICBsZW5ndGggPSBjb2xsZWN0aW9uID8gY29sbGVjdGlvbi5sZW5ndGggOiAwO1xuXG4gICAgICBpZiAodHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJykge1xuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgIHZhciB2YWx1ZSA9IGNvbGxlY3Rpb25baW5kZXhdO1xuICAgICAgICAgIGlmIChjYWxsYmFjayh2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3JPd24oY29sbGVjdGlvbiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgICAgICAgaWYgKGNhbGxiYWNrKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJdGVyYXRlcyBvdmVyIGVsZW1lbnRzIG9mIGEgY29sbGVjdGlvbiwgcmV0dXJuaW5nIHRoZSBmaXJzdCBlbGVtZW50IHRoYXRcbiAgICAgKiB0aGUgY2FsbGJhY2sgcmV0dXJucyB0cnVleSBmb3IuIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kXG4gICAgICogaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50czsgKHZhbHVlLCBpbmRleHxrZXksIGNvbGxlY3Rpb24pLlxuICAgICAqXG4gICAgICogSWYgYSBwcm9wZXJ0eSBuYW1lIGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy5wbHVja1wiIHN0eWxlXG4gICAgICogY2FsbGJhY2sgd2lsbCByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgICAqXG4gICAgICogSWYgYW4gb2JqZWN0IGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrXG4gICAgICogd2lsbCByZXR1cm4gYHRydWVgIGZvciBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHByb3BlcnRpZXMgb2YgdGhlIGdpdmVuIG9iamVjdCxcbiAgICAgKiBlbHNlIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAYWxpYXMgZGV0ZWN0LCBmaW5kV2hlcmVcbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvbnNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkXG4gICAgICogIHBlciBpdGVyYXRpb24uIElmIGEgcHJvcGVydHkgbmFtZSBvciBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkXG4gICAgICogIHRvIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGZvdW5kIGVsZW1lbnQsIGVsc2UgYHVuZGVmaW5lZGAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBjaGFyYWN0ZXJzID0gW1xuICAgICAqICAgeyAnbmFtZSc6ICdiYXJuZXknLCAgJ2FnZSc6IDM2LCAnYmxvY2tlZCc6IGZhbHNlIH0sXG4gICAgICogICB7ICduYW1lJzogJ2ZyZWQnLCAgICAnYWdlJzogNDAsICdibG9ja2VkJzogdHJ1ZSB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdwZWJibGVzJywgJ2FnZSc6IDEsICAnYmxvY2tlZCc6IGZhbHNlIH1cbiAgICAgKiBdO1xuICAgICAqXG4gICAgICogXy5maW5kKGNoYXJhY3RlcnMsIGZ1bmN0aW9uKGNocikge1xuICAgICAqICAgcmV0dXJuIGNoci5hZ2UgPCA0MDtcbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiB7ICduYW1lJzogJ2Jhcm5leScsICdhZ2UnOiAzNiwgJ2Jsb2NrZWQnOiBmYWxzZSB9XG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ud2hlcmVcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLmZpbmQoY2hhcmFjdGVycywgeyAnYWdlJzogMSB9KTtcbiAgICAgKiAvLyA9PiAgeyAnbmFtZSc6ICdwZWJibGVzJywgJ2FnZSc6IDEsICdibG9ja2VkJzogZmFsc2UgfVxuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLnBsdWNrXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5maW5kKGNoYXJhY3RlcnMsICdibG9ja2VkJyk7XG4gICAgICogLy8gPT4geyAnbmFtZSc6ICdmcmVkJywgJ2FnZSc6IDQwLCAnYmxvY2tlZCc6IHRydWUgfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGZpbmQoY29sbGVjdGlvbiwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIGNhbGxiYWNrID0gbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcblxuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgbGVuZ3RoID0gY29sbGVjdGlvbiA/IGNvbGxlY3Rpb24ubGVuZ3RoIDogMDtcblxuICAgICAgaWYgKHR5cGVvZiBsZW5ndGggPT0gJ251bWJlcicpIHtcbiAgICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICB2YXIgdmFsdWUgPSBjb2xsZWN0aW9uW2luZGV4XTtcbiAgICAgICAgICBpZiAoY2FsbGJhY2sodmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgZm9yT3duKGNvbGxlY3Rpb24sIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICAgIGlmIChjYWxsYmFjayh2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGxpa2UgYF8uZmluZGAgZXhjZXB0IHRoYXQgaXQgaXRlcmF0ZXMgb3ZlciBlbGVtZW50c1xuICAgICAqIG9mIGEgYGNvbGxlY3Rpb25gIGZyb20gcmlnaHQgdG8gbGVmdC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8c3RyaW5nfSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWRcbiAgICAgKiAgcGVyIGl0ZXJhdGlvbi4gSWYgYSBwcm9wZXJ0eSBuYW1lIG9yIG9iamVjdCBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIHVzZWRcbiAgICAgKiAgdG8gY3JlYXRlIGEgXCJfLnBsdWNrXCIgb3IgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2ssIHJlc3BlY3RpdmVseS5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZm91bmQgZWxlbWVudCwgZWxzZSBgdW5kZWZpbmVkYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5maW5kTGFzdChbMSwgMiwgMywgNF0sIGZ1bmN0aW9uKG51bSkge1xuICAgICAqICAgcmV0dXJuIG51bSAlIDIgPT0gMTtcbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiAzXG4gICAgICovXG4gICAgZnVuY3Rpb24gZmluZExhc3QoY29sbGVjdGlvbiwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIHZhciByZXN1bHQ7XG4gICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICBmb3JFYWNoUmlnaHQoY29sbGVjdGlvbiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgICAgIGlmIChjYWxsYmFjayh2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pKSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSXRlcmF0ZXMgb3ZlciBlbGVtZW50cyBvZiBhIGNvbGxlY3Rpb24sIGV4ZWN1dGluZyB0aGUgY2FsbGJhY2sgZm9yIGVhY2hcbiAgICAgKiBlbGVtZW50LiBUaGUgY2FsbGJhY2sgaXMgYm91bmQgdG8gYHRoaXNBcmdgIGFuZCBpbnZva2VkIHdpdGggdGhyZWUgYXJndW1lbnRzO1xuICAgICAqICh2YWx1ZSwgaW5kZXh8a2V5LCBjb2xsZWN0aW9uKS4gQ2FsbGJhY2tzIG1heSBleGl0IGl0ZXJhdGlvbiBlYXJseSBieVxuICAgICAqIGV4cGxpY2l0bHkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiBOb3RlOiBBcyB3aXRoIG90aGVyIFwiQ29sbGVjdGlvbnNcIiBtZXRob2RzLCBvYmplY3RzIHdpdGggYSBgbGVuZ3RoYCBwcm9wZXJ0eVxuICAgICAqIGFyZSBpdGVyYXRlZCBsaWtlIGFycmF5cy4gVG8gYXZvaWQgdGhpcyBiZWhhdmlvciBgXy5mb3JJbmAgb3IgYF8uZm9yT3duYFxuICAgICAqIG1heSBiZSB1c2VkIGZvciBvYmplY3QgaXRlcmF0aW9uLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGFsaWFzIGVhY2hcbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvbnNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZCBwZXIgaXRlcmF0aW9uLlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtBcnJheXxPYmplY3R8c3RyaW5nfSBSZXR1cm5zIGBjb2xsZWN0aW9uYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXyhbMSwgMiwgM10pLmZvckVhY2goZnVuY3Rpb24obnVtKSB7IGNvbnNvbGUubG9nKG51bSk7IH0pLmpvaW4oJywnKTtcbiAgICAgKiAvLyA9PiBsb2dzIGVhY2ggbnVtYmVyIGFuZCByZXR1cm5zICcxLDIsMydcbiAgICAgKlxuICAgICAqIF8uZm9yRWFjaCh7ICdvbmUnOiAxLCAndHdvJzogMiwgJ3RocmVlJzogMyB9LCBmdW5jdGlvbihudW0pIHsgY29uc29sZS5sb2cobnVtKTsgfSk7XG4gICAgICogLy8gPT4gbG9ncyBlYWNoIG51bWJlciBhbmQgcmV0dXJucyB0aGUgb2JqZWN0IChwcm9wZXJ0eSBvcmRlciBpcyBub3QgZ3VhcmFudGVlZCBhY3Jvc3MgZW52aXJvbm1lbnRzKVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGZvckVhY2goY29sbGVjdGlvbiwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgIGxlbmd0aCA9IGNvbGxlY3Rpb24gPyBjb2xsZWN0aW9uLmxlbmd0aCA6IDA7XG5cbiAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgJiYgdHlwZW9mIHRoaXNBcmcgPT0gJ3VuZGVmaW5lZCcgPyBjYWxsYmFjayA6IGJhc2VDcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICBpZiAodHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJykge1xuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgIGlmIChjYWxsYmFjayhjb2xsZWN0aW9uW2luZGV4XSwgaW5kZXgsIGNvbGxlY3Rpb24pID09PSBmYWxzZSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3JPd24oY29sbGVjdGlvbiwgY2FsbGJhY2spO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbGxlY3Rpb247XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgbGlrZSBgXy5mb3JFYWNoYCBleGNlcHQgdGhhdCBpdCBpdGVyYXRlcyBvdmVyIGVsZW1lbnRzXG4gICAgICogb2YgYSBgY29sbGVjdGlvbmAgZnJvbSByaWdodCB0byBsZWZ0LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGFsaWFzIGVhY2hSaWdodFxuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkIHBlciBpdGVyYXRpb24uXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge0FycmF5fE9iamVjdHxzdHJpbmd9IFJldHVybnMgYGNvbGxlY3Rpb25gLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfKFsxLCAyLCAzXSkuZm9yRWFjaFJpZ2h0KGZ1bmN0aW9uKG51bSkgeyBjb25zb2xlLmxvZyhudW0pOyB9KS5qb2luKCcsJyk7XG4gICAgICogLy8gPT4gbG9ncyBlYWNoIG51bWJlciBmcm9tIHJpZ2h0IHRvIGxlZnQgYW5kIHJldHVybnMgJzMsMiwxJ1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGZvckVhY2hSaWdodChjb2xsZWN0aW9uLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgdmFyIGxlbmd0aCA9IGNvbGxlY3Rpb24gPyBjb2xsZWN0aW9uLmxlbmd0aCA6IDA7XG4gICAgICBjYWxsYmFjayA9IGNhbGxiYWNrICYmIHR5cGVvZiB0aGlzQXJnID09ICd1bmRlZmluZWQnID8gY2FsbGJhY2sgOiBiYXNlQ3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDMpO1xuICAgICAgaWYgKHR5cGVvZiBsZW5ndGggPT0gJ251bWJlcicpIHtcbiAgICAgICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAgICAgaWYgKGNhbGxiYWNrKGNvbGxlY3Rpb25bbGVuZ3RoXSwgbGVuZ3RoLCBjb2xsZWN0aW9uKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHByb3BzID0ga2V5cyhjb2xsZWN0aW9uKTtcbiAgICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoO1xuICAgICAgICBmb3JPd24oY29sbGVjdGlvbiwgZnVuY3Rpb24odmFsdWUsIGtleSwgY29sbGVjdGlvbikge1xuICAgICAgICAgIGtleSA9IHByb3BzID8gcHJvcHNbLS1sZW5ndGhdIDogLS1sZW5ndGg7XG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGNvbGxlY3Rpb25ba2V5XSwga2V5LCBjb2xsZWN0aW9uKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29sbGVjdGlvbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIG9iamVjdCBjb21wb3NlZCBvZiBrZXlzIGdlbmVyYXRlZCBmcm9tIHRoZSByZXN1bHRzIG9mIHJ1bm5pbmdcbiAgICAgKiBlYWNoIGVsZW1lbnQgb2YgYSBjb2xsZWN0aW9uIHRocm91Z2ggdGhlIGNhbGxiYWNrLiBUaGUgY29ycmVzcG9uZGluZyB2YWx1ZVxuICAgICAqIG9mIGVhY2gga2V5IGlzIGFuIGFycmF5IG9mIHRoZSBlbGVtZW50cyByZXNwb25zaWJsZSBmb3IgZ2VuZXJhdGluZyB0aGUga2V5LlxuICAgICAqIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWQgd2l0aCB0aHJlZSBhcmd1bWVudHM7XG4gICAgICogKHZhbHVlLCBpbmRleHxrZXksIGNvbGxlY3Rpb24pLlxuICAgICAqXG4gICAgICogSWYgYSBwcm9wZXJ0eSBuYW1lIGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy5wbHVja1wiIHN0eWxlXG4gICAgICogY2FsbGJhY2sgd2lsbCByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgICAqXG4gICAgICogSWYgYW4gb2JqZWN0IGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrXG4gICAgICogd2lsbCByZXR1cm4gYHRydWVgIGZvciBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHByb3BlcnRpZXMgb2YgdGhlIGdpdmVuIG9iamVjdCxcbiAgICAgKiBlbHNlIGBmYWxzZWBcbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8c3RyaW5nfSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWRcbiAgICAgKiAgcGVyIGl0ZXJhdGlvbi4gSWYgYSBwcm9wZXJ0eSBuYW1lIG9yIG9iamVjdCBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIHVzZWRcbiAgICAgKiAgdG8gY3JlYXRlIGEgXCJfLnBsdWNrXCIgb3IgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2ssIHJlc3BlY3RpdmVseS5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjb21wb3NlZCBhZ2dyZWdhdGUgb2JqZWN0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmdyb3VwQnkoWzQuMiwgNi4xLCA2LjRdLCBmdW5jdGlvbihudW0pIHsgcmV0dXJuIE1hdGguZmxvb3IobnVtKTsgfSk7XG4gICAgICogLy8gPT4geyAnNCc6IFs0LjJdLCAnNic6IFs2LjEsIDYuNF0gfVxuICAgICAqXG4gICAgICogXy5ncm91cEJ5KFs0LjIsIDYuMSwgNi40XSwgZnVuY3Rpb24obnVtKSB7IHJldHVybiB0aGlzLmZsb29yKG51bSk7IH0sIE1hdGgpO1xuICAgICAqIC8vID0+IHsgJzQnOiBbNC4yXSwgJzYnOiBbNi4xLCA2LjRdIH1cbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy5wbHVja1wiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8uZ3JvdXBCeShbJ29uZScsICd0d28nLCAndGhyZWUnXSwgJ2xlbmd0aCcpO1xuICAgICAqIC8vID0+IHsgJzMnOiBbJ29uZScsICd0d28nXSwgJzUnOiBbJ3RocmVlJ10gfVxuICAgICAqL1xuICAgIHZhciBncm91cEJ5ID0gY3JlYXRlQWdncmVnYXRvcihmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBrZXkpIHtcbiAgICAgIChoYXNPd25Qcm9wZXJ0eS5jYWxsKHJlc3VsdCwga2V5KSA/IHJlc3VsdFtrZXldIDogcmVzdWx0W2tleV0gPSBbXSkucHVzaCh2YWx1ZSk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIG9iamVjdCBjb21wb3NlZCBvZiBrZXlzIGdlbmVyYXRlZCBmcm9tIHRoZSByZXN1bHRzIG9mIHJ1bm5pbmdcbiAgICAgKiBlYWNoIGVsZW1lbnQgb2YgdGhlIGNvbGxlY3Rpb24gdGhyb3VnaCB0aGUgZ2l2ZW4gY2FsbGJhY2suIFRoZSBjb3JyZXNwb25kaW5nXG4gICAgICogdmFsdWUgb2YgZWFjaCBrZXkgaXMgdGhlIGxhc3QgZWxlbWVudCByZXNwb25zaWJsZSBmb3IgZ2VuZXJhdGluZyB0aGUga2V5LlxuICAgICAqIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWQgd2l0aCB0aHJlZSBhcmd1bWVudHM7XG4gICAgICogKHZhbHVlLCBpbmRleHxrZXksIGNvbGxlY3Rpb24pLlxuICAgICAqXG4gICAgICogSWYgYSBwcm9wZXJ0eSBuYW1lIGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy5wbHVja1wiIHN0eWxlXG4gICAgICogY2FsbGJhY2sgd2lsbCByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgICAqXG4gICAgICogSWYgYW4gb2JqZWN0IGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrXG4gICAgICogd2lsbCByZXR1cm4gYHRydWVgIGZvciBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHByb3BlcnRpZXMgb2YgdGhlIGdpdmVuIG9iamVjdCxcbiAgICAgKiBlbHNlIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvbnNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkXG4gICAgICogIHBlciBpdGVyYXRpb24uIElmIGEgcHJvcGVydHkgbmFtZSBvciBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkXG4gICAgICogIHRvIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY29tcG9zZWQgYWdncmVnYXRlIG9iamVjdC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIGtleXMgPSBbXG4gICAgICogICB7ICdkaXInOiAnbGVmdCcsICdjb2RlJzogOTcgfSxcbiAgICAgKiAgIHsgJ2Rpcic6ICdyaWdodCcsICdjb2RlJzogMTAwIH1cbiAgICAgKiBdO1xuICAgICAqXG4gICAgICogXy5pbmRleEJ5KGtleXMsICdkaXInKTtcbiAgICAgKiAvLyA9PiB7ICdsZWZ0JzogeyAnZGlyJzogJ2xlZnQnLCAnY29kZSc6IDk3IH0sICdyaWdodCc6IHsgJ2Rpcic6ICdyaWdodCcsICdjb2RlJzogMTAwIH0gfVxuICAgICAqXG4gICAgICogXy5pbmRleEJ5KGtleXMsIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShrZXkuY29kZSk7IH0pO1xuICAgICAqIC8vID0+IHsgJ2EnOiB7ICdkaXInOiAnbGVmdCcsICdjb2RlJzogOTcgfSwgJ2QnOiB7ICdkaXInOiAncmlnaHQnLCAnY29kZSc6IDEwMCB9IH1cbiAgICAgKlxuICAgICAqIF8uaW5kZXhCeShjaGFyYWN0ZXJzLCBmdW5jdGlvbihrZXkpIHsgdGhpcy5mcm9tQ2hhckNvZGUoa2V5LmNvZGUpOyB9LCBTdHJpbmcpO1xuICAgICAqIC8vID0+IHsgJ2EnOiB7ICdkaXInOiAnbGVmdCcsICdjb2RlJzogOTcgfSwgJ2QnOiB7ICdkaXInOiAncmlnaHQnLCAnY29kZSc6IDEwMCB9IH1cbiAgICAgKi9cbiAgICB2YXIgaW5kZXhCeSA9IGNyZWF0ZUFnZ3JlZ2F0b3IoZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwga2V5KSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbHVlO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogSW52b2tlcyB0aGUgbWV0aG9kIG5hbWVkIGJ5IGBtZXRob2ROYW1lYCBvbiBlYWNoIGVsZW1lbnQgaW4gdGhlIGBjb2xsZWN0aW9uYFxuICAgICAqIHJldHVybmluZyBhbiBhcnJheSBvZiB0aGUgcmVzdWx0cyBvZiBlYWNoIGludm9rZWQgbWV0aG9kLiBBZGRpdGlvbmFsIGFyZ3VtZW50c1xuICAgICAqIHdpbGwgYmUgcHJvdmlkZWQgdG8gZWFjaCBpbnZva2VkIG1ldGhvZC4gSWYgYG1ldGhvZE5hbWVgIGlzIGEgZnVuY3Rpb24gaXRcbiAgICAgKiB3aWxsIGJlIGludm9rZWQgZm9yLCBhbmQgYHRoaXNgIGJvdW5kIHRvLCBlYWNoIGVsZW1lbnQgaW4gdGhlIGBjb2xsZWN0aW9uYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxzdHJpbmd9IG1ldGhvZE5hbWUgVGhlIG5hbWUgb2YgdGhlIG1ldGhvZCB0byBpbnZva2Ugb3JcbiAgICAgKiAgdGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAgICAgKiBAcGFyYW0gey4uLip9IFthcmddIEFyZ3VtZW50cyB0byBpbnZva2UgdGhlIG1ldGhvZCB3aXRoLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhIG5ldyBhcnJheSBvZiB0aGUgcmVzdWx0cyBvZiBlYWNoIGludm9rZWQgbWV0aG9kLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmludm9rZShbWzUsIDEsIDddLCBbMywgMiwgMV1dLCAnc29ydCcpO1xuICAgICAqIC8vID0+IFtbMSwgNSwgN10sIFsxLCAyLCAzXV1cbiAgICAgKlxuICAgICAqIF8uaW52b2tlKFsxMjMsIDQ1Nl0sIFN0cmluZy5wcm90b3R5cGUuc3BsaXQsICcnKTtcbiAgICAgKiAvLyA9PiBbWycxJywgJzInLCAnMyddLCBbJzQnLCAnNScsICc2J11dXG4gICAgICovXG4gICAgZnVuY3Rpb24gaW52b2tlKGNvbGxlY3Rpb24sIG1ldGhvZE5hbWUpIHtcbiAgICAgIHZhciBhcmdzID0gc2xpY2UoYXJndW1lbnRzLCAyKSxcbiAgICAgICAgICBpbmRleCA9IC0xLFxuICAgICAgICAgIGlzRnVuYyA9IHR5cGVvZiBtZXRob2ROYW1lID09ICdmdW5jdGlvbicsXG4gICAgICAgICAgbGVuZ3RoID0gY29sbGVjdGlvbiA/IGNvbGxlY3Rpb24ubGVuZ3RoIDogMCxcbiAgICAgICAgICByZXN1bHQgPSBBcnJheSh0eXBlb2YgbGVuZ3RoID09ICdudW1iZXInID8gbGVuZ3RoIDogMCk7XG5cbiAgICAgIGZvckVhY2goY29sbGVjdGlvbiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgcmVzdWx0WysraW5kZXhdID0gKGlzRnVuYyA/IG1ldGhvZE5hbWUgOiB2YWx1ZVttZXRob2ROYW1lXSkuYXBwbHkodmFsdWUsIGFyZ3MpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdmFsdWVzIGJ5IHJ1bm5pbmcgZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uXG4gICAgICogdGhyb3VnaCB0aGUgY2FsbGJhY2suIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWQgd2l0aFxuICAgICAqIHRocmVlIGFyZ3VtZW50czsgKHZhbHVlLCBpbmRleHxrZXksIGNvbGxlY3Rpb24pLlxuICAgICAqXG4gICAgICogSWYgYSBwcm9wZXJ0eSBuYW1lIGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy5wbHVja1wiIHN0eWxlXG4gICAgICogY2FsbGJhY2sgd2lsbCByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgICAqXG4gICAgICogSWYgYW4gb2JqZWN0IGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrXG4gICAgICogd2lsbCByZXR1cm4gYHRydWVgIGZvciBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHByb3BlcnRpZXMgb2YgdGhlIGdpdmVuIG9iamVjdCxcbiAgICAgKiBlbHNlIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAYWxpYXMgY29sbGVjdFxuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8c3RyaW5nfSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWRcbiAgICAgKiAgcGVyIGl0ZXJhdGlvbi4gSWYgYSBwcm9wZXJ0eSBuYW1lIG9yIG9iamVjdCBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIHVzZWRcbiAgICAgKiAgdG8gY3JlYXRlIGEgXCJfLnBsdWNrXCIgb3IgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2ssIHJlc3BlY3RpdmVseS5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYSBuZXcgYXJyYXkgb2YgdGhlIHJlc3VsdHMgb2YgZWFjaCBgY2FsbGJhY2tgIGV4ZWN1dGlvbi5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5tYXAoWzEsIDIsIDNdLCBmdW5jdGlvbihudW0pIHsgcmV0dXJuIG51bSAqIDM7IH0pO1xuICAgICAqIC8vID0+IFszLCA2LCA5XVxuICAgICAqXG4gICAgICogXy5tYXAoeyAnb25lJzogMSwgJ3R3byc6IDIsICd0aHJlZSc6IDMgfSwgZnVuY3Rpb24obnVtKSB7IHJldHVybiBudW0gKiAzOyB9KTtcbiAgICAgKiAvLyA9PiBbMywgNiwgOV0gKHByb3BlcnR5IG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkIGFjcm9zcyBlbnZpcm9ubWVudHMpXG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgJ2FnZSc6IDM2IH0sXG4gICAgICogICB7ICduYW1lJzogJ2ZyZWQnLCAgICdhZ2UnOiA0MCB9XG4gICAgICogXTtcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy5wbHVja1wiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8ubWFwKGNoYXJhY3RlcnMsICduYW1lJyk7XG4gICAgICogLy8gPT4gWydiYXJuZXknLCAnZnJlZCddXG4gICAgICovXG4gICAgZnVuY3Rpb24gbWFwKGNvbGxlY3Rpb24sIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICBsZW5ndGggPSBjb2xsZWN0aW9uID8gY29sbGVjdGlvbi5sZW5ndGggOiAwO1xuXG4gICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICBpZiAodHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJykge1xuICAgICAgICB2YXIgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcbiAgICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICByZXN1bHRbaW5kZXhdID0gY2FsbGJhY2soY29sbGVjdGlvbltpbmRleF0sIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0gW107XG4gICAgICAgIGZvck93bihjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWx1ZSwga2V5LCBjb2xsZWN0aW9uKSB7XG4gICAgICAgICAgcmVzdWx0WysraW5kZXhdID0gY2FsbGJhY2sodmFsdWUsIGtleSwgY29sbGVjdGlvbik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZXMgdGhlIG1heGltdW0gdmFsdWUgb2YgYSBjb2xsZWN0aW9uLiBJZiB0aGUgY29sbGVjdGlvbiBpcyBlbXB0eSBvclxuICAgICAqIGZhbHNleSBgLUluZmluaXR5YCBpcyByZXR1cm5lZC4gSWYgYSBjYWxsYmFjayBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIGV4ZWN1dGVkXG4gICAgICogZm9yIGVhY2ggdmFsdWUgaW4gdGhlIGNvbGxlY3Rpb24gdG8gZ2VuZXJhdGUgdGhlIGNyaXRlcmlvbiBieSB3aGljaCB0aGUgdmFsdWVcbiAgICAgKiBpcyByYW5rZWQuIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWQgd2l0aCB0aHJlZVxuICAgICAqIGFyZ3VtZW50czsgKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8c3RyaW5nfSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWRcbiAgICAgKiAgcGVyIGl0ZXJhdGlvbi4gSWYgYSBwcm9wZXJ0eSBuYW1lIG9yIG9iamVjdCBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIHVzZWRcbiAgICAgKiAgdG8gY3JlYXRlIGEgXCJfLnBsdWNrXCIgb3IgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2ssIHJlc3BlY3RpdmVseS5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgbWF4aW11bSB2YWx1ZS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5tYXgoWzQsIDIsIDgsIDZdKTtcbiAgICAgKiAvLyA9PiA4XG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgJ2FnZSc6IDM2IH0sXG4gICAgICogICB7ICduYW1lJzogJ2ZyZWQnLCAgICdhZ2UnOiA0MCB9XG4gICAgICogXTtcbiAgICAgKlxuICAgICAqIF8ubWF4KGNoYXJhY3RlcnMsIGZ1bmN0aW9uKGNocikgeyByZXR1cm4gY2hyLmFnZTsgfSk7XG4gICAgICogLy8gPT4geyAnbmFtZSc6ICdmcmVkJywgJ2FnZSc6IDQwIH07XG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ucGx1Y2tcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLm1heChjaGFyYWN0ZXJzLCAnYWdlJyk7XG4gICAgICogLy8gPT4geyAnbmFtZSc6ICdmcmVkJywgJ2FnZSc6IDQwIH07XG4gICAgICovXG4gICAgZnVuY3Rpb24gbWF4KGNvbGxlY3Rpb24sIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgY29tcHV0ZWQgPSAtSW5maW5pdHksXG4gICAgICAgICAgcmVzdWx0ID0gY29tcHV0ZWQ7XG5cbiAgICAgIC8vIGFsbG93cyB3b3JraW5nIHdpdGggZnVuY3Rpb25zIGxpa2UgYF8ubWFwYCB3aXRob3V0IHVzaW5nXG4gICAgICAvLyB0aGVpciBgaW5kZXhgIGFyZ3VtZW50IGFzIGEgY2FsbGJhY2tcbiAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT0gJ2Z1bmN0aW9uJyAmJiB0aGlzQXJnICYmIHRoaXNBcmdbY2FsbGJhY2tdID09PSBjb2xsZWN0aW9uKSB7XG4gICAgICAgIGNhbGxiYWNrID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmIChjYWxsYmFjayA9PSBudWxsICYmIGlzQXJyYXkoY29sbGVjdGlvbikpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgICBsZW5ndGggPSBjb2xsZWN0aW9uLmxlbmd0aDtcblxuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgIHZhciB2YWx1ZSA9IGNvbGxlY3Rpb25baW5kZXhdO1xuICAgICAgICAgIGlmICh2YWx1ZSA+IHJlc3VsdCkge1xuICAgICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYWxsYmFjayA9IChjYWxsYmFjayA9PSBudWxsICYmIGlzU3RyaW5nKGNvbGxlY3Rpb24pKVxuICAgICAgICAgID8gY2hhckF0Q2FsbGJhY2tcbiAgICAgICAgICA6IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG5cbiAgICAgICAgZm9yRWFjaChjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICB2YXIgY3VycmVudCA9IGNhbGxiYWNrKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgICAgICAgaWYgKGN1cnJlbnQgPiBjb21wdXRlZCkge1xuICAgICAgICAgICAgY29tcHV0ZWQgPSBjdXJyZW50O1xuICAgICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0cmlldmVzIHRoZSBtaW5pbXVtIHZhbHVlIG9mIGEgY29sbGVjdGlvbi4gSWYgdGhlIGNvbGxlY3Rpb24gaXMgZW1wdHkgb3JcbiAgICAgKiBmYWxzZXkgYEluZmluaXR5YCBpcyByZXR1cm5lZC4gSWYgYSBjYWxsYmFjayBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIGV4ZWN1dGVkXG4gICAgICogZm9yIGVhY2ggdmFsdWUgaW4gdGhlIGNvbGxlY3Rpb24gdG8gZ2VuZXJhdGUgdGhlIGNyaXRlcmlvbiBieSB3aGljaCB0aGUgdmFsdWVcbiAgICAgKiBpcyByYW5rZWQuIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWQgd2l0aCB0aHJlZVxuICAgICAqIGFyZ3VtZW50czsgKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8c3RyaW5nfSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWRcbiAgICAgKiAgcGVyIGl0ZXJhdGlvbi4gSWYgYSBwcm9wZXJ0eSBuYW1lIG9yIG9iamVjdCBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIHVzZWRcbiAgICAgKiAgdG8gY3JlYXRlIGEgXCJfLnBsdWNrXCIgb3IgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2ssIHJlc3BlY3RpdmVseS5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgbWluaW11bSB2YWx1ZS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5taW4oWzQsIDIsIDgsIDZdKTtcbiAgICAgKiAvLyA9PiAyXG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgJ2FnZSc6IDM2IH0sXG4gICAgICogICB7ICduYW1lJzogJ2ZyZWQnLCAgICdhZ2UnOiA0MCB9XG4gICAgICogXTtcbiAgICAgKlxuICAgICAqIF8ubWluKGNoYXJhY3RlcnMsIGZ1bmN0aW9uKGNocikgeyByZXR1cm4gY2hyLmFnZTsgfSk7XG4gICAgICogLy8gPT4geyAnbmFtZSc6ICdiYXJuZXknLCAnYWdlJzogMzYgfTtcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy5wbHVja1wiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8ubWluKGNoYXJhY3RlcnMsICdhZ2UnKTtcbiAgICAgKiAvLyA9PiB7ICduYW1lJzogJ2Jhcm5leScsICdhZ2UnOiAzNiB9O1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIG1pbihjb2xsZWN0aW9uLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgdmFyIGNvbXB1dGVkID0gSW5maW5pdHksXG4gICAgICAgICAgcmVzdWx0ID0gY29tcHV0ZWQ7XG5cbiAgICAgIC8vIGFsbG93cyB3b3JraW5nIHdpdGggZnVuY3Rpb25zIGxpa2UgYF8ubWFwYCB3aXRob3V0IHVzaW5nXG4gICAgICAvLyB0aGVpciBgaW5kZXhgIGFyZ3VtZW50IGFzIGEgY2FsbGJhY2tcbiAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT0gJ2Z1bmN0aW9uJyAmJiB0aGlzQXJnICYmIHRoaXNBcmdbY2FsbGJhY2tdID09PSBjb2xsZWN0aW9uKSB7XG4gICAgICAgIGNhbGxiYWNrID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmIChjYWxsYmFjayA9PSBudWxsICYmIGlzQXJyYXkoY29sbGVjdGlvbikpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgICBsZW5ndGggPSBjb2xsZWN0aW9uLmxlbmd0aDtcblxuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgIHZhciB2YWx1ZSA9IGNvbGxlY3Rpb25baW5kZXhdO1xuICAgICAgICAgIGlmICh2YWx1ZSA8IHJlc3VsdCkge1xuICAgICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYWxsYmFjayA9IChjYWxsYmFjayA9PSBudWxsICYmIGlzU3RyaW5nKGNvbGxlY3Rpb24pKVxuICAgICAgICAgID8gY2hhckF0Q2FsbGJhY2tcbiAgICAgICAgICA6IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG5cbiAgICAgICAgZm9yRWFjaChjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICB2YXIgY3VycmVudCA9IGNhbGxiYWNrKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgICAgICAgaWYgKGN1cnJlbnQgPCBjb21wdXRlZCkge1xuICAgICAgICAgICAgY29tcHV0ZWQgPSBjdXJyZW50O1xuICAgICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0cmlldmVzIHRoZSB2YWx1ZSBvZiBhIHNwZWNpZmllZCBwcm9wZXJ0eSBmcm9tIGFsbCBlbGVtZW50cyBpbiB0aGUgY29sbGVjdGlvbi5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEB0eXBlIEZ1bmN0aW9uXG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25zXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHkgVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIHBsdWNrLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhIG5ldyBhcnJheSBvZiBwcm9wZXJ0eSB2YWx1ZXMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBjaGFyYWN0ZXJzID0gW1xuICAgICAqICAgeyAnbmFtZSc6ICdiYXJuZXknLCAnYWdlJzogMzYgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgJ2FnZSc6IDQwIH1cbiAgICAgKiBdO1xuICAgICAqXG4gICAgICogXy5wbHVjayhjaGFyYWN0ZXJzLCAnbmFtZScpO1xuICAgICAqIC8vID0+IFsnYmFybmV5JywgJ2ZyZWQnXVxuICAgICAqL1xuICAgIHZhciBwbHVjayA9IG1hcDtcblxuICAgIC8qKlxuICAgICAqIFJlZHVjZXMgYSBjb2xsZWN0aW9uIHRvIGEgdmFsdWUgd2hpY2ggaXMgdGhlIGFjY3VtdWxhdGVkIHJlc3VsdCBvZiBydW5uaW5nXG4gICAgICogZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uIHRocm91Z2ggdGhlIGNhbGxiYWNrLCB3aGVyZSBlYWNoIHN1Y2Nlc3NpdmVcbiAgICAgKiBjYWxsYmFjayBleGVjdXRpb24gY29uc3VtZXMgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgcHJldmlvdXMgZXhlY3V0aW9uLiBJZlxuICAgICAqIGBhY2N1bXVsYXRvcmAgaXMgbm90IHByb3ZpZGVkIHRoZSBmaXJzdCBlbGVtZW50IG9mIHRoZSBjb2xsZWN0aW9uIHdpbGwgYmVcbiAgICAgKiB1c2VkIGFzIHRoZSBpbml0aWFsIGBhY2N1bXVsYXRvcmAgdmFsdWUuIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2BcbiAgICAgKiBhbmQgaW52b2tlZCB3aXRoIGZvdXIgYXJndW1lbnRzOyAoYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleHxrZXksIGNvbGxlY3Rpb24pLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGFsaWFzIGZvbGRsLCBpbmplY3RcbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvbnNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZCBwZXIgaXRlcmF0aW9uLlxuICAgICAqIEBwYXJhbSB7Kn0gW2FjY3VtdWxhdG9yXSBJbml0aWFsIHZhbHVlIG9mIHRoZSBhY2N1bXVsYXRvci5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgYWNjdW11bGF0ZWQgdmFsdWUuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBzdW0gPSBfLnJlZHVjZShbMSwgMiwgM10sIGZ1bmN0aW9uKHN1bSwgbnVtKSB7XG4gICAgICogICByZXR1cm4gc3VtICsgbnVtO1xuICAgICAqIH0pO1xuICAgICAqIC8vID0+IDZcbiAgICAgKlxuICAgICAqIHZhciBtYXBwZWQgPSBfLnJlZHVjZSh7ICdhJzogMSwgJ2InOiAyLCAnYyc6IDMgfSwgZnVuY3Rpb24ocmVzdWx0LCBudW0sIGtleSkge1xuICAgICAqICAgcmVzdWx0W2tleV0gPSBudW0gKiAzO1xuICAgICAqICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgKiB9LCB7fSk7XG4gICAgICogLy8gPT4geyAnYSc6IDMsICdiJzogNiwgJ2MnOiA5IH1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZWR1Y2UoY29sbGVjdGlvbiwgY2FsbGJhY2ssIGFjY3VtdWxhdG9yLCB0aGlzQXJnKSB7XG4gICAgICBpZiAoIWNvbGxlY3Rpb24pIHJldHVybiBhY2N1bXVsYXRvcjtcbiAgICAgIHZhciBub2FjY3VtID0gYXJndW1lbnRzLmxlbmd0aCA8IDM7XG4gICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgNCk7XG5cbiAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgIGxlbmd0aCA9IGNvbGxlY3Rpb24ubGVuZ3RoO1xuXG4gICAgICBpZiAodHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJykge1xuICAgICAgICBpZiAobm9hY2N1bSkge1xuICAgICAgICAgIGFjY3VtdWxhdG9yID0gY29sbGVjdGlvblsrK2luZGV4XTtcbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgIGFjY3VtdWxhdG9yID0gY2FsbGJhY2soYWNjdW11bGF0b3IsIGNvbGxlY3Rpb25baW5kZXhdLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvck93bihjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICBhY2N1bXVsYXRvciA9IG5vYWNjdW1cbiAgICAgICAgICAgID8gKG5vYWNjdW0gPSBmYWxzZSwgdmFsdWUpXG4gICAgICAgICAgICA6IGNhbGxiYWNrKGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFjY3VtdWxhdG9yO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGxpa2UgYF8ucmVkdWNlYCBleGNlcHQgdGhhdCBpdCBpdGVyYXRlcyBvdmVyIGVsZW1lbnRzXG4gICAgICogb2YgYSBgY29sbGVjdGlvbmAgZnJvbSByaWdodCB0byBsZWZ0LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGFsaWFzIGZvbGRyXG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25zXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWQgcGVyIGl0ZXJhdGlvbi5cbiAgICAgKiBAcGFyYW0geyp9IFthY2N1bXVsYXRvcl0gSW5pdGlhbCB2YWx1ZSBvZiB0aGUgYWNjdW11bGF0b3IuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGFjY3VtdWxhdGVkIHZhbHVlLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgbGlzdCA9IFtbMCwgMV0sIFsyLCAzXSwgWzQsIDVdXTtcbiAgICAgKiB2YXIgZmxhdCA9IF8ucmVkdWNlUmlnaHQobGlzdCwgZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gYS5jb25jYXQoYik7IH0sIFtdKTtcbiAgICAgKiAvLyA9PiBbNCwgNSwgMiwgMywgMCwgMV1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZWR1Y2VSaWdodChjb2xsZWN0aW9uLCBjYWxsYmFjaywgYWNjdW11bGF0b3IsIHRoaXNBcmcpIHtcbiAgICAgIHZhciBub2FjY3VtID0gYXJndW1lbnRzLmxlbmd0aCA8IDM7XG4gICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgNCk7XG4gICAgICBmb3JFYWNoUmlnaHQoY29sbGVjdGlvbiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgICAgIGFjY3VtdWxhdG9yID0gbm9hY2N1bVxuICAgICAgICAgID8gKG5vYWNjdW0gPSBmYWxzZSwgdmFsdWUpXG4gICAgICAgICAgOiBjYWxsYmFjayhhY2N1bXVsYXRvciwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGFjY3VtdWxhdG9yO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBvcHBvc2l0ZSBvZiBgXy5maWx0ZXJgIHRoaXMgbWV0aG9kIHJldHVybnMgdGhlIGVsZW1lbnRzIG9mIGFcbiAgICAgKiBjb2xsZWN0aW9uIHRoYXQgdGhlIGNhbGxiYWNrIGRvZXMgKipub3QqKiByZXR1cm4gdHJ1ZXkgZm9yLlxuICAgICAqXG4gICAgICogSWYgYSBwcm9wZXJ0eSBuYW1lIGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy5wbHVja1wiIHN0eWxlXG4gICAgICogY2FsbGJhY2sgd2lsbCByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgICAqXG4gICAgICogSWYgYW4gb2JqZWN0IGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrXG4gICAgICogd2lsbCByZXR1cm4gYHRydWVgIGZvciBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHByb3BlcnRpZXMgb2YgdGhlIGdpdmVuIG9iamVjdCxcbiAgICAgKiBlbHNlIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvbnNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkXG4gICAgICogIHBlciBpdGVyYXRpb24uIElmIGEgcHJvcGVydHkgbmFtZSBvciBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkXG4gICAgICogIHRvIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGEgbmV3IGFycmF5IG9mIGVsZW1lbnRzIHRoYXQgZmFpbGVkIHRoZSBjYWxsYmFjayBjaGVjay5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIG9kZHMgPSBfLnJlamVjdChbMSwgMiwgMywgNCwgNSwgNl0sIGZ1bmN0aW9uKG51bSkgeyByZXR1cm4gbnVtICUgMiA9PSAwOyB9KTtcbiAgICAgKiAvLyA9PiBbMSwgMywgNV1cbiAgICAgKlxuICAgICAqIHZhciBjaGFyYWN0ZXJzID0gW1xuICAgICAqICAgeyAnbmFtZSc6ICdiYXJuZXknLCAnYWdlJzogMzYsICdibG9ja2VkJzogZmFsc2UgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgJ2FnZSc6IDQwLCAnYmxvY2tlZCc6IHRydWUgfVxuICAgICAqIF07XG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ucGx1Y2tcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLnJlamVjdChjaGFyYWN0ZXJzLCAnYmxvY2tlZCcpO1xuICAgICAqIC8vID0+IFt7ICduYW1lJzogJ2Jhcm5leScsICdhZ2UnOiAzNiwgJ2Jsb2NrZWQnOiBmYWxzZSB9XVxuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLndoZXJlXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5yZWplY3QoY2hhcmFjdGVycywgeyAnYWdlJzogMzYgfSk7XG4gICAgICogLy8gPT4gW3sgJ25hbWUnOiAnZnJlZCcsICdhZ2UnOiA0MCwgJ2Jsb2NrZWQnOiB0cnVlIH1dXG4gICAgICovXG4gICAgZnVuY3Rpb24gcmVqZWN0KGNvbGxlY3Rpb24sIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICByZXR1cm4gZmlsdGVyKGNvbGxlY3Rpb24sIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICByZXR1cm4gIWNhbGxiYWNrKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZXMgYSByYW5kb20gZWxlbWVudCBvciBgbmAgcmFuZG9tIGVsZW1lbnRzIGZyb20gYSBjb2xsZWN0aW9uLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25zXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIHNhbXBsZS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW25dIFRoZSBudW1iZXIgb2YgZWxlbWVudHMgdG8gc2FtcGxlLlxuICAgICAqIEBwYXJhbS0ge09iamVjdH0gW2d1YXJkXSBBbGxvd3Mgd29ya2luZyB3aXRoIGZ1bmN0aW9ucyBsaWtlIGBfLm1hcGBcbiAgICAgKiAgd2l0aG91dCB1c2luZyB0aGVpciBgaW5kZXhgIGFyZ3VtZW50cyBhcyBgbmAuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSByYW5kb20gc2FtcGxlKHMpIG9mIGBjb2xsZWN0aW9uYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5zYW1wbGUoWzEsIDIsIDMsIDRdKTtcbiAgICAgKiAvLyA9PiAyXG4gICAgICpcbiAgICAgKiBfLnNhbXBsZShbMSwgMiwgMywgNF0sIDIpO1xuICAgICAqIC8vID0+IFszLCAxXVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNhbXBsZShjb2xsZWN0aW9uLCBuLCBndWFyZCkge1xuICAgICAgaWYgKGNvbGxlY3Rpb24gJiYgdHlwZW9mIGNvbGxlY3Rpb24ubGVuZ3RoICE9ICdudW1iZXInKSB7XG4gICAgICAgIGNvbGxlY3Rpb24gPSB2YWx1ZXMoY29sbGVjdGlvbik7XG4gICAgICB9XG4gICAgICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSB7XG4gICAgICAgIHJldHVybiBjb2xsZWN0aW9uID8gY29sbGVjdGlvbltiYXNlUmFuZG9tKDAsIGNvbGxlY3Rpb24ubGVuZ3RoIC0gMSldIDogdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgdmFyIHJlc3VsdCA9IHNodWZmbGUoY29sbGVjdGlvbik7XG4gICAgICByZXN1bHQubGVuZ3RoID0gbmF0aXZlTWluKG5hdGl2ZU1heCgwLCBuKSwgcmVzdWx0Lmxlbmd0aCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gYXJyYXkgb2Ygc2h1ZmZsZWQgdmFsdWVzLCB1c2luZyBhIHZlcnNpb24gb2YgdGhlIEZpc2hlci1ZYXRlc1xuICAgICAqIHNodWZmbGUuIFNlZSBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0Zpc2hlci1ZYXRlc19zaHVmZmxlLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25zXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIHNodWZmbGUuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGEgbmV3IHNodWZmbGVkIGNvbGxlY3Rpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uc2h1ZmZsZShbMSwgMiwgMywgNCwgNSwgNl0pO1xuICAgICAqIC8vID0+IFs0LCAxLCA2LCAzLCA1LCAyXVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNodWZmbGUoY29sbGVjdGlvbikge1xuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgbGVuZ3RoID0gY29sbGVjdGlvbiA/IGNvbGxlY3Rpb24ubGVuZ3RoIDogMCxcbiAgICAgICAgICByZXN1bHQgPSBBcnJheSh0eXBlb2YgbGVuZ3RoID09ICdudW1iZXInID8gbGVuZ3RoIDogMCk7XG5cbiAgICAgIGZvckVhY2goY29sbGVjdGlvbiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgdmFyIHJhbmQgPSBiYXNlUmFuZG9tKDAsICsraW5kZXgpO1xuICAgICAgICByZXN1bHRbaW5kZXhdID0gcmVzdWx0W3JhbmRdO1xuICAgICAgICByZXN1bHRbcmFuZF0gPSB2YWx1ZTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBzaXplIG9mIHRoZSBgY29sbGVjdGlvbmAgYnkgcmV0dXJuaW5nIGBjb2xsZWN0aW9uLmxlbmd0aGAgZm9yIGFycmF5c1xuICAgICAqIGFuZCBhcnJheS1saWtlIG9iamVjdHMgb3IgdGhlIG51bWJlciBvZiBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzIGZvciBvYmplY3RzLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25zXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGluc3BlY3QuXG4gICAgICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyBgY29sbGVjdGlvbi5sZW5ndGhgIG9yIG51bWJlciBvZiBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLnNpemUoWzEsIDJdKTtcbiAgICAgKiAvLyA9PiAyXG4gICAgICpcbiAgICAgKiBfLnNpemUoeyAnb25lJzogMSwgJ3R3byc6IDIsICd0aHJlZSc6IDMgfSk7XG4gICAgICogLy8gPT4gM1xuICAgICAqXG4gICAgICogXy5zaXplKCdwZWJibGVzJyk7XG4gICAgICogLy8gPT4gN1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNpemUoY29sbGVjdGlvbikge1xuICAgICAgdmFyIGxlbmd0aCA9IGNvbGxlY3Rpb24gPyBjb2xsZWN0aW9uLmxlbmd0aCA6IDA7XG4gICAgICByZXR1cm4gdHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJyA/IGxlbmd0aCA6IGtleXMoY29sbGVjdGlvbikubGVuZ3RoO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGUgY2FsbGJhY2sgcmV0dXJucyBhIHRydWV5IHZhbHVlIGZvciAqKmFueSoqIGVsZW1lbnQgb2YgYVxuICAgICAqIGNvbGxlY3Rpb24uIFRoZSBmdW5jdGlvbiByZXR1cm5zIGFzIHNvb24gYXMgaXQgZmluZHMgYSBwYXNzaW5nIHZhbHVlIGFuZFxuICAgICAqIGRvZXMgbm90IGl0ZXJhdGUgb3ZlciB0aGUgZW50aXJlIGNvbGxlY3Rpb24uIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0b1xuICAgICAqIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50czsgKHZhbHVlLCBpbmRleHxrZXksIGNvbGxlY3Rpb24pLlxuICAgICAqXG4gICAgICogSWYgYSBwcm9wZXJ0eSBuYW1lIGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy5wbHVja1wiIHN0eWxlXG4gICAgICogY2FsbGJhY2sgd2lsbCByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgICAqXG4gICAgICogSWYgYW4gb2JqZWN0IGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrXG4gICAgICogd2lsbCByZXR1cm4gYHRydWVgIGZvciBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHByb3BlcnRpZXMgb2YgdGhlIGdpdmVuIG9iamVjdCxcbiAgICAgKiBlbHNlIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAYWxpYXMgYW55XG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25zXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdHxzdHJpbmd9IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZFxuICAgICAqICBwZXIgaXRlcmF0aW9uLiBJZiBhIHByb3BlcnR5IG5hbWUgb3Igb2JqZWN0IGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgdXNlZFxuICAgICAqICB0byBjcmVhdGUgYSBcIl8ucGx1Y2tcIiBvciBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFjaywgcmVzcGVjdGl2ZWx5LlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBhbnkgZWxlbWVudCBwYXNzZWQgdGhlIGNhbGxiYWNrIGNoZWNrLFxuICAgICAqICBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uc29tZShbbnVsbCwgMCwgJ3llcycsIGZhbHNlXSwgQm9vbGVhbik7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqXG4gICAgICogdmFyIGNoYXJhY3RlcnMgPSBbXG4gICAgICogICB7ICduYW1lJzogJ2Jhcm5leScsICdhZ2UnOiAzNiwgJ2Jsb2NrZWQnOiBmYWxzZSB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdmcmVkJywgICAnYWdlJzogNDAsICdibG9ja2VkJzogdHJ1ZSB9XG4gICAgICogXTtcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy5wbHVja1wiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8uc29tZShjaGFyYWN0ZXJzLCAnYmxvY2tlZCcpO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy53aGVyZVwiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8uc29tZShjaGFyYWN0ZXJzLCB7ICdhZ2UnOiAxIH0pO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICovXG4gICAgZnVuY3Rpb24gc29tZShjb2xsZWN0aW9uLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgdmFyIHJlc3VsdDtcbiAgICAgIGNhbGxiYWNrID0gbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcblxuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgbGVuZ3RoID0gY29sbGVjdGlvbiA/IGNvbGxlY3Rpb24ubGVuZ3RoIDogMDtcblxuICAgICAgaWYgKHR5cGVvZiBsZW5ndGggPT0gJ251bWJlcicpIHtcbiAgICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICBpZiAoKHJlc3VsdCA9IGNhbGxiYWNrKGNvbGxlY3Rpb25baW5kZXhdLCBpbmRleCwgY29sbGVjdGlvbikpKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvck93bihjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICByZXR1cm4gIShyZXN1bHQgPSBjYWxsYmFjayh2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gISFyZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBhcnJheSBvZiBlbGVtZW50cywgc29ydGVkIGluIGFzY2VuZGluZyBvcmRlciBieSB0aGUgcmVzdWx0cyBvZlxuICAgICAqIHJ1bm5pbmcgZWFjaCBlbGVtZW50IGluIGEgY29sbGVjdGlvbiB0aHJvdWdoIHRoZSBjYWxsYmFjay4gVGhpcyBtZXRob2RcbiAgICAgKiBwZXJmb3JtcyBhIHN0YWJsZSBzb3J0LCB0aGF0IGlzLCBpdCB3aWxsIHByZXNlcnZlIHRoZSBvcmlnaW5hbCBzb3J0IG9yZGVyXG4gICAgICogb2YgZXF1YWwgZWxlbWVudHMuIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWQgd2l0aFxuICAgICAqIHRocmVlIGFyZ3VtZW50czsgKHZhbHVlLCBpbmRleHxrZXksIGNvbGxlY3Rpb24pLlxuICAgICAqXG4gICAgICogSWYgYSBwcm9wZXJ0eSBuYW1lIGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy5wbHVja1wiIHN0eWxlXG4gICAgICogY2FsbGJhY2sgd2lsbCByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgICAqXG4gICAgICogSWYgYW4gYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNvbGxlY3Rpb25cbiAgICAgKiB3aWxsIGJlIHNvcnRlZCBieSBlYWNoIHByb3BlcnR5IHZhbHVlLlxuICAgICAqXG4gICAgICogSWYgYW4gb2JqZWN0IGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrXG4gICAgICogd2lsbCByZXR1cm4gYHRydWVgIGZvciBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHByb3BlcnRpZXMgb2YgdGhlIGdpdmVuIG9iamVjdCxcbiAgICAgKiBlbHNlIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvbnNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7QXJyYXl8RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkXG4gICAgICogIHBlciBpdGVyYXRpb24uIElmIGEgcHJvcGVydHkgbmFtZSBvciBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkXG4gICAgICogIHRvIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGEgbmV3IGFycmF5IG9mIHNvcnRlZCBlbGVtZW50cy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5zb3J0QnkoWzEsIDIsIDNdLCBmdW5jdGlvbihudW0pIHsgcmV0dXJuIE1hdGguc2luKG51bSk7IH0pO1xuICAgICAqIC8vID0+IFszLCAxLCAyXVxuICAgICAqXG4gICAgICogXy5zb3J0QnkoWzEsIDIsIDNdLCBmdW5jdGlvbihudW0pIHsgcmV0dXJuIHRoaXMuc2luKG51bSk7IH0sIE1hdGgpO1xuICAgICAqIC8vID0+IFszLCAxLCAyXVxuICAgICAqXG4gICAgICogdmFyIGNoYXJhY3RlcnMgPSBbXG4gICAgICogICB7ICduYW1lJzogJ2Jhcm5leScsICAnYWdlJzogMzYgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgICdhZ2UnOiA0MCB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdiYXJuZXknLCAgJ2FnZSc6IDI2IH0sXG4gICAgICogICB7ICduYW1lJzogJ2ZyZWQnLCAgICAnYWdlJzogMzAgfVxuICAgICAqIF07XG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ucGx1Y2tcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLm1hcChfLnNvcnRCeShjaGFyYWN0ZXJzLCAnYWdlJyksIF8udmFsdWVzKTtcbiAgICAgKiAvLyA9PiBbWydiYXJuZXknLCAyNl0sIFsnZnJlZCcsIDMwXSwgWydiYXJuZXknLCAzNl0sIFsnZnJlZCcsIDQwXV1cbiAgICAgKlxuICAgICAqIC8vIHNvcnRpbmcgYnkgbXVsdGlwbGUgcHJvcGVydGllc1xuICAgICAqIF8ubWFwKF8uc29ydEJ5KGNoYXJhY3RlcnMsIFsnbmFtZScsICdhZ2UnXSksIF8udmFsdWVzKTtcbiAgICAgKiAvLyA9ID4gW1snYmFybmV5JywgMjZdLCBbJ2Jhcm5leScsIDM2XSwgWydmcmVkJywgMzBdLCBbJ2ZyZWQnLCA0MF1dXG4gICAgICovXG4gICAgZnVuY3Rpb24gc29ydEJ5KGNvbGxlY3Rpb24sIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICBpc0FyciA9IGlzQXJyYXkoY2FsbGJhY2spLFxuICAgICAgICAgIGxlbmd0aCA9IGNvbGxlY3Rpb24gPyBjb2xsZWN0aW9uLmxlbmd0aCA6IDAsXG4gICAgICAgICAgcmVzdWx0ID0gQXJyYXkodHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJyA/IGxlbmd0aCA6IDApO1xuXG4gICAgICBpZiAoIWlzQXJyKSB7XG4gICAgICAgIGNhbGxiYWNrID0gbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcbiAgICAgIH1cbiAgICAgIGZvckVhY2goY29sbGVjdGlvbiwgZnVuY3Rpb24odmFsdWUsIGtleSwgY29sbGVjdGlvbikge1xuICAgICAgICB2YXIgb2JqZWN0ID0gcmVzdWx0WysraW5kZXhdID0gZ2V0T2JqZWN0KCk7XG4gICAgICAgIGlmIChpc0Fycikge1xuICAgICAgICAgIG9iamVjdC5jcml0ZXJpYSA9IG1hcChjYWxsYmFjaywgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAob2JqZWN0LmNyaXRlcmlhID0gZ2V0QXJyYXkoKSlbMF0gPSBjYWxsYmFjayh2YWx1ZSwga2V5LCBjb2xsZWN0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBvYmplY3QuaW5kZXggPSBpbmRleDtcbiAgICAgICAgb2JqZWN0LnZhbHVlID0gdmFsdWU7XG4gICAgICB9KTtcblxuICAgICAgbGVuZ3RoID0gcmVzdWx0Lmxlbmd0aDtcbiAgICAgIHJlc3VsdC5zb3J0KGNvbXBhcmVBc2NlbmRpbmcpO1xuICAgICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAgIHZhciBvYmplY3QgPSByZXN1bHRbbGVuZ3RoXTtcbiAgICAgICAgcmVzdWx0W2xlbmd0aF0gPSBvYmplY3QudmFsdWU7XG4gICAgICAgIGlmICghaXNBcnIpIHtcbiAgICAgICAgICByZWxlYXNlQXJyYXkob2JqZWN0LmNyaXRlcmlhKTtcbiAgICAgICAgfVxuICAgICAgICByZWxlYXNlT2JqZWN0KG9iamVjdCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIHRoZSBgY29sbGVjdGlvbmAgdG8gYW4gYXJyYXkuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvbnNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gY29udmVydC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBjb252ZXJ0ZWQgYXJyYXkuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIChmdW5jdGlvbigpIHsgcmV0dXJuIF8udG9BcnJheShhcmd1bWVudHMpLnNsaWNlKDEpOyB9KSgxLCAyLCAzLCA0KTtcbiAgICAgKiAvLyA9PiBbMiwgMywgNF1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0b0FycmF5KGNvbGxlY3Rpb24pIHtcbiAgICAgIGlmIChjb2xsZWN0aW9uICYmIHR5cGVvZiBjb2xsZWN0aW9uLmxlbmd0aCA9PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm4gc2xpY2UoY29sbGVjdGlvbik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWVzKGNvbGxlY3Rpb24pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBlcmZvcm1zIGEgZGVlcCBjb21wYXJpc29uIG9mIGVhY2ggZWxlbWVudCBpbiBhIGBjb2xsZWN0aW9uYCB0byB0aGUgZ2l2ZW5cbiAgICAgKiBgcHJvcGVydGllc2Agb2JqZWN0LCByZXR1cm5pbmcgYW4gYXJyYXkgb2YgYWxsIGVsZW1lbnRzIHRoYXQgaGF2ZSBlcXVpdmFsZW50XG4gICAgICogcHJvcGVydHkgdmFsdWVzLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQHR5cGUgRnVuY3Rpb25cbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvbnNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wcyBUaGUgb2JqZWN0IG9mIHByb3BlcnR5IHZhbHVlcyB0byBmaWx0ZXIgYnkuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGEgbmV3IGFycmF5IG9mIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgZ2l2ZW4gcHJvcGVydGllcy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIGNoYXJhY3RlcnMgPSBbXG4gICAgICogICB7ICduYW1lJzogJ2Jhcm5leScsICdhZ2UnOiAzNiwgJ3BldHMnOiBbJ2hvcHB5J10gfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgJ2FnZSc6IDQwLCAncGV0cyc6IFsnYmFieSBwdXNzJywgJ2Rpbm8nXSB9XG4gICAgICogXTtcbiAgICAgKlxuICAgICAqIF8ud2hlcmUoY2hhcmFjdGVycywgeyAnYWdlJzogMzYgfSk7XG4gICAgICogLy8gPT4gW3sgJ25hbWUnOiAnYmFybmV5JywgJ2FnZSc6IDM2LCAncGV0cyc6IFsnaG9wcHknXSB9XVxuICAgICAqXG4gICAgICogXy53aGVyZShjaGFyYWN0ZXJzLCB7ICdwZXRzJzogWydkaW5vJ10gfSk7XG4gICAgICogLy8gPT4gW3sgJ25hbWUnOiAnZnJlZCcsICdhZ2UnOiA0MCwgJ3BldHMnOiBbJ2JhYnkgcHVzcycsICdkaW5vJ10gfV1cbiAgICAgKi9cbiAgICB2YXIgd2hlcmUgPSBmaWx0ZXI7XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gYXJyYXkgd2l0aCBhbGwgZmFsc2V5IHZhbHVlcyByZW1vdmVkLiBUaGUgdmFsdWVzIGBmYWxzZWAsIGBudWxsYCxcbiAgICAgKiBgMGAsIGBcIlwiYCwgYHVuZGVmaW5lZGAsIGFuZCBgTmFOYCBhcmUgYWxsIGZhbHNleS5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gY29tcGFjdC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYSBuZXcgYXJyYXkgb2YgZmlsdGVyZWQgdmFsdWVzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmNvbXBhY3QoWzAsIDEsIGZhbHNlLCAyLCAnJywgM10pO1xuICAgICAqIC8vID0+IFsxLCAyLCAzXVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNvbXBhY3QoYXJyYXkpIHtcbiAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgIGxlbmd0aCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogMCxcbiAgICAgICAgICByZXN1bHQgPSBbXTtcblxuICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gYXJyYXlbaW5kZXhdO1xuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBhcnJheSBleGNsdWRpbmcgYWxsIHZhbHVlcyBvZiB0aGUgcHJvdmlkZWQgYXJyYXlzIHVzaW5nIHN0cmljdFxuICAgICAqIGVxdWFsaXR5IGZvciBjb21wYXJpc29ucywgaS5lLiBgPT09YC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gcHJvY2Vzcy5cbiAgICAgKiBAcGFyYW0gey4uLkFycmF5fSBbdmFsdWVzXSBUaGUgYXJyYXlzIG9mIHZhbHVlcyB0byBleGNsdWRlLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhIG5ldyBhcnJheSBvZiBmaWx0ZXJlZCB2YWx1ZXMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uZGlmZmVyZW5jZShbMSwgMiwgMywgNCwgNV0sIFs1LCAyLCAxMF0pO1xuICAgICAqIC8vID0+IFsxLCAzLCA0XVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGRpZmZlcmVuY2UoYXJyYXkpIHtcbiAgICAgIHJldHVybiBiYXNlRGlmZmVyZW5jZShhcnJheSwgYmFzZUZsYXR0ZW4oYXJndW1lbnRzLCB0cnVlLCB0cnVlLCAxKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgbGlrZSBgXy5maW5kYCBleGNlcHQgdGhhdCBpdCByZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgZmlyc3RcbiAgICAgKiBlbGVtZW50IHRoYXQgcGFzc2VzIHRoZSBjYWxsYmFjayBjaGVjaywgaW5zdGVhZCBvZiB0aGUgZWxlbWVudCBpdHNlbGYuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gc2VhcmNoLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkXG4gICAgICogIHBlciBpdGVyYXRpb24uIElmIGEgcHJvcGVydHkgbmFtZSBvciBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkXG4gICAgICogIHRvIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGZvdW5kIGVsZW1lbnQsIGVsc2UgYC0xYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIGNoYXJhY3RlcnMgPSBbXG4gICAgICogICB7ICduYW1lJzogJ2Jhcm5leScsICAnYWdlJzogMzYsICdibG9ja2VkJzogZmFsc2UgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgICdhZ2UnOiA0MCwgJ2Jsb2NrZWQnOiB0cnVlIH0sXG4gICAgICogICB7ICduYW1lJzogJ3BlYmJsZXMnLCAnYWdlJzogMSwgICdibG9ja2VkJzogZmFsc2UgfVxuICAgICAqIF07XG4gICAgICpcbiAgICAgKiBfLmZpbmRJbmRleChjaGFyYWN0ZXJzLCBmdW5jdGlvbihjaHIpIHtcbiAgICAgKiAgIHJldHVybiBjaHIuYWdlIDwgMjA7XG4gICAgICogfSk7XG4gICAgICogLy8gPT4gMlxuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLndoZXJlXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5maW5kSW5kZXgoY2hhcmFjdGVycywgeyAnYWdlJzogMzYgfSk7XG4gICAgICogLy8gPT4gMFxuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLnBsdWNrXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5maW5kSW5kZXgoY2hhcmFjdGVycywgJ2Jsb2NrZWQnKTtcbiAgICAgKiAvLyA9PiAxXG4gICAgICovXG4gICAgZnVuY3Rpb24gZmluZEluZGV4KGFycmF5LCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgbGVuZ3RoID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwO1xuXG4gICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICBpZiAoY2FsbGJhY2soYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpKSB7XG4gICAgICAgICAgcmV0dXJuIGluZGV4O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgbGlrZSBgXy5maW5kSW5kZXhgIGV4Y2VwdCB0aGF0IGl0IGl0ZXJhdGVzIG92ZXIgZWxlbWVudHNcbiAgICAgKiBvZiBhIGBjb2xsZWN0aW9uYCBmcm9tIHJpZ2h0IHRvIGxlZnQuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gc2VhcmNoLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkXG4gICAgICogIHBlciBpdGVyYXRpb24uIElmIGEgcHJvcGVydHkgbmFtZSBvciBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkXG4gICAgICogIHRvIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGZvdW5kIGVsZW1lbnQsIGVsc2UgYC0xYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIGNoYXJhY3RlcnMgPSBbXG4gICAgICogICB7ICduYW1lJzogJ2Jhcm5leScsICAnYWdlJzogMzYsICdibG9ja2VkJzogdHJ1ZSB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdmcmVkJywgICAgJ2FnZSc6IDQwLCAnYmxvY2tlZCc6IGZhbHNlIH0sXG4gICAgICogICB7ICduYW1lJzogJ3BlYmJsZXMnLCAnYWdlJzogMSwgICdibG9ja2VkJzogdHJ1ZSB9XG4gICAgICogXTtcbiAgICAgKlxuICAgICAqIF8uZmluZExhc3RJbmRleChjaGFyYWN0ZXJzLCBmdW5jdGlvbihjaHIpIHtcbiAgICAgKiAgIHJldHVybiBjaHIuYWdlID4gMzA7XG4gICAgICogfSk7XG4gICAgICogLy8gPT4gMVxuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLndoZXJlXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5maW5kTGFzdEluZGV4KGNoYXJhY3RlcnMsIHsgJ2FnZSc6IDM2IH0pO1xuICAgICAqIC8vID0+IDBcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy5wbHVja1wiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8uZmluZExhc3RJbmRleChjaGFyYWN0ZXJzLCAnYmxvY2tlZCcpO1xuICAgICAqIC8vID0+IDJcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBmaW5kTGFzdEluZGV4KGFycmF5LCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgdmFyIGxlbmd0aCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogMDtcbiAgICAgIGNhbGxiYWNrID0gbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcbiAgICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICBpZiAoY2FsbGJhY2soYXJyYXlbbGVuZ3RoXSwgbGVuZ3RoLCBhcnJheSkpIHtcbiAgICAgICAgICByZXR1cm4gbGVuZ3RoO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgZmlyc3QgZWxlbWVudCBvciBmaXJzdCBgbmAgZWxlbWVudHMgb2YgYW4gYXJyYXkuIElmIGEgY2FsbGJhY2tcbiAgICAgKiBpcyBwcm92aWRlZCBlbGVtZW50cyBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBhcnJheSBhcmUgcmV0dXJuZWQgYXMgbG9uZ1xuICAgICAqIGFzIHRoZSBjYWxsYmFjayByZXR1cm5zIHRydWV5LiBUaGUgY2FsbGJhY2sgaXMgYm91bmQgdG8gYHRoaXNBcmdgIGFuZFxuICAgICAqIGludm9rZWQgd2l0aCB0aHJlZSBhcmd1bWVudHM7ICh2YWx1ZSwgaW5kZXgsIGFycmF5KS5cbiAgICAgKlxuICAgICAqIElmIGEgcHJvcGVydHkgbmFtZSBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ucGx1Y2tcIiBzdHlsZVxuICAgICAqIGNhbGxiYWNrIHdpbGwgcmV0dXJuIHRoZSBwcm9wZXJ0eSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICAgKlxuICAgICAqIElmIGFuIG9iamVjdCBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFja1xuICAgICAqIHdpbGwgcmV0dXJuIGB0cnVlYCBmb3IgZWxlbWVudHMgdGhhdCBoYXZlIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBnaXZlbiBvYmplY3QsXG4gICAgICogZWxzZSBgZmFsc2VgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGFsaWFzIGhlYWQsIHRha2VcbiAgICAgKiBAY2F0ZWdvcnkgQXJyYXlzXG4gICAgICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIHF1ZXJ5LlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fG51bWJlcnxzdHJpbmd9IFtjYWxsYmFja10gVGhlIGZ1bmN0aW9uIGNhbGxlZFxuICAgICAqICBwZXIgZWxlbWVudCBvciB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIHRvIHJldHVybi4gSWYgYSBwcm9wZXJ0eSBuYW1lIG9yXG4gICAgICogIG9iamVjdCBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIHVzZWQgdG8gY3JlYXRlIGEgXCJfLnBsdWNrXCIgb3IgXCJfLndoZXJlXCJcbiAgICAgKiAgc3R5bGUgY2FsbGJhY2ssIHJlc3BlY3RpdmVseS5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZmlyc3QgZWxlbWVudChzKSBvZiBgYXJyYXlgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmZpcnN0KFsxLCAyLCAzXSk7XG4gICAgICogLy8gPT4gMVxuICAgICAqXG4gICAgICogXy5maXJzdChbMSwgMiwgM10sIDIpO1xuICAgICAqIC8vID0+IFsxLCAyXVxuICAgICAqXG4gICAgICogXy5maXJzdChbMSwgMiwgM10sIGZ1bmN0aW9uKG51bSkge1xuICAgICAqICAgcmV0dXJuIG51bSA8IDM7XG4gICAgICogfSk7XG4gICAgICogLy8gPT4gWzEsIDJdXG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgICdibG9ja2VkJzogdHJ1ZSwgICdlbXBsb3llcic6ICdzbGF0ZScgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgICdibG9ja2VkJzogZmFsc2UsICdlbXBsb3llcic6ICdzbGF0ZScgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAncGViYmxlcycsICdibG9ja2VkJzogdHJ1ZSwgICdlbXBsb3llcic6ICduYScgfVxuICAgICAqIF07XG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ucGx1Y2tcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLmZpcnN0KGNoYXJhY3RlcnMsICdibG9ja2VkJyk7XG4gICAgICogLy8gPT4gW3sgJ25hbWUnOiAnYmFybmV5JywgJ2Jsb2NrZWQnOiB0cnVlLCAnZW1wbG95ZXInOiAnc2xhdGUnIH1dXG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ud2hlcmVcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLnBsdWNrKF8uZmlyc3QoY2hhcmFjdGVycywgeyAnZW1wbG95ZXInOiAnc2xhdGUnIH0pLCAnbmFtZScpO1xuICAgICAqIC8vID0+IFsnYmFybmV5JywgJ2ZyZWQnXVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGZpcnN0KGFycmF5LCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgdmFyIG4gPSAwLFxuICAgICAgICAgIGxlbmd0aCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogMDtcblxuICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPSAnbnVtYmVyJyAmJiBjYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICAgIHZhciBpbmRleCA9IC0xO1xuICAgICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoICYmIGNhbGxiYWNrKGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KSkge1xuICAgICAgICAgIG4rKztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbiA9IGNhbGxiYWNrO1xuICAgICAgICBpZiAobiA9PSBudWxsIHx8IHRoaXNBcmcpIHtcbiAgICAgICAgICByZXR1cm4gYXJyYXkgPyBhcnJheVswXSA6IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHNsaWNlKGFycmF5LCAwLCBuYXRpdmVNaW4obmF0aXZlTWF4KDAsIG4pLCBsZW5ndGgpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGbGF0dGVucyBhIG5lc3RlZCBhcnJheSAodGhlIG5lc3RpbmcgY2FuIGJlIHRvIGFueSBkZXB0aCkuIElmIGBpc1NoYWxsb3dgXG4gICAgICogaXMgdHJ1ZXksIHRoZSBhcnJheSB3aWxsIG9ubHkgYmUgZmxhdHRlbmVkIGEgc2luZ2xlIGxldmVsLiBJZiBhIGNhbGxiYWNrXG4gICAgICogaXMgcHJvdmlkZWQgZWFjaCBlbGVtZW50IG9mIHRoZSBhcnJheSBpcyBwYXNzZWQgdGhyb3VnaCB0aGUgY2FsbGJhY2sgYmVmb3JlXG4gICAgICogZmxhdHRlbmluZy4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIHRocmVlXG4gICAgICogYXJndW1lbnRzOyAodmFsdWUsIGluZGV4LCBhcnJheSkuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gZmxhdHRlbi5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc1NoYWxsb3c9ZmFsc2VdIEEgZmxhZyB0byByZXN0cmljdCBmbGF0dGVuaW5nIHRvIGEgc2luZ2xlIGxldmVsLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkXG4gICAgICogIHBlciBpdGVyYXRpb24uIElmIGEgcHJvcGVydHkgbmFtZSBvciBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkXG4gICAgICogIHRvIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGEgbmV3IGZsYXR0ZW5lZCBhcnJheS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5mbGF0dGVuKFsxLCBbMl0sIFszLCBbWzRdXV1dKTtcbiAgICAgKiAvLyA9PiBbMSwgMiwgMywgNF07XG4gICAgICpcbiAgICAgKiBfLmZsYXR0ZW4oWzEsIFsyXSwgWzMsIFtbNF1dXV0sIHRydWUpO1xuICAgICAqIC8vID0+IFsxLCAyLCAzLCBbWzRdXV07XG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgJ2FnZSc6IDMwLCAncGV0cyc6IFsnaG9wcHknXSB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdmcmVkJywgICAnYWdlJzogNDAsICdwZXRzJzogWydiYWJ5IHB1c3MnLCAnZGlubyddIH1cbiAgICAgKiBdO1xuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLnBsdWNrXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5mbGF0dGVuKGNoYXJhY3RlcnMsICdwZXRzJyk7XG4gICAgICogLy8gPT4gWydob3BweScsICdiYWJ5IHB1c3MnLCAnZGlubyddXG4gICAgICovXG4gICAgZnVuY3Rpb24gZmxhdHRlbihhcnJheSwgaXNTaGFsbG93LCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgLy8ganVnZ2xlIGFyZ3VtZW50c1xuICAgICAgaWYgKHR5cGVvZiBpc1NoYWxsb3cgIT0gJ2Jvb2xlYW4nICYmIGlzU2hhbGxvdyAhPSBudWxsKSB7XG4gICAgICAgIHRoaXNBcmcgPSBjYWxsYmFjaztcbiAgICAgICAgY2FsbGJhY2sgPSAodHlwZW9mIGlzU2hhbGxvdyAhPSAnZnVuY3Rpb24nICYmIHRoaXNBcmcgJiYgdGhpc0FyZ1tpc1NoYWxsb3ddID09PSBhcnJheSkgPyBudWxsIDogaXNTaGFsbG93O1xuICAgICAgICBpc1NoYWxsb3cgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChjYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICAgIGFycmF5ID0gbWFwKGFycmF5LCBjYWxsYmFjaywgdGhpc0FyZyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYmFzZUZsYXR0ZW4oYXJyYXksIGlzU2hhbGxvdyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgaW5kZXggYXQgd2hpY2ggdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgYHZhbHVlYCBpcyBmb3VuZCB1c2luZ1xuICAgICAqIHN0cmljdCBlcXVhbGl0eSBmb3IgY29tcGFyaXNvbnMsIGkuZS4gYD09PWAuIElmIHRoZSBhcnJheSBpcyBhbHJlYWR5IHNvcnRlZFxuICAgICAqIHByb3ZpZGluZyBgdHJ1ZWAgZm9yIGBmcm9tSW5kZXhgIHdpbGwgcnVuIGEgZmFzdGVyIGJpbmFyeSBzZWFyY2guXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgQXJyYXlzXG4gICAgICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIHNlYXJjaC5cbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZWFyY2ggZm9yLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbnxudW1iZXJ9IFtmcm9tSW5kZXg9MF0gVGhlIGluZGV4IHRvIHNlYXJjaCBmcm9tIG9yIGB0cnVlYFxuICAgICAqICB0byBwZXJmb3JtIGEgYmluYXJ5IHNlYXJjaCBvbiBhIHNvcnRlZCBhcnJheS5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgbWF0Y2hlZCB2YWx1ZSBvciBgLTFgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmluZGV4T2YoWzEsIDIsIDMsIDEsIDIsIDNdLCAyKTtcbiAgICAgKiAvLyA9PiAxXG4gICAgICpcbiAgICAgKiBfLmluZGV4T2YoWzEsIDIsIDMsIDEsIDIsIDNdLCAyLCAzKTtcbiAgICAgKiAvLyA9PiA0XG4gICAgICpcbiAgICAgKiBfLmluZGV4T2YoWzEsIDEsIDIsIDIsIDMsIDNdLCAyLCB0cnVlKTtcbiAgICAgKiAvLyA9PiAyXG4gICAgICovXG4gICAgZnVuY3Rpb24gaW5kZXhPZihhcnJheSwgdmFsdWUsIGZyb21JbmRleCkge1xuICAgICAgaWYgKHR5cGVvZiBmcm9tSW5kZXggPT0gJ251bWJlcicpIHtcbiAgICAgICAgdmFyIGxlbmd0aCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogMDtcbiAgICAgICAgZnJvbUluZGV4ID0gKGZyb21JbmRleCA8IDAgPyBuYXRpdmVNYXgoMCwgbGVuZ3RoICsgZnJvbUluZGV4KSA6IGZyb21JbmRleCB8fCAwKTtcbiAgICAgIH0gZWxzZSBpZiAoZnJvbUluZGV4KSB7XG4gICAgICAgIHZhciBpbmRleCA9IHNvcnRlZEluZGV4KGFycmF5LCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiBhcnJheVtpbmRleF0gPT09IHZhbHVlID8gaW5kZXggOiAtMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBiYXNlSW5kZXhPZihhcnJheSwgdmFsdWUsIGZyb21JbmRleCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyBhbGwgYnV0IHRoZSBsYXN0IGVsZW1lbnQgb3IgbGFzdCBgbmAgZWxlbWVudHMgb2YgYW4gYXJyYXkuIElmIGFcbiAgICAgKiBjYWxsYmFjayBpcyBwcm92aWRlZCBlbGVtZW50cyBhdCB0aGUgZW5kIG9mIHRoZSBhcnJheSBhcmUgZXhjbHVkZWQgZnJvbVxuICAgICAqIHRoZSByZXN1bHQgYXMgbG9uZyBhcyB0aGUgY2FsbGJhY2sgcmV0dXJucyB0cnVleS4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kXG4gICAgICogdG8gYHRoaXNBcmdgIGFuZCBpbnZva2VkIHdpdGggdGhyZWUgYXJndW1lbnRzOyAodmFsdWUsIGluZGV4LCBhcnJheSkuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gcXVlcnkuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8bnVtYmVyfHN0cmluZ30gW2NhbGxiYWNrPTFdIFRoZSBmdW5jdGlvbiBjYWxsZWRcbiAgICAgKiAgcGVyIGVsZW1lbnQgb3IgdGhlIG51bWJlciBvZiBlbGVtZW50cyB0byBleGNsdWRlLiBJZiBhIHByb3BlcnR5IG5hbWUgb3JcbiAgICAgKiAgb2JqZWN0IGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgdXNlZCB0byBjcmVhdGUgYSBcIl8ucGx1Y2tcIiBvciBcIl8ud2hlcmVcIlxuICAgICAqICBzdHlsZSBjYWxsYmFjaywgcmVzcGVjdGl2ZWx5LlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhIHNsaWNlIG9mIGBhcnJheWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uaW5pdGlhbChbMSwgMiwgM10pO1xuICAgICAqIC8vID0+IFsxLCAyXVxuICAgICAqXG4gICAgICogXy5pbml0aWFsKFsxLCAyLCAzXSwgMik7XG4gICAgICogLy8gPT4gWzFdXG4gICAgICpcbiAgICAgKiBfLmluaXRpYWwoWzEsIDIsIDNdLCBmdW5jdGlvbihudW0pIHtcbiAgICAgKiAgIHJldHVybiBudW0gPiAxO1xuICAgICAqIH0pO1xuICAgICAqIC8vID0+IFsxXVxuICAgICAqXG4gICAgICogdmFyIGNoYXJhY3RlcnMgPSBbXG4gICAgICogICB7ICduYW1lJzogJ2Jhcm5leScsICAnYmxvY2tlZCc6IGZhbHNlLCAnZW1wbG95ZXInOiAnc2xhdGUnIH0sXG4gICAgICogICB7ICduYW1lJzogJ2ZyZWQnLCAgICAnYmxvY2tlZCc6IHRydWUsICAnZW1wbG95ZXInOiAnc2xhdGUnIH0sXG4gICAgICogICB7ICduYW1lJzogJ3BlYmJsZXMnLCAnYmxvY2tlZCc6IHRydWUsICAnZW1wbG95ZXInOiAnbmEnIH1cbiAgICAgKiBdO1xuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLnBsdWNrXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5pbml0aWFsKGNoYXJhY3RlcnMsICdibG9ja2VkJyk7XG4gICAgICogLy8gPT4gW3sgJ25hbWUnOiAnYmFybmV5JywgICdibG9ja2VkJzogZmFsc2UsICdlbXBsb3llcic6ICdzbGF0ZScgfV1cbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy53aGVyZVwiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8ucGx1Y2soXy5pbml0aWFsKGNoYXJhY3RlcnMsIHsgJ2VtcGxveWVyJzogJ25hJyB9KSwgJ25hbWUnKTtcbiAgICAgKiAvLyA9PiBbJ2Jhcm5leScsICdmcmVkJ11cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpbml0aWFsKGFycmF5LCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgdmFyIG4gPSAwLFxuICAgICAgICAgIGxlbmd0aCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogMDtcblxuICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPSAnbnVtYmVyJyAmJiBjYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICAgIHZhciBpbmRleCA9IGxlbmd0aDtcbiAgICAgICAgY2FsbGJhY2sgPSBsb2Rhc2guY3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDMpO1xuICAgICAgICB3aGlsZSAoaW5kZXgtLSAmJiBjYWxsYmFjayhhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSkpIHtcbiAgICAgICAgICBuKys7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG4gPSAoY2FsbGJhY2sgPT0gbnVsbCB8fCB0aGlzQXJnKSA/IDEgOiBjYWxsYmFjayB8fCBuO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNsaWNlKGFycmF5LCAwLCBuYXRpdmVNaW4obmF0aXZlTWF4KDAsIGxlbmd0aCAtIG4pLCBsZW5ndGgpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGFycmF5IG9mIHVuaXF1ZSB2YWx1ZXMgcHJlc2VudCBpbiBhbGwgcHJvdmlkZWQgYXJyYXlzIHVzaW5nXG4gICAgICogc3RyaWN0IGVxdWFsaXR5IGZvciBjb21wYXJpc29ucywgaS5lLiBgPT09YC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0gey4uLkFycmF5fSBbYXJyYXldIFRoZSBhcnJheXMgdG8gaW5zcGVjdC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYW4gYXJyYXkgb2Ygc2hhcmVkIHZhbHVlcy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5pbnRlcnNlY3Rpb24oWzEsIDIsIDNdLCBbNSwgMiwgMSwgNF0sIFsyLCAxXSk7XG4gICAgICogLy8gPT4gWzEsIDJdXG4gICAgICovXG4gICAgZnVuY3Rpb24gaW50ZXJzZWN0aW9uKCkge1xuICAgICAgdmFyIGFyZ3MgPSBbXSxcbiAgICAgICAgICBhcmdzSW5kZXggPSAtMSxcbiAgICAgICAgICBhcmdzTGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aCxcbiAgICAgICAgICBjYWNoZXMgPSBnZXRBcnJheSgpLFxuICAgICAgICAgIGluZGV4T2YgPSBnZXRJbmRleE9mKCksXG4gICAgICAgICAgdHJ1c3RJbmRleE9mID0gaW5kZXhPZiA9PT0gYmFzZUluZGV4T2YsXG4gICAgICAgICAgc2VlbiA9IGdldEFycmF5KCk7XG5cbiAgICAgIHdoaWxlICgrK2FyZ3NJbmRleCA8IGFyZ3NMZW5ndGgpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gYXJndW1lbnRzW2FyZ3NJbmRleF07XG4gICAgICAgIGlmIChpc0FycmF5KHZhbHVlKSB8fCBpc0FyZ3VtZW50cyh2YWx1ZSkpIHtcbiAgICAgICAgICBhcmdzLnB1c2godmFsdWUpO1xuICAgICAgICAgIGNhY2hlcy5wdXNoKHRydXN0SW5kZXhPZiAmJiB2YWx1ZS5sZW5ndGggPj0gbGFyZ2VBcnJheVNpemUgJiZcbiAgICAgICAgICAgIGNyZWF0ZUNhY2hlKGFyZ3NJbmRleCA/IGFyZ3NbYXJnc0luZGV4XSA6IHNlZW4pKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIGFycmF5ID0gYXJnc1swXSxcbiAgICAgICAgICBpbmRleCA9IC0xLFxuICAgICAgICAgIGxlbmd0aCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogMCxcbiAgICAgICAgICByZXN1bHQgPSBbXTtcblxuICAgICAgb3V0ZXI6XG4gICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICB2YXIgY2FjaGUgPSBjYWNoZXNbMF07XG4gICAgICAgIHZhbHVlID0gYXJyYXlbaW5kZXhdO1xuXG4gICAgICAgIGlmICgoY2FjaGUgPyBjYWNoZUluZGV4T2YoY2FjaGUsIHZhbHVlKSA6IGluZGV4T2Yoc2VlbiwgdmFsdWUpKSA8IDApIHtcbiAgICAgICAgICBhcmdzSW5kZXggPSBhcmdzTGVuZ3RoO1xuICAgICAgICAgIChjYWNoZSB8fCBzZWVuKS5wdXNoKHZhbHVlKTtcbiAgICAgICAgICB3aGlsZSAoLS1hcmdzSW5kZXgpIHtcbiAgICAgICAgICAgIGNhY2hlID0gY2FjaGVzW2FyZ3NJbmRleF07XG4gICAgICAgICAgICBpZiAoKGNhY2hlID8gY2FjaGVJbmRleE9mKGNhY2hlLCB2YWx1ZSkgOiBpbmRleE9mKGFyZ3NbYXJnc0luZGV4XSwgdmFsdWUpKSA8IDApIHtcbiAgICAgICAgICAgICAgY29udGludWUgb3V0ZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgd2hpbGUgKGFyZ3NMZW5ndGgtLSkge1xuICAgICAgICBjYWNoZSA9IGNhY2hlc1thcmdzTGVuZ3RoXTtcbiAgICAgICAgaWYgKGNhY2hlKSB7XG4gICAgICAgICAgcmVsZWFzZU9iamVjdChjYWNoZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlbGVhc2VBcnJheShjYWNoZXMpO1xuICAgICAgcmVsZWFzZUFycmF5KHNlZW4pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBsYXN0IGVsZW1lbnQgb3IgbGFzdCBgbmAgZWxlbWVudHMgb2YgYW4gYXJyYXkuIElmIGEgY2FsbGJhY2sgaXNcbiAgICAgKiBwcm92aWRlZCBlbGVtZW50cyBhdCB0aGUgZW5kIG9mIHRoZSBhcnJheSBhcmUgcmV0dXJuZWQgYXMgbG9uZyBhcyB0aGVcbiAgICAgKiBjYWxsYmFjayByZXR1cm5zIHRydWV5LiBUaGUgY2FsbGJhY2sgaXMgYm91bmQgdG8gYHRoaXNBcmdgIGFuZCBpbnZva2VkXG4gICAgICogd2l0aCB0aHJlZSBhcmd1bWVudHM7ICh2YWx1ZSwgaW5kZXgsIGFycmF5KS5cbiAgICAgKlxuICAgICAqIElmIGEgcHJvcGVydHkgbmFtZSBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ucGx1Y2tcIiBzdHlsZVxuICAgICAqIGNhbGxiYWNrIHdpbGwgcmV0dXJuIHRoZSBwcm9wZXJ0eSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICAgKlxuICAgICAqIElmIGFuIG9iamVjdCBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFja1xuICAgICAqIHdpbGwgcmV0dXJuIGB0cnVlYCBmb3IgZWxlbWVudHMgdGhhdCBoYXZlIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBnaXZlbiBvYmplY3QsXG4gICAgICogZWxzZSBgZmFsc2VgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEFycmF5c1xuICAgICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBxdWVyeS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdHxudW1iZXJ8c3RyaW5nfSBbY2FsbGJhY2tdIFRoZSBmdW5jdGlvbiBjYWxsZWRcbiAgICAgKiAgcGVyIGVsZW1lbnQgb3IgdGhlIG51bWJlciBvZiBlbGVtZW50cyB0byByZXR1cm4uIElmIGEgcHJvcGVydHkgbmFtZSBvclxuICAgICAqICBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkIHRvIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiXG4gICAgICogIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGxhc3QgZWxlbWVudChzKSBvZiBgYXJyYXlgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmxhc3QoWzEsIDIsIDNdKTtcbiAgICAgKiAvLyA9PiAzXG4gICAgICpcbiAgICAgKiBfLmxhc3QoWzEsIDIsIDNdLCAyKTtcbiAgICAgKiAvLyA9PiBbMiwgM11cbiAgICAgKlxuICAgICAqIF8ubGFzdChbMSwgMiwgM10sIGZ1bmN0aW9uKG51bSkge1xuICAgICAqICAgcmV0dXJuIG51bSA+IDE7XG4gICAgICogfSk7XG4gICAgICogLy8gPT4gWzIsIDNdXG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgICdibG9ja2VkJzogZmFsc2UsICdlbXBsb3llcic6ICdzbGF0ZScgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgICdibG9ja2VkJzogdHJ1ZSwgICdlbXBsb3llcic6ICdzbGF0ZScgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAncGViYmxlcycsICdibG9ja2VkJzogdHJ1ZSwgICdlbXBsb3llcic6ICduYScgfVxuICAgICAqIF07XG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ucGx1Y2tcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLnBsdWNrKF8ubGFzdChjaGFyYWN0ZXJzLCAnYmxvY2tlZCcpLCAnbmFtZScpO1xuICAgICAqIC8vID0+IFsnZnJlZCcsICdwZWJibGVzJ11cbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy53aGVyZVwiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8ubGFzdChjaGFyYWN0ZXJzLCB7ICdlbXBsb3llcic6ICduYScgfSk7XG4gICAgICogLy8gPT4gW3sgJ25hbWUnOiAncGViYmxlcycsICdibG9ja2VkJzogdHJ1ZSwgJ2VtcGxveWVyJzogJ25hJyB9XVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGxhc3QoYXJyYXksIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgbiA9IDAsXG4gICAgICAgICAgbGVuZ3RoID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwO1xuXG4gICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9ICdudW1iZXInICYmIGNhbGxiYWNrICE9IG51bGwpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gbGVuZ3RoO1xuICAgICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICAgIHdoaWxlIChpbmRleC0tICYmIGNhbGxiYWNrKGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KSkge1xuICAgICAgICAgIG4rKztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbiA9IGNhbGxiYWNrO1xuICAgICAgICBpZiAobiA9PSBudWxsIHx8IHRoaXNBcmcpIHtcbiAgICAgICAgICByZXR1cm4gYXJyYXkgPyBhcnJheVtsZW5ndGggLSAxXSA6IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHNsaWNlKGFycmF5LCBuYXRpdmVNYXgoMCwgbGVuZ3RoIC0gbikpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGluZGV4IGF0IHdoaWNoIHRoZSBsYXN0IG9jY3VycmVuY2Ugb2YgYHZhbHVlYCBpcyBmb3VuZCB1c2luZyBzdHJpY3RcbiAgICAgKiBlcXVhbGl0eSBmb3IgY29tcGFyaXNvbnMsIGkuZS4gYD09PWAuIElmIGBmcm9tSW5kZXhgIGlzIG5lZ2F0aXZlLCBpdCBpcyB1c2VkXG4gICAgICogYXMgdGhlIG9mZnNldCBmcm9tIHRoZSBlbmQgb2YgdGhlIGNvbGxlY3Rpb24uXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gc2VhcmNoLlxuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNlYXJjaCBmb3IuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtmcm9tSW5kZXg9YXJyYXkubGVuZ3RoLTFdIFRoZSBpbmRleCB0byBzZWFyY2ggZnJvbS5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgbWF0Y2hlZCB2YWx1ZSBvciBgLTFgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmxhc3RJbmRleE9mKFsxLCAyLCAzLCAxLCAyLCAzXSwgMik7XG4gICAgICogLy8gPT4gNFxuICAgICAqXG4gICAgICogXy5sYXN0SW5kZXhPZihbMSwgMiwgMywgMSwgMiwgM10sIDIsIDMpO1xuICAgICAqIC8vID0+IDFcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBsYXN0SW5kZXhPZihhcnJheSwgdmFsdWUsIGZyb21JbmRleCkge1xuICAgICAgdmFyIGluZGV4ID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwO1xuICAgICAgaWYgKHR5cGVvZiBmcm9tSW5kZXggPT0gJ251bWJlcicpIHtcbiAgICAgICAgaW5kZXggPSAoZnJvbUluZGV4IDwgMCA/IG5hdGl2ZU1heCgwLCBpbmRleCArIGZyb21JbmRleCkgOiBuYXRpdmVNaW4oZnJvbUluZGV4LCBpbmRleCAtIDEpKSArIDE7XG4gICAgICB9XG4gICAgICB3aGlsZSAoaW5kZXgtLSkge1xuICAgICAgICBpZiAoYXJyYXlbaW5kZXhdID09PSB2YWx1ZSkge1xuICAgICAgICAgIHJldHVybiBpbmRleDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIHByb3ZpZGVkIHZhbHVlcyBmcm9tIHRoZSBnaXZlbiBhcnJheSB1c2luZyBzdHJpY3QgZXF1YWxpdHkgZm9yXG4gICAgICogY29tcGFyaXNvbnMsIGkuZS4gYD09PWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgQXJyYXlzXG4gICAgICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIG1vZGlmeS5cbiAgICAgKiBAcGFyYW0gey4uLip9IFt2YWx1ZV0gVGhlIHZhbHVlcyB0byByZW1vdmUuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGBhcnJheWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBhcnJheSA9IFsxLCAyLCAzLCAxLCAyLCAzXTtcbiAgICAgKiBfLnB1bGwoYXJyYXksIDIsIDMpO1xuICAgICAqIGNvbnNvbGUubG9nKGFycmF5KTtcbiAgICAgKiAvLyA9PiBbMSwgMV1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBwdWxsKGFycmF5KSB7XG4gICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAgICBhcmdzSW5kZXggPSAwLFxuICAgICAgICAgIGFyZ3NMZW5ndGggPSBhcmdzLmxlbmd0aCxcbiAgICAgICAgICBsZW5ndGggPSBhcnJheSA/IGFycmF5Lmxlbmd0aCA6IDA7XG5cbiAgICAgIHdoaWxlICgrK2FyZ3NJbmRleCA8IGFyZ3NMZW5ndGgpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgICB2YWx1ZSA9IGFyZ3NbYXJnc0luZGV4XTtcbiAgICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICBpZiAoYXJyYXlbaW5kZXhdID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgc3BsaWNlLmNhbGwoYXJyYXksIGluZGV4LS0sIDEpO1xuICAgICAgICAgICAgbGVuZ3RoLS07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gYXJyYXk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBhcnJheSBvZiBudW1iZXJzIChwb3NpdGl2ZSBhbmQvb3IgbmVnYXRpdmUpIHByb2dyZXNzaW5nIGZyb21cbiAgICAgKiBgc3RhcnRgIHVwIHRvIGJ1dCBub3QgaW5jbHVkaW5nIGBlbmRgLiBJZiBgc3RhcnRgIGlzIGxlc3MgdGhhbiBgc3RvcGAgYVxuICAgICAqIHplcm8tbGVuZ3RoIHJhbmdlIGlzIGNyZWF0ZWQgdW5sZXNzIGEgbmVnYXRpdmUgYHN0ZXBgIGlzIHNwZWNpZmllZC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3N0YXJ0PTBdIFRoZSBzdGFydCBvZiB0aGUgcmFuZ2UuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGVuZCBUaGUgZW5kIG9mIHRoZSByYW5nZS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3N0ZXA9MV0gVGhlIHZhbHVlIHRvIGluY3JlbWVudCBvciBkZWNyZW1lbnQgYnkuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGEgbmV3IHJhbmdlIGFycmF5LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLnJhbmdlKDQpO1xuICAgICAqIC8vID0+IFswLCAxLCAyLCAzXVxuICAgICAqXG4gICAgICogXy5yYW5nZSgxLCA1KTtcbiAgICAgKiAvLyA9PiBbMSwgMiwgMywgNF1cbiAgICAgKlxuICAgICAqIF8ucmFuZ2UoMCwgMjAsIDUpO1xuICAgICAqIC8vID0+IFswLCA1LCAxMCwgMTVdXG4gICAgICpcbiAgICAgKiBfLnJhbmdlKDAsIC00LCAtMSk7XG4gICAgICogLy8gPT4gWzAsIC0xLCAtMiwgLTNdXG4gICAgICpcbiAgICAgKiBfLnJhbmdlKDEsIDQsIDApO1xuICAgICAqIC8vID0+IFsxLCAxLCAxXVxuICAgICAqXG4gICAgICogXy5yYW5nZSgwKTtcbiAgICAgKiAvLyA9PiBbXVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJhbmdlKHN0YXJ0LCBlbmQsIHN0ZXApIHtcbiAgICAgIHN0YXJ0ID0gK3N0YXJ0IHx8IDA7XG4gICAgICBzdGVwID0gdHlwZW9mIHN0ZXAgPT0gJ251bWJlcicgPyBzdGVwIDogKCtzdGVwIHx8IDEpO1xuXG4gICAgICBpZiAoZW5kID09IG51bGwpIHtcbiAgICAgICAgZW5kID0gc3RhcnQ7XG4gICAgICAgIHN0YXJ0ID0gMDtcbiAgICAgIH1cbiAgICAgIC8vIHVzZSBgQXJyYXkobGVuZ3RoKWAgc28gZW5naW5lcyBsaWtlIENoYWtyYSBhbmQgVjggYXZvaWQgc2xvd2VyIG1vZGVzXG4gICAgICAvLyBodHRwOi8veW91dHUuYmUvWEFxSXBHVThaWmsjdD0xN20yNXNcbiAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgIGxlbmd0aCA9IG5hdGl2ZU1heCgwLCBjZWlsKChlbmQgLSBzdGFydCkgLyAoc3RlcCB8fCAxKSkpLFxuICAgICAgICAgIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgIHJlc3VsdFtpbmRleF0gPSBzdGFydDtcbiAgICAgICAgc3RhcnQgKz0gc3RlcDtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgZWxlbWVudHMgZnJvbSBhbiBhcnJheSB0aGF0IHRoZSBjYWxsYmFjayByZXR1cm5zIHRydWV5IGZvclxuICAgICAqIGFuZCByZXR1cm5zIGFuIGFycmF5IG9mIHJlbW92ZWQgZWxlbWVudHMuIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2BcbiAgICAgKiBhbmQgaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50czsgKHZhbHVlLCBpbmRleCwgYXJyYXkpLlxuICAgICAqXG4gICAgICogSWYgYSBwcm9wZXJ0eSBuYW1lIGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy5wbHVja1wiIHN0eWxlXG4gICAgICogY2FsbGJhY2sgd2lsbCByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgICAqXG4gICAgICogSWYgYW4gb2JqZWN0IGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrXG4gICAgICogd2lsbCByZXR1cm4gYHRydWVgIGZvciBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHByb3BlcnRpZXMgb2YgdGhlIGdpdmVuIG9iamVjdCxcbiAgICAgKiBlbHNlIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgQXJyYXlzXG4gICAgICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIG1vZGlmeS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdHxzdHJpbmd9IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZFxuICAgICAqICBwZXIgaXRlcmF0aW9uLiBJZiBhIHByb3BlcnR5IG5hbWUgb3Igb2JqZWN0IGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgdXNlZFxuICAgICAqICB0byBjcmVhdGUgYSBcIl8ucGx1Y2tcIiBvciBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFjaywgcmVzcGVjdGl2ZWx5LlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhIG5ldyBhcnJheSBvZiByZW1vdmVkIGVsZW1lbnRzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgYXJyYXkgPSBbMSwgMiwgMywgNCwgNSwgNl07XG4gICAgICogdmFyIGV2ZW5zID0gXy5yZW1vdmUoYXJyYXksIGZ1bmN0aW9uKG51bSkgeyByZXR1cm4gbnVtICUgMiA9PSAwOyB9KTtcbiAgICAgKlxuICAgICAqIGNvbnNvbGUubG9nKGFycmF5KTtcbiAgICAgKiAvLyA9PiBbMSwgMywgNV1cbiAgICAgKlxuICAgICAqIGNvbnNvbGUubG9nKGV2ZW5zKTtcbiAgICAgKiAvLyA9PiBbMiwgNCwgNl1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZW1vdmUoYXJyYXksIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICBsZW5ndGggPSBhcnJheSA/IGFycmF5Lmxlbmd0aCA6IDAsXG4gICAgICAgICAgcmVzdWx0ID0gW107XG5cbiAgICAgIGNhbGxiYWNrID0gbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcbiAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGFycmF5W2luZGV4XTtcbiAgICAgICAgaWYgKGNhbGxiYWNrKHZhbHVlLCBpbmRleCwgYXJyYXkpKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgICAgICAgIHNwbGljZS5jYWxsKGFycmF5LCBpbmRleC0tLCAxKTtcbiAgICAgICAgICBsZW5ndGgtLTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgb3Bwb3NpdGUgb2YgYF8uaW5pdGlhbGAgdGhpcyBtZXRob2QgZ2V0cyBhbGwgYnV0IHRoZSBmaXJzdCBlbGVtZW50IG9yXG4gICAgICogZmlyc3QgYG5gIGVsZW1lbnRzIG9mIGFuIGFycmF5LiBJZiBhIGNhbGxiYWNrIGZ1bmN0aW9uIGlzIHByb3ZpZGVkIGVsZW1lbnRzXG4gICAgICogYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgYXJyYXkgYXJlIGV4Y2x1ZGVkIGZyb20gdGhlIHJlc3VsdCBhcyBsb25nIGFzIHRoZVxuICAgICAqIGNhbGxiYWNrIHJldHVybnMgdHJ1ZXkuIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWRcbiAgICAgKiB3aXRoIHRocmVlIGFyZ3VtZW50czsgKHZhbHVlLCBpbmRleCwgYXJyYXkpLlxuICAgICAqXG4gICAgICogSWYgYSBwcm9wZXJ0eSBuYW1lIGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy5wbHVja1wiIHN0eWxlXG4gICAgICogY2FsbGJhY2sgd2lsbCByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgICAqXG4gICAgICogSWYgYW4gb2JqZWN0IGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrXG4gICAgICogd2lsbCByZXR1cm4gYHRydWVgIGZvciBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHByb3BlcnRpZXMgb2YgdGhlIGdpdmVuIG9iamVjdCxcbiAgICAgKiBlbHNlIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAYWxpYXMgZHJvcCwgdGFpbFxuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gcXVlcnkuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8bnVtYmVyfHN0cmluZ30gW2NhbGxiYWNrPTFdIFRoZSBmdW5jdGlvbiBjYWxsZWRcbiAgICAgKiAgcGVyIGVsZW1lbnQgb3IgdGhlIG51bWJlciBvZiBlbGVtZW50cyB0byBleGNsdWRlLiBJZiBhIHByb3BlcnR5IG5hbWUgb3JcbiAgICAgKiAgb2JqZWN0IGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgdXNlZCB0byBjcmVhdGUgYSBcIl8ucGx1Y2tcIiBvciBcIl8ud2hlcmVcIlxuICAgICAqICBzdHlsZSBjYWxsYmFjaywgcmVzcGVjdGl2ZWx5LlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhIHNsaWNlIG9mIGBhcnJheWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8ucmVzdChbMSwgMiwgM10pO1xuICAgICAqIC8vID0+IFsyLCAzXVxuICAgICAqXG4gICAgICogXy5yZXN0KFsxLCAyLCAzXSwgMik7XG4gICAgICogLy8gPT4gWzNdXG4gICAgICpcbiAgICAgKiBfLnJlc3QoWzEsIDIsIDNdLCBmdW5jdGlvbihudW0pIHtcbiAgICAgKiAgIHJldHVybiBudW0gPCAzO1xuICAgICAqIH0pO1xuICAgICAqIC8vID0+IFszXVxuICAgICAqXG4gICAgICogdmFyIGNoYXJhY3RlcnMgPSBbXG4gICAgICogICB7ICduYW1lJzogJ2Jhcm5leScsICAnYmxvY2tlZCc6IHRydWUsICAnZW1wbG95ZXInOiAnc2xhdGUnIH0sXG4gICAgICogICB7ICduYW1lJzogJ2ZyZWQnLCAgICAnYmxvY2tlZCc6IGZhbHNlLCAgJ2VtcGxveWVyJzogJ3NsYXRlJyB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdwZWJibGVzJywgJ2Jsb2NrZWQnOiB0cnVlLCAnZW1wbG95ZXInOiAnbmEnIH1cbiAgICAgKiBdO1xuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLnBsdWNrXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5wbHVjayhfLnJlc3QoY2hhcmFjdGVycywgJ2Jsb2NrZWQnKSwgJ25hbWUnKTtcbiAgICAgKiAvLyA9PiBbJ2ZyZWQnLCAncGViYmxlcyddXG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ud2hlcmVcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLnJlc3QoY2hhcmFjdGVycywgeyAnZW1wbG95ZXInOiAnc2xhdGUnIH0pO1xuICAgICAqIC8vID0+IFt7ICduYW1lJzogJ3BlYmJsZXMnLCAnYmxvY2tlZCc6IHRydWUsICdlbXBsb3llcic6ICduYScgfV1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZXN0KGFycmF5LCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPSAnbnVtYmVyJyAmJiBjYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICAgIHZhciBuID0gMCxcbiAgICAgICAgICAgIGluZGV4ID0gLTEsXG4gICAgICAgICAgICBsZW5ndGggPSBhcnJheSA/IGFycmF5Lmxlbmd0aCA6IDA7XG5cbiAgICAgICAgY2FsbGJhY2sgPSBsb2Rhc2guY3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDMpO1xuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCAmJiBjYWxsYmFjayhhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSkpIHtcbiAgICAgICAgICBuKys7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG4gPSAoY2FsbGJhY2sgPT0gbnVsbCB8fCB0aGlzQXJnKSA/IDEgOiBuYXRpdmVNYXgoMCwgY2FsbGJhY2spO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNsaWNlKGFycmF5LCBuKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVc2VzIGEgYmluYXJ5IHNlYXJjaCB0byBkZXRlcm1pbmUgdGhlIHNtYWxsZXN0IGluZGV4IGF0IHdoaWNoIGEgdmFsdWVcbiAgICAgKiBzaG91bGQgYmUgaW5zZXJ0ZWQgaW50byBhIGdpdmVuIHNvcnRlZCBhcnJheSBpbiBvcmRlciB0byBtYWludGFpbiB0aGUgc29ydFxuICAgICAqIG9yZGVyIG9mIHRoZSBhcnJheS4gSWYgYSBjYWxsYmFjayBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIGV4ZWN1dGVkIGZvclxuICAgICAqIGB2YWx1ZWAgYW5kIGVhY2ggZWxlbWVudCBvZiBgYXJyYXlgIHRvIGNvbXB1dGUgdGhlaXIgc29ydCByYW5raW5nLiBUaGVcbiAgICAgKiBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWQgd2l0aCBvbmUgYXJndW1lbnQ7ICh2YWx1ZSkuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaW5zcGVjdC5cbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBldmFsdWF0ZS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdHxzdHJpbmd9IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZFxuICAgICAqICBwZXIgaXRlcmF0aW9uLiBJZiBhIHByb3BlcnR5IG5hbWUgb3Igb2JqZWN0IGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgdXNlZFxuICAgICAqICB0byBjcmVhdGUgYSBcIl8ucGx1Y2tcIiBvciBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFjaywgcmVzcGVjdGl2ZWx5LlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIGluZGV4IGF0IHdoaWNoIGB2YWx1ZWAgc2hvdWxkIGJlIGluc2VydGVkXG4gICAgICogIGludG8gYGFycmF5YC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5zb3J0ZWRJbmRleChbMjAsIDMwLCA1MF0sIDQwKTtcbiAgICAgKiAvLyA9PiAyXG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ucGx1Y2tcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLnNvcnRlZEluZGV4KFt7ICd4JzogMjAgfSwgeyAneCc6IDMwIH0sIHsgJ3gnOiA1MCB9XSwgeyAneCc6IDQwIH0sICd4Jyk7XG4gICAgICogLy8gPT4gMlxuICAgICAqXG4gICAgICogdmFyIGRpY3QgPSB7XG4gICAgICogICAnd29yZFRvTnVtYmVyJzogeyAndHdlbnR5JzogMjAsICd0aGlydHknOiAzMCwgJ2ZvdXJ0eSc6IDQwLCAnZmlmdHknOiA1MCB9XG4gICAgICogfTtcbiAgICAgKlxuICAgICAqIF8uc29ydGVkSW5kZXgoWyd0d2VudHknLCAndGhpcnR5JywgJ2ZpZnR5J10sICdmb3VydHknLCBmdW5jdGlvbih3b3JkKSB7XG4gICAgICogICByZXR1cm4gZGljdC53b3JkVG9OdW1iZXJbd29yZF07XG4gICAgICogfSk7XG4gICAgICogLy8gPT4gMlxuICAgICAqXG4gICAgICogXy5zb3J0ZWRJbmRleChbJ3R3ZW50eScsICd0aGlydHknLCAnZmlmdHknXSwgJ2ZvdXJ0eScsIGZ1bmN0aW9uKHdvcmQpIHtcbiAgICAgKiAgIHJldHVybiB0aGlzLndvcmRUb051bWJlclt3b3JkXTtcbiAgICAgKiB9LCBkaWN0KTtcbiAgICAgKiAvLyA9PiAyXG4gICAgICovXG4gICAgZnVuY3Rpb24gc29ydGVkSW5kZXgoYXJyYXksIHZhbHVlLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgdmFyIGxvdyA9IDAsXG4gICAgICAgICAgaGlnaCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogbG93O1xuXG4gICAgICAvLyBleHBsaWNpdGx5IHJlZmVyZW5jZSBgaWRlbnRpdHlgIGZvciBiZXR0ZXIgaW5saW5pbmcgaW4gRmlyZWZveFxuICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayA/IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMSkgOiBpZGVudGl0eTtcbiAgICAgIHZhbHVlID0gY2FsbGJhY2sodmFsdWUpO1xuXG4gICAgICB3aGlsZSAobG93IDwgaGlnaCkge1xuICAgICAgICB2YXIgbWlkID0gKGxvdyArIGhpZ2gpID4+PiAxO1xuICAgICAgICAoY2FsbGJhY2soYXJyYXlbbWlkXSkgPCB2YWx1ZSlcbiAgICAgICAgICA/IGxvdyA9IG1pZCArIDFcbiAgICAgICAgICA6IGhpZ2ggPSBtaWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gbG93O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdW5pcXVlIHZhbHVlcywgaW4gb3JkZXIsIG9mIHRoZSBwcm92aWRlZCBhcnJheXMgdXNpbmdcbiAgICAgKiBzdHJpY3QgZXF1YWxpdHkgZm9yIGNvbXBhcmlzb25zLCBpLmUuIGA9PT1gLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEFycmF5c1xuICAgICAqIEBwYXJhbSB7Li4uQXJyYXl9IFthcnJheV0gVGhlIGFycmF5cyB0byBpbnNwZWN0LlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhbiBhcnJheSBvZiBjb21iaW5lZCB2YWx1ZXMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8udW5pb24oWzEsIDIsIDNdLCBbNSwgMiwgMSwgNF0sIFsyLCAxXSk7XG4gICAgICogLy8gPT4gWzEsIDIsIDMsIDUsIDRdXG4gICAgICovXG4gICAgZnVuY3Rpb24gdW5pb24oKSB7XG4gICAgICByZXR1cm4gYmFzZVVuaXEoYmFzZUZsYXR0ZW4oYXJndW1lbnRzLCB0cnVlLCB0cnVlKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGR1cGxpY2F0ZS12YWx1ZS1mcmVlIHZlcnNpb24gb2YgYW4gYXJyYXkgdXNpbmcgc3RyaWN0IGVxdWFsaXR5XG4gICAgICogZm9yIGNvbXBhcmlzb25zLCBpLmUuIGA9PT1gLiBJZiB0aGUgYXJyYXkgaXMgc29ydGVkLCBwcm92aWRpbmdcbiAgICAgKiBgdHJ1ZWAgZm9yIGBpc1NvcnRlZGAgd2lsbCB1c2UgYSBmYXN0ZXIgYWxnb3JpdGhtLiBJZiBhIGNhbGxiYWNrIGlzIHByb3ZpZGVkXG4gICAgICogZWFjaCBlbGVtZW50IG9mIGBhcnJheWAgaXMgcGFzc2VkIHRocm91Z2ggdGhlIGNhbGxiYWNrIGJlZm9yZSB1bmlxdWVuZXNzXG4gICAgICogaXMgY29tcHV0ZWQuIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWQgd2l0aCB0aHJlZVxuICAgICAqIGFyZ3VtZW50czsgKHZhbHVlLCBpbmRleCwgYXJyYXkpLlxuICAgICAqXG4gICAgICogSWYgYSBwcm9wZXJ0eSBuYW1lIGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy5wbHVja1wiIHN0eWxlXG4gICAgICogY2FsbGJhY2sgd2lsbCByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgICAqXG4gICAgICogSWYgYW4gb2JqZWN0IGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrXG4gICAgICogd2lsbCByZXR1cm4gYHRydWVgIGZvciBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHByb3BlcnRpZXMgb2YgdGhlIGdpdmVuIG9iamVjdCxcbiAgICAgKiBlbHNlIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAYWxpYXMgdW5pcXVlXG4gICAgICogQGNhdGVnb3J5IEFycmF5c1xuICAgICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBwcm9jZXNzLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzU29ydGVkPWZhbHNlXSBBIGZsYWcgdG8gaW5kaWNhdGUgdGhhdCBgYXJyYXlgIGlzIHNvcnRlZC5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdHxzdHJpbmd9IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZFxuICAgICAqICBwZXIgaXRlcmF0aW9uLiBJZiBhIHByb3BlcnR5IG5hbWUgb3Igb2JqZWN0IGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgdXNlZFxuICAgICAqICB0byBjcmVhdGUgYSBcIl8ucGx1Y2tcIiBvciBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFjaywgcmVzcGVjdGl2ZWx5LlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhIGR1cGxpY2F0ZS12YWx1ZS1mcmVlIGFycmF5LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLnVuaXEoWzEsIDIsIDEsIDMsIDFdKTtcbiAgICAgKiAvLyA9PiBbMSwgMiwgM11cbiAgICAgKlxuICAgICAqIF8udW5pcShbMSwgMSwgMiwgMiwgM10sIHRydWUpO1xuICAgICAqIC8vID0+IFsxLCAyLCAzXVxuICAgICAqXG4gICAgICogXy51bmlxKFsnQScsICdiJywgJ0MnLCAnYScsICdCJywgJ2MnXSwgZnVuY3Rpb24obGV0dGVyKSB7IHJldHVybiBsZXR0ZXIudG9Mb3dlckNhc2UoKTsgfSk7XG4gICAgICogLy8gPT4gWydBJywgJ2InLCAnQyddXG4gICAgICpcbiAgICAgKiBfLnVuaXEoWzEsIDIuNSwgMywgMS41LCAyLCAzLjVdLCBmdW5jdGlvbihudW0pIHsgcmV0dXJuIHRoaXMuZmxvb3IobnVtKTsgfSwgTWF0aCk7XG4gICAgICogLy8gPT4gWzEsIDIuNSwgM11cbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy5wbHVja1wiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8udW5pcShbeyAneCc6IDEgfSwgeyAneCc6IDIgfSwgeyAneCc6IDEgfV0sICd4Jyk7XG4gICAgICogLy8gPT4gW3sgJ3gnOiAxIH0sIHsgJ3gnOiAyIH1dXG4gICAgICovXG4gICAgZnVuY3Rpb24gdW5pcShhcnJheSwgaXNTb3J0ZWQsIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICAvLyBqdWdnbGUgYXJndW1lbnRzXG4gICAgICBpZiAodHlwZW9mIGlzU29ydGVkICE9ICdib29sZWFuJyAmJiBpc1NvcnRlZCAhPSBudWxsKSB7XG4gICAgICAgIHRoaXNBcmcgPSBjYWxsYmFjaztcbiAgICAgICAgY2FsbGJhY2sgPSAodHlwZW9mIGlzU29ydGVkICE9ICdmdW5jdGlvbicgJiYgdGhpc0FyZyAmJiB0aGlzQXJnW2lzU29ydGVkXSA9PT0gYXJyYXkpID8gbnVsbCA6IGlzU29ydGVkO1xuICAgICAgICBpc1NvcnRlZCA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKGNhbGxiYWNrICE9IG51bGwpIHtcbiAgICAgICAgY2FsbGJhY2sgPSBsb2Rhc2guY3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGJhc2VVbmlxKGFycmF5LCBpc1NvcnRlZCwgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gYXJyYXkgZXhjbHVkaW5nIGFsbCBwcm92aWRlZCB2YWx1ZXMgdXNpbmcgc3RyaWN0IGVxdWFsaXR5IGZvclxuICAgICAqIGNvbXBhcmlzb25zLCBpLmUuIGA9PT1gLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEFycmF5c1xuICAgICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBmaWx0ZXIuXG4gICAgICogQHBhcmFtIHsuLi4qfSBbdmFsdWVdIFRoZSB2YWx1ZXMgdG8gZXhjbHVkZS5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYSBuZXcgYXJyYXkgb2YgZmlsdGVyZWQgdmFsdWVzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLndpdGhvdXQoWzEsIDIsIDEsIDAsIDMsIDEsIDRdLCAwLCAxKTtcbiAgICAgKiAvLyA9PiBbMiwgMywgNF1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB3aXRob3V0KGFycmF5KSB7XG4gICAgICByZXR1cm4gYmFzZURpZmZlcmVuY2UoYXJyYXksIHNsaWNlKGFyZ3VtZW50cywgMSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gYXJyYXkgdGhhdCBpcyB0aGUgc3ltbWV0cmljIGRpZmZlcmVuY2Ugb2YgdGhlIHByb3ZpZGVkIGFycmF5cy5cbiAgICAgKiBTZWUgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TeW1tZXRyaWNfZGlmZmVyZW5jZS5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0gey4uLkFycmF5fSBbYXJyYXldIFRoZSBhcnJheXMgdG8gaW5zcGVjdC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYW4gYXJyYXkgb2YgdmFsdWVzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLnhvcihbMSwgMiwgM10sIFs1LCAyLCAxLCA0XSk7XG4gICAgICogLy8gPT4gWzMsIDUsIDRdXG4gICAgICpcbiAgICAgKiBfLnhvcihbMSwgMiwgNV0sIFsyLCAzLCA1XSwgWzMsIDQsIDVdKTtcbiAgICAgKiAvLyA9PiBbMSwgNCwgNV1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB4b3IoKSB7XG4gICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuXG4gICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICB2YXIgYXJyYXkgPSBhcmd1bWVudHNbaW5kZXhdO1xuICAgICAgICBpZiAoaXNBcnJheShhcnJheSkgfHwgaXNBcmd1bWVudHMoYXJyYXkpKSB7XG4gICAgICAgICAgdmFyIHJlc3VsdCA9IHJlc3VsdFxuICAgICAgICAgICAgPyBiYXNlVW5pcShiYXNlRGlmZmVyZW5jZShyZXN1bHQsIGFycmF5KS5jb25jYXQoYmFzZURpZmZlcmVuY2UoYXJyYXksIHJlc3VsdCkpKVxuICAgICAgICAgICAgOiBhcnJheTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdCB8fCBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGFycmF5IG9mIGdyb3VwZWQgZWxlbWVudHMsIHRoZSBmaXJzdCBvZiB3aGljaCBjb250YWlucyB0aGUgZmlyc3RcbiAgICAgKiBlbGVtZW50cyBvZiB0aGUgZ2l2ZW4gYXJyYXlzLCB0aGUgc2Vjb25kIG9mIHdoaWNoIGNvbnRhaW5zIHRoZSBzZWNvbmRcbiAgICAgKiBlbGVtZW50cyBvZiB0aGUgZ2l2ZW4gYXJyYXlzLCBhbmQgc28gb24uXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAYWxpYXMgdW56aXBcbiAgICAgKiBAY2F0ZWdvcnkgQXJyYXlzXG4gICAgICogQHBhcmFtIHsuLi5BcnJheX0gW2FycmF5XSBBcnJheXMgdG8gcHJvY2Vzcy5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYSBuZXcgYXJyYXkgb2YgZ3JvdXBlZCBlbGVtZW50cy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy56aXAoWydmcmVkJywgJ2Jhcm5leSddLCBbMzAsIDQwXSwgW3RydWUsIGZhbHNlXSk7XG4gICAgICogLy8gPT4gW1snZnJlZCcsIDMwLCB0cnVlXSwgWydiYXJuZXknLCA0MCwgZmFsc2VdXVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHppcCgpIHtcbiAgICAgIHZhciBhcnJheSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzIDogYXJndW1lbnRzWzBdLFxuICAgICAgICAgIGluZGV4ID0gLTEsXG4gICAgICAgICAgbGVuZ3RoID0gYXJyYXkgPyBtYXgocGx1Y2soYXJyYXksICdsZW5ndGgnKSkgOiAwLFxuICAgICAgICAgIHJlc3VsdCA9IEFycmF5KGxlbmd0aCA8IDAgPyAwIDogbGVuZ3RoKTtcblxuICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgcmVzdWx0W2luZGV4XSA9IHBsdWNrKGFycmF5LCBpbmRleCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gb2JqZWN0IGNvbXBvc2VkIGZyb20gYXJyYXlzIG9mIGBrZXlzYCBhbmQgYHZhbHVlc2AuIFByb3ZpZGVcbiAgICAgKiBlaXRoZXIgYSBzaW5nbGUgdHdvIGRpbWVuc2lvbmFsIGFycmF5LCBpLmUuIGBbW2tleTEsIHZhbHVlMV0sIFtrZXkyLCB2YWx1ZTJdXWBcbiAgICAgKiBvciB0d28gYXJyYXlzLCBvbmUgb2YgYGtleXNgIGFuZCBvbmUgb2YgY29ycmVzcG9uZGluZyBgdmFsdWVzYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBhbGlhcyBvYmplY3RcbiAgICAgKiBAY2F0ZWdvcnkgQXJyYXlzXG4gICAgICogQHBhcmFtIHtBcnJheX0ga2V5cyBUaGUgYXJyYXkgb2Yga2V5cy5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBbdmFsdWVzPVtdXSBUaGUgYXJyYXkgb2YgdmFsdWVzLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYW4gb2JqZWN0IGNvbXBvc2VkIG9mIHRoZSBnaXZlbiBrZXlzIGFuZFxuICAgICAqICBjb3JyZXNwb25kaW5nIHZhbHVlcy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy56aXBPYmplY3QoWydmcmVkJywgJ2Jhcm5leSddLCBbMzAsIDQwXSk7XG4gICAgICogLy8gPT4geyAnZnJlZCc6IDMwLCAnYmFybmV5JzogNDAgfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHppcE9iamVjdChrZXlzLCB2YWx1ZXMpIHtcbiAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgIGxlbmd0aCA9IGtleXMgPyBrZXlzLmxlbmd0aCA6IDAsXG4gICAgICAgICAgcmVzdWx0ID0ge307XG5cbiAgICAgIGlmICghdmFsdWVzICYmIGxlbmd0aCAmJiAhaXNBcnJheShrZXlzWzBdKSkge1xuICAgICAgICB2YWx1ZXMgPSBbXTtcbiAgICAgIH1cbiAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgIHZhciBrZXkgPSBrZXlzW2luZGV4XTtcbiAgICAgICAgaWYgKHZhbHVlcykge1xuICAgICAgICAgIHJlc3VsdFtrZXldID0gdmFsdWVzW2luZGV4XTtcbiAgICAgICAgfSBlbHNlIGlmIChrZXkpIHtcbiAgICAgICAgICByZXN1bHRba2V5WzBdXSA9IGtleVsxXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IGV4ZWN1dGVzIGBmdW5jYCwgd2l0aCAgdGhlIGB0aGlzYCBiaW5kaW5nIGFuZFxuICAgICAqIGFyZ3VtZW50cyBvZiB0aGUgY3JlYXRlZCBmdW5jdGlvbiwgb25seSBhZnRlciBiZWluZyBjYWxsZWQgYG5gIHRpbWVzLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBuIFRoZSBudW1iZXIgb2YgdGltZXMgdGhlIGZ1bmN0aW9uIG11c3QgYmUgY2FsbGVkIGJlZm9yZVxuICAgICAqICBgZnVuY2AgaXMgZXhlY3V0ZWQuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gcmVzdHJpY3QuXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgcmVzdHJpY3RlZCBmdW5jdGlvbi5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIHNhdmVzID0gWydwcm9maWxlJywgJ3NldHRpbmdzJ107XG4gICAgICpcbiAgICAgKiB2YXIgZG9uZSA9IF8uYWZ0ZXIoc2F2ZXMubGVuZ3RoLCBmdW5jdGlvbigpIHtcbiAgICAgKiAgIGNvbnNvbGUubG9nKCdEb25lIHNhdmluZyEnKTtcbiAgICAgKiB9KTtcbiAgICAgKlxuICAgICAqIF8uZm9yRWFjaChzYXZlcywgZnVuY3Rpb24odHlwZSkge1xuICAgICAqICAgYXN5bmNTYXZlKHsgJ3R5cGUnOiB0eXBlLCAnY29tcGxldGUnOiBkb25lIH0pO1xuICAgICAqIH0pO1xuICAgICAqIC8vID0+IGxvZ3MgJ0RvbmUgc2F2aW5nIScsIGFmdGVyIGFsbCBzYXZlcyBoYXZlIGNvbXBsZXRlZFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGFmdGVyKG4sIGZ1bmMpIHtcbiAgICAgIGlmICghaXNGdW5jdGlvbihmdW5jKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoLS1uIDwgMSkge1xuICAgICAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLCBpbnZva2VzIGBmdW5jYCB3aXRoIHRoZSBgdGhpc2BcbiAgICAgKiBiaW5kaW5nIG9mIGB0aGlzQXJnYCBhbmQgcHJlcGVuZHMgYW55IGFkZGl0aW9uYWwgYGJpbmRgIGFyZ3VtZW50cyB0byB0aG9zZVxuICAgICAqIHByb3ZpZGVkIHRvIHRoZSBib3VuZCBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvbnNcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBiaW5kLlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgZnVuY2AuXG4gICAgICogQHBhcmFtIHsuLi4qfSBbYXJnXSBBcmd1bWVudHMgdG8gYmUgcGFydGlhbGx5IGFwcGxpZWQuXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYm91bmQgZnVuY3Rpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBmdW5jID0gZnVuY3Rpb24oZ3JlZXRpbmcpIHtcbiAgICAgKiAgIHJldHVybiBncmVldGluZyArICcgJyArIHRoaXMubmFtZTtcbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogZnVuYyA9IF8uYmluZChmdW5jLCB7ICduYW1lJzogJ2ZyZWQnIH0sICdoaScpO1xuICAgICAqIGZ1bmMoKTtcbiAgICAgKiAvLyA9PiAnaGkgZnJlZCdcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBiaW5kKGZ1bmMsIHRoaXNBcmcpIHtcbiAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID4gMlxuICAgICAgICA/IGNyZWF0ZVdyYXBwZXIoZnVuYywgMTcsIHNsaWNlKGFyZ3VtZW50cywgMiksIG51bGwsIHRoaXNBcmcpXG4gICAgICAgIDogY3JlYXRlV3JhcHBlcihmdW5jLCAxLCBudWxsLCBudWxsLCB0aGlzQXJnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBCaW5kcyBtZXRob2RzIG9mIGFuIG9iamVjdCB0byB0aGUgb2JqZWN0IGl0c2VsZiwgb3ZlcndyaXRpbmcgdGhlIGV4aXN0aW5nXG4gICAgICogbWV0aG9kLiBNZXRob2QgbmFtZXMgbWF5IGJlIHNwZWNpZmllZCBhcyBpbmRpdmlkdWFsIGFyZ3VtZW50cyBvciBhcyBhcnJheXNcbiAgICAgKiBvZiBtZXRob2QgbmFtZXMuIElmIG5vIG1ldGhvZCBuYW1lcyBhcmUgcHJvdmlkZWQgYWxsIHRoZSBmdW5jdGlvbiBwcm9wZXJ0aWVzXG4gICAgICogb2YgYG9iamVjdGAgd2lsbCBiZSBib3VuZC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvbnNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gYmluZCBhbmQgYXNzaWduIHRoZSBib3VuZCBtZXRob2RzIHRvLlxuICAgICAqIEBwYXJhbSB7Li4uc3RyaW5nfSBbbWV0aG9kTmFtZV0gVGhlIG9iamVjdCBtZXRob2QgbmFtZXMgdG9cbiAgICAgKiAgYmluZCwgc3BlY2lmaWVkIGFzIGluZGl2aWR1YWwgbWV0aG9kIG5hbWVzIG9yIGFycmF5cyBvZiBtZXRob2QgbmFtZXMuXG4gICAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIHZpZXcgPSB7XG4gICAgICogICAnbGFiZWwnOiAnZG9jcycsXG4gICAgICogICAnb25DbGljayc6IGZ1bmN0aW9uKCkgeyBjb25zb2xlLmxvZygnY2xpY2tlZCAnICsgdGhpcy5sYWJlbCk7IH1cbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogXy5iaW5kQWxsKHZpZXcpO1xuICAgICAqIGpRdWVyeSgnI2RvY3MnKS5vbignY2xpY2snLCB2aWV3Lm9uQ2xpY2spO1xuICAgICAqIC8vID0+IGxvZ3MgJ2NsaWNrZWQgZG9jcycsIHdoZW4gdGhlIGJ1dHRvbiBpcyBjbGlja2VkXG4gICAgICovXG4gICAgZnVuY3Rpb24gYmluZEFsbChvYmplY3QpIHtcbiAgICAgIHZhciBmdW5jcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYmFzZUZsYXR0ZW4oYXJndW1lbnRzLCB0cnVlLCBmYWxzZSwgMSkgOiBmdW5jdGlvbnMob2JqZWN0KSxcbiAgICAgICAgICBpbmRleCA9IC0xLFxuICAgICAgICAgIGxlbmd0aCA9IGZ1bmNzLmxlbmd0aDtcblxuICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgdmFyIGtleSA9IGZ1bmNzW2luZGV4XTtcbiAgICAgICAgb2JqZWN0W2tleV0gPSBjcmVhdGVXcmFwcGVyKG9iamVjdFtrZXldLCAxLCBudWxsLCBudWxsLCBvYmplY3QpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsIGludm9rZXMgdGhlIG1ldGhvZCBhdCBgb2JqZWN0W2tleV1gXG4gICAgICogYW5kIHByZXBlbmRzIGFueSBhZGRpdGlvbmFsIGBiaW5kS2V5YCBhcmd1bWVudHMgdG8gdGhvc2UgcHJvdmlkZWQgdG8gdGhlIGJvdW5kXG4gICAgICogZnVuY3Rpb24uIFRoaXMgbWV0aG9kIGRpZmZlcnMgZnJvbSBgXy5iaW5kYCBieSBhbGxvd2luZyBib3VuZCBmdW5jdGlvbnMgdG9cbiAgICAgKiByZWZlcmVuY2UgbWV0aG9kcyB0aGF0IHdpbGwgYmUgcmVkZWZpbmVkIG9yIGRvbid0IHlldCBleGlzdC5cbiAgICAgKiBTZWUgaHR0cDovL21pY2hhdXguY2EvYXJ0aWNsZXMvbGF6eS1mdW5jdGlvbi1kZWZpbml0aW9uLXBhdHRlcm4uXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgRnVuY3Rpb25zXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRoZSBtZXRob2QgYmVsb25ncyB0by5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIG1ldGhvZC5cbiAgICAgKiBAcGFyYW0gey4uLip9IFthcmddIEFyZ3VtZW50cyB0byBiZSBwYXJ0aWFsbHkgYXBwbGllZC5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBib3VuZCBmdW5jdGlvbi5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIG9iamVjdCA9IHtcbiAgICAgKiAgICduYW1lJzogJ2ZyZWQnLFxuICAgICAqICAgJ2dyZWV0JzogZnVuY3Rpb24oZ3JlZXRpbmcpIHtcbiAgICAgKiAgICAgcmV0dXJuIGdyZWV0aW5nICsgJyAnICsgdGhpcy5uYW1lO1xuICAgICAqICAgfVxuICAgICAqIH07XG4gICAgICpcbiAgICAgKiB2YXIgZnVuYyA9IF8uYmluZEtleShvYmplY3QsICdncmVldCcsICdoaScpO1xuICAgICAqIGZ1bmMoKTtcbiAgICAgKiAvLyA9PiAnaGkgZnJlZCdcbiAgICAgKlxuICAgICAqIG9iamVjdC5ncmVldCA9IGZ1bmN0aW9uKGdyZWV0aW5nKSB7XG4gICAgICogICByZXR1cm4gZ3JlZXRpbmcgKyAneWEgJyArIHRoaXMubmFtZSArICchJztcbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogZnVuYygpO1xuICAgICAqIC8vID0+ICdoaXlhIGZyZWQhJ1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGJpbmRLZXkob2JqZWN0LCBrZXkpIHtcbiAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID4gMlxuICAgICAgICA/IGNyZWF0ZVdyYXBwZXIoa2V5LCAxOSwgc2xpY2UoYXJndW1lbnRzLCAyKSwgbnVsbCwgb2JqZWN0KVxuICAgICAgICA6IGNyZWF0ZVdyYXBwZXIoa2V5LCAzLCBudWxsLCBudWxsLCBvYmplY3QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IGlzIHRoZSBjb21wb3NpdGlvbiBvZiB0aGUgcHJvdmlkZWQgZnVuY3Rpb25zLFxuICAgICAqIHdoZXJlIGVhY2ggZnVuY3Rpb24gY29uc3VtZXMgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgZnVuY3Rpb24gdGhhdCBmb2xsb3dzLlxuICAgICAqIEZvciBleGFtcGxlLCBjb21wb3NpbmcgdGhlIGZ1bmN0aW9ucyBgZigpYCwgYGcoKWAsIGFuZCBgaCgpYCBwcm9kdWNlcyBgZihnKGgoKSkpYC5cbiAgICAgKiBFYWNoIGZ1bmN0aW9uIGlzIGV4ZWN1dGVkIHdpdGggdGhlIGB0aGlzYCBiaW5kaW5nIG9mIHRoZSBjb21wb3NlZCBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvbnNcbiAgICAgKiBAcGFyYW0gey4uLkZ1bmN0aW9ufSBbZnVuY10gRnVuY3Rpb25zIHRvIGNvbXBvc2UuXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgY29tcG9zZWQgZnVuY3Rpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciByZWFsTmFtZU1hcCA9IHtcbiAgICAgKiAgICdwZWJibGVzJzogJ3BlbmVsb3BlJ1xuICAgICAqIH07XG4gICAgICpcbiAgICAgKiB2YXIgZm9ybWF0ID0gZnVuY3Rpb24obmFtZSkge1xuICAgICAqICAgbmFtZSA9IHJlYWxOYW1lTWFwW25hbWUudG9Mb3dlckNhc2UoKV0gfHwgbmFtZTtcbiAgICAgKiAgIHJldHVybiBuYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbmFtZS5zbGljZSgxKS50b0xvd2VyQ2FzZSgpO1xuICAgICAqIH07XG4gICAgICpcbiAgICAgKiB2YXIgZ3JlZXQgPSBmdW5jdGlvbihmb3JtYXR0ZWQpIHtcbiAgICAgKiAgIHJldHVybiAnSGl5YSAnICsgZm9ybWF0dGVkICsgJyEnO1xuICAgICAqIH07XG4gICAgICpcbiAgICAgKiB2YXIgd2VsY29tZSA9IF8uY29tcG9zZShncmVldCwgZm9ybWF0KTtcbiAgICAgKiB3ZWxjb21lKCdwZWJibGVzJyk7XG4gICAgICogLy8gPT4gJ0hpeWEgUGVuZWxvcGUhJ1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNvbXBvc2UoKSB7XG4gICAgICB2YXIgZnVuY3MgPSBhcmd1bWVudHMsXG4gICAgICAgICAgbGVuZ3RoID0gZnVuY3MubGVuZ3RoO1xuXG4gICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgaWYgKCFpc0Z1bmN0aW9uKGZ1bmNzW2xlbmd0aF0pKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAgICAgIGxlbmd0aCA9IGZ1bmNzLmxlbmd0aDtcblxuICAgICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgICBhcmdzID0gW2Z1bmNzW2xlbmd0aF0uYXBwbHkodGhpcywgYXJncyldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhcmdzWzBdO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZnVuY3Rpb24gd2hpY2ggYWNjZXB0cyBvbmUgb3IgbW9yZSBhcmd1bWVudHMgb2YgYGZ1bmNgIHRoYXQgd2hlblxuICAgICAqIGludm9rZWQgZWl0aGVyIGV4ZWN1dGVzIGBmdW5jYCByZXR1cm5pbmcgaXRzIHJlc3VsdCwgaWYgYWxsIGBmdW5jYCBhcmd1bWVudHNcbiAgICAgKiBoYXZlIGJlZW4gcHJvdmlkZWQsIG9yIHJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGFjY2VwdHMgb25lIG9yIG1vcmUgb2YgdGhlXG4gICAgICogcmVtYWluaW5nIGBmdW5jYCBhcmd1bWVudHMsIGFuZCBzbyBvbi4gVGhlIGFyaXR5IG9mIGBmdW5jYCBjYW4gYmUgc3BlY2lmaWVkXG4gICAgICogaWYgYGZ1bmMubGVuZ3RoYCBpcyBub3Qgc3VmZmljaWVudC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvbnNcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjdXJyeS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW2FyaXR5PWZ1bmMubGVuZ3RoXSBUaGUgYXJpdHkgb2YgYGZ1bmNgLlxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGN1cnJpZWQgZnVuY3Rpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBjdXJyaWVkID0gXy5jdXJyeShmdW5jdGlvbihhLCBiLCBjKSB7XG4gICAgICogICBjb25zb2xlLmxvZyhhICsgYiArIGMpO1xuICAgICAqIH0pO1xuICAgICAqXG4gICAgICogY3VycmllZCgxKSgyKSgzKTtcbiAgICAgKiAvLyA9PiA2XG4gICAgICpcbiAgICAgKiBjdXJyaWVkKDEsIDIpKDMpO1xuICAgICAqIC8vID0+IDZcbiAgICAgKlxuICAgICAqIGN1cnJpZWQoMSwgMiwgMyk7XG4gICAgICogLy8gPT4gNlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGN1cnJ5KGZ1bmMsIGFyaXR5KSB7XG4gICAgICBhcml0eSA9IHR5cGVvZiBhcml0eSA9PSAnbnVtYmVyJyA/IGFyaXR5IDogKCthcml0eSB8fCBmdW5jLmxlbmd0aCk7XG4gICAgICByZXR1cm4gY3JlYXRlV3JhcHBlcihmdW5jLCA0LCBudWxsLCBudWxsLCBudWxsLCBhcml0eSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBkZWxheSB0aGUgZXhlY3V0aW9uIG9mIGBmdW5jYCB1bnRpbCBhZnRlclxuICAgICAqIGB3YWl0YCBtaWxsaXNlY29uZHMgaGF2ZSBlbGFwc2VkIHNpbmNlIHRoZSBsYXN0IHRpbWUgaXQgd2FzIGludm9rZWQuXG4gICAgICogUHJvdmlkZSBhbiBvcHRpb25zIG9iamVjdCB0byBpbmRpY2F0ZSB0aGF0IGBmdW5jYCBzaG91bGQgYmUgaW52b2tlZCBvblxuICAgICAqIHRoZSBsZWFkaW5nIGFuZC9vciB0cmFpbGluZyBlZGdlIG9mIHRoZSBgd2FpdGAgdGltZW91dC4gU3Vic2VxdWVudCBjYWxsc1xuICAgICAqIHRvIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gd2lsbCByZXR1cm4gdGhlIHJlc3VsdCBvZiB0aGUgbGFzdCBgZnVuY2AgY2FsbC5cbiAgICAgKlxuICAgICAqIE5vdGU6IElmIGBsZWFkaW5nYCBhbmQgYHRyYWlsaW5nYCBvcHRpb25zIGFyZSBgdHJ1ZWAgYGZ1bmNgIHdpbGwgYmUgY2FsbGVkXG4gICAgICogb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQgb25seSBpZiB0aGUgdGhlIGRlYm91bmNlZCBmdW5jdGlvbiBpc1xuICAgICAqIGludm9rZWQgbW9yZSB0aGFuIG9uY2UgZHVyaW5nIHRoZSBgd2FpdGAgdGltZW91dC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvbnNcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBkZWJvdW5jZS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd2FpdCBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byBkZWxheS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFRoZSBvcHRpb25zIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxlYWRpbmc9ZmFsc2VdIFNwZWNpZnkgZXhlY3V0aW9uIG9uIHRoZSBsZWFkaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1heFdhaXRdIFRoZSBtYXhpbXVtIHRpbWUgYGZ1bmNgIGlzIGFsbG93ZWQgdG8gYmUgZGVsYXllZCBiZWZvcmUgaXQncyBjYWxsZWQuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50cmFpbGluZz10cnVlXSBTcGVjaWZ5IGV4ZWN1dGlvbiBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBkZWJvdW5jZWQgZnVuY3Rpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIC8vIGF2b2lkIGNvc3RseSBjYWxjdWxhdGlvbnMgd2hpbGUgdGhlIHdpbmRvdyBzaXplIGlzIGluIGZsdXhcbiAgICAgKiB2YXIgbGF6eUxheW91dCA9IF8uZGVib3VuY2UoY2FsY3VsYXRlTGF5b3V0LCAxNTApO1xuICAgICAqIGpRdWVyeSh3aW5kb3cpLm9uKCdyZXNpemUnLCBsYXp5TGF5b3V0KTtcbiAgICAgKlxuICAgICAqIC8vIGV4ZWN1dGUgYHNlbmRNYWlsYCB3aGVuIHRoZSBjbGljayBldmVudCBpcyBmaXJlZCwgZGVib3VuY2luZyBzdWJzZXF1ZW50IGNhbGxzXG4gICAgICogalF1ZXJ5KCcjcG9zdGJveCcpLm9uKCdjbGljaycsIF8uZGVib3VuY2Uoc2VuZE1haWwsIDMwMCwge1xuICAgICAqICAgJ2xlYWRpbmcnOiB0cnVlLFxuICAgICAqICAgJ3RyYWlsaW5nJzogZmFsc2VcbiAgICAgKiB9KTtcbiAgICAgKlxuICAgICAqIC8vIGVuc3VyZSBgYmF0Y2hMb2dgIGlzIGV4ZWN1dGVkIG9uY2UgYWZ0ZXIgMSBzZWNvbmQgb2YgZGVib3VuY2VkIGNhbGxzXG4gICAgICogdmFyIHNvdXJjZSA9IG5ldyBFdmVudFNvdXJjZSgnL3N0cmVhbScpO1xuICAgICAqIHNvdXJjZS5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgXy5kZWJvdW5jZShiYXRjaExvZywgMjUwLCB7XG4gICAgICogICAnbWF4V2FpdCc6IDEwMDBcbiAgICAgKiB9LCBmYWxzZSk7XG4gICAgICovXG4gICAgZnVuY3Rpb24gZGVib3VuY2UoZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICAgICAgdmFyIGFyZ3MsXG4gICAgICAgICAgbWF4VGltZW91dElkLFxuICAgICAgICAgIHJlc3VsdCxcbiAgICAgICAgICBzdGFtcCxcbiAgICAgICAgICB0aGlzQXJnLFxuICAgICAgICAgIHRpbWVvdXRJZCxcbiAgICAgICAgICB0cmFpbGluZ0NhbGwsXG4gICAgICAgICAgbGFzdENhbGxlZCA9IDAsXG4gICAgICAgICAgbWF4V2FpdCA9IGZhbHNlLFxuICAgICAgICAgIHRyYWlsaW5nID0gdHJ1ZTtcblxuICAgICAgaWYgKCFpc0Z1bmN0aW9uKGZ1bmMpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3I7XG4gICAgICB9XG4gICAgICB3YWl0ID0gbmF0aXZlTWF4KDAsIHdhaXQpIHx8IDA7XG4gICAgICBpZiAob3B0aW9ucyA9PT0gdHJ1ZSkge1xuICAgICAgICB2YXIgbGVhZGluZyA9IHRydWU7XG4gICAgICAgIHRyYWlsaW5nID0gZmFsc2U7XG4gICAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KG9wdGlvbnMpKSB7XG4gICAgICAgIGxlYWRpbmcgPSBvcHRpb25zLmxlYWRpbmc7XG4gICAgICAgIG1heFdhaXQgPSAnbWF4V2FpdCcgaW4gb3B0aW9ucyAmJiAobmF0aXZlTWF4KHdhaXQsIG9wdGlvbnMubWF4V2FpdCkgfHwgMCk7XG4gICAgICAgIHRyYWlsaW5nID0gJ3RyYWlsaW5nJyBpbiBvcHRpb25zID8gb3B0aW9ucy50cmFpbGluZyA6IHRyYWlsaW5nO1xuICAgICAgfVxuICAgICAgdmFyIGRlbGF5ZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlbWFpbmluZyA9IHdhaXQgLSAobm93KCkgLSBzdGFtcCk7XG4gICAgICAgIGlmIChyZW1haW5pbmcgPD0gMCkge1xuICAgICAgICAgIGlmIChtYXhUaW1lb3V0SWQpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChtYXhUaW1lb3V0SWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgaXNDYWxsZWQgPSB0cmFpbGluZ0NhbGw7XG4gICAgICAgICAgbWF4VGltZW91dElkID0gdGltZW91dElkID0gdHJhaWxpbmdDYWxsID0gdW5kZWZpbmVkO1xuICAgICAgICAgIGlmIChpc0NhbGxlZCkge1xuICAgICAgICAgICAgbGFzdENhbGxlZCA9IG5vdygpO1xuICAgICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgICAgICAgICAgIGlmICghdGltZW91dElkICYmICFtYXhUaW1lb3V0SWQpIHtcbiAgICAgICAgICAgICAgYXJncyA9IHRoaXNBcmcgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KGRlbGF5ZWQsIHJlbWFpbmluZyk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHZhciBtYXhEZWxheWVkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aW1lb3V0SWQpIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgfVxuICAgICAgICBtYXhUaW1lb3V0SWQgPSB0aW1lb3V0SWQgPSB0cmFpbGluZ0NhbGwgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0cmFpbGluZyB8fCAobWF4V2FpdCAhPT0gd2FpdCkpIHtcbiAgICAgICAgICBsYXN0Q2FsbGVkID0gbm93KCk7XG4gICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgICAgICAgICBpZiAoIXRpbWVvdXRJZCAmJiAhbWF4VGltZW91dElkKSB7XG4gICAgICAgICAgICBhcmdzID0gdGhpc0FyZyA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgIHN0YW1wID0gbm93KCk7XG4gICAgICAgIHRoaXNBcmcgPSB0aGlzO1xuICAgICAgICB0cmFpbGluZ0NhbGwgPSB0cmFpbGluZyAmJiAodGltZW91dElkIHx8ICFsZWFkaW5nKTtcblxuICAgICAgICBpZiAobWF4V2FpdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICB2YXIgbGVhZGluZ0NhbGwgPSBsZWFkaW5nICYmICF0aW1lb3V0SWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKCFtYXhUaW1lb3V0SWQgJiYgIWxlYWRpbmcpIHtcbiAgICAgICAgICAgIGxhc3RDYWxsZWQgPSBzdGFtcDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIHJlbWFpbmluZyA9IG1heFdhaXQgLSAoc3RhbXAgLSBsYXN0Q2FsbGVkKSxcbiAgICAgICAgICAgICAgaXNDYWxsZWQgPSByZW1haW5pbmcgPD0gMDtcblxuICAgICAgICAgIGlmIChpc0NhbGxlZCkge1xuICAgICAgICAgICAgaWYgKG1heFRpbWVvdXRJZCkge1xuICAgICAgICAgICAgICBtYXhUaW1lb3V0SWQgPSBjbGVhclRpbWVvdXQobWF4VGltZW91dElkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxhc3RDYWxsZWQgPSBzdGFtcDtcbiAgICAgICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpc0FyZywgYXJncyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgKCFtYXhUaW1lb3V0SWQpIHtcbiAgICAgICAgICAgIG1heFRpbWVvdXRJZCA9IHNldFRpbWVvdXQobWF4RGVsYXllZCwgcmVtYWluaW5nKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQ2FsbGVkICYmIHRpbWVvdXRJZCkge1xuICAgICAgICAgIHRpbWVvdXRJZCA9IGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCF0aW1lb3V0SWQgJiYgd2FpdCAhPT0gbWF4V2FpdCkge1xuICAgICAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZGVsYXllZCwgd2FpdCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlYWRpbmdDYWxsKSB7XG4gICAgICAgICAgaXNDYWxsZWQgPSB0cnVlO1xuICAgICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpc0FyZywgYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQ2FsbGVkICYmICF0aW1lb3V0SWQgJiYgIW1heFRpbWVvdXRJZCkge1xuICAgICAgICAgIGFyZ3MgPSB0aGlzQXJnID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZWZlcnMgZXhlY3V0aW5nIHRoZSBgZnVuY2AgZnVuY3Rpb24gdW50aWwgdGhlIGN1cnJlbnQgY2FsbCBzdGFjayBoYXMgY2xlYXJlZC5cbiAgICAgKiBBZGRpdGlvbmFsIGFyZ3VtZW50cyB3aWxsIGJlIHByb3ZpZGVkIHRvIGBmdW5jYCB3aGVuIGl0IGlzIGludm9rZWQuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgRnVuY3Rpb25zXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gZGVmZXIuXG4gICAgICogQHBhcmFtIHsuLi4qfSBbYXJnXSBBcmd1bWVudHMgdG8gaW52b2tlIHRoZSBmdW5jdGlvbiB3aXRoLlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIHRpbWVyIGlkLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmRlZmVyKGZ1bmN0aW9uKHRleHQpIHsgY29uc29sZS5sb2codGV4dCk7IH0sICdkZWZlcnJlZCcpO1xuICAgICAqIC8vIGxvZ3MgJ2RlZmVycmVkJyBhZnRlciBvbmUgb3IgbW9yZSBtaWxsaXNlY29uZHNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBkZWZlcihmdW5jKSB7XG4gICAgICBpZiAoIWlzRnVuY3Rpb24oZnVuYykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcjtcbiAgICAgIH1cbiAgICAgIHZhciBhcmdzID0gc2xpY2UoYXJndW1lbnRzLCAxKTtcbiAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBmdW5jLmFwcGx5KHVuZGVmaW5lZCwgYXJncyk7IH0sIDEpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGVzIHRoZSBgZnVuY2AgZnVuY3Rpb24gYWZ0ZXIgYHdhaXRgIG1pbGxpc2Vjb25kcy4gQWRkaXRpb25hbCBhcmd1bWVudHNcbiAgICAgKiB3aWxsIGJlIHByb3ZpZGVkIHRvIGBmdW5jYCB3aGVuIGl0IGlzIGludm9rZWQuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgRnVuY3Rpb25zXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gZGVsYXkuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdhaXQgVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gZGVsYXkgZXhlY3V0aW9uLlxuICAgICAqIEBwYXJhbSB7Li4uKn0gW2FyZ10gQXJndW1lbnRzIHRvIGludm9rZSB0aGUgZnVuY3Rpb24gd2l0aC5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSB0aW1lciBpZC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5kZWxheShmdW5jdGlvbih0ZXh0KSB7IGNvbnNvbGUubG9nKHRleHQpOyB9LCAxMDAwLCAnbGF0ZXInKTtcbiAgICAgKiAvLyA9PiBsb2dzICdsYXRlcicgYWZ0ZXIgb25lIHNlY29uZFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGRlbGF5KGZ1bmMsIHdhaXQpIHtcbiAgICAgIGlmICghaXNGdW5jdGlvbihmdW5jKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yO1xuICAgICAgfVxuICAgICAgdmFyIGFyZ3MgPSBzbGljZShhcmd1bWVudHMsIDIpO1xuICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGZ1bmMuYXBwbHkodW5kZWZpbmVkLCBhcmdzKTsgfSwgd2FpdCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgbWVtb2l6ZXMgdGhlIHJlc3VsdCBvZiBgZnVuY2AuIElmIGByZXNvbHZlcmAgaXNcbiAgICAgKiBwcm92aWRlZCBpdCB3aWxsIGJlIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBjYWNoZSBrZXkgZm9yIHN0b3JpbmcgdGhlIHJlc3VsdFxuICAgICAqIGJhc2VkIG9uIHRoZSBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlIG1lbW9pemVkIGZ1bmN0aW9uLiBCeSBkZWZhdWx0LCB0aGVcbiAgICAgKiBmaXJzdCBhcmd1bWVudCBwcm92aWRlZCB0byB0aGUgbWVtb2l6ZWQgZnVuY3Rpb24gaXMgdXNlZCBhcyB0aGUgY2FjaGUga2V5LlxuICAgICAqIFRoZSBgZnVuY2AgaXMgZXhlY3V0ZWQgd2l0aCB0aGUgYHRoaXNgIGJpbmRpbmcgb2YgdGhlIG1lbW9pemVkIGZ1bmN0aW9uLlxuICAgICAqIFRoZSByZXN1bHQgY2FjaGUgaXMgZXhwb3NlZCBhcyB0aGUgYGNhY2hlYCBwcm9wZXJ0eSBvbiB0aGUgbWVtb2l6ZWQgZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgRnVuY3Rpb25zXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gaGF2ZSBpdHMgb3V0cHV0IG1lbW9pemVkLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtyZXNvbHZlcl0gQSBmdW5jdGlvbiB1c2VkIHRvIHJlc29sdmUgdGhlIGNhY2hlIGtleS5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBtZW1vaXppbmcgZnVuY3Rpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBmaWJvbmFjY2kgPSBfLm1lbW9pemUoZnVuY3Rpb24obikge1xuICAgICAqICAgcmV0dXJuIG4gPCAyID8gbiA6IGZpYm9uYWNjaShuIC0gMSkgKyBmaWJvbmFjY2kobiAtIDIpO1xuICAgICAqIH0pO1xuICAgICAqXG4gICAgICogZmlib25hY2NpKDkpXG4gICAgICogLy8gPT4gMzRcbiAgICAgKlxuICAgICAqIHZhciBkYXRhID0ge1xuICAgICAqICAgJ2ZyZWQnOiB7ICduYW1lJzogJ2ZyZWQnLCAnYWdlJzogNDAgfSxcbiAgICAgKiAgICdwZWJibGVzJzogeyAnbmFtZSc6ICdwZWJibGVzJywgJ2FnZSc6IDEgfVxuICAgICAqIH07XG4gICAgICpcbiAgICAgKiAvLyBtb2RpZnlpbmcgdGhlIHJlc3VsdCBjYWNoZVxuICAgICAqIHZhciBnZXQgPSBfLm1lbW9pemUoZnVuY3Rpb24obmFtZSkgeyByZXR1cm4gZGF0YVtuYW1lXTsgfSwgXy5pZGVudGl0eSk7XG4gICAgICogZ2V0KCdwZWJibGVzJyk7XG4gICAgICogLy8gPT4geyAnbmFtZSc6ICdwZWJibGVzJywgJ2FnZSc6IDEgfVxuICAgICAqXG4gICAgICogZ2V0LmNhY2hlLnBlYmJsZXMubmFtZSA9ICdwZW5lbG9wZSc7XG4gICAgICogZ2V0KCdwZWJibGVzJyk7XG4gICAgICogLy8gPT4geyAnbmFtZSc6ICdwZW5lbG9wZScsICdhZ2UnOiAxIH1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBtZW1vaXplKGZ1bmMsIHJlc29sdmVyKSB7XG4gICAgICBpZiAoIWlzRnVuY3Rpb24oZnVuYykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcjtcbiAgICAgIH1cbiAgICAgIHZhciBtZW1vaXplZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2FjaGUgPSBtZW1vaXplZC5jYWNoZSxcbiAgICAgICAgICAgIGtleSA9IHJlc29sdmVyID8gcmVzb2x2ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSA6IGtleVByZWZpeCArIGFyZ3VtZW50c1swXTtcblxuICAgICAgICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChjYWNoZSwga2V5KVxuICAgICAgICAgID8gY2FjaGVba2V5XVxuICAgICAgICAgIDogKGNhY2hlW2tleV0gPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICAgICAgfVxuICAgICAgbWVtb2l6ZWQuY2FjaGUgPSB7fTtcbiAgICAgIHJldHVybiBtZW1vaXplZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCBpcyByZXN0cmljdGVkIHRvIGV4ZWN1dGUgYGZ1bmNgIG9uY2UuIFJlcGVhdCBjYWxscyB0b1xuICAgICAqIHRoZSBmdW5jdGlvbiB3aWxsIHJldHVybiB0aGUgdmFsdWUgb2YgdGhlIGZpcnN0IGNhbGwuIFRoZSBgZnVuY2AgaXMgZXhlY3V0ZWRcbiAgICAgKiB3aXRoIHRoZSBgdGhpc2AgYmluZGluZyBvZiB0aGUgY3JlYXRlZCBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvbnNcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byByZXN0cmljdC5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyByZXN0cmljdGVkIGZ1bmN0aW9uLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgaW5pdGlhbGl6ZSA9IF8ub25jZShjcmVhdGVBcHBsaWNhdGlvbik7XG4gICAgICogaW5pdGlhbGl6ZSgpO1xuICAgICAqIGluaXRpYWxpemUoKTtcbiAgICAgKiAvLyBgaW5pdGlhbGl6ZWAgZXhlY3V0ZXMgYGNyZWF0ZUFwcGxpY2F0aW9uYCBvbmNlXG4gICAgICovXG4gICAgZnVuY3Rpb24gb25jZShmdW5jKSB7XG4gICAgICB2YXIgcmFuLFxuICAgICAgICAgIHJlc3VsdDtcblxuICAgICAgaWYgKCFpc0Z1bmN0aW9uKGZ1bmMpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3I7XG4gICAgICB9XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChyYW4pIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIHJhbiA9IHRydWU7XG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAvLyBjbGVhciB0aGUgYGZ1bmNgIHZhcmlhYmxlIHNvIHRoZSBmdW5jdGlvbiBtYXkgYmUgZ2FyYmFnZSBjb2xsZWN0ZWRcbiAgICAgICAgZnVuYyA9IG51bGw7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCwgaW52b2tlcyBgZnVuY2Agd2l0aCBhbnkgYWRkaXRpb25hbFxuICAgICAqIGBwYXJ0aWFsYCBhcmd1bWVudHMgcHJlcGVuZGVkIHRvIHRob3NlIHByb3ZpZGVkIHRvIHRoZSBuZXcgZnVuY3Rpb24uIFRoaXNcbiAgICAgKiBtZXRob2QgaXMgc2ltaWxhciB0byBgXy5iaW5kYCBleGNlcHQgaXQgZG9lcyAqKm5vdCoqIGFsdGVyIHRoZSBgdGhpc2AgYmluZGluZy5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvbnNcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBwYXJ0aWFsbHkgYXBwbHkgYXJndW1lbnRzIHRvLlxuICAgICAqIEBwYXJhbSB7Li4uKn0gW2FyZ10gQXJndW1lbnRzIHRvIGJlIHBhcnRpYWxseSBhcHBsaWVkLlxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IHBhcnRpYWxseSBhcHBsaWVkIGZ1bmN0aW9uLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgZ3JlZXQgPSBmdW5jdGlvbihncmVldGluZywgbmFtZSkgeyByZXR1cm4gZ3JlZXRpbmcgKyAnICcgKyBuYW1lOyB9O1xuICAgICAqIHZhciBoaSA9IF8ucGFydGlhbChncmVldCwgJ2hpJyk7XG4gICAgICogaGkoJ2ZyZWQnKTtcbiAgICAgKiAvLyA9PiAnaGkgZnJlZCdcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBwYXJ0aWFsKGZ1bmMpIHtcbiAgICAgIHJldHVybiBjcmVhdGVXcmFwcGVyKGZ1bmMsIDE2LCBzbGljZShhcmd1bWVudHMsIDEpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBsaWtlIGBfLnBhcnRpYWxgIGV4Y2VwdCB0aGF0IGBwYXJ0aWFsYCBhcmd1bWVudHMgYXJlXG4gICAgICogYXBwZW5kZWQgdG8gdGhvc2UgcHJvdmlkZWQgdG8gdGhlIG5ldyBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvbnNcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBwYXJ0aWFsbHkgYXBwbHkgYXJndW1lbnRzIHRvLlxuICAgICAqIEBwYXJhbSB7Li4uKn0gW2FyZ10gQXJndW1lbnRzIHRvIGJlIHBhcnRpYWxseSBhcHBsaWVkLlxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IHBhcnRpYWxseSBhcHBsaWVkIGZ1bmN0aW9uLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgZGVmYXVsdHNEZWVwID0gXy5wYXJ0aWFsUmlnaHQoXy5tZXJnZSwgXy5kZWZhdWx0cyk7XG4gICAgICpcbiAgICAgKiB2YXIgb3B0aW9ucyA9IHtcbiAgICAgKiAgICd2YXJpYWJsZSc6ICdkYXRhJyxcbiAgICAgKiAgICdpbXBvcnRzJzogeyAnanEnOiAkIH1cbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogZGVmYXVsdHNEZWVwKG9wdGlvbnMsIF8udGVtcGxhdGVTZXR0aW5ncyk7XG4gICAgICpcbiAgICAgKiBvcHRpb25zLnZhcmlhYmxlXG4gICAgICogLy8gPT4gJ2RhdGEnXG4gICAgICpcbiAgICAgKiBvcHRpb25zLmltcG9ydHNcbiAgICAgKiAvLyA9PiB7ICdfJzogXywgJ2pxJzogJCB9XG4gICAgICovXG4gICAgZnVuY3Rpb24gcGFydGlhbFJpZ2h0KGZ1bmMpIHtcbiAgICAgIHJldHVybiBjcmVhdGVXcmFwcGVyKGZ1bmMsIDMyLCBudWxsLCBzbGljZShhcmd1bWVudHMsIDEpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBleGVjdXRlZCwgd2lsbCBvbmx5IGNhbGwgdGhlIGBmdW5jYCBmdW5jdGlvblxuICAgICAqIGF0IG1vc3Qgb25jZSBwZXIgZXZlcnkgYHdhaXRgIG1pbGxpc2Vjb25kcy4gUHJvdmlkZSBhbiBvcHRpb25zIG9iamVjdCB0b1xuICAgICAqIGluZGljYXRlIHRoYXQgYGZ1bmNgIHNob3VsZCBiZSBpbnZva2VkIG9uIHRoZSBsZWFkaW5nIGFuZC9vciB0cmFpbGluZyBlZGdlXG4gICAgICogb2YgdGhlIGB3YWl0YCB0aW1lb3V0LiBTdWJzZXF1ZW50IGNhbGxzIHRvIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gd2lsbFxuICAgICAqIHJldHVybiB0aGUgcmVzdWx0IG9mIHRoZSBsYXN0IGBmdW5jYCBjYWxsLlxuICAgICAqXG4gICAgICogTm90ZTogSWYgYGxlYWRpbmdgIGFuZCBgdHJhaWxpbmdgIG9wdGlvbnMgYXJlIGB0cnVlYCBgZnVuY2Agd2lsbCBiZSBjYWxsZWRcbiAgICAgKiBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dCBvbmx5IGlmIHRoZSB0aGUgdGhyb3R0bGVkIGZ1bmN0aW9uIGlzXG4gICAgICogaW52b2tlZCBtb3JlIHRoYW4gb25jZSBkdXJpbmcgdGhlIGB3YWl0YCB0aW1lb3V0LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uc1xuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHRocm90dGxlLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB3YWl0IFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIHRocm90dGxlIGV4ZWN1dGlvbnMgdG8uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5sZWFkaW5nPXRydWVdIFNwZWNpZnkgZXhlY3V0aW9uIG9uIHRoZSBsZWFkaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50cmFpbGluZz10cnVlXSBTcGVjaWZ5IGV4ZWN1dGlvbiBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyB0aHJvdHRsZWQgZnVuY3Rpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIC8vIGF2b2lkIGV4Y2Vzc2l2ZWx5IHVwZGF0aW5nIHRoZSBwb3NpdGlvbiB3aGlsZSBzY3JvbGxpbmdcbiAgICAgKiB2YXIgdGhyb3R0bGVkID0gXy50aHJvdHRsZSh1cGRhdGVQb3NpdGlvbiwgMTAwKTtcbiAgICAgKiBqUXVlcnkod2luZG93KS5vbignc2Nyb2xsJywgdGhyb3R0bGVkKTtcbiAgICAgKlxuICAgICAqIC8vIGV4ZWN1dGUgYHJlbmV3VG9rZW5gIHdoZW4gdGhlIGNsaWNrIGV2ZW50IGlzIGZpcmVkLCBidXQgbm90IG1vcmUgdGhhbiBvbmNlIGV2ZXJ5IDUgbWludXRlc1xuICAgICAqIGpRdWVyeSgnLmludGVyYWN0aXZlJykub24oJ2NsaWNrJywgXy50aHJvdHRsZShyZW5ld1Rva2VuLCAzMDAwMDAsIHtcbiAgICAgKiAgICd0cmFpbGluZyc6IGZhbHNlXG4gICAgICogfSkpO1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRocm90dGxlKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBsZWFkaW5nID0gdHJ1ZSxcbiAgICAgICAgICB0cmFpbGluZyA9IHRydWU7XG5cbiAgICAgIGlmICghaXNGdW5jdGlvbihmdW5jKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yO1xuICAgICAgfVxuICAgICAgaWYgKG9wdGlvbnMgPT09IGZhbHNlKSB7XG4gICAgICAgIGxlYWRpbmcgPSBmYWxzZTtcbiAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3Qob3B0aW9ucykpIHtcbiAgICAgICAgbGVhZGluZyA9ICdsZWFkaW5nJyBpbiBvcHRpb25zID8gb3B0aW9ucy5sZWFkaW5nIDogbGVhZGluZztcbiAgICAgICAgdHJhaWxpbmcgPSAndHJhaWxpbmcnIGluIG9wdGlvbnMgPyBvcHRpb25zLnRyYWlsaW5nIDogdHJhaWxpbmc7XG4gICAgICB9XG4gICAgICBkZWJvdW5jZU9wdGlvbnMubGVhZGluZyA9IGxlYWRpbmc7XG4gICAgICBkZWJvdW5jZU9wdGlvbnMubWF4V2FpdCA9IHdhaXQ7XG4gICAgICBkZWJvdW5jZU9wdGlvbnMudHJhaWxpbmcgPSB0cmFpbGluZztcblxuICAgICAgcmV0dXJuIGRlYm91bmNlKGZ1bmMsIHdhaXQsIGRlYm91bmNlT3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgcHJvdmlkZXMgYHZhbHVlYCB0byB0aGUgd3JhcHBlciBmdW5jdGlvbiBhcyBpdHNcbiAgICAgKiBmaXJzdCBhcmd1bWVudC4gQWRkaXRpb25hbCBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlIGZ1bmN0aW9uIGFyZSBhcHBlbmRlZFxuICAgICAqIHRvIHRob3NlIHByb3ZpZGVkIHRvIHRoZSB3cmFwcGVyIGZ1bmN0aW9uLiBUaGUgd3JhcHBlciBpcyBleGVjdXRlZCB3aXRoXG4gICAgICogdGhlIGB0aGlzYCBiaW5kaW5nIG9mIHRoZSBjcmVhdGVkIGZ1bmN0aW9uLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uc1xuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHdyYXAuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gd3JhcHBlciBUaGUgd3JhcHBlciBmdW5jdGlvbi5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIHAgPSBfLndyYXAoXy5lc2NhcGUsIGZ1bmN0aW9uKGZ1bmMsIHRleHQpIHtcbiAgICAgKiAgIHJldHVybiAnPHA+JyArIGZ1bmModGV4dCkgKyAnPC9wPic7XG4gICAgICogfSk7XG4gICAgICpcbiAgICAgKiBwKCdGcmVkLCBXaWxtYSwgJiBQZWJibGVzJyk7XG4gICAgICogLy8gPT4gJzxwPkZyZWQsIFdpbG1hLCAmYW1wOyBQZWJibGVzPC9wPidcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB3cmFwKHZhbHVlLCB3cmFwcGVyKSB7XG4gICAgICByZXR1cm4gY3JlYXRlV3JhcHBlcih3cmFwcGVyLCAxNiwgW3ZhbHVlXSk7XG4gICAgfVxuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGB2YWx1ZWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcmV0dXJuIGZyb20gdGhlIG5ldyBmdW5jdGlvbi5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIG9iamVjdCA9IHsgJ25hbWUnOiAnZnJlZCcgfTtcbiAgICAgKiB2YXIgZ2V0dGVyID0gXy5jb25zdGFudChvYmplY3QpO1xuICAgICAqIGdldHRlcigpID09PSBvYmplY3Q7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNvbnN0YW50KHZhbHVlKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJvZHVjZXMgYSBjYWxsYmFjayBib3VuZCB0byBhbiBvcHRpb25hbCBgdGhpc0FyZ2AuIElmIGBmdW5jYCBpcyBhIHByb3BlcnR5XG4gICAgICogbmFtZSB0aGUgY3JlYXRlZCBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgZm9yIGEgZ2l2ZW4gZWxlbWVudC5cbiAgICAgKiBJZiBgZnVuY2AgaXMgYW4gb2JqZWN0IHRoZSBjcmVhdGVkIGNhbGxiYWNrIHdpbGwgcmV0dXJuIGB0cnVlYCBmb3IgZWxlbWVudHNcbiAgICAgKiB0aGF0IGNvbnRhaW4gdGhlIGVxdWl2YWxlbnQgb2JqZWN0IHByb3BlcnRpZXMsIG90aGVyd2lzZSBpdCB3aWxsIHJldHVybiBgZmFsc2VgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IFV0aWxpdGllc1xuICAgICAqIEBwYXJhbSB7Kn0gW2Z1bmM9aWRlbnRpdHldIFRoZSB2YWx1ZSB0byBjb252ZXJ0IHRvIGEgY2FsbGJhY2suXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIHRoZSBjcmVhdGVkIGNhbGxiYWNrLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbYXJnQ291bnRdIFRoZSBudW1iZXIgb2YgYXJndW1lbnRzIHRoZSBjYWxsYmFjayBhY2NlcHRzLlxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyBhIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgJ2FnZSc6IDM2IH0sXG4gICAgICogICB7ICduYW1lJzogJ2ZyZWQnLCAgICdhZ2UnOiA0MCB9XG4gICAgICogXTtcbiAgICAgKlxuICAgICAqIC8vIHdyYXAgdG8gY3JlYXRlIGN1c3RvbSBjYWxsYmFjayBzaG9ydGhhbmRzXG4gICAgICogXy5jcmVhdGVDYWxsYmFjayA9IF8ud3JhcChfLmNyZWF0ZUNhbGxiYWNrLCBmdW5jdGlvbihmdW5jLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAqICAgdmFyIG1hdGNoID0gL14oLis/KV9fKFtnbF10KSguKykkLy5leGVjKGNhbGxiYWNrKTtcbiAgICAgKiAgIHJldHVybiAhbWF0Y2ggPyBmdW5jKGNhbGxiYWNrLCB0aGlzQXJnKSA6IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgICAqICAgICByZXR1cm4gbWF0Y2hbMl0gPT0gJ2d0JyA/IG9iamVjdFttYXRjaFsxXV0gPiBtYXRjaFszXSA6IG9iamVjdFttYXRjaFsxXV0gPCBtYXRjaFszXTtcbiAgICAgKiAgIH07XG4gICAgICogfSk7XG4gICAgICpcbiAgICAgKiBfLmZpbHRlcihjaGFyYWN0ZXJzLCAnYWdlX19ndDM4Jyk7XG4gICAgICogLy8gPT4gW3sgJ25hbWUnOiAnZnJlZCcsICdhZ2UnOiA0MCB9XVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNyZWF0ZUNhbGxiYWNrKGZ1bmMsIHRoaXNBcmcsIGFyZ0NvdW50KSB7XG4gICAgICB2YXIgdHlwZSA9IHR5cGVvZiBmdW5jO1xuICAgICAgaWYgKGZ1bmMgPT0gbnVsbCB8fCB0eXBlID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIGJhc2VDcmVhdGVDYWxsYmFjayhmdW5jLCB0aGlzQXJnLCBhcmdDb3VudCk7XG4gICAgICB9XG4gICAgICAvLyBoYW5kbGUgXCJfLnBsdWNrXCIgc3R5bGUgY2FsbGJhY2sgc2hvcnRoYW5kc1xuICAgICAgaWYgKHR5cGUgIT0gJ29iamVjdCcpIHtcbiAgICAgICAgcmV0dXJuIHByb3BlcnR5KGZ1bmMpO1xuICAgICAgfVxuICAgICAgdmFyIHByb3BzID0ga2V5cyhmdW5jKSxcbiAgICAgICAgICBrZXkgPSBwcm9wc1swXSxcbiAgICAgICAgICBhID0gZnVuY1trZXldO1xuXG4gICAgICAvLyBoYW5kbGUgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2sgc2hvcnRoYW5kc1xuICAgICAgaWYgKHByb3BzLmxlbmd0aCA9PSAxICYmIGEgPT09IGEgJiYgIWlzT2JqZWN0KGEpKSB7XG4gICAgICAgIC8vIGZhc3QgcGF0aCB0aGUgY29tbW9uIGNhc2Ugb2YgcHJvdmlkaW5nIGFuIG9iamVjdCB3aXRoIGEgc2luZ2xlXG4gICAgICAgIC8vIHByb3BlcnR5IGNvbnRhaW5pbmcgYSBwcmltaXRpdmUgdmFsdWVcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCkge1xuICAgICAgICAgIHZhciBiID0gb2JqZWN0W2tleV07XG4gICAgICAgICAgcmV0dXJuIGEgPT09IGIgJiYgKGEgIT09IDAgfHwgKDEgLyBhID09IDEgLyBiKSk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgICAgIHZhciBsZW5ndGggPSBwcm9wcy5sZW5ndGgsXG4gICAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcblxuICAgICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgICBpZiAoIShyZXN1bHQgPSBiYXNlSXNFcXVhbChvYmplY3RbcHJvcHNbbGVuZ3RoXV0sIGZ1bmNbcHJvcHNbbGVuZ3RoXV0sIG51bGwsIHRydWUpKSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIHRoZSBjaGFyYWN0ZXJzIGAmYCwgYDxgLCBgPmAsIGBcImAsIGFuZCBgJ2AgaW4gYHN0cmluZ2AgdG8gdGhlaXJcbiAgICAgKiBjb3JyZXNwb25kaW5nIEhUTUwgZW50aXRpZXMuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyBUaGUgc3RyaW5nIHRvIGVzY2FwZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBlc2NhcGVkIHN0cmluZy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5lc2NhcGUoJ0ZyZWQsIFdpbG1hLCAmIFBlYmJsZXMnKTtcbiAgICAgKiAvLyA9PiAnRnJlZCwgV2lsbWEsICZhbXA7IFBlYmJsZXMnXG4gICAgICovXG4gICAgZnVuY3Rpb24gZXNjYXBlKHN0cmluZykge1xuICAgICAgcmV0dXJuIHN0cmluZyA9PSBudWxsID8gJycgOiBTdHJpbmcoc3RyaW5nKS5yZXBsYWNlKHJlVW5lc2NhcGVkSHRtbCwgZXNjYXBlSHRtbENoYXIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIHJldHVybnMgdGhlIGZpcnN0IGFyZ3VtZW50IHByb3ZpZGVkIHRvIGl0LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IFV0aWxpdGllc1xuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgQW55IHZhbHVlLlxuICAgICAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIGB2YWx1ZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBvYmplY3QgPSB7ICduYW1lJzogJ2ZyZWQnIH07XG4gICAgICogXy5pZGVudGl0eShvYmplY3QpID09PSBvYmplY3Q7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGlkZW50aXR5KHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBmdW5jdGlvbiBwcm9wZXJ0aWVzIG9mIGEgc291cmNlIG9iamVjdCB0byB0aGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICAgICAqIElmIGBvYmplY3RgIGlzIGEgZnVuY3Rpb24gbWV0aG9kcyB3aWxsIGJlIGFkZGVkIHRvIGl0cyBwcm90b3R5cGUgYXMgd2VsbC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBVdGlsaXRpZXNcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdH0gW29iamVjdD1sb2Rhc2hdIG9iamVjdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIG9iamVjdCBvZiBmdW5jdGlvbnMgdG8gYWRkLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gVGhlIG9wdGlvbnMgb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuY2hhaW49dHJ1ZV0gU3BlY2lmeSB3aGV0aGVyIHRoZSBmdW5jdGlvbnMgYWRkZWQgYXJlIGNoYWluYWJsZS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogZnVuY3Rpb24gY2FwaXRhbGl6ZShzdHJpbmcpIHtcbiAgICAgKiAgIHJldHVybiBzdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHJpbmcuc2xpY2UoMSkudG9Mb3dlckNhc2UoKTtcbiAgICAgKiB9XG4gICAgICpcbiAgICAgKiBfLm1peGluKHsgJ2NhcGl0YWxpemUnOiBjYXBpdGFsaXplIH0pO1xuICAgICAqIF8uY2FwaXRhbGl6ZSgnZnJlZCcpO1xuICAgICAqIC8vID0+ICdGcmVkJ1xuICAgICAqXG4gICAgICogXygnZnJlZCcpLmNhcGl0YWxpemUoKS52YWx1ZSgpO1xuICAgICAqIC8vID0+ICdGcmVkJ1xuICAgICAqXG4gICAgICogXy5taXhpbih7ICdjYXBpdGFsaXplJzogY2FwaXRhbGl6ZSB9LCB7ICdjaGFpbic6IGZhbHNlIH0pO1xuICAgICAqIF8oJ2ZyZWQnKS5jYXBpdGFsaXplKCk7XG4gICAgICogLy8gPT4gJ0ZyZWQnXG4gICAgICovXG4gICAgZnVuY3Rpb24gbWl4aW4ob2JqZWN0LCBzb3VyY2UsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBjaGFpbiA9IHRydWUsXG4gICAgICAgICAgbWV0aG9kTmFtZXMgPSBzb3VyY2UgJiYgZnVuY3Rpb25zKHNvdXJjZSk7XG5cbiAgICAgIGlmICghc291cmNlIHx8ICghb3B0aW9ucyAmJiAhbWV0aG9kTmFtZXMubGVuZ3RoKSkge1xuICAgICAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICAgICAgb3B0aW9ucyA9IHNvdXJjZTtcbiAgICAgICAgfVxuICAgICAgICBjdG9yID0gbG9kYXNoV3JhcHBlcjtcbiAgICAgICAgc291cmNlID0gb2JqZWN0O1xuICAgICAgICBvYmplY3QgPSBsb2Rhc2g7XG4gICAgICAgIG1ldGhvZE5hbWVzID0gZnVuY3Rpb25zKHNvdXJjZSk7XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucyA9PT0gZmFsc2UpIHtcbiAgICAgICAgY2hhaW4gPSBmYWxzZTtcbiAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3Qob3B0aW9ucykgJiYgJ2NoYWluJyBpbiBvcHRpb25zKSB7XG4gICAgICAgIGNoYWluID0gb3B0aW9ucy5jaGFpbjtcbiAgICAgIH1cbiAgICAgIHZhciBjdG9yID0gb2JqZWN0LFxuICAgICAgICAgIGlzRnVuYyA9IGlzRnVuY3Rpb24oY3Rvcik7XG5cbiAgICAgIGZvckVhY2gobWV0aG9kTmFtZXMsIGZ1bmN0aW9uKG1ldGhvZE5hbWUpIHtcbiAgICAgICAgdmFyIGZ1bmMgPSBvYmplY3RbbWV0aG9kTmFtZV0gPSBzb3VyY2VbbWV0aG9kTmFtZV07XG4gICAgICAgIGlmIChpc0Z1bmMpIHtcbiAgICAgICAgICBjdG9yLnByb3RvdHlwZVttZXRob2ROYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGNoYWluQWxsID0gdGhpcy5fX2NoYWluX18sXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGlzLl9fd3JhcHBlZF9fLFxuICAgICAgICAgICAgICAgIGFyZ3MgPSBbdmFsdWVdO1xuXG4gICAgICAgICAgICBwdXNoLmFwcGx5KGFyZ3MsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gZnVuYy5hcHBseShvYmplY3QsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKGNoYWluIHx8IGNoYWluQWxsKSB7XG4gICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gcmVzdWx0ICYmIGlzT2JqZWN0KHJlc3VsdCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXN1bHQgPSBuZXcgY3RvcihyZXN1bHQpO1xuICAgICAgICAgICAgICByZXN1bHQuX19jaGFpbl9fID0gY2hhaW5BbGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldmVydHMgdGhlICdfJyB2YXJpYWJsZSB0byBpdHMgcHJldmlvdXMgdmFsdWUgYW5kIHJldHVybnMgYSByZWZlcmVuY2UgdG9cbiAgICAgKiB0aGUgYGxvZGFzaGAgZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBgbG9kYXNoYCBmdW5jdGlvbi5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIGxvZGFzaCA9IF8ubm9Db25mbGljdCgpO1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIG5vQ29uZmxpY3QoKSB7XG4gICAgICBjb250ZXh0Ll8gPSBvbGREYXNoO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQSBuby1vcGVyYXRpb24gZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBvYmplY3QgPSB7ICduYW1lJzogJ2ZyZWQnIH07XG4gICAgICogXy5ub29wKG9iamVjdCkgPT09IHVuZGVmaW5lZDtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICovXG4gICAgZnVuY3Rpb24gbm9vcCgpIHtcbiAgICAgIC8vIG5vIG9wZXJhdGlvbiBwZXJmb3JtZWRcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRoYXQgaGF2ZSBlbGFwc2VkIHNpbmNlIHRoZSBVbml4IGVwb2NoXG4gICAgICogKDEgSmFudWFyeSAxOTcwIDAwOjAwOjAwIFVUQykuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBzdGFtcCA9IF8ubm93KCk7XG4gICAgICogXy5kZWZlcihmdW5jdGlvbigpIHsgY29uc29sZS5sb2coXy5ub3coKSAtIHN0YW1wKTsgfSk7XG4gICAgICogLy8gPT4gbG9ncyB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBpdCB0b29rIGZvciB0aGUgZGVmZXJyZWQgZnVuY3Rpb24gdG8gYmUgY2FsbGVkXG4gICAgICovXG4gICAgdmFyIG5vdyA9IGlzTmF0aXZlKG5vdyA9IERhdGUubm93KSAmJiBub3cgfHwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIHRoZSBnaXZlbiB2YWx1ZSBpbnRvIGFuIGludGVnZXIgb2YgdGhlIHNwZWNpZmllZCByYWRpeC5cbiAgICAgKiBJZiBgcmFkaXhgIGlzIGB1bmRlZmluZWRgIG9yIGAwYCBhIGByYWRpeGAgb2YgYDEwYCBpcyB1c2VkIHVubGVzcyB0aGVcbiAgICAgKiBgdmFsdWVgIGlzIGEgaGV4YWRlY2ltYWwsIGluIHdoaWNoIGNhc2UgYSBgcmFkaXhgIG9mIGAxNmAgaXMgdXNlZC5cbiAgICAgKlxuICAgICAqIE5vdGU6IFRoaXMgbWV0aG9kIGF2b2lkcyBkaWZmZXJlbmNlcyBpbiBuYXRpdmUgRVMzIGFuZCBFUzUgYHBhcnNlSW50YFxuICAgICAqIGltcGxlbWVudGF0aW9ucy4gU2VlIGh0dHA6Ly9lczUuZ2l0aHViLmlvLyNFLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IFV0aWxpdGllc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcGFyc2UuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtyYWRpeF0gVGhlIHJhZGl4IHVzZWQgdG8gaW50ZXJwcmV0IHRoZSB2YWx1ZSB0byBwYXJzZS5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBuZXcgaW50ZWdlciB2YWx1ZS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5wYXJzZUludCgnMDgnKTtcbiAgICAgKiAvLyA9PiA4XG4gICAgICovXG4gICAgdmFyIHBhcnNlSW50ID0gbmF0aXZlUGFyc2VJbnQod2hpdGVzcGFjZSArICcwOCcpID09IDggPyBuYXRpdmVQYXJzZUludCA6IGZ1bmN0aW9uKHZhbHVlLCByYWRpeCkge1xuICAgICAgLy8gRmlyZWZveCA8IDIxIGFuZCBPcGVyYSA8IDE1IGZvbGxvdyB0aGUgRVMzIHNwZWNpZmllZCBpbXBsZW1lbnRhdGlvbiBvZiBgcGFyc2VJbnRgXG4gICAgICByZXR1cm4gbmF0aXZlUGFyc2VJbnQoaXNTdHJpbmcodmFsdWUpID8gdmFsdWUucmVwbGFjZShyZUxlYWRpbmdTcGFjZXNBbmRaZXJvcywgJycpIDogdmFsdWUsIHJhZGl4IHx8IDApO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgXCJfLnBsdWNrXCIgc3R5bGUgZnVuY3Rpb24sIHdoaWNoIHJldHVybnMgdGhlIGBrZXlgIHZhbHVlIG9mIGFcbiAgICAgKiBnaXZlbiBvYmplY3QuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgdG8gcmV0cmlldmUuXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBjaGFyYWN0ZXJzID0gW1xuICAgICAqICAgeyAnbmFtZSc6ICdmcmVkJywgICAnYWdlJzogNDAgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgJ2FnZSc6IDM2IH1cbiAgICAgKiBdO1xuICAgICAqXG4gICAgICogdmFyIGdldE5hbWUgPSBfLnByb3BlcnR5KCduYW1lJyk7XG4gICAgICpcbiAgICAgKiBfLm1hcChjaGFyYWN0ZXJzLCBnZXROYW1lKTtcbiAgICAgKiAvLyA9PiBbJ2Jhcm5leScsICdmcmVkJ11cbiAgICAgKlxuICAgICAqIF8uc29ydEJ5KGNoYXJhY3RlcnMsIGdldE5hbWUpO1xuICAgICAqIC8vID0+IFt7ICduYW1lJzogJ2Jhcm5leScsICdhZ2UnOiAzNiB9LCB7ICduYW1lJzogJ2ZyZWQnLCAgICdhZ2UnOiA0MCB9XVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHByb3BlcnR5KGtleSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCkge1xuICAgICAgICByZXR1cm4gb2JqZWN0W2tleV07XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByb2R1Y2VzIGEgcmFuZG9tIG51bWJlciBiZXR3ZWVuIGBtaW5gIGFuZCBgbWF4YCAoaW5jbHVzaXZlKS4gSWYgb25seSBvbmVcbiAgICAgKiBhcmd1bWVudCBpcyBwcm92aWRlZCBhIG51bWJlciBiZXR3ZWVuIGAwYCBhbmQgdGhlIGdpdmVuIG51bWJlciB3aWxsIGJlXG4gICAgICogcmV0dXJuZWQuIElmIGBmbG9hdGluZ2AgaXMgdHJ1ZXkgb3IgZWl0aGVyIGBtaW5gIG9yIGBtYXhgIGFyZSBmbG9hdHMgYVxuICAgICAqIGZsb2F0aW5nLXBvaW50IG51bWJlciB3aWxsIGJlIHJldHVybmVkIGluc3RlYWQgb2YgYW4gaW50ZWdlci5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBVdGlsaXRpZXNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW21pbj0wXSBUaGUgbWluaW11bSBwb3NzaWJsZSB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW21heD0xXSBUaGUgbWF4aW11bSBwb3NzaWJsZSB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtmbG9hdGluZz1mYWxzZV0gU3BlY2lmeSByZXR1cm5pbmcgYSBmbG9hdGluZy1wb2ludCBudW1iZXIuXG4gICAgICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyBhIHJhbmRvbSBudW1iZXIuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8ucmFuZG9tKDAsIDUpO1xuICAgICAqIC8vID0+IGFuIGludGVnZXIgYmV0d2VlbiAwIGFuZCA1XG4gICAgICpcbiAgICAgKiBfLnJhbmRvbSg1KTtcbiAgICAgKiAvLyA9PiBhbHNvIGFuIGludGVnZXIgYmV0d2VlbiAwIGFuZCA1XG4gICAgICpcbiAgICAgKiBfLnJhbmRvbSg1LCB0cnVlKTtcbiAgICAgKiAvLyA9PiBhIGZsb2F0aW5nLXBvaW50IG51bWJlciBiZXR3ZWVuIDAgYW5kIDVcbiAgICAgKlxuICAgICAqIF8ucmFuZG9tKDEuMiwgNS4yKTtcbiAgICAgKiAvLyA9PiBhIGZsb2F0aW5nLXBvaW50IG51bWJlciBiZXR3ZWVuIDEuMiBhbmQgNS4yXG4gICAgICovXG4gICAgZnVuY3Rpb24gcmFuZG9tKG1pbiwgbWF4LCBmbG9hdGluZykge1xuICAgICAgdmFyIG5vTWluID0gbWluID09IG51bGwsXG4gICAgICAgICAgbm9NYXggPSBtYXggPT0gbnVsbDtcblxuICAgICAgaWYgKGZsb2F0aW5nID09IG51bGwpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBtaW4gPT0gJ2Jvb2xlYW4nICYmIG5vTWF4KSB7XG4gICAgICAgICAgZmxvYXRpbmcgPSBtaW47XG4gICAgICAgICAgbWluID0gMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghbm9NYXggJiYgdHlwZW9mIG1heCA9PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICBmbG9hdGluZyA9IG1heDtcbiAgICAgICAgICBub01heCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChub01pbiAmJiBub01heCkge1xuICAgICAgICBtYXggPSAxO1xuICAgICAgfVxuICAgICAgbWluID0gK21pbiB8fCAwO1xuICAgICAgaWYgKG5vTWF4KSB7XG4gICAgICAgIG1heCA9IG1pbjtcbiAgICAgICAgbWluID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1heCA9ICttYXggfHwgMDtcbiAgICAgIH1cbiAgICAgIGlmIChmbG9hdGluZyB8fCBtaW4gJSAxIHx8IG1heCAlIDEpIHtcbiAgICAgICAgdmFyIHJhbmQgPSBuYXRpdmVSYW5kb20oKTtcbiAgICAgICAgcmV0dXJuIG5hdGl2ZU1pbihtaW4gKyAocmFuZCAqIChtYXggLSBtaW4gKyBwYXJzZUZsb2F0KCcxZS0nICsgKChyYW5kICsnJykubGVuZ3RoIC0gMSkpKSksIG1heCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYmFzZVJhbmRvbShtaW4sIG1heCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzb2x2ZXMgdGhlIHZhbHVlIG9mIHByb3BlcnR5IGBrZXlgIG9uIGBvYmplY3RgLiBJZiBga2V5YCBpcyBhIGZ1bmN0aW9uXG4gICAgICogaXQgd2lsbCBiZSBpbnZva2VkIHdpdGggdGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBvYmplY3RgIGFuZCBpdHMgcmVzdWx0IHJldHVybmVkLFxuICAgICAqIGVsc2UgdGhlIHByb3BlcnR5IHZhbHVlIGlzIHJldHVybmVkLiBJZiBgb2JqZWN0YCBpcyBmYWxzZXkgdGhlbiBgdW5kZWZpbmVkYFxuICAgICAqIGlzIHJldHVybmVkLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IFV0aWxpdGllc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpbnNwZWN0LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIHJlc29sdmUuXG4gICAgICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHJlc29sdmVkIHZhbHVlLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgb2JqZWN0ID0ge1xuICAgICAqICAgJ2NoZWVzZSc6ICdjcnVtcGV0cycsXG4gICAgICogICAnc3R1ZmYnOiBmdW5jdGlvbigpIHtcbiAgICAgKiAgICAgcmV0dXJuICdub25zZW5zZSc7XG4gICAgICogICB9XG4gICAgICogfTtcbiAgICAgKlxuICAgICAqIF8ucmVzdWx0KG9iamVjdCwgJ2NoZWVzZScpO1xuICAgICAqIC8vID0+ICdjcnVtcGV0cydcbiAgICAgKlxuICAgICAqIF8ucmVzdWx0KG9iamVjdCwgJ3N0dWZmJyk7XG4gICAgICogLy8gPT4gJ25vbnNlbnNlJ1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJlc3VsdChvYmplY3QsIGtleSkge1xuICAgICAgaWYgKG9iamVjdCkge1xuICAgICAgICB2YXIgdmFsdWUgPSBvYmplY3Rba2V5XTtcbiAgICAgICAgcmV0dXJuIGlzRnVuY3Rpb24odmFsdWUpID8gb2JqZWN0W2tleV0oKSA6IHZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEEgbWljcm8tdGVtcGxhdGluZyBtZXRob2QgdGhhdCBoYW5kbGVzIGFyYml0cmFyeSBkZWxpbWl0ZXJzLCBwcmVzZXJ2ZXNcbiAgICAgKiB3aGl0ZXNwYWNlLCBhbmQgY29ycmVjdGx5IGVzY2FwZXMgcXVvdGVzIHdpdGhpbiBpbnRlcnBvbGF0ZWQgY29kZS5cbiAgICAgKlxuICAgICAqIE5vdGU6IEluIHRoZSBkZXZlbG9wbWVudCBidWlsZCwgYF8udGVtcGxhdGVgIHV0aWxpemVzIHNvdXJjZVVSTHMgZm9yIGVhc2llclxuICAgICAqIGRlYnVnZ2luZy4gU2VlIGh0dHA6Ly93d3cuaHRtbDVyb2Nrcy5jb20vZW4vdHV0b3JpYWxzL2RldmVsb3BlcnRvb2xzL3NvdXJjZW1hcHMvI3RvYy1zb3VyY2V1cmxcbiAgICAgKlxuICAgICAqIEZvciBtb3JlIGluZm9ybWF0aW9uIG9uIHByZWNvbXBpbGluZyB0ZW1wbGF0ZXMgc2VlOlxuICAgICAqIGh0dHBzOi8vbG9kYXNoLmNvbS9jdXN0b20tYnVpbGRzXG4gICAgICpcbiAgICAgKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiBDaHJvbWUgZXh0ZW5zaW9uIHNhbmRib3hlcyBzZWU6XG4gICAgICogaHR0cDovL2RldmVsb3Blci5jaHJvbWUuY29tL3N0YWJsZS9leHRlbnNpb25zL3NhbmRib3hpbmdFdmFsLmh0bWxcbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBVdGlsaXRpZXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCBUaGUgdGVtcGxhdGUgdGV4dC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSBUaGUgZGF0YSBvYmplY3QgdXNlZCB0byBwb3B1bGF0ZSB0aGUgdGV4dC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFRoZSBvcHRpb25zIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge1JlZ0V4cH0gW29wdGlvbnMuZXNjYXBlXSBUaGUgXCJlc2NhcGVcIiBkZWxpbWl0ZXIuXG4gICAgICogQHBhcmFtIHtSZWdFeHB9IFtvcHRpb25zLmV2YWx1YXRlXSBUaGUgXCJldmFsdWF0ZVwiIGRlbGltaXRlci5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnMuaW1wb3J0c10gQW4gb2JqZWN0IHRvIGltcG9ydCBpbnRvIHRoZSB0ZW1wbGF0ZSBhcyBsb2NhbCB2YXJpYWJsZXMuXG4gICAgICogQHBhcmFtIHtSZWdFeHB9IFtvcHRpb25zLmludGVycG9sYXRlXSBUaGUgXCJpbnRlcnBvbGF0ZVwiIGRlbGltaXRlci5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NvdXJjZVVSTF0gVGhlIHNvdXJjZVVSTCBvZiB0aGUgdGVtcGxhdGUncyBjb21waWxlZCBzb3VyY2UuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFt2YXJpYWJsZV0gVGhlIGRhdGEgb2JqZWN0IHZhcmlhYmxlIG5hbWUuXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufHN0cmluZ30gUmV0dXJucyBhIGNvbXBpbGVkIGZ1bmN0aW9uIHdoZW4gbm8gYGRhdGFgIG9iamVjdFxuICAgICAqICBpcyBnaXZlbiwgZWxzZSBpdCByZXR1cm5zIHRoZSBpbnRlcnBvbGF0ZWQgdGV4dC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogLy8gdXNpbmcgdGhlIFwiaW50ZXJwb2xhdGVcIiBkZWxpbWl0ZXIgdG8gY3JlYXRlIGEgY29tcGlsZWQgdGVtcGxhdGVcbiAgICAgKiB2YXIgY29tcGlsZWQgPSBfLnRlbXBsYXRlKCdoZWxsbyA8JT0gbmFtZSAlPicpO1xuICAgICAqIGNvbXBpbGVkKHsgJ25hbWUnOiAnZnJlZCcgfSk7XG4gICAgICogLy8gPT4gJ2hlbGxvIGZyZWQnXG4gICAgICpcbiAgICAgKiAvLyB1c2luZyB0aGUgXCJlc2NhcGVcIiBkZWxpbWl0ZXIgdG8gZXNjYXBlIEhUTUwgaW4gZGF0YSBwcm9wZXJ0eSB2YWx1ZXNcbiAgICAgKiBfLnRlbXBsYXRlKCc8Yj48JS0gdmFsdWUgJT48L2I+JywgeyAndmFsdWUnOiAnPHNjcmlwdD4nIH0pO1xuICAgICAqIC8vID0+ICc8Yj4mbHQ7c2NyaXB0Jmd0OzwvYj4nXG4gICAgICpcbiAgICAgKiAvLyB1c2luZyB0aGUgXCJldmFsdWF0ZVwiIGRlbGltaXRlciB0byBnZW5lcmF0ZSBIVE1MXG4gICAgICogdmFyIGxpc3QgPSAnPCUgXy5mb3JFYWNoKHBlb3BsZSwgZnVuY3Rpb24obmFtZSkgeyAlPjxsaT48JS0gbmFtZSAlPjwvbGk+PCUgfSk7ICU+JztcbiAgICAgKiBfLnRlbXBsYXRlKGxpc3QsIHsgJ3Blb3BsZSc6IFsnZnJlZCcsICdiYXJuZXknXSB9KTtcbiAgICAgKiAvLyA9PiAnPGxpPmZyZWQ8L2xpPjxsaT5iYXJuZXk8L2xpPidcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIHRoZSBFUzYgZGVsaW1pdGVyIGFzIGFuIGFsdGVybmF0aXZlIHRvIHRoZSBkZWZhdWx0IFwiaW50ZXJwb2xhdGVcIiBkZWxpbWl0ZXJcbiAgICAgKiBfLnRlbXBsYXRlKCdoZWxsbyAkeyBuYW1lIH0nLCB7ICduYW1lJzogJ3BlYmJsZXMnIH0pO1xuICAgICAqIC8vID0+ICdoZWxsbyBwZWJibGVzJ1xuICAgICAqXG4gICAgICogLy8gdXNpbmcgdGhlIGludGVybmFsIGBwcmludGAgZnVuY3Rpb24gaW4gXCJldmFsdWF0ZVwiIGRlbGltaXRlcnNcbiAgICAgKiBfLnRlbXBsYXRlKCc8JSBwcmludChcImhlbGxvIFwiICsgbmFtZSk7ICU+IScsIHsgJ25hbWUnOiAnYmFybmV5JyB9KTtcbiAgICAgKiAvLyA9PiAnaGVsbG8gYmFybmV5ISdcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIGEgY3VzdG9tIHRlbXBsYXRlIGRlbGltaXRlcnNcbiAgICAgKiBfLnRlbXBsYXRlU2V0dGluZ3MgPSB7XG4gICAgICogICAnaW50ZXJwb2xhdGUnOiAve3soW1xcc1xcU10rPyl9fS9nXG4gICAgICogfTtcbiAgICAgKlxuICAgICAqIF8udGVtcGxhdGUoJ2hlbGxvIHt7IG5hbWUgfX0hJywgeyAnbmFtZSc6ICdtdXN0YWNoZScgfSk7XG4gICAgICogLy8gPT4gJ2hlbGxvIG11c3RhY2hlISdcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIHRoZSBgaW1wb3J0c2Agb3B0aW9uIHRvIGltcG9ydCBqUXVlcnlcbiAgICAgKiB2YXIgbGlzdCA9ICc8JSBqcS5lYWNoKHBlb3BsZSwgZnVuY3Rpb24obmFtZSkgeyAlPjxsaT48JS0gbmFtZSAlPjwvbGk+PCUgfSk7ICU+JztcbiAgICAgKiBfLnRlbXBsYXRlKGxpc3QsIHsgJ3Blb3BsZSc6IFsnZnJlZCcsICdiYXJuZXknXSB9LCB7ICdpbXBvcnRzJzogeyAnanEnOiBqUXVlcnkgfSB9KTtcbiAgICAgKiAvLyA9PiAnPGxpPmZyZWQ8L2xpPjxsaT5iYXJuZXk8L2xpPidcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIHRoZSBgc291cmNlVVJMYCBvcHRpb24gdG8gc3BlY2lmeSBhIGN1c3RvbSBzb3VyY2VVUkwgZm9yIHRoZSB0ZW1wbGF0ZVxuICAgICAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJ2hlbGxvIDwlPSBuYW1lICU+JywgbnVsbCwgeyAnc291cmNlVVJMJzogJy9iYXNpYy9ncmVldGluZy5qc3QnIH0pO1xuICAgICAqIGNvbXBpbGVkKGRhdGEpO1xuICAgICAqIC8vID0+IGZpbmQgdGhlIHNvdXJjZSBvZiBcImdyZWV0aW5nLmpzdFwiIHVuZGVyIHRoZSBTb3VyY2VzIHRhYiBvciBSZXNvdXJjZXMgcGFuZWwgb2YgdGhlIHdlYiBpbnNwZWN0b3JcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIHRoZSBgdmFyaWFibGVgIG9wdGlvbiB0byBlbnN1cmUgYSB3aXRoLXN0YXRlbWVudCBpc24ndCB1c2VkIGluIHRoZSBjb21waWxlZCB0ZW1wbGF0ZVxuICAgICAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJ2hpIDwlPSBkYXRhLm5hbWUgJT4hJywgbnVsbCwgeyAndmFyaWFibGUnOiAnZGF0YScgfSk7XG4gICAgICogY29tcGlsZWQuc291cmNlO1xuICAgICAqIC8vID0+IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgKiAgIHZhciBfX3QsIF9fcCA9ICcnLCBfX2UgPSBfLmVzY2FwZTtcbiAgICAgKiAgIF9fcCArPSAnaGkgJyArICgoX190ID0gKCBkYXRhLm5hbWUgKSkgPT0gbnVsbCA/ICcnIDogX190KSArICchJztcbiAgICAgKiAgIHJldHVybiBfX3A7XG4gICAgICogfVxuICAgICAqXG4gICAgICogLy8gdXNpbmcgdGhlIGBzb3VyY2VgIHByb3BlcnR5IHRvIGlubGluZSBjb21waWxlZCB0ZW1wbGF0ZXMgZm9yIG1lYW5pbmdmdWxcbiAgICAgKiAvLyBsaW5lIG51bWJlcnMgaW4gZXJyb3IgbWVzc2FnZXMgYW5kIGEgc3RhY2sgdHJhY2VcbiAgICAgKiBmcy53cml0ZUZpbGVTeW5jKHBhdGguam9pbihjd2QsICdqc3QuanMnKSwgJ1xcXG4gICAgICogICB2YXIgSlNUID0ge1xcXG4gICAgICogICAgIFwibWFpblwiOiAnICsgXy50ZW1wbGF0ZShtYWluVGV4dCkuc291cmNlICsgJ1xcXG4gICAgICogICB9O1xcXG4gICAgICogJyk7XG4gICAgICovXG4gICAgZnVuY3Rpb24gdGVtcGxhdGUodGV4dCwgZGF0YSwgb3B0aW9ucykge1xuICAgICAgLy8gYmFzZWQgb24gSm9obiBSZXNpZydzIGB0bXBsYCBpbXBsZW1lbnRhdGlvblxuICAgICAgLy8gaHR0cDovL2Vqb2huLm9yZy9ibG9nL2phdmFzY3JpcHQtbWljcm8tdGVtcGxhdGluZy9cbiAgICAgIC8vIGFuZCBMYXVyYSBEb2t0b3JvdmEncyBkb1QuanNcbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9vbGFkby9kb1RcbiAgICAgIHZhciBzZXR0aW5ncyA9IGxvZGFzaC50ZW1wbGF0ZVNldHRpbmdzO1xuICAgICAgdGV4dCA9IFN0cmluZyh0ZXh0IHx8ICcnKTtcblxuICAgICAgLy8gYXZvaWQgbWlzc2luZyBkZXBlbmRlbmNpZXMgd2hlbiBgaXRlcmF0b3JUZW1wbGF0ZWAgaXMgbm90IGRlZmluZWRcbiAgICAgIG9wdGlvbnMgPSBkZWZhdWx0cyh7fSwgb3B0aW9ucywgc2V0dGluZ3MpO1xuXG4gICAgICB2YXIgaW1wb3J0cyA9IGRlZmF1bHRzKHt9LCBvcHRpb25zLmltcG9ydHMsIHNldHRpbmdzLmltcG9ydHMpLFxuICAgICAgICAgIGltcG9ydHNLZXlzID0ga2V5cyhpbXBvcnRzKSxcbiAgICAgICAgICBpbXBvcnRzVmFsdWVzID0gdmFsdWVzKGltcG9ydHMpO1xuXG4gICAgICB2YXIgaXNFdmFsdWF0aW5nLFxuICAgICAgICAgIGluZGV4ID0gMCxcbiAgICAgICAgICBpbnRlcnBvbGF0ZSA9IG9wdGlvbnMuaW50ZXJwb2xhdGUgfHwgcmVOb01hdGNoLFxuICAgICAgICAgIHNvdXJjZSA9IFwiX19wICs9ICdcIjtcblxuICAgICAgLy8gY29tcGlsZSB0aGUgcmVnZXhwIHRvIG1hdGNoIGVhY2ggZGVsaW1pdGVyXG4gICAgICB2YXIgcmVEZWxpbWl0ZXJzID0gUmVnRXhwKFxuICAgICAgICAob3B0aW9ucy5lc2NhcGUgfHwgcmVOb01hdGNoKS5zb3VyY2UgKyAnfCcgK1xuICAgICAgICBpbnRlcnBvbGF0ZS5zb3VyY2UgKyAnfCcgK1xuICAgICAgICAoaW50ZXJwb2xhdGUgPT09IHJlSW50ZXJwb2xhdGUgPyByZUVzVGVtcGxhdGUgOiByZU5vTWF0Y2gpLnNvdXJjZSArICd8JyArXG4gICAgICAgIChvcHRpb25zLmV2YWx1YXRlIHx8IHJlTm9NYXRjaCkuc291cmNlICsgJ3wkJ1xuICAgICAgLCAnZycpO1xuXG4gICAgICB0ZXh0LnJlcGxhY2UocmVEZWxpbWl0ZXJzLCBmdW5jdGlvbihtYXRjaCwgZXNjYXBlVmFsdWUsIGludGVycG9sYXRlVmFsdWUsIGVzVGVtcGxhdGVWYWx1ZSwgZXZhbHVhdGVWYWx1ZSwgb2Zmc2V0KSB7XG4gICAgICAgIGludGVycG9sYXRlVmFsdWUgfHwgKGludGVycG9sYXRlVmFsdWUgPSBlc1RlbXBsYXRlVmFsdWUpO1xuXG4gICAgICAgIC8vIGVzY2FwZSBjaGFyYWN0ZXJzIHRoYXQgY2Fubm90IGJlIGluY2x1ZGVkIGluIHN0cmluZyBsaXRlcmFsc1xuICAgICAgICBzb3VyY2UgKz0gdGV4dC5zbGljZShpbmRleCwgb2Zmc2V0KS5yZXBsYWNlKHJlVW5lc2NhcGVkU3RyaW5nLCBlc2NhcGVTdHJpbmdDaGFyKTtcblxuICAgICAgICAvLyByZXBsYWNlIGRlbGltaXRlcnMgd2l0aCBzbmlwcGV0c1xuICAgICAgICBpZiAoZXNjYXBlVmFsdWUpIHtcbiAgICAgICAgICBzb3VyY2UgKz0gXCInICtcXG5fX2UoXCIgKyBlc2NhcGVWYWx1ZSArIFwiKSArXFxuJ1wiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldmFsdWF0ZVZhbHVlKSB7XG4gICAgICAgICAgaXNFdmFsdWF0aW5nID0gdHJ1ZTtcbiAgICAgICAgICBzb3VyY2UgKz0gXCInO1xcblwiICsgZXZhbHVhdGVWYWx1ZSArIFwiO1xcbl9fcCArPSAnXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGludGVycG9sYXRlVmFsdWUpIHtcbiAgICAgICAgICBzb3VyY2UgKz0gXCInICtcXG4oKF9fdCA9IChcIiArIGludGVycG9sYXRlVmFsdWUgKyBcIikpID09IG51bGwgPyAnJyA6IF9fdCkgK1xcbidcIjtcbiAgICAgICAgfVxuICAgICAgICBpbmRleCA9IG9mZnNldCArIG1hdGNoLmxlbmd0aDtcblxuICAgICAgICAvLyB0aGUgSlMgZW5naW5lIGVtYmVkZGVkIGluIEFkb2JlIHByb2R1Y3RzIHJlcXVpcmVzIHJldHVybmluZyB0aGUgYG1hdGNoYFxuICAgICAgICAvLyBzdHJpbmcgaW4gb3JkZXIgdG8gcHJvZHVjZSB0aGUgY29ycmVjdCBgb2Zmc2V0YCB2YWx1ZVxuICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICB9KTtcblxuICAgICAgc291cmNlICs9IFwiJztcXG5cIjtcblxuICAgICAgLy8gaWYgYHZhcmlhYmxlYCBpcyBub3Qgc3BlY2lmaWVkLCB3cmFwIGEgd2l0aC1zdGF0ZW1lbnQgYXJvdW5kIHRoZSBnZW5lcmF0ZWRcbiAgICAgIC8vIGNvZGUgdG8gYWRkIHRoZSBkYXRhIG9iamVjdCB0byB0aGUgdG9wIG9mIHRoZSBzY29wZSBjaGFpblxuICAgICAgdmFyIHZhcmlhYmxlID0gb3B0aW9ucy52YXJpYWJsZSxcbiAgICAgICAgICBoYXNWYXJpYWJsZSA9IHZhcmlhYmxlO1xuXG4gICAgICBpZiAoIWhhc1ZhcmlhYmxlKSB7XG4gICAgICAgIHZhcmlhYmxlID0gJ29iaic7XG4gICAgICAgIHNvdXJjZSA9ICd3aXRoICgnICsgdmFyaWFibGUgKyAnKSB7XFxuJyArIHNvdXJjZSArICdcXG59XFxuJztcbiAgICAgIH1cbiAgICAgIC8vIGNsZWFudXAgY29kZSBieSBzdHJpcHBpbmcgZW1wdHkgc3RyaW5nc1xuICAgICAgc291cmNlID0gKGlzRXZhbHVhdGluZyA/IHNvdXJjZS5yZXBsYWNlKHJlRW1wdHlTdHJpbmdMZWFkaW5nLCAnJykgOiBzb3VyY2UpXG4gICAgICAgIC5yZXBsYWNlKHJlRW1wdHlTdHJpbmdNaWRkbGUsICckMScpXG4gICAgICAgIC5yZXBsYWNlKHJlRW1wdHlTdHJpbmdUcmFpbGluZywgJyQxOycpO1xuXG4gICAgICAvLyBmcmFtZSBjb2RlIGFzIHRoZSBmdW5jdGlvbiBib2R5XG4gICAgICBzb3VyY2UgPSAnZnVuY3Rpb24oJyArIHZhcmlhYmxlICsgJykge1xcbicgK1xuICAgICAgICAoaGFzVmFyaWFibGUgPyAnJyA6IHZhcmlhYmxlICsgJyB8fCAoJyArIHZhcmlhYmxlICsgJyA9IHt9KTtcXG4nKSArXG4gICAgICAgIFwidmFyIF9fdCwgX19wID0gJycsIF9fZSA9IF8uZXNjYXBlXCIgK1xuICAgICAgICAoaXNFdmFsdWF0aW5nXG4gICAgICAgICAgPyAnLCBfX2ogPSBBcnJheS5wcm90b3R5cGUuam9pbjtcXG4nICtcbiAgICAgICAgICAgIFwiZnVuY3Rpb24gcHJpbnQoKSB7IF9fcCArPSBfX2ouY2FsbChhcmd1bWVudHMsICcnKSB9XFxuXCJcbiAgICAgICAgICA6ICc7XFxuJ1xuICAgICAgICApICtcbiAgICAgICAgc291cmNlICtcbiAgICAgICAgJ3JldHVybiBfX3BcXG59JztcblxuICAgICAgLy8gVXNlIGEgc291cmNlVVJMIGZvciBlYXNpZXIgZGVidWdnaW5nLlxuICAgICAgLy8gaHR0cDovL3d3dy5odG1sNXJvY2tzLmNvbS9lbi90dXRvcmlhbHMvZGV2ZWxvcGVydG9vbHMvc291cmNlbWFwcy8jdG9jLXNvdXJjZXVybFxuICAgICAgdmFyIHNvdXJjZVVSTCA9ICdcXG4vKlxcbi8vIyBzb3VyY2VVUkw9JyArIChvcHRpb25zLnNvdXJjZVVSTCB8fCAnL2xvZGFzaC90ZW1wbGF0ZS9zb3VyY2VbJyArICh0ZW1wbGF0ZUNvdW50ZXIrKykgKyAnXScpICsgJ1xcbiovJztcblxuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IEZ1bmN0aW9uKGltcG9ydHNLZXlzLCAncmV0dXJuICcgKyBzb3VyY2UgKyBzb3VyY2VVUkwpLmFwcGx5KHVuZGVmaW5lZCwgaW1wb3J0c1ZhbHVlcyk7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgZS5zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgICBpZiAoZGF0YSkge1xuICAgICAgICByZXR1cm4gcmVzdWx0KGRhdGEpO1xuICAgICAgfVxuICAgICAgLy8gcHJvdmlkZSB0aGUgY29tcGlsZWQgZnVuY3Rpb24ncyBzb3VyY2UgYnkgaXRzIGB0b1N0cmluZ2AgbWV0aG9kLCBpblxuICAgICAgLy8gc3VwcG9ydGVkIGVudmlyb25tZW50cywgb3IgdGhlIGBzb3VyY2VgIHByb3BlcnR5IGFzIGEgY29udmVuaWVuY2UgZm9yXG4gICAgICAvLyBpbmxpbmluZyBjb21waWxlZCB0ZW1wbGF0ZXMgZHVyaW5nIHRoZSBidWlsZCBwcm9jZXNzXG4gICAgICByZXN1bHQuc291cmNlID0gc291cmNlO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlcyB0aGUgY2FsbGJhY2sgYG5gIHRpbWVzLCByZXR1cm5pbmcgYW4gYXJyYXkgb2YgdGhlIHJlc3VsdHNcbiAgICAgKiBvZiBlYWNoIGNhbGxiYWNrIGV4ZWN1dGlvbi4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZFxuICAgICAqIHdpdGggb25lIGFyZ3VtZW50OyAoaW5kZXgpLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IFV0aWxpdGllc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBuIFRoZSBudW1iZXIgb2YgdGltZXMgdG8gZXhlY3V0ZSB0aGUgY2FsbGJhY2suXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIGNhbGxlZCBwZXIgaXRlcmF0aW9uLlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhbiBhcnJheSBvZiB0aGUgcmVzdWx0cyBvZiBlYWNoIGBjYWxsYmFja2AgZXhlY3V0aW9uLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgZGljZVJvbGxzID0gXy50aW1lcygzLCBfLnBhcnRpYWwoXy5yYW5kb20sIDEsIDYpKTtcbiAgICAgKiAvLyA9PiBbMywgNiwgNF1cbiAgICAgKlxuICAgICAqIF8udGltZXMoMywgZnVuY3Rpb24obikgeyBtYWdlLmNhc3RTcGVsbChuKTsgfSk7XG4gICAgICogLy8gPT4gY2FsbHMgYG1hZ2UuY2FzdFNwZWxsKG4pYCB0aHJlZSB0aW1lcywgcGFzc2luZyBgbmAgb2YgYDBgLCBgMWAsIGFuZCBgMmAgcmVzcGVjdGl2ZWx5XG4gICAgICpcbiAgICAgKiBfLnRpbWVzKDMsIGZ1bmN0aW9uKG4pIHsgdGhpcy5jYXN0KG4pOyB9LCBtYWdlKTtcbiAgICAgKiAvLyA9PiBhbHNvIGNhbGxzIGBtYWdlLmNhc3RTcGVsbChuKWAgdGhyZWUgdGltZXNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0aW1lcyhuLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgbiA9IChuID0gK24pID4gLTEgPyBuIDogMDtcbiAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgIHJlc3VsdCA9IEFycmF5KG4pO1xuXG4gICAgICBjYWxsYmFjayA9IGJhc2VDcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMSk7XG4gICAgICB3aGlsZSAoKytpbmRleCA8IG4pIHtcbiAgICAgICAgcmVzdWx0W2luZGV4XSA9IGNhbGxiYWNrKGluZGV4KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGludmVyc2Ugb2YgYF8uZXNjYXBlYCB0aGlzIG1ldGhvZCBjb252ZXJ0cyB0aGUgSFRNTCBlbnRpdGllc1xuICAgICAqIGAmYW1wO2AsIGAmbHQ7YCwgYCZndDtgLCBgJnF1b3Q7YCwgYW5kIGAmIzM5O2AgaW4gYHN0cmluZ2AgdG8gdGhlaXJcbiAgICAgKiBjb3JyZXNwb25kaW5nIGNoYXJhY3RlcnMuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyBUaGUgc3RyaW5nIHRvIHVuZXNjYXBlLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHVuZXNjYXBlZCBzdHJpbmcuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8udW5lc2NhcGUoJ0ZyZWQsIEJhcm5leSAmYW1wOyBQZWJibGVzJyk7XG4gICAgICogLy8gPT4gJ0ZyZWQsIEJhcm5leSAmIFBlYmJsZXMnXG4gICAgICovXG4gICAgZnVuY3Rpb24gdW5lc2NhcGUoc3RyaW5nKSB7XG4gICAgICByZXR1cm4gc3RyaW5nID09IG51bGwgPyAnJyA6IFN0cmluZyhzdHJpbmcpLnJlcGxhY2UocmVFc2NhcGVkSHRtbCwgdW5lc2NhcGVIdG1sQ2hhcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGVzIGEgdW5pcXVlIElELiBJZiBgcHJlZml4YCBpcyBwcm92aWRlZCB0aGUgSUQgd2lsbCBiZSBhcHBlbmRlZCB0byBpdC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBVdGlsaXRpZXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3ByZWZpeF0gVGhlIHZhbHVlIHRvIHByZWZpeCB0aGUgSUQgd2l0aC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSB1bmlxdWUgSUQuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8udW5pcXVlSWQoJ2NvbnRhY3RfJyk7XG4gICAgICogLy8gPT4gJ2NvbnRhY3RfMTA0J1xuICAgICAqXG4gICAgICogXy51bmlxdWVJZCgpO1xuICAgICAqIC8vID0+ICcxMDUnXG4gICAgICovXG4gICAgZnVuY3Rpb24gdW5pcXVlSWQocHJlZml4KSB7XG4gICAgICB2YXIgaWQgPSArK2lkQ291bnRlcjtcbiAgICAgIHJldHVybiBTdHJpbmcocHJlZml4ID09IG51bGwgPyAnJyA6IHByZWZpeCkgKyBpZDtcbiAgICB9XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBgbG9kYXNoYCBvYmplY3QgdGhhdCB3cmFwcyB0aGUgZ2l2ZW4gdmFsdWUgd2l0aCBleHBsaWNpdFxuICAgICAqIG1ldGhvZCBjaGFpbmluZyBlbmFibGVkLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IENoYWluaW5nXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gd3JhcC5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSB3cmFwcGVyIG9iamVjdC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIGNoYXJhY3RlcnMgPSBbXG4gICAgICogICB7ICduYW1lJzogJ2Jhcm5leScsICAnYWdlJzogMzYgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgICdhZ2UnOiA0MCB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdwZWJibGVzJywgJ2FnZSc6IDEgfVxuICAgICAqIF07XG4gICAgICpcbiAgICAgKiB2YXIgeW91bmdlc3QgPSBfLmNoYWluKGNoYXJhY3RlcnMpXG4gICAgICogICAgIC5zb3J0QnkoJ2FnZScpXG4gICAgICogICAgIC5tYXAoZnVuY3Rpb24oY2hyKSB7IHJldHVybiBjaHIubmFtZSArICcgaXMgJyArIGNoci5hZ2U7IH0pXG4gICAgICogICAgIC5maXJzdCgpXG4gICAgICogICAgIC52YWx1ZSgpO1xuICAgICAqIC8vID0+ICdwZWJibGVzIGlzIDEnXG4gICAgICovXG4gICAgZnVuY3Rpb24gY2hhaW4odmFsdWUpIHtcbiAgICAgIHZhbHVlID0gbmV3IGxvZGFzaFdyYXBwZXIodmFsdWUpO1xuICAgICAgdmFsdWUuX19jaGFpbl9fID0gdHJ1ZTtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnZva2VzIGBpbnRlcmNlcHRvcmAgd2l0aCB0aGUgYHZhbHVlYCBhcyB0aGUgZmlyc3QgYXJndW1lbnQgYW5kIHRoZW5cbiAgICAgKiByZXR1cm5zIGB2YWx1ZWAuIFRoZSBwdXJwb3NlIG9mIHRoaXMgbWV0aG9kIGlzIHRvIFwidGFwIGludG9cIiBhIG1ldGhvZFxuICAgICAqIGNoYWluIGluIG9yZGVyIHRvIHBlcmZvcm0gb3BlcmF0aW9ucyBvbiBpbnRlcm1lZGlhdGUgcmVzdWx0cyB3aXRoaW5cbiAgICAgKiB0aGUgY2hhaW4uXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgQ2hhaW5pbmdcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBwcm92aWRlIHRvIGBpbnRlcmNlcHRvcmAuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gaW50ZXJjZXB0b3IgVGhlIGZ1bmN0aW9uIHRvIGludm9rZS5cbiAgICAgKiBAcmV0dXJucyB7Kn0gUmV0dXJucyBgdmFsdWVgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfKFsxLCAyLCAzLCA0XSlcbiAgICAgKiAgLnRhcChmdW5jdGlvbihhcnJheSkgeyBhcnJheS5wb3AoKTsgfSlcbiAgICAgKiAgLnJldmVyc2UoKVxuICAgICAqICAudmFsdWUoKTtcbiAgICAgKiAvLyA9PiBbMywgMiwgMV1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0YXAodmFsdWUsIGludGVyY2VwdG9yKSB7XG4gICAgICBpbnRlcmNlcHRvcih2YWx1ZSk7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRW5hYmxlcyBleHBsaWNpdCBtZXRob2QgY2hhaW5pbmcgb24gdGhlIHdyYXBwZXIgb2JqZWN0LlxuICAgICAqXG4gICAgICogQG5hbWUgY2hhaW5cbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBDaGFpbmluZ1xuICAgICAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSB3cmFwcGVyIG9iamVjdC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIGNoYXJhY3RlcnMgPSBbXG4gICAgICogICB7ICduYW1lJzogJ2Jhcm5leScsICdhZ2UnOiAzNiB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdmcmVkJywgICAnYWdlJzogNDAgfVxuICAgICAqIF07XG4gICAgICpcbiAgICAgKiAvLyB3aXRob3V0IGV4cGxpY2l0IGNoYWluaW5nXG4gICAgICogXyhjaGFyYWN0ZXJzKS5maXJzdCgpO1xuICAgICAqIC8vID0+IHsgJ25hbWUnOiAnYmFybmV5JywgJ2FnZSc6IDM2IH1cbiAgICAgKlxuICAgICAqIC8vIHdpdGggZXhwbGljaXQgY2hhaW5pbmdcbiAgICAgKiBfKGNoYXJhY3RlcnMpLmNoYWluKClcbiAgICAgKiAgIC5maXJzdCgpXG4gICAgICogICAucGljaygnYWdlJylcbiAgICAgKiAgIC52YWx1ZSgpO1xuICAgICAqIC8vID0+IHsgJ2FnZSc6IDM2IH1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB3cmFwcGVyQ2hhaW4oKSB7XG4gICAgICB0aGlzLl9fY2hhaW5fXyA9IHRydWU7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcm9kdWNlcyB0aGUgYHRvU3RyaW5nYCByZXN1bHQgb2YgdGhlIHdyYXBwZWQgdmFsdWUuXG4gICAgICpcbiAgICAgKiBAbmFtZSB0b1N0cmluZ1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IENoYWluaW5nXG4gICAgICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgc3RyaW5nIHJlc3VsdC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXyhbMSwgMiwgM10pLnRvU3RyaW5nKCk7XG4gICAgICogLy8gPT4gJzEsMiwzJ1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIHdyYXBwZXJUb1N0cmluZygpIHtcbiAgICAgIHJldHVybiBTdHJpbmcodGhpcy5fX3dyYXBwZWRfXyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXh0cmFjdHMgdGhlIHdyYXBwZWQgdmFsdWUuXG4gICAgICpcbiAgICAgKiBAbmFtZSB2YWx1ZU9mXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAYWxpYXMgdmFsdWVcbiAgICAgKiBAY2F0ZWdvcnkgQ2hhaW5pbmdcbiAgICAgKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgd3JhcHBlZCB2YWx1ZS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXyhbMSwgMiwgM10pLnZhbHVlT2YoKTtcbiAgICAgKiAvLyA9PiBbMSwgMiwgM11cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB3cmFwcGVyVmFsdWVPZigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9fd3JhcHBlZF9fO1xuICAgIH1cblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgLy8gYWRkIGZ1bmN0aW9ucyB0aGF0IHJldHVybiB3cmFwcGVkIHZhbHVlcyB3aGVuIGNoYWluaW5nXG4gICAgbG9kYXNoLmFmdGVyID0gYWZ0ZXI7XG4gICAgbG9kYXNoLmFzc2lnbiA9IGFzc2lnbjtcbiAgICBsb2Rhc2guYXQgPSBhdDtcbiAgICBsb2Rhc2guYmluZCA9IGJpbmQ7XG4gICAgbG9kYXNoLmJpbmRBbGwgPSBiaW5kQWxsO1xuICAgIGxvZGFzaC5iaW5kS2V5ID0gYmluZEtleTtcbiAgICBsb2Rhc2guY2hhaW4gPSBjaGFpbjtcbiAgICBsb2Rhc2guY29tcGFjdCA9IGNvbXBhY3Q7XG4gICAgbG9kYXNoLmNvbXBvc2UgPSBjb21wb3NlO1xuICAgIGxvZGFzaC5jb25zdGFudCA9IGNvbnN0YW50O1xuICAgIGxvZGFzaC5jb3VudEJ5ID0gY291bnRCeTtcbiAgICBsb2Rhc2guY3JlYXRlID0gY3JlYXRlO1xuICAgIGxvZGFzaC5jcmVhdGVDYWxsYmFjayA9IGNyZWF0ZUNhbGxiYWNrO1xuICAgIGxvZGFzaC5jdXJyeSA9IGN1cnJ5O1xuICAgIGxvZGFzaC5kZWJvdW5jZSA9IGRlYm91bmNlO1xuICAgIGxvZGFzaC5kZWZhdWx0cyA9IGRlZmF1bHRzO1xuICAgIGxvZGFzaC5kZWZlciA9IGRlZmVyO1xuICAgIGxvZGFzaC5kZWxheSA9IGRlbGF5O1xuICAgIGxvZGFzaC5kaWZmZXJlbmNlID0gZGlmZmVyZW5jZTtcbiAgICBsb2Rhc2guZmlsdGVyID0gZmlsdGVyO1xuICAgIGxvZGFzaC5mbGF0dGVuID0gZmxhdHRlbjtcbiAgICBsb2Rhc2guZm9yRWFjaCA9IGZvckVhY2g7XG4gICAgbG9kYXNoLmZvckVhY2hSaWdodCA9IGZvckVhY2hSaWdodDtcbiAgICBsb2Rhc2guZm9ySW4gPSBmb3JJbjtcbiAgICBsb2Rhc2guZm9ySW5SaWdodCA9IGZvckluUmlnaHQ7XG4gICAgbG9kYXNoLmZvck93biA9IGZvck93bjtcbiAgICBsb2Rhc2guZm9yT3duUmlnaHQgPSBmb3JPd25SaWdodDtcbiAgICBsb2Rhc2guZnVuY3Rpb25zID0gZnVuY3Rpb25zO1xuICAgIGxvZGFzaC5ncm91cEJ5ID0gZ3JvdXBCeTtcbiAgICBsb2Rhc2guaW5kZXhCeSA9IGluZGV4Qnk7XG4gICAgbG9kYXNoLmluaXRpYWwgPSBpbml0aWFsO1xuICAgIGxvZGFzaC5pbnRlcnNlY3Rpb24gPSBpbnRlcnNlY3Rpb247XG4gICAgbG9kYXNoLmludmVydCA9IGludmVydDtcbiAgICBsb2Rhc2guaW52b2tlID0gaW52b2tlO1xuICAgIGxvZGFzaC5rZXlzID0ga2V5cztcbiAgICBsb2Rhc2gubWFwID0gbWFwO1xuICAgIGxvZGFzaC5tYXBWYWx1ZXMgPSBtYXBWYWx1ZXM7XG4gICAgbG9kYXNoLm1heCA9IG1heDtcbiAgICBsb2Rhc2gubWVtb2l6ZSA9IG1lbW9pemU7XG4gICAgbG9kYXNoLm1lcmdlID0gbWVyZ2U7XG4gICAgbG9kYXNoLm1pbiA9IG1pbjtcbiAgICBsb2Rhc2gub21pdCA9IG9taXQ7XG4gICAgbG9kYXNoLm9uY2UgPSBvbmNlO1xuICAgIGxvZGFzaC5wYWlycyA9IHBhaXJzO1xuICAgIGxvZGFzaC5wYXJ0aWFsID0gcGFydGlhbDtcbiAgICBsb2Rhc2gucGFydGlhbFJpZ2h0ID0gcGFydGlhbFJpZ2h0O1xuICAgIGxvZGFzaC5waWNrID0gcGljaztcbiAgICBsb2Rhc2gucGx1Y2sgPSBwbHVjaztcbiAgICBsb2Rhc2gucHJvcGVydHkgPSBwcm9wZXJ0eTtcbiAgICBsb2Rhc2gucHVsbCA9IHB1bGw7XG4gICAgbG9kYXNoLnJhbmdlID0gcmFuZ2U7XG4gICAgbG9kYXNoLnJlamVjdCA9IHJlamVjdDtcbiAgICBsb2Rhc2gucmVtb3ZlID0gcmVtb3ZlO1xuICAgIGxvZGFzaC5yZXN0ID0gcmVzdDtcbiAgICBsb2Rhc2guc2h1ZmZsZSA9IHNodWZmbGU7XG4gICAgbG9kYXNoLnNvcnRCeSA9IHNvcnRCeTtcbiAgICBsb2Rhc2gudGFwID0gdGFwO1xuICAgIGxvZGFzaC50aHJvdHRsZSA9IHRocm90dGxlO1xuICAgIGxvZGFzaC50aW1lcyA9IHRpbWVzO1xuICAgIGxvZGFzaC50b0FycmF5ID0gdG9BcnJheTtcbiAgICBsb2Rhc2gudHJhbnNmb3JtID0gdHJhbnNmb3JtO1xuICAgIGxvZGFzaC51bmlvbiA9IHVuaW9uO1xuICAgIGxvZGFzaC51bmlxID0gdW5pcTtcbiAgICBsb2Rhc2gudmFsdWVzID0gdmFsdWVzO1xuICAgIGxvZGFzaC53aGVyZSA9IHdoZXJlO1xuICAgIGxvZGFzaC53aXRob3V0ID0gd2l0aG91dDtcbiAgICBsb2Rhc2gud3JhcCA9IHdyYXA7XG4gICAgbG9kYXNoLnhvciA9IHhvcjtcbiAgICBsb2Rhc2guemlwID0gemlwO1xuICAgIGxvZGFzaC56aXBPYmplY3QgPSB6aXBPYmplY3Q7XG5cbiAgICAvLyBhZGQgYWxpYXNlc1xuICAgIGxvZGFzaC5jb2xsZWN0ID0gbWFwO1xuICAgIGxvZGFzaC5kcm9wID0gcmVzdDtcbiAgICBsb2Rhc2guZWFjaCA9IGZvckVhY2g7XG4gICAgbG9kYXNoLmVhY2hSaWdodCA9IGZvckVhY2hSaWdodDtcbiAgICBsb2Rhc2guZXh0ZW5kID0gYXNzaWduO1xuICAgIGxvZGFzaC5tZXRob2RzID0gZnVuY3Rpb25zO1xuICAgIGxvZGFzaC5vYmplY3QgPSB6aXBPYmplY3Q7XG4gICAgbG9kYXNoLnNlbGVjdCA9IGZpbHRlcjtcbiAgICBsb2Rhc2gudGFpbCA9IHJlc3Q7XG4gICAgbG9kYXNoLnVuaXF1ZSA9IHVuaXE7XG4gICAgbG9kYXNoLnVuemlwID0gemlwO1xuXG4gICAgLy8gYWRkIGZ1bmN0aW9ucyB0byBgbG9kYXNoLnByb3RvdHlwZWBcbiAgICBtaXhpbihsb2Rhc2gpO1xuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvLyBhZGQgZnVuY3Rpb25zIHRoYXQgcmV0dXJuIHVud3JhcHBlZCB2YWx1ZXMgd2hlbiBjaGFpbmluZ1xuICAgIGxvZGFzaC5jbG9uZSA9IGNsb25lO1xuICAgIGxvZGFzaC5jbG9uZURlZXAgPSBjbG9uZURlZXA7XG4gICAgbG9kYXNoLmNvbnRhaW5zID0gY29udGFpbnM7XG4gICAgbG9kYXNoLmVzY2FwZSA9IGVzY2FwZTtcbiAgICBsb2Rhc2guZXZlcnkgPSBldmVyeTtcbiAgICBsb2Rhc2guZmluZCA9IGZpbmQ7XG4gICAgbG9kYXNoLmZpbmRJbmRleCA9IGZpbmRJbmRleDtcbiAgICBsb2Rhc2guZmluZEtleSA9IGZpbmRLZXk7XG4gICAgbG9kYXNoLmZpbmRMYXN0ID0gZmluZExhc3Q7XG4gICAgbG9kYXNoLmZpbmRMYXN0SW5kZXggPSBmaW5kTGFzdEluZGV4O1xuICAgIGxvZGFzaC5maW5kTGFzdEtleSA9IGZpbmRMYXN0S2V5O1xuICAgIGxvZGFzaC5oYXMgPSBoYXM7XG4gICAgbG9kYXNoLmlkZW50aXR5ID0gaWRlbnRpdHk7XG4gICAgbG9kYXNoLmluZGV4T2YgPSBpbmRleE9mO1xuICAgIGxvZGFzaC5pc0FyZ3VtZW50cyA9IGlzQXJndW1lbnRzO1xuICAgIGxvZGFzaC5pc0FycmF5ID0gaXNBcnJheTtcbiAgICBsb2Rhc2guaXNCb29sZWFuID0gaXNCb29sZWFuO1xuICAgIGxvZGFzaC5pc0RhdGUgPSBpc0RhdGU7XG4gICAgbG9kYXNoLmlzRWxlbWVudCA9IGlzRWxlbWVudDtcbiAgICBsb2Rhc2guaXNFbXB0eSA9IGlzRW1wdHk7XG4gICAgbG9kYXNoLmlzRXF1YWwgPSBpc0VxdWFsO1xuICAgIGxvZGFzaC5pc0Zpbml0ZSA9IGlzRmluaXRlO1xuICAgIGxvZGFzaC5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcbiAgICBsb2Rhc2guaXNOYU4gPSBpc05hTjtcbiAgICBsb2Rhc2guaXNOdWxsID0gaXNOdWxsO1xuICAgIGxvZGFzaC5pc051bWJlciA9IGlzTnVtYmVyO1xuICAgIGxvZGFzaC5pc09iamVjdCA9IGlzT2JqZWN0O1xuICAgIGxvZGFzaC5pc1BsYWluT2JqZWN0ID0gaXNQbGFpbk9iamVjdDtcbiAgICBsb2Rhc2guaXNSZWdFeHAgPSBpc1JlZ0V4cDtcbiAgICBsb2Rhc2guaXNTdHJpbmcgPSBpc1N0cmluZztcbiAgICBsb2Rhc2guaXNVbmRlZmluZWQgPSBpc1VuZGVmaW5lZDtcbiAgICBsb2Rhc2gubGFzdEluZGV4T2YgPSBsYXN0SW5kZXhPZjtcbiAgICBsb2Rhc2gubWl4aW4gPSBtaXhpbjtcbiAgICBsb2Rhc2gubm9Db25mbGljdCA9IG5vQ29uZmxpY3Q7XG4gICAgbG9kYXNoLm5vb3AgPSBub29wO1xuICAgIGxvZGFzaC5ub3cgPSBub3c7XG4gICAgbG9kYXNoLnBhcnNlSW50ID0gcGFyc2VJbnQ7XG4gICAgbG9kYXNoLnJhbmRvbSA9IHJhbmRvbTtcbiAgICBsb2Rhc2gucmVkdWNlID0gcmVkdWNlO1xuICAgIGxvZGFzaC5yZWR1Y2VSaWdodCA9IHJlZHVjZVJpZ2h0O1xuICAgIGxvZGFzaC5yZXN1bHQgPSByZXN1bHQ7XG4gICAgbG9kYXNoLnJ1bkluQ29udGV4dCA9IHJ1bkluQ29udGV4dDtcbiAgICBsb2Rhc2guc2l6ZSA9IHNpemU7XG4gICAgbG9kYXNoLnNvbWUgPSBzb21lO1xuICAgIGxvZGFzaC5zb3J0ZWRJbmRleCA9IHNvcnRlZEluZGV4O1xuICAgIGxvZGFzaC50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgIGxvZGFzaC51bmVzY2FwZSA9IHVuZXNjYXBlO1xuICAgIGxvZGFzaC51bmlxdWVJZCA9IHVuaXF1ZUlkO1xuXG4gICAgLy8gYWRkIGFsaWFzZXNcbiAgICBsb2Rhc2guYWxsID0gZXZlcnk7XG4gICAgbG9kYXNoLmFueSA9IHNvbWU7XG4gICAgbG9kYXNoLmRldGVjdCA9IGZpbmQ7XG4gICAgbG9kYXNoLmZpbmRXaGVyZSA9IGZpbmQ7XG4gICAgbG9kYXNoLmZvbGRsID0gcmVkdWNlO1xuICAgIGxvZGFzaC5mb2xkciA9IHJlZHVjZVJpZ2h0O1xuICAgIGxvZGFzaC5pbmNsdWRlID0gY29udGFpbnM7XG4gICAgbG9kYXNoLmluamVjdCA9IHJlZHVjZTtcblxuICAgIG1peGluKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNvdXJjZSA9IHt9XG4gICAgICBmb3JPd24obG9kYXNoLCBmdW5jdGlvbihmdW5jLCBtZXRob2ROYW1lKSB7XG4gICAgICAgIGlmICghbG9kYXNoLnByb3RvdHlwZVttZXRob2ROYW1lXSkge1xuICAgICAgICAgIHNvdXJjZVttZXRob2ROYW1lXSA9IGZ1bmM7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHNvdXJjZTtcbiAgICB9KCksIGZhbHNlKTtcblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgLy8gYWRkIGZ1bmN0aW9ucyBjYXBhYmxlIG9mIHJldHVybmluZyB3cmFwcGVkIGFuZCB1bndyYXBwZWQgdmFsdWVzIHdoZW4gY2hhaW5pbmdcbiAgICBsb2Rhc2guZmlyc3QgPSBmaXJzdDtcbiAgICBsb2Rhc2gubGFzdCA9IGxhc3Q7XG4gICAgbG9kYXNoLnNhbXBsZSA9IHNhbXBsZTtcblxuICAgIC8vIGFkZCBhbGlhc2VzXG4gICAgbG9kYXNoLnRha2UgPSBmaXJzdDtcbiAgICBsb2Rhc2guaGVhZCA9IGZpcnN0O1xuXG4gICAgZm9yT3duKGxvZGFzaCwgZnVuY3Rpb24oZnVuYywgbWV0aG9kTmFtZSkge1xuICAgICAgdmFyIGNhbGxiYWNrYWJsZSA9IG1ldGhvZE5hbWUgIT09ICdzYW1wbGUnO1xuICAgICAgaWYgKCFsb2Rhc2gucHJvdG90eXBlW21ldGhvZE5hbWVdKSB7XG4gICAgICAgIGxvZGFzaC5wcm90b3R5cGVbbWV0aG9kTmFtZV09IGZ1bmN0aW9uKG4sIGd1YXJkKSB7XG4gICAgICAgICAgdmFyIGNoYWluQWxsID0gdGhpcy5fX2NoYWluX18sXG4gICAgICAgICAgICAgIHJlc3VsdCA9IGZ1bmModGhpcy5fX3dyYXBwZWRfXywgbiwgZ3VhcmQpO1xuXG4gICAgICAgICAgcmV0dXJuICFjaGFpbkFsbCAmJiAobiA9PSBudWxsIHx8IChndWFyZCAmJiAhKGNhbGxiYWNrYWJsZSAmJiB0eXBlb2YgbiA9PSAnZnVuY3Rpb24nKSkpXG4gICAgICAgICAgICA/IHJlc3VsdFxuICAgICAgICAgICAgOiBuZXcgbG9kYXNoV3JhcHBlcihyZXN1bHQsIGNoYWluQWxsKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgLyoqXG4gICAgICogVGhlIHNlbWFudGljIHZlcnNpb24gbnVtYmVyLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQHR5cGUgc3RyaW5nXG4gICAgICovXG4gICAgbG9kYXNoLlZFUlNJT04gPSAnMi40LjInO1xuXG4gICAgLy8gYWRkIFwiQ2hhaW5pbmdcIiBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXJcbiAgICBsb2Rhc2gucHJvdG90eXBlLmNoYWluID0gd3JhcHBlckNoYWluO1xuICAgIGxvZGFzaC5wcm90b3R5cGUudG9TdHJpbmcgPSB3cmFwcGVyVG9TdHJpbmc7XG4gICAgbG9kYXNoLnByb3RvdHlwZS52YWx1ZSA9IHdyYXBwZXJWYWx1ZU9mO1xuICAgIGxvZGFzaC5wcm90b3R5cGUudmFsdWVPZiA9IHdyYXBwZXJWYWx1ZU9mO1xuXG4gICAgLy8gYWRkIGBBcnJheWAgZnVuY3Rpb25zIHRoYXQgcmV0dXJuIHVud3JhcHBlZCB2YWx1ZXNcbiAgICBmb3JFYWNoKFsnam9pbicsICdwb3AnLCAnc2hpZnQnXSwgZnVuY3Rpb24obWV0aG9kTmFtZSkge1xuICAgICAgdmFyIGZ1bmMgPSBhcnJheVJlZlttZXRob2ROYW1lXTtcbiAgICAgIGxvZGFzaC5wcm90b3R5cGVbbWV0aG9kTmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNoYWluQWxsID0gdGhpcy5fX2NoYWluX18sXG4gICAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXMuX193cmFwcGVkX18sIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgcmV0dXJuIGNoYWluQWxsXG4gICAgICAgICAgPyBuZXcgbG9kYXNoV3JhcHBlcihyZXN1bHQsIGNoYWluQWxsKVxuICAgICAgICAgIDogcmVzdWx0O1xuICAgICAgfTtcbiAgICB9KTtcblxuICAgIC8vIGFkZCBgQXJyYXlgIGZ1bmN0aW9ucyB0aGF0IHJldHVybiB0aGUgZXhpc3Rpbmcgd3JhcHBlZCB2YWx1ZVxuICAgIGZvckVhY2goWydwdXNoJywgJ3JldmVyc2UnLCAnc29ydCcsICd1bnNoaWZ0J10sIGZ1bmN0aW9uKG1ldGhvZE5hbWUpIHtcbiAgICAgIHZhciBmdW5jID0gYXJyYXlSZWZbbWV0aG9kTmFtZV07XG4gICAgICBsb2Rhc2gucHJvdG90eXBlW21ldGhvZE5hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGZ1bmMuYXBwbHkodGhpcy5fX3dyYXBwZWRfXywgYXJndW1lbnRzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgLy8gYWRkIGBBcnJheWAgZnVuY3Rpb25zIHRoYXQgcmV0dXJuIG5ldyB3cmFwcGVkIHZhbHVlc1xuICAgIGZvckVhY2goWydjb25jYXQnLCAnc2xpY2UnLCAnc3BsaWNlJ10sIGZ1bmN0aW9uKG1ldGhvZE5hbWUpIHtcbiAgICAgIHZhciBmdW5jID0gYXJyYXlSZWZbbWV0aG9kTmFtZV07XG4gICAgICBsb2Rhc2gucHJvdG90eXBlW21ldGhvZE5hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgbG9kYXNoV3JhcHBlcihmdW5jLmFwcGx5KHRoaXMuX193cmFwcGVkX18sIGFyZ3VtZW50cyksIHRoaXMuX19jaGFpbl9fKTtcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICByZXR1cm4gbG9kYXNoO1xuICB9XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgLy8gZXhwb3NlIExvLURhc2hcbiAgdmFyIF8gPSBydW5JbkNvbnRleHQoKTtcblxuICAvLyBzb21lIEFNRCBidWlsZCBvcHRpbWl6ZXJzIGxpa2Ugci5qcyBjaGVjayBmb3IgY29uZGl0aW9uIHBhdHRlcm5zIGxpa2UgdGhlIGZvbGxvd2luZzpcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCA9PSAnb2JqZWN0JyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gRXhwb3NlIExvLURhc2ggdG8gdGhlIGdsb2JhbCBvYmplY3QgZXZlbiB3aGVuIGFuIEFNRCBsb2FkZXIgaXMgcHJlc2VudCBpblxuICAgIC8vIGNhc2UgTG8tRGFzaCBpcyBsb2FkZWQgd2l0aCBhIFJlcXVpcmVKUyBzaGltIGNvbmZpZy5cbiAgICAvLyBTZWUgaHR0cDovL3JlcXVpcmVqcy5vcmcvZG9jcy9hcGkuaHRtbCNjb25maWctc2hpbVxuICAgIHJvb3QuXyA9IF87XG5cbiAgICAvLyBkZWZpbmUgYXMgYW4gYW5vbnltb3VzIG1vZHVsZSBzbywgdGhyb3VnaCBwYXRoIG1hcHBpbmcsIGl0IGNhbiBiZVxuICAgIC8vIHJlZmVyZW5jZWQgYXMgdGhlIFwidW5kZXJzY29yZVwiIG1vZHVsZVxuICAgIGRlZmluZShmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfO1xuICAgIH0pO1xuICB9XG4gIC8vIGNoZWNrIGZvciBgZXhwb3J0c2AgYWZ0ZXIgYGRlZmluZWAgaW4gY2FzZSBhIGJ1aWxkIG9wdGltaXplciBhZGRzIGFuIGBleHBvcnRzYCBvYmplY3RcbiAgZWxzZSBpZiAoZnJlZUV4cG9ydHMgJiYgZnJlZU1vZHVsZSkge1xuICAgIC8vIGluIE5vZGUuanMgb3IgUmluZ29KU1xuICAgIGlmIChtb2R1bGVFeHBvcnRzKSB7XG4gICAgICAoZnJlZU1vZHVsZS5leHBvcnRzID0gXykuXyA9IF87XG4gICAgfVxuICAgIC8vIGluIE5hcndoYWwgb3IgUmhpbm8gLXJlcXVpcmVcbiAgICBlbHNlIHtcbiAgICAgIGZyZWVFeHBvcnRzLl8gPSBfO1xuICAgIH1cbiAgfVxuICBlbHNlIHtcbiAgICAvLyBpbiBhIGJyb3dzZXIgb3IgUmhpbm9cbiAgICByb290Ll8gPSBfO1xuICB9XG59LmNhbGwodGhpcykpO1xuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLyoqXHJcbiAqIFNldHMgdGhlIGFwcHJvcHJpYXRlIGJhY2tncm91bmQgaW1hZ2UgYmFzZWQgb24gdGhlIGFjdHVhbCBob3VyIG9mIHRoZSBkYXkgYW5kIHVzZXIgZGVmaW5lZCBpbWFnZSBpdGVtcy9zbG90c1xyXG4gKlxyXG4gKi9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cclxuICAgIHNldEltYWdlOiBmdW5jdGlvbih0aW1lU2xvdHMpe1xyXG4gICAgICAgIHZhciBnZXRNaW51dGUgPSBmdW5jdGlvbihkYXRlKXsgcmV0dXJuIGRhdGUuZ2V0SG91cnMoKSo2MCtkYXRlLmdldE1pbnV0ZXMoKTsgfTtcclxuLy8tLS0tLSByZXR1cm4gaW1tZWRpYXRlbHkgaWYgdGhlcmUgYXJlIG5vIHVzZXIgZGVmaW5lZCB0aW1lIHNsb3RzL2ltYWdlc1xyXG4gICAgICAgIGlmICh0aW1lU2xvdHMubGVuZ3RoPT09MCkgcmV0dXJuO1xyXG4vLy0tLS0tIGdldCB0aGUgY3VycmVudCBtaW51dGUgb2YgdGhlIGRheVxyXG4gICAgICAgIHZhciBoID0gZ2V0TWludXRlKG5ldyBEYXRlKCkpO1xyXG4vLy0tLS0tIGNoZWNrIHdpdGggZWFjaCB0aW1lc2xvdCB0byBmaW5kIHRoZSBhcHByb3ByaWF0ZSBlbnRyeVxyXG4gICAgICAgICQuZWFjaCggdGltZVNsb3RzLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBpZiAoaD49Z2V0TWludXRlKHRoaXMuZnJvbSkgJiYgaDw9Z2V0TWludXRlKHRoaXMudG8pKXtcclxuICAgICAgICAgICAgICAgIHZhciAkYm9keSA9ICQoJ2JvZHknKTtcclxuLy8tLS0tLS0tLS0tLS0tIGRvIG5vdGhpbmcgaWYgdGhpcyBiYWNrZ3JvdW5kIGltYWdlIGhhcyBhbHJlYWR5IGJlZW4gaW5zdGFsbGVkIGJlZm9yZVxyXG4gICAgICAgICAgICAgICAgaWYgKCRib2R5LmRhdGEoJ3VybCcpPT09dGhpcy5ocmVmKSByZXR1cm4gZmFsc2U7XHJcbi8vLS0tLS0tLS0tLS0tLSBvbmNlIHRpbWVzbG90IHdhcyBmb3VuZCwgcHJlbG9hZCB0aGUgaW1hZ2VcclxuICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICAgICAgICAgICQoJzxpbWcvPicpLmF0dHIoJ3NyYycsIHNlbGYuaHJlZikubG9hZCggZnVuY3Rpb24oKXtcclxuLy8tLS0tLS0tLS0tLS0tLS0tLSByZW1vdmUgdGhlIHRlbXAgaW1nIHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzXHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmUoKTtcclxuLy8tLS0tLS0tLS0tLS0tLS0tLSBub3cgc2V0IHRoZSBiYWNrZ3JvdW5kLWltYWdlIHdpdGggYWxsIHBhcmFtc1xyXG4gICAgICAgICAgICAgICAgICAgICRib2R5LmRhdGEoJ3VybCcsIHNlbGYuaHJlZilcclxuICAgICAgICAgICAgICAgICAgICAgICAgIC5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2JhY2tncm91bmQtaW1hZ2UnOiAndXJsKFwiJytzZWxmLmhyZWYrJ1wiKScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYmFja2dyb3VuZC1yZXBlYXQnOiBzZWxmLnJlcGVhdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdiYWNrZ3JvdW5kLXBvc2l0aW9uJzogc2VsZi5wb3NpdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdiYWNrZ3JvdW5kLWF0dGFjaG1lbnQnOiBzZWxmLmF0dGFjaG1lbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYmFja2dyb3VuZC1zaXplJzogc2VsZi5zaXplLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2hlaWdodCc6ICcxMDAlJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tIGFuZCBmYWRlIHRoZSBwcmVsb2FkaW5nIGFuaW1hdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICQoXCIjbG9hZGVyLXdyYXBwZXJcIikuZmFkZU91dChcInNsb3dcIik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuLy8tLS0tLS0tLS0tLS0tIHRoZW4gcXVpdCB0aGUgZWFjaCBsb29wXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbn07IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLyoqXHJcbiAqIEFkZHMgYWRkaXRpb25hbCBjbGFzc2VzIHRvIHRoZSBCT0RZIGVsZW1lbnRcclxuICogb25Ib21lIH4gaWYgdGhlIGhvbWVwYWdlIGlzIGRpc3BsYXllZFxyXG4gKiBvblRvcGljIH4gaWYgYSB0b3BpYyBwYWdlIGlzIGRpc3BsYXllZFxyXG4gKiB0b3BpYy17dG9waWNJRH0gfiBJRCBvZiB0aGUgdG9waWMgKGxvd2VyY2FzZSBJRClcclxuICogb25TdG9yeSB+IGlmIGEgc3RvcnkgaXMgZGlzcGxheWVkXHJcbiAqIHN0b3J5LXtzdG9yeUlEfSB+IElEIG9mIHRoZSBzdG9yeSAobG93ZXJjYXNlIElEKVxyXG4gKlxyXG4gKiBFeGFtcGxlczpcclxuICogcGF0aG5hbWU9XCIvXCIgPT09PiBib2R5Y2xhc3M9XCJvbkhvbWVcIlxyXG4gKiBwYXRobmFtZT1cIi90b3BpY3MvVGVzdHRoZW1hL1wiID09PiBib2R5Y2xhc3M9XCJvblRvcGljIHRvcGljLXRlc3R0aGVtYVwiXHJcbiAqIHBhdGhuYW1lPVwiL3N0b3JpZXMvaXMtaXQtbWUteW91cmUtbG9va2luZy1mb3IvXCIgPT0+IGJvZHljbGFzcz1cIm9uU3Rvcnkgc3RvcnktaXMtaXQtbWUteW91cmUtbG9va2luZy1mb3JcIlxyXG4gKlxyXG4gKi9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcclxuXHJcbiAgICB2YXIgYm9keWNsYXNzID0gXCJcIjtcclxuICAgIGlmIChsb2NhdGlvbi5wYXRobmFtZSA9PT0gXCIvXCIpIGJvZHljbGFzcyA9IFwib25Ib21lXCI7XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB2YXIgcGF0aCA9IGxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoL1xcLy9nLCBcIiBcIikudHJpbSgpLnNwbGl0KFwiIFwiKTtcclxuICAgICAgICBzd2l0Y2ggKHBhdGhbMF0pIHtcclxuICAgICAgICAgICAgY2FzZSBcInRvcGljc1wiOiAgYm9keWNsYXNzID0gXCJvblRvcGljIFwiICsgcGF0aFsxXS50b0xvd2VyQ2FzZSgpOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBcInN0b3JpZXNcIjogYm9keWNsYXNzID0gXCJvblN0b3J5IFwiICsgcGF0aFsxXS50b0xvd2VyQ2FzZSgpOyBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoYm9keWNsYXNzLmxlbmd0aD4wKSAkKFwiYm9keVwiKS5hZGRDbGFzcyhib2R5Y2xhc3MpO1xyXG5cclxufTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCRyb290U2NvcGUsICRmaWx0ZXIsICRxLCBVcGRhdGVDaGVjaywgVHdvZGF5U2tpbiwgdG9hc3RyKXtcclxuICAgIFxyXG4gICAgdmFyIHZtID0gdGhpcztcclxuICAgIFxyXG4gICAgdm0ucGFyYW0gPSAkcm9vdFNjb3BlLnBhcmFtO1xyXG5cclxuICAgIHZtLm1zZ0Nsb3NlID0gdHJ1ZTtcclxuICAgIHZtLmlzQ2hlY2tpbmcgPSBmYWxzZTtcclxuXHJcbiAgICB2bS5kYXRlTmV4dENoZWNrID0gZnVuY3Rpb24oKXtcclxuICAgICAgICByZXR1cm4gKHZtLnBhcmFtLnVwZGF0ZS5nYXA8MFxyXG4gICAgICAgICAgICA/IFwiS2VpbmUgUHLDvGZ1bmdcIlxyXG4gICAgICAgICAgICA6ICRmaWx0ZXIoJ2RhdGUnKShuZXcgRGF0ZSh2bS5wYXJhbS51cGRhdGUubGFzdENoZWNrLmdldFRpbWUoKSt2bS5wYXJhbS51cGRhdGUuZ2FwKSwgXCJkZC5NTS55eXl5IEhIOm1tXCIpKTtcclxuICAgIH07XHJcblxyXG4gICAgdm0udXBkYXRlQ2hlY2tzID0gW1xyXG4gICAgICAgIHsgY2hlY2s6IFwidMOkZ2xpY2hcIiwgZ2FwOiAyNCo2MCo2MCoxMDAwIH0sXHJcbiAgICAgICAgeyBjaGVjazogXCJ3w7ZjaGVudGxpY2hcIiwgZ2FwOiA3KjI0KjYwKjYwKjEwMDAgfSxcclxuICAgICAgICB7IGNoZWNrOiBcIm1vbmF0bGljaFwiLCBnYXA6IDMwKjI0KjYwKjYwKjEwMDAgfSxcclxuICAgICAgICB7IGNoZWNrOiBcIm5pZW1hbHNcIiwgZ2FwOiAtMSB9XHJcbiAgICBdO1xyXG5cclxuICAgIHZtLnVzZUZyZXF1ZW5jeSA9IGZ1bmN0aW9uKGluZGV4KXtcclxuICAgICAgICB2YXIgZnJlcXVlbmN5ID0gdm0udXBkYXRlQ2hlY2tzW2luZGV4XTtcclxuICAgICAgICB2bS5wYXJhbS51cGRhdGUuY2hlY2sgPSBmcmVxdWVuY3kuY2hlY2s7XHJcbiAgICAgICAgdm0ucGFyYW0udXBkYXRlLmdhcCA9IGZyZXF1ZW5jeS5nYXA7XHJcbiAgICB9O1xyXG5cclxuICAgIHZtLmNoZWNrU2tpblVwZGF0ZSA9IGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgICAgIHZhciBza2luRWRpdFVybCA9IHZtLnBhcmFtLmxheW91dFVybCtcInNraW5zL2VkaXQ/a2V5PVwiLFxyXG4gICAgICAgICAgICBwcm9taXNlcyA9IFtdO1xyXG5cclxuICAgICAgICAkLmVhY2goIHZtLnJlbGVhc2Uuc2tpbnMsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHByb21pc2VzLnB1c2goIFR3b2RheVNraW4uZ2V0KHNraW5FZGl0VXJsK3RoaXMubmFtZSkgKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJHEuYWxsKHByb21pc2VzKS50aGVuKCBmdW5jdGlvbihyZXN1bHRzKXsgLy8gc3VjY2VzczogYWxsIHNraW5zIHJlYWRcclxuXHJcbiAgICAgICAgICAgICQuZWFjaCggcmVzdWx0cywgZnVuY3Rpb24oaW5kZXgsIHJlc3BvbnNlKXsgLy8gcmVzcG9uc2UgPSB7Y29uZmlnLCBkYXRhLCBoZWFkZXJzLCBzdGF0dXMsIHN0YXR1c1RleHR9XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHNraW4gPSB2bS5yZWxlYXNlLnNraW5zW2luZGV4XTtcclxuICAgICAgICAgICAgICAgIHZhciAkZm9ybSA9ICQocmVzcG9uc2UuZGF0YSkuZmluZChcImZvcm1cIikuZXEoMCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2tpbkNvZGUgPSAkLnRyaW0oJGZvcm0uZmluZChcInRleHRhcmVhW25hbWU9c2tpbl1cIikudmFsKCkpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGlzU2tpbkluaXRpYWwgPSAoc2tpbkNvZGUubGVuZ3RoID09PSAwKTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygdm0ucGFyYW0udXBkYXRlLm92ZXJ3cml0ZVtza2luLm5hbWVdICE9PSBcInVuZGVmaW5lZFwiKXtcclxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2godm0ucGFyYW0udXBkYXRlLm92ZXJ3cml0ZVtza2luLm5hbWVdKXsgLy8gYWx3YXlzLCBuZXZlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiYWx3YXlzXCI6IHNraW4uc3RhdHVzID0gXCJuZWVkc3VwZGF0ZVwiOyBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIm5ldmVyXCI6ICBza2luLnN0YXR1cyA9IChpc1NraW5Jbml0aWFsID8gXCJuZWVkc3VwZGF0ZVwiIDogXCJza2lwcGVkXCIpOyBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHNraW4uc3RhdHVzID0gKHNraW4uY29udGVudC5sZW5ndGg9PT1za2luQ29kZS5sZW5ndGggJiYgc2tpbi5jb250ZW50PT09c2tpbkNvZGUgPyBcImlzZXF1YWxcIiA6IFwibmVlZHN1cGRhdGVcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkluZGV4OlwiLCBpbmRleCwgc2tpbi5uYW1lLCBpc1NraW5Jbml0aWFsLCBcIlJsc2U6XCIsIHNraW4uY29udGVudC5sZW5ndGgsIFwiQmxvZzpcIiwgc2tpbkNvZGUubGVuZ3RoLCBza2luLnN0YXR1cyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdm0ucmVsZWFzZUNoZWNrZWQgPSB0cnVlO1xyXG4gICAgICAgIH0sIGZ1bmN0aW9uKCl7IC8vIGVycm9yOiBhdCBsZWFzdCBvbmUgc2tpbiByZWFkIGZhaWxlZFxyXG4gICAgICAgICAgICB0b2FzdHIuZXJyb3IoXCJNaW5kZXN0ZW5zIGVpbiBTa2luIGtvbm50ZSBuaWNodCBmZWhsZXJmcmVpIGdlbGVzZW4gd2VyZGVuIVwiLCB2bS5wYXJhbS5tc2dIZWFkZXIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICB2bS5jaGVja1JlbGVhc2VVcGRhdGUgPSBmdW5jdGlvbigpe1xyXG5cclxuICAgICAgICB2bS5pc0NoZWNraW5nID0gdHJ1ZTtcclxuICAgICAgICB2bS5yZWxlYXNlTG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICB2bS5yZWxlYXNlQ2hlY2tlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBVcGRhdGVDaGVjay52ZXJpZnkodm0ucGFyYW0pLnRoZW4oXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uKHJlbGVhc2Upe1xyXG4gICAgICAgICAgICAgICAgdm0ucmVsZWFzZSA9IHJlbGVhc2UuZGF0YTtcclxuICAgICAgICAgICAgICAgIHZtLm5ld1ZlcnNpb24gPSByZWxlYXNlLm5ld1ZlcnNpb247XHJcbiAgICAgICAgICAgICAgICB2bS5tc2dDbG9zZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdm0ucGFyYW0udXBkYXRlLmxhc3RDaGVjayA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICAgICAgICB2bS5pc0NoZWNraW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAodm0ubmV3VmVyc2lvbikgdm0uY2hlY2tTa2luVXBkYXRlKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uKHN0YXR1cyl7XHJcbiAgICAgICAgICAgICAgICB2bS5pc0NoZWNraW5nID0gdm0ucmVsZWFzZUxvYWRlZCA9IHZtLm1zZ0Nsb3NlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgdm0udXBkYXRlU3RhdHVzID0gZnVuY3Rpb24oc2tpblN0YXR1cyl7XHJcblxyXG4gICAgICAgIHZhciB1cGRTdGF0dXMgPSB7XHJcbiAgICAgICAgICAgICAgICBcInVuY2hlY2tlZFwiOiAgICBcIm5vY2ggbmljaHQgZ2VwcsO8ZnRcIixcclxuICAgICAgICAgICAgICAgIFwiaXNlcXVhbFwiOiAgICAgIFwiaXN0IGJlcmVpdHMgYWt0dWVsbFwiLFxyXG4gICAgICAgICAgICAgICAgXCJuZWVkc3VwZGF0ZVwiOiAgXCJ3aXJkIGFrdHVhbGlzaWVydFwiLFxyXG4gICAgICAgICAgICAgICAgXCJ1cGRhdGVkXCI6ICAgICAgXCJ3dXJkZSBlcmZvbGdyZWljaCBha3R1YWxpc2llcnRcIixcclxuICAgICAgICAgICAgICAgIFwiZXJyb3JcIjogICAgICAgIFwiQWt0dWFsaXNpZXJ1bmcgZmVobGdlc2NobGFnZW5cIixcclxuICAgICAgICAgICAgICAgIFwic2tpcHBlZFwiOiAgICAgIFwiQmVudXR6ZXJza2luIGJsZWlidCB1bnZlcsOkbmRlcnRcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzdGF0UGFydHMgPSBza2luU3RhdHVzLnNwbGl0KFwiflwiKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHVwZFN0YXR1c1tzdGF0UGFydHNbMF1dKyhzdGF0UGFydHMubGVuZ3RoPjEgPyBcIi0+XCIrc3RhdFBhcnRzWzFdIDogXCJcIik7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB2bS5pbnN0YWxsUmVsZWFzZSA9IGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgICAgICQuZWFjaCggdm0ucmVsZWFzZS5za2lucywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIHNraW4gPSB0aGlzO1xyXG4gICAgICAgICAgICBpZiAoc2tpbi5zdGF0dXMgPT09IFwibmVlZHN1cGRhdGVcIil7XHJcbiAgICAgICAgICAgICAgICBUd29kYXlTa2luLnVwZGF0ZShza2luLCB2bS5wYXJhbSkudGhlbihmdW5jdGlvbihza2luKXtcclxuICAgICAgICAgICAgICAgICAgICAvLyBzdWNjZXNzOiBza2luLnN0YXR1cyBhbHJlYWR5IHVwZGF0ZWRcclxuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKHN0YXR1cywgc2tpbil7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZXJyb3I6IHNraW4uc3RhdHVzIGFscmVhZHkgdXBkYXRlZFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9O1xyXG5cclxufTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIGJhY2tncm91bmQgPSByZXF1aXJlKCcuLi9iYWNrZ3JvdW5kLmpzJyksXHJcbiAgICB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzLmpzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCRyb290U2NvcGUsIEltYWdlUHJvdmlkZXIsICR3aW5kb3csIHRvYXN0cil7XHJcbiAgICBcclxuICAgIHZhciB2bSA9IHRoaXM7XHJcbiAgICBcclxuICAgIHZtLnBhcmFtID0gJHJvb3RTY29wZS5wYXJhbTtcclxuXHJcbiAgICB2bS5wb3NpdGlvbnMgPSBbXHJcbiAgICAgICAgXCJsZWZ0IHRvcFwiLCBcImxlZnQgY2VudGVyXCIsIFwibGVmdCBib3R0b21cIixcclxuICAgICAgICBcInJpZ2h0IHRvcFwiLCBcInJpZ2h0IGNlbnRlclwiLCBcInJpZ2h0IGJvdHRvbVwiLFxyXG4gICAgICAgIFwiY2VudGVyIHRvcFwiLCBcImNlbnRlciBjZW50ZXJcIiwgXCJjZW50ZXIgYm90dG9tXCJcclxuICAgIF07XHJcblxyXG4gICAgdm0ucmVwZWF0cyA9IFsgXCJyZXBlYXRcIiwgXCJyZXBlYXQteFwiLCBcInJlcGVhdC15XCIsIFwibm8tcmVwZWF0XCIgXTtcclxuXHJcbiAgICB2bS5zaXplcyA9IFsgXCJhdXRvXCIsIFwiY292ZXJcIiwgXCJjb250YWluXCIgXTtcclxuXHJcbiAgICB2bS5hdHRhY2htZW50cyA9IFsgXCJmaXhlZFwiLCBcImxvY2FsXCIsIFwic2Nyb2xsXCIgXTtcclxuXHJcbiAgICB2bS5pc0VkaXRNb2RlID0gdm0uaXNDcmVhdGVNb2RlID0gdm0uaXNRdWVyeUltYWdlID0gZmFsc2U7XHJcblxyXG4gICAgdm0uc2xvdENoZWNrID0gZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgc2xvdHM9dm0ucGFyYW0udGltZVNsb3RzLCBzbG90RW5kPS0xLCBzdGF0dXM9KHNsb3RzLmxlbmd0aD4wID8gXCJcIiA6IFwiS2VpbmUgSGludGVyZ3J1bmQtWmVpdGZlbnN0ZXIgdm9yaGFuZGVuIVwiKTtcclxuICAgICAgICAkLmVhY2goIHZtLnBhcmFtLnRpbWVTbG90cywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcImZyb206IFwiK3V0aWxzLmdldE1pbnV0ZSh0aGlzLmZyb20pK1wiIHNsb3RFbmQ6IFwiK3Nsb3RFbmQrXCIgKFwiKyhzbG90RW5kKzEpK1wiKVwiKTtcclxuICAgICAgICAgICAgaWYgKHV0aWxzLmdldE1pbnV0ZSh0aGlzLmZyb20pIT09c2xvdEVuZCsxKXtcclxuICAgICAgICAgICAgICAgIHN0YXR1cyA9IChzbG90RW5kPDBcclxuICAgICAgICAgICAgICAgICAgICAgICA/IFwiRGllIFplaXRhbmdhYmUgYmVnaW5udCBuaWNodCBiZWkgMDA6MDAgVWhyIVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgOiBcIkVzIGJlc3RlaHQgZWluZSBaZWl0bMO8Y2tlIGJlaSBcIit1dGlscy5mb3JtYXRUaW1lKHRoaXMuZnJvbSkrXCIgVWhyIVwiKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIHNsb3RFbmQgPSB1dGlscy5nZXRNaW51dGUodGhpcy50byk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKHN0YXR1cy5sZW5ndGg9PT0wICYmIHNsb3RFbmQhPT0yMyo2MCs1OSkgc3RhdHVzID0gXCJEaWUgWmVpdGFuZ2FiZSBlbmRldCBuaWNodCBiZWkgMjM6NTkgVWhyIVwiO1xyXG4gICAgICAgIHZtLnNsb3RTdGF0dXNPSyA9IChzdGF0dXMubGVuZ3RoPT09MCk7XHJcbiAgICAgICAgdm0uc2xvdFN0YXR1cyA9ICh2bS5zbG90U3RhdHVzT0sgPyBcIkFsbGUgSGludGVyZ3J1bmQtWmVpdGZlbnN0ZXIgdm9sbHN0w6RuZGlnIGRlZmluaWVydC5cIiA6IHN0YXR1cyk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZtLmVkaXQgPSBmdW5jdGlvbihpbmRleCl7XHJcbiAgICAgICAgdm0uc2xvdCA9IGFuZ3VsYXIuY29weSh2bS5wYXJhbS50aW1lU2xvdHNbaW5kZXhdKTtcclxuICAgICAgICB2bS5pbmRleCA9IGluZGV4O1xyXG4gICAgICAgIHZtLmlzRWRpdE1vZGUgPSB0cnVlO1xyXG4gICAgfTtcclxuXHJcbiAgICB2bS5jYW5jZWwgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIGlmICh2bS5pc0NyZWF0ZU1vZGUpIGRlbGV0ZSB2bS5zbG90O1xyXG4gICAgICAgIHZtLmlzRWRpdE1vZGUgPSB2bS5pc0NyZWF0ZU1vZGUgPSBmYWxzZTtcclxuICAgIH07XHJcblxyXG4gICAgdm0uc2F2ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgaWYgKHZtLmlzQ3JlYXRlTW9kZSkgdm0uaW5zZXJ0KCk7IGVsc2Ugdm0udXBkYXRlKCk7XHJcbiAgICAgICAgYmFja2dyb3VuZC5zZXRJbWFnZSh2bS5wYXJhbS50aW1lU2xvdHMpO1xyXG4gICAgICAgIHZtLnNsb3RDaGVjaygpO1xyXG4gICAgICAgIHZtLmlzRWRpdE1vZGUgPSB2bS5pc0NyZWF0ZU1vZGUgPSBmYWxzZTtcclxuICAgIH07XHJcblxyXG4gICAgdm0uc29ydCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdm0ucGFyYW0udGltZVNsb3RzLnNvcnQoIGZ1bmN0aW9uKGEsYil7IHJldHVybiB1dGlscy5nZXRNaW51dGUoYS5mcm9tKSAtIHV0aWxzLmdldE1pbnV0ZShiLmZyb20pOyB9KTtcclxuICAgIH07XHJcblxyXG4gICAgdm0uZmluZEZpcnN0ID0gZnVuY3Rpb24oY2JTZWxlY3RDb25kaXRpb24pe1xyXG4gICAgICAgIHZhciBzbG90cyA9IHZtLnBhcmFtLnRpbWVTbG90cywgc2VsZWN0ZWRJbmRleCA9IC0xO1xyXG4gICAgICAgICQuZWFjaCggc2xvdHMsIGZ1bmN0aW9uKGluZGV4LCBzbG90KXtcclxuICAgICAgICAgICAgaWYgKGNiU2VsZWN0Q29uZGl0aW9uKHNsb3QpKXtcclxuICAgICAgICAgICAgICAgIHNlbGVjdGVkSW5kZXggPSBpbmRleDtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBzZWxlY3RlZEluZGV4O1xyXG4gICAgfTtcclxuXHJcbiAgICB2bS5pbnNlcnQgPSBmdW5jdGlvbigpe1xyXG4vLy0tLS0tIEdldCB0aGUgY3VycmVudGx5IGRlZmluZWQgdGltZXNsb3RzXHJcbiAgICAgICAgdmFyIHNsb3RzID0gdm0ucGFyYW0udGltZVNsb3RzLCBzbG90LCBzSWR4ID0gMCwgY2xvbmUgPSBudWxsO1xyXG4vLy0tLS0tIERlbGV0ZSBhbGwgb2xkIHNsb3RzIHRoYXQgYXJlIGVuY29tcGFzc2VkL2VtYmVkZGVkIGJ5IHRoZSBuZXcgc2xvdFxyXG4gICAgICAgIHdoaWxlIChzSWR4PHNsb3RzLmxlbmd0aCl7XHJcbiAgICAgICAgICAgIHNsb3QgPSBzbG90c1tzSWR4XTtcclxuICAgICAgICAgICAgaWYgKHNsb3QuZnJvbT49dm0uc2xvdC5mcm9tICYmIHNsb3QudG88PXZtLnNsb3QudG8pXHJcbiAgICAgICAgICAgICAgICB2bS5yZW1vdmUoc0lkeCwgXCJub2NoZWNrXCIpO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBzSWR4Kys7XHJcbiAgICAgICAgfVxyXG4vLy0tLS0tIEZpbmQgdGhlIGZpcnN0IHNsb3Qgd2hlcmUgbmV3LWZyb21UaW1lIGlzIGluY2x1ZGVkXHJcbiAgICAgICAgc0lkeCA9IHZtLmZpbmRGaXJzdChmdW5jdGlvbih0aGlzU2xvdCl7IHJldHVybiAodm0uc2xvdC5mcm9tPHRoaXNTbG90LnRvKTsgfSk7XHJcbiAgICAgICAgaWYgKHNJZHg+PTApe1xyXG4gICAgICAgICAgICBpZiAodm0uc2xvdC5mcm9tPnNsb3RzW3NJZHhdLmZyb20gJiYgdm0uc2xvdC50bzxzbG90c1tzSWR4XS50byl7XHJcbiAgICAgICAgICAgICAgICBjbG9uZSA9IGFuZ3VsYXIuY29weShzbG90c1tzSWR4XSk7XHJcbiAgICAgICAgICAgICAgICBjbG9uZS5mcm9tID0gdXRpbHMuYWRkTWludXRlcyh2bS5zbG90LnRvLCArMSk7XHJcbiAgICAgICAgICAgICAgICBzbG90c1tzSWR4XS50byA9IHV0aWxzLmFkZE1pbnV0ZXModm0uc2xvdC5mcm9tLCAtMSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodm0uc2xvdC5mcm9tPD1zbG90c1tzSWR4XS5mcm9tICYmIHZtLnNsb3QudG88c2xvdHNbc0lkeF0udG8pe1xyXG4gICAgICAgICAgICAgICAgc2xvdHNbc0lkeF0uZnJvbSA9IHV0aWxzLmFkZE1pbnV0ZXModm0uc2xvdC50bywgKzEpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZtLnNsb3QudG8+PXNsb3RzW3NJZHhdLnRvKXtcclxuICAgICAgICAgICAgICAgIHNsb3RzW3NJZHhdLnRvID0gdXRpbHMuYWRkTWludXRlcyh2bS5zbG90LmZyb20sIC0xKTtcclxuICAgICAgICAgICAgICAgIGlmIChzbG90cy5sZW5ndGg+c0lkeCsxKSBzbG90c1tzSWR4KzFdLmZyb20gPSB1dGlscy5hZGRNaW51dGVzKHZtLnNsb3QudG8sICsxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuLy8tLS0tLSBQdXNoIHRoZSBuZXcgc2xvdCB0byB0aGUgYXJyYXlcclxuICAgICAgICBzbG90cy5wdXNoKHZtLnNsb3QpO1xyXG4vLy0tLS0tIFB1c2ggdGhlIGNsb25lIHNsb3QgdG8gdGhlIGFycmF5IGlmIHRoZXJlIGlzIG9uZVxyXG4gICAgICAgIGlmIChjbG9uZSE9PW51bGwpIHNsb3RzLnB1c2goY2xvbmUpO1xyXG4vLy0tLS0tIGFuZCByZS1zb3J0XHJcbiAgICAgICAgdm0uc29ydCgpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2bS51cGRhdGUgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZtLnBhcmFtLnRpbWVTbG90c1t2bS5pbmRleF0gPSB2bS5zbG90O1xyXG4gICAgICAgIHZtLnNvcnQoKTtcclxuICAgIH07XHJcblxyXG4gICAgdm0ucmVtb3ZlID0gZnVuY3Rpb24oaW5kZXgsIG5vY2hlY2spe1xyXG4vLy0tLS0tIEdldCB0aGUgY3VycmVudGx5IGRlZmluZWQgdGltZXNsb3RzXHJcbiAgICAgICAgdmFyIHNsb3RzID0gdm0ucGFyYW0udGltZVNsb3RzO1xyXG4vLy0tLS0tIElmIGluZGV4IHRvIGRlbGV0ZSBpcyBub3QgdGhlIGZpcnN0LCB0aGVuIGNvbnNvbGlkYXRlIHRpbWVzIHdpdGggcHJlY2VlZGluZyB0aW1lc2xvdFxyXG4gICAgICAgIGlmIChpbmRleD4wKSBzbG90c1tpbmRleC0xXS50byA9IHNsb3RzW2luZGV4XS50bztcclxuLy8tLS0tLSBJZiBpbmRleCBpcyB0aGUgZmlyc3QgYW5kIHRoZXJlIGlzIGEgc3VjY2VlZGluZyB0aW1lc2xvdCwgY29uc29saWRhdGUgd2l0aCBzdWNjZWVkaW5nIHRpbWVzbG90XHJcbiAgICAgICAgZWxzZSBpZiAoc2xvdHMubGVuZ3RoPjEpIHNsb3RzWzFdLmZyb20gPSBzbG90c1swXS5mcm9tO1xyXG4vLy0tLS0tIGFueXdheSBkZWxldGUgdGhpcyBpbmRleCBub3dcclxuICAgICAgICBzbG90cy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4vLy0tLS0tIGFuZCByZS1jaGVjayB0aGUgc2xvdHMgc3RhdHVzIHVubGVzcyBpbnRlcm5hbCBjYWxsIGZyb20gaW5zZXJ0IGZ1bmN0aW9uXHJcbiAgICAgICAgaWYgKG5vY2hlY2sgfHwgJycgIT09ICdub2NoZWNrJykgdm0uc2xvdENoZWNrKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZtLmNyZWF0ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdm0uc2xvdCA9IHtcclxuICAgICAgICAgICAgICBcImZyb21cIjogbmV3IERhdGUoMTk3MCwwLDEsMCwwLDApLCBcInRvXCI6IG5ldyBEYXRlKDE5NzAsMCwxLDIzLDU5LDApLFxyXG4gICAgICAgICAgICAgIFwicmVwZWF0XCI6IFwibm8tcmVwZWF0XCIsIFwicG9zaXRpb25cIjogXCJjZW50ZXIgdG9wXCIsIFwic2l6ZVwiOiBcImNvdmVyXCIsXHJcbiAgICAgICAgICAgICAgXCJhdHRhY2htZW50XCI6IFwiZml4ZWRcIiwgXCJocmVmXCI6IHZtLnBhcmFtLnNpdGUuaW1nRm9sZGVyIH07XHJcbiAgICAgICAgdm0uaXNDcmVhdGVNb2RlID0gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgdm0udXNlUG9zaXRpb24gPSBmdW5jdGlvbihpbmRleCl7XHJcbiAgICAgICAgdm0uc2xvdC5wb3NpdGlvbiA9IHZtLnBvc2l0aW9uc1tpbmRleF07XHJcbiAgICB9O1xyXG5cclxuICAgIHZtLnVzZVJlcGVhdCA9IGZ1bmN0aW9uKGluZGV4KXtcclxuICAgICAgICB2bS5zbG90LnJlcGVhdCA9IHZtLnJlcGVhdHNbaW5kZXhdO1xyXG4gICAgfTtcclxuXHJcbiAgICB2bS51c2VTaXplID0gZnVuY3Rpb24oaW5kZXgpe1xyXG4gICAgICAgIHZtLnNsb3Quc2l6ZSA9IHZtLnNpemVzW2luZGV4XTtcclxuICAgIH07XHJcblxyXG4gICAgdm0udXNlQXR0YWNobWVudCA9IGZ1bmN0aW9uKGluZGV4KXtcclxuICAgICAgICB2bS5zbG90LmF0dGFjaG1lbnQgPSB2bS5hdHRhY2htZW50c1tpbmRleF07XHJcbiAgICB9O1xyXG5cclxuICAgIHZtLm5hdkltYWdlUG9vbCA9IHtcclxuICAgICAgICBwcm92aWRlcnM6IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ1Vuc3BsYXNoJyxcclxuICAgICAgICAgICAgICAgIGZpbGU6ICd1bnNwbGFzaC5qc29uJyxcclxuICAgICAgICAgICAgICAgIGFwcGVuZDogZnVuY3Rpb24odGFyZ2V0LCBzcmNSYXRpbyl7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHcsIGg7XHJcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh0YXJnZXQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdnYWxsZXJ5Jzogdz0zMDA7IGg9MjAwOyBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnZnVsbHNjcmVlbic6IHc9JHdpbmRvdy5zY3JlZW4ud2lkdGg7IGg9JHdpbmRvdy5zY3JlZW4uaGVpZ2h0OyBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnYmFja2dyb3VuZCc6IHc9MTkyMDsgaD1NYXRoLnJvdW5kKDE5MjAvc3JjUmF0aW8pOyBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc/Zm09anBnJnE9NzUmdz0nK3crJyZoPScraCsnJmZpdD1jcm9wJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogXCJQaWNqdW1ib1wiLFxyXG4gICAgICAgICAgICAgICAgZmlsZTogJ3BpY2p1bWJvLmpzb24nLFxyXG4gICAgICAgICAgICAgICAgYXBwZW5kOiBmdW5jdGlvbih0YXJnZXQsIHNyY1JhdGlvKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBdLFxyXG4gICAgICAgIHByb3ZpZGVyOiB7fSxcclxuICAgICAgICBpbWFnZXM6IFtdLFxyXG4gICAgICAgIHBhZ2U6IC0xLFxyXG4gICAgICAgIGxhc3RQYWdlOiAwLFxyXG4gICAgICAgIHBhZ2VTaXplOiAyNCxcclxuICAgICAgICBwYWdlSW1hZ2VzOiBbXSxcclxuICAgICAgICBpc0xvYWRpbmdJbWFnZXM6IGZhbHNlLFxyXG4gICAgICAgIGlzRmlyc3RQYWdlOiBmdW5jdGlvbigpeyByZXR1cm4gdGhpcy5wYWdlID09PSAwOyB9LFxyXG4gICAgICAgIGlzTGFzdFBhZ2U6IGZ1bmN0aW9uKCl7IHJldHVybiB0aGlzLnBhZ2UgPT09IHRoaXMubGFzdFBhZ2U7IH0sXHJcbiAgICAgICAgdXNlUHJvdmlkZXI6IGZ1bmN0aW9uKGluZGV4KXsgdGhpcy5wcm92aWRlciA9IHRoaXMucHJvdmlkZXJzW2luZGV4XTsgdGhpcy5sb2FkSW1hZ2VzKCk7IH0sXHJcbiAgICAgICAgbmV4dFBhZ2U6IGZ1bmN0aW9uKCl7ICsrdGhpcy5wYWdlOyB0aGlzLnNob3dJbWFnZXMoKTsgfSxcclxuICAgICAgICBwcmV2UGFnZTogZnVuY3Rpb24oKXsgLS10aGlzLnBhZ2U7IHRoaXMuc2hvd0ltYWdlcygpOyB9LFxyXG4gICAgICAgIHRvRmlyc3RQYWdlOiBmdW5jdGlvbigpeyB0aGlzLnBhZ2U9MDsgdGhpcy5zaG93SW1hZ2VzKCk7IH0sXHJcbiAgICAgICAgdG9MYXN0UGFnZTogZnVuY3Rpb24oKXsgdGhpcy5wYWdlPXRoaXMubGFzdFBhZ2U7IHRoaXMuc2hvd0ltYWdlcygpOyB9LFxyXG4gICAgICAgIHZpZXdJbWFnZTogZnVuY3Rpb24oaW5kZXgpe1xyXG4gICAgICAgICAgICB2YXIgaSA9IHRoaXMucGFnZSp0aGlzLnBhZ2VTaXplLFxyXG4gICAgICAgICAgICAgICAgaiA9IE1hdGgubWluKGkrdGhpcy5wYWdlU2l6ZSwgdGhpcy5pbWFnZXMubGVuZ3RoKSxcclxuICAgICAgICAgICAgICAgIHN3aXBlSW1hZ2VzID0gW107XHJcbiAgICAgICAgICAgIHdoaWxlIChpPGope1xyXG4gICAgICAgICAgICAgICAgc3dpcGVJbWFnZXMucHVzaCh7IGhyZWY6IHRoaXMuaW1hZ2VzW2ldWydpbWdfdXJsJ10rdGhpcy5wcm92aWRlci5hcHBlbmQoJ2Z1bGxzY3JlZW4nKSB9KTtcclxuICAgICAgICAgICAgICAgICsraTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkLnN3aXBlYm94KCBzd2lwZUltYWdlcywge3VzZVNWRzogZmFsc2UsIGluaXRpYWxJbmRleE9uQXJyYXk6IGluZGV4fSApO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2VsZWN0SW1hZ2U6IGZ1bmN0aW9uKGluZGV4KXtcclxuICAgICAgICAgICAgdmFyIGkgPSB0aGlzLnBhZ2UqdGhpcy5wYWdlU2l6ZStpbmRleCxcclxuICAgICAgICAgICAgICAgIHJhdGlvID0gKHR5cGVvZiB0aGlzLmltYWdlc1tpXS5yYXRpbyAhPT0gJ3VuZGVmaW5lZCcgPyB0aGlzLmltYWdlc1tpXS5yYXRpbyA6IDEuNSk7XHJcbiAgICAgICAgICAgIHZtLnNsb3QuaHJlZiA9IHRoaXMuaW1hZ2VzW2ldWydpbWdfdXJsJ10rdGhpcy5wcm92aWRlci5hcHBlbmQoJ2JhY2tncm91bmQnLCByYXRpbyk7XHJcbiAgICAgICAgICAgIHZtLmlzUXVlcnlJbWFnZSA9IGZhbHNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2hvd0ltYWdlczogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIGkgPSB0aGlzLnBhZ2UqdGhpcy5wYWdlU2l6ZSxcclxuICAgICAgICAgICAgICAgIGogPSBNYXRoLm1pbihpK3RoaXMucGFnZVNpemUsIHRoaXMuaW1hZ2VzLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIHRoaXMucGFnZUltYWdlcy5sZW5ndGggPSAwO1xyXG4gICAgICAgICAgICB3aGlsZSAoaTxqKXtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFnZUltYWdlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAnYmFja2dyb3VuZC1pbWFnZSc6ICd1cmwoXCInK3RoaXMuaW1hZ2VzW2ldWydpbWdfdXJsJ10rdGhpcy5wcm92aWRlci5hcHBlbmQoJ2dhbGxlcnknKSsnXCIpJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICArK2k7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGxvYWRJbWFnZXM6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICAgICAgc2VsZi5pc0xvYWRpbmdJbWFnZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICBzZWxmLmltYWdlcy5sZW5ndGggPSAwO1xyXG4gICAgICAgICAgICBzZWxmLnBhZ2VJbWFnZXMubGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgc2VsZi5wYWdlID0gMDtcclxuICAgICAgICAgICAgSW1hZ2VQcm92aWRlci5sb2FkKHZtLnBhcmFtLnVwZGF0ZS5yZWxlYXNlVXJsK3NlbGYucHJvdmlkZXIuZmlsZSkudGhlbihcclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW1hZ2VzID0gZGF0YSB8fCBbXTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmxhc3RQYWdlID0gKHNlbGYuaW1hZ2VzLmxlbmd0aD09PTAgPyAwIDogTWF0aC5mbG9vcigoc2VsZi5pbWFnZXMubGVuZ3RoLTEpL3NlbGYucGFnZVNpemUpKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLnNob3dJbWFnZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmlzTG9hZGluZ0ltYWdlcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGRhdGEsIHN0YXR1cyl7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9hc3RyLmVycm9yKFwiRmVobGVyIGJlaW0gTGVzZW4gZGVyIEJpbGRkYXRlbiB2b24gXCIrc2VsZi5wcm92aWRlcitcIiwgU3RhdHVzOiBcIitzdGF0dXMsIHZtLnBhcmFtLm1zZ0hlYWRlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5sYXN0UGFnZSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pc0xvYWRpbmdJbWFnZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHZtLnF1ZXJ5SW1hZ2UgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZtLmlzUXVlcnlJbWFnZSA9IHRydWU7XHJcbiAgICAgICAgaWYgKHZtLm5hdkltYWdlUG9vbC5wYWdlPDApIHZtLm5hdkltYWdlUG9vbC51c2VQcm92aWRlcigwKTtcclxuICAgIH07XHJcblxyXG4gICAgdm0uc2xvdENoZWNrKCk7XHJcblxyXG59OyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJHJvb3RTY29wZSl7XHJcblxyXG4gICAgdmFyIHZtID0gdGhpcztcclxuICAgIFxyXG4gICAgdm0ucGFyYW0gPSAkcm9vdFNjb3BlLnBhcmFtO1xyXG5cclxuICAgIHZtLnNldFN0YXRpY0ZvbGRlciA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdm0ucGFyYW0uc2l0ZS5pbWdGb2xkZXIgPSB2bS5wYXJhbS5zdGF0aWNVcmwgKyB2bS5wYXJhbS51c2VyTmFtZSArIFwiL2ltYWdlcy9cIjtcclxuICAgIH07XHJcblxyXG4gICAgdm0udGVzdExvYWRlciA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgJChcIiNsb2FkZXItd3JhcHBlclwiKS5zaG93KDApLmRlbGF5KDMwMDApLmhpZGUoMCk7XHJcbiAgICB9O1xyXG5cclxufTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJG1vZGFsSW5zdGFuY2Upe1xyXG5cclxuICAgIHZhciB2bSA9IHRoaXM7XHJcblxyXG4gICAgdm0ucGFyYW0gPSAkcm9vdFNjb3BlLnBhcmFtO1xyXG5cclxuICAgIHZtLm9rID0gZnVuY3Rpb24oKXsgJG1vZGFsSW5zdGFuY2UuY2xvc2UoKTsgfTtcclxuXHJcbiAgICB2bS5jYW5jZWwgPSBmdW5jdGlvbigpeyAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCk7IH07XHJcblxyXG59O1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgYmFja2dyb3VuZCA9IHJlcXVpcmUoJy4uL2JhY2tncm91bmQuanMnKSxcclxuICAgIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCRzY29wZSwgJHJvb3RTY29wZSwgUHJlZmVyZW5jZXMsIFVwZGF0ZUNoZWNrLCAkd2luZG93LCAkaW50ZXJ2YWwsICRtb2RhbCl7XHJcbiAgICBcclxuLy8tIERlZmluZSB2aWV3bW9kZWwgYXMgdGhpc1xyXG4gICAgdmFyIHZtID0gdGhpcztcclxuXHJcbi8vLSBHZXQgdGhlIGNvbnNvbGlkYXRlZCBwcmVmZXJlbmNlcyBkYXRhIChpbmNsdWRlcyBzdGFuZGFyZCBhbmQgdXNlciBtb2RpZmllZCBzZXR0aW5ncylcclxuICAgIHZtLnBhcmFtID0gJHJvb3RTY29wZS5wYXJhbSA9IFByZWZlcmVuY2VzLmdldChcImNvbnNvbGlkYXRlZFwiKTtcclxuXHJcbi8vLSBTZXQgYmFja2dyb3VuZCBpbWFnZSBiYXNlZCBvbiB0aW1lIG9mIHRoZSBkYXkgYW5kIHVzZXIgZGVmaW5lZCBpbWFnZSBpdGVtcy9zbG90c1xyXG4gICAgdmFyIFVwZGF0ZUJhY2tncm91bmRJbWFnZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgYmFja2dyb3VuZC5zZXRJbWFnZSh2bS5wYXJhbS50aW1lU2xvdHMpO1xyXG4gICAgfTsgIFVwZGF0ZUJhY2tncm91bmRJbWFnZSgpO1xyXG5cclxuLy8tIEluc3RhbGwgYmFja2dyb3VuZCBpbWFnZSBjaGVjayByb3V0aW5lIHRvIGJlIGNhbGxlZCBldmVyeSA1IHNlY29uZHNcclxuICAgIHZhciBjaGVja0JhY2tncm91bmRUaW1lciA9ICRpbnRlcnZhbCggVXBkYXRlQmFja2dyb3VuZEltYWdlLCA1MDAwICk7XHJcblxyXG4vLy0gTWFrZSBzdXJlIGludGVydmFsIHRpbWVyIHdpbGwgYmUgcmVtb3ZlZCBvbmNlIGNvbnRyb2xsZXIgZ2V0cyBkZXN0cm95ZWRcclxuICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKXtcclxuICAgICAgICAkaW50ZXJ2YWwuY2FuY2VsKGNoZWNrQmFja2dyb3VuZFRpbWVyKTtcclxuICAgIH0pO1xyXG5cclxuLy8tIFNldCBkZWZhdWx0IHZhbHVlIGZvciB0b3BpY3MudGV4dCBpZiB1c2VyIGhhcyBub3QgcHJvdmlkZWQgb25lXHJcbiAgICBpZiAodm0ucGFyYW0udG9wYmFyLm1lbnVJdGVtcy50b3BpY3MudGV4dC5sZW5ndGg9PT0wKVxyXG4gICAgICAgIHZtLnBhcmFtLnRvcGJhci5tZW51SXRlbXMudG9waWNzLnRleHQgPSB2bS5wYXJhbS5zaXRlQWxpYXMudG9Mb3dlckNhc2UoKTtcclxuXHJcbi8vLSBBZGp1c3QgdG9waWNzLmNsYXNzIGlmIHRvcGljbGlzdC1tYWNybyBoYXMgZm91bmQvZ2VuZXJhdGVkIGFueSBzdG9yeSB0b3BpY3NcclxuICAgIHZtLnBhcmFtLnRvcGJhci5tZW51SXRlbXMudG9waWNzLmRyb3AgPSAoJChcIiN0b29sYmFyVG9waWNzXCIpLmhhcyhcIi5kcm9wZG93blwiKSk7XHJcblxyXG4vLy0gRXh0cmFjdCBicmVhZGNydW1iL3NwZWNpYWwgbWVudSBsaW5rcyBhbmQgcHV0IHRoZW0gaW50byB0aGUgc2NvcGVcclxuICAgIHZtLnBhcmFtLnRvcGJhci5tZW51SXRlbXMuYnJlYWRjcnVtYnMuaXRlbXMgPSB1dGlscy5nZXRCcmVhZGNydW1icygpO1xyXG4gICAgLy9jb25zb2xlLmRpcih2bS5wYXJhbS50b3BiYXIubWVudUl0ZW1zLmJyZWFkY3J1bWJzLml0ZW1zKTtcclxuICAgIHZtLnBhcmFtLnRvcGJhci5tZW51SXRlbXMuYWJvLml0ZW1zID0gdXRpbHMuZ2V0U3BlY2lhbE1lbnUoXCIjYWJvTWVudVwiKTtcclxuICAgIHZtLnBhcmFtLnRvcGJhci5tZW51SXRlbXMuaW1hZ2VzLml0ZW1zID0gdXRpbHMuZ2V0U3BlY2lhbE1lbnUoXCIjaW1hZ2VNZW51XCIpO1xyXG5cclxuLy8tIEFkZCB1dGlsaXR5IGZ1bmN0aW9ucyB0byBiZSB1c2VkIGluIG5nLWZ1bmN0aW9ucyAodmlldylcclxuICAgIHZtLnBhcmFtLmlzTG9nZ2VkSW4gPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIHJldHVybiAodm0ucGFyYW0udXNlck5hbWUubGVuZ3RoPjApO1xyXG4gICAgfTtcclxuICAgIHZtLnBhcmFtLmlzQWRtaW4gPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIHJldHVybiAodm0ucGFyYW0uaXNMb2dnZWRJbigpICYmIHZtLnBhcmFtLnVzZXJSb2xlKCk9PT1cIkFkbWluaXN0cmF0b3JcIik7XHJcbiAgICB9O1xyXG4gICAgdm0ucGFyYW0uaXNDb250cmlidXRvciA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgcmV0dXJuICh2bS5wYXJhbS5pc0xvZ2dlZEluKCkgJiYgKHZtLnBhcmFtLnVzZXJSb2xlKCk9PT1cIkNvbnRyaWJ1dG9yXCIgfHwgdm0ucGFyYW0udXNlclJvbGUoKT09PVwiQWRtaW5pc3RyYXRvclwiKSk7XHJcbiAgICB9O1xyXG4gICAgdm0ucGFyYW0uc2VuZE1haWwgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgICR3aW5kb3cubG9jYXRpb24uaHJlZiA9IHV0aWxzLnJvdDEzKHZtLnBhcmFtLnRvcGJhci5tYWlsSWNvbi5ocmVmKTtcclxuICAgIH07XHJcblxyXG4vLy0gV2hlbiB0cnVlICh1c2VyIGNsaWNrZWQgdGhlIGNsb3NlIGJ1dHRvbiksIGl0IHRyaWdnZXJzIHRoZSBmYWRlb3V0IG9mIHRoZSByZXNwb25zZSBhbGVydC1ib3hcclxuICAgIHZtLm1zZ0Nsb3NlID0gZmFsc2U7XHJcblxyXG4gICAgdm0uY3VzdG9taXplID0ge1xyXG5cclxuICAgICAgICBoaWRlOiBmdW5jdGlvbigpeyAkKCcjZjVjb250YWluZXInKS5mYWRlT3V0KCk7IH0sXHJcblxyXG4gICAgICAgIHNob3c6IGZ1bmN0aW9uKCl7ICQoJyNmNWNvbnRhaW5lcicpLmZhZGVJbigpOyB9LFxyXG5cclxuICAgICAgICBvcGVuOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgICAgIHNlbGYuaGlkZSgpO1xyXG4gICAgICAgICAgICB2YXIgY29weU9mUGFyYW0gPSAkLmV4dGVuZCh0cnVlLCB7fSwgdm0ucGFyYW0pO1xyXG4gICAgICAgICAgICB2YXIgbW9kYWxDdXN0b21pemUgPSAkbW9kYWwub3Blbih7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogIFwiY3VzdG9taXplQmxvZ0h0bWxcIiwgLy8gaW4gU2l0ZS1uZ1RlbXBsYXRlcy5qYWRlXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAgIFwiQ3VzdG9taXplQ3RybCBhcyBjdXN0b21pemVcIixcclxuICAgICAgICAgICAgICAgIHJlc29sdmU6IHt9LFxyXG4gICAgICAgICAgICAgICAgYmFja2Ryb3A6IFwic3RhdGljXCIsXHJcbiAgICAgICAgICAgICAgICBrZXlib2FyZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB3aW5kb3dDbGFzczogXCJ4bGFyZ2VcIlxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgbW9kYWxDdXN0b21pemUucmVzdWx0LnRoZW4oXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbigpeyAvLyBVc2VyIGNvbmZpcm1lZCBjaGFuZ2VcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWFuZ3VsYXIuZXF1YWxzKGNvcHlPZlBhcmFtLCB2bS5wYXJhbSkpIFByZWZlcmVuY2VzLnNhdmUodm0ucGFyYW0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCl7IC8vIFVzZXIgY2FuY2VsbGVkIGNoYW5nZVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghYW5ndWxhci5lcXVhbHMoY29weU9mUGFyYW0sIHZtLnBhcmFtKSkgdm0ucGFyYW0gPSBjb3B5T2ZQYXJhbTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLnNob3coKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4vLy0gQ2hlY2sgZm9yIGF2YWlsYWJsZSB1cGRhdGVzIGlmIHVzZXIgaXMgYWRtaW4gYW5kIGNoZWNrIGZyZXF1ZW5jeSBpcyBub3QgXCJuZXZlclwiXHJcbiAgICBpZiAodm0ucGFyYW0uaXNBZG1pbigpICYmIHZtLnBhcmFtLnVwZGF0ZS5nYXA+MCl7XHJcbiAgICAgICAgVXBkYXRlQ2hlY2sub25Mb2FkKHZtLnBhcmFtKTtcclxuICAgIH1cclxufTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG4vKipcclxuICogQnJvd3NlcmlmeSBhbGwgY29udHJvbGxlcnNcclxuICpcclxuICovXHJcblxyXG4odHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5hbmd1bGFyIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5hbmd1bGFyIDogbnVsbClcclxuICAgIC5tb2R1bGUoJ2Y1U2tpbkFwcCcpXHJcbiAgICAuY29udHJvbGxlcignRjVNYWluQ3RybCcsIFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnUHJlZmVyZW5jZXMnLCAnVXBkYXRlQ2hlY2snLCAnJHdpbmRvdycsICckaW50ZXJ2YWwnLCAnJG1vZGFsJywgcmVxdWlyZSgnLi9GNU1haW5DdHJsJyldKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0N1c3RvbWl6ZUN0cmwnLCBbJyRyb290U2NvcGUnLCAnJG1vZGFsSW5zdGFuY2UnLCByZXF1aXJlKCcuL0N1c3RvbWl6ZUN0cmwnKV0pXHJcbiAgICAuY29udHJvbGxlcignQ3VzdENvcmVEYXRhQ3RybCcsIFsnJHJvb3RTY29wZScsIHJlcXVpcmUoJy4vQ3VzdENvcmVEYXRhQ3RybCcpXSlcclxuICAgIC5jb250cm9sbGVyKCdDdXN0QmFja2dyb3VuZHNDdHJsJywgWyckcm9vdFNjb3BlJywgJ0ltYWdlUHJvdmlkZXInLCAnJHdpbmRvdycsICd0b2FzdHInLCByZXF1aXJlKCcuL0N1c3RCYWNrZ3JvdW5kc0N0cmwnKV0pXHJcbiAgICAuY29udHJvbGxlcignQ3VzdEFwcFVwZGF0ZUN0cmwnLCBbJyRyb290U2NvcGUnLCAnJGZpbHRlcicsICckcScsICdVcGRhdGVDaGVjaycsICdUd29kYXlTa2luJywgJ3RvYXN0cicsIHJlcXVpcmUoJy4vQ3VzdEFwcFVwZGF0ZUN0cmwnKV0pOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8qKlxyXG4gKiBCcm93c2VyaWZ5IGFsbCBkaXJlY3RpdmVzXHJcbiAqXHJcbiAqL1xyXG5cclxuKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuYW5ndWxhciA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuYW5ndWxhciA6IG51bGwpXHJcbiAgICAubW9kdWxlKCdmNVNraW5BcHAnKVxyXG4gICAgLmRpcmVjdGl2ZSgncmVzaXphYmxlJywgWyckd2luZG93JywgcmVxdWlyZSgnLi9yZXNpemFibGUnKV0pOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJHdpbmRvdyl7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgkc2NvcGUsICRlbGVtZW50KSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgcmVzaXplUGhvdG9Db250YWluZXIgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLndpZHRoID0gJGVsZW1lbnQud2lkdGgoKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5oZWlnaHQgPSBNYXRoLnJvdW5kKCRzY29wZS53aWR0aC8xLjUpO1xyXG4gICAgICAgICAgICAgICAgJGVsZW1lbnQuY3NzKCdoZWlnaHQnLCAkc2NvcGUuaGVpZ2h0KydweCcpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KCR3aW5kb3cpLmJpbmQoJ3Jlc2l6ZScsIHJlc2l6ZVBob3RvQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgIHJlc2l6ZVBob3RvQ29udGFpbmVyKCk7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCRjYWNoZUZhY3RvcnksIGl0ZW0pe1xyXG5cclxuICAgIHJldHVybiAkY2FjaGVGYWN0b3J5KGl0ZW0pO1xyXG5cclxufTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCRodHRwLCAkcSl7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuXHJcbiAgICAgICAgbG9hZDogZnVuY3Rpb24odXJsKXtcclxuXHJcbiAgICAgICAgICAgIHZhciBxID0gJHEuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgICAgICRodHRwLmdldCggdXJsIClcclxuXHJcbiAgICAgICAgICAgICAgICAuc3VjY2VzcyhmdW5jdGlvbihkYXRhKSB7IHEucmVzb2x2ZShkYXRhKTsgfSlcclxuICAgICAgICAgICAgICAgIC5lcnJvcihmdW5jdGlvbihkYXRhLCBzdGF0dXMpeyBxLnJlamVjdChbXSwgc3RhdHVzKTsgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcS5wcm9taXNlO1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59OyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBqc29uZGlmZiA9IHJlcXVpcmUoJ3JmYzY5MDItanNvbi1kaWZmJyksXHJcbiAgICB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzLmpzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKENhY2hlSXRlbSwgVHdvZGF5U2tpbiwgdG9hc3RyKXtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIC8vLS0gdHlwZTogXCJzdGFuZGFyZFwiIG9yIFwiY29uc29saWRhdGVkXCIgKGluY2wuIHVzclByZWZlcmVuY2VzKVxyXG4gICAgICAgIGdldDogZnVuY3Rpb24odHlwZSl7XHJcblxyXG4gICAgICAgICAgICAvLy0gUmVhZCBwcmVmZXJlbmNlcyBmcm9tIGNhY2hlXHJcbiAgICAgICAgICAgIHZhciBjYWNoZWRQcmVmZXJlbmNlcyA9IENhY2hlSXRlbS5nZXQodHlwZSsnUHJlZmVyZW5jZXMnKTtcclxuXHJcbiAgICAgICAgICAgIC8vLSBIYXZlIHRoZXkgYmVlbiBjYWNoZWQgYmVmb3JlP1xyXG4gICAgICAgICAgICBpZiAoY2FjaGVkUHJlZmVyZW5jZXMpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFByZWZlcmVuY2VzO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vLSBDb25zb2xpZGF0ZSAoZGVlcCBtZXJnZSkgc3RhbmRhcmRQcmVmZXJlbmNlcywgdXNlclByZWZlcmVuY2VzIGFuZCBnZW5lcmljIGNvcmUgaW5mbyBmcm9tIFR3b2RheSBtYWNyb3NcclxuICAgICAgICAgICAgICAgIHZhciBzdGRQcmVmZXJlbmNlcyA9IEpTT04ucGFyc2UoJChcIiNzdGRQcmVmZXJlbmNlc1wiKS50ZXh0KCkgfHwgXCJ7fVwiKSxcclxuICAgICAgICAgICAgICAgICAgICB1c3JQcmVmZXJlbmNlcyA9ICh0eXBlID09PSBcImNvbnNvbGlkYXRlZFwiID8gSlNPTi5wYXJzZSgkKFwiI3VzclByZWZlcmVuY2VzXCIpLnRleHQoKSB8fCBcInt9XCIpIDoge30pLFxyXG4gICAgICAgICAgICAgICAgICAgIHByZWZlcmVuY2VzID0gJC5leHRlbmQoIHRydWUsIHt9LCBzdGRQcmVmZXJlbmNlcywgdXNyUHJlZmVyZW5jZXMsIHdpbmRvdy5mNUNvcmVJbmZvICk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8tIFBhcnNlIHN0cmluZ2lmaWVkL2NvbnZlcnRlZCBkYXRlcyBhbmQgcmUtY29udmVydCB0byB0cnVlIGRhdGUgZm9ybWF0XHJcbiAgICAgICAgICAgICAgICBwcmVmZXJlbmNlcy51cGRhdGUubGFzdENoZWNrID0gbmV3IERhdGUoRGF0ZS5wYXJzZShwcmVmZXJlbmNlcy51cGRhdGUubGFzdENoZWNrKSk7XHJcbiAgICAgICAgICAgICAgICAkLmVhY2gocHJlZmVyZW5jZXMudGltZVNsb3RzLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mcm9tID0gbmV3IERhdGUoMTk3MCwgMCwgMSwgKHRoaXMuZnJvbSAvIDYwID4+IDApLCAodGhpcy5mcm9tICUgNjApLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRvID0gbmV3IERhdGUoMTk3MCwgMCwgMSwgKHRoaXMudG8gLyA2MCA+PiAwKSwgKHRoaXMudG8gJSA2MCksIDApO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8tIFB1dCBwcmVmZXJlbmNlcyBpbnRvIGNhY2hlIGFyZWFcclxuICAgICAgICAgICAgICAgIENhY2hlSXRlbS5wdXQodHlwZSsnUHJlZmVyZW5jZXMnLCBwcmVmZXJlbmNlcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8tIGFuZCByZXR1cm4gdGhlIHByZWZlcmVuY2VzIG9iamVjdFxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZWZlcmVuY2VzO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICByZWZhY3RvcjogZnVuY3Rpb24ocGFyYW0pe1xyXG5cclxuICAgICAgICAgICAgdmFyIHByZWZzID0ge307XHJcbiAgICAgICAgICAgICQuZXh0ZW5kKCB0cnVlLCBwcmVmcywgcGFyYW0gKTtcclxuICAgICAgICAgICAgJC5lYWNoKHByZWZzLnRpbWVTbG90cywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mcm9tID0gdXRpbHMuZ2V0TWludXRlKHRoaXMuZnJvbSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRvID0gdXRpbHMuZ2V0TWludXRlKHRoaXMudG8pO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLiQkaGFzaEtleSAhPT0gJ3VuZGVmaW5lZCcpIGRlbGV0ZSh0aGlzLiQkaGFzaEtleSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gcHJlZnM7XHJcblxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHNhdmU6IGZ1bmN0aW9uKHBhcmFtKXtcclxuXHJcbiAgICAgICAgICAgIHZhciBzdGRQcmVmZXJlbmNlcyA9IHRoaXMuZ2V0KFwic3RhbmRhcmRcIiksXHJcbiAgICAgICAgICAgICAgICB1c3JQcmVmZXJlbmNlcyA9IHt9LFxyXG4gICAgICAgICAgICAgICAgY2xlYW5QYXJhbSA9IHRoaXMucmVmYWN0b3IocGFyYW0pLFxyXG4gICAgICAgICAgICAgICAgcGF0Y2ggPSBqc29uZGlmZihzdGRQcmVmZXJlbmNlcywgcGFyYW0pLFxyXG4gICAgICAgICAgICAgICAgZXhjbHVkZXMgPSAnJCR8dG9waWNzL2Ryb3B8YnJlYWRjcnVtYnMvaXRlbXN8aW1hZ2VzL2l0ZW1zfGFiby9pdGVtcycuc3BsaXQoJ3wnKSxcclxuICAgICAgICAgICAgICAgIGksIGxlbiwgbmFtZXMsIG9ialBhdGgsIGFycmF5Q2hlY2s7XHJcblxyXG4gICAgICAgICAgICAvLy0gc2F2ZSBjb25zb2xpZGF0ZWQgcGFyYW0gYXMgd2VsbCB0byB0aGUgY2FjaGVcclxuICAgICAgICAgICAgQ2FjaGVJdGVtLnB1dCgnY29uc29saWRhdGVkUHJlZmVyZW5jZXMnLCBwYXJhbSk7XHJcblxyXG4gICAgICAgICAgICAvL2NvbnNvbGUuZGlyKHBhdGNoKTtcclxuICAgICAgICAgICAgJC5lYWNoKCBwYXRjaCwgZnVuY3Rpb24oKXtcclxuXHJcbiAgICAgICAgICAgICAgICAvLy0gZG8gbm90IGluY2x1ZGUgZnVuY3Rpb25zIHdoYXRzb2V2ZXJcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy52YWx1ZSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLy0gdGVzdCBmb3IgZXhjbHVkZXMgdG8gYmUgaWdub3JlZFxyXG4gICAgICAgICAgICAgICAgZm9yIChpPTAsIGxlbj1leGNsdWRlcy5sZW5ndGg7IGk8bGVuOyArK2kpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhdGguaW5kZXhPZihleGNsdWRlc1tpXSk+PTApIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vLSBlbGltaW5hdGUgMXN0IHNsYXNoIGFuZCBzcGxpdCBwYXRoIGludG8gZmllbGQgbmFtZXMgKGUuZy4gXCIvc2l0ZS90aXRsZVwiIC0tPiBbXCJzaXRlXCIsIFwidGl0bGVcIl0pXHJcbiAgICAgICAgICAgICAgICBuYW1lcyA9IHRoaXMucGF0aC5zdWJzdHIoMSkuc3BsaXQoJy8nKTtcclxuICAgICAgICAgICAgICAgIG9ialBhdGggPSAndXNyUHJlZmVyZW5jZXMnO1xyXG4gICAgICAgICAgICAgICAgZm9yIChpPTAsIGxlbj1uYW1lcy5sZW5ndGg7IGk8bGVuOyArK2kpe1xyXG4gICAgICAgICAgICAgICAgICAgIG9ialBhdGggKz0gJy4nK25hbWVzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpKzEgPT09IGxlbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy52YWx1ZS4kJGhhc2hLZXkgIT09ICd1bmRlZmluZWQnKSBkZWxldGUodGhpcy52YWx1ZS4kJGhhc2hLZXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBldmFsKG9ialBhdGgrJz10aGlzLnZhbHVlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXJyYXlDaGVjayA9ICdjbGVhblBhcmFtLicrb2JqUGF0aC5zdWJzdHIoMTUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXZhbCgnYW5ndWxhci5pc0FycmF5KCcrYXJyYXlDaGVjaysnKScpKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChldmFsKCd0eXBlb2YgJyArIG9ialBhdGgpID09PSAndW5kZWZpbmVkJyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZhbChvYmpQYXRoKyc9JythcnJheUNoZWNrKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV2YWwoJ3R5cGVvZiAnICsgb2JqUGF0aCkgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZhbChvYmpQYXRoICsgJz17fScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIFR3b2RheVNraW4udXBkYXRlKFxyXG4gICAgICAgICAgICAgICAgeyBuYW1lOiBcIlNpdGUudXNyUHJlZmVyZW5jZXNcIiwgY29udGVudDogYW5ndWxhci50b0pzb24odXNyUHJlZmVyZW5jZXMsIHRydWUpLCBzdGF0dXM6IFwidW5zYXZlZFwifSxcclxuICAgICAgICAgICAgICAgIHBhcmFtXHJcbiAgICAgICAgICAgICkudGhlbiggZnVuY3Rpb24oc2tpbil7XHJcbiAgICAgICAgICAgICAgICAvLyBzdWNjZXNzOiBubyB1c2VyIG1lc3NhZ2UgbmVlZGVkXHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKHN0YXR1cywgc2tpbil7XHJcbiAgICAgICAgICAgICAgICB0b2FzdHIuZXJyb3IoXCJTa2luOiAnXCIrc2tpbi5uYW1lK1wiJyBrb25udGUgbmljaHQgZXJmb2xncmVpY2ggYWt0dWFsaXNpZXJ0IHdlcmRlbiAoU3RhdHVzOiBcIitzdGF0dXMrXCIpLlwiLCBwYXJhbS5tc2dIZWFkZXIpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCRodHRwLCAkcSl7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuXHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbih1cmwpe1xyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIEBwYXJhbSB1cmw6IFR3b2RheSB1cmwgdG8gcmVhZFxyXG4gICAgICAgICAgICAgKiBAcmV0dXJuczogJGh0dHA6IHByb21pc2VcclxuICAgICAgICAgICAgICpcclxuICAgICAgICAgICAgICovXHJcblxyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KHVybCk7XHJcblxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24oc2tpbiwgcGFyYW0pe1xyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIEBwYXJhbSBza2luOiBvYmplY3QsIGF0IG1pbmltdW0gaG9sZHMgdGhlIGZvbGxvd2luZyBwcm9wc1xyXG4gICAgICAgICAgICAgKiAgICAgIG5hbWU6IE5hbWUgb2YgdGhlIHNraW4gdG8gYmUgdXBkYXRlZCwgZS5nLiBcIlNpdGUudXNyUHJlZmVyZW5jZXNcIlxyXG4gICAgICAgICAgICAgKiAgICAgIGNvbnRlbnQ6IENvbnRlbnQgdGhhdCBzaGFsbCBiZSB3cml0dGVuIHRvIHRoZSBza2luXHJcbiAgICAgICAgICAgICAqICAgICAgc3RhdHVzOiBTdGF0dXMgZmllbGRcclxuICAgICAgICAgICAgICogQHBhcmFtIHBhcmFtOiBob2xkcyB0aGUgY29uc29saWRhdGVkIHByZWZlcmVuY2VzXHJcbiAgICAgICAgICAgICAqIEByZXR1cm5zIHN0YXR1czogc3RyaW5nIFwidXBkYXRlZFwiIG9yIFwiZXJyb3J+eHh4XCIgaW4gc2tpbi5zdGF0dXNcclxuICAgICAgICAgICAgICpcclxuICAgICAgICAgICAgICovXHJcblxyXG4gICAgICAgICAgICB2YXIgcSA9ICRxLmRlZmVyKCk7XHJcblxyXG4gICAgICAgICAgICAkaHR0cC5nZXQoIHBhcmFtLmxheW91dFVybCtcInNraW5zL2VkaXQ/a2V5PVwiK3NraW4ubmFtZSApXHJcblxyXG4gICAgICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyICRmb3JtID0gJChkYXRhKS5maW5kKFwiZm9ybVwiKS5lcSgwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICRmb3JtLmF0dHIoXCJtZXRob2RcIiksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogJGZvcm0uYXR0cihcImFjdGlvblwiKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyczogeydDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkOyBjaGFyc2V0PXV0Zi04J30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6ICQucGFyYW0oe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VjcmV0S2V5OiAkZm9ybS5maW5kKFwiaW5wdXRbbmFtZT1zZWNyZXRLZXldXCIpLnZhbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAkZm9ybS5maW5kKFwiaW5wdXRbbmFtZT1hY3Rpb25dXCIpLnZhbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiAkZm9ybS5maW5kKFwiaW5wdXRbbmFtZT1rZXldXCIpLnZhbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbnNldDogJGZvcm0uZmluZChcImlucHV0W25hbWU9c2tpbnNldF1cIikudmFsKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGU6ICRmb3JtLmZpbmQoXCJpbnB1dFtuYW1lPW1vZHVsZV1cIikudmFsKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJGZvcm0uZmluZChcImlucHV0W25hbWU9dGl0bGVdXCIpLnZhbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICRmb3JtLmZpbmQoXCJ0ZXh0YXJlYVtuYW1lPWRlc2NyaXB0aW9uXVwiKS5odG1sKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBza2luOiBza2luLmNvbnRlbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzYXZlOiAkZm9ybS5maW5kKFwiaW5wdXRbbmFtZT1zYXZlXVwiKS52YWwoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNraW4uc3RhdHVzID0gXCJ1cGRhdGVkXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHEucmVzb2x2ZShza2luKTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAuZXJyb3IoZnVuY3Rpb24oZGF0YSwgc3RhdHVzKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2tpbi5zdGF0dXMgPSBcImVycm9yflwiK3N0YXR1cztcclxuICAgICAgICAgICAgICAgICAgICAgICAgcS5yZWplY3Qoc3RhdHVzLCBza2luKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICAgICAgLmVycm9yKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cyl7XHJcbiAgICAgICAgICAgICAgICAgICAgc2tpbi5zdGF0dXMgPSBcImVycm9yflwiK3N0YXR1cztcclxuICAgICAgICAgICAgICAgICAgICBxLnJlamVjdChzdGF0dXMsIHNraW4pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcS5wcm9taXNlO1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59OyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzLmpzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCRodHRwLCAkcSwgUHJlZmVyZW5jZXMsIHRvYXN0cil7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuXHJcbiAgICAgICAgb25Mb2FkOiBmdW5jdGlvbihwYXJhbSl7XHJcblxyXG4gICAgICAgICAgICBpZiAocGFyYW0udXBkYXRlLmxhc3RDaGVjay5nZXRUaW1lKCkrcGFyYW0udXBkYXRlLmdhcCA8IERhdGUubm93KCkpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJsYXN0Q2hlY2s6XCIsIHBhcmFtLnVwZGF0ZS5sYXN0Q2hlY2ssIHBhcmFtLnVwZGF0ZS5sYXN0Q2hlY2suZ2V0VGltZSgpLCBcIkdhcDpcIiwgcGFyYW0udXBkYXRlLmdhcCwgXCJOb3c6XCIsIERhdGUubm93KCkpO1xyXG4gICAgICAgICAgICAgICAgcGFyYW0udXBkYXRlLmxhc3RDaGVjayA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICAgICAgICBQcmVmZXJlbmNlcy5zYXZlKHBhcmFtKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudmVyaWZ5KHBhcmFtKS50aGVuKFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHJlbGVhc2Upe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVsZWFzZS5uZXdWZXJzaW9uKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvYXN0ci5pbmZvKCdFcyBpc3QgZWluZSBuZXVlcmUgVmVyc2lvbiBkZXIgQmxvZy1BcHAgdmVyZsO8Z2JhciEgU2llIGvDtm5uZW4gZGllc2Ugw7xiZXIgJytcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGkgY2xhc3M9XCJmYSBmYS1jb2dzXCI+PC9pPiB1bmQgPHN0cm9uZz5Ba3R1YWxpc2llcnVuZzwvc3Ryb25nPiBoZXJ1bnRlcmxhZGVuLicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW0ubXNnSGVhZGVyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oc3RhdHVzKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9hc3RyLmVycm9yKCdGZWhsZXIgd8OkaHJlbmQgZGVyIMOcYmVycHLDvGZ1bmcgYXVmIGVpbmUgbmV1ZXJlIEFwcC1WZXJzaW9uOiAnK3N0YXR1cyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbS5tc2dIZWFkZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgdmVyaWZ5OiBmdW5jdGlvbihwYXJhbSl7XHJcblxyXG4gICAgICAgICAgICB2YXIgcSA9ICRxLmRlZmVyKCk7XHJcblxyXG4gICAgICAgICAgICAkaHR0cC5nZXQocGFyYW0udXBkYXRlLnJlbGVhc2VVcmwgKyBcInJlbGVhc2VpbmZvLnhtbFwiKVxyXG4gICAgICAgICAgICAuc3VjY2VzcyhmdW5jdGlvbiAoZGF0YSl7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVsZWFzZSA9IHV0aWxzLmdldFJlbGVhc2UoJChkYXRhKSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3VmVyc2lvbiA9ICh1dGlscy5wYXJzZVZlcnNpb24ocmVsZWFzZS52ZXJzaW9uKSA+IHV0aWxzLnBhcnNlVmVyc2lvbihwYXJhbS51cGRhdGUudmVyc2lvbikpO1xyXG4gICAgICAgICAgICAgICAgcS5yZXNvbHZlKHsgJ2RhdGEnOiByZWxlYXNlLCAnbmV3VmVyc2lvbic6IG5ld1ZlcnNpb24gfSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5lcnJvcihmdW5jdGlvbiAoZGF0YSwgc3RhdHVzKXtcclxuICAgICAgICAgICAgICAgIHEucmVqZWN0KHN0YXR1cyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHEucHJvbWlzZTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG4vKipcclxuICogQnJvd3NlcmlmeSBhbGwgc2VydmljZXNcclxuICpcclxuICovXHJcblxyXG4odHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5hbmd1bGFyIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5hbmd1bGFyIDogbnVsbClcclxuICAgIC5tb2R1bGUoJ2Y1U2tpbkFwcCcpXHJcbiAgICAuZmFjdG9yeSgnQ2FjaGVJdGVtJywgWyckY2FjaGVGYWN0b3J5JywgcmVxdWlyZSgnLi9DYWNoZUl0ZW0nKV0pXHJcbiAgICAuZmFjdG9yeSgnSW1hZ2VQcm92aWRlcicsIFsnJGh0dHAnLCAnJHEnLCByZXF1aXJlKCcuL0ltYWdlUHJvdmlkZXInKV0pXHJcbiAgICAuZmFjdG9yeSgnVHdvZGF5U2tpbicsIFsnJGh0dHAnLCAnJHEnLCByZXF1aXJlKCcuL1R3b2RheVNraW4nKV0pXHJcbiAgICAuZmFjdG9yeSgnUHJlZmVyZW5jZXMnLCBbJ0NhY2hlSXRlbScsICdUd29kYXlTa2luJywgJ3RvYXN0cicsIHJlcXVpcmUoJy4vUHJlZmVyZW5jZXMnKV0pXHJcbiAgICAuZmFjdG9yeSgnVXBkYXRlQ2hlY2snLCBbJyRodHRwJywgJyRxJywgJ1ByZWZlcmVuY2VzJywgJ3RvYXN0cicsIHJlcXVpcmUoJy4vVXBkYXRlQ2hlY2snKV0pOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLyoqXHJcbiAqIFByb3ZpZGVzIGEgc2V0IG9mIHV0aWxpdHkgZnVuY3Rpb25zXHJcbiAqXHJcbiAqL1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcblxyXG4vLy0gQ29udmVydHMgc2VsZWN0ZWQgRE9NIGxpbmtzIHRvIGFuIGFycmF5IG9mIGxpbmsgb2JqZWN0cyAoaHJlZix0ZXh0KVxyXG4gICAgbGlua3NUb09iamVjdHM6IGZ1bmN0aW9uKHNlbGVjdG9yKXtcclxuICAgICAgICB2YXIgbGlua09iamVjdHMgPSBbXTtcclxuICAgICAgICAgICAgJChzZWxlY3RvcikuZWFjaCggZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGxpbmtPYmplY3RzLnB1c2goeyBcImhyZWZcIjogdGhpcy5ocmVmLCBcInRleHRcIjogdGhpcy5pbm5lclRleHQgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBsaW5rT2JqZWN0cztcclxuICAgIH0sXHJcblxyXG4vLy0gRXh0cmFjdCBicmVhZGNydW1icy1saW5rcyBvdXQgb2YgVHdvZGF5J3MgbW9kVG9vbGJhck5hdmlnYXRpb25wYXRoLW1hY3JvIGFuZCByZXR1cm4gYXMgYW4gYXJyYXkgb2YgbGluayBvYmplY3RzXHJcbiAgICBnZXRCcmVhZGNydW1iczogZnVuY3Rpb24oKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5saW5rc1RvT2JqZWN0cyhcIiNicmVhZGNydW1ic01lbnUgPmE6bm90KFtpZF0pXCIpO1xyXG4gICAgfSxcclxuXHJcbi8vLSBHZXQgc3BlY2lhbCBtZW51IGl0ZW1zIChpbWFnZU1lbnUvYWJvTWVudSkgYXMgYW4gYXJyYXkgb2YgbGluayBvYmplY3RzXHJcbiAgICBnZXRTcGVjaWFsTWVudTogZnVuY3Rpb24obWVudUlEKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5saW5rc1RvT2JqZWN0cyhtZW51SUQrXCIgYVwiKTtcclxuICAgIH0sXHJcblxyXG4vLy0gUGltcCBzZXJ2ZXIgZ2VuZXJhdGVkIFR3b2RheSBjbGFzc2VzIHRvIGVuZm9yY2UgRm91bmRhdGlvbiBzdHlsZVxyXG4gICAgcGltcENsYXNzZXM6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgJChcIi5tZXNzYWdlIC5idXR0b25cIikuYWRkQ2xhc3MoXCJzZWNvbmRhcnkgdGlueSByYWRpdXNcIik7XHJcbiAgICB9LFxyXG5cclxuLy8tIFJvdGF0aW9uMTMgbWV0aG9kIHVzZWQgdG8gb2JmdXNjYXRlIGVtYWlsLWFkZHJlc3NcclxuICAgIHJvdDEzOiBmdW5jdGlvbihzKXtcclxuICAgICAgICByZXR1cm4gcy5yZXBsYWNlKC9bYS16QS1aXS9nLCBmdW5jdGlvbihjKXtcclxuICAgICAgICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoKGMgPD0gXCJaXCIgPyA5MCA6IDEyMikgPj0gKGMgPSBjLmNoYXJDb2RlQXQoMCkgKyAxMykgPyBjIDogYyAtIDI2KTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4vLy0gR2V0cyBtaW51dGVzIGZyb20gYSBnaXZlbiBkYXRlXHJcbiAgICBnZXRNaW51dGU6IGZ1bmN0aW9uKGRhdGUpe1xyXG4gICAgICAgIHJldHVybiBkYXRlLmdldEhvdXJzKCkqNjArZGF0ZS5nZXRNaW51dGVzKCk7XHJcbiAgICB9LFxyXG5cclxuLy8tIEFkZHMvU3VidHJhY3RzIG1pbnV0ZXMgZnJvbSBhIGdpdmVuIGRhdGUgKGFkZDogbWludXRlcz4wLCBzdWJ0cmFjdDogbWludXRlczwwKVxyXG4gICAgYWRkTWludXRlczogZnVuY3Rpb24oZGF0ZSwgbWludXRlcyl7XHJcbiAgICAgICAgdmFyIG5ld1RpbWUgPSB0aGlzLmdldE1pbnV0ZShkYXRlKSArIG1pbnV0ZXM7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKDE5NzAsMCwxLChuZXdUaW1lLzYwPj4wKSwobmV3VGltZSAlIDYwKSwwKTtcclxuICAgIH0sXHJcblxyXG4vLy0gRm9ybWF0cyB0aW1lIHN0cmluZyB0byBcImhoOm1tXCJcclxuICAgIGZvcm1hdFRpbWU6IGZ1bmN0aW9uKGRhdGUpe1xyXG4gICAgICAgIHJldHVybiAoXCIwXCIrZGF0ZS5nZXRIb3VycygpKS5zbGljZSgtMikrXCI6XCIrKFwiMFwiK2RhdGUuZ2V0TWludXRlcygpKS5zbGljZSgtMik7XHJcbiAgICB9LFxyXG5cclxuLy8tIENvbnZlcnRzIHN0cmluZy12ZXJzaW9uIChcIjEuMi4zXCIpIHRvIGEgY29tcGFyYWJsZSBpbnQgKDEyMylcclxuICAgIHBhcnNlVmVyc2lvbjogZnVuY3Rpb24odmVyc2lvbil7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHZlcnNpb24ucmVwbGFjZSgvXFwuL2csXCJcIiksIDEwKTtcclxuICAgIH0sXHJcblxyXG4vLy0gUGFyc2UgQ1JDMzIgdmFsdWUgZnJvbSB0aGUgc2tpbidzIHRvcCBsaW5lXHJcbiAgICBwYXJzZUNSQzogZnVuY3Rpb24oY2hhcnMpe1xyXG4gICAgICAgIHZhciBjcmMzMiA9IGNoYXJzLm1hdGNoKC9DUkMzMjouKC4qKVsgXS8pO1xyXG4gICAgICAgIHJldHVybiAoY3JjMzIgIT09IG51bGwgPyBwYXJzZUludChjcmMzMlsxXSwgMTApIDogLTEpO1xyXG4gICAgfSxcclxuXHJcbi8vLSBFeHRyYWN0IGhlYWRlciBkYXRhIGFuZCBza2luIGluZm9ybWF0aW9uIGZyb20gcmVsZWFzZWluZm8ueG1sXHJcbiAgICBnZXRSZWxlYXNlOiBmdW5jdGlvbigkZGF0YSl7XHJcbiAgICAgICAgdmFyIHJlbGVhc2UgPSB7XHJcbiAgICAgICAgICAgIHZlcnNpb246ICRkYXRhLmZpbmQoXCJ2ZXJzaW9uXCIpLnRleHQoKSxcclxuICAgICAgICAgICAgYXV0aG9yOiAkZGF0YS5maW5kKFwiYXV0aG9yXCIpLnRleHQoKSxcclxuICAgICAgICAgICAgcmVsZWFzZWRhdGU6IG5ldyBEYXRlKERhdGUucGFyc2UoJGRhdGEuZmluZChcInJlbGVhc2VkYXRlXCIpLnRleHQoKSkpLFxyXG4gICAgICAgICAgICBza2luczogW11cclxuICAgICAgICB9O1xyXG4gICAgICAgICRkYXRhLmZpbmQoXCJza2luXCIpLmVhY2goIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHZhciBzZWxmID0gJCh0aGlzKSxcclxuICAgICAgICAgICAgICAgIHNraW5OYW1lID0gc2VsZi5hdHRyKFwia2V5XCIpLFxyXG4gICAgICAgICAgICAgICAgZGF0ZVNvdXJjZVdhc1VwZGF0ZWQgPSBuZXcgRGF0ZShEYXRlLnBhcnNlKHNlbGYuYXR0cihcImxhc3R1cGRhdGVcIikpKSxcclxuICAgICAgICAgICAgICAgIHNraW5DUkMgPSBzZWxmLmF0dHIoXCJjcmNcIiksXHJcbiAgICAgICAgICAgICAgICBza2luQ29udGVudCA9IHNlbGYuZmluZChcImNvbnRlbnRcIikudGV4dCgpO1xyXG4gICAgICAgICAgICByZWxlYXNlLnNraW5zLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgbmFtZTogc2tpbk5hbWUsXHJcbiAgICAgICAgICAgICAgICB1cGRhdGU6IGRhdGVTb3VyY2VXYXNVcGRhdGVkLFxyXG4gICAgICAgICAgICAgICAgY3JjMzI6IHNraW5DUkMsXHJcbiAgICAgICAgICAgICAgICBjb250ZW50OiAkLnRyaW0oc2tpbkNvbnRlbnQpLFxyXG4gICAgICAgICAgICAgICAgc3RhdHVzOiBcInVuY2hlY2tlZFwiXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiByZWxlYXNlO1xyXG4gICAgfVxyXG5cclxufTsiXX0=
