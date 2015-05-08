'use strict';

/**
 * Browserify all controllers
 *
 */

require('angular')
    .module('f5SkinApp')
    .controller('F5SkinCtrl', ['$scope', 'Preferences', 'UpdateCheck', '$modal', require('./F5SkinCtrl')])
    .controller('CustomizeBlogCtrl', ['$scope', '$modalInstance', require('./CustomizeBlogCtrl')])
    .controller('TmplGrunddatenCtrl', ['$scope', 'Preferences', require('./TmplGrunddatenCtrl')])
    .controller('TmplHintergrundbilderCtrl', ['$scope', 'Preferences', require('./TmplHintergrundbilderCtrl')])
    .controller('TmplAktualisierungCtrl', ['$scope', '$filter', '$q', 'Preferences', 'UpdateCheck', 'TwodaySkin', 'toastr', require('./TmplAktualisierungCtrl')]);