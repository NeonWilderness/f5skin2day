'use strict';
require('jquery');

module.exports = function($scope, Preferences){

    $scope.input = Preferences.get("consolidated");

    $scope.setStaticFolder = function(){
        $scope.input.site.imgFolder = $scope.input.staticUrl + $scope.input.userName + "/images/";
    };

    $scope.testLoader = function(){
        $("#loader-wrapper").show(0).delay(3000).hide(0);
    };

};
