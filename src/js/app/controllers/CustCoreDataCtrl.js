'use strict';

module.exports = function($rootScope){

    var vm = this;
    
    vm.param = $rootScope.param;

    vm.setStaticFolder = function(){
        vm.param.site.imgFolder = vm.param.staticUrl + vm.param.userName + "/images/";
    };

    vm.testLoader = function(){
        $("#loader-wrapper").show(0).delay(3000).hide(0);
    };

};
