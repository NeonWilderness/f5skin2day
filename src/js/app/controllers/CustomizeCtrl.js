'use strict';

module.exports = function ($rootScope, $modalInstance){

    var vm = this;

    vm.param = $rootScope.param;

    vm.ok = function(){ $modalInstance.close(); };

    vm.cancel = function(){ $modalInstance.dismiss(); };

};
