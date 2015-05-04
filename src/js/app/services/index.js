'use strict';

/**
 * Browserify all services
 *
 */

require('angular')
    .module('f5SkinApp')
    .factory('CacheItem', ['$cacheFactory', require('./CacheItem')])
    .factory('Preferences', ['CacheItem', require('./Preferences')])
    .factory('UpdateCheck', ['$http', '$q', 'toastr', require('./UpdateCheck')]);