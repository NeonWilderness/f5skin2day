'use strict';

/**
 * Browserify all services
 *
 */

require('angular')
    .module('f5SkinApp')
    .factory('CacheItem', ['$cacheFactory', require('./CacheItem')])
    .factory('TwodaySkin', ['$http', '$q', require('./TwodaySkin')])
    .factory('Preferences', ['CacheItem', 'TwodaySkin', 'toastr', require('./Preferences')])
    .factory('UpdateCheck', ['$http', '$q', 'Preferences', 'toastr', require('./UpdateCheck')]);