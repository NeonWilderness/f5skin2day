'use strict';

/**
 * Browserify all controllers
 *
 */

require('angular')
    .module('f5SkinApp')
    .controller('F5MainCtrl', ['$scope', '$rootScope', 'Preferences', 'UpdateCheck', '$window', '$interval', '$modal', require('./F5MainCtrl')])
    .controller('CustomizeCtrl', ['$rootScope', '$modalInstance', require('./CustomizeCtrl')])
    .controller('CustCoreDataCtrl', ['$rootScope', 'ImageProvider', 'toastr', require('./CustCoreDataCtrl')])
    .controller('CustBackgroundsCtrl', ['$rootScope', 'ImageProvider', '$window', 'toastr', require('./CustBackgroundsCtrl')])
    .controller('CustAppUpdateCtrl', ['$rootScope', '$filter', '$q', 'UpdateCheck', 'TwodaySkin', 'toastr', require('./CustAppUpdateCtrl')])
    .controller('MenuBasicOptionsCtrl', ['$rootScope', require('./MenuBasicOptionsCtrl')])
    .controller('MenuStandardItemsCtrl', ['$rootScope', require('./MenuStandardItemsCtrl')])
    .controller('MenuCustomItemsCtrl', ['$rootScope', require('./MenuCustomItemsCtrl')]);