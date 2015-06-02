'use strict';

module.exports = function($rootScope){

    var vm = this;

    vm.param = $rootScope.param;

    vm.getMenuIcon = function(item){
        var faIcon = $.trim(vm.param.topbar.menuItems[item].icon.replace(/fa-margin/gi,''));
        return (faIcon.length>0 ? 'fa '+faIcon : '');
    }

};