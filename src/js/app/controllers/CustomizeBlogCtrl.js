'use strict';

module.exports = function ($scope, $modalInstance, param){

    $scope.param = param;

    $scope.ok = function(){
        $modalInstance.close("Pressed OK!");
    };

    $scope.cancel = function(){
        $modalInstance.dismiss("Pressed Cancel!");
    };

};
