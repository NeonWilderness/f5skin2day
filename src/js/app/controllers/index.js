'use strict';

/**
 * Browserify all controllers
 *
 */

require('angular')
    .module('f5SkinApp')
    .controller('F5MainCtrl', ['$scope', '$rootScope', 'Preferences', 'UpdateCheck', 'UserStyles', '$window', '$interval', '$modal', require('./F5MainCtrl')])
    .controller('CustomizeCtrl', ['$rootScope', 'UserStyles', '$modalInstance', require('./CustomizeCtrl')])
    .controller('CustCoreDataCtrl', ['$scope', '$rootScope', 'ImageProvider', 'UserStyles', 'toastr', require('./CustCoreDataCtrl')])
    .controller('CustBackgroundsCtrl', ['$rootScope', 'ImageProvider', '$window', 'toastr', require('./CustBackgroundsCtrl')])
    .controller('CustTypographyCtrl', ['$scope', '$rootScope', 'toastr', require('./CustTypographyCtrl')])
    .controller('CustAppUpdateCtrl', ['$rootScope', '$filter', '$q', 'UpdateCheck', 'TwodaySkin', 'toastr', require('./CustAppUpdateCtrl')])
    .controller('MenuBasicOptionsCtrl', ['$scope', '$rootScope', 'UserStyles', require('./MenuBasicOptionsCtrl')])
    .controller('MenuStandardItemsCtrl', ['$rootScope', require('./MenuStandardItemsCtrl')])
    .controller('MenuCustomItemsCtrl', ['$rootScope', require('./MenuCustomItemsCtrl')])
    .controller('MenuSpecialItemsCtrl', ['$scope', '$rootScope', 'UserStyles', require('./MenuSpecialItemsCtrl')]);