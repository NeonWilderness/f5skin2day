'use strict';

module.exports = function($scope, $rootScope, UserStyles){

    var vm = this;

    vm.param = $rootScope.param;

    $scope.$watch('param.topbar.menuBackgroundColor', function(){
        console.log('$watch menuBackgroundColor', vm.param.topbar.menuBackgroundColor);
        UserStyles.pushDependency('menuBackgroundColor', vm.param.topbar.menuBackgroundColor);
    });

    $scope.$watch('param.topbar.menuIconColor', function(){
        console.log('$watch menuIconColor', vm.param.topbar.menuIconColor);
        UserStyles.pushDependency('menuIconColor', vm.param.topbar.menuIconColor);
    });

};
