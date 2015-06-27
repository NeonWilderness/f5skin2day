'use strict';

/**
 * Browserify all directives
 *
 */

require('angular')
    .module('f5SkinApp')
    .directive('convertcss', [require('./convertcss')])
    .directive('encode', [require('./encode')])
    .directive('resizable', ['$window', require('./resizable')]);