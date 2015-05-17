'use strict';

/**
 * Browserify all directives
 *
 */

require('angular')
    .module('f5SkinApp')
    .directive('resizable', ['$window', require('./resizable')]);