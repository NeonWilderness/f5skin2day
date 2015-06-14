'use strict';

module.exports = function ($rootScope, UserStyles, $modalInstance){

    var vm = this;

    vm.param = $rootScope.param;

    vm.changeInProp = function(fieldID, value){
        UserStyles.pushDependency( fieldID, value );
    };

    vm.ok = function(){ $modalInstance.close(); };

    vm.cancel = function(){ $modalInstance.dismiss(); };

};
